"use client";

import { useState, useMemo, useCallback } from "react";

// --- Types ---
interface MonthlyDataPoint {
  month: number;
  mrr: number;
  arr: number;
  churn: number;
  newMrr: number;
  expansionMrr: number;
  netRevenueRetention: number;
  runwayMonths: number;
  cashBalance: number;
}

interface SimulationInputs {
  currentMRR: number;
  monthlyGrowthRate: number;
  monthlyChurnRate: number;
  expansionRate: number;
  monthlyBurn: number;
  currentCash: number;
  simulationMonths: number;
}

// --- Utility Functions ---
function formatCurrency(amount: number): string {
  if (Math.abs(amount) >= 1000000) {
    return `$${(amount / 1000000).toFixed(2)}M`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatPercent(rate: number): string {
  return `${(rate * 100).toFixed(2)}%`;
}

function simulateRunway(inputs: SimulationInputs): MonthlyDataPoint[] {
  const data: MonthlyDataPoint[] = [];
  let mrr = inputs.currentMRR;
  let cashBalance = inputs.currentCash;

  for (let month = 1; month <= inputs.simulationMonths; month++) {
    const churnAmount = mrr * inputs.monthlyChurnRate;
    const expansionMrr = mrr * inputs.expansionRate;
    const newMrr = mrr * inputs.monthlyGrowthRate;

    mrr = mrr - churnAmount + expansionMrr + newMrr;
    mrr = Math.max(0, mrr);

    const arr = mrr * 12;
    const netRevenueRetention = mrr > 0
      ? ((mrr - newMrr) / (data.length > 0 ? data[data.length - 1].mrr || mrr : mrr))
      : 0;

    // Cash flow: MRR revenue minus burn
    const monthlyRevenue = mrr;
    const monthlyExpenses = inputs.monthlyBurn;
    const netCashFlow = monthlyRevenue - monthlyExpenses;
    cashBalance = cashBalance + netCashFlow;

    // Runway calculation
    const runwayMonths = monthlyExpenses > monthlyRevenue
      ? cashBalance / (monthlyExpenses - monthlyRevenue)
      : Infinity;

    data.push({
      month,
      mrr,
      arr,
      churn: churnAmount,
      newMrr,
      expansionMrr,
      netRevenueRetention: Math.min(netRevenueRetention, 2),
      runwayMonths: Math.min(runwayMonths, 120),
      cashBalance,
    });
  }

  return data;
}

// --- Components ---
function CurrencyInput({
  label,
  value,
  onChange,
  placeholder = "0",
  helpText,
}: {
  label: string;
  value: number;
  onChange: (val: number) => void;
  placeholder?: string;
  helpText?: string;
}) {
  const [displayValue, setDisplayValue] = useState(value === 0 ? "" : value.toLocaleString("en-US"));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9.]/g, "");
    setDisplayValue(raw);
    const parsed = parseFloat(raw);
    onChange(isNaN(parsed) ? 0 : parsed);
  };

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-300">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
        <input
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full pl-7 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-sm"
        />
      </div>
      {helpText && <p className="text-xs text-gray-500">{helpText}</p>}
    </div>
  );
}

function PercentInput({
  label,
  value,
  onChange,
  helpText,
}: {
  label: string;
  value: number;
  onChange: (val: number) => void;
  helpText?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-300">{label}</label>
      <div className="relative">
        <input
          type="number"
          step="0.1"
          value={value === 0 ? "" : (value * 100).toString()}
          onChange={(e) => onChange((parseFloat(e.target.value) || 0) / 100)}
          placeholder="0"
          className="w-full pl-4 pr-8 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-sm"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">%</span>
      </div>
      {helpText && <p className="text-xs text-gray-500">{helpText}</p>}
    </div>
  );
}

function MetricCard({ label, value, sublabel, color }: { label: string; value: string; sublabel?: string; color: string }) {
  return (
    <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4 text-center">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`text-xl font-bold mt-1 ${color}`}>{value}</p>
      {sublabel && <p className="text-xs text-gray-600 mt-1">{sublabel}</p>}
    </div>
  );
}

function MiniChart({ data, dataKey, color, height = 80 }: { data: MonthlyDataPoint[]; dataKey: keyof MonthlyDataPoint; color: string; height?: number }) {
  const values = data.map((d) => d[dataKey] as number).filter((v) => isFinite(v));
  if (values.length === 0) return null;

  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const barWidth = Math.max(2, Math.min(8, 400 / values.length));

  return (
    <div className="flex items-end gap-[1px]" style={{ height }}>
      {values.map((v, i) => {
        const barHeight = Math.max(2, ((v - min) / range) * (height - 4));
        return (
          <div
            key={i}
            className={`${color} rounded-t-sm transition-all duration-300`}
            style={{
              width: `${barWidth}px`,
              height: `${barHeight}px`,
              opacity: 0.4 + (i / values.length) * 0.6,
            }}
            title={`M${i + 1}: ${typeof v === 'number' ? (v > 100 ? formatCurrency(v) : formatPercent(v)) : ''}`}
          />
        );
      })}
    </div>
  );
}

// --- Main Component ---
export default function MRRRunwayPage() {
  const [inputs, setInputs] = useState<SimulationInputs>({
    currentMRR: 25000,
    monthlyGrowthRate: 0.08,
    monthlyChurnRate: 0.03,
    expansionRate: 0.02,
    monthlyBurn: 35000,
    currentCash: 500000,
    simulationMonths: 24,
  });

  const updateInput = useCallback((field: keyof SimulationInputs, value: number) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  }, []);

  const simulation = useMemo(() => simulateRunway(inputs), [inputs]);

  const latestMonth = simulation[simulation.length - 1];
  const mrrAt6 = simulation[5]?.mrr || 0;
  const mrrAt12 = simulation[11]?.mrr || 0;
  const mrrAt24 = simulation[23]?.mrr || 0;

  const peakMRR = Math.max(...simulation.map((d) => d.mrr));
  const minRunway = Math.min(...simulation.map((d) => d.runwayMonths).filter((v) => isFinite(v)));
  const minCash = Math.min(...simulation.map((d) => d.cashBalance));

  const isProfitable = latestMonth && latestMonth.mrr > inputs.monthlyBurn;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-cyan-950 text-gray-100">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="text-3xl">🚀</span>
            SaaS MRR Runway Calculator
            <span className="text-xs font-normal bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30">
              SaaS Metrics
            </span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Simulate MRR growth, churn impact, cash runway, and path to profitability for your SaaS business.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel: Inputs */}
          <div className="lg:col-span-4 space-y-6">
            {/* Current Metrics */}
            <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl p-5 space-y-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <span className="text-lg">💰</span> Current Metrics
              </h3>
              <CurrencyInput
                label="Current MRR"
                value={inputs.currentMRR}
                onChange={(val) => updateInput("currentMRR", val)}
                helpText="Monthly Recurring Revenue"
              />
              <CurrencyInput
                label="Cash on Hand"
                value={inputs.currentCash}
                onChange={(val) => updateInput("currentCash", val)}
                helpText="Total liquid cash available"
              />
              <CurrencyInput
                label="Monthly Burn (OpEx)"
                value={inputs.monthlyBurn}
                onChange={(val) => updateInput("monthlyBurn", val)}
                helpText="Total monthly operating expenses"
              />
            </div>

            {/* Growth & Churn */}
            <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl p-5 space-y-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <span className="text-lg">📊</span> Growth Parameters
              </h3>
              <PercentInput
                label="Monthly New MRR Growth"
                value={inputs.monthlyGrowthRate}
                onChange={(val) => updateInput("monthlyGrowthRate", val)}
                helpText="New customer acquisition as % of MRR"
              />
              <PercentInput
                label="Monthly Churn Rate"
                value={inputs.monthlyChurnRate}
                onChange={(val) => updateInput("monthlyChurnRate", val)}
                helpText="Revenue lost to cancellations"
              />
              <PercentInput
                label="Monthly Expansion Rate"
                value={inputs.expansionRate}
                onChange={(val) => updateInput("expansionRate", val)}
                helpText="Upsell/cross-sell from existing customers"
              />
            </div>

            {/* Simulation Settings */}
            <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl p-5 space-y-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <span className="text-lg">⚙️</span> Simulation
              </h3>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-300">Projection Period</label>
                <select
                  value={inputs.simulationMonths}
                  onChange={(e) => updateInput("simulationMonths", parseInt(e.target.value))}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                >
                  <option value={12}>12 Months</option>
                  <option value={18}>18 Months</option>
                  <option value={24}>24 Months</option>
                  <option value={36}>36 Months</option>
                  <option value={48}>48 Months</option>
                </select>
              </div>
            </div>

            {/* Calculate Button */}
            <button
              className="w-full py-3 rounded-xl text-base font-bold transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)",
                color: "#0a0a0a",
                boxShadow: "0 0 20px rgba(0,255,136,0.3), 0 0 40px rgba(0,255,136,0.1)",
              }}
            >
              ⚡ CALCULATE RUNWAY
            </button>
          </div>

          {/* Right Panel: Results */}
          <div className="lg:col-span-8 space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <MetricCard
                label="Current MRR"
                value={formatCurrency(inputs.currentMRR)}
                sublabel={`ARR: ${formatCurrency(inputs.currentMRR * 12)}`}
                color="text-cyan-400"
              />
              <MetricCard
                label="MRR @ 12mo"
                value={formatCurrency(mrrAt12)}
                sublabel={`Growth: ${formatPercent(mrrAt12 / inputs.currentMRR - 1)}`}
                color="text-green-400"
              />
              <MetricCard
                label="Runway"
                value={isFinite(minRunway) ? `${minRunway.toFixed(0)} mo` : "∞"}
                sublabel={isProfitable ? "profitable!" : "to zero cash"}
                color={isProfitable ? "text-emerald-400" : "text-amber-400"}
              />
              <MetricCard
                label="Cash Trough"
                value={formatCurrency(Math.max(0, minCash))}
                sublabel={minCash < 0 ? "⚠️ goes negative" : "minimum balance"}
                color={minCash < 0 ? "text-red-400" : "text-indigo-400"}
              />
            </div>

            {/* MRR Projection Chart */}
            <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl p-5 space-y-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <span className="text-lg">📈</span> MRR Projection
              </h3>
              <MiniChart data={simulation} dataKey="mrr" color="bg-cyan-400" height={120} />
              <div className="grid grid-cols-4 gap-4 text-center text-xs">
                <div>
                  <p className="text-gray-500">Month 6</p>
                  <p className="text-cyan-400 font-bold font-mono">{formatCurrency(mrrAt6)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Month 12</p>
                  <p className="text-cyan-400 font-bold font-mono">{formatCurrency(mrrAt12)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Month 24</p>
                  <p className="text-cyan-400 font-bold font-mono">{formatCurrency(mrrAt24)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Peak MRR</p>
                  <p className="text-green-400 font-bold font-mono">{formatCurrency(peakMRR)}</p>
                </div>
              </div>
            </div>

            {/* Cash Balance Chart */}
            <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl p-5 space-y-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <span className="text-lg">💵</span> Cash Balance Over Time
              </h3>
              <MiniChart data={simulation} dataKey="cashBalance" color="bg-emerald-400" height={100} />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Start: {formatCurrency(inputs.currentCash)}</span>
                <span>
                  End: <span className={latestMonth.cashBalance >= 0 ? "text-emerald-400" : "text-red-400"}>{formatCurrency(latestMonth.cashBalance)}</span>
                </span>
              </div>
            </div>

            {/* Key Metrics Table */}
            <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl p-5 space-y-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <span className="text-lg">📋</span> Monthly Breakdown
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-2 text-gray-500 font-medium">Month</th>
                      <th className="text-right py-2 text-gray-500 font-medium">MRR</th>
                      <th className="text-right py-2 text-gray-500 font-medium">New MRR</th>
                      <th className="text-right py-2 text-gray-500 font-medium">Churn</th>
                      <th className="text-right py-2 text-gray-500 font-medium">Cash</th>
                      <th className="text-right py-2 text-gray-500 font-medium">Runway</th>
                    </tr>
                  </thead>
                  <tbody>
                    {simulation.filter((_, i) => i % Math.ceil(simulation.length / 12) === 0 || i === simulation.length - 1).map((d) => (
                      <tr key={d.month} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="py-2 text-gray-300 font-mono">M{d.month}</td>
                        <td className="py-2 text-right text-cyan-400 font-mono">{formatCurrency(d.mrr)}</td>
                        <td className="py-2 text-right text-green-400 font-mono">+{formatCurrency(d.newMrr)}</td>
                        <td className="py-2 text-right text-red-400 font-mono">-{formatCurrency(d.churn)}</td>
                        <td className={`py-2 text-right font-mono ${d.cashBalance >= 0 ? "text-gray-300" : "text-red-400"}`}>
                          {formatCurrency(d.cashBalance)}
                        </td>
                        <td className={`py-2 text-right font-mono ${d.runwayMonths > 12 ? "text-emerald-400" : d.runwayMonths > 6 ? "text-amber-400" : "text-red-400"}`}>
                          {isFinite(d.runwayMonths) ? `${d.runwayMonths.toFixed(0)}mo` : "∞"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Profitability Status */}
            <div className={`rounded-xl p-5 border ${isProfitable ? "bg-emerald-500/10 border-emerald-500/30" : "bg-amber-500/10 border-amber-500/30"}`}>
              <h3 className={`text-base font-semibold ${isProfitable ? "text-emerald-400" : "text-amber-400"}`}>
                {isProfitable ? "✅ Path to Profitability: ACHIEVED" : "⚠️ Runway Alert: Cash Depletion Risk"}
              </h3>
              <p className="text-sm text-gray-400 mt-2">
                {isProfitable
                  ? `Your MRR exceeds monthly burn by ${formatCurrency(latestMonth.mrr - inputs.monthlyBurn)}. At current growth rates, you achieve sustainable profitability.`
                  : `With current burn rate of ${formatCurrency(inputs.monthlyBurn)} vs MRR of ${formatCurrency(latestMonth.mrr)}, minimum runway is approximately ${isFinite(minRunway) ? `${minRunway.toFixed(0)} months` : "unknown"}. Consider reducing burn or accelerating growth.`
                }
              </p>
            </div>

            {/* Disclaimer */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
              <p className="text-xs text-amber-300/80 leading-relaxed">
                <strong>⚠️ Disclaimer:</strong> This calculator provides projections based on constant growth/churn assumptions.
                Real SaaS metrics fluctuate with market conditions, seasonality, and competitive dynamics.
                Use this as a planning tool, not a guarantee of future performance.
              </p>
            </div>
          </div>
        </div>

        {/* SEO Article */}
        <article className="mt-16 max-w-4xl mx-auto prose prose-invert">
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-8 space-y-6 text-gray-300 leading-relaxed">
            <h2 className="text-2xl font-bold text-cyan-400">The Complete Guide to SaaS MRR Runway: Metrics, Modeling, and Path to Profitability</h2>

            <p>
              For SaaS founders and operators, understanding the relationship between Monthly Recurring Revenue (MRR), growth rate, churn, and cash runway is not just an academic exercise — it is the difference between building a sustainable business and running out of cash. The MRR Runway Calculator provides a quantitative framework for modeling these dynamics, but the real value comes from understanding the underlying principles and how they interact. This comprehensive guide covers everything from basic SaaS metrics to advanced runway modeling techniques used by venture-backed startups and growth-stage companies.
            </p>

            <h3 className="text-xl font-semibold text-cyan-300">Understanding MRR and ARR</h3>
            <p>
              Monthly Recurring Revenue (MRR) is the lifeblood metric of any subscription-based business. It represents the predictable, recurring revenue you expect to receive each month from your active subscribers. MRR excludes one-time fees, setup charges, and professional services revenue — it includes only the subscription component that customers pay for on a recurring basis. Annual Recurring Revenue (ARR) is simply MRR multiplied by 12, providing an annualized view that is useful for benchmarking against annual contract values and for communicating with investors who think in annual terms.
            </p>
            <p>
              MRR can be decomposed into several components: New MRR (from new customers), Expansion MRR (from upsells, cross-sells, and upgrades), Contraction MRR (from downgrades), and Churn MRR (from cancellations). Understanding this decomposition is critical because two companies with identical net MRR growth can have vastly different business health — one might be growing through new customer acquisition while the other is growing through expansion of existing accounts, and the latter typically has much better unit economics and sustainability.
            </p>

            <h3 className="text-xl font-semibold text-cyan-300">Churn Rate: The Silent Killer</h3>
            <p>
              Churn is the percentage of revenue lost each month due to customer cancellations or downgrades. It is often called the &ldquo;silent killer&rdquo; of SaaS businesses because even modest churn rates compound destructively over time. A company with 5% monthly churn loses approximately 46% of its revenue over the course of a year — meaning it must replace nearly half its revenue just to stay flat. The mathematical relationship is straightforward: if your monthly growth rate is 8% and your churn rate is 5%, your net growth rate is only 3%. Over 24 months, the difference between 8% net growth and 3% net growth is approximately 4x in terms of final MRR.
            </p>
            <p>
              There are two types of churn to track: logo churn (percentage of customers lost) and revenue churn (percentage of revenue lost). Revenue churn is more important for financial modeling because it directly impacts MRR. A company can have low logo churn but high revenue churn if it loses its largest customers, or high logo churn but low revenue churn if it primarily loses small customers. Net Revenue Retention (NRR) — the percentage of revenue retained from existing customers, including expansion — is the gold standard metric. Best-in-class SaaS companies achieve NRR above 120%, meaning their existing customer base grows even without any new customer acquisition.
            </p>

            <h3 className="text-xl font-semibold text-cyan-300">Cash Runway: Time Is Everything</h3>
            <p>
              Cash runway answers the most existential question for any startup: how many months until we run out of money? The formula is deceptively simple: runway = current cash balance / monthly net burn rate. However, the calculation becomes more nuanced when you account for growing revenue. If your MRR is growing, your monthly net burn decreases over time, extending your effective runway beyond what a simple static calculation would suggest. Conversely, if churn is high and MRR is declining, your burn rate effectively increases, shortening your runway.
            </p>
            <p>
              The concept of &ldquo;default alive&rdquo; versus &ldquo;default dead&rdquo; (coined by Paul Graham) captures this dynamic perfectly. A company is default alive if, assuming current growth and burn rates continue, it will reach profitability before running out of cash. It is default dead if it will run out of cash before becoming profitable. The MRR Runway Calculator models this explicitly by projecting both MRR growth and cash balance forward in time, showing you exactly when (if ever) your MRR exceeds your monthly expenses.
            </p>

            <h3 className="text-xl font-semibold text-cyan-300">The Growth-Churn Tension</h3>
            <p>
              Every SaaS company faces a fundamental tension between growth and retention. Aggressive customer acquisition often leads to higher churn if the product-market fit is not strong enough to retain those customers. Conversely, focusing exclusively on retention can limit top-line growth. The optimal strategy depends on your stage: early-stage companies should prioritize finding product-market fit (which naturally reduces churn) before scaling acquisition. Growth-stage companies need to balance acquisition velocity with retention quality. The simulator helps you model different scenarios: what happens if you increase growth rate but churn also increases? What if you reduce churn by 1% but it costs 2% of growth? These tradeoffs are quantifiable and should drive strategic decisions.
            </p>

            <h3 className="text-xl font-semibold text-cyan-300">Expansion Revenue: The Secret Weapon</h3>
            <p>
              Expansion revenue — upselling existing customers to higher tiers, cross-selling additional products, and capturing usage-based growth — is the secret weapon of the best SaaS companies. It is significantly cheaper to expand an existing customer relationship than to acquire a new one (typically 5-25x cheaper depending on the industry). Companies like Salesforce, HubSpot, and Snowflake have built massive businesses by achieving negative net churn: their expansion revenue exceeds their churn revenue, meaning their existing customer base grows organically over time. In the simulator, the expansion rate parameter models this effect — even a 2% monthly expansion rate compounds to approximately 27% additional annual revenue from existing customers alone.
            </p>

            <h3 className="text-xl font-semibold text-cyan-300">Burn Rate and Operating Leverage</h3>
            <p>
              Monthly burn rate (total operating expenses minus revenue) determines how quickly you are consuming cash. For venture-backed startups, managing burn rate is a delicate balance: spend too aggressively and you risk running out of cash before achieving key milestones; spend too conservatively and you may miss market opportunities or allow competitors to outpace you. The concept of operating leverage — where revenue grows faster than expenses — is the path to profitability. As MRR scales, fixed costs (engineering, infrastructure, G&A) are spread over a larger revenue base, improving margins. Variable costs (sales commissions, customer success, support) should scale roughly linearly with revenue, but even here, efficiency improvements through automation and process optimization can improve unit economics.
            </p>

            <h3 className="text-xl font-semibold text-cyan-300">Scenario Modeling and Sensitivity Analysis</h3>
            <p>
              The most valuable use of a runway calculator is scenario modeling: running multiple simulations with different assumptions to understand the range of possible outcomes. Best case: what if growth accelerates to 12% and churn drops to 2%? Base case: current trends continue. Worst case: growth slows to 3% and churn increases to 5%? By modeling these scenarios, you can identify the key levers that determine your outcome and focus your operational efforts accordingly. Sensitivity analysis — changing one variable at a time while holding others constant — reveals which parameters have the largest impact on runway and final MRR. In most SaaS models, churn rate is the single most sensitive parameter: a 1% change in monthly churn can mean the difference between a $10M ARR outcome and a $2M ARR outcome over a 3-year period.
            </p>

            <h3 className="text-xl font-semibold text-cyan-300">Unit Economics: LTV, CAC, and Payback Period</h3>
            <p>
              While the MRR Runway Calculator focuses on top-line metrics and cash dynamics, understanding unit economics is essential for long-term planning. Customer Lifetime Value (LTV) is calculated as ARPU / monthly churn rate (for a simplified model) or more accurately as the discounted sum of future cash flows from a customer. Customer Acquisition Cost (CAC) includes all sales and marketing expenses divided by the number of new customers acquired. The LTV/CAC ratio is a key health metric: below 3:1 suggests you are spending too much to acquire customers relative to their value; above 5:1 suggests you may be under-investing in growth. CAC payback period (CAC / monthly gross margin per customer) tells you how many months it takes to recover the cost of acquiring a customer — best-in-class companies achieve payback in 12-18 months.
            </p>

            <h3 className="text-xl font-semibold text-cyan-300">Fundraising Implications</h3>
            <p>
              Your runway and MRR trajectory directly impact your fundraising strategy and valuation. Investors look for companies that are either default alive (reducing their urgency to raise) or have clear milestones that the raised capital will achieve. A company with 6 months of runway has very different negotiating leverage than one with 18 months. The Rule of 40 (revenue growth rate + profit margin should exceed 40%) is a common heuristic used by growth-stage investors to evaluate SaaS companies. The simulator helps you plan your fundraising timeline: if you need 6-9 months to raise a round, you should start the process when you have at least 12-15 months of runway remaining.
            </p>

            <h3 className="text-xl font-semibold text-cyan-300">Practical Tips for Using This Calculator</h3>
            <p>
              Start with your actual current metrics — do not use aspirational numbers. Use your trailing 3-month average for growth and churn rates to smooth out anomalies. Model three scenarios (optimistic, base, pessimistic) and plan your operations around the base case while ensuring you survive the pessimistic case. Pay special attention to the cash balance chart: if it dips below zero, you have a critical problem that requires immediate action (either reducing burn, raising capital, or accelerating revenue). Use the monthly breakdown table to identify the inflection point where MRR exceeds burn — this is your profitability milestone. Share these projections with your leadership team and board to align on strategy and resource allocation.
            </p>

            <h3 className="text-xl font-semibold text-cyan-300">Conclusion</h3>
            <p>
              The SaaS MRR Runway Calculator is more than a projection tool — it is a strategic planning framework that forces you to think quantitatively about the interplay between growth, retention, and cash management. The companies that thrive in the SaaS market are those that understand these dynamics deeply and make data-driven decisions about where to invest their resources. Whether you are a bootstrapped founder optimizing for sustainability, a venture-backed CEO planning your next fundraise, or an operator managing a portfolio of SaaS products, mastering these metrics and their interactions is essential for building a durable, profitable software business.
            </p>
          </div>
        </article>
      </div>
    </div>
  );
}