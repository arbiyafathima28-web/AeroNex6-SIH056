export type AdvanceWindow = 'T+1' | 'T+7' | 'T+15' | 'T+30' | 'T+45';

export type AirlineCode = '6E' | 'AI' | 'IX' | 'QP' | 'SG';

export interface AirlineInfo {
  code: AirlineCode;
  name: string;
  nameHi: string;
  type: 'LCC' | 'FSC';
  color: string;
}

export interface Airport {
  code: string;
  name: string;
  nameHi: string;
  city: string;
  cityHi: string;
  state: string;
  lat: number;
  lng: number;
  tier: 1 | 2;
}

export interface RouteDefinition {
  id: string; // e.g., "DEL-BOM"
  origin: string;
  destination: string;
  distanceKm: number;
  dgcaWeight: number; // percentage weight in basket (e.g. 12.5)
  basePrice: number; // base reference price in INR
}

export type QualityStatus = 'VALID' | 'DUPLICATE_FLAGGED' | 'OUTLIER_FLAGGED' | 'INCOMPLETE_FLAGGED';

export type DataSourceType = 'DEMO_CONNECTOR' | 'AUTHORIZED_API' | 'REFERENCE_DGCA' | 'PLANNED_OTA';

export interface FareObservation {
  id: string;
  date: string; // YYYY-MM-DD
  origin: string;
  destination: string;
  route: string;
  airline: string;
  airlineCode: AirlineCode;
  advanceWindow: AdvanceWindow;
  advanceDays: number;
  baseFare: number;
  taxes: number;
  fees: number;
  totalFare: number;
  currency: 'INR';
  source: string;
  sourceType: DataSourceType;
  availabilityStatus: 'AVAILABLE' | 'FEW_SEATS' | 'SOLD_OUT';
  collectionTimestamp: string;
  qualityStatus: QualityStatus;
  anomalyReason?: string;
}

export interface RouteIndexSummary {
  route: string;
  origin: string;
  destination: string;
  weight: number;
  currentAvgFare: number;
  baseAvgFare: number;
  currentIndex: number;
  change24h: number;
  change7d: number;
  change30d: number;
  recordCount: number;
  distanceKm: number;
}

export interface DailyIndexPoint {
  date: string;
  index: number;
  avgTotalFare: number;
  avgBaseFare: number;
  avgTaxes: number;
  recordCount: number;
  anomalyDetected?: boolean;
}

export interface PipelineStats {
  rawRecords: number;
  validRecords: number;
  duplicatesRemoved: number;
  unusualFaresFlagged: number;
  standardizedRecords: number;
  qualityScore: number;
  completeness: number;
  validity: number;
  freshness: number;
  duplicateRate: number;
  unusualFareRate: number;
  lastProcessedAt: string;
  processingTimeMs: number;
}

export interface CpiImpactSimulation {
  fareScenarioPercent: number; // e.g., -20, -10, -5, 0, 5, 10, 20
  currentAirfareIndex: number;
  simulatedAirfareIndex: number;
  transportBasketWeightPercent: number; // 0.28%
  illustrativeTransportImpact: number;
  illustrativeCpiContribution: number;
  baselineCpi: number; // 184.2 (reference All India Consumer Price Index)
  simulatedCpi: number;
}

export type ActiveView = 
  | 'dashboard'
  | 'network'
  | 'route-analytics'
  | 'airfare-index'
  | 'data-quality'
  | 'cpi-impact'
  | 'data-explorer'
  | 'methodology'
  | 'system-health';

export interface AirfarePriceSpike {
  id: string;
  route: string;
  origin: string;
  destination: string;
  changePercent: number;
  currentAvgFare: number;
  baseAvgFare: number;
  timeHorizon: '24h' | '7d' | 'batch';
  timestamp: string;
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE';
}

