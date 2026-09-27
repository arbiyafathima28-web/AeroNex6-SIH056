import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { MetricCard } from '../common/MetricCard';
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
  ReferenceLine,
} from 'recharts';
import { Layers, AlertTriangle, TrendingUp, Info, CheckCircle2, Bell } from 'lucide-react';

type IndexTab = 'overview' | 'historical-trend' | 'route-contribution';

export const AirfareIndexView: React.FC = () => {
  const { 
    indexResults, 
    detectedSpikes, 
    broadcastSpikeAlerts, 
    simulatePriceShock, 
    spikeThresholdPercent, 
    navigateToRoute 
  } = useData();
  const { t, language } = useLanguage();

  const [activeTab, setActiveTab] = useState<IndexTab>('overview');
  const [trendRange, setTrendRange] = useState<'7D' | '30D' | '45D'>('30D');

  // Filter historical data
  const filteredHistory = useMemo(() => {
    const data = indexResults.dailyIndexHistory;
    if (trendRange === '7D') return data.slice(-7);
    if (trendRange === '30D') return data.slice(-30);
    return data.slice(-45);
  }, [indexResults.dailyIndexHistory, trendRange]);

  // Route contribution analysis:
  // Each route's net point contribution to index: (Route_Weight / 100) * (Route_Index - 100)
  const routeContributions = useMemo(() => {
    const list = indexResults.routeSummaries.map(r => {
      const netContributionPts = Number(((r.weight / 100) * (r.currentIndex - 100)).toFixed(2));
      return {
        ...r,
        netContributionPts,
      };
    });

    // Sort by absolute contribution
    return list.sort((a, b) => Math.abs(b.netContributionPts) - Math.abs(a.netContributionPts));
  }, [indexResults.routeSummaries]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header & Disclaimers */}
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-sans">
            {t.airfareIndexPage.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t.airfareIndexPage.description}
          </p>
        </div>

        <div className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
          Base Reference: 2026-Q1 = 100.0
        </div>
      </div>

      {/* KPI Cards: Current Index and 24h, 7d, 30d changes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard
          title={t.kpi.airfareIndex}
          value={indexResults.currentAirfareIndex}
          unit="pts"
          change={indexResults.change24h}
          changePeriod="24h"
          tooltip={t.kpi.airfareIndexTooltip}
          isPositiveGood={false}
        />
        <MetricCard
          title={t.kpi.change24h}
          value={indexResults.change24h >= 0 ? `+${indexResults.change24h}%` : `${indexResults.change24h}%`}
          tooltip="Net percentage change in aggregate price index over 24 hours."
          isPositiveGood={false}
          subtitle="Daily volatility"
        />
        <MetricCard
          title={t.kpi.change7d}
          value={indexResults.change7d >= 0 ? `+${indexResults.change7d}%` : `${indexResults.change7d}%`}
          tooltip="Trailing 7-day index change."
          isPositiveGood={false}
          subtitle="Weekly drift"
        />
        <MetricCard
          title={t.kpi.change30d}
          value={indexResults.change30d >= 0 ? `+${indexResults.change30d}%` : `${indexResults.change30d}%`}
          tooltip="Monthly trend vs 30-day baseline."
          isPositiveGood={false}
          subtitle="Monthly inflation pressure"
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <div className="flex space-x-6">
          {(['overview', 'historical-trend', 'route-contribution'] as IndexTab[]).map(tab => {
            const labels: Record<IndexTab, string> = {
              overview: t.tabs.overview,
              'historical-trend': t.tabs.historicalTrend,
              'route-contribution': t.tabs.routeContribution,
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
          {/* Real-time Price Spike Monitoring & Toast Alert Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span>{language === 'hi' ? 'हवाई किराया मूल्य वृद्धि मॉनिटर' : 'Real-Time Airfare Price Spike Monitor'}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      Threshold &gt;{spikeThresholdPercent}%
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {language === 'hi'
                      ? 'टोस्ट नोटिफिकेशन सिस्टम का उपयोग करके स्वचालित रूप से तीव्र मूल्य वृद्धि (>10%) का पता लगाता है।'
                      : 'Continuously monitors domestic city-pairs and broadcasts Toast alerts when price spikes (>10%) occur.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center">
                <button
                  onClick={() => broadcastSpikeAlerts()}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Send Toast Alert</span>
                </button>
                <button
                  onClick={() => simulatePriceShock('DEL-BOM', 16.5)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  Simulate Shock (+16%)
                </button>
              </div>
            </div>

            {detectedSpikes.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-3">
                {detectedSpikes.slice(0, 3).map(sp => (
                  <div
                    key={sp.id}
                    onClick={() => navigateToRoute(sp.route)}
                    className="p-3 rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 hover:border-amber-400 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100">
                        {sp.route}
                      </span>
                      <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400">
                        +{sp.changePercent}%
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {sp.origin} → {sp.destination} · ₹{sp.currentAvgFare.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Main Index Trend Chart */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Aggregate Domestic Airfare Index Trajectory
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t.airfareIndexPage.methodologyNote}
                </p>
              </div>

              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                {(['7D', '30D', '45D'] as const).map(range => (
                  <button
                    key={range}
                    onClick={() => setTrendRange(range)}
                    className={`px-3 py-1 text-xs font-mono font-medium rounded-md transition-colors ${
                      trendRange === range
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredHistory} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.2} />
                  <XAxis dataKey="date" tickFormatter={str => str.slice(5)} stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis domain={['dataMin - 3', 'dataMax + 3']} stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <ReferenceLine y={100} stroke="#94a3b8" strokeDasharray="3 3" label={{ value: 'Base 100', fill: '#94a3b8', fontSize: 10 }} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl text-xs space-y-1">
                            <p className="font-mono text-slate-400">{label}</p>
                            <p className="font-semibold text-sky-400 text-sm">
                              Index: <span className="font-mono">{item.index}</span>
                            </p>
                            <p className="text-slate-300 font-mono">
                              Avg Fare: ₹{item.avgTotalFare?.toLocaleString()}
                            </p>
                            <p className="text-slate-400 text-[10px]">
                              Observations: {item.recordCount} records
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line type="monotone" dataKey="index" stroke="#0284c7" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Mathematical formulation block */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-xs space-y-2">
              <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-sky-600" />
                <span>Laspeyres Index Formulation</span>
              </span>
              <p className="text-slate-600 dark:text-slate-400">
                The prototype aggregate airfare index (API) for observation period <em>t</em> is computed as:
              </p>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg font-mono text-[11px] text-slate-800 dark:text-slate-200">
                {'API_t = ∑ [ w_i × ( P_{i,t} / P_{i,0} ) ] / ∑ w_i × 100'}
              </div>
              <p className="text-slate-500 text-[11px]">
                where <code>w_i</code> is route <em>i</em> passenger traffic weight from DGCA quarterly schedules, and <code>{'P_{i,0}'}</code> is the base benchmark fare.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-xs space-y-2 flex flex-col justify-between">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>MoSPI Statistical Compliance</span>
                </span>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Observations are standardized across 5 advance booking windows (T+1, T+7, T+15, T+30, T+45) with fixed carrier weights to eliminate temporal sampling bias before aggregation.
                </p>
              </div>
              <div className="text-[11px] text-amber-700 dark:text-amber-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                {t.cpiDisclaimer}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: HISTORICAL TREND (Backtest) */}
      {activeTab === 'historical-trend' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <div>
                <span className="font-mono text-xs font-bold text-amber-800 dark:text-amber-300">
                  {t.syntheticBacktestNotice}
                </span>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                  Simulated 45-day historical backtest illustrating index sensitivity, weekend demand surges, and anomaly scrubbing.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 p-1 bg-white/80 dark:bg-slate-800 rounded-lg">
              {(['7D', '30D', '45D'] as const).map(range => (
                <button
                  key={range}
                  onClick={() => setTrendRange(range)}
                  className={`px-2.5 py-1 text-xs font-mono font-medium rounded-md ${
                    trendRange === range
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">
              45-Day Backtest Trajectory & Identified Surges
            </h3>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredHistory} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.2} />
                  <XAxis dataKey="date" tickFormatter={str => str.slice(5)} stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis domain={['dataMin - 4', 'dataMax + 4']} stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl text-xs space-y-1">
                            <p className="font-mono text-slate-400">{label}</p>
                            <p className="font-semibold text-sky-400">Index: {item.index}</p>
                            <p className="text-slate-300">Avg Fare: ₹{item.avgTotalFare?.toLocaleString()}</p>
                            {item.anomalyDetected && (
                              <p className="text-amber-400 font-semibold text-[10px]">
                                ⚠ Unusual volatility detected on this date
                              </p>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="index" 
                    stroke="#0284c7" 
                    strokeWidth={2.5} 
                    dot={(props: any) => {
                      const { cx, cy, payload } = props;
                      if (payload.anomalyDetected) {
                        return <circle cx={cx} cy={cy} r={5} fill="#ef4444" stroke="#ffffff" strokeWidth={2} key={payload.date} />;
                      }
                      return <circle cx={cx} cy={cy} r={2} fill="#0284c7" key={payload.date} />;
                    }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: ROUTE CONTRIBUTION */}
      {activeTab === 'route-contribution' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Sector Contribution to Index Movement (Basis Points)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              {t.airfareIndexPage.routeContributionExplainer}
            </p>

            <div className="h-64 w-full mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={routeContributions.slice(0, 10)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.2} />
                  <XAxis dataKey="route" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-2.5 rounded-lg shadow-xl text-xs space-y-1">
                            <p className="font-mono font-semibold text-sky-400">{item.route}</p>
                            <p className="text-slate-200">Weight: {item.weight}%</p>
                            <p className="text-slate-200">Route Index: {item.currentIndex}</p>
                            <p className="font-semibold text-amber-400 font-mono">
                              Net Contribution: {item.netContributionPts > 0 ? `+${item.netContributionPts}` : item.netContributionPts} pts
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="netContributionPts" fill="#0284c7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Table of all Route Contributions */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-medium">
                  <tr>
                    <th className="py-2.5 px-4 font-mono">Route</th>
                    <th className="py-2.5 px-4 text-right">DGCA Weight (%)</th>
                    <th className="py-2.5 px-4 text-right">Current Route Index</th>
                    <th className="py-2.5 px-4 text-right">Average Fare</th>
                    <th className="py-2.5 px-4 text-right">Net Contribution to Index</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-mono">
                  {routeContributions.map(rc => (
                    <tr key={rc.route} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <span>{rc.route}</span>
                        {rc.change24h >= spikeThresholdPercent && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold font-mono bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-900">
                            Spike &gt;{spikeThresholdPercent}%
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-right tabular-nums text-slate-700 dark:text-slate-300">
                        {rc.weight}%
                      </td>
                      <td className="py-2.5 px-4 text-right tabular-nums font-semibold text-sky-600 dark:text-sky-400">
                        {rc.currentIndex}
                      </td>
                      <td className="py-2.5 px-4 text-right tabular-nums text-slate-800 dark:text-slate-200">
                        ₹{rc.currentAvgFare.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-4 text-right tabular-nums font-bold text-slate-900 dark:text-slate-100">
                        {rc.netContributionPts > 0 ? `+${rc.netContributionPts}` : rc.netContributionPts} pts
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
