"use client";

import { useState, useMemo, useCallback } from "react";

// --- Types ---
type FilingStatus = "single" | "mfj" | "hoh";
type StateTaxTier = "none" | "low" | "medium" | "high";

interface IncomeInputs {
  gross1099Income: number;
  otherSelfEmploymentIncome: number;
  w2Income: number;
}

interface DeductionInputs {
  businessExpenses: number;
  homeOfficeDeduction: number;
  healthInsurancePremiums: number;
  retirementContributions: number;
  otherDeductions: number;
}

interface TaxBracket {
  min: number;
  max: number;
  rate: number;
}

interface TaxResult {
  grossIncome: number;
  totalDeductions: number;
  netSelfEmploymentIncome: number;
  seTaxableIncome: number;
  socialSecurityTax: number;
  medicareTax: number;
  additionalMedicareTax: number;
  totalSETax: number;
  seTaxDeduction: number;
  adjustedGrossIncome: number;
  standardDeduction: number;
  qbiDeduction: number;
  taxableIncome: number;
  federalTax: number;
  stateTax: number;
  totalTax: number;
  effectiveRate: number;
  marginalRate: number;
  quarterlyPayments: number;
  takeHomePay: number;
}

// --- Constants ---
const SE_TAX_RATE = 0.153;
const SS_RATE = 0.124;
const MEDICARE_RATE = 0.029;
const ADDITIONAL_MEDICARE_RATE = 0.009;
const SE_TAXABLE_PERCENTAGE = 0.9235;
const QBI_DEDUCTION_RATE = 0.2;

const SS_WAGE_BASE_2026 = 176100;

const STANDARD_DEDUCTIONS_2026: Record<FilingStatus, number> = {
  single: 15750,
  mfj: 31500,
  hoh: 23600,
};

const ADDITIONAL_MEDICARE_THRESHOLD: Record<FilingStatus, number> = {
  single: 200000,
  mfj: 250000,
  hoh: 200000,
};

const FEDERAL_BRACKETS_2026: Record<FilingStatus, TaxBracket[]> = {
  single: [
    { min: 0, max: 12150, rate: 0.1 },
    { min: 12150, max: 49450, rate: 0.12 },
    { min: 49450, max: 105900, rate: 0.22 },
    { min: 105900, max: 201400, rate: 0.24 },
    { min: 201400, max: 255350, rate: 0.32 },
    { min: 255350, max: 637350, rate: 0.35 },
    { min: 637350, max: Infinity, rate: 0.37 },
  ],
  mfj: [
    { min: 0, max: 24300, rate: 0.1 },
    { min: 24300, max: 98900, rate: 0.12 },
    { min: 98900, max: 211800, rate: 0.22 },
    { min: 211800, max: 402800, rate: 0.24 },
    { min: 402800, max: 510700, rate: 0.32 },
    { min: 510700, max: 769200, rate: 0.35 },
    { min: 769200, max: Infinity, rate: 0.37 },
  ],
  hoh: [
    { min: 0, max: 18150, rate: 0.1 },
    { min: 18150, max: 69450, rate: 0.12 },
    { min: 69450, max: 105900, rate: 0.22 },
    { min: 105900, max: 201400, rate: 0.24 },
    { min: 201400, max: 255350, rate: 0.32 },
    { min: 255350, max: 637350, rate: 0.35 },
    { min: 637350, max: Infinity, rate: 0.37 },
  ],
};

const STATE_TAX_RATES: Record<StateTaxTier, number> = {
  none: 0,
  low: 0.035,
  medium: 0.055,
  high: 0.085,
};

const STATE_LABELS: Record<StateTaxTier, string> = {
  none: "No income tax (TX, FL, WA, NV, etc.)",
  low: "Low tax state (~3.5% avg: AZ, CO, IN, etc.)",
  medium: "Medium tax state (~5.5% avg: GA, MD, MA, etc.)",
  high: "High tax state (~8.5% avg: CA, NY, NJ, OR, etc.)",
};

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
  return `${(rate * 100).toFixed(1)}%`;
}

function calculateFederalTax(taxableIncome: number, filingStatus: FilingStatus): { tax: number; marginalRate: number } {
  const brackets = FEDERAL_BRACKETS_2026[filingStatus];
  let tax = 0;
  let marginalRate = 0;

  for (const bracket of brackets) {
    if (taxableIncome <= bracket.min) break;
    const taxableInBracket = Math.min(taxableIncome, bracket.max) - bracket.min;
    tax += taxableInBracket * bracket.rate;
    marginalRate = bracket.rate;
  }

  return { tax: Math.max(0, tax), marginalRate };
}

function calculateTaxes(
  income: IncomeInputs,
  deductions: DeductionInputs,
  filingStatus: FilingStatus,
  stateTaxTier: StateTaxTier
): TaxResult {
  const grossIncome = income.gross1099Income + income.otherSelfEmploymentIncome;
  const totalDeductions =
    deductions.businessExpenses +
    deductions.homeOfficeDeduction +
    deductions.healthInsurancePremiums +
    deductions.retirementContributions +
    deductions.otherDeductions;

  const netSelfEmploymentIncome = Math.max(0, grossIncome - totalDeductions);
  const seTaxableIncome = netSelfEmploymentIncome * SE_TAXABLE_PERCENTAGE;

  // Social Security tax (capped at wage base, reduced by W-2 income)
  const ssWageBaseRemaining = Math.max(0, SS_WAGE_BASE_2026 - income.w2Income);
  const ssTaxableIncome = Math.min(seTaxableIncome, ssWageBaseRemaining);
  const socialSecurityTax = ssTaxableIncome * SS_RATE;

  // Medicare tax (no cap)
  const medicareTax = seTaxableIncome * MEDICARE_RATE;

  // Additional Medicare tax
  const totalMedicareIncome = seTaxableIncome + income.w2Income;
  const additionalMedicareThreshold = ADDITIONAL_MEDICARE_THRESHOLD[filingStatus];
  const additionalMedicareTax =
    totalMedicareIncome > additionalMedicareThreshold
      ? (totalMedicareIncome - additionalMedicareThreshold) * ADDITIONAL_MEDICARE_RATE
      : 0;

  const totalSETax = socialSecurityTax + medicareTax + additionalMedicareTax;
  const seTaxDeduction = totalSETax / 2;

  // AGI
  const totalIncome = netSelfEmploymentIncome + income.w2Income;
  const adjustedGrossIncome = Math.max(0, totalIncome - seTaxDeduction - deductions.healthInsurancePremiums);

  // Deductions
  const standardDeduction = STANDARD_DEDUCTIONS_2026[filingStatus];

  // QBI Deduction (simplified - 20% of net SE income, limited to taxable income before QBI)
  const taxableBeforeQBI = Math.max(0, adjustedGrossIncome - standardDeduction);
  const qbiDeduction = Math.min(netSelfEmploymentIncome * QBI_DEDUCTION_RATE, taxableBeforeQBI * QBI_DEDUCTION_RATE);

  const taxableIncome = Math.max(0, taxableBeforeQBI - qbiDeduction);

  // Federal tax
  const { tax: federalTax, marginalRate } = calculateFederalTax(taxableIncome, filingStatus);

  // State tax (simplified flat rate on taxable income)
  const stateTaxRate = STATE_TAX_RATES[stateTaxTier];
  const stateTax = Math.max(0, (adjustedGrossIncome - standardDeduction) * stateTaxRate);

  // Totals
  const totalTax = totalSETax + federalTax + stateTax;
  const effectiveRate = totalIncome > 0 ? totalTax / totalIncome : 0;
  const quarterlyPayments = totalTax / 4;
  const takeHomePay = totalIncome - totalTax;

  return {
    grossIncome,
    totalDeductions,
    netSelfEmploymentIncome,
    seTaxableIncome,
    socialSecurityTax,
    medicareTax,
    additionalMedicareTax,
    totalSETax,
    seTaxDeduction,
    adjustedGrossIncome,
    standardDeduction,
    qbiDeduction,
    taxableIncome,
    federalTax,
    stateTax,
    totalTax,
    effectiveRate,
    marginalRate,
    quarterlyPayments,
    takeHomePay,
  };
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

  const handleBlur = () => {
    if (value === 0) {
      setDisplayValue("");
    } else {
      setDisplayValue(value.toLocaleString("en-US"));
    }
  };

  const handleFocus = () => {
    setDisplayValue(value === 0 ? "" : value.toString());
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
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          className="w-full pl-7 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
        />
      </div>
      {helpText && <p className="text-xs text-gray-500">{helpText}</p>}
    </div>
  );
}

function SelectInput({
  label,
  value,
  onChange,
  options,
  helpText,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  helpText?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-300">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm appearance-none cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {helpText && <p className="text-xs text-gray-500">{helpText}</p>}
    </div>
  );
}

function ResultRow({
  label,
  value,
  isBold = false,
  isHighlight = false,
  isSubtotal = false,
  indent = false,
}: {
  label: string;
  value: number | string;
  isBold?: boolean;
  isHighlight?: boolean;
  isSubtotal?: boolean;
  indent?: boolean;
}) {
  const baseClass = isHighlight
    ? "text-emerald-400"
    : isBold
    ? "text-white"
    : isSubtotal
    ? "text-indigo-300"
    : "text-gray-400";

  const weightClass = isBold || isHighlight ? "font-semibold" : "font-normal";
  const bgClass = isSubtotal ? "bg-gray-800/50 -mx-3 px-3 py-1.5 rounded" : "";
  const indentClass = indent ? "pl-4" : "";

  return (
    <div className={`flex justify-between items-center py-1.5 ${bgClass} ${indentClass}`}>
      <span className={`text-sm ${baseClass} ${weightClass}`}>{label}</span>
      <span className={`text-sm ${baseClass} ${weightClass} tabular-nums`}>
        {typeof value === "string" ? value : formatCurrency(value)}
      </span>
    </div>
  );
}

function TaxBar({ label, amount, total, color }: { label: string; amount: number; total: number; color: string }) {
  const percentage = total > 0 ? (amount / total) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-400">{label}</span>
        <span className="text-gray-300 tabular-nums">
          {formatCurrency(amount)} ({percentage.toFixed(1)}%)
        </span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${color}`}
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
      </div>
    </div>
  );
}

function SectionCard({ title, children, icon }: { title: string; children: React.ReactNode; icon: string }) {
  return (
    <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl p-5 space-y-4">
      <h3 className="text-base font-semibold text-white flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        {title}
      </h3>
      {children}
    </div>
  );
}

// --- Main Component ---
export default function SelfEmploymentTaxCalculator() {
  const [income, setIncome] = useState<IncomeInputs>({
    gross1099Income: 85000,
    otherSelfEmploymentIncome: 0,
    w2Income: 0,
  });

  const [deductions, setDeductions] = useState<DeductionInputs>({
    businessExpenses: 5000,
    homeOfficeDeduction: 1500,
    healthInsurancePremiums: 4800,
    retirementContributions: 6000,
    otherDeductions: 0,
  });

  const [filingStatus, setFilingStatus] = useState<FilingStatus>("single");
  const [stateTaxTier, setStateTaxTier] = useState<StateTaxTier>("medium");

  const result = useMemo(
    () => calculateTaxes(income, deductions, filingStatus, stateTaxTier),
    [income, deductions, filingStatus, stateTaxTier]
  );

  const updateIncome = useCallback((field: keyof IncomeInputs, value: number) => {
    setIncome((prev) => ({ ...prev, [field]: value }));
  }, []);

  const updateDeduction = useCallback((field: keyof DeductionInputs, value: number) => {
    setDeductions((prev) => ({ ...prev, [field]: value }));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-indigo-950 text-gray-100">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="text-3xl">🧮</span>
            2026 Self-Employment Tax Calculator
            <span className="text-xs font-normal bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
              1099 Contractor
            </span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Estimate your federal & state taxes, SE tax, QBI deduction, and quarterly payments for tax year 2026.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel: Inputs */}
          <div className="lg:col-span-5 space-y-6">
            {/* Filing Status */}
            <SectionCard title="Filing Status" icon="📋">
              <SelectInput
                label="Filing Status"
                value={filingStatus}
                onChange={(val) => setFilingStatus(val as FilingStatus)}
                options={[
                  { value: "single", label: "Single" },
                  { value: "mfj", label: "Married Filing Jointly" },
                  { value: "hoh", label: "Head of Household" },
                ]}
              />
              <SelectInput
                label="State Tax Profile"
                value={stateTaxTier}
                onChange={(val) => setStateTaxTier(val as StateTaxTier)}
                options={Object.entries(STATE_LABELS).map(([value, label]) => ({ value, label }))}
              />
            </SectionCard>

            {/* Income */}
            <SectionCard title="Income" icon="💰">
              <CurrencyInput
                label="Gross 1099 Income"
                value={income.gross1099Income}
                onChange={(val) => updateIncome("gross1099Income", val)}
                helpText="Total self-employment income from all 1099-NEC / 1099-MISC forms"
              />
              <CurrencyInput
                label="Other Self-Employment Income"
                value={income.otherSelfEmploymentIncome}
                onChange={(val) => updateIncome("otherSelfEmploymentIncome", val)}
                helpText="Cash income, side gigs, or income without 1099"
              />
              <CurrencyInput
                label="W-2 Income (if any)"
                value={income.w2Income}
                onChange={(val) => updateIncome("w2Income", val)}
                helpText="W-2 wages reduce the SS wage base available for SE tax"
              />
            </SectionCard>

            {/* Deductions */}
            <SectionCard title="Business Deductions" icon="📉">
              <CurrencyInput
                label="Business Expenses"
                value={deductions.businessExpenses}
                onChange={(val) => updateDeduction("businessExpenses", val)}
                helpText="Supplies, software, travel, meals (50%), equipment, etc."
              />
              <CurrencyInput
                label="Home Office Deduction"
                value={deductions.homeOfficeDeduction}
                onChange={(val) => updateDeduction("homeOfficeDeduction", val)}
                helpText="Simplified: up to $1,500 (300 sq ft × $5) or actual expenses"
              />
              <CurrencyInput
                label="Health Insurance Premiums"
                value={deductions.healthInsurancePremiums}
                onChange={(val) => updateDeduction("healthInsurancePremiums", val)}
                helpText="Self-employed health insurance deduction (above-the-line)"
              />
              <CurrencyInput
                label="Retirement Contributions"
                value={deductions.retirementContributions}
                onChange={(val) => updateDeduction("retirementContributions", val)}
                helpText="SEP-IRA, Solo 401(k), SIMPLE IRA contributions"
              />
              <CurrencyInput
                label="Other Deductions"
                value={deductions.otherDeductions}
                onChange={(val) => updateDeduction("otherDeductions", val)}
                helpText="Any other Schedule C deductions"
              />
            </SectionCard>
          </div>

          {/* Right Panel: Results */}
          <div className="lg:col-span-7 space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Total Tax</p>
                <p className="text-xl font-bold text-white mt-1">{formatCurrency(result.totalTax)}</p>
              </div>
              <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Effective Rate</p>
                <p className="text-xl font-bold text-amber-400 mt-1">{formatPercent(result.effectiveRate)}</p>
              </div>
              <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Take Home</p>
                <p className="text-xl font-bold text-emerald-400 mt-1">{formatCurrency(result.takeHomePay)}</p>
              </div>
              <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Quarterly</p>
                <p className="text-xl font-bold text-indigo-400 mt-1">{formatCurrency(result.quarterlyPayments)}</p>
              </div>
            </div>

            {/* Tax Breakdown */}
            <SectionCard title="Self-Employment Tax" icon="🏛️">
              <ResultRow label="Gross Self-Employment Income" value={result.grossIncome} />
              <ResultRow label="Total Business Deductions" value={-result.totalDeductions} indent />
              <ResultRow label="Net Self-Employment Income" value={result.netSelfEmploymentIncome} isSubtotal />
              <ResultRow label="SE Taxable Income (×92.35%)" value={result.seTaxableIncome} indent />
              <div className="border-t border-gray-800 my-2" />
              <ResultRow label="Social Security Tax (12.4%)" value={result.socialSecurityTax} indent />
              <ResultRow label={`  ↳ Taxable up to ${formatCurrency(SS_WAGE_BASE_2026)} wage base`} value="" indent />
              <ResultRow label="Medicare Tax (2.9%)" value={result.medicareTax} indent />
              <ResultRow label="Additional Medicare Tax (0.9%)" value={result.additionalMedicareTax} indent />
              <ResultRow label="Total SE Tax" value={result.totalSETax} isBold isSubtotal />
              <ResultRow label="SE Tax Deduction (50%)" value={-result.seTaxDeduction} indent />
            </SectionCard>

            <SectionCard title="Income Tax" icon="📊">
              <ResultRow label="Adjusted Gross Income (AGI)" value={result.adjustedGrossIncome} isSubtotal />
              <ResultRow label={`Standard Deduction (${filingStatus === "mfj" ? "MFJ" : filingStatus === "hoh" ? "HOH" : "Single"})`} value={-result.standardDeduction} indent />
              <ResultRow label="QBI Deduction (20%)" value={-result.qbiDeduction} indent />
              <ResultRow label="Taxable Income" value={result.taxableIncome} isBold isSubtotal />
              <div className="border-t border-gray-800 my-2" />
              <ResultRow label="Federal Income Tax" value={result.federalTax} />
              <ResultRow label={`Marginal Tax Bracket`} value={formatPercent(result.marginalRate)} indent />
              <ResultRow label="State Income Tax (estimated)" value={result.stateTax} />
            </SectionCard>

            {/* Visual Tax Breakdown */}
            <SectionCard title="Tax Composition" icon="📈">
              <div className="space-y-3">
                <TaxBar
                  label="Self-Employment Tax"
                  amount={result.totalSETax}
                  total={result.totalTax}
                  color="bg-gradient-to-r from-rose-500 to-pink-500"
                />
                <TaxBar
                  label="Federal Income Tax"
                  amount={result.federalTax}
                  total={result.totalTax}
                  color="bg-gradient-to-r from-amber-500 to-orange-500"
                />
                <TaxBar
                  label="State Income Tax"
                  amount={result.stateTax}
                  total={result.totalTax}
                  color="bg-gradient-to-r from-indigo-500 to-purple-500"
                />
              </div>
            </SectionCard>

            {/* Quarterly Payment Schedule */}
            <SectionCard title="Estimated Quarterly Payments (2026)" icon="📅">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { q: "Q1", due: "Apr 15, 2026" },
                  { q: "Q2", due: "Jun 15, 2026" },
                  { q: "Q3", due: "Sep 15, 2026" },
                  { q: "Q4", due: "Jan 15, 2027" },
                ].map((quarter) => (
                  <div key={quarter.q} className="bg-gray-800/60 rounded-lg p-3 text-center border border-gray-700/50">
                    <p className="text-xs font-semibold text-indigo-400">{quarter.q}</p>
                    <p className="text-sm font-bold text-white mt-1">{formatCurrency(result.quarterlyPayments)}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Due {quarter.due}</p>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Disclaimer */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
              <p className="text-xs text-amber-300/80 leading-relaxed">
                <strong>⚠️ Disclaimer:</strong> This calculator provides estimates based on 2026 projected tax brackets and rates.
                Actual tax liability may vary. Consult a qualified tax professional for personalized advice.
                QBI deduction and other calculations are simplified and may not reflect all limitations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
