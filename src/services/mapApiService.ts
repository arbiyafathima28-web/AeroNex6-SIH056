import { AIRPORTS, AIRPORT_LIST } from '../constants/airports';
import { ROUTES } from '../constants/routes';
import { RouteIndexSummary } from '../types';

export interface GeoJsonAirportFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  properties: {
    code: string;
    name: string;
    city: string;
    tier: number;
    connectedRoutesCount: number;
  };
}

export interface GeoJsonRouteFeature {
  type: 'Feature';
  geometry: {
    type: 'LineString';
    coordinates: [number, number][]; // [[lng1, lat1], [midLng, midLat], [lng2, lat2]]
  };
  properties: {
    route: string;
    origin: string;
    destination: string;
    distanceKm: number;
    dgcaWeight: number;
    currentIndex: number;
    currentAvgFare: number;
    change24h: number;
    change7d: number;
    status: 'ACTIVE' | 'SURGE' | 'NORMAL';
  };
}

export interface MapApiResponse {
  status: 'ONLINE' | 'DEGRADED';
  endpoint: string;
  version: string;
  source: string;
  latencyMs: number;
  lastSyncTimestamp: string;
  routesGeoJson: {
    type: 'FeatureCollection';
    features: GeoJsonRouteFeature[];
  };
  airportsGeoJson: {
    type: 'FeatureCollection';
    features: GeoJsonAirportFeature[];
  };
}

// Great-circle arc point generator to create realistic curved aviation flight vectors
export function computeFlightArcPoints(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  numPoints: number = 8
): [number, number][] {
  const points: [number, number][] = [];

  // Compute midpoint with slight normal perpendicular deflection based on distance
  const midLat = (lat1 + lat2) / 2;
  const midLon = (lon1 + lon2) / 2;

  // Curvature displacement (simulating aviation air traffic airway routing)
  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;
  const dist = Math.sqrt(dLat * dLat + dLon * dLon);
  const curvature = 0.08 * dist; // subtle arc
  
  // Normal vector
  const normalLat = -dLon / (dist || 1);
  const normalLon = dLat / (dist || 1);

  const controlLat = midLat + normalLat * curvature;
  const controlLon = midLon + normalLon * curvature;

  // Quadratic Bezier interpolation
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const invT = 1 - t;
    const lat = invT * invT * lat1 + 2 * invT * t * controlLat + t * t * lat2;
    const lon = invT * invT * lon1 + 2 * invT * t * controlLon + t * t * lon2;
    points.push([lat, lon]);
  }

  return points;
}

export async function fetchLiveMapGeoData(routeSummaries: RouteIndexSummary[]): Promise<MapApiResponse> {
  const startTime = performance.now();
  // Simulate network flight API response latency
  await new Promise(r => setTimeout(r, 120));

  const airportFeatures: GeoJsonAirportFeature[] = AIRPORT_LIST.map(airport => {
    const connectedCount = ROUTES.filter(r => r.origin === airport.code || r.destination === airport.code).length;
    return {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [airport.lng, airport.lat],
      },
      properties: {
        code: airport.code,
        name: airport.name,
        city: airport.city,
        tier: airport.tier,
        connectedRoutesCount: connectedCount,
      },
    };
  });

  const routeFeatures: GeoJsonRouteFeature[] = routeSummaries.map(r => {
    const origin = AIRPORTS[r.origin];
    const dest = AIRPORTS[r.destination];
    const arcPoints = computeFlightArcPoints(origin.lat, origin.lng, dest.lat, dest.lng, 8);
    // Convert [lat, lng] to GeoJSON standard [lng, lat]
    const geoJsonCoords: [number, number][] = arcPoints.map(([lat, lng]) => [lng, lat]);

    return {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: geoJsonCoords,
      },
      properties: {
        route: r.route,
        origin: r.origin,
        destination: r.destination,
        distanceKm: r.distanceKm,
        dgcaWeight: r.weight,
        currentIndex: r.currentIndex,
        currentAvgFare: r.currentAvgFare,
        change24h: r.change24h,
        change7d: r.change7d,
        status: r.currentIndex > 130 ? 'SURGE' : 'NORMAL',
      },
    };
  });

  const duration = Math.round(performance.now() - startTime);

  return {
    status: 'ONLINE',
    endpoint: '/api/v1/geo/routes.geojson',
    version: '1.2.4',
    source: 'DGCA-MoSPI Geospatial Registry (Live Feed)',
    latencyMs: duration || 24,
    lastSyncTimestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    routesGeoJson: {
      type: 'FeatureCollection',
      features: routeFeatures,
    },
    airportsGeoJson: {
      type: 'FeatureCollection',
      features: airportFeatures,
    },
  };
}
