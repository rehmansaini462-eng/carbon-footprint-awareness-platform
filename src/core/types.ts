/**
 * Shared Type Definitions for Agentic Carbon Coach
 */

export type CarbonCategory = "Transport" | "Energy" | "Food";

export interface UserProfile {
  id: string;
  email: string;
  created_at: string;
  current_streak: number;
  xp: number;
  badges: string[];
}

export interface CarbonLog {
  id?: string;
  user_id?: string;
  category: CarbonCategory;
  specificType: string;
  rawValue: number;
  calculatedCo2Kg: number;
  loggedAt: string;
}

export interface ParsedInput {
  category: CarbonCategory;
  specificType: string;
  value: number;
}

export interface MicroChallenge {
  title: string;
  action: string;
  saved_co2_kg: number;
}

export interface CoachInsights {
  eco_score: number;
  context_summary: string;
  micro_challenges: MicroChallenge[];
}
