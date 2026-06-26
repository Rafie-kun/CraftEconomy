import { BudgetProfile } from "../types";
import { Wallet, CreditCard, TrendingUp, GraduationCap, Sparkles } from "lucide-react";

interface BudgetSummaryProps {
  profile: BudgetProfile;
}

// 9x9 Pixel Art Minecraft Heart Component
function MCHeart({ type }: { type: 'red' | 'half' | 'empty' | 'gold' | 'wither'; key?: string }) {
  // Define pixel map colors based on type
  let fillMain = "#ff2222";       // Classic Red Heart
  let fillHighlight = "#ffffff";
  let fillShadow = "#aa0000";

  if (type === 'gold') {
    fillMain = "#fdf55f";         // Absorption/Golden Heart
    fillHighlight = "#ffffff";
    fillShadow = "#c89b00";
  } else if (type === 'wither') {
    fillMain = "#2a221f";         // Withered Heart
    fillHighlight = "#5c5c5c";
    fillShadow = "#15100e";
  } else if (type === 'empty') {
    fillMain = "transparent";
    fillHighlight = "transparent";
    fillShadow = "transparent";
  }

  // Draw 9x9 pixels using SVG rects
  return (
    <svg width="22" height="22" viewBox="0 0 9 9" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ imageRendering: 'pixelated' }} className="shrink-0">
      {/* Outer black outline */}
      <rect x="1" y="0" width="3" height="1" fill="#000000" />
      <rect x="5" y="0" width="3" height="1" fill="#000000" />
      <rect x="0" y="1" width="1" height="3" fill="#000000" />
      <rect x="4" y="1" width="1" height="1" fill="#000000" />
      <rect x="8" y="1" width="1" height="3" fill="#000000" />
      <rect x="1" y="4" width="1" height="1" fill="#000000" />
      <rect x="7" y="4" width="1" height="1" fill="#000000" />
      <rect x="2" y="5" width="1" height="1" fill="#000000" />
      <rect x="6" y="5" width="1" height="1" fill="#000000" />
      <rect x="3" y="6" width="1" height="1" fill="#000000" />
      <rect x="5" y="6" width="1" height="1" fill="#000000" />
      <rect x="4" y="7" width="1" height="1" fill="#000000" />

      {/* Heart Inner Fill */}
      {type !== 'empty' && (
        <>
          {/* Main bulk fill */}
          <rect x="1" y="1" width="3" height="3" fill={fillMain} />
          <rect x="5" y="1" width="3" height="3" fill={fillMain} />
          <rect x="2" y="4" width="5" height="1" fill={fillMain} />
          <rect x="3" y="5" width="3" height="1" fill={fillMain} />
          <rect x="4" y="6" width="1" height="1" fill={fillMain} />

          {/* Left highlight */}
          <rect x="1" y="1" width="1" height="1" fill={fillHighlight} />
          <rect x="5" y="1" width="1" height="1" fill={fillHighlight} />
          {type !== 'wither' && <rect x="2" y="1" width="1" height="1" fill={fillHighlight} opacity="0.6" />}

          {/* Dark Shadow / Depth outline */}
          <rect x="3" y="2" width="1" height="2" fill={fillShadow} />
          <rect x="7" y="2" width="1" height="2" fill={fillShadow} />
          <rect x="6" y="4" width="1" height="1" fill={fillShadow} />
          <rect x="5" y="5" width="1" height="1" fill={fillShadow} />

          {/* Half-heart custom overlay */}
          {type === 'half' && (
            <rect x="4" y="1" width="4" height="6" fill="#4d4d4d" opacity="0.85" />
          )}
        </>
      )}
    </svg>
  );
}

// 9x9 Pixel Art Minecraft Food (Hunger Drumstick) Component
function MCFood({ type }: { type: 'full' | 'half' | 'empty'; key?: string }) {
  const outline = "#000000";
  const meatColor = "#b35c2e";
  const meatShadow = "#783b1a";
  const boneColor = "#e6e6e6";

  return (
    <svg width="22" height="22" viewBox="0 0 9 9" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ imageRendering: 'pixelated' }} className="shrink-0">
      {/* Outer Outline */}
      <rect x="3" y="0" width="3" height="1" fill={outline} />
      <rect x="2" y="1" width="1" height="1" fill={outline} />
      <rect x="6" y="1" width="1" height="1" fill={outline} />
      <rect x="1" y="2" width="1" height="3" fill={outline} />
      <rect x="5" y="2" width="1" height="1" fill={outline} />
      <rect x="7" y="2" width="1" height="2" fill={outline} />
      <rect x="4" y="3" width="1" height="1" fill={outline} />
      <rect x="6" y="4" width="1" height="1" fill={outline} />
      <rect x="2" y="5" width="2" height="1" fill={outline} />
      <rect x="5" y="5" width="1" height="1" fill={outline} />
      <rect x="4" y="6" width="1" height="1" fill={outline} />
      <rect x="3" y="7" width="1" height="1" fill={outline} />
      <rect x="2" y="8" width="1" height="1" fill={outline} />

      {/* Inner Fill */}
      {type !== 'empty' && (
        <>
          {/* Bone structure */}
          <rect x="3" y="6" width="1" height="1" fill={boneColor} />
          <rect x="2" y="7" width="1" height="1" fill={boneColor} />

          {/* Drumstick Meat */}
          <rect x="3" y="1" width="3" height="1" fill={meatColor} />
          <rect x="2" y="2" width="3" height="1" fill={meatColor} />
          <rect x="2" y="3" width="2" height="1" fill={meatColor} />
          <rect x="2" y="4" width="3" height="1" fill={meatColor} />
          <rect x="4" y="5" width="1" height="1" fill={meatColor} />

          {/* Shadow & Highlights */}
          <rect x="5" y="2" width="1" height="3" fill={meatShadow} />
          <rect x="6" y="3" width="1" height="1" fill={meatShadow} />
          <rect x="3" y="4" width="1" height="1" fill={meatShadow} />

          {/* Half drumstick override */}
          {type === 'half' && (
            <rect x="1" y="1" width="4" height="5" fill="#4d4d4d" opacity="0.85" />
          )}
        </>
      )}
    </svg>
  );
}

export default function BudgetSummary({ profile }: BudgetSummaryProps) {
  const { academic, incomes, expenses } = profile;
  const currency = academic.currency;

  // Calculate Monthly Totals
  const getMonthlyIncome = () => {
    return incomes.reduce((sum, item) => {
      let multiplier = 0;
      if (item.frequency === 'monthly') multiplier = 1;
      else if (item.frequency === 'weekly') multiplier = 4.33;
      return sum + item.amount * multiplier;
    }, 0);
  };

  const getMonthlyRecurringExpense = () => {
    return expenses
      .filter((e) => e.frequency !== 'one-time')
      .reduce((sum, item) => {
        let multiplier = 0;
        if (item.frequency === 'monthly') multiplier = 1;
        else if (item.frequency === 'weekly') multiplier = 4.33;
        else if (item.frequency === 'daily') multiplier = 30;
        return sum + item.amount * multiplier;
      }, 0);
  };

  const monthlyIncome = getMonthlyIncome();
  const monthlyExpense = getMonthlyRecurringExpense();
  const oneTimeExpenses = expenses.filter((e) => e.frequency === 'one-time');
  const oneTimeIncomes = incomes.filter((i) => i.frequency === 'one-time');

  const oneTimeExpSum = oneTimeExpenses.reduce((sum, item) => sum + item.amount, 0);
  const oneTimeIncSum = oneTimeIncomes.reduce((sum, item) => sum + item.amount, 0);

  const monthlyNet = monthlyIncome - monthlyExpense;
  const projectedTermSavings = academic.initialSavings + (monthlyNet * academic.termMonths) - oneTimeExpSum + oneTimeIncSum;

  // Minecraft Heart Health Calculation
  // We represent "Academic Financial Health" from 0 to 10 Hearts.
  // Starting point or standard healthy surplus gets full hearts. Deficit is withered.
  let heartType: 'red' | 'gold' | 'wither' = 'red';
  let heartCount = 10;

  if (projectedTermSavings < 0) {
    heartType = 'wither'; // Wither/dead state
    heartCount = 10;
  } else if (monthlyNet > 500) {
    heartType = 'gold';  // Diamond/golden absorption tier!
    heartCount = 10;
  } else {
    // Normal survival status based on how fast starting savings are draining
    const totalRemaining = projectedTermSavings;
    const initialFunds = academic.initialSavings || 1;
    const ratio = totalRemaining / initialFunds;
    
    // Scale hearts down based on budget depletion ratio
    heartCount = Math.max(1, Math.min(10, Math.ceil(ratio * 10)));
  }

  // Hunger Drumstick calculation based on Savings depletion / Monthly spend
  // High spending is "starving" (low hunger count). Safe thriftiness keeps hunger full!
  const expenseRatio = monthlyIncome > 0 ? (monthlyExpense / monthlyIncome) : 1.2;
  let hungerCount = 10;
  if (expenseRatio <= 0.4) hungerCount = 10;
  else if (expenseRatio <= 0.6) hungerCount = 8;
  else if (expenseRatio <= 0.8) hungerCount = 6;
  else if (expenseRatio <= 1.0) hungerCount = 4;
  else hungerCount = 2; // Starving!

  // Minecraft health status string description
  let statusHeader = "STABLE EXPLORER";
  let statusColorClass = "mc-text-green";
  let statusDesc = "Your emerald production securely exceeds your item outlays. Safe travels!";

  if (projectedTermSavings < 0) {
    statusHeader = "HARDCORE SURVIVAL WARNING";
    statusColorClass = "mc-text-red";
    statusDesc = "Danger! You are scheduled to enter overdraft before final month. Craft extra job incomes!";
  } else if (expenseRatio > 0.9) {
    statusHeader = "HUNGRY SURVIVOR";
    statusColorClass = "mc-text-yellow";
    statusDesc = "Warning! Expenses consume almost all regular income. Mine safer sources of cash.";
  } else if (monthlyNet <= 0) {
    statusHeader = "SLOW POISON DAMAGE";
    statusColorClass = "mc-text-gold";
    statusDesc = "Starting vault funds are slowly depleting due to recurring monthly spending.";
  }

  // Key item lookups
  const tuitionExpense = expenses.find(e => e.category === 'fees');
  const laptopExpense = expenses.find(e => e.name.toLowerCase().includes('laptop') || e.category === 'gear');
  const booksExpense = expenses.find(e => e.name.toLowerCase().includes('book') || e.category === 'books');

  return (
    <div id="budget-summary-root" className="space-y-8">
      {/* HUD-Style Health & Hunger Status Bars */}
      <div className="mc-gui p-5 rounded-none flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Heart Health bar */}
        <div className="flex flex-col gap-2 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="font-pixel text-xs tracking-wider text-stone-700">Financial Health:</span>
            <span className="font-pixel text-[11px] text-rose-600 font-bold uppercase tracking-widest">{heartType === 'wither' ? "WITHERED" : "HEALTHY"}</span>
          </div>
          <div className="flex flex-wrap gap-1 bg-black/10 p-2.5 rounded-lg border border-black/5">
            {Array.from({ length: 10 }).map((_, i) => (
              <MCHeart key={`heart-${i}`} type={i < heartCount ? heartType : 'empty'} />
            ))}
          </div>
        </div>

        {/* Hunger/Drumstick bar */}
        <div className="flex flex-col gap-2 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="font-pixel text-xs tracking-wider text-stone-700">Thriftiness Index:</span>
            <span className="font-pixel text-[11px] text-amber-700 font-bold uppercase tracking-widest">{hungerCount >= 8 ? "SATURATED" : hungerCount >= 5 ? "PECKISH" : "STARVING"}</span>
          </div>
          <div className="flex flex-wrap gap-1 bg-black/10 p-2.5 rounded-lg border border-black/5">
            {Array.from({ length: 10 }).map((_, i) => (
              <MCFood key={`food-${i}`} type={i < hungerCount ? 'full' : 'empty'} />
            ))}
          </div>
        </div>
      </div>

      {/* 4 Core Item Inventory Slots */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1: Monthly Income */}
        <div className="mc-gui flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="mc-hotbar-slot shrink-0">
              {/* Custom Emerald block vector representation */}
              <svg width="24" height="24" viewBox="0 0 9 9" fill="none" style={{ imageRendering: 'pixelated' }}>
                <rect x="3" y="1" width="3" height="7" fill="#55ff55" />
                <rect x="2" y="2" width="5" height="5" fill="#55ff55" />
                <rect x="4" y="0" width="1" height="9" fill="#55ff55" />
                <rect x="1" y="4" width="7" height="1" fill="#55ff55" />
                {/* Outlines */}
                <rect x="2" y="1" width="1" height="1" fill="#00aa00" />
                <rect x="6" y="1" width="1" height="1" fill="#00aa00" />
                <rect x="1" y="2" width="1" height="2" fill="#00aa00" />
                <rect x="7" y="2" width="1" height="2" fill="#00aa00" />
                <rect x="2" y="7" width="1" height="1" fill="#00aa00" />
                <rect x="6" y="7" width="1" height="1" fill="#00aa00" />
                <rect x="1" y="5" width="1" height="2" fill="#00aa00" />
                <rect x="7" y="5" width="1" height="2" fill="#00aa00" />
                {/* Shiny white highlight */}
                <rect x="4" y="2" width="1" height="1" fill="#ffffff" />
              </svg>
            </div>
            <div>
              <span className="font-pixel text-[10px] block text-stone-600 uppercase tracking-tight">Est. Monthly Influx</span>
              <span className="font-pixel text-lg mc-text-green font-bold">{currency}{Math.round(monthlyIncome)}</span>
            </div>
          </div>
          <p className="text-xs text-stone-600 font-sans-mc leading-normal border-t border-stone-300 pt-1.5">
            Incoming emerald transfers from jobs, stipends, and allowances.
          </p>
        </div>

        {/* Metric 2: Monthly Spending */}
        <div className="mc-gui flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="mc-hotbar-slot shrink-0">
              {/* Custom Redstone Dust vector */}
              <svg width="24" height="24" viewBox="0 0 9 9" fill="none" style={{ imageRendering: 'pixelated' }}>
                <rect x="4" y="1" width="1" height="7" fill="#ff5555" />
                <rect x="1" y="4" width="7" height="1" fill="#ff5555" />
                <rect x="3" y="3" width="3" height="3" fill="#aa0000" />
                <rect x="4" y="4" width="1" height="1" fill="#ffaaaa" />
              </svg>
            </div>
            <div>
              <span className="font-pixel text-[10px] block text-stone-600 uppercase tracking-tight">Est. Monthly Outflow</span>
              <span className="font-pixel text-lg mc-text-red font-bold">{currency}{Math.round(monthlyExpense)}</span>
            </div>
          </div>
          <p className="text-xs text-stone-600 font-sans-mc leading-normal border-t border-stone-300 pt-1.5">
            Regular upkeep costs such as housing, weekly food prep, and cafe outings.
          </p>
        </div>

        {/* Metric 3: Net Monthly surplus */}
        <div className="mc-gui flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="mc-hotbar-slot shrink-0">
              {/* Custom Iron Ingot vector */}
              <svg width="24" height="24" viewBox="0 0 9 9" fill="none" style={{ imageRendering: 'pixelated' }}>
                <rect x="2" y="2" width="5" height="5" fill="#dcdcdc" />
                <rect x="1" y="3" width="7" height="3" fill="#dcdcdc" />
                <rect x="2" y="3" width="4" height="1" fill="#ffffff" />
                <rect x="1" y="4" width="1" height="1" fill="#ffffff" />
                <rect x="2" y="6" width="5" height="1" fill="#8a8a8a" />
                <rect x="6" y="3" width="1" height="3" fill="#8a8a8a" />
              </svg>
            </div>
            <div>
              <span className="font-pixel text-[10px] block text-stone-600 uppercase tracking-tight">Net Monthly Surplus</span>
              <span className={`font-pixel text-lg font-bold ${monthlyNet >= 0 ? "mc-text-green" : "mc-text-red"}`}>
                {monthlyNet >= 0 ? "+" : ""}{currency}{Math.round(monthlyNet)}
              </span>
            </div>
          </div>
          <p className="text-xs text-stone-600 font-sans-mc leading-normal border-t border-stone-300 pt-1.5">
            Monthly treasury yield added directly to academic storage vault.
          </p>
        </div>

        {/* Metric 4: Term End Projection */}
        <div className="mc-gui flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="mc-hotbar-slot shrink-0">
              {/* Custom Golden Chest vector */}
              <svg width="24" height="24" viewBox="0 0 9 9" fill="none" style={{ imageRendering: 'pixelated' }}>
                <rect x="1" y="1" width="7" height="7" fill="#b08a59" />
                <rect x="1" y="1" width="7" height="1" fill="#3d2811" />
                <rect x="1" y="7" width="7" height="1" fill="#3d2811" />
                <rect x="1" y="1" width="1" height="7" fill="#3d2811" />
                <rect x="7" y="1" width="1" height="7" fill="#3d2811" />
                {/* Golden Lock */}
                <rect x="4" y="3" width="1" height="2" fill="#fdf55f" />
                <rect x="4" y="5" width="1" height="1" fill="#000000" />
              </svg>
            </div>
            <div>
              <span className="font-pixel text-[10px] block text-stone-600 uppercase tracking-tight">Vault Balance End</span>
              <span className={`font-pixel text-lg font-bold ${projectedTermSavings >= 0 ? "mc-text-gold" : "mc-text-red"}`}>
                {currency}{Math.round(projectedTermSavings)}
              </span>
            </div>
          </div>
          <p className="text-xs text-stone-600 font-sans-mc leading-normal border-t border-stone-300 pt-1.5">
            Total remaining treasury calculated at Month {academic.termMonths}.
          </p>
        </div>
      </div>

      {/* Main HUD Assessment & Equipment Outlays */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status panel */}
        <div className="lg:col-span-2 mc-gui flex flex-col justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-stone-300 pb-2">
              <span className={`font-pixel text-sm uppercase tracking-wider ${statusColorClass}`}>{statusHeader}</span>
              <span className="animate-pulse w-2.5 h-2.5 bg-current shrink-0" />
            </div>
            <p className="font-sans-mc text-stone-700 text-lg leading-relaxed">{statusDesc}</p>
          </div>

          <div className="mc-dark-inset p-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-stone-200">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
              <span className="font-sans-mc text-sm">
                Starting inventory contains <strong className="mc-text-gold">{currency}{academic.initialSavings}</strong> emerald reserves.
              </span>
            </div>
            <span className="font-pixel text-[11px] tracking-wide text-stone-400">
              Active Term: {academic.termMonths} Months
            </span>
          </div>
        </div>

        {/* Important outlays */}
        <div className="mc-gui flex flex-col gap-4">
          <h4 className="font-pixel text-xs text-stone-800 border-b border-stone-300 pb-2">
            🔑 Capital Equipment Outlays
          </h4>

          <div className="space-y-3 font-sans-mc">
            {/* Tuition */}
            <div className="mc-inset p-3 flex justify-between items-center text-stone-100">
              <div>
                <span className="font-bold text-sm block">Tuition Fees</span>
                <span className="text-[10px] text-stone-300 uppercase font-mono tracking-tight">{tuitionExpense?.frequency === 'one-time' ? "One-time" : "Recurring"}</span>
              </div>
              <span className="font-bold text-lg mc-text-yellow">{currency}{tuitionExpense?.amount || 0}</span>
            </div>

            {/* Laptop */}
            <div className="mc-inset p-3 flex justify-between items-center text-stone-100">
              <div>
                <span className="font-bold text-sm block">Iron Golem Laptop</span>
                <span className="text-[10px] text-stone-300 uppercase font-mono tracking-tight">One-time purchase</span>
              </div>
              <span className="font-bold text-lg mc-text-yellow">{currency}{laptopExpense?.amount || 0}</span>
            </div>

            {/* Books */}
            <div className="mc-inset p-3 flex justify-between items-center text-stone-100">
              <div>
                <span className="font-bold text-sm block">Enchanted Textbooks</span>
                <span className="text-[10px] text-stone-300 uppercase font-mono tracking-tight">One-time buy</span>
              </div>
              <span className="font-bold text-lg mc-text-yellow">{currency}{booksExpense?.amount || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
