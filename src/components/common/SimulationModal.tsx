import React from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { CheckCircle2, Loader2, ArrowRight, X, Sparkles, Database, ShieldCheck, Filter, Cpu } from 'lucide-react';

export const SimulationModal: React.FC = () => {
  const { isSimulationModalOpen, closeSimulationModal, isSimulating, simulationProgress } = useData();
  const { t, language } = useLanguage();

  if (!isSimulationModalOpen) return null;

  const stages = [
    { id: 'COLLECTING', label: language === 'hi' ? 'डेटा संकलन (Collecting)' : 'Data Collection', icon: Database },
    { id: 'VALIDATING', label: language === 'hi' ? 'सत्यापन (Validating)' : 'Schema Validation', icon: ShieldCheck },
    { id: 'CLEANING', label: language === 'hi' ? 'सफाई एवं विसंगति जांच' : 'Deduplication & IQR Filter', icon: Filter },
    { id: 'STANDARDIZING', label: language === 'hi' ? 'किराया मानकीकरण' : 'Fare Standardization', icon: Cpu },
    { id: 'INDEXING', label: language === 'hi' ? 'सूचकांक पुनर्गणना' : 'Index Recalculation', icon: Sparkles },
    { id: 'PUBLISHED', label: language === 'hi' ? 'प्रकाशित (Published)' : 'Published to Engine', icon: CheckCircle2 },
  ];

  const isCompleted = simulationProgress.stage === 'COMPLETED' || (!isSimulating && simulationProgress.stage !== 'IDLE');
  const currentStageIndex = isCompleted 
    ? stages.length 
    : stages.findIndex(s => s.id === simulationProgress.stage);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div 
        role="dialog"
        aria-modal="true"
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-sky-500 animate-pulse'}`} />
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {isCompleted 
                ? (language === 'hi' ? 'डेटा संकलन संपन्न' : 'Collection Completed') 
                : t.simulatingTitle}
            </h2>
          </div>
          {!isSimulating && (
            <button
              onClick={closeSimulationModal}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {language === 'hi'
              ? 'सिस्टम स्वचालित रूप से नए हवाई किराया अवलोकन एकत्र कर रहा है, डुप्लिकेट हटा रहा है और MoSPI सांख्यिकीय पद्धति के अनुसार सूचकांक को अपडेट कर रहा है।'
              : 'Executing automated airfare ingestion batch, scrubbing anomalies, calculating relative price ratios, and publishing updated Laspeyres index figures.'}
          </p>

          {/* Success Banner when simulation is finished */}
          {isCompleted && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-lg flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <span className="font-semibold block">
                  {language === 'hi' ? 'डेटा संकलन सफलतापूर्वक पूर्ण हुआ' : 'Collection completed successfully'}
                </span>
                <span className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80">
                  {language === 'hi'
                    ? 'अवलोकन मान्य किए गए, डुप्लिकेट हटाए गए, और अद्यतन सूचकांक स्थानीय डेटा स्टोर में सफलतापूर्वक प्रकाशित किया गया।'
                    : 'Observations validated, deduplicated, standardized, and committed to application state.'}
                </span>
              </div>
            </div>
          )}

          {/* Pipeline Stage Steps */}
          <div className="space-y-3">
            {stages.map((stage, idx) => {
              const isCurrent = !isCompleted && simulationProgress.stage === stage.id;
              const isPast = isCompleted || (currentStageIndex > idx);
              const isPending = !isCompleted && currentStageIndex < idx;
              const Icon = stage.icon;

              return (
                <div
                  key={stage.id}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                    isCurrent
                      ? 'bg-sky-50/70 dark:bg-sky-950/30 border-sky-300 dark:border-sky-800'
                      : isPast
                      ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      : 'border-slate-100 dark:border-slate-800/50 text-slate-400 dark:text-slate-600 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 flex items-center justify-center">
                      {isCurrent ? (
                        <Loader2 className="w-5 h-5 text-sky-600 dark:text-sky-400 animate-spin" />
                      ) : isPast ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Icon className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    <span className="text-sm font-medium">
                      {stage.label}
                    </span>
                  </div>

                  <span className={`text-xs font-mono ${isPast ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
                    {isCurrent ? 'Running...' : isPast ? 'Done' : 'Queued'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Metric telemetry box */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block mb-1">
                {language === 'hi' ? 'प्राप्त रिकॉर्ड्स' : 'Records Received'}
              </span>
              <span className="font-mono text-base font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                {simulationProgress.recordsReceived.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block mb-1">
                {language === 'hi' ? 'सत्यापित एवं साफ' : 'Clean & Standardized'}
              </span>
              <span className="font-mono text-base font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {simulationProgress.standardized.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block mb-1">
                {language === 'hi' ? 'अद्यतन सूचकांक' : 'Updated Index'}
              </span>
              <span className="font-mono text-base font-semibold text-sky-600 dark:text-sky-400 tabular-nums">
                {simulationProgress.newIndex}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-sky-500'}`} />
            {isCompleted 
              ? (language === 'hi' ? 'डेटा संकलन सफलतापूर्वक पूर्ण हुआ' : 'Collection completed successfully') 
              : (isSimulating ? (language === 'hi' ? 'बैच प्रक्रियाधीन...' : 'Processing batch...') : 'Batch pipeline committed')}
          </span>
          <button
            onClick={closeSimulationModal}
            disabled={isSimulating}
            className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
              isSimulating
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 shadow-xs cursor-pointer'
            }`}
          >
            <span>{isSimulating ? (language === 'hi' ? 'प्रक्रियाधीन...' : 'Processing...') : (language === 'hi' ? 'डैशबोर्ड पर लागू करें' : 'View Updated Results')}</span>
            {!isSimulating && <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
