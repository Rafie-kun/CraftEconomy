import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { BudgetProfile } from "../types";

interface VisualChartsProps {
  profile: BudgetProfile;
}

export default function VisualCharts({ profile }: VisualChartsProps) {
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

  const getOneTimeExpenses = () => {
    return expenses.filter((e) => e.frequency === 'one-time');
  };

  const getOneTimeIncomes = () => {
    return incomes.filter((i) => i.frequency === 'one-time');
  };

  // Build 12-Month/Term-Month Cash Flow Data
  const chartData = [];
  let currentBalance = academic.initialSavings;
  const monthlyInc = getMonthlyIncome();
  const monthlyExp = getMonthlyRecurringExpense();

  const oneTimeExpenses = getOneTimeExpenses();
  const oneTimeIncomes = getOneTimeIncomes();

  for (let month = 0; month <= academic.termMonths; month++) {
    if (month === 0) {
      chartData.push({
        name: "Start",
        Balance: Math.round(currentBalance),
        Income: 0,
        Expense: 0,
      });
    } else {
      let monthIncome = monthlyInc;
      let monthExpense = monthlyExp;

      // Inject one-time purchases into Month 1 (start of term)
      if (month === 1) {
        const oneTimeExpSum = oneTimeExpenses.reduce((sum, item) => sum + item.amount, 0);
        const oneTimeIncSum = oneTimeIncomes.reduce((sum, item) => sum + item.amount, 0);
        monthExpense += oneTimeExpSum;
        monthIncome += oneTimeIncSum;
      }

      currentBalance += (monthIncome - monthExpense);

      chartData.push({
        name: `Month ${month}`,
        Balance: Math.round(currentBalance),
        Income: Math.round(monthIncome),
        Expense: Math.round(monthExpense),
      });
    }
  }

  // Build Pie Chart Data for Expense Distribution
  const categoryTotals: { [key: string]: number } = {};
  expenses.forEach((item) => {
    let monthlyAmount = item.amount;
    if (item.frequency === 'weekly') monthlyAmount = item.amount * 4.33;
    else if (item.frequency === 'daily') monthlyAmount = item.amount * 30;
    else if (item.frequency === 'one-time') {
      monthlyAmount = item.amount / academic.termMonths;
    }

    categoryTotals[item.category] = (categoryTotals[item.category] || 0) + monthlyAmount;
  });

  const pieData = Object.keys(categoryTotals).map((cat) => ({
    name: cat.charAt(0).toUpperCase() + cat.slice(1),
    value: Math.round(categoryTotals[cat]),
  })).filter(item => item.value > 0);

  // Minecraft blocks/materials colors mapping
  const COLORS = {
    fees: "#aa00aa",      // Portal Obsidian Purple
    rent: "#805b33",      // Oak wood Planks Brown
    food: "#ff5555",      // Sweet Berries Red
    transport: "#55ffff", // Diamond Blue
    gear: "#aaaaaa",      // Iron block grey
    social: "#ff55ff",    // Pink dye / cake pink
    books: "#55ff55",     // Grass block Green
    other: "#555555",     // Cobblestone grey
  };

  const getPieColor = (name: string) => {
    const key = name.toLowerCase() as keyof typeof COLORS;
    return COLORS[key] || "#555555";
  };

  const isBalanceHealthy = currentBalance >= 0;

  return (
    <div id="visual-charts-container" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Term Balance Projections */}
      <div id="chart-balance-projection" className="mc-gui flex flex-col h-[420px]">
        <div className="mb-4">
          <h3 className="font-pixel text-xs text-stone-800 uppercase tracking-wider">📊 Term Balance Projections</h3>
          <p className="text-xs text-stone-600 font-sans-mc mt-1">
            Simulates starting vault savings, recurring emerald flows, and one-time purchases (e.g. Laptop, Books) in Month 1.
          </p>
        </div>

        <div className="flex-1 min-h-0 w-full bg-stone-900/10 p-2.5 rounded-sm border border-stone-400">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isBalanceHealthy ? "#55ff55" : "#ff5555"} stopOpacity={0.4}/>
                  <stop offset="95%" stopColor={isBalanceHealthy ? "#55ff55" : "#ff5555"} stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="0" stroke="#b0b0b0" opacity={0.5} />
              <XAxis dataKey="name" stroke="#3c3c3c" fontSize={12} tickLine={false} style={{ fontFamily: 'VT323', fontWeight: 'bold' }} />
              <YAxis stroke="#3c3c3c" fontSize={12} tickLine={false} tickFormatter={(val) => `${currency}${val}`} style={{ fontFamily: 'VT323', fontWeight: 'bold' }} />
              <Tooltip
                formatter={(value) => [`${currency}${value}`, "Vault Balance"]}
                contentStyle={{ 
                  backgroundColor: "#c6c6c6", 
                  border: "4px solid #555555", 
                  fontFamily: "VT323",
                  fontSize: "14px",
                  fontWeight: "bold",
                  color: "#3c3c3c" 
                }}
              />
              <Area
                type="step"
                dataKey="Balance"
                stroke={isBalanceHealthy ? "#00aa00" : "#aa0000"}
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorBalance)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-pixel text-[9px] bg-black/10 p-2 border border-black/5">
          <span>Vault Start: <strong className="text-stone-800">{currency}{academic.initialSavings}</strong></span>
          <span>Lowest Point: <strong className="text-stone-800">{currency}{Math.min(...chartData.map(d => d.Balance))}</strong></span>
          <span>End Forecast: <strong className={currentBalance >= 0 ? "mc-text-green font-bold" : "mc-text-red font-bold"}>{currency}{chartData[chartData.length - 1].Balance}</strong></span>
        </div>
      </div>

      {/* Monthly Expense Breakdown Pie */}
      <div id="chart-expense-breakdown" className="mc-gui flex flex-col h-[420px]">
        <div className="mb-4">
          <h3 className="font-pixel text-xs text-stone-800 uppercase tracking-wider">🍖 Amortized Monthly Outlays</h3>
          <p className="text-xs text-stone-600 font-sans-mc mt-1">
            Converts all outlays to a monthly average (including one-time gear/books distributed over the {academic.termMonths}-month term).
          </p>
        </div>

        {pieData.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center mc-dark-inset text-stone-400 p-4">
            <span className="font-pixel text-xs text-center">Empty Storage slots. Register expenses to load the pie matrix!</span>
          </div>
        ) : (
          <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-6 min-h-0 bg-stone-900/10 p-3 rounded-sm border border-stone-400">
            <div className="w-full sm:w-1/2 h-[200px] sm:h-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={0}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getPieColor(entry.name)} stroke="#3c3c3c" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => `${currency}${value}/mo`} 
                    contentStyle={{ 
                      backgroundColor: "#c6c6c6", 
                      border: "4px solid #555555", 
                      fontFamily: "VT323",
                      fontSize: "14px",
                      fontWeight: "bold",
                      color: "#3c3c3c" 
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="font-pixel text-[8px] text-stone-500 uppercase tracking-tighter">Total Cost</span>
                <span className="font-pixel text-base text-stone-800 font-bold mt-1">
                  {currency}{Math.round(pieData.reduce((acc, curr) => acc + curr.value, 0))}
                </span>
              </div>
            </div>

            {/* Minecraft styled custom Legend */}
            <div className="w-full sm:w-1/2 overflow-y-auto max-h-[160px] sm:max-h-full pr-1 font-sans-mc">
              <div className="grid grid-cols-2 gap-3">
                {pieData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm bg-black/5 p-1.5 rounded border border-black/5">
                    <span
                      className="w-4.5 h-4.5 shrink-0 border border-stone-900"
                      style={{ backgroundColor: getPieColor(item.name) }}
                    />
                    <div className="truncate">
                      <span className="font-bold text-stone-800 block truncate leading-tight">{item.name}</span>
                      <span className="text-stone-500 font-semibold">{currency}{item.value}/mo</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
