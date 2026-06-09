import { GoogleGenAI, Type } from "@google/genai";
import { env } from "@/core/env";

const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

export interface MicroChallenge {
  title: string;
  action: string;
  saved_co2_kg: number;
}

export interface CoachInsights {
  eco_score: number; // Score from 0 to 100
  context_summary: string; // Dynamic analysis of logs
  micro_challenges: MicroChallenge[]; // 3 personalized challenges
}

/**
 * Generates tailored sustainability coaching recommendations.
 * @param userLogsHistory Array of user carbon log objects
 * @param currentStreak Current logged in streak count
 */
export async function generateContextualInsights(
  userLogsHistory: { category: string; calculated_co2_kg: number; logged_at: string }[],
  currentStreak: number
): Promise<CoachInsights> {
  const fallbackInsights: CoachInsights = {
    eco_score: 75,
    context_summary: "Great job keeping up your logging streak! Try reducing red meat or opting for public transit when possible to lower your impact.",
    micro_challenges: [
      {
        title: "Green Transit Shift",
        action: "Take public transit, walk, or cycle for one trip today instead of driving.",
        saved_co2_kg: 2.4,
      },
      {
        title: "Energy Watch",
        action: "Unplug standby electronics and wash clothes on a cold cycle.",
        saved_co2_kg: 0.8,
      },
      {
        title: "Meatless Meal",
        action: "Opt for a fully plant-based lunch or dinner.",
        saved_co2_kg: 1.5,
      },
    ],
  };

  try {
    // Generate context summary description from logs
    const historyText = userLogsHistory.length > 0
      ? userLogsHistory.map(log => `- Category: ${log.category}, CO2: ${log.calculated_co2_kg}kg, Date: ${log.logged_at}`).join("\n")
      : "No recent logging activity recorded.";

    const systemInstruction = `
You are an expert AI sustainability coach. Your role is to analyze a user's recent carbon logging history and active logging streak, calculate a dynamic 'eco_score' (from 0 to 100, where 100 means zero emission and high streak engagement), provide a highly specific context summary, and output exactly 3 personalized micro-challenges.

Rules:
1. "eco_score": Compute a realistic score. Adjust it upward for higher logging streaks (currentStreak: ${currentStreak}) and lower average CO2 outputs.
2. "context_summary": Write a motivating, data-backed summary. If Transport is the highest emission category, explicitly state that and address how they can improve.
3. "micro_challenges": Generate EXACTLY 3 challenges. Each challenge must contain:
   - "title": A catchy, action-oriented title.
   - "action": Specific, low-effort action the user can complete today.
   - "saved_co2_kg": A realistic estimate of CO2 saved (as a number in kg) if they perform the action.
   - If the user's transportation carbon is high, at least two challenges must target public transit, carpooling, or walking.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `User logging streak: ${currentStreak} days.\nHistory logs:\n${historyText}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            eco_score: {
              type: Type.NUMBER,
            },
            context_summary: {
              type: Type.STRING,
            },
            micro_challenges: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  action: { type: Type.STRING },
                  saved_co2_kg: { type: Type.NUMBER },
                },
                required: ["title", "action", "saved_co2_kg"],
              },
            },
          },
          required: ["eco_score", "context_summary", "micro_challenges"],
        },
      },
    });

    const responseText = response.text;
    if (!responseText) {
      return fallbackInsights;
    }

    return JSON.parse(responseText.trim()) as CoachInsights;
  } catch (error) {
    console.error("[GEMINI_COACH_ERROR] Failed to generate coaching insights, returning fallbacks.", error);
    return fallbackInsights;
  }
}
