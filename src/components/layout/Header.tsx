import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { ActiveView } from '../../types';
import { 
  Sun, 
  Moon, 
  ChevronDown, 
  Menu, 
  X, 
  Plane, 
  RefreshCw, 
  Activity,
  Layers,
  MapPin,
  TrendingUp,
  FileCheck,
  Scale,
  Table,
  BookOpen,
  HeartPulse,
  Bell
} from 'lucide-react';
import { PriceSpikeAlertsPopover } from '../common/PriceSpikeAlertsPopover';

export const Header: React.FC = () => {
  const { 
    activeView, 
    setActiveView, 
    triggerSimulateNewCollection, 
    isSimulating,
    detectedSpikes,
    spikeThresholdPercent
  } = useData();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);

  const mainNavItems: { id: ActiveView; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: t.nav.dashboard, icon: Activity },
    { id: 'network', label: t.nav.network, icon: MapPin },
    { id: 'route-analytics', label: t.nav.routeAnalytics, icon: TrendingUp },
    { id: 'airfare-index', label: t.nav.airfareIndex, icon: Layers },
    { id: 'data-quality', label: t.nav.dataQuality, icon: FileCheck },
    { id: 'cpi-impact', label: t.nav.cpiImpact, icon: Scale },
  ];

  const moreNavItems: { id: ActiveView; label: string; icon: React.ElementType }[] = [
    { id: 'data-explorer', label: t.nav.dataExplorer, icon: Table },
    { id: 'methodology', label: t.nav.methodology, icon: BookOpen },
    { id: 'system-health', label: t.nav.systemHealth, icon: HeartPulse },
  ];

  const isMoreActive = moreNavItems.some(item => item.id === activeView);

  const handleNavClick = (viewId: ActiveView) => {
    setActiveView(viewId);
    setIsMoreOpen(false);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left Side: Mobile Menu Button, Brand and Webpage Navigation Links */}
          <div className="flex items-center gap-3 sm:gap-5 xl:gap-7">
            {/* Mobile Menu Button on Left Side */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-800 transition-colors focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Wordmark / Brand */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => handleNavClick('dashboard')}
                className="flex items-center gap-2 group text-left focus:outline-none"
              >
                <div className="w-8 h-8 rounded-lg bg-sky-600 dark:bg-sky-500 flex items-center justify-center text-white shadow-xs group-hover:bg-sky-700 transition-colors">
                  <Plane className="w-4 h-4 transform -rotate-45" />
                </div>
                <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50 font-sans">
                  AeroNex6
                </span>
              </button>
            </div>

            {/* Webpage Navigation Links placed directly on left side near AeroNex6 */}
            <nav className="hidden lg:flex items-center gap-1">
            {mainNavItems.map(item => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}

            {/* More Menu Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsMoreOpen(!isMoreOpen)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1 transition-colors whitespace-nowrap ${
                  isMoreActive
                    ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <span>{t.nav.more}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {isMoreOpen && (
                <div 
                  className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 py-1 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onMouseLeave={() => setIsMoreOpen(false)}
                >
                  {moreNavItems.map(subItem => {
                    const SubIcon = subItem.icon;
                    return (
                      <button
                        key={subItem.id}
                        onClick={() => handleNavClick(subItem.id)}
                        className={`w-full text-left px-4 py-2 text-xs font-medium flex items-center gap-2.5 transition-colors ${
                          activeView === subItem.id
                            ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <SubIcon className="w-4 h-4 text-slate-400" />
                        <span>{subItem.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Right Side: Actions & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Demo Mode & Operational State (Clean text, no garish pill sandwiches) */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800 pr-3">
              <span className="font-mono text-[11px] font-semibold text-amber-700 dark:text-amber-400 tracking-wider">
                {t.demoMode}
              </span>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="hidden xl:inline">{t.systemStatus}:</span> {t.operational}
              </span>
            </div>

            {/* Price Spike Monitor & Toast Alert Trigger */}
            <div className="relative">
              <button
                onClick={() => setIsAlertsOpen(!isAlertsOpen)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors whitespace-nowrap ${
                  detectedSpikes.length > 0
                    ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 dark:text-amber-300 border-amber-300 dark:border-amber-800 shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
                title={`Airfare price spike monitor (> ${spikeThresholdPercent}%)`}
                aria-label="Airfare price spike alerts"
              >
                <div className="relative">
                  <Bell className={`w-3.5 h-3.5 ${detectedSpikes.length > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}`} />
                  {detectedSpikes.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full" />
                  )}
                </div>
                <span className="hidden sm:inline font-semibold">
                  {detectedSpikes.length > 0 ? `${detectedSpikes.length} Spikes (>10%)` : 'Spike Monitor'}
                </span>
                {detectedSpikes.length > 0 && (
                  <span className="sm:hidden font-bold font-mono text-[10px] text-rose-600 dark:text-rose-400">
                    {detectedSpikes.length}
                  </span>
                )}
              </button>

              <PriceSpikeAlertsPopover
                isOpen={isAlertsOpen}
                onClose={() => setIsAlertsOpen(false)}
              />
            </div>

            {/* Simulate Batch Button */}
            <button
              onClick={() => triggerSimulateNewCollection()}
              disabled={isSimulating}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-sky-50 hover:bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:hover:bg-sky-900/80 dark:text-sky-300 border border-sky-200 dark:border-sky-800/80 rounded-md transition-colors whitespace-nowrap"
              title="Run real-time automated ingestion pipeline on a new batch"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
              <span>{t.simulateCollection}</span>
            </button>

            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md flex items-center gap-1 border border-slate-200 dark:border-slate-800 transition-colors"
                aria-label="Change language"
              >
                <span>{language === 'en' ? 'English' : 'हिन्दी'}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isLangMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-32 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-800 py-1 z-50"
                  onMouseLeave={() => setIsLangMenuOpen(false)}
                >
                  <button
                    onClick={() => { setLanguage('en'); setIsLangMenuOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-medium ${
                      language === 'en' ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-300' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => { setLanguage('hi'); setIsLangMenuOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-medium ${
                      language === 'hi' ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-300' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    हिन्दी
                  </button>
                </div>
              )}
            </div>

            {/* Theme Toggle (☀ / 🌙) */}
            <button
              onClick={toggleTheme}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-800 transition-colors"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="font-mono font-semibold text-amber-700 dark:text-amber-400">{t.demoMode}</span>
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {t.operational}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-1">
            {mainNavItems.map(item => {
              const ItemIcon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md flex items-center gap-3 ${
                    activeView === item.id
                      ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <ItemIcon className="w-4 h-4 text-slate-400" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider px-3">
              {t.nav.more}
            </div>

            {moreNavItems.map(subItem => {
              const SubIcon = subItem.icon;
              return (
                <button
                  key={subItem.id}
                  onClick={() => handleNavClick(subItem.id)}
                  className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md flex items-center gap-3 ${
                    activeView === subItem.id
                      ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <SubIcon className="w-4 h-4 text-slate-400" />
                  <span>{subItem.label}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              triggerSimulateNewCollection();
            }}
            disabled={isSimulating}
            className="w-full mt-2 py-2.5 px-4 text-xs font-medium bg-sky-600 hover:bg-sky-700 text-white rounded-lg flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{t.simulateCollection}</span>
          </button>
        </div>
      )}
    </header>
  );
};
