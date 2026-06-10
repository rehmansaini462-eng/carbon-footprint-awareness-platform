# Agentic Carbon Coach: Carbon Footprint Awareness Platform

An intelligent, next-generation sustainability assistant that helps individuals **Understand**, **Track**, and **Reduce** their daily carbon footprint. 

Built using **Next.js 14+ (App Router)**, **TypeScript**, **Supabase (PostgreSQL)**, and the **Google Gen AI SDK (Gemini 2.5 Flash)**. Optimized for accessibility, performance, and security, with a premium Dark Glassmorphic user interface.

---

## 🚀 Key Features (The Top 50 Edge)

1. **Natural Language Carbon Console**: Instead of filling out complex, static spreadsheets, users describe their habits in plain English (e.g. *"I drove 45 kilometers in my diesel car and ate a vegan lunch today"*).
2. **Real-time Extraction & Calculations**: Gemini 2.5 Flash extracts metrics into a structured schema, which is processed by our verified conversion engine to calculate precise $CO_2$-kg emissions.
3. **Contextual AI Coaching**: Analyzing historical log patterns, the Agentic Coach generates custom daily micro-challenges to help users target their highest emission categories.
4. **Gamified Streaks & XP System**: Encourages daily engagement with XP level milestones, streak multipliers, and unlockable achievement badges (e.g. *Streak Champion*, *Eco Elite*).
5. **A11y Compliant Layout**: Double-A compliant accessibility design with semantic HTML tags, explicit `aria-label` hooks, keyboard navigation readiness, and fluid dark glassmorphic responsive viewports.

---

## 🛠️ System Architecture & Logic

```mermaid
graph TD
    User([User Prompt]) --> UI[Client UI: page.tsx]
    UI -->|POST /api/logs| API[Next.js Server API: route.ts]
    API -->|1. Parse text| GP[Gemini Parser: geminiParser.ts]
    GP -->|Structured JSON| API
    API -->|2. Compute kg| CE[Calculations Engine: carbonCalculator.ts]
    CE -->|Emissions Data| API
    API -->|3. Get last log date| DB[(Supabase Database)]
    DB -->|Last log stats| API
    API -->|4. Update streaks & XP| API
    API -->|5. Save log & profile| DB
    API -->|6. Fetch recent history| DB
    API -->|7. Generate coaching challenges| GC[Gemini Coach: geminiCoach.ts]
    GC -->|Eco Score & Challenges| API
    API -->|8. Cache insights| DB
    API -->|9. Returns results payload| UI
```

### 1. Database Schema (`supabase_schema.sql`)
Paste the raw SQL definitions from [supabase_schema.sql](file:///d:/PROMPT%20WARS%20VIRTUAL%20PROJECTS/Carbon%20Footprint%20Awareness%20Platform/supabase_schema.sql) into your Supabase SQL Editor.
* **`users`**: Manages unique user identity, active login streaks, XP scores, and earned badges arrays.
* **`carbon_logs`**: Logs individual carbon-emitting activities, raw metrics inputs, and calculated emissions in kg.
* **`ai_cached_insights`**: Caches AI coaching summaries and lists active micro-challenges for instant server-less loading.

### 2. Scientific Calculations Engine (`carbonCalculator.ts`)
Converts raw inputs to metric equivalents of $CO_2$ kilograms ($CO_2$-kg) using verified factors:
* **Transport**:
  * Diesel Passenger Car: $0.17$ kg/km
  * Petrol Passenger Car: $0.16$ kg/km
  * Electric Vehicle (EV): $0.05$ kg/km
  * Public Transit: $0.03$ kg/km
* **Energy**:
  * Household Electricity Grid: $0.82$ kg/kWh
* **Food**:
  * Meat Heavy Diet: $7.2$ kg/day
  * Vegetarian Diet: $3.8$ kg/day
  * Vegan/Plant-based Diet: $2.9$ kg/day

---

## 📋 Assumptions Made

1. **Streak Count Calendar Limits**: Consecutive days are determined by UTC calendar days. If a user logs multiple times in one day, their streak is preserved. If they log on the consecutive day, their streak increments. Otherwise, it resets to `1`.
2. **XP Calculation Rules**: Logging a daily activity awards `15 base XP` plus a dynamic bonus equal to `streak * 5` XP.
3. **Coaching Recommendations**: If a user's recent history contains more than 50% transportation emissions, the coaching model is instructed to generate at least two transportation-focused challenges.
4. **Lazy Bootstrapping User**: For evaluation testing purposes, if a `userId` is not found in the database, the API route automatically creates the user record on the fly to prevent transaction crashes.

---

## 🔧 Installation & Verification

### 1. Set Up Environment Variables
Create a [`.env.local`](file:///d:/PROMPT%20WARS%20VIRTUAL%20PROJECTS/Carbon%20Footprint%20Awareness%20Platform/.env.local) file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
GEMINI_API_KEY=your-gemini-api-key
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to access the interactive web interface.

### 3. Run Automated Unit Tests
Verify calculation integrity and boundary rules by executing:
```bash
npm run test
```
All 9 core calculator test cases will execute and verify algorithm soundness.

---

## 🛡️ Security & Evaluation Metrics
* **Obfuscated Server Errors**: API exceptions catch raw database logs locally on the server but return sanitized fallback templates to the client to avoid stack trace leaks.
* **Strict Schema Verification**: Inputs are scanned using UUID regex filters, category check constants, and number boundaries before hitting DB write queries.
* **Repository Size Integrity**: Built caches (`.next`), Vercel bundles, and local `.env` values are excluded by our strict `.gitignore` configurations, ensuring submission bundles remain well below the **10MB** ceiling.
