"use client";

import { useState, useMemo, useCallback } from "react";

// --- Types ---
interface HedgePosition {
  id: string;
  assetName: string;
  entryPrice: number;
  currentPrice: number;
  quantity: number;
  isLong: boolean;
  taxLotAge: "short" | "long";
}

interface TaxResult {
  totalUnrealizedGain: number;
  totalRealizedGain: number;
  shortTermGains: number;
  longTermGains: number;
  shortTermTax: number;
  longTermTax: number;
  totalTax: number;
  taxSaved: number;
  effectiveTaxRate: number;
  afterTaxReturn: number;
}

// --- Constants ---
const SHORT_TERM_RATE = 0.37; // Top federal bracket for short-term
const LONG_TERM_RATES = [
  { threshold: 0, rate: 0.0 },
  { threshold: 47025, rate: 0.15 },
  { threshold: 518900, rate: 0.20 },
];

const STATE_TAX_RATE = 0.05; // Average state tax
const NIIT_RATE = 0.038; // Net Investment Income Tax
const NIIT_THRESHOLD = 200000;

// --- Utility Functions ---
function formatCurrency(amount: number): string {
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

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function calculateLongTermTax(gains: number): number {
  if (gains <= 0) return 0;
  let tax = 0;
  let remaining = gains;
  for (let i = LONG_TERM_RATES.length - 1; i >= 0; i--) {
    if (remaining > LONG_TERM_RATES[i].threshold) {
      const taxable = remaining - LONG_TERM_RATES[i].threshold;
      tax += taxable * LONG_TERM_RATES[i].rate;
      remaining = LONG_TERM_RATES[i].threshold;
    }
  }
  return tax;
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
  const [displayValue, setDisplayValue] = useState(value === 0 ? "" : value.toString());

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
          className="w-full pl-7 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
        />
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

function PositionRow({
  position,
  onUpdate,
  onRemove,
}: {
  position: HedgePosition;
  onUpdate: (id: string, field: string, value: any) => void;
  onRemove: (id: string) => void;
}) {
  const gain = (position.currentPrice - position.entryPrice) * position.quantity * (position.isLong ? 1 : -1);
  const gainPct = position.entryPrice > 0 ? gain / (position.entryPrice * position.quantity) : 0;
  const isGain = gain >= 0;

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 space-y-3">
      <div className="flex items-center justify-between">
        <input
          type="text"
          value={position.assetName}
          onChange={(e) => onUpdate(position.id, "assetName", e.target.value)}
          className="bg-transparent text-white font-semibold text-sm focus:outline-none border-b border-dashed border-gray-600 pb-0.5"
        />
        <div className="flex items-center gap-2">
          <button
            onClick={() => onUpdate(position.id, "isLong", !position.isLong)}
            className={`text-xs px-2 py-1 rounded font-medium transition-all ${
              position.isLong
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-red-500/20 text-red-400 border border-red-500/30"
            }`}
          >
            {position.isLong ? "LONG" : "SHORT"}
          </button>
          <button
            onClick={() => onUpdate(position.id, "taxLotAge", position.taxLotAge === "short" ? "long" : "short")}
            className={`text-xs px-2 py-1 rounded font-medium transition-all ${
              position.taxLotAge === "long"
                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
            }`}
          >
            {position.taxLotAge === "long" ? "> 1yr" : "< 1yr"}
          </button>
          <button
            onClick={() => onRemove(position.id)}
            className="text-red-500 hover:text-red-400 text-sm px-1"
          >
            ✕
          </button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-gray-500">Entry Price</label>
          <input
            type="number"
            value={position.entryPrice || ""}
            onChange={(e) => onUpdate(position.id, "entryPrice", parseFloat(e.target.value) || 0)}
            className="w-full px-2 py-1.5 bg-gray-900 border border-gray-700 rounded text-white text-sm font-mono focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-gray-500">Current Price</label>
          <input
            type="number"
            value={position.currentPrice || ""}
            onChange={(e) => onUpdate(position.id, "currentPrice", parseFloat(e.target.value) || 0)}
            className="w-full px-2 py-1.5 bg-gray-900 border border-gray-700 rounded text-white text-sm font-mono focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-gray-500">Quantity</label>
          <input
            type="number"
            value={position.quantity || ""}
            onChange={(e) => onUpdate(position.id, "quantity", parseFloat(e.target.value) || 0)}
            className="w-full px-2 py-1.5 bg-gray-900 border border-gray-700 rounded text-white text-sm font-mono focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>
      </div>
      <div className="flex items-center justify-between pt-1 border-t border-gray-700/50">
        <span className="text-xs text-gray-500">Unrealized P&L</span>
        <span className={`text-sm font-bold font-mono ${isGain ? "text-green-400" : "text-red-400"}`}>
          {isGain ? "+" : ""}{formatCurrency(gain)} ({formatPercent(gainPct)})
        </span>
      </div>
    </div>
  );
}

// --- Main Component ---
export default function TaxHedgePage() {
  const [positions, setPositions] = useState<HedgePosition[]>([
    { id: generateId(), assetName: "AAPL (Core)", entryPrice: 150, currentPrice: 195, quantity: 100, isLong: true, taxLotAge: "long" },
    { id: generateId(), assetName: "AAPL Put Hedge", entryPrice: 150, currentPrice: 125, quantity: 50, isLong: false, taxLotAge: "short" },
    { id: generateId(), assetName: "TQQQ Leveraged", entryPrice: 45, currentPrice: 68, quantity: 200, isLong: true, taxLotAge: "short" },
    { id: generateId(), assetName: "BTC (Spot)", entryPrice: 42000, currentPrice: 67000, quantity: 1, isLong: true, taxLotAge: "long" },
  ]);

  const [annualIncome, setAnnualIncome] = useState(250000);
  const [washSaleAdjustment, setWashSaleAdjustment] = useState(0);

  const updatePosition = useCallback((id: string, field: string, value: any) => {
    setPositions((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  }, []);

  const removePosition = useCallback((id: string) => {
    setPositions((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const addPosition = useCallback(() => {
    setPositions((prev) => [
      ...prev,
      { id: generateId(), assetName: `Position ${prev.length + 1}`, entryPrice: 0, currentPrice: 0, quantity: 0, isLong: true, taxLotAge: "short" },
    ]);
  }, []);

  const result = useMemo((): TaxResult => {
    let shortTermGains = 0;
    let longTermGains = 0;

    for (const pos of positions) {
      const gain = (pos.currentPrice - pos.entryPrice) * pos.quantity * (pos.isLong ? 1 : -1);
      if (pos.taxLotAge === "short") {
        shortTermGains += gain;
      } else {
        longTermGains += gain;
      }
    }

    // Apply wash sale adjustment
    shortTermGains += washSaleAdjustment;

    const totalUnrealizedGain = shortTermGains + longTermGains;

    // Short-term taxed as ordinary income
    const shortTermTax = Math.max(0, shortTermGains) * SHORT_TERM_RATE;

    // Long-term with progressive rates
    const longTermTax = calculateLongTermTax(Math.max(0, longTermGains));

    // NIIT
    const totalGains = Math.max(0, shortTermGains) + Math.max(0, longTermGains);
    const niitTax = annualIncome > NIIT_THRESHOLD
      ? Math.min(totalGains, annualIncome - NIIT_THRESHOLD + totalGains) * NIIT_RATE
      : totalGains * NIIT_RATE * 0.5; // simplified

    // State tax
    const stateTax = totalGains * STATE_TAX_RATE;

    const totalTax = shortTermTax + longTermTax + niitTax + stateTax;

    // Tax without optimization (all short-term)
    const unoptimizedTax = totalGains * (SHORT_TERM_RATE + STATE_TAX_RATE + NIIT_RATE);
    const taxSaved = Math.max(0, unoptimizedTax - totalTax);

    const effectiveTaxRate = totalGains > 0 ? totalTax / totalGains : 0;
    const afterTaxReturn = totalGains - totalTax;

    return {
      totalUnrealizedGain: totalUnrealizedGain,
      totalRealizedGain: totalGains,
      shortTermGains,
      longTermGains,
      shortTermTax,
      longTermTax,
      totalTax,
      taxSaved,
      effectiveTaxRate,
      afterTaxReturn,
    };
  }, [positions, annualIncome, washSaleAdjustment]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950 text-gray-100">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="text-3xl">⚡</span>
            Quant Tax-Hedge Arbitrage Simulator
            <span className="text-xs font-normal bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">
              Advanced
            </span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Simulate tax-lot optimization, short/long-term gain arbitrage, and hedge position analysis.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel */}
          <div className="lg:col-span-5 space-y-6">
            {/* Settings */}
            <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl p-5 space-y-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <span className="text-lg">⚙️</span> Tax Parameters
              </h3>
              <CurrencyInput
                label="Annual Ordinary Income"
                value={annualIncome}
                onChange={setAnnualIncome}
                helpText="W-2 + other income (affects tax bracket)"
              />
              <CurrencyInput
                label="Wash Sale Adjustment"
                value={washSaleAdjustment}
                onChange={setWashSaleAdjustment}
                helpText="Disallowed losses added to basis (positive = more short-term gains)"
              />
            </div>

            {/* Positions */}
            <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <span className="text-lg">📊</span> Hedge Positions
                </h3>
                <button
                  onClick={addPosition}
                  className="text-xs bg-purple-500/20 text-purple-400 px-3 py-1 rounded-lg border border-purple-500/30 hover:bg-purple-500/30 transition-all"
                >
                  + Add Position
                </button>
              </div>
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {positions.map((pos) => (
                  <PositionRow
                    key={pos.id}
                    position={pos}
                    onUpdate={updatePosition}
                    onRemove={removePosition}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="lg:col-span-7 space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <MetricCard
                label="Total Gains"
                value={formatCurrency(result.totalRealizedGain)}
                color={result.totalRealizedGain >= 0 ? "text-green-400" : "text-red-400"}
              />
              <MetricCard
                label="Total Tax"
                value={formatCurrency(result.totalTax)}
                color="text-amber-400"
              />
              <MetricCard
                label="Tax Saved"
                value={formatCurrency(result.taxSaved)}
                sublabel="vs. all short-term"
                color="text-emerald-400"
              />
              <MetricCard
                label="Effective Rate"
                value={formatPercent(result.effectiveTaxRate)}
                color="text-purple-400"
              />
            </div>

            {/* Gain Breakdown */}
            <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl p-5 space-y-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <span className="text-lg">💰</span> Gain Classification
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-800">
                  <span className="text-sm text-gray-400">{"Short-Term Capital Gains (< 1 year)"}</span>
                  <span className={`text-sm font-bold font-mono ${result.shortTermGains >= 0 ? "text-amber-400" : "text-red-400"}`}>
                    {formatCurrency(result.shortTermGains)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-800">
                  <span className="text-sm text-gray-400">{"Long-Term Capital Gains (> 1 year)"}</span>
                  <span className={`text-sm font-bold font-mono ${result.longTermGains >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {formatCurrency(result.longTermGains)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-white font-semibold">Net Gain</span>
                  <span className={`text-lg font-bold font-mono ${result.totalRealizedGain >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {formatCurrency(result.totalRealizedGain)}
                  </span>
                </div>
              </div>
            </div>

            {/* Tax Breakdown */}
            <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl p-5 space-y-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <span className="text-lg">🏛️</span> Tax Breakdown
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between py-1.5">
                  <span className="text-sm text-gray-400">Short-Term Tax (37% federal)</span>
                  <span className="text-sm text-amber-400 font-mono">{formatCurrency(result.shortTermTax)}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-sm text-gray-400">Long-Term Tax (0/15/20% bracket)</span>
                  <span className="text-sm text-green-400 font-mono">{formatCurrency(result.longTermTax)}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-sm text-gray-400">Net Investment Income Tax (3.8%)</span>
                  <span className="text-sm text-gray-300 font-mono">
                    {formatCurrency(Math.max(0, result.totalRealizedGain * NIIT_RATE))}
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-sm text-gray-400">Estimated State Tax ({formatPercent(STATE_TAX_RATE)})</span>
                  <span className="text-sm text-gray-300 font-mono">
                    {formatCurrency(Math.max(0, result.totalRealizedGain * STATE_TAX_RATE))}
                  </span>
                </div>
                <div className="border-t border-gray-700 mt-2 pt-2 flex justify-between">
                  <span className="text-sm text-white font-semibold">Total Tax Liability</span>
                  <span className="text-lg font-bold text-amber-400 font-mono">{formatCurrency(result.totalTax)}</span>
                </div>
              </div>
            </div>

            {/* After-Tax Return */}
            <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl p-5 space-y-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <span className="text-lg">📈</span> After-Tax Analysis
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                  <p className="text-xs text-gray-500">Pre-Tax Return</p>
                  <p className="text-xl font-bold text-white mt-1">{formatCurrency(result.totalRealizedGain)}</p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                  <p className="text-xs text-gray-500">After-Tax Return</p>
                  <p className={`text-xl font-bold mt-1 ${result.afterTaxReturn >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {formatCurrency(result.afterTaxReturn)}
                  </p>
                </div>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3">
                <p className="text-sm text-emerald-300">
                  💡 <strong>Tax Alpha:</strong> By optimizing long-term holdings, you save approximately{" "}
                  <strong>{formatCurrency(result.taxSaved)}</strong> compared to holding all positions short-term.
                </p>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
              <p className="text-xs text-amber-300/80 leading-relaxed">
                <strong>⚠️ Disclaimer:</strong> This simulator provides estimates based on 2026 projected federal tax rates.
                State taxes are approximated. Actual tax liability depends on your total income, filing status, deductions, and applicable state law.
                Wash sale rules, constructive sale rules, and straddle rules may apply. Consult a qualified tax professional.
              </p>
            </div>
          </div>
        </div>

        {/* SEO Article */}
        <article className="mt-16 max-w-4xl mx-auto prose prose-invert">
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-8 space-y-6 text-gray-300 leading-relaxed">
            <h2 className="text-2xl font-bold text-purple-400">Mastering Tax-Hedge Arbitrage: A Quantitative Approach to Tax-Lot Optimization</h2>

            <p>
              In the world of quantitative finance and active trading, taxes are often the single largest drag on portfolio returns. A strategy that generates 20% gross returns can easily see half of those gains consumed by federal, state, and Net Investment Income taxes if positions are not managed with tax efficiency in mind. Tax-hedge arbitrage — the strategic management of holding periods, gain/loss timing, and hedge positioning — is the art and science of minimizing this tax drag while maintaining your desired market exposure. This comprehensive guide explores the principles, strategies, and quantitative frameworks behind effective tax-hedge arbitrage.
            </p>

            <h3 className="text-xl font-semibold text-purple-300">The Fundamental Tax Asymmetry</h3>
            <p>
              The U.S. tax code creates a fundamental asymmetry between short-term and long-term capital gains. Short-term gains (positions held one year or less) are taxed as ordinary income, with the top federal rate reaching 37%. Long-term gains (positions held more than one year) receive preferential treatment, with rates of 0%, 15%, or 20% depending on income level. This creates a potential tax savings of up to 17 percentage points — or nearly 50% reduction in tax liability — simply by holding a position for an additional day past the one-year mark. For a portfolio with $100,000 in gains, this difference translates to $17,000 in tax savings. The Quant Tax-Hedge Arbitrage Simulator helps you visualize and quantify this effect across multiple positions simultaneously.
            </p>

            <h3 className="text-xl font-semibold text-purple-300">Net Investment Income Tax (NIIT)</h3>
            <p>
              Since 2013, high-income taxpayers face an additional 3.8% Net Investment Income Tax on investment income including capital gains, dividends, interest, and rental income. The NIIT applies to the lesser of net investment income or the amount by which modified adjusted gross income exceeds $200,000 (single) or $250,000 (married filing jointly). This effectively raises the top short-term rate to 40.8% and the top long-term rate to 23.8%. When combined with state income taxes (which can add another 5-13% depending on jurisdiction), the total marginal tax rate on short-term gains can exceed 50% in high-tax states like California and New York. This makes tax-lot management even more critical for high-income traders and investors.
            </p>

            <h3 className="text-xl font-semibold text-purple-300">Hedge Position Tax Considerations</h3>
            <p>
              When implementing hedge strategies — such as buying protective puts, selling covered calls, or establishing collar positions — traders must navigate complex tax rules that can significantly impact after-tax returns. The &ldquo;straddle rules&rdquo; (IRC Section 1092) apply when you hold offsetting positions in related securities. These rules can defer loss recognition, require capitalization of carrying charges, and recharacterize long-term gains as short-term gains. For example, if you hold AAPL stock (long-term position) and buy AAPL protective puts, the IRS may treat these as a straddle, potentially converting your long-term gain to short-term when you eventually sell. Understanding these interactions is essential for accurate tax planning and is one of the key features modeled in our simulator.
            </p>

            <h3 className="text-xl font-semibold text-purple-300">Wash Sale Rules and Their Impact</h3>
            <p>
              The wash sale rule (IRC Section 1091) disallows the current deduction of a loss if you purchase &ldquo;substantially identical&rdquo; securities within 30 days before or after the sale. The disallowed loss is not lost permanently — it is added to the cost basis of the replacement shares, effectively deferring the tax benefit. However, this deferral can have significant cash flow implications and can disrupt your tax planning timeline. Sophisticated traders use wash sale awareness to strategically harvest losses: selling a position at a loss, immediately buying a similar (but not substantially identical) security to maintain market exposure, and then potentially buying back the original security after the 31-day window. This &ldquo;tax-loss harvesting&rdquo; can generate thousands of dollars in tax savings annually while maintaining portfolio allocation.
            </p>

            <h3 className="text-xl font-semibold text-purple-300">Tax-Lot Identification Methods</h3>
            <p>
              The method used to identify which shares are sold when you have multiple purchase lots can dramatically affect your tax bill. Specific identification (spec ID) gives you the most control: you choose exactly which shares to sell, allowing you to optimize for long-term treatment, harvest specific losses, or manage your gain/loss ratio. Average cost basis (the default for many mutual funds) smooths out the tax impact but removes optimization opportunities. FIFO (first in, first out) tends to generate long-term gains automatically for appreciated positions held over time. The simulator assumes specific identification, which is the optimal strategy for active tax management. To use specific identification, you must identify the shares to your broker before the sale and receive written confirmation.
            </p>

            <h3 className="text-xl font-semibold text-purple-300">Year-End Tax-Lot Optimization Strategies</h3>
            <p>
              As the calendar year approaches its end, tax-lot optimization becomes a critical portfolio management activity. The primary strategies include: (1) Harvesting losses — selling positions with unrealized losses to offset realized gains; (2) Managing bracket exposure — realizing just enough gains to stay within a favorable tax bracket; (3) Converting short-term to long-term — delaying sales of short-term positions until they cross the one-year threshold if the additional tax savings exceed the market risk of holding; (4) Qualified dividend management — ensuring positions meet the holding period requirements for qualified dividend treatment (more than 60 days during the 121-day window around the ex-dividend date). Each of these strategies involves tradeoffs between tax optimization and market risk, and the simulator helps quantify these tradeoffs.
            </p>

            <h3 className="text-xl font-semibold text-purple-300">The Mathematics of After-Tax Alpha</h3>
            <p>
              Tax alpha — the incremental after-tax return generated by tax-efficient management — can be substantial. Research from Vanguard estimates that tax-alpha from systematic tax-loss harvesting alone averages 0.50% to 1.50% annually, depending on market conditions and investor circumstances. When combined with tax-lot optimization, asset location (placing tax-inefficient assets in tax-deferred accounts), and charitable giving strategies, total tax alpha can exceed 2% per year. Over a 30-year investment horizon, a 2% annual tax alpha compounds to approximately 80% more wealth compared to a tax-ignorant approach. This is why sophisticated wealth managers and family offices invest heavily in tax optimization technology and strategies.
            </p>

            <h3 className="text-xl font-semibold text-purple-300">Leveraged and Derivative Positions</h3>
            <p>
              Leveraged ETFs (like TQQQ, SOXL) and derivatives (options, futures) introduce additional tax complexity. Leveraged ETFs are generally tax-efficient due to their in-kind creation/redemption mechanism, but their daily rebalancing can generate short-term capital gains distributions. Options transactions have their own tax rules: the premium received from selling options is generally treated as short-term capital gain when the option expires or is closed. Section 1256 contracts (regulated futures and certain options) receive favorable 60/40 treatment — 60% of gains are taxed at long-term rates and 40% at short-term rates, regardless of holding period. This makes futures and broad-based index options particularly tax-efficient for active traders. Understanding these nuances is essential for accurate tax projection and optimization.
            </p>

            <h3 className="text-xl font-semibold text-purple-300">Using the Simulator Effectively</h3>
            <p>
              The Quant Tax-Hedge Arbitrage Simulator is designed for both educational exploration and practical portfolio analysis. Start by entering your actual positions with accurate cost basis and current market values. Toggle between short-term and long-term holding periods to see the tax impact of timing decisions. Use the hedge position feature to model protective options and understand how they interact with your core holdings. The wash sale adjustment field lets you model the impact of disallowed losses on your tax basis. Compare the &ldquo;Tax Saved&rdquo; metric against the all-short-term baseline to quantify the value of your tax optimization efforts. For the most accurate results, use this simulator in conjunction with your actual tax return and consult with a tax professional for complex situations involving straddles, constructive sales, or multi-year planning.
            </p>

            <h3 className="text-xl font-semibold text-purple-300">Conclusion</h3>
            <p>
              Tax-hedge arbitrage is not about evading taxes — it is about understanding and optimizing within the legal framework to maximize your after-tax wealth. The difference between tax-aware and tax-ignorant portfolio management can be hundreds of thousands of dollars over a lifetime of investing. By understanding the interplay between holding periods, gain classification, hedge positions, wash sale rules, and progressive tax brackets, you can make informed decisions that genuinely improve your bottom line. The Quant Tax-Hedge Arbitrage Simulator provides the analytical framework to model these decisions quantitatively, helping you move from intuition-based tax planning to data-driven optimization.
            </p>
          </div>
        </article>
      </div>
    </div>
  );
}