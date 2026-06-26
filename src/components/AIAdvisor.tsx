import React, { useState, useEffect } from "react";
import { BudgetProfile, AIAdviceResponse } from "../types";
import { Sparkles, RefreshCw, Send, BookOpen } from "lucide-react";

interface AIAdvisorProps {
  profile: BudgetProfile;
}

export default function AIAdvisor({ profile }: AIAdvisorProps) {
  const [advice, setAdvice] = useState<AIAdviceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Load initial automated advisor suggestions on mount
  const fetchAdvice = async (customQuestion?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile,
          question: customQuestion || undefined
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to receive feedback from student financial AI.");
      }
      const data = await response.json();
      setAdvice(data);
    } catch (err: any) {
      console.error(err);
      setError("An issue occurred. Standard campus strategies have been loaded below.");
      // Fallback response for offline/graceful mode
      setAdvice({
        summary: "I had a minor issue reaching the cloud servers, but here are standard survival guide protocols for your campus. Focus on high impact optimizations!",
        recommendations: [
          {
            title: "Batch Meal Cooking Prep",
            description: "Avoid small daily grocery and fast-food transactions. Meal preps like beans, pasta, and stir-fry can cut food costs by up to 45%.",
            estimatedSavings: "$45/week",
            impact: "high"
          },
          {
            title: "Check Campus Tech Grants",
            description: "Most universities maintain special hardware stipends or direct hardware loan schemes for student laptops.",
            estimatedSavings: "Up to $800",
            impact: "high"
          }
        ],
        studentHacks: [
          "Always present your university email ID for automatic software subscriptions (Spotify, Amazon, GitHub, Notion).",
          "Borrow textbook PDFs or borrow from upperclassmen instead of acquiring new physical copies.",
          "Check local transit authorities for student discounts on bus or train passes."
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvice();
  }, []);

  const handleAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    fetchAdvice(question);
    setQuestion("");
  };

  const currency = profile.academic.currency;

  return (
    <div id="ai-advisor-container" className="grid grid-cols-1 lg:grid-cols-12 gap-8 font-sans-mc">
      {/* Question panel & Advice */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        {/* Enchantment Table Console */}
        <div className="mc-gui bg-stone-900 border-stone-850 p-6 flex flex-col gap-5 text-stone-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-700 pb-3">
            <div className="flex items-center gap-3">
              <div className="mc-hotbar-slot shrink-0">
                {/* Custom Enchanting Book SVG representation */}
                <svg width="24" height="24" viewBox="0 0 9 9" fill="none" style={{ imageRendering: 'pixelated' }}>
                  <rect x="1" y="2" width="7" height="5" fill="#aa0000" />
                  <rect x="2" y="1" width="5" height="1" fill="#ffffff" />
                  <rect x="4" y="2" width="1" height="5" fill="#3c3c3c" />
                  <rect x="2" y="3" width="2" height="1" fill="#ffffaa" />
                  <rect x="5" y="4" width="2" height="1" fill="#ffffaa" />
                </svg>
              </div>
              <div>
                <h3 className="font-pixel text-xs text-stone-100 uppercase tracking-wider">🔮 Enchantment Advisor</h3>
                <p className="text-[11px] text-stone-400 font-sans-mc mt-0.5">Optimize your budget flows with clever server-side AI equations</p>
              </div>
            </div>
            
            <button
              onClick={() => fetchAdvice()}
              disabled={loading}
              className="mc-btn py-1.5 px-3 min-w-[120px] text-xs shrink-0"
            >
              RE-AUDIT
            </button>
          </div>

          <form onSubmit={handleAsk} className="flex gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. 'How can I afford my $1200 laptop?' or 'Is my grocery cost too high?'"
              className="flex-1 mc-input text-sm text-stone-100"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="mc-btn flex items-center justify-center px-4"
            >
              ASK
            </button>
          </form>

          {/* Quick presets styled as spell recipes */}
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={() => { fetchAdvice("How can I earn extra income without hurting my university grades?"); }}
              className="text-xs bg-stone-800 hover:bg-stone-700 border border-stone-600 text-stone-200 py-1.5 px-3 rounded-sm transition-all cursor-pointer font-sans-mc font-semibold"
              disabled={loading}
            >
              💼 Jobs & Earnings Tips
            </button>
            <button
              onClick={() => { fetchAdvice("What are the best student tricks to get laptops and textbooks cheaper?"); }}
              className="text-xs bg-stone-800 hover:bg-stone-700 border border-stone-600 text-stone-200 py-1.5 px-3 rounded-sm transition-all cursor-pointer font-sans-mc font-semibold"
              disabled={loading}
            >
              💻 Tech & Book Grants
            </button>
            <button
              onClick={() => { fetchAdvice("How should I budget my social life, café drinks, and hanging out?"); }}
              className="text-xs bg-stone-800 hover:bg-stone-700 border border-stone-600 text-stone-200 py-1.5 px-3 rounded-sm transition-all cursor-pointer font-sans-mc font-semibold"
              disabled={loading}
            >
              ☕ Cafe & Social Hacks
            </button>
          </div>
        </div>

        {/* Quest Scroll / Response Output */}
        <div className="mc-gui min-h-[250px] relative flex flex-col">
          {loading && (
            <div className="absolute inset-0 bg-stone-900/45 backdrop-blur-xs flex flex-col items-center justify-center gap-4 z-10">
              <RefreshCw className="w-10 h-10 text-amber-500 animate-spin" />
              <div className="text-center font-pixel">
                <p className="text-xs text-white">CRAFTING STRATEGY...</p>
                <p className="text-stone-300 text-[10px] mt-1 font-sans-mc">Gemini is evaluating your financial stats...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 bg-red-900/20 border-2 border-red-500 text-red-200 p-3 text-xs font-semibold">
              {error}
            </div>
          )}

          {advice ? (
            <div className="flex flex-col gap-6">
              {/* Audit content */}
              <div className="space-y-2">
                <h4 className="font-pixel text-xs text-stone-800 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
                  Scroll of Divine Counsel
                </h4>
                <div className="mc-dark-inset p-4 text-stone-200 text-base leading-relaxed whitespace-pre-line">
                  {advice.summary}
                </div>
              </div>

              {/* Actionable recommendations */}
              <div className="space-y-3">
                <h4 className="font-pixel text-[10px] text-stone-600 uppercase tracking-wider">
                  🎯 EXP GRANTS & ADVENTURE TASKS
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {advice.recommendations.map((rec, idx) => (
                    <div key={idx} className="mc-gui bg-stone-100 p-4 flex flex-col justify-between gap-3 hover:border-white transition-all">
                      <div className="space-y-1">
                        <div className="flex items-start justify-between gap-2 border-b border-stone-300 pb-1">
                          <span className="font-pixel text-[11px] text-stone-800 leading-snug">{rec.title}</span>
                          <span className={`text-[8px] font-pixel px-1.5 py-0.5 rounded-sm border ${
                            rec.impact === 'high' ? "bg-emerald-100 text-emerald-800 border-emerald-300" :
                            rec.impact === 'medium' ? "bg-amber-100 text-amber-800 border-amber-300" :
                            "bg-stone-200 text-stone-800 border-stone-400"
                          }`}>
                            {rec.impact}
                          </span>
                        </div>
                        <p className="text-sm text-stone-600 leading-normal font-medium pt-1">
                          {rec.description}
                        </p>
                      </div>

                      <div className="border-t border-stone-300 pt-2.5 flex items-center justify-between text-xs font-semibold">
                        <span className="text-stone-500">Est. Savings:</span>
                        <span className="mc-text-green font-bold">{rec.estimatedSavings}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-stone-400 py-12">
              <BookOpen className="w-12 h-12 text-stone-400 mb-2 stroke-1" />
              <p className="font-pixel text-[10px]">Click RE-AUDIT to summon recommendations.</p>
            </div>
          )}
        </div>
      </div>

      {/* University hacks list */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="mc-gui flex flex-col gap-4">
          <h4 className="font-pixel text-xs text-stone-800 border-b border-stone-300 pb-2">
            📚 Ancient Survival Tomes
          </h4>
          <p className="text-xs text-stone-600 leading-normal">
            Proven university gameplay mechanics & item acquisition tips:
          </p>

          <div className="flex flex-col gap-3">
            {advice?.studentHacks?.map((hack, idx) => (
              <div key={idx} className="mc-dark-inset p-3 flex gap-3 text-stone-200">
                <div className="mc-hotbar-slot w-7 h-7 shrink-0 font-pixel text-[11px] text-amber-400 flex items-center justify-center">
                  {idx + 1}
                </div>
                <p className="text-sm leading-normal">{hack}</p>
              </div>
            )) || (
              <>
                <div className="mc-dark-inset p-3 flex gap-3 text-stone-200">
                  <div className="mc-hotbar-slot w-7 h-7 shrink-0 font-pixel text-[11px] text-amber-400 flex items-center justify-center">
                    1
                  </div>
                  <p className="text-sm leading-normal">
                    Never acquire textbooks brand new. Consult local upperclassmen or seek digital PDFs on public repositories.
                  </p>
                </div>
                <div className="mc-dark-inset p-3 flex gap-3 text-stone-200">
                  <div className="mc-hotbar-slot w-7 h-7 shrink-0 font-pixel text-[11px] text-amber-400 flex items-center justify-center">
                    2
                  </div>
                  <p className="text-sm leading-normal">
                    Employ your academic .edu identity for automatic discounts on music, retail goods, and design packages.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Advisor disclaimer */}
        <div className="mc-gui bg-stone-200 text-[11px] text-stone-600 leading-relaxed p-3.5 border border-stone-400 shadow-none">
          <strong>Advisor Note:</strong> The spellcraft equations generated by the AI Mentor are guidelines. Always double-verify semester fee schedules with your campus registrar.
        </div>
      </div>
    </div>
  );
}
