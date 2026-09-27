import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { simulateCpiSensitivity, BASELINE_ALL_INDIA_CPI, AIR_TRANSPORT_CPI_WEIGHT, TRANSPORT_GROUP_WEIGHT } from '../../services/cpiEngine';
import { MetricCard } from '../common/MetricCard';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Scale, Sliders, AlertTriangle, ArrowRight, BookOpen, Layers } from 'lucide-react';

export const CpiImpactView: React.FC = () => {
  const { indexResults } = useData();
  const { t, language } = useLanguage();

  const [scenarioPercent, setScenarioPercent] = useState<number>(10);

  const scenarioOptions = [-20, -10, -5, 0, 5, 10, 20];

  const simulation = useMemo(() => {
    return simulateCpiSensitivity(indexResults.currentAirfareIndex, scenarioPercent);
  }, [indexResults.currentAirfareIndex, scenarioPercent]);

  // Comparison chart data (Baseline vs Simulated)
  const comparisonData = [
    {
      name: 'Airfare Index',
      Current: simulation.currentAirfareIndex,
      Simulated: simulation.simulatedAirfareIndex,
      unit: 'pts',
    },
    {
      name: 'All-India Headline CPI',
      Current: simulation.baselineCpi,
      Simulated: simulation.simulatedCpi,
      unit: 'pts',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Page Title & MoSPI Disclaimer */}
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-sans">
          {t.cpiImpactPage.title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t.cpiImpactPage.description}
        </p>
      </div>

      {/* Prominent Statutory Disclaimer Callout */}
      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
          <strong className="font-semibold block mb-0.5">
            {language === 'hi' ? 'महत्वपूर्ण सांख्यिकीय अस्वीकरण:' : 'Important Statistical Disclaimer:'}
          </strong>
          {t.cpiDisclaimer}{' '}
          {language === 'hi'
            ? 'सिम्युलेटेड आंकड़े नीतिगत संवेदनशीलता और अनुसंधान विश्लेषण के उद्देश्य से प्रस्तुत किए गए हैं।'
            : 'Simulated CPI metrics are computed for econometric sensitivity modeling and prototype demonstration for MoSPI airfare analytics.'}
        </div>
      </div>

      {/* Scenario Control Slider / Discrete Buttons */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-600" />
              <span>{t.cpiImpactPage.scenarioLabel}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select an illustrative percentage shock across domestic airfares
            </p>
          </div>

          <span className="font-mono text-lg font-bold text-sky-600 dark:text-sky-400 px-3 py-1 bg-sky-50 dark:bg-sky-950/50 rounded-lg border border-sky-200 dark:border-sky-800">
            {scenarioPercent > 0 ? `+${scenarioPercent}%` : `${scenarioPercent}%`}
          </span>
        </div>

        {/* Discrete Selector Buttons */}
        <div className="grid grid-cols-7 gap-2">
          {scenarioOptions.map(pct => (
            <button
              key={pct}
              onClick={() => setScenarioPercent(pct)}
              className={`py-2 px-1 text-xs font-mono font-medium rounded-lg border transition-all text-center ${
                scenarioPercent === pct
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              {pct > 0 ? `+${pct}%` : `${pct}%`}
            </button>
          ))}
        </div>
      </div>

      {/* Simulation Result KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard
          title={t.cpiImpactPage.currentLevel}
          value={simulation.currentAirfareIndex}
          unit="pts"
          subtitle="Observed basket"
        />
        <MetricCard
          title={t.cpiImpactPage.airfareIndexSimulated}
          value={simulation.simulatedAirfareIndex}
          unit="pts"
          change={scenarioPercent}
          changePeriod="scenario"
          isPositiveGood={false}
        />
        <MetricCard
          title={t.cpiImpactPage.transportImpact}
          value={simulation.illustrativeTransportImpact >= 0 ? `+${simulation.illustrativeTransportImpact}` : `${simulation.illustrativeTransportImpact}`}
          unit="pp"
          subtitle="Sub-group shift (3.26% share)"
          isPositiveGood={false}
        />
        <MetricCard
          title={t.cpiImpactPage.cpiImpact}
          value={simulation.illustrativeCpiContribution >= 0 ? `+${simulation.illustrativeCpiContribution}` : `${simulation.illustrativeCpiContribution}`}
          unit="pp"
          subtitle="All India Headline CPI"
          isPositiveGood={false}
        />
      </div>

      {/* Before / After Comparison Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Comparison Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
            Baseline vs Simulated Impact Comparison
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Visualizing airfare index adjustment and the resulting headline CPI propagation
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.2} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis domain={['dataMin - 15', 'dataMax + 15']} stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl text-xs space-y-1">
                          <p className="font-semibold text-sky-400">{payload[0].payload.name}</p>
                          <p className="text-slate-300">
                            Current: <span className="font-mono">{payload[0].value} pts</span>
                          </p>
                          <p className="text-emerald-400 font-semibold">
                            Simulated: <span className="font-mono">{payload[1].value} pts</span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Current" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Simulated" fill="#0284c7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Assumptions & Macro Parameters */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-sky-600" />
              <span>{t.cpiImpactPage.modelAssumptions}</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              {t.cpiImpactPage.assumptionsText}
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">CPI Base Year</span>
                <span className="font-mono font-medium">2012 = 100</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Baseline CPI Level</span>
                <span className="font-mono font-medium">{BASELINE_ALL_INDIA_CPI}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Transport & Comm. Group Weight</span>
                <span className="font-mono font-medium">{TRANSPORT_GROUP_WEIGHT}%</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Air Transport Basket Weight</span>
                <span className="font-mono font-semibold text-sky-600 dark:text-sky-400">
                  {AIR_TRANSPORT_CPI_WEIGHT}%
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
            Source: Ministry of Statistics and Programme Implementation (MoSPI) CPI Weighting Diagrams.
          </div>
        </div>
      </div>
    </div>
  );
};
