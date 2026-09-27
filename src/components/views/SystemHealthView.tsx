import React from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { MetricCard } from '../common/MetricCard';
import { 
  CheckCircle2, 
  Activity, 
  Cpu, 
  Database, 
  Server, 
  Layers, 
  ShieldCheck, 
  RefreshCw,
  Clock
} from 'lucide-react';

export const SystemHealthView: React.FC = () => {
  const { pipelineResult, triggerSimulateNewCollection, isSimulating } = useData();
  const { t, language } = useLanguage();
  const stats = pipelineResult.stats;

  const systemModules = [
    {
      name: t.systemHealthPage.modules.collection,
      status: 'Operational',
      uptime: '99.98%',
      latency: '120ms',
      icon: Activity,
      desc: 'Automated flight scraper and NDC connector dispatchers.',
    },
    {
      name: t.systemHealthPage.modules.processing,
      status: 'Operational',
      uptime: '100%',
      latency: `${stats.processingTimeMs}ms`,
      icon: Cpu,
      desc: 'Schema validation, deduplication, and IQR outlier detection engine.',
    },
    {
      name: t.systemHealthPage.modules.database,
      status: 'Operational',
      uptime: '99.99%',
      latency: '8ms',
      icon: Database,
      desc: 'Timescale / Datastore time-series airfare repository.',
    },
    {
      name: t.systemHealthPage.modules.indexEngine,
      status: 'Operational',
      uptime: '100%',
      latency: '14ms',
      icon: Layers,
      desc: 'Laspeyres relative price calculator with DGCA traffic weighting.',
    },
    {
      name: t.systemHealthPage.modules.api,
      status: 'Operational',
      uptime: '99.95%',
      latency: '35ms',
      icon: Server,
      desc: 'MoSPI-compliant Open Data REST API microservice.',
    },
    {
      name: t.systemHealthPage.modules.dashboard,
      status: 'Operational',
      uptime: '100%',
      latency: 'Client (0ms)',
      icon: CheckCircle2,
      desc: 'Vite SPA with responsive bilingual UI and Leaflet geospatial map.',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Title */}
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-sans">
            {t.systemHealthPage.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t.systemHealthPage.description}
          </p>
        </div>

        <button
          onClick={() => triggerSimulateNewCollection()}
          disabled={isSimulating}
          className="px-3.5 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded-lg flex items-center gap-2 transition-colors self-start sm:self-auto shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
          <span>{t.simulateCollection}</span>
        </button>
      </div>

      {/* Telemetry KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        <MetricCard
          title={t.systemHealthPage.telemetry.lastRun}
          value={stats.lastProcessedAt}
          subtitle="Continuous loop"
          statusIndicator={<Clock className="w-3.5 h-3.5 text-slate-400" />}
        />
        <MetricCard
          title={t.systemHealthPage.telemetry.duration}
          value={`${stats.processingTimeMs}ms`}
          subtitle="High throughput"
          statusIndicator={<Cpu className="w-3.5 h-3.5 text-sky-500" />}
        />
        <MetricCard
          title={t.systemHealthPage.telemetry.records}
          value={stats.rawRecords.toLocaleString()}
          subtitle="Processed in batch"
        />
        <MetricCard
          title={t.systemHealthPage.telemetry.errorRate}
          value="0.0%"
          subtitle="Zero fatal crashes"
          statusIndicator={<ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />}
        />
        <MetricCard
          title={t.kpi.dataQuality}
          value={`${stats.qualityScore}%`}
          subtitle="Passed statistical tests"
        />
      </div>

      {/* Core Subsystem Operational Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Subsystem Status & Verification Invariants
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {systemModules.map(module => {
            const Icon = module.icon;
            return (
              <div 
                key={module.name}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-2xs">
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{t.operational}</span>
                    </span>
                  </div>

                  <span className="font-semibold text-sm text-slate-900 dark:text-slate-100 block mb-1">
                    {module.name}
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                    {module.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  <span>Uptime: {module.uptime}</span>
                  <span>Latency: {module.latency}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
