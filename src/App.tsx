import React, { useState, useEffect } from "react";
import { BudgetProfile, IncomeItem, ExpenseItem } from "./types";
import BudgetSummary from "./components/BudgetSummary";
import VisualCharts from "./components/VisualCharts";
import ScenarioPlanner from "./components/ScenarioPlanner";
import AIAdvisor from "./components/AIAdvisor";
import { 
  Plus, 
  Trash2, 
  RefreshCw,
  Settings
} from "lucide-react";

// Realistic baseline student budget for initial load
const DEFAULT_PROFILE: BudgetProfile = {
  academic: {
    termMonths: 8,
    currency: "$",
    initialSavings: 1500,
  },
  incomes: [
    { id: "inc-1", name: "Part-time Campus Job", amount: 190, frequency: "weekly", category: "job" },
    { id: "inc-2", name: "Family Allowance", amount: 200, frequency: "monthly", category: "allowance" },
    { id: "inc-3", name: "Academic Merit Stipend", amount: 120, frequency: "monthly", category: "stipend" },
  ],
  expenses: [
    { id: "exp-1", name: "Dorm Rent Portion", amount: 550, frequency: "monthly", category: "rent" },
    { id: "exp-2", name: "Weekly Grocery Prep", amount: 75, frequency: "weekly", category: "food" },
    { id: "exp-3", name: "Starbucks / Energy Drinks", amount: 22, frequency: "weekly", category: "food" },
    { id: "exp-4", name: "Transit Bus Pass", amount: 45, frequency: "monthly", category: "transport" },
    { id: "exp-5", name: "Software & Spotify", amount: 15, frequency: "monthly", category: "other" },
    { id: "exp-6", name: "Weekend Hangouts", amount: 45, frequency: "weekly", category: "social" },
    { id: "exp-7", name: "MacBook Air Setup", amount: 750, frequency: "one-time", category: "gear" },
    { id: "exp-8", name: "Syllabus Textbook Bundle", amount: 160, frequency: "one-time", category: "books" },
    { id: "exp-9", name: "Semester Administrative Fee", amount: 1000, frequency: "one-time", category: "fees" },
  ],
};

export default function App() {
  const [profile, setProfile] = useState<BudgetProfile>(() => {
    const saved = localStorage.getItem("student_budget_profile");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_PROFILE;
      }
    }
    return DEFAULT_PROFILE;
  });

  const [activeTab, setActiveTab] = useState<"dashboard" | "transactions" | "scenario" | "advisor" | "config">("dashboard");

  // Save profile state to localStorage automatically on edits
  useEffect(() => {
    localStorage.setItem("student_budget_profile", JSON.stringify(profile));
  }, [profile]);

  // Income Input Fields
  const [incName, setIncName] = useState("");
  const [incAmount, setIncAmount] = useState<number | "">("");
  const [incFrequency, setIncFrequency] = useState<'monthly' | 'weekly' | 'one-time'>("monthly");
  const [incCategory, setIncCategory] = useState<'allowance' | 'job' | 'stipend' | 'scholarship' | 'other'>("job");

  // Expense Input Fields
  const [expName, setExpName] = useState("");
  const [expAmount, setExpAmount] = useState<number | "">("");
  const [expFrequency, setExpFrequency] = useState<'monthly' | 'weekly' | 'daily' | 'one-time'>("monthly");
  const [expCategory, setExpCategory] = useState<'fees' | 'rent' | 'food' | 'transport' | 'gear' | 'social' | 'books' | 'other'>("food");

  // Config Inputs
  const [termMonths, setTermMonths] = useState(profile.academic.termMonths);
  const [currency, setCurrency] = useState(profile.academic.currency);
  const [initialSavings, setInitialSavings] = useState(profile.academic.initialSavings);

  const handleAddIncome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incName.trim() || incAmount === "" || incAmount <= 0) return;

    const newItem: IncomeItem = {
      id: `inc-${Date.now()}`,
      name: incName.trim(),
      amount: Number(incAmount),
      frequency: incFrequency,
      category: incCategory,
    };

    setProfile(prev => ({
      ...prev,
      incomes: [...prev.incomes, newItem],
    }));

    // Reset fields
    setIncName("");
    setIncAmount("");
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expName.trim() || expAmount === "" || expAmount <= 0) return;

    const newItem: ExpenseItem = {
      id: `exp-${Date.now()}`,
      name: expName.trim(),
      amount: Number(expAmount),
      frequency: expFrequency,
      category: expCategory,
    };

    setProfile(prev => ({
      ...prev,
      expenses: [...prev.expenses, newItem],
    }));

    // Reset fields
    setExpName("");
    setExpAmount("");
  };

  const handleDeleteIncome = (id: string) => {
    setProfile(prev => ({
      ...prev,
      incomes: prev.incomes.filter(item => item.id !== id),
    }));
  };

  const handleDeleteExpense = (id: string) => {
    setProfile(prev => ({
      ...prev,
      expenses: prev.expenses.filter(item => item.id !== id),
    }));
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile(prev => ({
      ...prev,
      academic: {
        termMonths,
        currency,
        initialSavings,
      },
    }));
    setActiveTab("dashboard");
  };

  const resetToDefault = () => {
    if (window.confirm("Are you sure you want to reset your budget planner options? Your current vault entries will be overridden.")) {
      setProfile(DEFAULT_PROFILE);
      setTermMonths(DEFAULT_PROFILE.academic.termMonths);
      setCurrency(DEFAULT_PROFILE.academic.currency);
      setInitialSavings(DEFAULT_PROFILE.academic.initialSavings);
    }
  };

  return (
    <div id="craft-economy-root" className="min-h-screen flex flex-col font-sans-mc text-stone-800 antialiased">
      {/* Top Minecraft-themed Header Block */}
      <header className="bg-stone-900 border-b-8 border-stone-800 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            {/* Custom Pixel Gold Sword Icon */}
            <div className="mc-hotbar-slot w-14 h-14 shrink-0 bg-stone-700">
              <svg width="32" height="32" viewBox="0 0 9 9" fill="none" style={{ imageRendering: 'pixelated' }}>
                <rect x="7" y="0" width="1" height="1" fill="#000" />
                <rect x="6" y="1" width="1" height="1" fill="#000" />
                <rect x="5" y="2" width="1" height="1" fill="#000" />
                <rect x="4" y="3" width="1" height="1" fill="#000" />
                {/* Sword blade */}
                <rect x="6" y="0" width="1" height="1" fill="#fdf55f" />
                <rect x="7" y="1" width="1" height="1" fill="#fdf55f" />
                <rect x="5" y="1" width="1" height="1" fill="#fdf55f" />
                <rect x="6" y="2" width="1" height="1" fill="#fdf55f" />
                <rect x="4" y="2" width="1" height="1" fill="#fdf55f" />
                <rect x="5" y="3" width="1" height="1" fill="#fdf55f" />
                <rect x="3" y="3" width="1" height="1" fill="#fdf55f" />
                <rect x="4" y="4" width="1" height="1" fill="#fdf55f" />
                {/* Hilt / Handle */}
                <rect x="2" y="5" width="2" height="1" fill="#3d2811" />
                <rect x="3" y="4" width="1" height="2" fill="#3d2811" />
                <rect x="1" y="6" width="2" height="2" fill="#555" />
                <rect x="0" y="8" width="1" height="1" fill="#000" />
              </svg>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-pixel text-lg text-white tracking-wide uppercase text-shadow-md">CraftEconomy</h1>
                <span className="font-pixel text-[9px] tracking-widest bg-amber-500/20 text-amber-300 border-2 border-amber-500/40 px-2 py-0.5 rounded-none uppercase">Academic v1.2</span>
              </div>
              <p className="text-stone-300 text-sm mt-1">University Student Economic Calculator & Survival Resource Planner</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={resetToDefault}
              className="mc-btn text-xs py-2 px-3.5"
            >
              RESET VAULT
            </button>
            <div className="hidden md:block w-1.5 h-10 bg-stone-800 border-l border-stone-700" />
            <div className="text-right font-sans-mc text-stone-300">
              <p className="text-[11px] uppercase text-stone-400 font-bold">Academic Session</p>
              <p className="text-base font-bold mc-text-yellow">{profile.academic.termMonths} Months</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main interface area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 flex flex-col gap-6">
        
        {/* Creative Inventory Tab system */}
        <div className="flex flex-wrap items-end gap-1.5 border-b-4 border-stone-500/60 z-10">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`mc-tab ${activeTab === "dashboard" ? "mc-tab-active" : ""}`}
          >
            HUD OVERVIEW
          </button>

          <button
            onClick={() => setActiveTab("transactions")}
            className={`mc-tab ${activeTab === "transactions" ? "mc-tab-active" : ""}`}
          >
            VAULT REGISTRY
          </button>

          <button
            onClick={() => setActiveTab("scenario")}
            className={`mc-tab ${activeTab === "scenario" ? "mc-tab-active" : ""}`}
          >
            SCENARIO SANDBOX
          </button>

          <button
            onClick={() => setActiveTab("advisor")}
            className={`mc-tab ${activeTab === "advisor" ? "mc-tab-active" : ""}`}
          >
            ENCHANT MENTOR
          </button>

          <div className="flex-1" />

          <button
            onClick={() => setActiveTab("config")}
            className={`mc-tab ${activeTab === "config" ? "mc-tab-active" : ""}`}
          >
            VAULT SETTINGS
          </button>
        </div>

        {/* Tab content screens */}
        <div className="flex-1">
          {activeTab === "dashboard" && (
            <div className="space-y-8 animate-fade-in">
              <BudgetSummary profile={profile} />
              <VisualCharts profile={profile} />
            </div>
          )}

          {activeTab === "transactions" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
              {/* Income Management (left col) */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                <div className="mc-gui flex flex-col gap-5">
                  <h3 className="font-pixel text-xs text-stone-800 uppercase tracking-wider border-b border-stone-300 pb-2">
                    ❇️ Add Income Ore
                  </h3>

                  <form onSubmit={handleAddIncome} className="flex flex-col gap-4 font-sans-mc">
                    <div>
                      <label className="block text-sm font-bold text-stone-700 uppercase mb-1">Source Label</label>
                      <input
                        type="text"
                        value={incName}
                        onChange={(e) => setIncName(e.target.value)}
                        placeholder="e.g. Campus Tutoring Job, Stipend"
                        className="w-full mc-input"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-stone-700 uppercase mb-1">Amount ({profile.academic.currency})</label>
                        <input
                          type="number"
                          value={incAmount}
                          onChange={(e) => setIncAmount(e.target.value === "" ? "" : Number(e.target.value))}
                          placeholder="e.g. 190"
                          className="w-full mc-input"
                          min="1"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-stone-700 uppercase mb-1">Frequency</label>
                        <select
                          value={incFrequency}
                          onChange={(e) => setIncFrequency(e.target.value as any)}
                          className="w-full text-base bg-stone-100 border-4 border-stone-500 font-bold p-2 text-stone-800 outline-hidden"
                        >
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                          <option value="one-time">One-time</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-stone-700 uppercase mb-1">Category</label>
                      <select
                        value={incCategory}
                        onChange={(e) => setIncCategory(e.target.value as any)}
                        className="w-full text-base bg-stone-100 border-4 border-stone-500 font-bold p-2 text-stone-800 outline-hidden"
                      >
                        <option value="job">Part-time Job</option>
                        <option value="allowance">Allowance</option>
                        <option value="stipend">Academic Stipend</option>
                        <option value="scholarship">Scholarship</option>
                        <option value="other">Other Cashflow</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="mc-btn mt-2"
                    >
                      ADD INCOME
                    </button>
                  </form>
                </div>

                {/* List of Incomes */}
                <div className="mc-gui flex flex-col gap-4">
                  <div className="flex justify-between items-center border-b border-stone-300 pb-2">
                    <h4 className="font-pixel text-[10px] text-stone-800">ACTIVE INCOMES ({profile.incomes.length})</h4>
                    <span className="font-pixel text-[10px] mc-text-green font-bold">
                      {profile.academic.currency}{Math.round(profile.incomes.reduce((sum, item) => {
                        let mult = 0;
                        if (item.frequency === 'monthly') mult = 1;
                        else if (item.frequency === 'weekly') mult = 4.33;
                        return sum + item.amount * mult;
                      }, 0))}/MO
                    </span>
                  </div>

                  <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
                    {profile.incomes.map((item) => (
                      <div key={item.id} className="mc-inset p-3 flex justify-between items-center text-stone-100 font-sans-mc">
                        <div className="space-y-0.5">
                          <span className="font-bold text-sm block">{item.name}</span>
                          <div className="flex gap-2 text-[11px] font-semibold text-stone-300 uppercase tracking-wider">
                            <span>{item.category}</span>
                            <span>•</span>
                            <span>{item.frequency}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-base mc-text-green">
                            {profile.academic.currency}{item.amount}
                          </span>
                          <button
                            onClick={() => handleDeleteIncome(item.id)}
                            className="bg-red-900 border-2 border-red-700 text-red-200 hover:bg-red-800 hover:text-white p-1.5 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {profile.incomes.length === 0 && (
                      <p className="text-center font-pixel text-[9px] text-stone-500 py-6">EMPTY STORAGE SLOTS.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Expense Management (right col) */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                <div className="mc-gui flex flex-col gap-5">
                  <h3 className="font-pixel text-xs text-stone-800 uppercase tracking-wider border-b border-stone-300 pb-2">
                    🔴 Add Expense Outlay
                  </h3>

                  <form onSubmit={handleAddExpense} className="flex flex-col gap-4 font-sans-mc">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-stone-700 uppercase mb-1">Expense Name</label>
                        <input
                          type="text"
                          value={expName}
                          onChange={(e) => setExpName(e.target.value)}
                          placeholder="e.g. dorm rent portion, textbooks"
                          className="w-full mc-input"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-stone-700 uppercase mb-1">Category</label>
                        <select
                          value={expCategory}
                          onChange={(e) => setExpCategory(e.target.value as any)}
                          className="w-full text-base bg-stone-100 border-4 border-stone-500 font-bold p-2 text-stone-800 outline-hidden"
                        >
                          <option value="rent">Dorm/Room Rent</option>
                          <option value="food">Groceries & Dining out</option>
                          <option value="transport">Public Transit / Fuel</option>
                          <option value="fees">University/Tuition Fees</option>
                          <option value="gear">Laptop & Tech Hardware</option>
                          <option value="books">Coursebooks & Supplies</option>
                          <option value="social">Social & Hanging Out</option>
                          <option value="other">Other Outlays</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-stone-700 uppercase mb-1">Cost ({profile.academic.currency})</label>
                        <input
                          type="number"
                          value={expAmount}
                          onChange={(e) => setExpAmount(e.target.value === "" ? "" : Number(e.target.value))}
                          placeholder="e.g. 550"
                          className="w-full mc-input"
                          min="1"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-stone-700 uppercase mb-1">Frequency</label>
                        <select
                          value={expFrequency}
                          onChange={(e) => setExpFrequency(e.target.value as any)}
                          className="w-full text-base bg-stone-100 border-4 border-stone-500 font-bold p-2 text-stone-800 outline-hidden"
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                          <option value="one-time">One-time purchase</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="mc-btn mt-2"
                    >
                      ADD EXPENSE ITEM
                    </button>
                  </form>
                </div>

                {/* List of Expenses */}
                <div className="mc-gui flex flex-col gap-4">
                  <div className="flex justify-between items-center border-b border-stone-300 pb-2">
                    <h4 className="font-pixel text-[10px] text-stone-800">ACTIVE EXPENSES ({profile.expenses.length})</h4>
                    <span className="font-pixel text-[10px] mc-text-red font-bold">
                      MONTHLY: {profile.academic.currency}{Math.round(profile.expenses
                        .filter(e => e.frequency !== 'one-time')
                        .reduce((sum, item) => {
                          let mult = 0;
                          if (item.frequency === 'monthly') mult = 1;
                          else if (item.frequency === 'weekly') mult = 4.33;
                          else if (item.frequency === 'daily') mult = 30;
                          return sum + item.amount * mult;
                        }, 0))}/MO
                    </span>
                  </div>

                  <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto pr-1">
                    {profile.expenses.map((item) => (
                      <div key={item.id} className="mc-inset p-3 flex justify-between items-center text-stone-100 font-sans-mc">
                        <div className="space-y-0.5">
                          <span className="font-bold text-sm block">{item.name}</span>
                          <div className="flex gap-2 text-[11px] font-semibold text-stone-300 uppercase tracking-wider">
                            <span>{item.category}</span>
                            <span>•</span>
                            <span>{item.frequency}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-base mc-text-red">
                            {profile.academic.currency}{item.amount}
                          </span>
                          <button
                            onClick={() => handleDeleteExpense(item.id)}
                            className="bg-red-900 border-2 border-red-700 text-red-200 hover:bg-red-800 hover:text-white p-1.5 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {profile.expenses.length === 0 && (
                      <p className="text-center font-pixel text-[9px] text-stone-500 py-6">NO OUTLAYS CURRENTLY ACTIVE.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "scenario" && (
            <div className="animate-fade-in">
              <ScenarioPlanner profile={profile} />
            </div>
          )}

          {activeTab === "advisor" && (
            <div className="animate-fade-in">
              <AIAdvisor profile={profile} />
            </div>
          )}

          {activeTab === "config" && (
            <div className="max-w-xl mx-auto mc-gui flex flex-col gap-5 animate-fade-in">
              <h3 className="font-pixel text-xs text-stone-800 uppercase tracking-wider border-b border-stone-300 pb-2">
                ⚙️ Vault Config Settings
              </h3>

              <form onSubmit={handleSaveConfig} className="flex flex-col gap-5 font-sans-mc">
                <div>
                  <label className="block text-sm font-bold text-stone-700 uppercase mb-1">Preferred Currency Symbol</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full text-base bg-stone-100 border-4 border-stone-500 font-bold p-2.5 text-stone-800 outline-hidden"
                  >
                    <option value="$">Emerald Dollar ($)</option>
                    <option value="£">Pound (£)</option>
                    <option value="€">Euro (€)</option>
                    <option value="¥">Yen / Yuan (¥)</option>
                    <option value="₱">Peso (₱)</option>
                    <option value="₨">Rupee (₨)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-stone-700 uppercase mb-1">Academic Session Length (Months)</label>
                  <input
                    type="number"
                    value={termMonths}
                    onChange={(e) => setTermMonths(Math.max(1, Number(e.target.value)))}
                    className="w-full mc-input"
                    min="1"
                    max="24"
                    required
                  />
                  <span className="text-xs text-stone-600 mt-1 block">Usually 8 months representing standard university terms.</span>
                </div>

                <div>
                  <label className="block text-sm font-bold text-stone-700 uppercase mb-1">Starting Savings ({currency})</label>
                  <input
                    type="number"
                    value={initialSavings}
                    onChange={(e) => setInitialSavings(Math.max(0, Number(e.target.value)))}
                    className="w-full mc-input"
                    min="0"
                    required
                  />
                  <span className="text-xs text-stone-600 mt-1 block">Starting treasury reserves inside the academic bank vault.</span>
                </div>

                <div className="border-t border-stone-300 pt-4 flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 mc-btn"
                  >
                    SAVE CHANGES
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("dashboard")}
                    className="mc-btn flex-1 bg-stone-600 border-stone-800 text-stone-300"
                  >
                    CANCEL
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* Crafted Footer */}
      <footer className="bg-stone-900 border-t-8 border-stone-800 py-6 mt-12 text-stone-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-pixel text-[10px] uppercase text-stone-300 tracking-wider">CraftEconomy</span>
            <span>•</span>
            <span className="font-sans-mc">A student economic survival framework. Minecraft default texture pack mood.</span>
          </div>
          <div className="flex gap-4">
            <span className="text-[10px] font-pixel text-stone-400 tracking-wider bg-stone-800 px-2 py-1">SECURE API HANDLER</span>
            <span className="text-[10px] font-pixel text-stone-400 tracking-wider bg-stone-800 px-2 py-1">REACT SYSTEM</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
