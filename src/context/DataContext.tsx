import React, { createContext, useContext, useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { FareObservation, ActiveView, RouteIndexSummary, AirfarePriceSpike } from '../types';
import { generateSyntheticObservations, generateNewBatchObservations } from '../services/dataGenerator';
import { runPipeline, ProcessedPipelineResult } from '../services/pipelineEngine';
import { calculateAirfareIndices, CalculatedIndexResults } from '../services/indexEngine';
import { ROUTES } from '../constants/routes';
import { useToast } from './ToastContext';

export type SimulationStage = 
  | 'IDLE' 
  | 'COLLECTING' 
  | 'VALIDATING' 
  | 'CLEANING' 
  | 'STANDARDIZING' 
  | 'INDEXING' 
  | 'PUBLISHED'
  | 'COMPLETED';

export interface SimulationProgress {
  stage: SimulationStage;
  recordsReceived: number;
  recordsValidated: number;
  duplicatesRemoved: number;
  unusualFaresDetected: number;
  standardized: number;
  newIndex: number;
}

interface DataContextType {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  selectedRouteId: string;
  setSelectedRouteId: (routeId: string) => void;
  allRecords: FareObservation[];
  cleanRecords: FareObservation[];
  pipelineResult: ProcessedPipelineResult;
  indexResults: CalculatedIndexResults;
  isSimulating: boolean;
  simulationProgress: SimulationProgress;
  isSimulationModalOpen: boolean;
  triggerSimulateNewCollection: () => Promise<void>;
  closeSimulationModal: () => void;
  navigateToRoute: (routeId: string) => void;

  // Real-time Airfare Price Spike Monitoring & Toast Alert Feature
  spikeThresholdPercent: number;
  setSpikeThresholdPercent: (threshold: number) => void;
  detectedSpikes: AirfarePriceSpike[];
  broadcastSpikeAlerts: (customSpikes?: AirfarePriceSpike[]) => void;
  simulatePriceShock: (targetRouteId?: string, surgePercent?: number) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [selectedRouteId, setSelectedRouteId] = useState<string>('DEL-BOM');

  // Initialize master dataset with 45-day realistic observations
  const [masterRecords, setMasterRecords] = useState<FareObservation[]>(() => {
    return generateSyntheticObservations(45);
  });

  // Run pipeline processing
  const pipelineResult = useMemo(() => {
    return runPipeline(masterRecords);
  }, [masterRecords]);

  // Run statistical index calculations
  const indexResults = useMemo(() => {
    return calculateAirfareIndices(pipelineResult.standardizedCleanRecords);
  }, [pipelineResult.standardizedCleanRecords]);

  // Simulation pipeline state
  const [isSimulating, setIsSimulating] = useState(false);
  const [isSimulationModalOpen, setIsSimulationModalOpen] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState<SimulationProgress>({
    stage: 'IDLE',
    recordsReceived: 0,
    recordsValidated: 0,
    duplicatesRemoved: 0,
    unusualFaresDetected: 0,
    standardized: 0,
    newIndex: 128.6,
  });

  const navigateToRoute = useCallback((routeId: string) => {
    setSelectedRouteId(routeId);
    setActiveView('route-analytics');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const { addToast } = useToast();

  // Price Spike Threshold (defaults to 10% as requested)
  const [spikeThresholdPercent, setSpikeThresholdPercent] = useState<number>(10);

  // Monitor routes & indices for significant price spikes (> threshold, default 10%)
  const detectedSpikes = useMemo<AirfarePriceSpike[]>(() => {
    const spikes: AirfarePriceSpike[] = [];
    for (const r of indexResults.routeSummaries) {
      const isSpike24h = r.change24h >= spikeThresholdPercent;
      const isSpike7d = r.change7d >= spikeThresholdPercent;
      if (isSpike24h || isSpike7d) {
        const change = isSpike24h ? r.change24h : r.change7d;
        const horizon: '24h' | '7d' = isSpike24h ? '24h' : '7d';
        spikes.push({
          id: `spike-${r.route}-${horizon}`,
          route: r.route,
          origin: r.origin,
          destination: r.destination,
          changePercent: change,
          currentAvgFare: r.currentAvgFare,
          baseAvgFare: r.baseAvgFare,
          timeHorizon: horizon,
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          severity: change >= 20 ? 'CRITICAL' : change >= 14 ? 'HIGH' : 'MODERATE',
        });
      }
    }
    return spikes.sort((a, b) => b.changePercent - a.changePercent);
  }, [indexResults.routeSummaries, spikeThresholdPercent]);

  // Alert user using the Toast system when price spikes are flagged or queried
  const broadcastSpikeAlerts = useCallback((customSpikes?: AirfarePriceSpike[]) => {
    const targetSpikes = customSpikes || detectedSpikes;
    if (targetSpikes.length === 0) {
      addToast(
        'Airfare Volatility Normal',
        `All 42 monitored domestic sectors are operating within the ±${spikeThresholdPercent}% threshold.`,
        'info',
        3500
      );
      return;
    }

    // Alert top spiked routes via Toast
    targetSpikes.slice(0, 3).forEach((spike, idx) => {
      setTimeout(() => {
        addToast(
          `🚨 Price Spike Alert: ${spike.route} (+${spike.changePercent}%)`,
          `Average fare surged to ₹${spike.currentAvgFare.toLocaleString('en-IN')} (+${spike.changePercent}% in ${spike.timeHorizon}). Exceeds ${spikeThresholdPercent}% threshold. Anomaly flagged for CPI review.`,
          spike.severity === 'CRITICAL' ? 'error' : 'warning',
          6500
        );
      }, idx * 400);
    });
  }, [addToast, detectedSpikes, spikeThresholdPercent]);

  // Simulate an instant route shock to test the spike detection and toast alert system
  const simulatePriceShock = useCallback((targetRouteId: string = 'DEL-BOM', surgePercent: number = 15.5) => {
    const sortedDates = Array.from(new Set(masterRecords.map(r => r.date))).sort();
    const latestDate = sortedDates[sortedDates.length - 1];

    const targetRouteDef = ROUTES.find(r => r.id === targetRouteId);
    const routeLabel = targetRouteDef ? `${targetRouteDef.origin} → ${targetRouteDef.destination}` : targetRouteId;

    const updated = masterRecords.map(rec => {
      if (rec.route === targetRouteId && rec.date === latestDate) {
        const multiplier = 1 + (surgePercent / 100);
        return {
          ...rec,
          baseFare: Math.round(rec.baseFare * multiplier),
          totalFare: Math.round(rec.totalFare * multiplier),
        };
      }
      return rec;
    });

    setMasterRecords(updated);

    addToast(
      `🚨 Significant Price Spike: ${targetRouteId} (+${surgePercent}%)`,
      `Injected high-demand spot surge on ${routeLabel}. Route average fare jumped +${surgePercent}%, triggering the automated volatility alert (>10%).`,
      'warning',
      6500
    );
  }, [masterRecords, addToast]);


  const isSimulatingRef = useRef(false);

  const triggerSimulateNewCollection = useCallback(async () => {
    if (isSimulatingRef.current) return;
    isSimulatingRef.current = true;
    setIsSimulationModalOpen(true);
    setIsSimulating(true);

    try {
      const batch = generateNewBatchObservations(320);

      addToast(
        'Automated Ingestion Started',
        `Dispatching connectors across 42 domestic routes (${batch.length} records)...`,
        'info',
        3000
      );

      // Step 1: COLLECTING
      setSimulationProgress({
        stage: 'COLLECTING',
        recordsReceived: batch.length,
        recordsValidated: 0,
        duplicatesRemoved: 0,
        unusualFaresDetected: 0,
        standardized: 0,
        newIndex: indexResults.currentAirfareIndex,
      });
      await new Promise(r => setTimeout(r, 650));

      // Step 2: VALIDATING
      setSimulationProgress(prev => ({
        ...prev,
        stage: 'VALIDATING',
        recordsValidated: Math.round(batch.length * 0.98),
      }));
      await new Promise(r => setTimeout(r, 600));

      // Step 3: CLEANING (Deduplication & Unusual fare detection)
      const dups = batch.filter(r => r.qualityStatus === 'DUPLICATE_FLAGGED').length;
      const outliers = batch.filter(r => r.qualityStatus === 'OUTLIER_FLAGGED').length;
      
      addToast(
        'Data Quality Scrubbing',
        `Purged ${dups || 12} duplicates & quarantined ${outliers || 6} unusual fares via IQR boundaries.`,
        'warning',
        3500
      );

      setSimulationProgress(prev => ({
        ...prev,
        stage: 'CLEANING',
        duplicatesRemoved: dups || 12,
        unusualFaresDetected: outliers || 6,
      }));
      await new Promise(r => setTimeout(r, 600));

      // Step 4: STANDARDIZING
      const cleanBatchCount = batch.length - dups - outliers;
      setSimulationProgress(prev => ({
        ...prev,
        stage: 'STANDARDIZING',
        standardized: cleanBatchCount,
      }));
      await new Promise(r => setTimeout(r, 600));

      // Step 5: INDEXING
      // Calculate updated dataset and new index
      const updatedMaster = [...masterRecords, ...batch];
      const newPipeline = runPipeline(updatedMaster);
      const newIndexCalc = calculateAirfareIndices(newPipeline.standardizedCleanRecords);

      setSimulationProgress(prev => ({
        ...prev,
        stage: 'INDEXING',
        newIndex: newIndexCalc.currentAirfareIndex,
      }));
      await new Promise(r => setTimeout(r, 600));

      // Step 6: PUBLISHED (Publication to application store)
      // Transitions Published to Engine stage to Running
      setSimulationProgress(prev => ({
        ...prev,
        stage: 'PUBLISHED',
      }));
      await new Promise(r => setTimeout(r, 500));

      // Commit processed records to application store (prototype state)
      // Immediately updates dashboard dataset, Airfare Index, Data Quality,
      // Route Analytics, Data Explorer, System Health metrics, and lastProcessedAt.
      setMasterRecords(updatedMaster);

      // Transition Published to Engine: Running -> Done
      setSimulationProgress(prev => ({
        ...prev,
        stage: 'COMPLETED',
      }));

      addToast(
        'Collection Completed',
        `Collection completed successfully. Recalculated Laspeyres Index to ${newIndexCalc.currentAirfareIndex} pts (${newIndexCalc.change24h >= 0 ? '+' : ''}${newIndexCalc.change24h}%). Committed ${cleanBatchCount} standardized observations.`,
        'success',
        5000
      );

      // Check if new batch created price spikes
      const batchSpikes = newIndexCalc.routeSummaries.filter(r => r.change24h >= spikeThresholdPercent);
      if (batchSpikes.length > 0) {
        setTimeout(() => {
          const topSpike = batchSpikes[0];
          addToast(
            `🚨 Ingestion Price Spike: ${topSpike.route} (+${topSpike.change24h}%)`,
            `Fresh batch triggered a +${topSpike.change24h}% jump on ${topSpike.origin} → ${topSpike.destination} (₹${topSpike.currentAvgFare.toLocaleString('en-IN')}). Breaches ${spikeThresholdPercent}% threshold.`,
            'warning',
            6500
          );
        }, 700);
      }
    } finally {
      setIsSimulating(false);
      isSimulatingRef.current = false;
    }
  }, [addToast, indexResults.currentAirfareIndex, masterRecords, spikeThresholdPercent]);

  const closeSimulationModal = useCallback(() => {
    setIsSimulationModalOpen(false);
  }, []);

  return (
    <DataContext.Provider
      value={{
        activeView,
        setActiveView,
        selectedRouteId,
        setSelectedRouteId,
        allRecords: pipelineResult.allRecords,
        cleanRecords: pipelineResult.standardizedCleanRecords,
        pipelineResult,
        indexResults,
        isSimulating,
        simulationProgress,
        isSimulationModalOpen,
        triggerSimulateNewCollection,
        closeSimulationModal,
        navigateToRoute,
        spikeThresholdPercent,
        setSpikeThresholdPercent,
        detectedSpikes,
        broadcastSpikeAlerts,
        simulatePriceShock,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

