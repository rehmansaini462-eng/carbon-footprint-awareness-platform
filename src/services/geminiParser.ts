import { GoogleGenAI, Type } from "@google/genai";
import { env } from "@/core/env";
import { CarbonCategory, CARBON_COEFFICIENTS } from "./carbonCalculator";

// Initialize the Google Gen AI client with validated credentials
const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

export interface ParsedInput {
  category: CarbonCategory;
  specificType: string;
  value: number;
}

/**
 * Parses user natural language inputs into structured carbon metrics.
 * @param userInput Description of user habit (e.g. "I drove 25km in a petrol car")
 * @returns Structured ParsedInput object containing category, type, and quantity value.
 */
export async function parseNaturalLanguageInput(userInput: string): Promise<ParsedInput> {
  // Construct list of valid specificTypes for Gemini instructions
  const validTypes = Object.entries(CARBON_COEFFICIENTS)
    .map(([category, typesMap]) => {
      const types = Object.keys(typesMap).map(t => `'${t}'`).join(", ");
      return `${category}: [${types}]`;
    })
    .join("; ");

  const systemInstruction = `
You are a strict data extraction assistant. Your job is to extract carbon footprint logging metrics from user text.
You MUST extract three parameters:
1. "category": Must be strictly one of: 'Transport', 'Energy', or 'Food'.
2. "specificType": Must correspond exactly to one of these valid types based on the category:
   ${validTypes}
3. "value": The numerical quantity (e.g. kilometers, kilowatt-hours, number of days, etc.) representing the input size.

Guidelines:
- If the user refers to driving a car, choose Transport category. Match petrol/diesel/ev car types.
- If the user refers to electricity usage, choose Energy.
- If the user refers to eating patterns or diets, choose Food. Match meat_heavy/vegetarian/vegan types.
- If the unit is not explicitly standard, infer the best standard numerical value. (e.g. "three days" = 3).
- If the input does not mention any category or is gibberish, use default placeholder values: category: "Food", specificType: "vegan", value: 0.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-pro",
      contents: userInput,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: {
              type: Type.STRING,
              enum: ["Transport", "Energy", "Food"],
            },
            specificType: {
              type: Type.STRING,
            },
            value: {
              type: Type.NUMBER,
            },
          },
          required: ["category", "specificType", "value"],
        },
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response received from Gemini API");
    }

    const result = JSON.parse(responseText.trim()) as ParsedInput;

    // Validate extracted values against application schemas
    const categoryCoefficients = CARBON_COEFFICIENTS[result.category];
    if (!categoryCoefficients || categoryCoefficients[result.specificType] === undefined) {
      throw new Error(`Invalid type '${result.specificType}' parsed for category '${result.category}'`);
    }

    return result;
  } catch (error) {
    console.error("[GEMINI_PARSER_ERROR] Parsing failed for prompt:", userInput, error);
    // Robust fallback to avoid app crashing, returning zero-impact log
    return {
      category: "Food",
      specificType: "vegan",
      value: 0,
    };
  }
}
