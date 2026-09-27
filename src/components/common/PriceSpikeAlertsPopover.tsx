import React from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { Bell, ArrowRight, X, SlidersHorizontal, CheckCircle2 } from 'lucide-react';

interface PriceSpikeAlertsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PriceSpikeAlertsPopover: React.FC<PriceSpikeAlertsPopoverProps> = ({ isOpen, onClose }) => {
  const { 
    detectedSpikes, 
    spikeThresholdPercent, 
    setSpikeThresholdPercent, 
    navigateToRoute 
  } = useData();
  const { language } = useLanguage();

  if (!isOpen) return null;

  const thresholdOptions = [5, 8, 10, 15, 20];

  return (
    <div 
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      onMouseLeave={onClose}
    >
      {/* Popover Header */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 flex items-center justify-center text-amber-700 dark:text-amber-400">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              {language === 'hi' ? 'मूल्य वृद्धि चेतावनी मॉनिटर' : 'Airfare Spike Monitor'}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {language === 'hi'
                ? `सीमा: > ${spikeThresholdPercent}% मूल्य वृद्धि`
                : `Trigger threshold: > ${spikeThresholdPercent}% price jump`}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Threshold Selector Filter */}
      <div className="p-3 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center justify-between mb-1.5 text-[11px]">
          <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1 font-medium">
            <SlidersHorizontal className="w-3 h-3 text-sky-500" />
            {language === 'hi' ? 'चेतावनी सीमा (Alert Threshold):' : 'Spike Alert Threshold:'}
          </span>
          <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
            &gt; {spikeThresholdPercent}%
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {thresholdOptions.map(option => (
            <button
              key={option}
              onClick={() => {
                setSpikeThresholdPercent(option);
              }}
              className={`flex-1 py-1 text-[11px] font-semibold rounded-md transition-colors text-center ${
                spikeThresholdPercent === option
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {option}%
            </button>
          ))}
        </div>
      </div>

      {/* Detected Spikes List */}
      <div className="max-h-56 overflow-y-auto p-3 space-y-2">
        {detectedSpikes.length === 0 ? (
          <div className="py-6 text-center text-slate-400 dark:text-slate-500 space-y-1">
            <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-500 mb-1" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {language === 'hi' ? 'कोई तीव्र मूल्य वृद्धि नहीं' : 'All Fares Within Normal Range'}
            </p>
            <p className="text-[11px]">
              {language === 'hi'
                ? `वर्तमान में कोई भी रूट > ${spikeThresholdPercent}% वृद्धि नहीं दिखा रहा है।`
                : `No domestic routes currently exceed the >${spikeThresholdPercent}% tolerance limit.`}
            </p>
          </div>
        ) : (
          detectedSpikes.map(spike => (
            <div
              key={spike.id}
              className="p-2.5 rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/30 flex items-center justify-between gap-3 group hover:border-amber-400 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100">
                    {spike.route}
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold font-mono bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                    +{spike.changePercent}% ({spike.timeHorizon})
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <span>₹{spike.currentAvgFare.toLocaleString('en-IN')}</span>
                  <span className="text-slate-300 dark:text-slate-700">·</span>
                  <span className="truncate">{spike.origin} → {spike.destination}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  navigateToRoute(spike.route);
                  onClose();
                }}
                className="shrink-0 p-1.5 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-amber-500 hover:text-white transition-colors text-xs font-medium flex items-center gap-1 shadow-xs"
                title="Inspect route analytics"
              >
                <span>View</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Action Footer */}
      <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <span className="text-[11px] text-slate-500 dark:text-slate-400">
          {detectedSpikes.length > 0 
            ? `${detectedSpikes.length} ${language === 'hi' ? 'मार्ग सीमा से अधिक' : 'sectors above threshold'}` 
            : (language === 'hi' ? 'सामान्य स्थिति' : 'Normal volatility')}
        </span>
        <button
          onClick={() => {
            if (detectedSpikes.length > 0) {
              navigateToRoute(detectedSpikes[0].route);
            }
            onClose();
          }}
          className="text-xs font-semibold text-amber-700 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>{language === 'hi' ? 'मार्ग विश्लेषण देखें' : 'View in Route Analytics'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
