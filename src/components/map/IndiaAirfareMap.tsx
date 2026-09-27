import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import L from 'leaflet';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { AIRPORTS, AIRPORT_LIST } from '../../constants/airports';
import { ROUTES } from '../../constants/routes';
import { Airport, RouteIndexSummary } from '../../types';
import { 
  ArrowRight, 
  X, 
  ChevronRight, 
  Layers, 
  RefreshCw, 
  Maximize2,
  Radio,
  Sparkles,
  Flame,
  Grid
} from 'lucide-react';
import { computeFlightArcPoints, fetchLiveMapGeoData, MapApiResponse } from '../../services/mapApiService';

// Safeguard Leaflet against undefined DOM elements and detached panes during rapid unmount / zoom transitions in React
if (typeof window !== 'undefined' && L) {
  if (L.DomUtil) {
    const originalGetPosition = L.DomUtil.getPosition;
    L.DomUtil.getPosition = function (el: any): L.Point {
      if (!el || typeof el !== 'object') {
        return new L.Point(0, 0);
      }
      try {
        return originalGetPosition.call(L.DomUtil, el) || new L.Point(0, 0);
      } catch {
        return new L.Point(0, 0);
      }
    };

    const originalSetPosition = L.DomUtil.setPosition;
    L.DomUtil.setPosition = function (el: any, point: L.Point): void {
      if (!el || typeof el !== 'object') {
        return;
      }
      try {
        originalSetPosition.call(L.DomUtil, el, point);
      } catch {
        // Suppress detached DOM element exceptions
      }
    };
  }

  if (L.Map && L.Map.prototype) {
    const originalGetMapPanePos = (L.Map.prototype as any)._getMapPanePos;
    (L.Map.prototype as any)._getMapPanePos = function () {
      if (!this._mapPane) {
        return new L.Point(0, 0);
      }
      try {
        return originalGetMapPanePos.call(this) || new L.Point(0, 0);
      } catch {
        return new L.Point(0, 0);
      }
    };
  }
}

export type MapMetric = 'index' | 'movement' | 'activity' | 'coverage';
export type TileStyle = 'adaptive' | 'carto' | 'osm' | 'satellite';
export type ClusterMode = 'auto' | 'clustered' | 'individual';

interface AirportCluster {
  id: string;
  name: string;
  nameHi: string;
  airports: Airport[];
  lat: number;
  lng: number;
  bounds: L.LatLngBounds;
  avgIndex: number;
  avgFare: number;
  totalRoutes: number;
  dominantTier: 1 | 2;
}

interface IndiaAirfareMapProps {
  heightClass?: string;
  showInlineFilters?: boolean;
}

export const IndiaAirfareMap: React.FC<IndiaAirfareMapProps> = ({
  heightClass = 'h-[500px] lg:h-[620px]',
  showInlineFilters = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<L.LayerGroup | null>(null);
  const densityGroupRef = useRef<L.LayerGroup | null>(null);
  const currentTileLayerRef = useRef<L.TileLayer | null>(null);

  const { theme } = useTheme();
  const { t, language } = useLanguage();
  const { indexResults, navigateToRoute } = useData();
  const { addToast } = useToast();

  // Map Controls State
  const [selectedMetric, setSelectedMetric] = useState<MapMetric>('index');
  const [tileStyle, setTileStyle] = useState<TileStyle>('adaptive');
  const [clusterMode, setClusterMode] = useState<ClusterMode>('auto');
  const [showDensityOverlay, setShowDensityOverlay] = useState<boolean>(true);
  const [currentZoom, setCurrentZoom] = useState<number>(5);

  const [filterOrigin, setFilterOrigin] = useState<string>('ALL');
  const [filterDestination, setFilterDestination] = useState<string>('ALL');

  // API State
  const [isSyncingApi, setIsSyncingApi] = useState(false);
  const [apiTelemetry, setApiTelemetry] = useState<MapApiResponse | null>(null);

  // Selection states for detail drawer
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<AirportCluster | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<RouteIndexSummary | null>(null);

  // Initial India Geographic Bounding Box
  const indiaBounds = useMemo<L.LatLngBoundsExpression>(() => [
    [8.0, 68.0],   // Southwest corner (Kanyakumari / Arabian Sea)
    [35.8, 97.4],  // Northeast corner (Ladakh / Arunachal Pradesh)
  ], []);

  // Recenter map function
  const handleRecenter = useCallback(() => {
    if (mapInstanceRef.current && (mapInstanceRef.current as any)._mapPane) {
      mapInstanceRef.current.fitBounds(indiaBounds, { padding: [20, 20], maxZoom: 6 });
      setTimeout(() => {
        if (mapInstanceRef.current && (mapInstanceRef.current as any)._mapPane) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 300);
    }
  }, [indiaBounds]);

  // Sync with live GeoJSON API
  const handleSyncApi = useCallback(async () => {
    setIsSyncingApi(true);
    try {
      const res = await fetchLiveMapGeoData(indexResults.routeSummaries);
      setApiTelemetry(res);
      addToast(
        language === 'hi' ? 'मानचित्र API डेटा सिंक पूर्ण' : 'GeoJSON Map API Synced',
        language === 'hi'
          ? `42 हवाई मार्ग और 13 एयरपोर्ट हब सिंक किए गए (${res.latencyMs}ms)`
          : `Fetched ${res.routesGeoJson.features.length} vector routes & ${res.airportsGeoJson.features.length} hubs via ${res.endpoint}`,
        'success',
        3500
      );
    } catch {
      addToast('Map API Sync Failed', 'Unable to reach MoSPI GeoJSON microservice', 'error', 3000);
    } finally {
      setIsSyncingApi(false);
    }
  }, [indexResults.routeSummaries, addToast, language]);

  // Build Regional Airport Clusters for density clustering
  const clusters = useMemo<AirportCluster[]>(() => {
    const clusterDefinitions = [
      {
        id: 'north',
        name: 'Northern Aviation Corridor',
        nameHi: 'उत्तरी विमानन क्लस्टर (NCR / UP / राज.)',
        codes: ['DEL', 'JAI', 'LKO'],
      },
      {
        id: 'west',
        name: 'Western Commercial Corridor',
        nameHi: 'पश्चिमी वाणिज्यिक क्लस्टर (मुंबई / गुजरात / गोवा)',
        codes: ['BOM', 'PNQ', 'AMD', 'GOI'],
      },
      {
        id: 'south',
        name: 'Southern Tech & Coastal Corridor',
        nameHi: 'दक्षिणी तकनीकी एवं तटीय क्लस्टर (बेंगलुरु / हैदराबाद / चेन्नई / कोच्चि)',
        codes: ['BLR', 'HYD', 'MAA', 'COK'],
      },
      {
        id: 'east',
        name: 'Eastern & North-East Gateway',
        nameHi: 'पूर्वी एवं उत्तर-पूर्वी क्लस्टर (कोलकाता / गुवाहाटी)',
        codes: ['CCU', 'GAU'],
      },
    ];

    return clusterDefinitions.map(def => {
      const clusterAirports = def.codes.map(code => AIRPORTS[code]).filter(Boolean) as Airport[];
      const latSum = clusterAirports.reduce((acc, a) => acc + a.lat, 0);
      const lngSum = clusterAirports.reduce((acc, a) => acc + a.lng, 0);
      const lat = latSum / clusterAirports.length;
      const lng = lngSum / clusterAirports.length;

      const lats = clusterAirports.map(a => a.lat);
      const lngs = clusterAirports.map(a => a.lng);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      const bounds = L.latLngBounds([minLat - 0.5, minLng - 0.5], [maxLat + 0.5, maxLng + 0.5]);

      // Calculate aggregate airfare stats for this cluster
      const relatedRoutes = indexResults.routeSummaries.filter(
        r => def.codes.includes(r.origin) || def.codes.includes(r.destination)
      );

      const avgIndex = relatedRoutes.length > 0
        ? Number((relatedRoutes.reduce((acc, r) => acc + r.currentIndex, 0) / relatedRoutes.length).toFixed(1))
        : 122.0;

      const avgFare = relatedRoutes.length > 0
        ? Math.round(relatedRoutes.reduce((acc, r) => acc + r.currentAvgFare, 0) / relatedRoutes.length)
        : 4950;

      return {
        id: def.id,
        name: def.name,
        nameHi: def.nameHi,
        airports: clusterAirports,
        lat,
        lng,
        bounds,
        avgIndex,
        avgFare,
        totalRoutes: relatedRoutes.length,
        dominantTier: clusterAirports.some(a => a.tier === 1) ? 1 : 2,
      };
    });
  }, [indexResults.routeSummaries]);

  // Determine whether markers should be clustered based on current zoom and user preference
  const isClusteringActive = useMemo(() => {
    if (clusterMode === 'clustered') return true;
    if (clusterMode === 'individual') return false;
    // Auto: cluster at nationwide zoom levels (zoom <= 5)
    return currentZoom <= 5;
  }, [clusterMode, currentZoom]);

  // Initialize Leaflet Map
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    let mountTimer: ReturnType<typeof setTimeout> | null = null;

    if (!mapInstanceRef.current) {
      if ((container as any)._leaflet_id) {
        delete (container as any)._leaflet_id;
      }

      const map = L.map(container, {
        center: [22.8, 79.8],
        zoom: 5,
        minZoom: 4,
        maxZoom: 12,
        zoomControl: false,
        attributionControl: false,
      });

      // Fit India accurately
      map.fitBounds(indiaBounds, { padding: [20, 20] });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      L.control.attribution({
        position: 'bottomleft',
        prefix: '<span class="text-[10px] text-slate-400">© OpenStreetMap · CartoDB · AeroNex6 Density Engine</span>',
      }).addTo(map);

      // Track zoom level changes for dynamic clustering
      map.on('zoomend', () => {
        if ((map as any)._mapPane) {
          setCurrentZoom(map.getZoom());
        }
      });

      mapInstanceRef.current = map;
      densityGroupRef.current = L.layerGroup().addTo(map);
      layersGroupRef.current = L.layerGroup().addTo(map);

      // Force size invalidation right after mount safely
      mountTimer = setTimeout(() => {
        if (mapInstanceRef.current && (mapInstanceRef.current as any)._mapPane) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 250);
    }

    return () => {
      if (mountTimer) {
        clearTimeout(mountTimer);
      }
      if (mapInstanceRef.current) {
        const map = mapInstanceRef.current;
        try {
          map.stop();
          layersGroupRef.current?.clearLayers();
          densityGroupRef.current?.clearLayers();
          currentTileLayerRef.current?.remove();
          map.remove();
        } catch {
          // Ignore cleanup errors during unmount
        }
        mapInstanceRef.current = null;
        layersGroupRef.current = null;
        densityGroupRef.current = null;
        currentTileLayerRef.current = null;
      }
    };
  }, [indiaBounds]);

  // Update Tile Layer and Apply Custom Theme-Adaptive Base Layer Styles
  useEffect(() => {
    const map = mapInstanceRef.current;
    const container = mapContainerRef.current;
    if (!map || !(map as any)._mapPane || !container) return;

    if (currentTileLayerRef.current) {
      try {
        map.removeLayer(currentTileLayerRef.current);
      } catch {
        // Ignore
      }
    }

    // Reset custom styling classes
    container.classList.remove(
      'leaflet-basemap-custom-dark',
      'leaflet-basemap-custom-light',
      'leaflet-basemap-carto-dark',
      'leaflet-basemap-carto-light'
    );

    let tileUrl = '';
    let maxZoom = 19;
    let subdomains: string | string[] = 'abc';

    if (tileStyle === 'osm') {
      tileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
      subdomains = 'abc';
    } else if (tileStyle === 'satellite') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      maxZoom = 18;
      subdomains = '';
    } else if (tileStyle === 'carto') {
      // Clean Carto-style basemap: neutral desaturated light or sleek dark without "API KEY REQUIRED" watermark
      tileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
      subdomains = 'abc';
      if (theme === 'dark') {
        container.classList.add('leaflet-basemap-carto-dark');
      } else {
        container.classList.add('leaflet-basemap-carto-light');
      }
    } else {
      // 'adaptive' - Custom Theme-Adaptive Base Layer (Clean & Watermark-Free)
      tileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
      subdomains = 'abc';
      if (theme === 'dark') {
        container.classList.add('leaflet-basemap-custom-dark');
      } else {
        container.classList.add('leaflet-basemap-custom-light');
      }
    }

    const tileLayer = L.tileLayer(tileUrl, {
      subdomains,
      maxZoom,
    });

    if (tileStyle === 'carto') {
      tileLayer.on('tileerror', () => {
        // If a tile fails to load, gracefully switch active map style to OSM for continuous visibility
        setTileStyle('osm');
      });
    }

    tileLayer.addTo(map);
    currentTileLayerRef.current = tileLayer;
  }, [theme, tileStyle]);

  // Trigger initial API load
  useEffect(() => {
    fetchLiveMapGeoData(indexResults.routeSummaries).then(res => {
      setApiTelemetry(res);
    });
  }, [indexResults.routeSummaries]);

  // Handle Resize smoothly
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapInstanceRef.current && (mapInstanceRef.current as any)._mapPane) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [selectedAirport, selectedRoute, selectedCluster]);

  // Helper to get color for route depending on metric
  const getRouteColor = (routeSum: RouteIndexSummary) => {
    if (selectedMetric === 'index') {
      if (routeSum.currentIndex >= 135) return '#ef4444'; // red (high index surge)
      if (routeSum.currentIndex >= 125) return '#f59e0b'; // amber
      if (routeSum.currentIndex >= 115) return '#0ea5e9'; // sky
      return '#10b981'; // green (low/stable)
    }
    if (selectedMetric === 'movement') {
      if (routeSum.change24h > 3.0) return '#ef4444';
      if (routeSum.change24h > 0) return '#f59e0b';
      return '#10b981';
    }
    if (selectedMetric === 'activity') {
      if (routeSum.weight >= 6.0) return '#6366f1';
      if (routeSum.weight >= 2.5) return '#0284c7';
      return '#94a3b8';
    }
    // Coverage
    return routeSum.recordCount > 80 ? '#10b981' : '#f59e0b';
  };

  // Render Airfare Data Density Heat Zones (Corridors)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const densityGroup = densityGroupRef.current;
    if (!map || !(map as any)._mapPane || !densityGroup) return;

    try {
      densityGroup.clearLayers();
    } catch {
      return;
    }

    if (!showDensityOverlay) return;

    // High observation density airfare corridors across Indian airspace
    const densityCorridors = [
      { name: 'Delhi-NCR Aviation Axis', lat: 28.55, lng: 77.10, radius: 140000, weight: 12, color: '#38bdf8' },
      { name: 'Mumbai-Pune High Volume Corridor', lat: 18.85, lng: 73.40, radius: 150000, weight: 14, color: '#f59e0b' },
      { name: 'Bengaluru-Hyderabad Tech Corridor', lat: 15.20, lng: 78.10, radius: 180000, weight: 10, color: '#10b981' },
      { name: 'Kolkata-Guwahati Eastern Corridor', lat: 24.35, lng: 90.00, radius: 160000, weight: 8, color: '#818cf8' },
      { name: 'Chennai-Kochi Peninsular Corridor', lat: 11.50, lng: 78.20, radius: 160000, weight: 9, color: '#06b6d4' },
    ];

    densityCorridors.forEach(zone => {
      const circle = L.circle([zone.lat, zone.lng], {
        radius: zone.radius,
        color: zone.color,
        fillColor: zone.color,
        fillOpacity: theme === 'dark' ? 0.16 : 0.11,
        weight: 1,
        dashArray: '3, 6',
      });

      circle.bindTooltip(
        `<div class="p-1 text-xs">
          <strong>${zone.name}</strong><br/>
          <span class="text-[10px] text-slate-500">Airfare Observation Density: High (${zone.weight}% National Traffic)</span>
        </div>`,
        { sticky: true }
      );

      circle.addTo(densityGroup);
    });
  }, [showDensityOverlay, theme]);

  // Render Routes (Curved Great-Circle Arcs) and Clustered / Individual Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layersGroupRef.current;
    if (!map || !(map as any)._mapPane || !layerGroup) return;

    try {
      layerGroup.clearLayers();
    } catch {
      return;
    }

    // 1. Draw Flight Routes with Smooth Curved Trajectories
    indexResults.routeSummaries.forEach(routeSum => {
      const originAirport = AIRPORTS[routeSum.origin];
      const destAirport = AIRPORTS[routeSum.destination];
      if (!originAirport || !destAirport) return;

      // Filter check
      if (filterOrigin !== 'ALL' && routeSum.origin !== filterOrigin) return;
      if (filterDestination !== 'ALL' && routeSum.destination !== filterDestination) return;

      // Generate curved flight arc points
      const arcPoints = computeFlightArcPoints(
        originAirport.lat,
        originAirport.lng,
        destAirport.lat,
        destAirport.lng,
        10
      );

      const color = getRouteColor(routeSum);
      const isSelected = selectedRoute?.route === routeSum.route;
      const weight = isSelected ? 4.5 : (routeSum.weight > 5 ? 2.5 : 1.6);
      const opacity = isSelected ? 1.0 : (selectedRoute ? 0.25 : 0.75);

      const polyline = L.polyline(arcPoints, {
        color,
        weight,
        opacity,
        dashArray: isSelected ? '4, 4' : undefined,
      });

      polyline.bindTooltip(
        `<div class="p-1.5 text-xs font-sans">
          <div class="font-bold text-sky-600 dark:text-sky-400 font-mono">${routeSum.route}</div>
          <div class="text-[11px] text-slate-700 dark:text-slate-200">
            Index: <strong>${routeSum.currentIndex}</strong> (${routeSum.change24h >= 0 ? '+' : ''}${routeSum.change24h}%)
          </div>
          <div class="text-[11px] text-slate-500">
            Avg Total: ₹${routeSum.currentAvgFare.toLocaleString()} · ${routeSum.distanceKm} km
          </div>
        </div>`,
        { sticky: true }
      );

      polyline.on('click', () => {
        setSelectedRoute(routeSum);
        setSelectedAirport(null);
        setSelectedCluster(null);
      });

      polyline.addTo(layerGroup);
    });

    // 2. Render Markers: Either Clustered Regional Hubs or Individual Airport Beacons
    if (isClusteringActive) {
      // CLUSTERED MODE
      clusters.forEach(cluster => {
        const isClusterSelected = selectedCluster?.id === cluster.id;
        const count = cluster.airports.length;

        // Cluster status color based on average airfare index
        let clusterColor = '#0ea5e9'; // sky
        let clusterBg = 'bg-sky-600';
        if (cluster.avgIndex >= 135) {
          clusterColor = '#ef4444';
          clusterBg = 'bg-rose-600';
        } else if (cluster.avgIndex >= 125) {
          clusterColor = '#f59e0b';
          clusterBg = 'bg-amber-600';
        } else if (cluster.avgIndex < 115) {
          clusterColor = '#10b981';
          clusterBg = 'bg-emerald-600';
        }

        const clusterHtml = `
          <div class="relative flex items-center justify-center cursor-pointer group" style="transform: translate(-50%, -50%);">
            <!-- Outer Pulsating Density Ring -->
            <span class="absolute w-12 h-12 rounded-full cluster-halo-pulse" style="background-color: ${clusterColor}35;"></span>
            
            <!-- Mid Ring -->
            <span class="absolute w-9 h-9 rounded-full ${isClusterSelected ? 'ring-2 ring-white scale-110' : ''}" style="background-color: ${clusterColor}55;"></span>
            
            <!-- Core Cluster Badge -->
            <div class="relative w-8 h-8 rounded-full ${clusterBg} text-white flex flex-col items-center justify-center shadow-lg border-2 border-white dark:border-slate-900 transition-transform group-hover:scale-110">
              <span class="text-[11px] font-bold font-mono leading-none">${count}</span>
              <span class="text-[7px] uppercase font-sans tracking-tighter opacity-90">HUBS</span>
            </div>

            <!-- Mini Cluster Label Pill -->
            <div class="absolute -bottom-5 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold whitespace-nowrap shadow-xs ${
              theme === 'dark' ? 'bg-slate-900/90 text-slate-200 border border-slate-700' : 'bg-white/95 text-slate-800 border border-slate-200'
            }">
              Idx ${cluster.avgIndex}
            </div>
          </div>
        `;

        const clusterIcon = L.divIcon({
          className: 'custom-cluster-icon',
          html: clusterHtml,
          iconSize: [48, 48],
          iconAnchor: [24, 24],
        });

        const marker = L.marker([cluster.lat, cluster.lng], { icon: clusterIcon });

        marker.bindTooltip(
          `<div class="p-1.5 text-xs font-sans">
            <div class="font-bold text-slate-900 dark:text-slate-100">${language === 'hi' ? cluster.nameHi : cluster.name}</div>
            <div class="text-[11px] text-slate-600 dark:text-slate-300">
              Airports: <strong>${cluster.airports.map(a => a.code).join(', ')}</strong>
            </div>
            <div class="text-[11px] text-sky-600 font-mono">
              Cluster Avg Index: <strong>${cluster.avgIndex}</strong> · Avg Fare: ₹${cluster.avgFare.toLocaleString()}
            </div>
            <div class="text-[10px] text-slate-400 mt-1">
              Click to zoom in and expand individual hubs
            </div>
          </div>`,
          { direction: 'top', offset: [0, -14] }
        );

        marker.on('click', () => {
          setSelectedCluster(cluster);
          setSelectedAirport(null);
          setSelectedRoute(null);
          // Zoom into cluster bounds smoothly to show individual airports
          if (map && (map as any)._mapPane) {
            map.fitBounds(cluster.bounds, { padding: [40, 40], maxZoom: 7 });
          }
          addToast(
            'Aviation Cluster Zoomed',
            `Expanded ${cluster.airports.length} hubs in ${cluster.name}`,
            'info',
            2000
          );
        });

        marker.addTo(layerGroup);
      });
    } else {
      // INDIVIDUAL AIRPORT NODES
      AIRPORT_LIST.forEach(airport => {
        const isTier1 = airport.tier === 1;
        const isSelected = selectedAirport?.code === airport.code;

        const markerHtml = `
          <div class="flex items-center group cursor-pointer" style="transform: translate(-50%, -50%);">
            <div class="relative flex items-center justify-center">
              <span class="absolute w-5 h-5 rounded-full ${isTier1 ? 'bg-sky-400/40 animate-ping' : 'bg-slate-400/30'}"></span>
              <span class="relative w-3.5 h-3.5 rounded-full ${isSelected ? 'bg-amber-400 ring-2 ring-white shadow-md' : (isTier1 ? 'bg-sky-600' : 'bg-slate-600')} border border-white"></span>
            </div>
            <span class="ml-1 px-1 py-0.2 rounded text-[10px] font-mono font-bold ${
              theme === 'dark' ? 'bg-slate-900/90 text-slate-100 border border-slate-700' : 'bg-white/95 text-slate-900 border border-slate-200'
            } shadow-xs select-none">
              ${airport.code}
            </span>
          </div>
        `;

        const customIcon = L.divIcon({
          className: 'custom-airport-div-icon',
          html: markerHtml,
          iconSize: [40, 20],
          iconAnchor: [7, 10],
        });

        const marker = L.marker([airport.lat, airport.lng], { icon: customIcon });

        marker.bindTooltip(
          `<div class="p-1.5 text-xs font-sans">
            <div class="font-bold text-slate-900 dark:text-slate-100">${airport.code} — ${language === 'hi' ? airport.cityHi : airport.city}</div>
            <div class="text-[11px] text-slate-500">${airport.name}</div>
            <div class="text-[10px] text-sky-600 font-mono font-semibold">Tier ${airport.tier} Civil Hub</div>
          </div>`,
          { direction: 'top', offset: [0, -10] }
        );

        marker.on('click', () => {
          setSelectedAirport(airport);
          setSelectedCluster(null);
          setSelectedRoute(null);
        });

        marker.addTo(layerGroup);
      });
    }
  }, [
    indexResults.routeSummaries,
    selectedMetric,
    filterOrigin,
    filterDestination,
    selectedAirport,
    selectedCluster,
    selectedRoute,
    theme,
    language,
    isClusteringActive,
    clusters,
    addToast,
  ]);

  // Compute Airport statistics when selected
  const airportDetails = useMemo(() => {
    if (!selectedAirport) return null;
    const connectedRoutes = indexResults.routeSummaries.filter(
      r => r.origin === selectedAirport.code || r.destination === selectedAirport.code
    );
    const avgFare = connectedRoutes.length > 0
      ? Math.round(connectedRoutes.reduce((acc, r) => acc + r.currentAvgFare, 0) / connectedRoutes.length)
      : 4800;
    const avgIndex = connectedRoutes.length > 0
      ? Number((connectedRoutes.reduce((acc, r) => acc + r.currentIndex, 0) / connectedRoutes.length).toFixed(1))
      : 120.0;

    return {
      airport: selectedAirport,
      connectedRoutes,
      avgFare,
      avgIndex,
    };
  }, [selectedAirport, indexResults.routeSummaries]);

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col">
      
      {/* Top Filter & Metric Selector Bar */}
      {showInlineFilters && (
        <div className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90 flex flex-wrap items-center justify-between gap-3 text-xs">
          
          {/* Metric Selector Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-200/70 dark:bg-slate-800 rounded-lg">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 px-2 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.network.mapMetric}:</span>
            </span>
            <button
              onClick={() => { setSelectedMetric('index'); addToast('Map Metric', 'Displaying Sector Airfare Index', 'info', 2000); }}
              className={`px-2.5 py-1 font-medium rounded-md transition-colors whitespace-nowrap ${
                selectedMetric === 'index'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {t.network.metrics.index}
            </button>
            <button
              onClick={() => { setSelectedMetric('movement'); addToast('Map Metric', 'Displaying 24h Price Movement', 'info', 2000); }}
              className={`px-2.5 py-1 font-medium rounded-md transition-colors whitespace-nowrap ${
                selectedMetric === 'movement'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {t.network.metrics.movement}
            </button>
            <button
              onClick={() => { setSelectedMetric('activity'); addToast('Map Metric', 'Displaying DGCA Basket Weights', 'info', 2000); }}
              className={`px-2.5 py-1 font-medium rounded-md transition-colors whitespace-nowrap hidden md:inline-block ${
                selectedMetric === 'activity'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {t.network.metrics.activity}
            </button>
            <button
              onClick={() => { setSelectedMetric('coverage'); addToast('Map Metric', 'Displaying Observation Density', 'info', 2000); }}
              className={`px-2.5 py-1 font-medium rounded-md transition-colors whitespace-nowrap hidden lg:inline-block ${
                selectedMetric === 'coverage'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {t.network.metrics.coverage}
            </button>
          </div>

          {/* Map Controls: Dynamic Theme Base Layer, Clustering Mode, Density Toggle & Recenter */}
          <div className="flex items-center flex-wrap gap-2">
            
            {/* Dynamic Theme-Adaptive Base Layer Selector */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => { setTileStyle('adaptive'); addToast('Base Layer', `Adaptive Theme Style (${theme === 'dark' ? 'Midnight Aviation' : 'MoSPI High-Contrast'})`, 'info', 2000); }}
                className={`px-2 py-0.5 text-[11px] rounded flex items-center gap-1 ${tileStyle === 'adaptive' ? 'bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 font-semibold' : 'text-slate-500'}`}
                title="Dynamic Theme Adaptive (Custom Styled Basemap)"
              >
                <Sparkles className="w-3 h-3 text-sky-500" />
                <span>Adaptive</span>
              </button>
              <button
                onClick={() => { setTileStyle('carto'); addToast('Base Layer', 'Standard CartoDB Neutral Tiles', 'info', 1500); }}
                className={`px-2 py-0.5 text-[11px] rounded ${tileStyle === 'carto' ? 'bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 font-semibold' : 'text-slate-500'}`}
                title="Carto Neutral"
              >
                Carto
              </button>
              <button
                onClick={() => { setTileStyle('osm'); addToast('Base Layer', 'OpenStreetMap Standard Tiles', 'info', 1500); }}
                className={`px-2 py-0.5 text-[11px] rounded ${tileStyle === 'osm' ? 'bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 font-semibold' : 'text-slate-500'}`}
                title="OpenStreetMap Standard"
              >
                OSM
              </button>
              <button
                onClick={() => { setTileStyle('satellite'); addToast('Base Layer', 'Satellite Imagery Tiles', 'info', 1500); }}
                className={`px-2 py-0.5 text-[11px] rounded ${tileStyle === 'satellite' ? 'bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 font-semibold' : 'text-slate-500'}`}
                title="Satellite Imagery"
              >
                Satellite
              </button>
            </div>

            {/* Marker Clustering Mode Selector */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 px-1 flex items-center gap-0.5">
                <Grid className="w-3 h-3" />
                <span className="hidden sm:inline">Clusters:</span>
              </span>
              <button
                onClick={() => { setClusterMode('auto'); addToast('Marker Clustering', 'Auto Mode (Clustered on nationwide zoom)', 'info', 1800); }}
                className={`px-1.5 py-0.5 text-[11px] rounded ${clusterMode === 'auto' ? 'bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 font-semibold' : 'text-slate-500'}`}
                title="Auto Clustering (Clustered at zoom <= 5, expands on zoom in)"
              >
                Auto
              </button>
              <button
                onClick={() => { setClusterMode('clustered'); addToast('Marker Clustering', 'Forced Regional Cluster Bubbles', 'info', 1800); }}
                className={`px-1.5 py-0.5 text-[11px] rounded ${clusterMode === 'clustered' ? 'bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 font-semibold' : 'text-slate-500'}`}
                title="Always Clustered"
              >
                Clusters
              </button>
              <button
                onClick={() => { setClusterMode('individual'); addToast('Marker Clustering', 'Individual Airport Hub Markers', 'info', 1800); }}
                className={`px-1.5 py-0.5 text-[11px] rounded ${clusterMode === 'individual' ? 'bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 font-semibold' : 'text-slate-500'}`}
                title="Show all individual hubs"
              >
                Hubs
              </button>
            </div>

            {/* Density Corridor Toggle */}
            <button
              onClick={() => {
                setShowDensityOverlay(!showDensityOverlay);
                addToast('Airfare Density', showDensityOverlay ? 'Density Corridors Hidden' : 'Displaying High-Density Airfare Corridors', 'info', 1800);
              }}
              className={`p-1.5 rounded-md border text-xs flex items-center gap-1 transition-colors ${
                showDensityOverlay
                  ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 font-medium'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
              }`}
              title="Toggle Airfare Density Corridor Overlay"
              aria-label="Toggle airfare density overlay"
            >
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden md:inline">Density</span>
            </button>

            {/* Recenter Button */}
            <button
              onClick={handleRecenter}
              className="p-1.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              title="Recenter to India"
              aria-label="Recenter map to India bounds"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>

            {/* Origin Airport Filter */}
            <select
              value={filterOrigin}
              onChange={e => setFilterOrigin(e.target.value)}
              className="px-2.5 py-1 text-xs rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none"
              aria-label="Filter origin airport"
            >
              <option value="ALL">{t.network.filters.allOrigins}</option>
              {AIRPORT_LIST.map(a => (
                <option key={a.code} value={a.code}>
                  {a.code} ({language === 'hi' ? a.cityHi : a.city})
                </option>
              ))}
            </select>

            {/* Destination Airport Filter */}
            <select
              value={filterDestination}
              onChange={e => setFilterDestination(e.target.value)}
              className="px-2.5 py-1 text-xs rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none"
              aria-label="Filter destination airport"
            >
              <option value="ALL">{t.network.filters.allDestinations}</option>
              {AIRPORT_LIST.map(a => (
                <option key={a.code} value={a.code}>
                  {a.code} ({language === 'hi' ? a.cityHi : a.city})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Live Map API Status Sub-Bar */}
      <div className="px-4 py-1.5 border-b border-slate-100 dark:border-slate-800/60 bg-white/90 dark:bg-slate-900/90 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 font-mono text-emerald-600 dark:text-emerald-400 font-medium">
            <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
            <span>MoSPI GeoJSON API (v1.2)</span>
          </span>
          <span aria-hidden="true">·</span>
          <span>Latency: <strong className="font-mono">{apiTelemetry?.latencyMs || 24}ms</strong></span>
          <span aria-hidden="true" className="hidden sm:inline">·</span>
          <span className="hidden sm:inline font-mono">
            Mode: {isClusteringActive ? 'Regional Marker Clustering' : 'Individual Airport Nodes'} (Zoom {currentZoom})
          </span>
        </div>

        <button
          onClick={handleSyncApi}
          disabled={isSyncingApi}
          className="flex items-center gap-1 text-sky-600 dark:text-sky-400 hover:text-sky-700 font-medium transition-colors"
        >
          <RefreshCw className={`w-3 h-3 ${isSyncingApi ? 'animate-spin' : ''}`} />
          <span>{isSyncingApi ? 'Syncing...' : 'Sync Live GeoJSON'}</span>
        </button>
      </div>

      {/* Map Viewport Area */}
      <div className={`relative w-full ${heightClass}`}>
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Legend Overlay */}
        <div className="absolute top-3 left-3 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm text-xs space-y-1.5 pointer-events-auto max-w-[210px]">
          <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
            <span>
              {selectedMetric === 'index' && t.network.metrics.index}
              {selectedMetric === 'movement' && t.network.metrics.movement}
              {selectedMetric === 'activity' && t.network.metrics.activity}
              {selectedMetric === 'coverage' && t.network.metrics.coverage}
            </span>
          </div>

          {selectedMetric === 'index' && (
            <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-3 h-1 rounded-sm bg-rose-500" />
                <span>&gt; 135.0 (Surge)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-1 rounded-sm bg-amber-500" />
                <span>125.0 - 135.0</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-1 rounded-sm bg-sky-500" />
                <span>115.0 - 125.0</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-1 rounded-sm bg-emerald-500" />
                <span>&lt; 115.0 (Moderate)</span>
              </div>
            </div>
          )}

          {selectedMetric === 'movement' && (
            <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-3 h-1 rounded-sm bg-rose-500" />
                <span>Rising (&gt; +3%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-1 rounded-sm bg-amber-500" />
                <span>Moderate (+0% to +3%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-1 rounded-sm bg-emerald-500" />
                <span>Falling (&lt; 0%)</span>
              </div>
            </div>
          )}

          {selectedMetric === 'activity' && (
            <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-3 h-1 rounded-sm bg-indigo-500" />
                <span>High Trunk Sector</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-1 rounded-sm bg-sky-600" />
                <span>Medium Regional</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-1 rounded-sm bg-slate-400" />
                <span>Connecting Sector</span>
              </div>
            </div>
          )}

          {selectedMetric === 'coverage' && (
            <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-3 h-1 rounded-sm bg-emerald-500" />
                <span>High Sample (&gt;80)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-1 rounded-sm bg-amber-500" />
                <span>Moderate Sample</span>
              </div>
            </div>
          )}

          <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
            <span>{isClusteringActive ? 'Clusters Active' : 'Individual Nodes'}</span>
            <span className="font-mono text-sky-600 font-bold">{isClusteringActive ? '4 Clusters' : '13 Hubs'}</span>
          </div>
        </div>

        {/* Selected Cluster Intelligence Drawer */}
        {selectedCluster && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:w-84 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-150">
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 uppercase tracking-wider font-semibold flex items-center gap-1">
                  <Grid className="w-3 h-3" />
                  <span>Aviation Cluster · {selectedCluster.airports.length} Hubs</span>
                </span>
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {language === 'hi' ? selectedCluster.nameHi : selectedCluster.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedCluster.airports.map(a => `${a.code} (${a.city})`).join(' · ')}
                </p>
              </div>
              <button
                onClick={() => setSelectedCluster(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                aria-label="Close cluster panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 my-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Cluster Avg Fare</span>
                <span className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                  ₹{selectedCluster.avgFare.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Cluster Avg Index</span>
                <span className="font-mono text-sm font-semibold text-sky-600 dark:text-sky-400 tabular-nums">
                  {selectedCluster.avgIndex}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Monitored Sectors</span>
                <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                  {selectedCluster.totalRoutes} domestic sectors
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Traffic Tier</span>
                <span className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  Tier {selectedCluster.dominantTier} Density
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Contained Airport Hubs:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {selectedCluster.airports.map(ap => (
                  <button
                    key={ap.code}
                    onClick={() => {
                      setSelectedAirport(ap);
                      setSelectedCluster(null);
                      if (mapInstanceRef.current && (mapInstanceRef.current as any)._mapPane) {
                        mapInstanceRef.current.setView([ap.lat, ap.lng], 8);
                      }
                    }}
                    className="p-1.5 rounded bg-slate-100/70 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-950/40 text-left border border-slate-200 dark:border-slate-700 text-xs transition-colors flex items-center justify-between"
                  >
                    <div>
                      <span className="font-mono font-bold text-sky-600 dark:text-sky-400 block leading-tight">{ap.code}</span>
                      <span className="text-[10px] text-slate-500 truncate block">{ap.city}</span>
                    </div>
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Selected Airport Information Drawer */}
        {airportDetails && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:w-80 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-150">
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="text-[10px] font-mono text-sky-600 dark:text-sky-400 uppercase tracking-wider font-semibold">
                  {airportDetails.airport.code} · Tier {airportDetails.airport.tier} Hub
                </span>
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {language === 'hi' ? airportDetails.airport.cityHi : airportDetails.airport.city}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[220px]">
                  {airportDetails.airport.name}
                </p>
              </div>
              <button
                onClick={() => setSelectedAirport(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                aria-label="Close panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 my-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">{t.network.panel.avgDepartureFare}</span>
                <span className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                  ₹{airportDetails.avgFare.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">{t.kpi.routeIndex}</span>
                <span className="font-mono text-sm font-semibold text-sky-600 dark:text-sky-400 tabular-nums">
                  {airportDetails.avgIndex}
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                {t.network.panel.connectedRoutes} ({airportDetails.connectedRoutes.length})
              </span>
              <div className="max-h-32 overflow-y-auto space-y-1 pr-1 text-xs">
                {airportDetails.connectedRoutes.slice(0, 6).map(cr => (
                  <button
                    key={cr.route}
                    onClick={() => navigateToRoute(cr.route)}
                    className="w-full flex items-center justify-between p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-left transition-colors"
                  >
                    <span className="font-mono font-medium">{cr.route}</span>
                    <span className="font-mono text-slate-500 tabular-nums flex items-center gap-1">
                      ₹{cr.currentAvgFare.toLocaleString()}
                      <ChevronRight className="w-3 h-3 text-slate-400" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Selected Route Information Drawer */}
        {selectedRoute && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:w-80 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-150">
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-semibold">
                  {t.network.panel.routeDetails}
                </span>
                <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 font-mono">
                  {selectedRoute.route}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedRoute.distanceKm} km · {selectedRoute.weight}% {t.kpi.routeWeight}
                </p>
              </div>
              <button
                onClick={() => setSelectedRoute(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                aria-label="Close panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 my-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">{t.kpi.routeIndex}</span>
                <span className="font-mono text-base font-semibold text-sky-600 dark:text-sky-400 tabular-nums">
                  {selectedRoute.currentIndex}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">{t.kpi.averageFare}</span>
                <span className="font-mono text-base font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                  ₹{selectedRoute.currentAvgFare.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">{t.kpi.change24h}</span>
                <span className={`font-mono text-xs font-semibold tabular-nums ${selectedRoute.change24h >= 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {selectedRoute.change24h >= 0 ? `+${selectedRoute.change24h}%` : `${selectedRoute.change24h}%`}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">{t.kpi.fareRecords}</span>
                <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                  {selectedRoute.recordCount} records
                </span>
              </div>
            </div>

            <button
              onClick={() => navigateToRoute(selectedRoute.route)}
              className="w-full py-2 px-3 text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <span>{t.dashboard.viewAnalytics}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
