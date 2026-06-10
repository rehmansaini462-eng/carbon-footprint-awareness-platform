import { calculateEmission, CarbonCategory } from "../services/carbonCalculator";

describe("Carbon Footprint Calculation Engine", () => {
  // 1. Valid Input Tests
  describe("Valid Input Checks", () => {
    test("Petrol Car emissions: 10km in petrol_car should calculate precisely to 1.6kg of CO2", () => {
      const result = calculateEmission("Transport", "petrol_car", 10);
      expect(result).toBe(1.6);
    });

    test("Diesel Car emissions: 50km in diesel_car should calculate to 8.5kg of CO2", () => {
      const result = calculateEmission("Transport", "diesel_car", 50);
      expect(result).toBe(8.5);
    });

    test("EV emissions: 100km in ev should calculate to 5.0kg of CO2", () => {
      const result = calculateEmission("Transport", "ev", 100);
      expect(result).toBe(5.0);
    });

    test("Electricity emissions: 10kWh should calculate to 8.2kg of CO2", () => {
      const result = calculateEmission("Energy", "electricity", 10);
      expect(result).toBe(8.2);
    });

    test("Heavy Meat Diet emissions: 5 days should calculate to 36.0kg of CO2", () => {
      const result = calculateEmission("Food", "meat_heavy", 5);
      expect(result).toBe(36.0);
    });
  });

  // 2. Boundary and Edge Case Tests
  describe("Boundary Limits & Fallback Evaluations", () => {
    test("Zero value input should return exactly 0 CO2-kg", () => {
      const result = calculateEmission("Transport", "ev", 0);
      expect(result).toBe(0);
    });

    test("Negative value input should return exactly 0 CO2-kg defensively", () => {
      const result = calculateEmission("Energy", "electricity", -120);
      expect(result).toBe(0);
    });

    test("Throw error on invalid carbon category parameter lookup", () => {
      expect(() => {
        calculateEmission("InvalidCategory" as unknown as CarbonCategory, "ev", 10);
      }).toThrow("Invalid carbon category");
    });

    test("Throw error on invalid type identifier parameters lookup", () => {
      expect(() => {
        calculateEmission("Transport", "unknown_vehicle", 10);
      }).toThrow("Invalid type 'unknown_vehicle' specified for category 'Transport'");
    });
  });
});
