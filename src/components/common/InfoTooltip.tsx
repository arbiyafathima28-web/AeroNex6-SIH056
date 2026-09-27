import React, { useState } from 'react';
import { Info } from 'lucide-react';

interface InfoTooltipProps {
  content: string;
  className?: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ content, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`relative inline-flex items-center align-middle ${className}`}>
      <button
        type="button"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Information note"
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-sky-500 rounded"
      >
        <Info className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <div
          role="tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-64 p-2.5 bg-slate-900 dark:bg-slate-800 text-white text-xs leading-relaxed rounded-md shadow-lg border border-slate-700 pointer-events-none"
        >
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900 dark:border-t-slate-800" />
        </div>
      )}
    </div>
  );
};
