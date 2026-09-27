/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { DataProvider, useData } from './context/DataContext';
import { Header } from './components/layout/Header';
import { SimulationModal } from './components/common/SimulationModal';

import { DashboardView } from './components/views/DashboardView';
import { NetworkView } from './components/views/NetworkView';
import { RouteAnalyticsView } from './components/views/RouteAnalyticsView';
import { AirfareIndexView } from './components/views/AirfareIndexView';
import { DataQualityView } from './components/views/DataQualityView';
import { CpiImpactView } from './components/views/CpiImpactView';
import { DataExplorerView } from './components/views/DataExplorerView';
import { MethodologyView } from './components/views/MethodologyView';
import { SystemHealthView } from './components/views/SystemHealthView';

import { ToastProvider } from './context/ToastContext';
import { ToastContainer } from './components/common/ToastContainer';

const AppContent: React.FC = () => {
  const { activeView } = useData();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Primary Sticky Header */}
      <Header />

      {/* Main Viewport Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeView === 'dashboard' && <DashboardView />}
        {activeView === 'network' && <NetworkView />}
        {activeView === 'route-analytics' && <RouteAnalyticsView />}
        {activeView === 'airfare-index' && <AirfareIndexView />}
        {activeView === 'data-quality' && <DataQualityView />}
        {activeView === 'cpi-impact' && <CpiImpactView />}
        {activeView === 'data-explorer' && <DataExplorerView />}
        {activeView === 'methodology' && <MethodologyView />}
        {activeView === 'system-health' && <SystemHealthView />}
      </main>

      {/* Interactive Simulation Modal */}
      <SimulationModal />

      {/* Real-time Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ToastProvider>
          <DataProvider>
            <AppContent />
          </DataProvider>
        </ToastProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
