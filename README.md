# Agentic Carbon Coach

## 1. Chosen Vertical
- **Ecosystem:** Sustainability & Climate Tech (Carbon Footprint Awareness & Gamified Carbon Accounting Ecosystem).

## 2. Approach and Logic
- **Architecture:** Built using Next.js, Supabase PostgreSQL, and Google Gemini 2.5 Flash API.
- **Processing Core:** Utilizes an asynchronous natural language processing pipeline to ingest raw plain-text user inputs and convert them into structured JSON tokens mapping categories (Travel, Food, Utilities) via targeted Gemini schemas.
- **Calculations Logic:** Computes dynamic CO2 coefficients server-side, matches them to localized targets, hooks rewards directly to a Climate RPG gamification framework (+XP/Streaks), and calculates Virtual Carbon Credit offsets ($1 \text{ credit} = 1000\text{ kg CO}_2 \text{ saved}$).

## 3. How the Solution Works
- **User Flow:** A frictionless 5-second plain-text interface replaces complex forms. Users input everyday activities (e.g., "Took the metro for 15km").
- **Backend Validation:** The payload passes through a serverless route (`/api/logs`) backed by an HTML/script injection sanitizer (`sanitizeInput`) to guarantee zero XSS vulnerabilities.
- **Persistence & Fallbacks:** Data updates Supabase instances with strict type-safety boundaries mapped in `types.ts`. Any module parsing errors or downstream Gemini connection drops are seamlessly handled via lazy runtime proxies, ensuring the interface never crashes and fallbacks default cleanly.

## 4. Assumptions Made
- **Emission Baselines:** Assumes standard global conversion factors for kilograms of CO2 equivalent per unit of travel/consumption activity mapped within the internal calculator configuration.
- **State Dependencies:** Assumes local environment variables (`SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`) map explicitly to active dashboard keys, and validates client-side hydration schemas using active migration steps to clear stale browser `localStorage` variables automatically.
