import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { IndiaAirfareMap } from '../map/IndiaAirfareMap';
import { ArrowUpRight, ArrowDownRight, Search, Plane, ChevronRight } from 'lucide-react';

export const NetworkView: React.FC = () => {
  const { indexResults, navigateToRoute } = useData();
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRoutes = indexResults.routeSummaries.filter(r => 
    r.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.destination.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Page Header */}
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-sans">
          {t.network.title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t.network.description}
        </p>
      </div>

      {/* Main Interactive Map */}
      <div>
        <IndiaAirfareMap heightClass="h-[520px] lg:h-[640px]" showInlineFilters={true} />
      </div>

      {/* Route Network Directory Grid / Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {language === 'hi' ? 'समस्त 42 घरेलू हवाई मार्ग एवं सांख्यिकीय स्थिति' : 'All 42 Monitored Domestic Air Routes & Index Metrics'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'hi' 
                ? 'विस्तृत विश्लेषण के लिए किसी भी रूट पर क्लिक करें' 
                : 'Click any route to navigate directly to granular Route Analytics'}
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t.explorer.searchPlaceholder}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-medium">
              <tr>
                <th className="py-2.5 px-4 font-mono">Route</th>
                <th className="py-2.5 px-4">Distance</th>
                <th className="py-2.5 px-4">DGCA Basket Weight</th>
                <th className="py-2.5 px-4 text-right">Avg Total Fare</th>
                <th className="py-2.5 px-4 text-right">Route Index</th>
                <th className="py-2.5 px-4 text-right">24h Change</th>
                <th className="py-2.5 px-4 text-right">7d Change</th>
                <th className="py-2.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-mono">
              {filteredRoutes.map(item => (
                <tr 
                  key={item.route}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Plane className="w-3 h-3 text-sky-600 dark:text-sky-400 transform -rotate-45" />
                    <span>{item.route}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-sans">
                    {item.distanceKm} km
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div 
                          className="h-full bg-sky-500 rounded-full" 
                          style={{ width: `${Math.min(100, item.weight * 8)}%` }} 
                        />
                      </div>
                      <span className="tabular-nums">{item.weight}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                    ₹{item.currentAvgFare.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-sky-600 dark:text-sky-400 tabular-nums">
                    {item.currentIndex}
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums">
                    <span className={`inline-flex items-center gap-0.5 ${item.change24h >= 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {item.change24h >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {item.change24h >= 0 ? `+${item.change24h}%` : `${item.change24h}%`}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums">
                    <span className={`inline-flex items-center gap-0.5 ${item.change7d >= 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {item.change7d >= 0 ? `+${item.change7d}%` : `${item.change7d}%`}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-sans">
                    <button
                      onClick={() => navigateToRoute(item.route)}
                      className="px-2.5 py-1 text-[11px] font-medium text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-950/50 rounded transition-colors inline-flex items-center gap-1"
                    >
                      <span>Analyze</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
