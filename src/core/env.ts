/**
 * Strict Environment Variable Validator & Wrapper
 * Ensures critical environment variables exist at runtime.
 * Throws clean, descriptive errors immediately to prevent invalid execution.
 */

export const env = {
  get NEXT_PUBLIC_SUPABASE_URL(): string {
    const value = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!value) {
      throw new Error(
        "CRITICAL ERROR: Environment variable 'NEXT_PUBLIC_SUPABASE_URL' is missing. " +
        "Please check your environment configuration."
      );
    }
    return value;
  },

  get SUPABASE_SERVICE_ROLE_KEY(): string {
    const value = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!value) {
      throw new Error(
        "CRITICAL ERROR: Environment variable 'SUPABASE_SERVICE_ROLE_KEY' is missing. " +
        "Please check your environment configuration."
      );
    }
    return value;
  },

  get GEMINI_API_KEY(): string {
    const value = process.env.GEMINI_API_KEY;
    if (!value) {
      throw new Error(
        "CRITICAL ERROR: Environment variable 'GEMINI_API_KEY' is missing. " +
        "Please check your environment configuration."
      );
    }
    return value;
  },
};
