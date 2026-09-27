import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { ShieldAlert, X } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  const { t, language } = useLanguage();
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200/80 dark:border-amber-900/50 px-4 py-2 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <p className="leading-snug">
            <strong className="font-semibold">{t.demoMode}:</strong> {t.demoNotice}{' '}
            <span className="hidden md:inline text-amber-800/80 dark:text-amber-300/80">({t.cpiDisclaimer})</span>
          </p>
        </div>
        <button
          onClick={() => setIsDismissed(true)}
          className="text-amber-700 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-200 p-0.5 rounded transition-colors ml-2 shrink-0"
          aria-label="Dismiss disclaimer banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
