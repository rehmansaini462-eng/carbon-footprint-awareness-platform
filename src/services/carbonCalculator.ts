/**
 * Carbon Footprint Calculation Engine
 * Contains strongly-typed mathematical utility configurations to compute precise CO2 emissions.
 */

export type CarbonCategory = "Transport" | "Energy" | "Food";

export const CARBON_COEFFICIENTS: Record<CarbonCategory, Record<string, number>> = {
  Transport: {
    diesel_car: 0.17,      // kg CO2 per km
    petrol_car: 0.16,      // kg CO2 per km
    ev: 0.05,              // kg CO2 per km
    public_transit: 0.03,  // kg CO2 per km
  },
  Energy: {
    electricity: 0.82,     // kg CO2 per kWh
  },
  Food: {
    meat_heavy: 7.2,       // kg CO2 per day
    vegetarian: 3.8,       // kg CO2 per day
    vegan: 2.9,            // kg CO2 per day
  },
};

/**
 * Calculates emissions in kilograms of CO2 (CO2-kg)
 * @param category The high-level category of emissions
 * @param type The specific type of emitter under the category
 * @param value The raw input metric value (e.g. km, kWh, days)
 * @returns Precise calculated emission value rounded to two decimal places
 */
export function calculateEmission(category: CarbonCategory, type: string, value: number): number {
  // Defensive check for negative numbers or zero
  if (value <= 0) {
    return 0;
  }

  const coefficients = CARBON_COEFFICIENTS[category];
  if (!coefficients) {
    throw new Error(`Invalid carbon category: ${category}`);
  }

  const factor = coefficients[type];
  if (factor === undefined) {
    throw new Error(`Invalid type '${type}' specified for category '${category}'`);
  }

  const emission = value * factor;

  // Round precisely to 2 decimal places to avoid floating point issues
  return Math.round((emission + Number.EPSILON) * 100) / 100;
}
