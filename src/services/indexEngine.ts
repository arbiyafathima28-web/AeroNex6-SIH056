import { FareObservation, RouteIndexSummary, DailyIndexPoint, AdvanceWindow } from '../types';
import { ROUTES, ROUTE_MAP } from '../constants/routes';
import { AIRLINES } from '../constants/airlines';

export interface CalculatedIndexResults {
  currentAirfareIndex: number;
  change24h: number;
  change7d: number;
  change30d: number;
  dailyIndexHistory: DailyIndexPoint[];
  routeSummaries: RouteIndexSummary[];
  topRisingRoutes: RouteIndexSummary[];
  topFallingRoutes: RouteIndexSummary[];
  leadTimeAverages: { window: AdvanceWindow; days: number; avgFare: number; baseFare: number; taxes: number }[];
  airlineSummaries: { code: string; name: string; avgFare: number; index: number; count: number; color: string }[];
  totalRecordsCount: number;
  activeRoutesCount: number;
}

export function calculateAirfareIndices(cleanRecords: FareObservation[]): CalculatedIndexResults {
  if (cleanRecords.length === 0) {
    return {
      currentAirfareIndex: 100.0,
      change24h: 0,
      change7d: 0,
      change30d: 0,
      dailyIndexHistory: [],
      routeSummaries: [],
      topRisingRoutes: [],
      topFallingRoutes: [],
      leadTimeAverages: [],
      airlineSummaries: [],
      totalRecordsCount: 0,
      activeRoutesCount: 0,
    };
  }

  // Group by date
  const recordsByDate = new Map<string, FareObservation[]>();
  for (const rec of cleanRecords) {
    if (!recordsByDate.has(rec.date)) {
      recordsByDate.set(rec.date, []);
    }
    recordsByDate.get(rec.date)!.push(rec);
  }

  const sortedDates = Array.from(recordsByDate.keys()).sort();
  const latestDate = sortedDates[sortedDates.length - 1];
  const prevDate = sortedDates[Math.max(0, sortedDates.length - 2)];
  const date7d = sortedDates[Math.max(0, sortedDates.length - 8)];
  const date30d = sortedDates[Math.max(0, sortedDates.length - 31)];

  // Helper to compute overall weighted index for a given date
  const computeIndexForDate = (date: string): { index: number; avgTotal: number; avgBase: number; avgTaxes: number; count: number } => {
    const dayRecords = recordsByDate.get(date) || [];
    if (dayRecords.length === 0) {
      return { index: 100, avgTotal: 0, avgBase: 0, avgTaxes: 0, count: 0 };
    }

    // Average fare per route for this day
    const routeSums = new Map<string, { totalSum: number; count: number }>();
    let totalFareSum = 0;
    let baseFareSum = 0;
    let taxesSum = 0;

    for (const r of dayRecords) {
      totalFareSum += r.totalFare;
      baseFareSum += r.baseFare;
      taxesSum += r.taxes + r.fees;

      if (!routeSums.has(r.route)) {
        routeSums.set(r.route, { totalSum: 0, count: 0 });
      }
      const entry = routeSums.get(r.route)!;
      entry.totalSum += r.totalFare;
      entry.count += 1;
    }

    let weightedIndexNumerator = 0;
    let totalWeight = 0;

    for (const routeDef of ROUTES) {
      const routeData = routeSums.get(routeDef.id);
      if (routeData && routeData.count > 0) {
        const pCurrent = routeData.totalSum / routeData.count;
        const pBase = routeDef.basePrice * 1.15; // base price benchmark incl taxes
        const relativePrice = (pCurrent / pBase) * 100;
        
        weightedIndexNumerator += relativePrice * routeDef.dgcaWeight;
        totalWeight += routeDef.dgcaWeight;
      }
    }

    const index = totalWeight > 0 ? Number((weightedIndexNumerator / totalWeight).toFixed(1)) : 100.0;

    return {
      index,
      avgTotal: Math.round(totalFareSum / (dayRecords.length || 1)),
      avgBase: Math.round(baseFareSum / (dayRecords.length || 1)),
      avgTaxes: Math.round(taxesSum / (dayRecords.length || 1)),
      count: dayRecords.length,
    };
  };

  // Build daily historical series
  const dailyIndexHistory: DailyIndexPoint[] = sortedDates.map(date => {
    const res = computeIndexForDate(date);
    return {
      date,
      index: res.index,
      avgTotalFare: res.avgTotal,
      avgBaseFare: res.avgBase,
      avgTaxes: res.avgTaxes,
      recordCount: res.count,
      anomalyDetected: res.index > 132 || res.index < 115,
    };
  });

  const currentIndexResult = computeIndexForDate(latestDate);
  const prevIndexResult = computeIndexForDate(prevDate);
  const index7dResult = computeIndexForDate(date7d);
  const index30dResult = computeIndexForDate(date30d);

  const change24h = Number((currentIndexResult.index - prevIndexResult.index).toFixed(1));
  const change7d = Number((currentIndexResult.index - index7dResult.index).toFixed(1));
  const change30d = Number((currentIndexResult.index - index30dResult.index).toFixed(1));

  // Compute per-route summaries on recent data (last 7 days)
  const recentRecords = cleanRecords.filter(r => {
    const diff = (new Date(latestDate).getTime() - new Date(r.date).getTime()) / (1000 * 3600 * 24);
    return diff <= 7;
  });

  const routeSummaries: RouteIndexSummary[] = ROUTES.map(routeDef => {
    const routeRecent = recentRecords.filter(r => r.route === routeDef.id);
    const latestRoute = routeRecent.filter(r => r.date === latestDate);
    const prevRoute = routeRecent.filter(r => r.date === prevDate);
    const r7d = cleanRecords.filter(r => r.route === routeDef.id && r.date === date7d);
    const r30d = cleanRecords.filter(r => r.route === routeDef.id && r.date === date30d);

    const avgCurrent = latestRoute.length > 0 
      ? latestRoute.reduce((acc, r) => acc + r.totalFare, 0) / latestRoute.length 
      : (routeRecent.length > 0 ? routeRecent.reduce((acc, r) => acc + r.totalFare, 0) / routeRecent.length : routeDef.basePrice * 1.15);

    const avgPrev = prevRoute.length > 0
      ? prevRoute.reduce((acc, r) => acc + r.totalFare, 0) / prevRoute.length
      : avgCurrent * 0.98;

    const avg7d = r7d.length > 0
      ? r7d.reduce((acc, r) => acc + r.totalFare, 0) / r7d.length
      : avgCurrent * 0.97;

    const avg30d = r30d.length > 0
      ? r30d.reduce((acc, r) => acc + r.totalFare, 0) / r30d.length
      : avgCurrent * 0.95;

    const baseBenchmark = routeDef.basePrice * 1.15;
    const currentIndex = Number(((avgCurrent / baseBenchmark) * 100).toFixed(1));
    const prevIndex = Number(((avgPrev / baseBenchmark) * 100).toFixed(1));
    const index7d = Number(((avg7d / baseBenchmark) * 100).toFixed(1));
    const index30d = Number(((avg30d / baseBenchmark) * 100).toFixed(1));

    return {
      route: routeDef.id,
      origin: routeDef.origin,
      destination: routeDef.destination,
      weight: routeDef.dgcaWeight,
      currentAvgFare: Math.round(avgCurrent),
      baseAvgFare: Math.round(baseBenchmark),
      currentIndex,
      change24h: Number((currentIndex - prevIndex).toFixed(1)),
      change7d: Number((currentIndex - index7d).toFixed(1)),
      change30d: Number((currentIndex - index30d).toFixed(1)),
      recordCount: routeRecent.length,
      distanceKm: routeDef.distanceKm,
    };
  });

  // Top rising and falling by 24h / 7d change
  const sortedByRising = [...routeSummaries].sort((a, b) => b.change24h - a.change24h);
  const topRisingRoutes = sortedByRising.slice(0, 5);
  const topFallingRoutes = [...sortedByRising].reverse().slice(0, 5);

  // Lead time breakdown on recent records
  const leadWindows: { window: AdvanceWindow; days: number }[] = [
    { window: 'T+1', days: 1 },
    { window: 'T+7', days: 7 },
    { window: 'T+15', days: 15 },
    { window: 'T+30', days: 30 },
    { window: 'T+45', days: 45 },
  ];

  const leadTimeAverages = leadWindows.map(lw => {
    const matching = recentRecords.filter(r => r.advanceWindow === lw.window);
    const count = matching.length || 1;
    const avgFare = Math.round(matching.reduce((acc, r) => acc + r.totalFare, 0) / count);
    const baseFare = Math.round(matching.reduce((acc, r) => acc + r.baseFare, 0) / count);
    const taxes = Math.round(matching.reduce((acc, r) => acc + (r.taxes + r.fees), 0) / count);

    return {
      window: lw.window,
      days: lw.days,
      avgFare: avgFare || 6500,
      baseFare: baseFare || 5600,
      taxes: taxes || 900,
    };
  });

  // Airline breakdown
  const airlineSummaries = Object.values(AIRLINES).map(airline => {
    const carrierRecords = recentRecords.filter(r => r.airlineCode === airline.code);
    const count = carrierRecords.length;
    const avgFare = count > 0 
      ? Math.round(carrierRecords.reduce((acc, r) => acc + r.totalFare, 0) / count)
      : 5200;
    
    // Carrier relative index compared to overall base average
    const index = Number(((avgFare / 4800) * 100).toFixed(1));

    return {
      code: airline.code,
      name: airline.name,
      avgFare,
      index,
      count,
      color: airline.color,
    };
  });

  return {
    currentAirfareIndex: currentIndexResult.index,
    change24h,
    change7d,
    change30d,
    dailyIndexHistory,
    routeSummaries,
    topRisingRoutes,
    topFallingRoutes,
    leadTimeAverages,
    airlineSummaries,
    totalRecordsCount: cleanRecords.length,
    activeRoutesCount: ROUTES.length,
  };
}
