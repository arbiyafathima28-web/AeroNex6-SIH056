import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { AIRPORTS, AIRPORT_LIST } from '../../constants/airports';
import { ROUTES, ROUTE_MAP } from '../../constants/routes';
import { AIRLINES, AIRLINE_LIST } from '../../constants/airlines';
import { MetricCard } from '../common/MetricCard';
import { AdvanceWindow } from '../../types';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Plane, Calendar, Filter, ArrowRight, Info } from 'lucide-react';

type RouteTab = 'overview' | 'fare-trend' | 'lead-time' | 'airlines';

export const RouteAnalyticsView: React.FC = () => {
  const { selectedRouteId, setSelectedRouteId, cleanRecords, indexResults } = useData();
  const { t, language } = useLanguage();

  const [activeTab, setActiveTab] = useState<RouteTab>('overview');
  const [selectedAirlineFilter, setSelectedAirlineFilter] = useState<string>('ALL');
  const [selectedLeadFilter, setSelectedLeadFilter] = useState<string>('ALL');
  const [fareComponentType, setFareComponentType] = useState<'total' | 'base'>('total');

  // Parse current route origin and destination
  const currentRouteDef = ROUTE_MAP.get(selectedRouteId) || ROUTES[0];
  const originAirport = AIRPORTS[currentRouteDef.origin];
  const destAirport = AIRPORTS[currentRouteDef.destination];

  // Filter clean records for this specific route
  const routeRecords = useMemo(() => {
    return cleanRecords.filter(r => {
      if (r.route !== currentRouteDef.id) return false;
      if (selectedAirlineFilter !== 'ALL' && r.airlineCode !== selectedAirlineFilter) return false;
      if (selectedLeadFilter !== 'ALL' && r.advanceWindow !== selectedLeadFilter) return false;
      return true;
    });
  }, [cleanRecords, currentRouteDef.id, selectedAirlineFilter, selectedLeadFilter]);

  // Current route summary metrics
  const routeSummary = useMemo(() => {
    const found = indexResults.routeSummaries.find(r => r.route === currentRouteDef.id);
    if (found) return found;

    return {
      route: currentRouteDef.id,
      origin: currentRouteDef.origin,
      destination: currentRouteDef.destination,
      weight: currentRouteDef.dgcaWeight,
      currentAvgFare: 5200,
      baseAvgFare: 4800,
      currentIndex: 108.3,
      change24h: 1.2,
      change7d: 2.1,
      change30d: 3.4,
      recordCount: routeRecords.length,
      distanceKm: currentRouteDef.distanceKm,
    };
  }, [indexResults.routeSummaries, currentRouteDef, routeRecords.length]);

  // 30-Day Trend for this route
  const trendData30d = useMemo(() => {
    // Group records by date
    const dateMap = new Map<string, { totalSum: number; baseSum: number; count: number }>();
    for (const r of cleanRecords) {
      if (r.route === currentRouteDef.id) {
        if (!dateMap.has(r.date)) {
          dateMap.set(r.date, { totalSum: 0, baseSum: 0, count: 0 });
        }
        const entry = dateMap.get(r.date)!;
        entry.totalSum += r.totalFare;
        entry.baseSum += r.baseFare;
        entry.count += 1;
      }
    }

    const sortedDates = Array.from(dateMap.keys()).sort().slice(-30);
    return sortedDates.map(date => {
      const item = dateMap.get(date)!;
      const avgTotal = Math.round(item.totalSum / item.count);
      const avgBase = Math.round(item.baseSum / item.count);
      return {
        date,
        totalFare: avgTotal,
        baseFare: avgBase,
        taxes: avgTotal - avgBase,
        count: item.count,
      };
    });
  }, [cleanRecords, currentRouteDef.id]);

  // Lead-Time Curve for this route (T+1, T+7, T+15, T+30, T+45)
  const leadTimeCurve = useMemo(() => {
    const windows: { window: AdvanceWindow; label: string; days: number }[] = [
      { window: 'T+1', label: '1 Day Before', days: 1 },
      { window: 'T+7', label: '7 Days Before', days: 7 },
      { window: 'T+15', label: '15 Days Before', days: 15 },
      { window: 'T+30', label: '30 Days Before', days: 30 },
      { window: 'T+45', label: '45 Days Before', days: 45 },
    ];

    return windows.map(w => {
      const match = routeRecords.filter(r => r.advanceWindow === w.window);
      const count = match.length || 1;
      const avgTotal = Math.round(match.reduce((acc, r) => acc + r.totalFare, 0) / count);
      const avgBase = Math.round(match.reduce((acc, r) => acc + r.baseFare, 0) / count);
      const taxes = avgTotal - avgBase;

      return {
        window: w.window,
        label: w.label,
        days: w.days,
        avgTotalFare: avgTotal || 5000,
        avgBaseFare: avgBase || 4200,
        taxes: taxes || 800,
      };
    });
  }, [routeRecords]);

  // Airline comparison on this route
  const airlineComparison = useMemo(() => {
    return AIRLINE_LIST.map(carrier => {
      const carrierRecords = routeRecords.filter(r => r.airlineCode === carrier.code);
      const count = carrierRecords.length;
      const avgTotal = count > 0 
        ? Math.round(carrierRecords.reduce((acc, r) => acc + r.totalFare, 0) / count) 
        : 0;
      const avgBase = count > 0 
        ? Math.round(carrierRecords.reduce((acc, r) => acc + r.baseFare, 0) / count) 
        : 0;

      const carrierIndex = count > 0
        ? Number(((avgTotal / (currentRouteDef.basePrice * 1.15)) * 100).toFixed(1))
        : 0;

      return {
        code: carrier.code,
        name: carrier.name,
        type: carrier.type,
        color: carrier.color,
        count,
        avgTotal,
        avgBase,
        carrierIndex,
      };
    }).filter(c => c.count > 0);
  }, [routeRecords, currentRouteDef.basePrice]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Route Selector Top Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-sky-600 dark:text-sky-400 font-semibold block mb-1">
              {t.routeAnalytics.title} · DGCA Basket Route #{ROUTES.findIndex(r => r.id === currentRouteDef.id) + 1}
            </span>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 font-mono tracking-tight flex items-center gap-2">
                <span>{currentRouteDef.origin}</span>
                <span className="text-slate-400">→</span>
                <span>{currentRouteDef.destination}</span>
              </h1>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                ({language === 'hi' ? originAirport?.cityHi : originAirport?.city} to {language === 'hi' ? destAirport?.cityHi : destAirport?.city})
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {currentRouteDef.distanceKm} km · DGCA Basket Weight: {currentRouteDef.dgcaWeight}%
            </p>
          </div>

          {/* Quick Route Switcher & Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div>
              <label className="block text-[10px] text-slate-400 mb-0.5">{language === 'hi' ? 'मार्ग बदलें' : 'Select Route'}</label>
              <select
                value={selectedRouteId}
                onChange={e => setSelectedRouteId(e.target.value)}
                className="px-3 py-1.5 text-xs font-mono font-medium rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                {ROUTES.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.id} ({AIRPORTS[r.origin]?.city} → {AIRPORTS[r.destination]?.city})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 mb-0.5">{t.routeAnalytics.airline}</label>
              <select
                value={selectedAirlineFilter}
                onChange={e => setSelectedAirlineFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="ALL">{t.network.filters.allAirlines}</option>
                {AIRLINE_LIST.map(a => (
                  <option key={a.code} value={a.code}>{a.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 mb-0.5">{t.routeAnalytics.leadTimeWindow}</label>
              <select
                value={selectedLeadFilter}
                onChange={e => setSelectedLeadFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="ALL">{t.routeAnalytics.allLeadTimes}</option>
                <option value="T+1">T+1 (1 Day Before)</option>
                <option value="T+7">T+7 (7 Days Before)</option>
                <option value="T+15">T+15 (15 Days Before)</option>
                <option value="T+30">T+30 (30 Days Before)</option>
                <option value="T+45">T+45 (45 Days Before)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid for Selected Route */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard
          title={t.kpi.routeIndex}
          value={routeSummary.currentIndex}
          unit="pts"
          change={routeSummary.change24h}
          changePeriod="24h"
          tooltip="Sector price index relative to base reference (100.0)"
          isPositiveGood={false}
        />
        <MetricCard
          title={t.kpi.averageFare}
          value={`₹${routeSummary.currentAvgFare.toLocaleString()}`}
          change={routeSummary.change7d}
          changePeriod="7d"
          subtitle="Observed total price"
          isPositiveGood={false}
        />
        <MetricCard
          title={t.kpi.change24h}
          value={routeSummary.change24h >= 0 ? `+${routeSummary.change24h}%` : `${routeSummary.change24h}%`}
          subtitle="Intraday shift"
          isPositiveGood={false}
        />
        <MetricCard
          title={t.kpi.change7d}
          value={routeSummary.change7d >= 0 ? `+${routeSummary.change7d}%` : `${routeSummary.change7d}%`}
          subtitle="Trailing weekly trend"
          isPositiveGood={false}
        />
      </div>

      {/* Internal Navigation Tabs (Permitted on Route Analytics) */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <div className="flex space-x-6">
          {(['overview', 'fare-trend', 'lead-time', 'airlines'] as RouteTab[]).map(tab => {
            const labels: Record<RouteTab, string> = {
              overview: t.tabs.overview,
              'fare-trend': t.tabs.fareTrend,
              'lead-time': t.tabs.leadTime,
              airlines: t.tabs.airlines,
            };
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-1 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-sky-600 text-sky-600 dark:border-sky-400 dark:text-sky-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {labels[tab]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Cols: Mini Trend & Sector Profile */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                {language === 'hi' ? '30-दिवसीय किराया रुझान संक्षेप' : '30-Day Fare Movement Snapshot'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                {language === 'hi' ? 'समस्त बुकिंग अवधियों में कुल किराए का औसत' : 'Average total fare across advance booking horizons'}
              </p>

              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData30d} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.2} />
                    <XAxis dataKey="date" tickFormatter={str => str.slice(5)} stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={val => `₹${val}`} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white p-2.5 rounded-lg shadow-xl text-xs space-y-1">
                              <p className="font-mono text-slate-400">{label}</p>
                              <p className="font-semibold text-sky-400">
                                Total Fare: <span className="font-mono tabular-nums">₹{item.totalFare.toLocaleString()}</span>
                              </p>
                              <p className="text-slate-300">
                                Base Fare: <span className="font-mono tabular-nums">₹{item.baseFare.toLocaleString()}</span>
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line type="monotone" dataKey="totalFare" stroke="#0284c7" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right Col: Route Specification */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
                  {language === 'hi' ? 'रूट विनिर्देश एवं संदर्भ' : 'Route Basket Specifications'}
                </h3>
                
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Origin Hub</span>
                    <span className="font-mono font-medium text-slate-900 dark:text-slate-100">
                      {currentRouteDef.origin} ({AIRPORTS[currentRouteDef.origin]?.city})
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Destination Hub</span>
                    <span className="font-mono font-medium text-slate-900 dark:text-slate-100">
                      {currentRouteDef.destination} ({AIRPORTS[currentRouteDef.destination]?.city})
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Distance</span>
                    <span className="font-mono font-medium text-slate-900 dark:text-slate-100">
                      {currentRouteDef.distanceKm} km
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">DGCA Basket Weight</span>
                    <span className="font-mono font-semibold text-sky-600 dark:text-sky-400">
                      {currentRouteDef.dgcaWeight}%
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Base Benchmark Price</span>
                    <span className="font-mono font-medium text-slate-900 dark:text-slate-100">
                      ₹{Math.round(currentRouteDef.basePrice * 1.15).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Total Observations</span>
                    <span className="font-mono font-medium text-slate-900 dark:text-slate-100">
                      {routeRecords.length.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 mt-4 rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900/50 text-[11px] text-sky-800 dark:text-sky-300">
                <p className="flex items-center gap-1.5 font-semibold mb-1">
                  <Info className="w-3.5 h-3.5" />
                  <span>MoSPI Ingestion Rule</span>
                </p>
                Observed fares are normalized across advance purchase horizons before aggregation to remove booking date bias.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: FARE TREND */}
      {activeTab === 'fare-trend' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                30-Day Historical Price Trajectory
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Inspect decomposition between Carrier Base Fare and Government Taxes/Fees
              </p>
            </div>

            {/* Toggle Total vs Base */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <button
                onClick={() => setFareComponentType('total')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  fareComponentType === 'total'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {t.routeAnalytics.totalFareLabel}
              </button>
              <button
                onClick={() => setFareComponentType('base')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  fareComponentType === 'base'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {t.routeAnalytics.baseFareLabel}
              </button>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData30d} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.2} />
                <XAxis dataKey="date" tickFormatter={str => str.slice(5)} stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={val => `₹${val}`} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl text-xs space-y-1">
                          <p className="font-mono text-slate-400">{label}</p>
                          <p className="font-semibold text-sky-400">
                            Total Fare: ₹{item.totalFare.toLocaleString()}
                          </p>
                          <p className="text-slate-300">
                            Base Fare: ₹{item.baseFare.toLocaleString()}
                          </p>
                          <p className="text-slate-400 text-[11px]">
                            Taxes & Fees: ₹{item.taxes.toLocaleString()}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey={fareComponentType === 'total' ? 'totalFare' : 'baseFare'}
                  stroke={fareComponentType === 'total' ? '#0284c7' : '#10b981'}
                  strokeWidth={2.5}
                  dot={{ r: 2.5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tab 3: LEAD TIME (Days Before Travel) */}
      {activeTab === 'lead-time' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {language === 'hi' ? 'यात्रा से पूर्व दिन (Lead-Time) वक्र' : 'Lead-Time Fare Curve (Days Before Travel)'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {t.routeAnalytics.leadTimeExplainer}
              </p>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leadTimeCurve} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.2} />
                  <XAxis dataKey="window" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={val => `₹${val}`} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl text-xs space-y-1">
                            <p className="font-semibold text-sky-400 font-mono">
                              {item.window} ({item.label})
                            </p>
                            <p className="text-slate-200 font-mono">
                              Total Fare: ₹{item.avgTotalFare.toLocaleString()}
                            </p>
                            <p className="text-slate-400 text-[11px]">
                              Base: ₹{item.avgBaseFare.toLocaleString()} · Taxes/Fees: ₹{item.taxes.toLocaleString()}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="avgBaseFare" fill="#38bdf8" name="Base Fare" stackId="a" />
                  <Bar dataKey="taxes" fill="#94a3b8" name="Taxes & Fees" stackId="a" radius={[4, 4, 0, 0]} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Lead time breakdown cards */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {leadTimeCurve.map(item => (
              <div key={item.window} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-center">
                <span className="font-mono font-bold text-sm text-sky-600 dark:text-sky-400 block mb-0.5">
                  {item.window}
                </span>
                <span className="text-[10px] text-slate-400 block mb-2">{item.label}</span>
                <span className="font-mono text-base font-semibold text-slate-900 dark:text-slate-100 block tabular-nums">
                  ₹{item.avgTotalFare.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: AIRLINES */}
      {activeTab === 'airlines' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {t.routeAnalytics.airlineComparison}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Average fare distribution across carriers operating on route {currentRouteDef.id}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-medium">
                <tr>
                  <th className="py-2.5 px-4">Carrier</th>
                  <th className="py-2.5 px-4">Model</th>
                  <th className="py-2.5 px-4 text-right">Avg Total Fare</th>
                  <th className="py-2.5 px-4 text-right">Base Fare</th>
                  <th className="py-2.5 px-4 text-right">Route Index</th>
                  <th className="py-2.5 px-4 text-right">Sample Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-mono">
                {airlineComparison.map(carrier => (
                  <tr key={carrier.code} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100 font-sans flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: carrier.color }} />
                      <span>{carrier.name} ({carrier.code})</span>
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-500">
                      {carrier.type === 'FSC' ? 'Full Service' : 'Low Cost Carrier (LCC)'}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                      ₹{carrier.avgTotal.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-400 tabular-nums">
                      ₹{carrier.avgBase.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-sky-600 dark:text-sky-400 tabular-nums">
                      {carrier.carrierIndex}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500 tabular-nums">
                      {carrier.count} records
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
