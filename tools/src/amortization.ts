export type AmortizationComparisonInputs = {
  loanAmount: number
  interestRate: number
  totalYears: number
  constructionYears: number
  comparisonReturnRate: number
  rateChangeYear: number
  followUpInterestRate: number
}

export type AmortizationComparisonRow = {
  month: number
  year: number
  annuityDebt: number
  bulletDebt: number
  replacementBaseValue: number
  replacementSliderValue: number
  replacementContributionBasis: number
  replacementSliderNetValue: number
  bulletNetDebt: number
  sliderTaxDeduction: number
  annuityInterestPayment: number
  annuityPrincipalPayment: number
  annuityTotalPayment: number
  bulletInterestPayment: number
  bulletSavingsPayment: number
  bulletTotalPayment: number
  cumulativeAnnuityPayments: number
  cumulativeBulletPayments: number
  cumulativeAnnuityTaxBenefit: number
  cumulativeBulletTaxBenefit: number
  applicableInterestRate: number
  extraTaxBenefitMonthly: number
  cumulativeExtraTaxBenefit: number
}

export const MONTHS_PER_YEAR = 12
export const BASE_BULLET_RETURN_RATE = 2.5
export const INSURANCE_TAX_RATE_ON_GAINS = 0.2125
export const DEFAULT_INTEREST_TAX_RATE = 0.42

export function calculateAmortizationComparisonRows(inputs: AmortizationComparisonInputs): AmortizationComparisonRow[] {
  const totalMonths = Math.max(Math.round(inputs.totalYears * MONTHS_PER_YEAR), 1)
  const constructionMonths = Math.min(Math.round(inputs.constructionYears * MONTHS_PER_YEAR), totalMonths)
  const bulletSavingsRate = solveMonthlyPayment(0, inputs.loanAmount, inputs.totalYears, BASE_BULLET_RETURN_RATE)
  const bulletBaseMonthlyRate = BASE_BULLET_RETURN_RATE / 100 / MONTHS_PER_YEAR
  const bulletSliderMonthlyRate = inputs.comparisonReturnRate / 100 / MONTHS_PER_YEAR
  const rateChangeMonth = inputs.rateChangeYear > 0 ? Math.round(inputs.rateChangeYear * MONTHS_PER_YEAR) : null
  const rows: AmortizationComparisonRow[] = [
    {
      month: 0,
      year: 0,
      annuityDebt: inputs.loanAmount,
      bulletDebt: inputs.loanAmount,
      replacementBaseValue: 0,
      replacementSliderValue: 0,
      replacementContributionBasis: 0,
      replacementSliderNetValue: 0,
      bulletNetDebt: inputs.loanAmount,
      sliderTaxDeduction: 0,
      annuityInterestPayment: 0,
      annuityPrincipalPayment: 0,
      annuityTotalPayment: 0,
      bulletInterestPayment: 0,
      bulletSavingsPayment: 0,
      bulletTotalPayment: 0,
      cumulativeAnnuityPayments: 0,
      cumulativeBulletPayments: 0,
      cumulativeAnnuityTaxBenefit: 0,
      cumulativeBulletTaxBenefit: 0,
      applicableInterestRate: inputs.interestRate,
      extraTaxBenefitMonthly: 0,
      cumulativeExtraTaxBenefit: 0,
    },
  ]

  let annuityDebt = inputs.loanAmount
  let replacementBaseValue = 0
  let replacementSliderValue = 0
  let replacementContributionBasis = 0
  let currentAnnuityPayment = 0
  let cumulativeAnnuityPayments = 0
  let cumulativeBulletPayments = 0
  let cumulativeAnnuityTaxBenefit = 0
  let cumulativeBulletTaxBenefit = 0
  let cumulativeExtraTaxBenefit = 0

  for (let month = 1; month <= totalMonths; month += 1) {
    const applicableInterestRate = getAmortizationInterestRateForMonth(inputs, month, rateChangeMonth)
    const annuityMonthlyRate = applicableInterestRate / 100 / MONTHS_PER_YEAR
    const constructionUtilization = getConstructionUtilizationFactor(month, constructionMonths)
    const interestBearingLoanAmount =
      month <= constructionMonths ? inputs.loanAmount * constructionUtilization : annuityDebt
    const annuityInterest = interestBearingLoanAmount * annuityMonthlyRate
    const repaymentStartsNow = month === constructionMonths + 1
    const rateChangesDuringRepayment =
      rateChangeMonth !== null &&
      month === rateChangeMonth + 1 &&
      month > constructionMonths

    if (repaymentStartsNow || rateChangesDuringRepayment) {
      currentAnnuityPayment = calculateLevelPayment(
        annuityDebt,
        applicableInterestRate,
        totalMonths - month + 1,
      )
    }

    const annuityTotalPayment = month <= constructionMonths ? annuityInterest : currentAnnuityPayment
    const annuityPrincipalPayment =
      month <= constructionMonths ? 0 : Math.max(Math.min(annuityTotalPayment - annuityInterest, annuityDebt), 0)

    annuityDebt = Math.max(annuityDebt - annuityPrincipalPayment, 0)
    replacementBaseValue = replacementBaseValue * (1 + bulletBaseMonthlyRate) + bulletSavingsRate
    replacementSliderValue = replacementSliderValue * (1 + bulletSliderMonthlyRate) + bulletSavingsRate
    replacementContributionBasis += bulletSavingsRate
    const replacementSliderNetValue = getNetValueAfterGainTax(replacementSliderValue, replacementContributionBasis)
    const sliderTaxDeduction = Math.max(replacementSliderValue - replacementSliderNetValue, 0)
    const bulletInterestPayment = getMonthlyInterestPayment(
      month <= constructionMonths ? inputs.loanAmount * constructionUtilization : inputs.loanAmount,
      applicableInterestRate,
    )
    const bulletTotalPayment = bulletInterestPayment + bulletSavingsRate
    const annuityTaxBenefitMonthly = annuityInterest * DEFAULT_INTEREST_TAX_RATE
    const bulletTaxBenefitMonthly = bulletInterestPayment * DEFAULT_INTEREST_TAX_RATE
    const extraTaxBenefitMonthly = Math.max(bulletTaxBenefitMonthly - annuityTaxBenefitMonthly, 0)
    cumulativeAnnuityPayments += annuityTotalPayment
    cumulativeBulletPayments += bulletTotalPayment
    cumulativeAnnuityTaxBenefit += annuityTaxBenefitMonthly
    cumulativeBulletTaxBenefit += bulletTaxBenefitMonthly
    cumulativeExtraTaxBenefit += extraTaxBenefitMonthly

    rows.push({
      month,
      year: month / MONTHS_PER_YEAR,
      annuityDebt,
      bulletDebt: inputs.loanAmount,
      replacementBaseValue,
      replacementSliderValue,
      replacementContributionBasis,
      replacementSliderNetValue,
      bulletNetDebt: inputs.loanAmount - replacementSliderNetValue,
      sliderTaxDeduction,
      annuityInterestPayment: annuityInterest,
      annuityPrincipalPayment,
      annuityTotalPayment,
      bulletInterestPayment,
      bulletSavingsPayment: bulletSavingsRate,
      bulletTotalPayment,
      cumulativeAnnuityPayments,
      cumulativeBulletPayments,
      cumulativeAnnuityTaxBenefit,
      cumulativeBulletTaxBenefit,
      applicableInterestRate,
      extraTaxBenefitMonthly,
      cumulativeExtraTaxBenefit,
    })
  }

  return rows
}

export function calculateLevelPayment(loanAmount: number, interestRate: number, months: number): number {
  const monthlyRate = interestRate / 100 / MONTHS_PER_YEAR

  if (months <= 0) {
    return 0
  }

  if (monthlyRate === 0) {
    return loanAmount / months
  }

  return loanAmount * monthlyRate / (1 - (1 + monthlyRate) ** (-months))
}

export function getMonthlyInterestPayment(loanAmount: number, interestRate: number): number {
  return loanAmount * (interestRate / 100) / MONTHS_PER_YEAR
}

export function getConstructionUtilizationFactor(month: number, constructionMonths: number): number {
  if (constructionMonths <= 0 || month > constructionMonths) {
    return 1
  }

  if (constructionMonths === 1) {
    return 1
  }

  const progress = (month - 1) / (constructionMonths - 1)
  return 0.25 + 0.75 * progress
}

export function getAmortizationInterestRateForMonth(
  inputs: AmortizationComparisonInputs,
  month: number,
  rateChangeMonth: number | null,
): number {
  if (rateChangeMonth !== null && month > rateChangeMonth) {
    return inputs.followUpInterestRate
  }

  return inputs.interestRate
}

export function getNetValueAfterGainTax(value: number, contributionBasis: number): number {
  const taxableGain = Math.max(value - contributionBasis, 0)
  return value - taxableGain * INSURANCE_TAX_RATE_ON_GAINS
}

export function solveMonthlyPayment(
  startValue: number,
  endValue: number,
  years: number,
  annualRatePercent: number,
): number {
  const months = years * MONTHS_PER_YEAR
  const monthlyRate = annualRatePercent / 100 / MONTHS_PER_YEAR

  if (months === 0) {
    return 0
  }

  if (monthlyRate === 0) {
    return (endValue - startValue) / months
  }

  const growthFactor = (1 + monthlyRate) ** months
  const contributionFactor = (growthFactor - 1) / monthlyRate
  return (endValue - startValue * growthFactor) / contributionFactor
}
