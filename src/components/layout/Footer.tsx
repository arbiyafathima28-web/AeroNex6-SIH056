import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';

export const Footer: React.FC = () => {
  const { t, language } = useLanguage();
  const { setActiveView } = useData();

  return (
    <footer className="w-full bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-8 px-4 sm:px-6 lg:px-8 transition-colors mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-slate-700 dark:text-slate-300">AeroNex6</span>
            <span aria-hidden="true">·</span>
            <span>{t.sihTag}</span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            {language === 'hi' 
              ? 'उपभोक्ता मूल्य सूचकांक (CPI) संवर्धन हेतु स्वचालित हवाई किराया मूल्य सूचकांक प्रोटोटाइप।' 
              : 'Automated airfare scraping, cleaning, Laspeyres index calculation, and CPI augmentation architecture.'}
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium">
          <button 
            onClick={() => { setActiveView('methodology'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            {t.nav.methodology}
          </button>
          <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
          <button 
            onClick={() => { setActiveView('system-health'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            {t.nav.systemHealth}
          </button>
          <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
          <button 
            onClick={() => { setActiveView('data-explorer'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            {t.nav.dataExplorer}
          </button>
        </div>
      </div>
    </footer>
  );
};
