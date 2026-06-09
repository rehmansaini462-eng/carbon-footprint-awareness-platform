import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/core/supabaseClient";

// Typed input schema for request body validation
interface CarbonLogPayload {
  user_id: string;
  category: "Transport" | "Energy" | "Food";
  metrics_json: Record<string, unknown>;
  calculated_co2_kg: number;
}

// Regex to validate UUID format
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * POST /api/logs
 * Secure route handler to log carbon emissions.
 */
export async function POST(request: Request) {
  try {
    // 1. Check content type
    const contentType = request.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return NextResponse.json(
        { error: "Invalid content-type. Expected application/json." },
        { status: 400 }
      );
    }

    // 2. Parse request payload
    let body: Partial<CarbonLogPayload>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Malformed JSON payload in request body." },
        { status: 400 }
      );
    }

    const { user_id, category, metrics_json, calculated_co2_kg } = body;

    // 3. Strict Input Validation
    if (!user_id || typeof user_id !== "string" || !UUID_REGEX.test(user_id)) {
      return NextResponse.json(
        { error: "Invalid request. 'user_id' must be a valid UUID format." },
        { status: 400 }
      );
    }

    const validCategories = ["Transport", "Energy", "Food"];
    if (!category || !validCategories.includes(category)) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${validCategories.join(", ")}.` },
        { status: 400 }
      );
    }

    if (!metrics_json || typeof metrics_json !== "object" || Array.isArray(metrics_json)) {
      return NextResponse.json(
        { error: "Invalid metrics. 'metrics_json' must be a non-array JSON object." },
        { status: 400 }
      );
    }

    if (
      calculated_co2_kg === undefined ||
      typeof calculated_co2_kg !== "number" ||
      isNaN(calculated_co2_kg) ||
      calculated_co2_kg < 0
    ) {
      return NextResponse.json(
        { error: "Invalid calculation. 'calculated_co2_kg' must be a non-negative number." },
        { status: 400 }
      );
    }

    // 4. Secure DB Operations via backend supabase client
    const { data, error } = await supabaseAdmin
      .from("carbon_logs")
      .insert({
        user_id,
        category,
        metrics_json,
        calculated_co2_kg,
      })
      .select()
      .single();

    if (error) {
      // Log error internally for debugging but do not expose details to the user client
      console.error("[DATABASE_ERROR] Failed to insert carbon log:", error.message);
      return NextResponse.json(
        { error: "An internal database error occurred while saving the log." },
        { status: 500 }
      );
    }

    // 5. Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Carbon log saved successfully.",
        log_id: data.id,
      },
      { status: 201 }
    );
  } catch (err) {
    // Obfuscate internal stack traces to protect system mechanics
    console.error("[SERVER_UNHANDLED_ERROR] Unhandled exception occurred in route /api/logs:", err);
    return NextResponse.json(
      { error: "A server error occurred. Please try again later." },
      { status: 500 }
    );
  }
}
