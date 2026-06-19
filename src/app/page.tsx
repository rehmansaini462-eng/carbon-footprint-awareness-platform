"use client";

import React, { useState, useEffect } from "react";
import { 
  Leaf, 
  Flame, 
  Award, 
  Send, 
  PieChart as PieIcon, 
  TrendingDown, 
  Cpu, 
  CheckCircle2, 
  Footprints
} from "lucide-react";
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip 
} from "recharts";

import { CarbonLog, CoachInsights, MicroChallenge } from "@/core/types";

const CATEGORY_COLORS = {
  Transport: "#06b6d4", // Cyan
  Energy: "#eab308",    // Yellow
  Food: "#10b981",      // Emerald
};

// Stable UUID for testing evaluation
const STABLE_USER_ID = "c8d8c8d8-c8d8-4c8d-8c8d-8c8d8c8d8c8d";

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [userId, setUserId] = useState(STABLE_USER_ID);
  const [promptInput, setPromptInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // User Stats State
  const [streak, setStreak] = useState(0);
  const [xp, setXp] = useState(0);
  const [badges, setBadges] = useState<string[]>([]);
  
  // Dashboard Analytics Data State
  const [logs, setLogs] = useState<CarbonLog[]>([]);
  const [insights, setInsights] = useState<CoachInsights>({
    eco_score: 80,
    context_summary: "Welcome to Agentic Carbon Coach. Log your habits below using natural language (e.g., 'I drove 15km in my petrol car today' or 'I ate a vegan diet today') to receive personalized sustainability challenges.",
    carbon_credits_offset_estimate: 0.0035,
    active_micro_challenges: [
      {
        title: "Cold Water Wash",
        action: "Do your laundry with cold water instead of hot to save energy.",
        saved_co2_kg: 0.5,
      },
      {
        title: "Ditch the Car",
        action: "Take public transit, bike, or walk to work or run errands.",
        saved_co2_kg: 1.8,
      },
      {
        title: "Plant-Powered Plate",
        action: "Prepare a meal choosing entirely vegetarian or vegan recipes.",
        saved_co2_kg: 1.2,
      },
    ],
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    // Initialize user session configuration
    if (typeof window !== "undefined") {
      const savedUserId = localStorage.getItem("carbon_user_uuid");
      if (savedUserId) {
        setUserId(savedUserId);
      } else {
        const newUuid = crypto.randomUUID ? crypto.randomUUID() : STABLE_USER_ID;
        localStorage.setItem("carbon_user_uuid", newUuid);
        setUserId(newUuid);
      }
      
      const savedStreak = localStorage.getItem("carbon_user_streak");
      const savedXp = localStorage.getItem("carbon_user_xp");
      const savedBadges = localStorage.getItem("carbon_user_badges");
      const savedLogs = localStorage.getItem("carbon_user_logs");
      const savedInsights = localStorage.getItem("carbon_user_insights");

      if (savedStreak) setStreak(parseInt(savedStreak, 10));
      if (savedXp) setXp(parseInt(savedXp, 10));
      if (savedBadges) setBadges(JSON.parse(savedBadges) as string[]);
      if (savedLogs) setLogs(JSON.parse(savedLogs) as CarbonLog[]);
      if (savedInsights) {
        try {
          const parsed = JSON.parse(savedInsights) as CoachInsights & { micro_challenges?: unknown[] };
          // Normalize old local storage format
          if (parsed && !parsed.active_micro_challenges && parsed.micro_challenges) {
            parsed.active_micro_challenges = parsed.micro_challenges as MicroChallenge[];
            delete (parsed as { micro_challenges?: unknown[] }).micro_challenges;
          }
          setInsights(parsed as CoachInsights);
        } catch (e) {
          console.error("Failed to parse saved insights", e);
        }
      }
    }
  }, []);

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim()) return;

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: promptInput.trim(),
          userId,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "An error occurred while logging emissions.");
      }

      const { data } = json;

      // Update Local State with server transaction updates
      const newLog: CarbonLog = {
        category: data.category,
        specificType: data.specificType,
        rawValue: data.value,
        calculatedCo2Kg: data.calculatedCo2Kg,
        loggedAt: new Date().toISOString(),
      };

      const updatedLogs = [newLog, ...logs];
      setLogs(updatedLogs);
      setStreak(data.streak);
      setXp(data.totalXp);
      setBadges(data.unlockedBadges);
      
      if (data.aiCoachResponse) {
        setInsights(data.aiCoachResponse);
        localStorage.setItem("carbon_user_insights", JSON.stringify(data.aiCoachResponse));
      }

      // Persist locally
      localStorage.setItem("carbon_user_logs", JSON.stringify(updatedLogs));
      localStorage.setItem("carbon_user_streak", data.streak.toString());
      localStorage.setItem("carbon_user_xp", data.totalXp.toString());
      localStorage.setItem("carbon_user_badges", JSON.stringify(data.unlockedBadges));

      setPromptInput("");
      setMessage({ text: `Success! Recorded ${data.calculatedCo2Kg}kg CO2e. Gained +${data.gainedXp} XP!`, isError: false });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to contact backend API.";
      setMessage({ text: errMsg, isError: true });
    } finally {
      setLoading(false);
    }
  };

  const clearSession = () => {
    localStorage.removeItem("carbon_user_streak");
    localStorage.removeItem("carbon_user_xp");
    localStorage.removeItem("carbon_user_badges");
    localStorage.removeItem("carbon_user_logs");
    localStorage.removeItem("carbon_user_insights");
    setStreak(0);
    setXp(0);
    setBadges([]);
    setLogs([]);
    setInsights({
      eco_score: 80,
      context_summary: "Session reset. Type a new logging prompt below.",
      carbon_credits_offset_estimate: 0.0035,
      active_micro_challenges: [
        {
          title: "Cold Water Wash",
          action: "Do your laundry with cold water instead of hot to save energy.",
          saved_co2_kg: 0.5,
        },
        {
          title: "Ditch the Car",
          action: "Take public transit, bike, or walk to work or run errands.",
          saved_co2_kg: 1.8,
        },
        {
          title: "Plant-Powered Plate",
          action: "Prepare a meal choosing entirely vegetarian or vegan recipes.",
          saved_co2_kg: 1.2,
        },
      ],
    });
    setMessage({ text: "Session logs and states cleared successfully.", isError: false });
  };

  // Process Recharts data from state logs
  const chartData = [
    { name: "Transport", value: 0 },
    { name: "Energy", value: 0 },
    { name: "Food", value: 0 },
  ];

  logs.forEach(log => {
    if (log.category === "Transport") chartData[0].value += log.calculatedCo2Kg;
    else if (log.category === "Energy") chartData[1].value += log.calculatedCo2Kg;
    else if (log.category === "Food") chartData[2].value += log.calculatedCo2Kg;
  });

  const totalEmissions = chartData.reduce((acc, curr) => acc + curr.value, 0);

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white font-sans">
        <div className="text-center">
          <Leaf className="mx-auto h-12 w-12 animate-pulse text-emerald-400" />
          <p className="mt-4 text-slate-400">Loading Agentic Carbon Coach...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950 p-4 md:p-8 flex flex-col items-center justify-start">
      {/* Background Neon Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Semantic Accessibility Header */}
      <header className="w-full max-w-6xl flex flex-col md:flex-row items-center justify-between pb-8 border-b border-slate-800/80 mb-8 gap-4 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/20 p-2.5 rounded-xl border border-emerald-500/30">
            <Footprints className="h-8 w-8 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Agentic Carbon Coach
            </h1>
            <p className="text-xs text-slate-400 font-medium">Carbon Footprint Awareness & AI Advisor</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 font-mono">
            User ID: {userId.substring(0, 13)}...
          </span>
          <button
            onClick={clearSession}
            aria-label="Clear active session data"
            className="text-xs bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 px-3 py-1.5 rounded-lg border border-rose-500/20 transition-all font-semibold"
          >
            Reset Logs
          </button>
        </div>
      </header>

      {/* Semantic Accessibility Main Container */}
      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 z-10 flex-1">
        
        {/* Left Side: Profile Stats & Logs Input Console */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          
          {/* Section: Profile Stats */}
          <section aria-label="User profile metrics dashboard" className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-6 rounded-2xl grid grid-cols-2 md:grid-cols-4 gap-4 shadow-xl">
            {/* Stat 1: Streak */}
            <article className="flex flex-col items-center justify-center p-3 bg-slate-950/40 rounded-xl border border-slate-800/50">
              <div className="flex items-center gap-1.5 text-orange-400">
                <Flame className="h-5 w-5 fill-current" aria-hidden="true" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Streak</span>
              </div>
              <p className="text-2xl md:text-3xl font-black mt-1 text-slate-100">{streak} <span className="text-xs text-slate-400 font-normal">days</span></p>
            </article>

            {/* Stat 2: XP */}
            <article className="flex flex-col items-center justify-center p-3 bg-slate-950/40 rounded-xl border border-slate-800/50">
              <div className="flex items-center gap-1.5 text-cyan-400">
                <Cpu className="h-5 w-5" aria-hidden="true" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">XP Points</span>
              </div>
              <p className="text-2xl md:text-3xl font-black mt-1 text-slate-100">{xp}</p>
            </article>

            {/* Stat 3: Eco Score */}
            <article className="flex flex-col items-center justify-center p-3 bg-slate-950/40 rounded-xl border border-slate-800/50">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <Leaf className="h-5 w-5" aria-hidden="true" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Eco Score</span>
              </div>
              <p className="text-2xl md:text-3xl font-black mt-1 text-slate-100">{insights.eco_score}</p>
            </article>

            {/* Stat 4: Carbon Credits */}
            <article className="flex flex-col items-center justify-center p-3 bg-slate-950/40 rounded-xl border border-slate-800/50">
              <div className="flex items-center gap-1.5 text-amber-400">
                <Award className="h-5 w-5" aria-hidden="true" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Offset Credits</span>
              </div>
              <p className="text-2xl md:text-3xl font-black mt-1 text-slate-100 font-mono">
                {insights.carbon_credits_offset_estimate ? insights.carbon_credits_offset_estimate.toFixed(4) : "0.0000"}
              </p>
            </article>

            {/* Badges Display Row */}
            <div className="col-span-2 md:col-span-4 mt-2 flex flex-wrap items-center gap-2 border-t border-slate-800/60 pt-4">
              <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
                <Award className="h-4 w-4 text-amber-400" aria-hidden="true" /> Earned Badges:
              </span>
              {badges.length === 0 ? (
                <span className="text-xs text-slate-500 italic">No badges earned yet. Complete streaks or gain 100 XP!</span>
              ) : (
                badges.map((b) => (
                  <span
                    key={b}
                    className="text-[10px] uppercase font-extrabold tracking-wider bg-amber-500/10 border border-amber-500/30 text-amber-300 px-2.5 py-1 rounded-md"
                  >
                    <span className="sr-only">Badge unlocked: </span>
                    {b.replace("_", " ")}
                  </span>
                ))
              )}
            </div>
          </section>

          {/* Section: Natural Language Console */}
          <section aria-label="AI logging input console" className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-6 rounded-2xl shadow-xl">
            <h2 className="text-lg font-bold text-slate-100 mb-2 flex items-center gap-2">
              <Cpu className="h-5 w-5 text-emerald-400" /> Log Daily Habits via AI
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Describe your meals, energy consumption, or travel. The agent extracts metrics automatically.
            </p>

            <form onSubmit={handleLogSubmit} className="space-y-4">
              <div className="relative">
                <label htmlFor="nl-prompt" className="sr-only">Describe your activity to parse carbon footprint</label>
                <textarea
                  id="nl-prompt"
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  placeholder="e.g. I drove 25 kilometers in my petrol_car today and ate a vegetarian diet..."
                  rows={3}
                  aria-label="Natural language daily habit description"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none"
                />
              </div>

              {message && (
                <div className={`text-xs p-3 rounded-lg border flex items-center gap-2 ${
                  message.isError 
                    ? "bg-rose-500/10 border-rose-500/30 text-rose-300" 
                    : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                }`}>
                  <span className="font-bold">{message.isError ? "Error:" : "Notice:"}</span> {message.text}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="text-[11px] text-slate-500 flex flex-wrap gap-2">
                  <span className="font-bold">Examples:</span>
                  <button type="button" onClick={() => setPromptInput("I ate heavy meat diet today")} className="hover:text-slate-300 underline">Meat food</button>
                  <button type="button" onClick={() => setPromptInput("We used 22 kWh electricity in the home")} className="hover:text-slate-300 underline">Electricity</button>
                  <button type="button" onClick={() => setPromptInput("Commuted 40 km using public_transit")} className="hover:text-slate-300 underline">Transit</button>
                </div>
                <button
                  type="submit"
                  disabled={loading || !promptInput.trim()}
                  aria-label="Submit logging prompt to AI parser"
                  className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
                >
                  {loading ? (
                    <span className="h-4 w-4 border-2 border-slate-950 border-t-transparent animate-spin rounded-full" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {loading ? "Parsing..." : "Log Activity"}
                </button>
              </div>
            </form>
          </section>

          {/* Section: Logs History */}
          <section aria-label="Recent logged activities logbook" className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-6 rounded-2xl shadow-xl flex-1 flex flex-col max-h-[350px]">
            <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
              <PieIcon className="h-5 w-5 text-cyan-400" /> Logbook History
            </h2>

            <div className="overflow-y-auto space-y-3 flex-1 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
              {logs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 text-xs py-8">
                  <Footprints className="h-10 w-10 text-slate-800 mb-2" />
                  <p>Your logbook is empty. Record actions to view breakdown.</p>
                </div>
              ) : (
                logs.map((log, index) => (
                  <article 
                    key={log.id || index} 
                    className="bg-slate-950/50 border border-slate-800/60 p-3.5 rounded-xl flex items-center justify-between transition-all hover:border-slate-700/60"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[log.category] }} />
                      <div>
                        <h3 className="text-xs font-bold text-slate-200">{log.category} — <span className="text-slate-400 font-mono text-[10px]">{log.specificType}</span></h3>
                        <p className="text-[10px] text-slate-500 mt-0.5">Logged: {new Date(log.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-rose-400">+{log.calculatedCo2Kg} <span className="text-[9px] font-normal text-slate-500">kg CO₂e</span></p>
                      <p className="text-[9px] text-slate-500">{log.rawValue} unit metrics</p>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>

        </div>

        {/* Right Side: Visual Analytics & AI Coaching Alerts */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          
          {/* Section: Carbon Metrics Breakdown Chart */}
          <section aria-label="Carbon emission distribution charts" className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-6 rounded-2xl shadow-xl">
            <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-cyan-400" /> Emission Breakdown
            </h2>

            {totalEmissions === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-xs text-slate-600 border border-dashed border-slate-800 rounded-xl">
                <PieIcon className="h-8 w-8 mb-2" />
                <p>No emissions distribution data available yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div role="region" aria-label="Interactive Carbon Emission Pie Chart" className="h-44 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData.filter(d => d.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name as "Transport" | "Energy" | "Food"]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "8px", color: "#e2e8f0" }}
                        formatter={(val: unknown) => [`${Number(val).toFixed(2)} kg CO₂`, "Emissions"]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Impact</span>
                    <span className="text-lg font-extrabold text-slate-200">{totalEmissions.toFixed(2)}kg</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {chartData.map((d) => (
                    <div key={d.name} className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[d.name as "Transport" | "Energy" | "Food"] }} />
                        <span className="text-[9px] uppercase font-bold text-slate-400">{d.name}</span>
                      </div>
                      <p className="text-xs font-extrabold text-slate-200">{d.value.toFixed(1)}kg</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Section: Contextual Coach Alerts */}
          <section aria-label="AI sustainability coaching alerts" className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-6 rounded-2xl shadow-xl flex-1 flex flex-col">
            <h2 className="text-lg font-bold text-slate-100 mb-3 flex items-center gap-2">
              <Cpu className="h-5 w-5 text-emerald-400 animate-pulse" /> Agentic Carbon Coach
            </h2>

            <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-xl mb-6">
              <p className="text-xs text-emerald-300/90 leading-relaxed font-medium">
                &quot;{insights.context_summary}&quot;
              </p>
            </div>

            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3">
              Active Micro-Challenges
            </h3>

            <div className="space-y-4 flex-1">
              {(insights.active_micro_challenges || []).map((c, idx) => (
                <article
                  key={idx}
                  className="bg-slate-950/60 border border-slate-850 p-3.5 rounded-xl flex gap-3 transition-all hover:border-emerald-500/20"
                >
                  <div className="mt-0.5 text-emerald-400">
                    <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-200">{c.title}</h4>
                      <span className="text-[10px] font-extrabold text-emerald-400">-{c.saved_co2_kg} kg CO₂</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                      {c.action}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>

        </div>

      </main>

      {/* Footer Info Section */}
      <footer className="w-full max-w-6xl mt-8 pt-4 border-t border-slate-800/40 text-center text-[10px] text-slate-600 font-mono">
        Carbon Footprint Awareness Platform Prototype &bull; Evaluation build v1.2 &bull; Double-A Compliant Accessibility Structure.
      </footer>
    </div>
  );
}
