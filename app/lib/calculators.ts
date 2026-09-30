// Shared constants and pure calculation functions for the Q4 calculator
// pages (app/kalkulacky/*). Values reflect 2026 Slovak legislation and are
// orientačné odhady (indicative estimates), not official determinations.

export const CURRENT_YEAR = 2026;

// ---------------------------------------------------------------------------
// Čistá mzda (net salary)
// ---------------------------------------------------------------------------

export const SOCIAL_INSURANCE_RATE = 0.094;
export const SOCIAL_INSURANCE_MAX_BASE = 16_764;
const INCOME_TAX_BANDS = [
  { limit: 3_665.28, rate: 0.19 },
  { limit: 5_029.1, rate: 0.25 },
  { limit: 6_250.86, rate: 0.3 },
  { limit: Number.POSITIVE_INFINITY, rate: 0.35 },
];
const TAX_BONUS_REDUCTION_THRESHOLD = 27_432;

function progressiveMonthlyTax(monthlyTaxBase: number): number {
  let remaining = monthlyTaxBase;
  let lowerLimit = 0;
  let tax = 0;
  for (const band of INCOME_TAX_BANDS) {
    const taxableInBand = Math.max(0, Math.min(remaining, band.limit - lowerLimit));
    tax += taxableInBand * band.rate;
    remaining -= taxableInBand;
    lowerLimit = band.limit;
    if (remaining <= 0) break;
  }
  return tax;
}

function yearlyPersonalAllowance(annualTaxBase: number): number {
  if (annualTaxBase <= 26_083.13) return 5_966.73;
  return Math.max(0, 14_661.11 - annualTaxBase / 3);
}

function childBonusRate(children: number): number {
  if (children <= 0) return 0;
  if (children === 1) return 0.29;
  if (children === 2) return 0.36;
  if (children === 3) return 0.43;
  if (children === 4) return 0.5;
  if (children === 5) return 0.57;
  return 0.64;
}

export type NetSalaryInput = {
  grossMonthlySalary: number;
  hasPersonalAllowance: boolean;
  hasDisability: boolean;
  childrenUnder15: number;
  children15To17: number;
};

export type NetSalaryResult = {
  netCash: number;
  socialInsurance: number;
  healthInsurance: number;
  taxBeforeBonus: number;
  taxAfterBonus: number;
  childBonus: number;
};

export function calculateNetSalary(input: NetSalaryInput): NetSalaryResult {
  const gross = Math.max(0, input.grossMonthlySalary);
  const socialInsurance = Math.min(gross, SOCIAL_INSURANCE_MAX_BASE) * SOCIAL_INSURANCE_RATE;
  const healthInsurance = gross * (input.hasDisability ? 0.025 : 0.05);
  const annualTaxBase = Math.max(0, (gross - socialInsurance - healthInsurance) * 12);
  const annualAllowance = input.hasPersonalAllowance ? yearlyPersonalAllowance(annualTaxBase) : 0;
  const monthlyTaxBase = Math.max(0, (annualTaxBase - annualAllowance) / 12);
  const taxBeforeBonus = progressiveMonthlyTax(monthlyTaxBase);

  const childCount = Math.max(0, input.childrenUnder15) + Math.max(0, input.children15To17);
  const childBonusBeforeLimits = Math.max(0, input.childrenUnder15) * 100 + Math.max(0, input.children15To17) * 50;
  const reducedChildBonus = Math.max(
    0,
    childBonusBeforeLimits - Math.max(0, annualTaxBase - TAX_BONUS_REDUCTION_THRESHOLD) * 0.1 * childCount,
  );
  const childBonus = Math.min(reducedChildBonus, (annualTaxBase * childBonusRate(childCount)) / 12);
  const taxAfterBonus = Math.max(0, taxBeforeBonus - childBonus);
  const netCash = Math.max(0, gross - socialInsurance - healthInsurance - taxBeforeBonus + childBonus);

  return { netCash, socialInsurance, healthInsurance, taxBeforeBonus, taxAfterBonus, childBonus };
}

// ---------------------------------------------------------------------------
// Nemocenské a materské (sick pay & maternity pay) — shared DVZ base
// ---------------------------------------------------------------------------

export const MAX_DAILY_ASSESSMENT_BASE_2026 = 100.2083;
export const MIN_DAILY_ASSESSMENT_BASE_2026 = 25.4;

export function calculateDailyAssessmentBase(grossMonthlyIncome: number): number {
  const dailyBase = (Math.max(0, grossMonthlyIncome) * 12) / 365;
  return Math.min(Math.max(dailyBase, MIN_DAILY_ASSESSMENT_BASE_2026), MAX_DAILY_ASSESSMENT_BASE_2026);
}

export type SickPayResult = {
  dailyAssessmentBase: number;
  employerAmount: number;
  socialInsuranceAmount: number;
  totalAmount: number;
};

/** Orientačný odhad nemocenského: dni 1–3 hradí zamestnávateľ (25 % DVZ),
 * dni 4–10 zamestnávateľ (55 % DVZ), od 11. dňa Sociálna poisťovňa (55 % DVZ). */
export function calculateSickPay(grossMonthlyIncome: number, sickDays: number): SickPayResult {
  const days = Math.max(0, Math.round(sickDays));
  const dvz = calculateDailyAssessmentBase(grossMonthlyIncome);
  const firstTierDays = Math.min(days, 3);
  const remainingDays = Math.max(0, days - 3);
  const employerSecondTierDays = Math.min(remainingDays, 7);
  const socialInsuranceDays = Math.max(0, remainingDays - 7);

  const employerAmount = firstTierDays * dvz * 0.25 + employerSecondTierDays * dvz * 0.55;
  const socialInsuranceAmount = socialInsuranceDays * dvz * 0.55;

  return {
    dailyAssessmentBase: dvz,
    employerAmount,
    socialInsuranceAmount,
    totalAmount: employerAmount + socialInsuranceAmount,
  };
}

export type MaternityPayResult = {
  dailyAssessmentBase: number;
  dailyAmount: number;
  totalDays: number;
  totalAmount: number;
};

/** Orientačný odhad materského: 75 % DVZ za každý deň poberania dávky. */
export function calculateMaternityPay(grossMonthlyIncome: number, weeks: number): MaternityPayResult {
  const dvz = calculateDailyAssessmentBase(grossMonthlyIncome);
  const dailyAmount = dvz * 0.75;
  const totalDays = Math.max(0, Math.round(weeks * 7));
  return { dailyAssessmentBase: dvz, dailyAmount, totalDays, totalAmount: dailyAmount * totalDays };
}

// ---------------------------------------------------------------------------
// Rodičovský príspevok (parental allowance)
// ---------------------------------------------------------------------------

export const PARENTAL_ALLOWANCE_BASE_2026 = 364.8;
export const PARENTAL_ALLOWANCE_HIGHER_2026 = 500.1;
export const PARENTAL_ALLOWANCE_MULTIPLE_BONUS = 0.25;

export type ParentalAllowanceResult = {
  monthlyAmount: number;
  totalAmount: number;
};

export function calculateParentalAllowance(
  receivedMaternityPay: boolean,
  hasMultipleChildren: boolean,
  months: number,
): ParentalAllowanceResult {
  const base = receivedMaternityPay ? PARENTAL_ALLOWANCE_HIGHER_2026 : PARENTAL_ALLOWANCE_BASE_2026;
  const monthlyAmount = hasMultipleChildren ? base * (1 + PARENTAL_ALLOWANCE_MULTIPLE_BONUS) : base;
  return { monthlyAmount, totalAmount: monthlyAmount * Math.max(0, months) };
}

// ---------------------------------------------------------------------------
// Splátka hypotéky (mortgage payment)
// ---------------------------------------------------------------------------

export type MortgagePaymentResult = {
  monthlyPayment: number;
  totalPaid: number;
  totalInterest: number;
  months: number;
};

export function calculateMortgagePayment(
  principal: number,
  annualRatePercent: number,
  years: number,
): MortgagePaymentResult {
  const months = Math.max(1, Math.round(years * 12));
  const monthlyRate = annualRatePercent / 100 / 12;
  const monthlyPayment =
    monthlyRate === 0
      ? principal / months
      : (principal * monthlyRate * (1 + monthlyRate) ** months) / ((1 + monthlyRate) ** months - 1);
  const totalPaid = monthlyPayment * months;
  return { monthlyPayment, totalPaid, totalInterest: totalPaid - principal, months };
}

// ---------------------------------------------------------------------------
// Daňový bonus na zaplatené úroky z hypotéky (mortgage interest tax bonus)
// ---------------------------------------------------------------------------

export const MORTGAGE_BONUS_INCOME_LIMITS: Record<string, number> = {
  "2024": 2_288,
  "2025": 2_438.4,
  "2026": 2_592,
};

export type MortgageInterestBonusInput = {
  contractYear: keyof typeof MORTGAGE_BONUS_INCOME_LIMITS;
  age: number;
  hasCoBorrower: boolean;
  coBorrowerAge: number;
  monthlyIncome: number;
  coBorrowerIncome: number;
  interestPaid: number;
  eligibleMonths: number;
};

export type MortgageInterestBonusResult = {
  isEligible: boolean;
  bonus: number;
  maxIncome: number;
};

export function calculateMortgageInterestBonus(input: MortgageInterestBonusInput): MortgageInterestBonusResult {
  const maxIncome = MORTGAGE_BONUS_INCOME_LIMITS[input.contractYear] ?? MORTGAGE_BONUS_INCOME_LIMITS["2026"];
  const hasEligibleAge =
    input.age >= 18 &&
    input.age <= 35 &&
    (!input.hasCoBorrower || (input.coBorrowerAge >= 18 && input.coBorrowerAge <= 35));
  const totalIncome = Math.max(0, input.monthlyIncome) + (input.hasCoBorrower ? Math.max(0, input.coBorrowerIncome) : 0);
  const hasEligibleIncome = totalIncome <= maxIncome * (input.hasCoBorrower ? 2 : 1);
  const isEligible = hasEligibleAge && hasEligibleIncome;
  const months = Math.min(12, Math.max(0, input.eligibleMonths));
  const bonus = isEligible ? Math.min(Math.max(0, input.interestPaid) * 0.5, 1_200 * (months / 12)) : 0;
  return { isEligible, bonus, maxIncome };
}

// ---------------------------------------------------------------------------
// Odhad starobného dôchodku (pension estimate)
// ---------------------------------------------------------------------------

export const CURRENT_PENSION_VALUE_2026 = 19.7633;

export type PensionEstimateResult = {
  monthlyPension: number;
};

/** Zjednodušený odhad: osobný mzdový bod × roky dôchodkového poistenia ×
 * aktuálna dôchodková hodnota. Nezohľadňuje dôchodkový vek, predčasný
 * dôchodok ani ďalšie zákonné výnimky. */
export function estimatePension(personalWagePoint: number, insuranceYears: number): PensionEstimateResult {
  const monthlyPension = Math.max(0, personalWagePoint) * Math.max(0, insuranceYears) * CURRENT_PENSION_VALUE_2026;
  return { monthlyPension };
}

// ---------------------------------------------------------------------------
// Odstupné (severance pay)
// ---------------------------------------------------------------------------

export type SeveranceMethod = "vypoved" | "dohoda";

export type SeverancePayResult = {
  multiplier: number;
  amount: number;
};

/** Podľa § 76 Zákonníka práce: násobky priemerného mesačného zárobku pri
 * skončení z organizačných dôvodov. Dohoda má vyšší nárok než výpoveď. */
export function calculateSeverancePay(
  averageMonthlyEarnings: number,
  yearsOfEmployment: number,
  method: SeveranceMethod,
): SeverancePayResult {
  const years = Math.max(0, yearsOfEmployment);
  let multiplier = 0;
  if (method === "vypoved") {
    if (years < 2) multiplier = 0;
    else if (years < 5) multiplier = 1;
    else if (years < 10) multiplier = 2;
    else if (years < 20) multiplier = 3;
    else multiplier = 4;
  } else {
    if (years < 2) multiplier = 1;
    else if (years < 5) multiplier = 2;
    else if (years < 10) multiplier = 3;
    else if (years < 20) multiplier = 4;
    else multiplier = 5;
  }
  return { multiplier, amount: multiplier * Math.max(0, averageMonthlyEarnings) };
}

// ---------------------------------------------------------------------------
// Stravné na pracovnej ceste (travel meal allowance)
// ---------------------------------------------------------------------------

export function calculateTravelMealAllowance(hours: number): number {
  const value = Math.max(0, hours);
  if (value < 5) return 0;
  if (value <= 12) return 9.3;
  if (value <= 18) return 13.8;
  return 20.6;
}

// ---------------------------------------------------------------------------
// Nárok na dovolenku (paid leave entitlement)
// ---------------------------------------------------------------------------

export type VacationEntitlementResult = {
  baseDays: number;
  proratedDays: number;
};

/** 4 týždne (20 dní) základ; 5 týždňov (25 dní), ak zamestnanec dovŕši v danom
 * roku aspoň 33 rokov alebo sa trvale stará o dieťa (§ 103 Zákonníka práce). */
export function calculateVacationEntitlement(
  age: number,
  caresForChild: boolean,
  monthsWorked: number,
): VacationEntitlementResult {
  const baseWeeks = age >= 33 || caresForChild ? 5 : 4;
  const baseDays = baseWeeks * 5;
  const months = Math.min(12, Math.max(0, monthsWorked));
  const proratedDays = Math.round(((baseDays / 12) * months) * 10) / 10;
  return { baseDays, proratedDays };
}

// ---------------------------------------------------------------------------
// Calculator catalogue (used by the navigation mega-menu and index page)
// ---------------------------------------------------------------------------

export type CalculatorMeta = {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  icon: string;
};

export const calculators: CalculatorMeta[] = [
  {
    slug: "cista-mzda",
    title: "Kalkulačka čistej mzdy",
    shortTitle: "Čistá mzda",
    description: "Prepočet hrubej mzdy na čistú výplatu vrátane odvodov, dane a bonusu na deti.",
    icon: "€",
  },
  {
    slug: "nemocenske",
    title: "Kalkulačka nemocenského",
    shortTitle: "Nemocenské",
    description: "Odhad dávky počas dočasnej práceneschopnosti (PN).",
    icon: "✚",
  },
  {
    slug: "materske",
    title: "Kalkulačka materského",
    shortTitle: "Materské",
    description: "Odhad dávky materského na základe priemerného príjmu.",
    icon: "◕",
  },
  {
    slug: "rodicovsky-prispevok",
    title: "Kalkulačka rodičovského príspevku",
    shortTitle: "Rodičovský príspevok",
    description: "Mesačná a celková suma príspevku do 3 rokov veku dieťaťa.",
    icon: "◐",
  },
  {
    slug: "hypoteka-splatka",
    title: "Kalkulačka splátky hypotéky",
    shortTitle: "Splátka hypotéky",
    description: "Mesačná splátka, celkové úroky a doba splácania úveru.",
    icon: "⌂",
  },
  {
    slug: "urokovy-bonus",
    title: "Kalkulačka daňového bonusu na hypotéku",
    shortTitle: "Bonus na úroky",
    description: "Ročný daňový bonus na zaplatené úroky z hypotéky pre mladých.",
    icon: "%",
  },
  {
    slug: "dochodok",
    title: "Kalkulačka odhadu dôchodku",
    shortTitle: "Dôchodok",
    description: "Orientačný odhad starobného dôchodku podľa odpracovaných rokov.",
    icon: "⏳",
  },
  {
    slug: "odstupne",
    title: "Kalkulačka odstupného",
    shortTitle: "Odstupné",
    description: "Nárok na odstupné pri skončení pracovného pomeru.",
    icon: "⇥",
  },
  {
    slug: "stravne",
    title: "Kalkulačka stravného",
    shortTitle: "Stravné na ceste",
    description: "Tuzemské stravné na pracovnej ceste podľa počtu hodín.",
    icon: "▤",
  },
  {
    slug: "dovolenka",
    title: "Kalkulačka nároku na dovolenku",
    shortTitle: "Dovolenka",
    description: "Ročný a pomerný nárok na platenú dovolenku.",
    icon: "☼",
  },
];

export function getCalculatorMeta(slug: string): CalculatorMeta | undefined {
  return calculators.find((calculator) => calculator.slug === slug);
}

export const money = (value: number) =>
  new Intl.NumberFormat("sk-SK", { style: "currency", currency: "EUR" }).format(
    Number.isFinite(value) ? value : 0,
  );

export const positiveNumber = (value: string): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(parsed, 0) : 0;
};
