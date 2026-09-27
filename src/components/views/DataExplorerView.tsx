import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { AIRPORT_LIST } from '../../constants/airports';
import { AIRLINE_LIST } from '../../constants/airlines';
import { FareObservation, QualityStatus } from '../../types';
import { 
  Search, 
  Download, 
  FileSpreadsheet, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpDown, 
  Filter, 
  RotateCcw 
} from 'lucide-react';

export const DataExplorerView: React.FC = () => {
  const { allRecords } = useData();
  const { t, language } = useLanguage();
  const { addToast } = useToast();

  // Filter States
  const [search, setSearch] = useState('');
  const [filterOrigin, setFilterOrigin] = useState('ALL');
  const [filterDestination, setFilterDestination] = useState('ALL');
  const [filterAirline, setFilterAirline] = useState('ALL');
  const [filterAdvance, setFilterAdvance] = useState('ALL');
  const [filterQuality, setFilterQuality] = useState('ALL');

  // Sorting State
  const [sortField, setSortField] = useState<keyof FareObservation>('date');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 20;

  // Filter logic
  const filteredRecords = useMemo(() => {
    return allRecords.filter(item => {
      if (search) {
        const q = search.toLowerCase();
        const matches = 
          item.id.toLowerCase().includes(q) ||
          item.route.toLowerCase().includes(q) ||
          item.airline.toLowerCase().includes(q);
        if (!matches) return false;
      }

      if (filterOrigin !== 'ALL' && item.origin !== filterOrigin) return false;
      if (filterDestination !== 'ALL' && item.destination !== filterDestination) return false;
      if (filterAirline !== 'ALL' && item.airlineCode !== filterAirline) return false;
      if (filterAdvance !== 'ALL' && item.advanceWindow !== filterAdvance) return false;
      if (filterQuality !== 'ALL' && item.qualityStatus !== filterQuality) return false;

      return true;
    });
  }, [allRecords, search, filterOrigin, filterDestination, filterAirline, filterAdvance, filterQuality]);

  // Sort logic
  const sortedRecords = useMemo(() => {
    return [...filteredRecords].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA;
      }
      return sortAsc 
        ? String(valA).localeCompare(String(valB)) 
        : String(valB).localeCompare(String(valA));
    });
  }, [filteredRecords, sortField, sortAsc]);

  // Paginated records
  const totalRecords = sortedRecords.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRecords.slice(start, start + pageSize);
  }, [sortedRecords, currentPage, pageSize]);

  const handleSort = (field: keyof FareObservation) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setFilterOrigin('ALL');
    setFilterDestination('ALL');
    setFilterAirline('ALL');
    setFilterAdvance('ALL');
    setFilterQuality('ALL');
    setCurrentPage(1);
  };

  // CSV Export utility
  const exportToCsv = (dataToExport: FareObservation[], filename: string) => {
    const headers = [
      'ID',
      'Date',
      'Route',
      'Origin',
      'Destination',
      'Airline',
      'Advance Window',
      'Advance Days',
      'Base Fare (INR)',
      'Taxes (INR)',
      'Fees (INR)',
      'Total Fare (INR)',
      'Source',
      'Quality Status',
      'Anomaly Reason',
    ];

    const rows = dataToExport.map(r => [
      r.id,
      r.date,
      r.route,
      r.origin,
      r.destination,
      `"${r.airline}"`,
      r.advanceWindow,
      r.advanceDays,
      r.baseFare,
      r.taxes,
      r.fees,
      r.totalFare,
      r.source,
      r.qualityStatus,
      `"${r.anomalyReason || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast(
      language === 'hi' ? 'डेटा निर्यात पूर्ण' : 'Data Export Complete',
      language === 'hi'
        ? `${dataToExport.length.toLocaleString()} रिकॉर्ड सफलतापूर्वक डाउनलोड किए गए (${filename})`
        : `Successfully exported ${dataToExport.length.toLocaleString()} records to ${filename}`,
      'success',
      4000
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-sans">
            {t.explorer.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t.explorer.description}
          </p>
        </div>

        {/* Action Buttons: Download CSV & Export Filtered */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportToCsv(sortedRecords, `aeronex6_filtered_fares_${new Date().toISOString().slice(0, 10)}.csv`)}
            className="px-3 py-1.5 text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.explorer.exportFiltered} ({sortedRecords.length})</span>
          </button>
          <button
            onClick={() => exportToCsv(allRecords, `aeronex6_master_dataset_${new Date().toISOString().slice(0, 10)}.csv`)}
            className="px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>{t.explorer.downloadCsv} (Full)</span>
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-sky-600" />
            <span>Search & Multi-Dimensional Filters</span>
          </span>
          <button
            onClick={handleResetFilters}
            className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{t.common.reset}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
          
          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder={t.explorer.searchPlaceholder}
              className="w-full pl-8 pr-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
            />
          </div>

          {/* Origin Filter */}
          <select
            value={filterOrigin}
            onChange={e => { setFilterOrigin(e.target.value); setCurrentPage(1); }}
            className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="ALL">Origin: All</option>
            {AIRPORT_LIST.map(a => (
              <option key={a.code} value={a.code}>{a.code} - {a.city}</option>
            ))}
          </select>

          {/* Destination Filter */}
          <select
            value={filterDestination}
            onChange={e => { setFilterDestination(e.target.value); setCurrentPage(1); }}
            className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="ALL">Destination: All</option>
            {AIRPORT_LIST.map(a => (
              <option key={a.code} value={a.code}>{a.code} - {a.city}</option>
            ))}
          </select>

          {/* Airline Filter */}
          <select
            value={filterAirline}
            onChange={e => { setFilterAirline(e.target.value); setCurrentPage(1); }}
            className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="ALL">Airline: All</option>
            {AIRLINE_LIST.map(a => (
              <option key={a.code} value={a.code}>{a.name}</option>
            ))}
          </select>

          {/* Advance Window */}
          <select
            value={filterAdvance}
            onChange={e => { setFilterAdvance(e.target.value); setCurrentPage(1); }}
            className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="ALL">Days Before: All</option>
            <option value="T+1">T+1 (1 Day)</option>
            <option value="T+7">T+7 (7 Days)</option>
            <option value="T+15">T+15 (15 Days)</option>
            <option value="T+30">T+30 (30 Days)</option>
            <option value="T+45">T+45 (45 Days)</option>
          </select>

          {/* Quality Status */}
          <select
            value={filterQuality}
            onChange={e => { setFilterQuality(e.target.value); setCurrentPage(1); }}
            className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="ALL">Status: All</option>
            <option value="VALID">VALID (Standardized)</option>
            <option value="OUTLIER_FLAGGED">OUTLIER (Unusual)</option>
            <option value="DUPLICATE_FLAGGED">DUPLICATE</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-medium">
              <tr>
                <th className="py-2.5 px-4 cursor-pointer" onClick={() => handleSort('date')}>
                  <div className="flex items-center gap-1 font-mono">
                    <span>{t.explorer.columns.date}</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-2.5 px-4 cursor-pointer font-mono" onClick={() => handleSort('route')}>
                  <div className="flex items-center gap-1">
                    <span>{t.explorer.columns.route}</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-2.5 px-4">{t.explorer.columns.airline}</th>
                <th className="py-2.5 px-4 font-mono">{t.explorer.columns.advance}</th>
                <th className="py-2.5 px-4 text-right cursor-pointer" onClick={() => handleSort('baseFare')}>
                  <div className="flex items-center justify-end gap-1">
                    <span>{t.explorer.columns.baseFare}</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-2.5 px-4 text-right">{t.explorer.columns.taxes}</th>
                <th className="py-2.5 px-4 text-right">{t.explorer.columns.fees}</th>
                <th className="py-2.5 px-4 text-right cursor-pointer font-bold" onClick={() => handleSort('totalFare')}>
                  <div className="flex items-center justify-end gap-1">
                    <span>{t.explorer.columns.totalFare}</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-2.5 px-4">{t.explorer.columns.source}</th>
                <th className="py-2.5 px-4">{t.explorer.columns.status}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-mono">
              {paginatedRecords.length > 0 ? (
                paginatedRecords.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">{item.date}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-slate-100">{item.route}</td>
                    <td className="py-2.5 px-4 text-slate-700 dark:text-slate-300 font-sans">{item.airline}</td>
                    <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">{item.advanceWindow}</td>
                    <td className="py-2.5 px-4 text-right text-slate-700 dark:text-slate-300 tabular-nums">
                      ₹{item.baseFare.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4 text-right text-slate-500 tabular-nums">
                      ₹{item.taxes.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4 text-right text-slate-500 tabular-nums">
                      ₹{item.fees.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4 text-right font-bold text-sky-600 dark:text-sky-400 tabular-nums">
                      ₹{item.totalFare.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4 text-[11px] text-slate-400 font-mono truncate max-w-[120px]">
                      {item.source}
                    </td>
                    <td className="py-2.5 px-4 text-[11px]">
                      <span className={`inline-block font-mono font-medium ${
                        item.qualityStatus === 'VALID'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : item.qualityStatus === 'OUTLIER_FLAGGED'
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}>
                        {item.qualityStatus}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500 font-sans">
                    {t.explorer.noRecords}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">{Math.min(totalRecords, (currentPage - 1) * pageSize + 1)}</span> -{' '}
            <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">{Math.min(totalRecords, currentPage * pageSize)}</span> of{' '}
            <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">{totalRecords.toLocaleString()}</span> observations
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
