import React, { useState } from "react";
import { BudgetProfile } from "../types";
import { Sparkles, Sliders, TrendingUp, AlertTriangle } from "lucide-react";

interface ScenarioPlannerProps {
  profile: BudgetProfile;
}

export default function ScenarioPlanner({ profile }: ScenarioPlannerProps) {
  const { academic, incomes, expenses } = profile;
  const currency = academic.currency;

  // Find original job numbers (if any) to pre-populate
  const originalLaptop = expenses.find(e => e.name.toLowerCase().includes('laptop') || e.category === 'gear') || { amount: 750 };
  const originalBooks = expenses.find(e => e.name.toLowerCase().includes('book') || e.category === 'books') || { amount: 160 };

  // SCENARIO STATE VARIABLES
  const [jobHours, setJobHours] = useState(15);
  const [hourlyWage, setHourlyWage] = useState(16);
  const [enableJob, setEnableJob] = useState(incomes.some(i => i.category === 'job'));

  const [coffeesPerWeek, setCoffeesPerWeek] = useState(4);
  const [coffeePrice, setCoffeePrice] = useState(5.5);

  const [mealsPerWeek, setMealsPerWeek] = useState(3);
  const [mealPrice, setMealPrice] = useState(18);

  const [laptopCost, setLaptopCost] = useState(originalLaptop.amount);
  const [bookCost, setBookCost] = useState(originalBooks.amount);

  // CALCULATIONS
  const originalMonthlyIncome = incomes.reduce((sum, item) => {
    let multiplier = 0;
    if (item.frequency === 'monthly') multiplier = 1;
    else if (item.frequency === 'weekly') multiplier = 4.33;
    return sum + item.amount * multiplier;
  }, 0);

  const originalMonthlyExpense = expenses
    .filter(e => e.frequency !== 'one-time')
    .reduce((sum, item) => {
      let multiplier = 0;
      if (item.frequency === 'monthly') multiplier = 1;
      else if (item.frequency === 'weekly') multiplier = 4.33;
      else if (item.frequency === 'daily') multiplier = 30;
      return sum + item.amount * multiplier;
    }, 0);

  const originalOneTimeExpense = expenses
    .filter(e => e.frequency === 'one-time')
    .reduce((sum, item) => sum + item.amount, 0);

  const calculateScenarioMonthlyIncome = () => {
    const otherIncomes = incomes
      .filter(i => i.category !== 'job')
      .reduce((sum, item) => {
        let multiplier = 0;
        if (item.frequency === 'monthly') multiplier = 1;
        else if (item.frequency === 'weekly') multiplier = 4.33;
        return sum + item.amount * multiplier;
      }, 0);

    const scenarioJobIncome = enableJob ? (jobHours * hourlyWage * 4.33) : 0;
    return otherIncomes + scenarioJobIncome;
  };

  const calculateScenarioMonthlyExpense = () => {
    const otherExpenses = expenses
      .filter(e => e.frequency !== 'one-time' && !e.name.toLowerCase().includes('coffee') && !e.name.toLowerCase().includes('restaurant') && !e.name.toLowerCase().includes('dining') && !e.name.toLowerCase().includes('takeout'))
      .reduce((sum, item) => {
        let multiplier = 0;
        if (item.frequency === 'monthly') multiplier = 1;
        else if (item.frequency === 'weekly') multiplier = 4.33;
        else if (item.frequency === 'daily') multiplier = 30;
        return sum + item.amount * multiplier;
      }, 0);

    const coffeeMonthly = coffeesPerWeek * coffeePrice * 4.33;
    const diningMonthly = mealsPerWeek * mealPrice * 4.33;

    return otherExpenses + coffeeMonthly + diningMonthly;
  };

  const calculateScenarioOneTimeExpense = () => {
    const otherOneTimes = expenses
      .filter(e => e.frequency === 'one-time' && !e.name.toLowerCase().includes('laptop') && !e.name.toLowerCase().includes('book'))
      .reduce((sum, item) => sum + item.amount, 0);

    return otherOneTimes + laptopCost + bookCost;
  };

  const scenarioMonthlyIncome = calculateScenarioMonthlyIncome();
  const scenarioMonthlyExpense = calculateScenarioMonthlyExpense();
  const scenarioOneTimeExpense = calculateScenarioOneTimeExpense();

  const originalNetMonthly = originalMonthlyIncome - originalMonthlyExpense;
  const scenarioNetMonthly = scenarioMonthlyIncome - scenarioMonthlyExpense;

  const originalTermEnd = academic.initialSavings + (originalNetMonthly * academic.termMonths) - originalOneTimeExpense;
  const scenarioTermEnd = academic.initialSavings + (scenarioNetMonthly * academic.termMonths) - scenarioOneTimeExpense;

  const netDifference = scenarioTermEnd - originalTermEnd;

  return (
    <div id="scenario-planner-container" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Parameters panel */}
      <div className="lg:col-span-7 mc-gui flex flex-col gap-6">
        <div>
          <div className="flex items-center gap-3 border-b border-stone-300 pb-2">
            <div className="mc-hotbar-slot shrink-0">
              <svg width="24" height="24" viewBox="0 0 9 9" fill="none" style={{ imageRendering: 'pixelated' }}>
                <rect x="2" y="1" width="5" height="7" fill="#8b8b8b" />
                <rect x="3" y="2" width="3" height="5" fill="#3c3c3c" />
                <rect x="4" y="3" width="1" height="3" fill="#ff5555" />
              </svg>
            </div>
            <h3 className="font-pixel text-xs text-stone-800 uppercase tracking-wider">🛠️ Game Options Sandbox</h3>
          </div>
          <p className="text-xs text-stone-600 font-sans-mc mt-2 leading-relaxed">
            Configure lifestyle choices, cafe habits, and equipment setups. See how these small variables change your bank account end forecast in real-time!
          </p>
        </div>

        {/* Part-time Job */}
        <div className="mc-dark-inset p-4 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-stone-800 pb-2">
            <span className="font-pixel text-[10px] text-stone-300">PART-TIME MINING (JOB)</span>
            <button
              type="button"
              onClick={() => setEnableJob(!enableJob)}
              className="mc-btn py-1.5 px-4 min-w-[150px] shrink-0"
            >
              SURVIVAL JOB: {enableJob ? "ON" : "OFF"}
            </button>
          </div>

          {enableJob && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between font-sans-mc text-sm text-stone-300 mb-1">
                  <span>Weekly Work Schedule</span>
                  <span className="mc-text-green font-bold">{jobHours} Hours/Week</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="40" 
                  value={jobHours} 
                  onChange={(e) => setJobHours(Number(e.target.value))} 
                  className="w-full accent-amber-500 cursor-pointer h-2 bg-stone-900 border border-stone-700"
                />
              </div>

              <div>
                <div className="flex justify-between font-sans-mc text-sm text-stone-300 mb-1">
                  <span>Hourly Ore Wage</span>
                  <span className="mc-text-green font-bold">{currency}{hourlyWage}/hour</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="45" 
                  value={hourlyWage} 
                  onChange={(e) => setHourlyWage(Number(e.target.value))} 
                  className="w-full accent-amber-500 cursor-pointer h-2 bg-stone-900 border border-stone-700"
                />
              </div>

              <div className="text-right font-pixel text-[9px] mc-text-gold">
                Est: +{currency}{Math.round(jobHours * hourlyWage * 4.33)}/mo
              </div>
            </div>
          )}
        </div>

        {/* Coffee / Cafe Habit */}
        <div className="mc-dark-inset p-4 flex flex-col gap-4">
          <span className="font-pixel text-[10px] text-stone-300 border-b border-stone-800 pb-2">☕ BREWING HABIT (CAFE SPENDING)</span>
          
          <div>
            <div className="flex justify-between font-sans-mc text-sm text-stone-300 mb-1">
              <span>Cafe Cups per Week</span>
              <span className="mc-text-yellow font-bold">{coffeesPerWeek} cups</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="15" 
              value={coffeesPerWeek} 
              onChange={(e) => setCoffeesPerWeek(Number(e.target.value))} 
              className="w-full accent-amber-500 cursor-pointer h-2 bg-stone-900 border border-stone-700"
            />
          </div>

          <div>
            <div className="flex justify-between font-sans-mc text-sm text-stone-300 mb-1">
              <span>Avg. Price per Brewing</span>
              <span className="mc-text-yellow font-bold">{currency}{coffeePrice.toFixed(2)}</span>
            </div>
            <input 
              type="range" 
              min="2.0" 
              max="9.0" 
              step="0.5"
              value={coffeePrice} 
              onChange={(e) => setCoffeePrice(Number(e.target.value))} 
              className="w-full accent-amber-500 cursor-pointer h-2 bg-stone-900 border border-stone-700"
            />
          </div>
          
          <div className="text-right font-pixel text-[9px] mc-text-red">
            Est: {currency}{Math.round(coffeesPerWeek * coffeePrice * 4.33)}/mo
          </div>
        </div>

        {/* Dining Out / Takeout */}
        <div className="mc-dark-inset p-4 flex flex-col gap-4">
          <span className="font-pixel text-[10px] text-stone-300 border-b border-stone-800 pb-2">🍖 HUNGER MANAGEMENT (TAKEOUT MEALS)</span>
          
          <div>
            <div className="flex justify-between font-sans-mc text-sm text-stone-300 mb-1">
              <span>Takeout Orders per Week</span>
              <span className="mc-text-yellow font-bold">{mealsPerWeek} meals</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="14" 
              value={mealsPerWeek} 
              onChange={(e) => setMealsPerWeek(Number(e.target.value))} 
              className="w-full accent-amber-500 cursor-pointer h-2 bg-stone-900 border border-stone-700"
            />
          </div>

          <div>
            <div className="flex justify-between font-sans-mc text-sm text-stone-300 mb-1">
              <span>Cost per Feast</span>
              <span className="mc-text-yellow font-bold">{currency}{mealPrice}</span>
            </div>
            <input 
              type="range" 
              min="8" 
              max="60" 
              value={mealPrice} 
              onChange={(e) => setMealPrice(Number(e.target.value))} 
              className="w-full accent-amber-500 cursor-pointer h-2 bg-stone-900 border border-stone-700"
            />
          </div>

          <div className="text-right font-pixel text-[9px] mc-text-red">
            Est: {currency}{Math.round(mealsPerWeek * mealPrice * 4.33)}/mo
          </div>
        </div>

        {/* Capital equipment (laptop & books) */}
        <div>
          <span className="font-pixel text-[10px] text-stone-700 block mb-3 uppercase">🛡️ Equip Capital Gear (One-time)</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mc-inset p-3 text-stone-100">
              <label className="block text-xs font-bold uppercase mb-1">Laptop Budget ({currency})</label>
              <input 
                type="number" 
                value={laptopCost}
                onChange={(e) => setLaptopCost(Math.max(0, Number(e.target.value)))}
                className="w-full text-base bg-black/40 border border-stone-500 rounded-sm py-1.5 px-2 text-white font-mono focus:outline-hidden focus:border-white"
              />
              <span className="text-[10px] text-stone-300 font-mono mt-1 block">Baseline: {currency}{originalLaptop.amount}</span>
            </div>

            <div className="mc-inset p-3 text-stone-100">
              <label className="block text-xs font-bold uppercase mb-1">Supplies & Books ({currency})</label>
              <input 
                type="number" 
                value={bookCost}
                onChange={(e) => setBookCost(Math.max(0, Number(e.target.value)))}
                className="w-full text-base bg-black/40 border border-stone-500 rounded-sm py-1.5 px-2 text-white font-mono focus:outline-hidden focus:border-white"
              />
              <span className="text-[10px] text-stone-300 font-mono mt-1 block">Baseline: {currency}{originalBooks.amount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Outcomes Comparison Panel */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        {/* Main Comparison HUD */}
        <div className="mc-gui flex flex-col gap-5">
          <div className="flex items-center gap-2 border-b border-stone-300 pb-2">
            <Sparkles className="w-4 h-4 text-amber-600 animate-spin-slow shrink-0" />
            <span className="font-pixel text-xs text-stone-800">SIMULATED ADVENTURE FORECAST</span>
          </div>

          <div className="space-y-1">
            <p className="font-pixel text-[9px] text-stone-500 uppercase tracking-tight">End of Term Vault Projections</p>
            <div className="flex items-baseline gap-2">
              <span className={`font-pixel text-2xl font-bold ${scenarioTermEnd >= 0 ? "mc-text-green" : "mc-text-red"}`}>
                {currency}{Math.round(scenarioTermEnd)}
              </span>
              <span className="font-pixel text-[9px] text-stone-400">at Month {academic.termMonths}</span>
            </div>
          </div>

          <div className="border-t border-stone-300 pt-3.5 flex flex-col gap-2 font-sans-mc text-sm">
            <div className="flex justify-between items-center text-stone-600">
              <span>Original Baseline:</span>
              <span className="font-bold text-stone-800">{currency}{Math.round(originalTermEnd)}</span>
            </div>

            <div className="flex justify-between items-center text-stone-700">
              <span>Simulated Yield Diff:</span>
              <span className={`font-bold text-base flex items-center gap-1 ${netDifference >= 0 ? "mc-text-green" : "mc-text-red"}`}>
                {netDifference >= 0 ? "+" : ""}{currency}{Math.round(netDifference)}
                <TrendingUp className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* Practical Assessment block */}
          <div className="mc-dark-inset p-4 flex gap-3 text-stone-200 leading-normal">
            {scenarioTermEnd < 0 ? (
              <div className="text-sm">
                <span className="mc-text-red font-bold font-pixel text-[9px] block mb-1">⚠️ STARVING/OVERDRAFT WARNING</span>
                Your scenario results in a negative vault balance. Increase part-time job hours or scale back brewing stand coffee habits!
              </div>
            ) : netDifference > 0 ? (
              <div className="text-sm">
                <span className="mc-text-green font-bold font-pixel text-[9px] block mb-1">❇️ SURPLUS BONUS SUCCESS</span>
                Excellent! These optimized configs add <strong className="mc-text-gold">{currency}{Math.round(netDifference)}</strong> extra savings to your academic stash.
              </div>
            ) : (
              <div className="text-sm">
                <span className="font-bold font-pixel text-[9px] block text-stone-400 mb-1">ℹ️ SANDBOX INSTRUCTIONS</span>
                Adjust the options on the left to simulate higher weekly earnings or lower daily spending rates.
              </div>
            )}
          </div>
        </div>

        {/* Side-by-Side Bar Chart representation */}
        <div className="mc-gui flex flex-col gap-4 font-sans-mc">
          <h4 className="font-pixel text-[9px] text-stone-800 uppercase tracking-wide border-b border-stone-300 pb-2">
            📊 Monthly Flows Comparison
          </h4>

          <div className="space-y-4">
            {/* Income comparison */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-bold text-stone-700">Monthly Earnings</span>
                <span className="font-bold text-stone-600">{currency}{Math.round(originalMonthlyIncome)} → {currency}{Math.round(scenarioMonthlyIncome)}</span>
              </div>
              <div className="h-6 w-full bg-black/25 border border-stone-400 p-0.5">
                <div className="h-full bg-emerald-600 border border-emerald-500" style={{ width: `${Math.min(100, (scenarioMonthlyIncome / (originalMonthlyIncome || 1)) * 100)}%` }} />
              </div>
            </div>

            {/* Expense comparison */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-bold text-stone-700">Monthly Expenses</span>
                <span className="font-bold text-stone-600">{currency}{Math.round(originalMonthlyExpense)} → {currency}{Math.round(scenarioMonthlyExpense)}</span>
              </div>
              <div className="h-6 w-full bg-black/25 border border-stone-400 p-0.5">
                <div className="h-full bg-amber-600 border border-amber-500" style={{ width: `${Math.min(100, (scenarioMonthlyExpense / (originalMonthlyExpense || 1)) * 100)}%` }} />
              </div>
            </div>

            {/* One-time comparison */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-bold text-stone-700">One-time Gear Cost</span>
                <span className="font-bold text-stone-600">{currency}{Math.round(originalOneTimeExpense)} → {currency}{Math.round(scenarioOneTimeExpense)}</span>
              </div>
              <div className="h-6 w-full bg-black/25 border border-stone-400 p-0.5">
                <div className="h-full bg-rose-600 border border-rose-500" style={{ width: `${Math.min(100, (scenarioOneTimeExpense / (originalOneTimeExpense || 1)) * 100)}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
