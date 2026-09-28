import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { MetricCard } from '../common/MetricCard';
import { SparklinePoint } from '../common/SparklineChart';
import { IndiaAirfareMap } from '../map/IndiaAirfareMap';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { TrendingUp, TrendingDown, ArrowRight, ShieldCheck, Clock, CheckCircle2, AlertTriangle, RefreshCw, Calendar } from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { 
    indexResults, 
    pipelineResult, 
    navigateToRoute, 
    setActiveView,
    detectedSpikes,
    spikeThresholdPercent,
    todayFormatted,
    syncWithToday,
  } = useData();
  const { t, language } = useLanguage();

  const [trendRange, setTrendRange] = useState<'7D' | '30D' | '45D'>('30D');

  // Filter trend data according to selected time range
  const filteredTrend = useMemo(() => {
    const history = indexResults.dailyIndexHistory;
    if (trendRange === '7D') return history.slice(-7);
    if (trendRange === '30D') return history.slice(-30);
    return history.slice(-45);
  }, [indexResults.dailyIndexHistory, trendRange]);

  // Precompute 7-day price volatility and index trends for sparkline chart visualization
  const { sparkline7dIndex, sparkline7dVolatility, sparkline7dAvgFare } = useMemo(() => {
    const history = indexResults.dailyIndexHistory || [];
    const last7 = history.slice(-7);

    const indexData: SparklinePoint[] = [];
    const volData: SparklinePoint[] = [];
    const fareData: SparklinePoint[] = [];

    last7.forEach((pt, idx, arr) => {
      let formattedDate = pt.date;
      try {
        const parts = pt.date.split('-');
        if (parts.length === 3) {
          const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
          formattedDate = d.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short' });
        }
      } catch {
        formattedDate = pt.date.slice(5);
      }

      indexData.push({
        date: pt.date,
        formattedDate,
        value: pt.index,
      });

      const prev = idx > 0 ? arr[idx - 1] : pt;
      const dailyChangePct = prev.index > 0 ? Number((((pt.index - prev.index) / prev.index) * 100).toFixed(2)) : 0;
      volData.push({
        date: pt.date,
        formattedDate,
        value: dailyChangePct,
      });

      fareData.push({
        date: pt.date,
        formattedDate,
        value: pt.avgTotalFare,
      });
    });

    return {
      sparkline7dIndex: indexData,
      sparkline7dVolatility: volData,
      sparkline7dAvgFare: fareData,
    };
  }, [indexResults.dailyIndexHistory, language]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Page Title & Operational Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-sans">
              {t.nav.dashboard}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            {t.dashboard.subheadline}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-500 dark:text-slate-400 shrink-0">
          <div className="flex items-center gap-1.5 font-mono px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/70">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold">{t.today}: {todayFormatted}</span>
          </div>

          <div className="flex items-center gap-1.5 font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{t.lastUpdated}: {pipelineResult.stats.lastProcessedAt}</span>
          </div>

          <button
            onClick={() => syncWithToday()}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shadow-2xs"
            title={t.syncTodayFares}
          >
            <RefreshCw className="w-3 h-3 text-sky-500" />
            <span>{t.updateToToday}</span>
          </button>
        </div>
      </div>
 
      {/* Dynamic Price Anomaly Alert Section */}
      {detectedSpikes.length > 0 ? (
        <div className="p-3 sm:p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 min-w-0">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-950 dark:text-amber-200 whitespace-nowrap">
                {detectedSpikes.length} {language === 'hi' ? 'महत्वपूर्ण मूल्य वृद्धि पाई गई' : 'SIGNIFICANT PRICE SPIKES DETECTED'} (&gt;{spikeThresholdPercent}%)
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {detectedSpikes.map(sp => (
                  <button
                    key={sp.id}
                    onClick={() => navigateToRoute(sp.route)}
                    className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/80 text-slate-800 dark:text-slate-200 hover:border-amber-400 dark:hover:border-amber-600 hover:text-amber-700 dark:hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
                    title={`Inspect route ${sp.route}`}
                  >
                    <span>{sp.route}</span>
                    <span className="text-rose-600 dark:text-rose-400 font-bold">+{sp.changePercent}%</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              if (detectedSpikes.length > 0) {
                navigateToRoute(detectedSpikes[0].route);
              } else {
                setActiveView('route-analytics');
              }
            }}
            className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 hover:text-amber-950 dark:text-amber-300 dark:hover:text-amber-100 transition-colors shrink-0 self-start md:self-center cursor-pointer whitespace-nowrap"
          >
            <span>{language === 'hi' ? 'प्रभावित मार्ग देखें →' : 'View affected routes →'}</span>
          </button>
        </div>
      ) : (
        <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {language === 'hi'
                ? 'कोई महत्वपूर्ण किराया विसंगति नहीं पाई गई'
                : 'No significant fare anomalies detected'}
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:inline">
              · {language === 'hi' ? `सभी सेक्टर ±${spikeThresholdPercent}% सीमा के भीतर स्थिर हैं` : `All 42 monitored sectors within ±${spikeThresholdPercent}% threshold`}
            </span>
          </div>
          <button
            onClick={() => setActiveView('route-analytics')}
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors shrink-0 cursor-pointer"
          >
            <span>{language === 'hi' ? 'मार्ग विश्लेषण देखें →' : 'View route analytics →'}</span>
          </button>
        </div>
      )}

      {/* KPI Cards Grid - Directly calculated from real dataset */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <MetricCard
          title={t.kpi.airfareIndex}
          value={indexResults.currentAirfareIndex}
          unit="pts"
          change={indexResults.change24h}
          changePeriod="24h"
          tooltip={t.kpi.airfareIndexTooltip}
          isPositiveGood={false}
          sparklineData={sparkline7dIndex}
          sparklineColor="#0284c7"
          sparklineLabel="pts"
          sparklineBadge={`${indexResults.change7d >= 0 ? '+' : ''}${indexResults.change7d}% 7d`}
        />
        <MetricCard
          title={t.kpi.change24h}
          value={indexResults.change24h >= 0 ? `+${indexResults.change24h}%` : `${indexResults.change24h}%`}
          tooltip="Net percentage shift across weighted route basket over the last 24 hours."
          isPositiveGood={false}
          subtitle="Short-term volatility"
          sparklineData={sparkline7dVolatility}
          sparklineColor={indexResults.change24h >= 0 ? "#f43f5e" : "#10b981"}
          sparklineLabel="%"
          sparklineBadge="Daily shift"
        />
        <MetricCard
          title={t.kpi.change7d}
          value={indexResults.change7d >= 0 ? `+${indexResults.change7d}%` : `${indexResults.change7d}%`}
          tooltip="Trailing 7-day Laspeyres price movement."
          isPositiveGood={false}
          subtitle="Weekly velocity"
          sparklineData={sparkline7dAvgFare}
          sparklineColor="#8b5cf6"
          sparklineLabel="₹ avg"
          sparklineBadge="Avg fare"
        />
        <MetricCard
          title={t.kpi.routes}
          value={indexResults.activeRoutesCount}
          subtitle="13 airport hubs"
          tooltip="Active monitored domestic routes connecting Tier-1 and Tier-2 hubs."
        />
        <MetricCard
          title={t.kpi.fareRecords}
          value={pipelineResult.stats.standardizedRecords.toLocaleString()}
          subtitle="45-day window"
          tooltip={t.kpi.fareRecordsTooltip}
        />
        <MetricCard
          title={t.kpi.dataQuality}
          value={`${pipelineResult.stats.qualityScore}%`}
          changePeriod="passed"
          tooltip={t.kpi.dataQualityTooltip}
          isPositiveGood={true}
          statusIndicator={<ShieldCheck className="w-4 h-4 text-emerald-500" />}
        />
      </div>

      {/* Primary Section: Interactive Map + Real-time Network View */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            {t.network.title}
          </h2>
          <button
            onClick={() => setActiveView('network')}
            className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 flex items-center gap-1 transition-colors"
          >
            <span>{t.dashboard.viewAllRoutes}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <IndiaAirfareMap heightClass="h-[420px] sm:h-[480px] lg:h-[520px]" />
      </div>

      {/* Secondary Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Airfare Index Trend Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-sky-600" />
                <span>{t.dashboard.indexTrend}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'hi' 
                  ? 'समय के साथ भारित हवाई किराया मूल्य सूचकांक (आधार = 100)' 
                  : 'Laspeyres weighted domestic airfare index (Base benchmark = 100)'}
              </p>
            </div>

            {/* Timeframe Controls */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg self-start sm:self-auto">
              {(['7D', '30D', '45D'] as const).map(range => (
                <button
                  key={range}
                  onClick={() => setTrendRange(range)}
                  className={`px-2.5 py-1 text-xs font-mono font-medium rounded-md transition-colors ${
                    trendRange === range
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.2} />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={str => str.slice(5)} 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  tickLine={false}
                />
                <YAxis 
                  domain={['dataMin - 4', 'dataMax + 4']} 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  tickLine={false} 
                  tickFormatter={val => `${val}`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl text-xs space-y-1 border border-slate-700">
                          <p className="font-mono text-slate-400">{label}</p>
                          <p className="font-semibold text-sky-400">
                            Index: <span className="font-mono tabular-nums">{data.index}</span>
                          </p>
                          <p className="text-slate-300">
                            Avg Fare: <span className="font-mono tabular-nums">₹{data.avgTotalFare?.toLocaleString()}</span>
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Records: <span className="font-mono">{data.recordCount}</span>
                          </p>
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
                  dot={false}
                  activeDot={{ r: 5, fill: '#0284c7', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead-Time Behaviour Curve */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center justify-between">
              <span>{t.dashboard.leadTimeBehavior}</span>
              <span className="text-[11px] font-mono text-slate-400 font-normal">T+1 to T+45</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              {language === 'hi' 
                ? 'उड़ान से पूर्व बुकिंग समय के आधार पर औसत किराया' 
                : 'Average fare structure across advance purchase horizons'}
            </p>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={indexResults.leadTimeAverages} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.2} />
                  <XAxis dataKey="window" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={val => `₹${val / 1000}k`} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-2.5 rounded-lg shadow-xl text-xs space-y-1">
                            <span className="font-semibold text-sky-400 font-mono">{item.window} ({item.days} days before)</span>
                            <p className="text-slate-200">
                              Avg Total: <span className="font-mono tabular-nums font-semibold">₹{item.avgFare.toLocaleString()}</span>
                            </p>
                            <p className="text-slate-400 text-[11px]">
                              Base: ₹{item.baseFare.toLocaleString()} · Taxes: ₹{item.taxes.toLocaleString()}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="avgFare" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
            {t.routeAnalytics.leadTimeExplainer}
          </div>
        </div>
      </div>

      {/* Top Movers: Rising vs Falling Sectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Top Rising Routes */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-rose-500" />
              <span>{t.dashboard.topRising} (24h)</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">Top 5</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {indexResults.topRisingRoutes.map(item => (
              <div 
                key={item.route}
                onClick={() => navigateToRoute(item.route)}
                className="py-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded px-2 cursor-pointer transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100">
                      {item.route}
                    </span>
                    {item.change24h >= spikeThresholdPercent && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold font-mono bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-900">
                        Spike &gt;{spikeThresholdPercent}%
                      </span>
                    )}
                    <span className="text-[11px] text-slate-400 font-mono">
                      wt: {item.weight}%
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Avg ₹{item.currentAvgFare.toLocaleString()}
                  </span>
                </div>

                <div className="text-right">
                  <span className="font-mono font-bold text-xs text-rose-600 dark:text-rose-400 tabular-nums block">
                    +{item.change24h}%
                  </span>
                  <span className="font-mono text-[11px] text-slate-400 tabular-nums">
                    Idx: {item.currentIndex}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Falling Routes */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-emerald-500" />
              <span>{t.dashboard.topFalling} (24h)</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">Top 5</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {indexResults.topFallingRoutes.map(item => (
              <div 
                key={item.route}
                onClick={() => navigateToRoute(item.route)}
                className="py-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded px-2 cursor-pointer transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100">
                      {item.route}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      wt: {item.weight}%
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Avg ₹{item.currentAvgFare.toLocaleString()}
                  </span>
                </div>

                <div className="text-right">
                  <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400 tabular-nums block">
                    {item.change24h}%
                  </span>
                  <span className="font-mono text-[11px] text-slate-400 tabular-nums">
                    Idx: {item.currentIndex}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
