import { CpiImpactSimulation } from '../types';

export const BASELINE_ALL_INDIA_CPI = 184.6; // Baseline reference CPI (MoSPI series)
export const AIR_TRANSPORT_CPI_WEIGHT = 0.28; // Air transport share % in All-India CPI
export const TRANSPORT_GROUP_WEIGHT = 8.59; // Transport & Communication group weight in CPI

export function simulateCpiSensitivity(
  currentIndex: number,
  scenarioPercent: number // e.g. -20, -10, -5, 0, 5, 10, 20
): CpiImpactSimulation {
  const simulatedAirfareIndex = Number((currentIndex * (1 + scenarioPercent / 100)).toFixed(1));
  
  // Change in airfare index in percentage points
  const indexDeltaPercent = scenarioPercent;

  // Impact on Transport Sub-group: (Air share in transport is ~0.28 / 8.59 = ~3.26%)
  const illustrativeTransportImpact = Number(((indexDeltaPercent * (AIR_TRANSPORT_CPI_WEIGHT / TRANSPORT_GROUP_WEIGHT))).toFixed(2));

  // Direct basis point contribution to All-India Headline CPI:
  // e.g., +10% airfare shock * 0.28% weight = +0.028% on headline CPI
  // On an index level of 184.6: 184.6 * (0.028 / 100) = ~ +0.05 index points
  const illustrativeCpiContribution = Number(((indexDeltaPercent * (AIR_TRANSPORT_CPI_WEIGHT / 100) * (BASELINE_ALL_INDIA_CPI / 100))).toFixed(3));

  const simulatedCpi = Number((BASELINE_ALL_INDIA_CPI + illustrativeCpiContribution).toFixed(2));

  return {
    fareScenarioPercent: scenarioPercent,
    currentAirfareIndex: currentIndex,
    simulatedAirfareIndex,
    transportBasketWeightPercent: AIR_TRANSPORT_CPI_WEIGHT,
    illustrativeTransportImpact,
    illustrativeCpiContribution,
    baselineCpi: BASELINE_ALL_INDIA_CPI,
    simulatedCpi,
  };
}
