import { FareObservation, AdvanceWindow, AirlineCode, DataSourceType, QualityStatus } from '../types';
import { ROUTES } from '../constants/routes';
import { AIRLINES } from '../constants/airlines';

const ADVANCE_WINDOWS: { window: AdvanceWindow; days: number; multiplier: number }[] = [
  { window: 'T+1', days: 1, multiplier: 1.85 },
  { window: 'T+7', days: 7, multiplier: 1.32 },
  { window: 'T+15', days: 15, multiplier: 1.08 },
  { window: 'T+30', days: 30, multiplier: 0.95 },
  { window: 'T+45', days: 45, multiplier: 0.88 },
];

const AIRLINE_CODES: AirlineCode[] = ['6E', 'AI', 'IX', 'QP', 'SG'];

// Deterministic pseudo-random helper for consistent seedable generation
function seededRandom(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

export function getAnchorDate(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0));
}

export function generateSyntheticObservations(baseDaysCount: number = 45): FareObservation[] {
  const observations: FareObservation[] = [];
  const today = getAnchorDate();
  
  let recordIdCounter = 10000;
  let globalSeed = 42;

  // Generate 45 days of historical data up to today
  for (let dayOffset = baseDaysCount - 1; dayOffset >= 0; dayOffset--) {
    const observationDate = new Date(today);
    observationDate.setDate(today.getDate() - dayOffset);
    const dateStr = observationDate.toISOString().split('T')[0];
    const dayOfWeek = observationDate.getDay(); // 0 is Sunday, 5 is Friday

    // Weekend demand premium
    const weekendMultiplier = (dayOfWeek === 5 || dayOfWeek === 0) ? 1.12 : (dayOfWeek === 2 || dayOfWeek === 3 ? 0.94 : 1.0);
    
    // Macro trend over 45 days (slight fuel price rise around day 30-35)
    const macroTrend = 1.0 + (dayOffset < 15 ? 0.04 : 0) + (dayOffset >= 10 && dayOffset <= 16 ? 0.08 : 0);

    for (const route of ROUTES) {
      // 3 to 4 airlines operate on each route
      const activeAirlines = AIRLINE_CODES.filter((_, idx) => {
        const rand = seededRandom(globalSeed++);
        // Major trunk routes have all airlines, smaller have 3
        return route.dgcaWeight > 4.0 || (idx % 2 === 0 || rand > 0.3);
      });

      for (const airlineCode of activeAirlines) {
        const airline = AIRLINES[airlineCode];
        const carrierPremium = airline.type === 'FSC' ? 1.18 : 1.0; // Air India full-service vs LCCs

        for (const adv of ADVANCE_WINDOWS) {
          // Occasional missing observation (realistic scraping drop)
          const skipChance = seededRandom(globalSeed++);
          if (skipChance < 0.03 && dayOffset !== 0) {
            continue;
          }

          recordIdCounter++;
          const noise = 0.95 + seededRandom(globalSeed++) * 0.10; // +/- 5% random variations
          // Spot demand surge on key routes (>10% spike calibration)
          const routeSpikeMultiplier = (dayOffset === 0 && (route.id === 'DEL-BOM' || route.id === 'BLR-DEL')) ? 1.138 : 1.0;
          
          let calculatedBase = Math.round(route.basePrice * adv.multiplier * carrierPremium * weekendMultiplier * macroTrend * noise * routeSpikeMultiplier);
          
          let qualityStatus: QualityStatus = 'VALID';
          let anomalyReason: string | undefined;

          // Inject intentional rare anomalies for Data Quality pipeline validation
          const anomalyRoll = seededRandom(globalSeed++);
          if (anomalyRoll < 0.012) {
            // Price spike anomaly or scraping glitch
            if (anomalyRoll < 0.006) {
              calculatedBase = calculatedBase * 4.2; // Massive surge / error
              qualityStatus = 'OUTLIER_FLAGGED';
              anomalyReason = 'Fare exceeded 3.5 IQR route threshold (potential aggregator scraping glitch)';
            } else {
              calculatedBase = 250; // Below minimum operating cost
              qualityStatus = 'OUTLIER_FLAGGED';
              anomalyReason = 'Fare below statutory regulatory minimum fuel-surcharge threshold';
            }
          }

          // Taxes: 5% GST + Airport UDF/PSF
          const taxes = Math.round(calculatedBase * 0.05 + (route.distanceKm > 1000 ? 550 : 380));
          // Convenience & security fee
          const fees = Math.round(350 + (airline.type === 'FSC' ? 120 : 0));
          const totalFare = calculatedBase + taxes + fees;

          const sourceType: DataSourceType = 'DEMO_CONNECTOR';
          const source = `API-AGGREGATOR-${airlineCode}`;

          const observation: FareObservation = {
            id: `OBS-${recordIdCounter}`,
            date: dateStr,
            origin: route.origin,
            destination: route.destination,
            route: route.id,
            airline: airline.name,
            airlineCode: airline.code,
            advanceWindow: adv.window,
            advanceDays: adv.days,
            baseFare: calculatedBase,
            taxes: taxes,
            fees: fees,
            totalFare: totalFare,
            currency: 'INR',
            source: source,
            sourceType: sourceType,
            availabilityStatus: adv.days <= 1 ? 'FEW_SEATS' : 'AVAILABLE',
            collectionTimestamp: `${dateStr}T06:30:00Z`,
            qualityStatus: qualityStatus,
            anomalyReason: anomalyReason,
          };

          observations.push(observation);

          // Inject controlled duplicate (same day, same route, same airline, same advance window)
          if (seededRandom(globalSeed++) < 0.02) {
            recordIdCounter++;
            observations.push({
              ...observation,
              id: `OBS-${recordIdCounter}-DUP`,
              collectionTimestamp: `${dateStr}T06:30:45Z`,
              qualityStatus: 'DUPLICATE_FLAGGED',
              anomalyReason: 'Duplicate observation detected across parallel scraping worker threads',
            });
          }
        }
      }
    }
  }

  return observations;
}

// Generate an incremental fresh batch for "Simulate New Collection"
export function generateNewBatchObservations(batchSize: number = 240): FareObservation[] {
  const today = getAnchorDate();
  const dateStr = today.toISOString().split('T')[0];
  const nowIso = new Date().toISOString();
  const batch: FareObservation[] = [];
  
  let idBase = Date.now() % 100000;

  for (let i = 0; i < batchSize; i++) {
    const route = ROUTES[i % ROUTES.length];
    const airlineCode = AIRLINE_CODES[i % AIRLINE_CODES.length];
    const airline = AIRLINES[airlineCode];
    const adv = ADVANCE_WINDOWS[i % ADVANCE_WINDOWS.length];
    
    // Recent price adjustments (+1.5% to +3% reflecting live intraday shifts)
    const intradayDrift = 1.02 + (Math.sin(i) * 0.04);
    // Spot surge for holiday sectors during live ingestion (>10% spike calibration)
    const routeSpike = route.id === 'BOM-GOI' ? 1.148 : 1.0;
    const calculatedBase = Math.round(route.basePrice * adv.multiplier * (airline.type === 'FSC' ? 1.18 : 1.0) * intradayDrift * routeSpike);
    const taxes = Math.round(calculatedBase * 0.05 + 450);
    const fees = 350;
    const totalFare = calculatedBase + taxes + fees;

    idBase++;
    const isDup = i % 25 === 0;
    const isOutlier = i === 42 || i === 118;

    batch.push({
      id: `OBS-LIVE-${idBase}${isDup ? '-DUP' : ''}`,
      date: dateStr,
      origin: route.origin,
      destination: route.destination,
      route: route.id,
      airline: airline.name,
      airlineCode: airline.code,
      advanceWindow: adv.window,
      advanceDays: adv.days,
      baseFare: isOutlier ? (i === 42 ? 48900 : 190) : calculatedBase,
      taxes: taxes,
      fees: fees,
      totalFare: isOutlier ? (i === 42 ? 52000 : 850) : totalFare,
      currency: 'INR',
      source: `LIVE-CONNECTOR-${airlineCode}`,
      sourceType: 'DEMO_CONNECTOR',
      availabilityStatus: adv.days === 1 ? 'FEW_SEATS' : 'AVAILABLE',
      collectionTimestamp: nowIso,
      qualityStatus: isDup ? 'DUPLICATE_FLAGGED' : (isOutlier ? 'OUTLIER_FLAGGED' : 'VALID'),
      anomalyReason: isDup ? 'Duplicate observation detected' : (isOutlier ? 'Exceeded statistical IQR threshold' : undefined),
    });
  }

  return batch;
}
