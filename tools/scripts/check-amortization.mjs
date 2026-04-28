import assert from 'node:assert/strict'

import {
  BASE_BULLET_RETURN_RATE,
  calculateAmortizationComparisonRows,
  getConstructionUtilizationFactor,
  solveMonthlyPayment,
} from '../.tmp-tests/src/amortization.js'

function approximatelyEqual(actual, expected, tolerance, message) {
  const difference = Math.abs(actual - expected)
  assert.ok(
    difference <= tolerance,
    `${message}: erwartet ${expected}, erhalten ${actual}, Abweichung ${difference}`,
  )
}

function getRowAtMonth(inputs, month) {
  const rows = calculateAmortizationComparisonRows(inputs)
  const row = rows.find((entry) => entry.month === month)
  assert.ok(row, `Monat ${month} wurde nicht gefunden`)
  return row
}

function run() {
  const baseInputs = {
    loanAmount: 350000,
    interestRate: 4,
    totalYears: 20,
    constructionYears: 2,
    comparisonReturnRate: 6,
    rateChangeYear: 0,
    followUpInterestRate: 5,
  }

  approximatelyEqual(getConstructionUtilizationFactor(1, 24), 0.25, 1e-9, 'Bauphasenstart sollte bei 25 % liegen')
  approximatelyEqual(getConstructionUtilizationFactor(24, 24), 1, 1e-9, 'Bauphasenende sollte bei 100 % liegen')

  const baseRows = calculateAmortizationComparisonRows(baseInputs)
  const firstBuildMonth = getRowAtMonth(baseInputs, 1)
  const endBuildMonth = getRowAtMonth(baseInputs, 24)
  const firstRepaymentMonth = getRowAtMonth(baseInputs, 25)
  const finalMonth = baseRows[baseRows.length - 1]

  approximatelyEqual(firstBuildMonth.annuityInterestPayment, 291.6666666667, 0.01, 'Zins im ersten Baumonat')
  approximatelyEqual(endBuildMonth.annuityInterestPayment, 1166.6666666667, 0.01, 'Zins im letzten Baumonat')
  approximatelyEqual(firstRepaymentMonth.annuityTotalPayment, 2275.6918917114, 0.05, 'Erste Annuität nach Bauzeit')
  approximatelyEqual(finalMonth.annuityDebt, 0, 0.01, 'Annuität sollte am Laufzeitende auf 0 laufen')
  assert.ok(
    finalMonth.cumulativeAnnuityTaxBenefit > 0,
    'Annuität sollte einen eigenen Steuererstattungseffekt aus Zinszahlungen haben',
  )
  assert.ok(
    finalMonth.cumulativeBulletTaxBenefit > finalMonth.cumulativeAnnuityTaxBenefit,
    'Endfälliges Darlehen sollte wegen höherer Zinszahlungen einen höheren Steuererstattungseffekt haben',
  )
  approximatelyEqual(
    finalMonth.cumulativeExtraTaxBenefit,
    finalMonth.cumulativeBulletTaxBenefit - finalMonth.cumulativeAnnuityTaxBenefit,
    0.01,
    'Zusätzliche Steuererstattung sollte die Differenz der Steuererstattungen beider Darlehen sein',
  )

  const bulletSavingsRate = solveMonthlyPayment(0, baseInputs.loanAmount, baseInputs.totalYears, BASE_BULLET_RETURN_RATE)
  approximatelyEqual(bulletSavingsRate, 1125.4934589461, 0.01, 'Endfällige Ansparrate bei 2,5 %')
  approximatelyEqual(finalMonth.replacementBaseValue, baseInputs.loanAmount, 0.01, 'Brutto-Tilgungsersatz bei 2,5 % sollte Darlehenshöhe treffen')

  const fiveYearInputs = {
    ...baseInputs,
    rateChangeYear: 5,
    followUpInterestRate: 5,
  }
  const fiveYearRows = calculateAmortizationComparisonRows(fiveYearInputs)
  const month61 = fiveYearRows.find((entry) => entry.month === 61)
  assert.ok(month61, 'Monat 61 nach Zinswechsel wurde nicht gefunden')
  approximatelyEqual(month61.annuityTotalPayment, 2432.920928938, 0.05, 'Neue Annuität nach 5 Jahren mit 5 %')
  approximatelyEqual(fiveYearRows[fiveYearRows.length - 1].annuityDebt, 0, 0.01, 'Auch nach Zinswechsel soll die Restschuld 0 sein')

  const tenYearInputs = {
    ...baseInputs,
    rateChangeYear: 10,
    followUpInterestRate: 6,
  }
  const tenYearRows = calculateAmortizationComparisonRows(tenYearInputs)
  const month121 = tenYearRows.find((entry) => entry.month === 121)
  assert.ok(month121, 'Monat 121 nach Zinswechsel wurde nicht gefunden')
  approximatelyEqual(month121.annuityTotalPayment, 2495.4083948478, 0.05, 'Neue Annuität nach 10 Jahren mit 6 %')
  assert.ok(
    tenYearRows[tenYearRows.length - 1].cumulativeExtraTaxBenefit > tenYearRows[119].cumulativeExtraTaxBenefit,
    'Die zusätzliche Steuererstattung sollte kumuliert ansteigen',
  )

  console.log('Amortization checks passed.')
}

run()
