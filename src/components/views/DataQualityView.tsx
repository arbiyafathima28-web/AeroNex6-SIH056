import React from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { MetricCard } from '../common/MetricCard';
import { 
  ShieldCheck, 
  ArrowDown, 
  Filter, 
  CopyX, 
  AlertCircle, 
  CheckCircle2, 
  Database, 
  Cpu, 
  Clock, 
  Radio
} from 'lucide-react';

export const DataQualityView: React.FC = () => {
  const { pipelineResult } = useData();
  const { t, language } = useLanguage();
  const stats = pipelineResult.stats;

  const pipelineStages = [
    {
      id: 'raw',
      title: t.dataQualityPage.stages.raw,
      count: stats.rawRecords,
      desc: language === 'hi' ? 'सभी कनेक्टर से अंतर्ग्रहण किए गए कच्चे रिकॉर्ड' : 'Ingested from scraper/connector workers',
      icon: Database,
      badge: '100%',
      color: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
    },
    {
      id: 'valid',
      title: t.dataQualityPage.stages.valid,
      count: stats.validRecords,
      desc: language === 'hi' ? 'अनिवार्य स्कीमा एवं प्रारूप जांच उत्तीर्ण' : 'Passed mandatory schema and bounds verification',
      icon: ShieldCheck,
      badge: `${((stats.validRecords / stats.rawRecords) * 100).toFixed(1)}%`,
      color: 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300',
    },
    {
      id: 'duplicates',
      title: t.dataQualityPage.stages.duplicates,
      count: stats.duplicatesRemoved,
      desc: language === 'hi' ? 'समानांतर थ्रेड्स से हटाए गए डुप्लिकेट्स' : 'Identical route-airline-time slots eliminated',
      icon: CopyX,
      badge: `-${stats.duplicateRate}%`,
      color: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400',
    },
    {
      id: 'unusual',
      title: t.dataQualityPage.stages.unusual,
      count: stats.unusualFaresFlagged,
      desc: language === 'hi' ? 'IQR सांख्यिकीय सीमा से बाहर असामान्य किराए' : 'Flagged via interquartile outlier algorithm',
      icon: AlertCircle,
      badge: `-${stats.unusualFareRate}%`,
      color: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400',
    },
    {
      id: 'standardized',
      title: t.dataQualityPage.stages.standardized,
      count: stats.standardizedRecords,
      desc: language === 'hi' ? 'मूल किराया + कर + शुल्क मानकीकृत' : 'Decomposed into Base + Taxes + Fees',
      icon: Cpu,
      badge: `${stats.validity}%`,
      color: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300',
    },
    {
      id: 'indexed',
      title: t.dataQualityPage.stages.indexed,
      count: stats.standardizedRecords,
      desc: language === 'hi' ? 'MoSPI CPI संवर्धन हेतु भारित बास्केट में सम्मिलित' : 'Committed to Laspeyres index aggregation',
      icon: CheckCircle2,
      badge: 'Ready',
      color: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400',
    },
  ];

  const sourceStatuses = [
    {
      name: 'Demo Data Adapter',
      type: 'DEMO',
      description: 'Synthetic 45-day backtest observations generating calibrated airline pricing dynamics for domestic airfare price index evaluation.',
      status: 'Active (Simulated)',
      badgeColor: 'text-amber-700 dark:text-amber-400',
    },
    {
      name: 'DGCA Civil Aviation Reference',
      type: 'REFERENCE',
      description: 'Quarterly city-pair passenger traffic volume matrix providing baseline weights for the 42-route domestic basket.',
      status: 'Official Reference (DGCA 2025-26)',
      badgeColor: 'text-sky-700 dark:text-sky-400',
    },
    {
      name: 'Authorized Airline Direct APIs',
      type: 'AUTHORIZED',
      description: 'Direct NDC / schema-compliant connectors for IndiGo, Air India, Akasa, SpiceJet, Air India Express.',
      status: 'Architecture Provisioned',
      badgeColor: 'text-emerald-700 dark:text-emerald-400',
    },
    {
      name: 'Authorized OTA Partner Feeds',
      type: 'PLANNED',
      description: 'MakeMyTrip, Yatra, EaseMyTrip, Cleartrip, Ixigo data syndication channels.',
      status: 'Scheduled Pipeline',
      badgeColor: 'text-slate-500',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Page Title & Question Anchor */}
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-sans">
          {t.dataQualityPage.title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t.dataQualityPage.description} —{' '}
          <strong className="text-slate-700 dark:text-slate-300 font-semibold">
            {language === 'hi' ? 'क्या हम डेटा पर इतना भरोसा कर सकते हैं कि इसका उपयोग किया जा सके?' : 'Can we trust the data enough to use it for official indices?'}
          </strong>
        </p>
      </div>

      {/* KPI Cards: Quality Scores directly from pipeline stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <MetricCard
          title={t.kpi.dataQuality}
          value={`${stats.qualityScore}%`}
          tooltip={t.kpi.dataQualityTooltip}
          statusIndicator={<ShieldCheck className="w-4 h-4 text-emerald-500" />}
          subtitle="Audit Benchmark"
        />
        <MetricCard
          title={t.dataQualityPage.metrics.completeness}
          value={`${stats.completeness}%`}
          subtitle="Mandatory fields verified"
          tooltip="Percentage of records containing non-null required attributes (date, route, airline, total fare)."
        />
        <MetricCard
          title={t.dataQualityPage.metrics.validity}
          value={`${stats.validity}%`}
          subtitle="Schema & type conformity"
          tooltip="Records satisfying statutory domestic aviation constraints."
        />
        <MetricCard
          title={t.dataQualityPage.metrics.freshness}
          value={`${stats.freshness}%`}
          subtitle="Latency under 2 hours"
          tooltip="Ingested within target observation collection window."
        />
        <MetricCard
          title={t.dataQualityPage.metrics.duplicateRate}
          value={`${stats.duplicateRate}%`}
          subtitle="Deduplicated & excluded"
          isPositiveGood={false}
          tooltip="Duplicate scrapes isolated across parallel scraping threads."
        />
        <MetricCard
          title={t.dataQualityPage.metrics.unusualFareRate}
          value={`${stats.unusualFareRate}%`}
          subtitle="IQR outlier threshold"
          isPositiveGood={false}
          tooltip="Unusual fares identified via 1.8x IQR fences, isolated from index calculation."
        />
      </div>

      {/* Visual Pipeline Funnel Flow */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-sky-600" />
              <span>{t.dataQualityPage.pipelineHeader}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              End-to-end data transformation pipeline executing continuous quality verification
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Batch Run: {stats.processingTimeMs}ms
          </span>
        </div>

        {/* Funnel sequence */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
          {pipelineStages.map((stage, idx) => {
            const Icon = stage.icon;
            return (
              <div 
                key={stage.id}
                className="relative bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-6 h-6 rounded-md bg-white dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 shadow-2xs border border-slate-200 dark:border-slate-700">
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400">
                      {stage.badge}
                    </span>
                  </div>

                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block mb-1">
                    {stage.title}
                  </span>

                  <span className="font-mono text-xl font-bold text-slate-900 dark:text-slate-100 block tabular-nums mb-2">
                    {stage.count.toLocaleString()}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                  {stage.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Source Status & Processing Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Connector Ingestion Status Inventory */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-500" />
            <span>{t.dataQualityPage.sourcesHeader}</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Transparent breakdown of current prototype vs future production data sources
          </p>

          <div className="space-y-3">
            {sourceStatuses.map(source => (
              <div
                key={source.name}
                className="p-3.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                    {source.name}
                  </span>
                  <span className={`text-[11px] font-mono font-semibold ${source.badgeColor}`}>
                    [{source.type}]
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 leading-relaxed">
                  {source.description}
                </p>
                <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>{source.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Outlier Exclusion Audit Log */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
              {language === 'hi' ? 'असामान्य किराया बहिष्करण लॉग (Scrubbed Records)' : 'Unusual Fare Scrubbing Audit Log'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Statistical records isolated by IQR bounds to preserve index purity
            </p>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {pipelineResult.outlierRecords.slice(0, 5).map(record => (
                <div 
                  key={record.id}
                  className="p-2.5 rounded-lg border border-rose-100 dark:border-rose-950/60 bg-rose-50/40 dark:bg-rose-950/20 text-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                      {record.route} · {record.airline}
                    </span>
                    <span className="font-mono text-rose-600 dark:text-rose-400 font-bold tabular-nums">
                      ₹{record.totalFare.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-rose-700/80 dark:text-rose-300/80">
                    {record.anomalyReason}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Isolation Method: Tukey's IQR Fences [Q1 - 1.8·IQR, Q3 + 2.2·IQR]</span>
            <span className="font-mono">{pipelineResult.outlierRecords.length} records scrubbed</span>
          </div>
        </div>
      </div>
    </div>
  );
};
