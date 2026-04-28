import './style.css'
import {
  BASE_BULLET_RETURN_RATE,
  calculateAmortizationComparisonRows,
  getMonthlyInterestPayment,
  getNetValueAfterGainTax,
  MONTHS_PER_YEAR,
  solveMonthlyPayment,
} from './amortization.js'
import type { AmortizationComparisonInputs, AmortizationComparisonRow } from './amortization.js'

type Inputs = {
  loanBeforeEquity: number
  initialEquity: number
  monthlyRate: number
  loanInterestRate: number
  investmentReturnRate: number
  marginalTaxRate: number
}

type InterestFieldId = 'interest-start' | 'interest-years' | 'interest-rate' | 'interest-payment' | 'interest-end'
type PrintableToolId = 'tilgen-vs-anlegen' | 'zinsrechner' | 'endfaellig-vs-annuitaet'

type PrintItem = {
  label: string
  value: string
}

type PrintDocument = {
  eyebrow: string
  title: string
  description: string
  parameters: PrintItem[]
  metrics: PrintItem[]
  chartHtml?: string
  legendHtml?: string
  tableTitle?: string
  tableHeadHtml?: string
  tableBodyHtml?: string
  note?: string
}

type YearRow = {
  year: number
  repaymentDebt: number
  cashPurchaseNetValue: number
  cashPurchaseNetDebt: number
  insuranceGrossValue: number
  insuranceNetValue: number
  depotNetValue: number
  insuranceNetDebt: number
  depotNetDebt: number
  cashPurchaseAdvantage: number
  insuranceAdvantage: number
  depotAdvantage: number
}

const YEARS = 20
const DEPOT_TAX_RATE_ON_GAINS = 0.175
const MATRIX_YEARS = [5, 10, 15, 20]
const defaultInputs: Inputs = {
  loanBeforeEquity: 450000,
  initialEquity: 50000,
  monthlyRate: 1000,
  loanInterestRate: 4,
  investmentReturnRate: 6,
  marginalTaxRate: 42,
}
const defaultAmortizationInputs: AmortizationComparisonInputs = {
  loanAmount: 350000,
  interestRate: 4,
  totalYears: 20,
  constructionYears: 2,
  comparisonReturnRate: 6,
  rateChangeYear: 0,
  followUpInterestRate: 5,
}

const app = getElement<HTMLDivElement>('app')

app.innerHTML = `
  <main class="shell">
    <section class="hero-card">
      <div class="hero-copy">
        <p class="eyebrow">MLP Anlageimmobilien</p>
        <h1>Tools</h1>
        <p class="lead">
          Eine schlanke Startseite für Rechner und Beratungswerkzeuge. Das erste Tool vergleicht,
          ob freie Liquidität rechnerisch besser in Sondertilgung oder Kapitalanlage fließt.
        </p>
      </div>
      <div class="tool-directory" aria-label="Verfügbare Tools">
        <a class="tool-chip" href="#tilgen-vs-anlegen">
          <span>Vergleichsrechner</span>
          <strong>Tilgen vs. Anlegen</strong>
        </a>
        <a class="tool-chip" href="#zinsrechner">
          <span>Rechner</span>
          <strong>Zinsrechner</strong>
        </a>
        <a class="tool-chip" href="#endfaellig-vs-annuitaet">
          <span>Vergleichsrechner</span>
          <strong>Endfällig vs. Annuität</strong>
        </a>
      </div>
    </section>

    <section id="tilgen-vs-anlegen" class="calculator-card tool-panel" hidden>
        <div class="section-head">
          <div>
            <p class="eyebrow">Vergleichsrechner</p>
            <h2>Tilgen vs. Anlegen</h2>
            <button id="print-tilgen-vs-anlegen" class="print-button" type="button">PDF drucken</button>
          </div>
          <p>
            Bei der Tilgungsvariante reduziert das Eigenkapital die Darlehenshöhe. Die nach Steuer wirksame
            Zinsdifferenz zwischen endfälligem Gesamtdarlehen und aktueller Restschuld wird monatlich als
            Tilgung genutzt. Die Anlagevarianten laufen mit endfälligem Darlehen. Für Kauf ohne Darlehen
            wird die vermiedene Zinsbelastung als verzinsliche Reserve angesammelt.
          </p>
        </div>

        <form id="calculator-form" class="input-grid" autocomplete="off">
          ${renderCurrencyInput('loan-before-equity', 'Darlehen vor Eigenkapital', defaultInputs.loanBeforeEquity)}
          ${renderCurrencyInput('initial-equity', 'Anfangskapital / Eigenkapital', defaultInputs.initialEquity)}
          ${renderCurrencyInput('monthly-rate', 'Zusätzliche Spar- / Tilgungsrate monatlich', defaultInputs.monthlyRate)}
          ${renderPercentInput('loan-interest-rate', 'Darlehenszins p. a.', defaultInputs.loanInterestRate, 0, 12, 0.05)}
          ${renderPercentInput('marginal-tax-rate', 'Grenzsteuersatz', defaultInputs.marginalTaxRate, 0, 55, 1)}
          <label class="field field-range">
            <span>Rendite der Anlage p. a.</span>
            <div class="range-row">
              <input id="investment-return-rate" type="range" min="0" max="10" step="0.1" value="${defaultInputs.investmentReturnRate}" />
              <strong id="investment-return-output">-</strong>
            </div>
          </label>
        </form>

        <div class="summary-grid">
          <article class="summary-card">
            <span>Start-Restschuld</span>
            <strong id="start-debt">-</strong>
          </article>
          <article class="summary-card">
            <span>Steuerlich geminderter Zins</span>
            <strong id="effective-loan-rate">-</strong>
          </article>
          <article class="summary-card">
            <span>Tilgung aus Zinsvorteil im ersten Monat</span>
            <strong id="interest-saving-rate">-</strong>
          </article>
          <article class="summary-card">
            <span>Tilgung erledigt</span>
            <strong id="payoff-year">-</strong>
          </article>
        </div>

        <section class="chart-panel">
          <div class="chart-head">
            <div>
              <h3>Vor- oder Nachteil der Anlage</h3>
              <p>Y-Achse: Vorteil in Euro gegenüber der Tilgungsstrategie. X-Achse: Zeit in Jahren.</p>
            </div>
            <div id="chart-legend" class="legend">
              <span><i class="legend-insurance"></i>Versicherungslösung</span>
              <span><i class="legend-depot"></i>Vermögensdepot</span>
            </div>
          </div>
          <div id="chart" class="chart" role="img" aria-label="Vorteil oder Nachteil der Anlage gegenüber Sondertilgung"></div>
        </section>

        <section class="matrix-panel">
          <div class="chart-head">
            <div>
              <h3>Matrix nach 5, 10, 15 und 20 Jahren</h3>
              <p>
                Angezeigt wird die Netto-Restschuld: Schulden mit Minuszeichen, Überschüsse mit Pluszeichen.
                Beim Kauf ohne Darlehen wird die vermiedene nach-Steuer-Zinsbelastung als verzinste Reserve
                im Depotstil angesammelt.
                Beim Depot werden Gewinne jährlich mit 17,5 % besteuert. Bei der Versicherung werden zum
                jeweiligen Stichtag 21,25 % Steuern auf den Gewinn abgezogen.
              </p>
            </div>
          </div>
          <div class="table-wrap">
            <table>
              <thead id="matrix-head">
                <tr>
                  <th>Jahr</th>
                  <th>Annuität</th>
                  <th>Versicherung</th>
                  <th>Depot</th>
                  <th>Vorteil Versicherung</th>
                  <th>Vorteil Depot</th>
                </tr>
              </thead>
              <tbody id="matrix-body"></tbody>
            </table>
          </div>
        </section>
    </section>

    <section id="zinsrechner" class="calculator-card calculator-card-secondary tool-panel" hidden>
        <div class="section-head">
          <div>
            <p class="eyebrow">Rechner</p>
            <h2>Zinsrechner</h2>
            <button id="print-zinsrechner" class="print-button" type="button">PDF drucken</button>
          </div>
          <p>
            Trage vier der fünf Werte ein. Der eine leere Parameter wird automatisch aus den anderen vier
            errechnet. Grundlage ist Zinseszins mit optionaler monatlicher Rate.
          </p>
        </div>

        <form id="interest-form" class="input-grid input-grid-5" autocomplete="off">
          ${renderCurrencyInput('interest-start', 'Anfangswert', 100000)}
          ${renderNumberInput('interest-years', 'Laufzeit in Jahren', '10')}
          ${renderPercentInput('interest-rate', 'Zins', 4, -99.99, 25, 0.01)}
          ${renderCurrencyInput('interest-payment', 'Rate monatlich', 500)}
          ${renderCurrencyInput('interest-end', 'Endwert', 148024)}
        </form>

        <div class="summary-grid summary-grid-2">
          <article class="summary-card">
            <span>Errechneter Wert</span>
            <strong id="interest-result">-</strong>
          </article>
          <article class="summary-card">
            <span>Status</span>
            <strong id="interest-status">-</strong>
          </article>
        </div>
    </section>

    <section id="endfaellig-vs-annuitaet" class="calculator-card calculator-card-secondary tool-panel" hidden>
      <div class="section-head">
        <div>
          <p class="eyebrow">Vergleichsrechner</p>
          <h2>Endfällig vs. Annuität</h2>
          <button id="print-endfaellig-vs-annuitaet" class="print-button" type="button">PDF drucken</button>
        </div>
        <p>
          Verglichen werden ein klassisches Annuitätendarlehen und ein endfälliges Darlehen mit
          Kapitalanlage. Während der Bauzeit wird nur Zins gezahlt; die Annuität startet erst nach
          Ende der Bauzeit. Die Sparrate der Kapitalanlage wird so gesetzt, dass sie bei
          ${formatPercent(BASE_BULLET_RETURN_RATE)} Rendite zum Laufzeitende genau die Darlehenshöhe erreicht.
        </p>
      </div>

      <form id="amortization-form" class="input-grid input-grid-4" autocomplete="off">
        ${renderCurrencyInput('amort-loan-amount', 'Darlehenshöhe', defaultAmortizationInputs.loanAmount)}
        ${renderPercentInput('amort-interest-rate', 'Zins p. a.', defaultAmortizationInputs.interestRate, 0, 15, 0.01)}
        ${renderNumberInput('amort-total-years', 'Laufzeit in Jahren', formatInputNumber(defaultAmortizationInputs.totalYears))}
        ${renderNumberInput('amort-construction-years', 'Bauzeit in Jahren', formatInputNumber(defaultAmortizationInputs.constructionYears))}
        ${renderSelectInput('amort-rate-change-year', 'Zinswechsel nach', [
          { value: '0', label: 'kein Wechsel' },
          { value: '5', label: 'nach 5 Jahren' },
          { value: '10', label: 'nach 10 Jahren' },
        ], String(defaultAmortizationInputs.rateChangeYear))}
        ${renderPercentInput('amort-follow-up-interest-rate', 'Folgezins p. a.', defaultAmortizationInputs.followUpInterestRate, 0, 15, 0.01)}
        <label class="field field-range-4">
          <span>Rendite Kapitalanlage p. a.</span>
          <div class="range-row">
            <input id="amort-comparison-return-rate" type="range" min="0" max="11" step="0.1" value="${defaultAmortizationInputs.comparisonReturnRate}" />
            <strong id="amort-comparison-return-output">-</strong>
          </div>
        </label>
      </form>

      <div class="summary-grid">
        <article class="summary-card">
          <span>Zinsdienst in der Bauzeit</span>
          <strong id="amort-construction-interest">-</strong>
        </article>
        <article class="summary-card">
          <span>Annuität nach Bauzeit</span>
          <strong id="amort-annuity-payment">-</strong>
        </article>
        <article class="summary-card">
          <span>Ansparrate endfällig</span>
          <strong id="amort-bullet-savings">-</strong>
        </article>
        <article class="summary-card">
          <span>Rate endfällig</span>
          <strong id="amort-bullet-total">-</strong>
        </article>
      </div>

      <section class="chart-panel">
        <div class="chart-head">
          <div>
            <h3>Verlauf über die gesamte Laufzeit</h3>
            <p>
              Links wird die Monatsrate gezeigt, rechts das aufgebaute Kapital. Beim
              Annuitätendarlehen entspricht das Kapital dem bereits getilgten Anteil
              ${'('}Darlehenshöhe minus Restschuld${')}'}. Beim endfälligen Darlehen wird das
              angesparte Kapital inklusive Rendite und nach Steuer gezeigt.
            </p>
          </div>
          <div class="legend">
            <span><i class="legend-rate-annuity"></i>Annuität Rate</span>
            <span><i class="legend-rate-bullet"></i>Endfällig Rate</span>
            <span><i class="legend-capital-annuity"></i>Annuität Kapital</span>
            <span><i class="legend-capital-bullet"></i>Endfällig Kapital</span>
            <span><i class="legend-tax-benefit"></i>Zusätzliche Steuererstattung</span>
          </div>
        </div>
        <div id="amort-chart" class="chart" role="img" aria-label="Vergleich der Monatsraten von Annuität und endfälligem Darlehen"></div>
      </section>

      <section class="matrix-panel">
        <div class="chart-head">
          <div>
            <h3>Vergleich an ausgewählten Zeitpunkten</h3>
            <p>
              Dargestellt werden die Annuität-Restschuld, die fiktive endfällige Restschuld nach
              Steuer sowie das Guthaben der Kapitalanlage bei der aktuell gewählten
              Rendite inklusive ausgewiesenem Steuerbonus bei Verrentung und kumulierter zusätzlicher
              Steuererstattung aus dem höheren Zinsanteil des endfälligen Darlehens.
            </p>
          </div>
        </div>
        <div class="table-wrap">
          <table>
            <thead id="amort-head"></thead>
            <tbody id="amort-body"></tbody>
          </table>
        </div>
      </section>
    </section>
  </main>
`

const form = getElement<HTMLFormElement>('calculator-form')
const interestForm = getElement<HTMLFormElement>('interest-form')
const amortizationForm = getElement<HTMLFormElement>('amortization-form')
const rangeOutput = getElement<HTMLElement>('investment-return-output')
const chart = getElement<HTMLDivElement>('chart')
const chartLegend = getElement<HTMLDivElement>('chart-legend')
const matrixHead = getElement<HTMLTableSectionElement>('matrix-head')
const matrixBody = getElement<HTMLTableSectionElement>('matrix-body')
const amortizationReturnOutput = getElement<HTMLElement>('amort-comparison-return-output')
const amortizationChart = getElement<HTMLDivElement>('amort-chart')
const amortizationHead = getElement<HTMLTableSectionElement>('amort-head')
const amortizationBody = getElement<HTMLTableSectionElement>('amort-body')
const toolChips = Array.from(document.querySelectorAll<HTMLAnchorElement>('.tool-chip'))

form.addEventListener('input', render)
interestForm.addEventListener('input', renderInterestCalculator)
amortizationForm.addEventListener('input', renderAmortizationComparison)
getElement<HTMLButtonElement>('print-tilgen-vs-anlegen').addEventListener('click', () => printToolPdf('tilgen-vs-anlegen'))
getElement<HTMLButtonElement>('print-zinsrechner').addEventListener('click', () => printToolPdf('zinsrechner'))
getElement<HTMLButtonElement>('print-endfaellig-vs-annuitaet').addEventListener('click', () => printToolPdf('endfaellig-vs-annuitaet'))
toolChips.forEach((chip) => {
  chip.addEventListener('click', (event) => {
    const targetId = chip.getAttribute('href')?.replace('#', '')
    if (!targetId) {
      return
    }

    event.preventDefault()
    openTool(targetId)
  })
})

if (window.location.hash) {
  openTool(window.location.hash.replace('#', ''), false)
}

render()
renderInterestCalculator()
renderAmortizationComparison()

function openTool(id: string, pushHash = true): void {
  const target = document.getElementById(id)
  if (!(target instanceof HTMLElement)) {
    return
  }

  document.querySelectorAll<HTMLElement>('.tool-panel').forEach((panel) => {
    panel.hidden = panel.id !== id
  })

  toolChips.forEach((chip) => {
    chip.classList.toggle('tool-chip-active', chip.getAttribute('href') === `#${id}`)
  })

  if (pushHash) {
    history.replaceState(null, '', `#${id}`)
  }

  target.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function renderAmortizationComparison(): void {
  const inputs = readAmortizationInputs()
  const rows = calculateAmortizationComparisonRows(inputs)
  const bulletSavingsRate = solveMonthlyPayment(0, inputs.loanAmount, inputs.totalYears, BASE_BULLET_RETURN_RATE)
  const constructionInterestPayment = rows.find((row) => row.month === 1)?.annuityInterestPayment ?? getMonthlyInterestPayment(inputs.loanAmount, inputs.interestRate)
  const constructionInterestLabel = formatConstructionInterestSummary(rows, inputs.constructionYears)
  const firstRepaymentRow = rows.find((row) => row.month > Math.round(inputs.constructionYears * MONTHS_PER_YEAR) && row.annuityTotalPayment > 0)
  const followUpStartMonth = inputs.rateChangeYear > 0 ? Math.round(inputs.rateChangeYear * MONTHS_PER_YEAR) + 1 : 0
  const followUpRepaymentRow =
    followUpStartMonth > 0 ? rows.find((row) => row.month >= followUpStartMonth && row.month > Math.round(inputs.constructionYears * MONTHS_PER_YEAR)) : null
  const bulletStartRow = rows.find((row) => row.month === 1)
  const bulletFollowUpRow = followUpStartMonth > 0 ? rows.find((row) => row.month >= followUpStartMonth) : null

  amortizationReturnOutput.textContent = formatPercent(inputs.comparisonReturnRate)
  setText('amort-construction-interest', constructionInterestLabel)
  setText(
    'amort-annuity-payment',
    formatAmortizationPaymentSummary(
      firstRepaymentRow?.annuityTotalPayment ?? 0,
      followUpRepaymentRow?.annuityTotalPayment ?? null,
      inputs.rateChangeYear,
    ),
  )
  setText('amort-bullet-savings', `${formatCurrency(bulletSavingsRate)} / Monat`)
  setText(
    'amort-bullet-total',
    formatBulletPaymentSummary(
      rows,
      inputs.constructionYears,
      inputs.rateChangeYear,
      bulletStartRow?.bulletTotalPayment ?? constructionInterestPayment + bulletSavingsRate,
      bulletFollowUpRow?.bulletTotalPayment ?? null,
    ),
  )
  amortizationChart.innerHTML = renderAmortizationChart(rows, inputs)
  amortizationHead.innerHTML = renderAmortizationMatrixHead(inputs.comparisonReturnRate)
  amortizationBody.innerHTML = renderAmortizationMatrix(rows, inputs)
}

function printToolPdf(toolId: PrintableToolId): void {
  render()
  renderInterestCalculator()
  renderAmortizationComparison()

  const printDocument = createPrintDocument(toolId)
  const printWindow = window.open('', '_blank', 'width=1024,height=768')
  if (!printWindow) {
    window.print()
    return
  }

  printWindow.document.write(renderPrintHtml(printDocument))
  printWindow.document.close()
  printWindow.focus()
  window.setTimeout(() => {
    printWindow.print()
  }, 250)
}

function createPrintDocument(toolId: PrintableToolId): PrintDocument {
  switch (toolId) {
    case 'tilgen-vs-anlegen':
      return createRepaymentVsInvestmentPrintDocument()
    case 'zinsrechner':
      return createInterestPrintDocument()
    case 'endfaellig-vs-annuitaet':
      return createAmortizationPrintDocument()
  }
}

function createRepaymentVsInvestmentPrintDocument(): PrintDocument {
  const inputs = readInputs()
  const rows = calculateRows(inputs)
  const showCashPurchase = isCashPurchaseScenario(inputs)
  const startDebt = getStartDebt(inputs)
  const effectiveLoanRate = getEffectiveLoanInterestRate(inputs)
  const interestSavingRate = getMonthlyInterestDifferenceAfterTax(inputs, startDebt)

  return {
    eyebrow: 'Vergleichsrechner',
    title: 'Tilgen vs. Anlegen',
    description:
      'Vergleich der Sondertilgungsstrategie mit Versicherungslösung und Vermögensdepot. Die Werte zeigen eine modellhafte Betrachtung auf Basis der aktuellen Eingaben.',
    parameters: [
      { label: 'Darlehen vor Eigenkapital', value: formatCurrency(inputs.loanBeforeEquity) },
      { label: 'Anfangskapital / Eigenkapital', value: formatCurrency(inputs.initialEquity) },
      { label: 'Zusätzliche Spar- / Tilgungsrate monatlich', value: `${formatCurrency(inputs.monthlyRate)} / Monat` },
      { label: 'Darlehenszins p. a.', value: formatPercent(inputs.loanInterestRate) },
      { label: 'Grenzsteuersatz', value: formatPercent(inputs.marginalTaxRate) },
      { label: 'Rendite der Anlage p. a.', value: formatPercent(inputs.investmentReturnRate) },
    ],
    metrics: [
      { label: 'Start-Restschuld', value: formatCurrency(startDebt) },
      { label: 'Steuerlich geminderter Zins', value: formatPercent(effectiveLoanRate) },
      { label: 'Tilgung aus Zinsvorteil im ersten Monat', value: `${formatCurrency(interestSavingRate)} / Monat` },
      { label: 'Tilgung erledigt', value: formatPayoffYear(getPayoffYear(rows)) },
    ],
    chartHtml: renderChart(rows, showCashPurchase),
    legendHtml: renderLegend(showCashPurchase),
    tableTitle: 'Matrix nach 5, 10, 15 und 20 Jahren',
    tableHeadHtml: renderMatrixHead(showCashPurchase),
    tableBodyHtml: renderMatrix(rows, showCashPurchase),
    note:
      'Beim Depot werden Gewinne jährlich mit 17,5 % besteuert. Bei der Versicherung werden zum jeweiligen Stichtag 21,25 % Steuern auf den Gewinn abgezogen.',
  }
}

function createInterestPrintDocument(): PrintDocument {
  const startValue = readOptionalNumber('interest-start')
  const years = readOptionalNumber('interest-years')
  const rate = readOptionalNumber('interest-rate')
  const payment = readOptionalNumber('interest-payment')
  const endValue = readOptionalNumber('interest-end')
  const missingField = getMissingInterestField([
    ['interest-start', startValue],
    ['interest-years', years],
    ['interest-rate', rate],
    ['interest-payment', payment],
    ['interest-end', endValue],
  ])
  const result =
    missingField === null
      ? null
      : calculateMissingInterestField(missingField, { startValue, years, rate, payment, endValue })

  return {
    eyebrow: 'Rechner',
    title: 'Zinsrechner',
    description:
      'Berechnung des einen fehlenden Parameters aus den vier ausgefüllten Werten. Grundlage ist Zinseszins mit optionaler monatlicher Rate.',
    parameters: [
      { label: 'Anfangswert', value: formatOptionalCurrency(startValue, 'leer gelassen') },
      { label: 'Laufzeit in Jahren', value: formatOptionalNumber(years, 'leer gelassen') },
      { label: 'Zins p. a.', value: rate === null ? 'leer gelassen' : formatPercent(rate) },
      { label: 'Rate monatlich', value: formatOptionalMonthlyCurrency(payment, 'leer gelassen') },
      { label: 'Endwert', value: formatOptionalCurrency(endValue, 'leer gelassen') },
    ],
    metrics: [
      { label: 'Errechneter Wert', value: result ?? '-' },
      { label: 'Status', value: missingField === null ? 'Bitte genau einen Wert leer lassen' : getInterestFieldLabel(missingField) },
    ],
    note: 'Die Berechnung arbeitet mit monatlicher Verzinsung aus dem eingegebenen Jahreszins.',
  }
}

function createAmortizationPrintDocument(): PrintDocument {
  const inputs = readAmortizationInputs()
  const rows = calculateAmortizationComparisonRows(inputs)
  const bulletSavingsRate = solveMonthlyPayment(0, inputs.loanAmount, inputs.totalYears, BASE_BULLET_RETURN_RATE)
  const constructionInterestPayment = rows.find((row) => row.month === 1)?.annuityInterestPayment ?? getMonthlyInterestPayment(inputs.loanAmount, inputs.interestRate)
  const constructionInterestLabel = formatConstructionInterestSummary(rows, inputs.constructionYears)
  const firstRepaymentRow = rows.find((row) => row.month > Math.round(inputs.constructionYears * MONTHS_PER_YEAR) && row.annuityTotalPayment > 0)
  const followUpStartMonth = inputs.rateChangeYear > 0 ? Math.round(inputs.rateChangeYear * MONTHS_PER_YEAR) + 1 : 0
  const followUpRepaymentRow =
    followUpStartMonth > 0 ? rows.find((row) => row.month >= followUpStartMonth && row.month > Math.round(inputs.constructionYears * MONTHS_PER_YEAR)) : null
  const bulletStartRow = rows.find((row) => row.month === 1)
  const bulletFollowUpRow = followUpStartMonth > 0 ? rows.find((row) => row.month >= followUpStartMonth) : null

  return {
    eyebrow: 'Vergleichsrechner',
    title: 'Endfällig vs. Annuität',
    description:
      'Vergleich eines klassischen Annuitätendarlehens mit einem endfälligen Darlehen und Kapitalanlage. Während der Bauzeit wird nur Zins gezahlt.',
    parameters: [
      { label: 'Darlehenshöhe', value: formatCurrency(inputs.loanAmount) },
      { label: 'Zins p. a.', value: formatPercent(inputs.interestRate) },
      { label: 'Laufzeit in Jahren', value: formatAxisYearLabel(inputs.totalYears) },
      { label: 'Bauzeit in Jahren', value: formatAxisYearLabel(inputs.constructionYears) },
      { label: 'Zinswechsel nach', value: inputs.rateChangeYear > 0 ? `${formatAxisYearLabel(inputs.rateChangeYear)} Jahren` : 'kein Wechsel' },
      { label: 'Folgezins p. a.', value: formatPercent(inputs.followUpInterestRate) },
      { label: 'Rendite Kapitalanlage p. a.', value: formatPercent(inputs.comparisonReturnRate) },
      { label: 'Basis-Rendite Ansparrate', value: formatPercent(BASE_BULLET_RETURN_RATE) },
    ],
    metrics: [
      { label: 'Zinsdienst in der Bauzeit', value: constructionInterestLabel },
      {
        label: 'Annuität nach Bauzeit',
        value: formatAmortizationPaymentSummary(
          firstRepaymentRow?.annuityTotalPayment ?? 0,
          followUpRepaymentRow?.annuityTotalPayment ?? null,
          inputs.rateChangeYear,
        ),
      },
      { label: 'Ansparrate endfällig', value: `${formatCurrency(bulletSavingsRate)} / Monat` },
      {
        label: 'Rate endfällig',
        value: formatBulletPaymentSummary(
          rows,
          inputs.constructionYears,
          inputs.rateChangeYear,
          bulletStartRow?.bulletTotalPayment ?? constructionInterestPayment + bulletSavingsRate,
          bulletFollowUpRow?.bulletTotalPayment ?? null,
        ),
      },
    ],
    chartHtml: renderAmortizationChart(rows, inputs, true),
    tableTitle: 'Vergleich an ausgewählten Zeitpunkten',
    tableHeadHtml: renderAmortizationMatrixHead(inputs.comparisonReturnRate),
    tableBodyHtml: renderAmortizationMatrix(rows, inputs),
    note:
      'Die Sparrate der Kapitalanlage wird in der Basisrate so berechnet, dass sie bei 2,5 % Rendite zum Laufzeitende die Darlehenshöhe erreicht.',
  }
}

function render(): void {
  const inputs = readInputs()
  const rows = calculateRows(inputs)
  const showCashPurchase = isCashPurchaseScenario(inputs)
  const startDebt = getStartDebt(inputs)
  const effectiveLoanRate = getEffectiveLoanInterestRate(inputs)
  const interestSavingRate = getMonthlyInterestDifferenceAfterTax(inputs, startDebt)

  rangeOutput.textContent = formatPercent(inputs.investmentReturnRate)
  setText('start-debt', formatCurrency(startDebt))
  setText('effective-loan-rate', formatPercent(effectiveLoanRate))
  setText('interest-saving-rate', `${formatCurrency(interestSavingRate)} / Monat`)
  setText('payoff-year', formatPayoffYear(getPayoffYear(rows)))
  chartLegend.innerHTML = renderLegend(showCashPurchase)
  matrixHead.innerHTML = renderMatrixHead(showCashPurchase)
  chart.innerHTML = renderChart(rows, showCashPurchase)
  matrixBody.innerHTML = renderMatrix(rows, showCashPurchase)
}

function calculateRows(inputs: Inputs): YearRow[] {
  const startDebt = getStartDebt(inputs)
  const endLoanDebt = inputs.loanBeforeEquity
  const investmentMonthlyRate = inputs.investmentReturnRate / 100 / MONTHS_PER_YEAR
  const rows: YearRow[] = []

  let repaymentDebt = startDebt
  let cashPurchaseNetValue = 0
  let cashYearStartValue = 0
  let cashYearContributions = 0
  let insuranceGrossValue = inputs.initialEquity
  let depotNetValue = inputs.initialEquity
  let depotYearStartValue = depotNetValue
  let depotYearContributions = 0
  let contributionBasis = inputs.initialEquity

  for (let month = 1; month <= YEARS * MONTHS_PER_YEAR; month += 1) {
    const monthlyInterestDifference = getMonthlyInterestDifferenceAfterTax(inputs, repaymentDebt)
    const monthlyCashPurchaseContribution = inputs.monthlyRate + getMonthlyFullLoanInterestAfterTax(inputs)
    repaymentDebt = reduceDebtByPrincipal(repaymentDebt, inputs.monthlyRate + monthlyInterestDifference)
    cashPurchaseNetValue =
      cashPurchaseNetValue * (1 + investmentMonthlyRate) + monthlyCashPurchaseContribution
    insuranceGrossValue = insuranceGrossValue * (1 + investmentMonthlyRate) + inputs.monthlyRate
    depotNetValue = depotNetValue * (1 + investmentMonthlyRate) + inputs.monthlyRate
    contributionBasis += inputs.monthlyRate
    cashYearContributions += monthlyCashPurchaseContribution
    depotYearContributions += inputs.monthlyRate

    if (month % MONTHS_PER_YEAR === 0) {
      const year = month / MONTHS_PER_YEAR
      const cashAnnualGain = Math.max(cashPurchaseNetValue - cashYearStartValue - cashYearContributions, 0)
      cashPurchaseNetValue -= cashAnnualGain * DEPOT_TAX_RATE_ON_GAINS
      cashYearStartValue = cashPurchaseNetValue
      cashYearContributions = 0
      const depotAnnualGain = Math.max(depotNetValue - depotYearStartValue - depotYearContributions, 0)
      depotNetValue -= depotAnnualGain * DEPOT_TAX_RATE_ON_GAINS
      depotYearStartValue = depotNetValue
      depotYearContributions = 0
      const insuranceNetValue = getNetValueAfterGainTax(insuranceGrossValue, contributionBasis)

      rows.push({
        year,
        repaymentDebt,
        cashPurchaseNetValue,
        cashPurchaseNetDebt: -cashPurchaseNetValue,
        insuranceGrossValue,
        insuranceNetValue,
        depotNetValue,
        insuranceNetDebt: endLoanDebt - insuranceNetValue,
        depotNetDebt: endLoanDebt - depotNetValue,
        cashPurchaseAdvantage: cashPurchaseNetValue + repaymentDebt,
        insuranceAdvantage: insuranceNetValue - endLoanDebt + repaymentDebt,
        depotAdvantage: depotNetValue - endLoanDebt + repaymentDebt,
      })
    }
  }

  return rows
}

function reduceDebtByPrincipal(currentDebt: number, principalPayment: number): number {
  if (currentDebt <= 0) {
    return 0
  }

  return Math.max(currentDebt - principalPayment, 0)
}

function getStartDebt(inputs: Inputs): number {
  return Math.max(inputs.loanBeforeEquity - inputs.initialEquity, 0)
}

function getEffectiveLoanInterestRate(inputs: Inputs): number {
  return inputs.loanInterestRate * (1 - inputs.marginalTaxRate / 100)
}

function getMonthlyInterestDifferenceAfterTax(inputs: Inputs, currentRepaymentDebt: number): number {
  const debtDifference = Math.max(inputs.loanBeforeEquity - currentRepaymentDebt, 0)
  return debtDifference * (getEffectiveLoanInterestRate(inputs) / 100) / MONTHS_PER_YEAR
}

function getMonthlyFullLoanInterestAfterTax(inputs: Inputs): number {
  return inputs.loanBeforeEquity * (getEffectiveLoanInterestRate(inputs) / 100) / MONTHS_PER_YEAR
}

function getPayoffYear(rows: YearRow[]): number | null {
  const row = rows.find((entry) => entry.repaymentDebt <= 0)
  return row?.year ?? null
}

function isCashPurchaseScenario(inputs: Inputs): boolean {
  return Math.abs(inputs.loanBeforeEquity - inputs.initialEquity) < 0.01
}

function formatPayoffYear(year: number | null): string {
  return year === null ? 'nach 20 Jahren offen' : `Jahr ${year}`
}

function renderChart(rows: YearRow[], showCashPurchase: boolean): string {
  const width = 920
  const height = 390
  const padding = { top: 24, right: 28, bottom: 48, left: 92 }
  const plotWidth = width - padding.left - padding.right
  const plotHeight = height - padding.top - padding.bottom
  const values = rows.flatMap((row) =>
    showCashPurchase
      ? [row.cashPurchaseAdvantage, row.insuranceAdvantage, row.depotAdvantage, 0]
      : [row.insuranceAdvantage, row.depotAdvantage, 0],
  )
  const maxAbsValue = Math.max(...values.map((value) => Math.abs(value)), 1000)
  const yMax = roundUpToNiceValue(maxAbsValue)
  const scaleX = (year: number): number => padding.left + (year / YEARS) * plotWidth
  const scaleY = (value: number): number => padding.top + ((yMax - value) / (yMax * 2)) * plotHeight
  const cashPath = buildPath(rows.map((row) => [scaleX(row.year), scaleY(row.cashPurchaseAdvantage)]))
  const insurancePath = buildPath(rows.map((row) => [scaleX(row.year), scaleY(row.insuranceAdvantage)]))
  const depotPath = buildPath(rows.map((row) => [scaleX(row.year), scaleY(row.depotAdvantage)]))
  const zeroY = scaleY(0)
  const ticks = [-yMax, -yMax / 2, 0, yMax / 2, yMax]

  return `
    <svg viewBox="0 0 ${width} ${height}" aria-hidden="true">
      <defs>
        <linearGradient id="insuranceGradient" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stop-color="#164734" />
          <stop offset="100%" stop-color="#3ba56d" />
        </linearGradient>
        <linearGradient id="depotGradient" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stop-color="#8a5b18" />
          <stop offset="100%" stop-color="#d99c32" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="${width}" height="${height}" rx="26" fill="#f7f2ea" />
      ${ticks
        .map((tick) => {
          const y = scaleY(tick)
          return `
            <line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" class="grid-line" />
            <text x="${padding.left - 14}" y="${y + 5}" text-anchor="end" class="axis-label">${formatCompactCurrency(tick)}</text>
          `
        })
        .join('')}
      <line x1="${padding.left}" y1="${zeroY}" x2="${width - padding.right}" y2="${zeroY}" class="zero-line" />
      ${[0, 5, 10, 15, 20]
        .map((year) => `
          <text x="${scaleX(year)}" y="${height - 16}" text-anchor="middle" class="axis-label">${year}</text>
        `)
        .join('')}
      ${showCashPurchase ? `<path d="${cashPath}" class="line" stroke="#3b5ccc" />` : ''}
      <path d="${insurancePath}" class="line" stroke="#2f7a56" />
      <path d="${depotPath}" class="line" stroke="#c88625" />
      ${renderDots(rows, scaleX, scaleY, showCashPurchase)}
      <text x="${width / 2}" y="${height - 2}" text-anchor="middle" class="axis-title">Jahre</text>
      <text x="20" y="${height / 2}" text-anchor="middle" class="axis-title axis-title-y" transform="rotate(-90 20 ${height / 2})">Vorteil in Euro</text>
    </svg>
  `
}

function renderDots(
  rows: YearRow[],
  scaleX: (year: number) => number,
  scaleY: (value: number) => number,
  showCashPurchase: boolean,
): string {
  return rows
    .filter((row) => MATRIX_YEARS.includes(row.year))
    .map((row) => `
      ${showCashPurchase ? `<circle cx="${scaleX(row.year)}" cy="${scaleY(row.cashPurchaseAdvantage)}" r="4.5" class="dot dot-cash" />` : ''}
      <circle cx="${scaleX(row.year)}" cy="${scaleY(row.insuranceAdvantage)}" r="4.5" class="dot dot-insurance" />
      <circle cx="${scaleX(row.year)}" cy="${scaleY(row.depotAdvantage)}" r="4.5" class="dot dot-depot" />
    `)
    .join('')
}

function renderLegend(showCashPurchase: boolean): string {
  return `
    ${showCashPurchase ? '<span><i class="legend-cash"></i>Kauf ohne Darlehen</span>' : ''}
    <span><i class="legend-insurance"></i>Versicherungslösung</span>
    <span><i class="legend-depot"></i>Vermögensdepot</span>
  `
}

function renderMatrixHead(showCashPurchase: boolean): string {
  return `
    <tr>
      <th>Jahr</th>
      <th>Annuität</th>
      ${showCashPurchase ? '<th>Kauf ohne</th>' : ''}
      <th>Versicherung</th>
      <th>Depot</th>
      ${showCashPurchase ? '<th>Vorteil Kauf ohne</th>' : ''}
      <th>Vorteil Versicherung</th>
      <th>Vorteil Depot</th>
    </tr>
  `
}

function renderMatrix(rows: YearRow[], showCashPurchase: boolean): string {
  return MATRIX_YEARS.map((year) => {
    const row = rows.find((entry) => entry.year === year)
    if (!row) {
      return ''
    }

    return `
      <tr>
        <td>${year}</td>
        <td class="debt-value">${formatNetDebt(row.repaymentDebt)}</td>
        ${showCashPurchase ? `<td class="${getNetDebtClass(row.cashPurchaseNetDebt)}">${formatNetDebt(row.cashPurchaseNetDebt)}</td>` : ''}
        <td class="${getNetDebtClass(row.insuranceNetDebt)}">${formatNetDebt(row.insuranceNetDebt)}</td>
        <td class="${getNetDebtClass(row.depotNetDebt)}">${formatNetDebt(row.depotNetDebt)}</td>
        ${showCashPurchase ? `<td class="${row.cashPurchaseAdvantage >= 0 ? 'positive' : 'negative'}">${formatSignedCurrency(row.cashPurchaseAdvantage)}</td>` : ''}
        <td class="${row.insuranceAdvantage >= 0 ? 'positive' : 'negative'}">${formatSignedCurrency(row.insuranceAdvantage)}</td>
        <td class="${row.depotAdvantage >= 0 ? 'positive' : 'negative'}">${formatSignedCurrency(row.depotAdvantage)}</td>
      </tr>
    `
  }).join('')
}

function getNetDebtClass(netDebt: number): string {
  return netDebt <= 0 ? 'surplus-value' : 'debt-value'
}

function buildPath(points: Array<[number, number]>): string {
  return points.map(([x, y], index) => `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`).join(' ')
}

function roundUpToNiceValue(value: number): number {
  const magnitude = 10 ** Math.floor(Math.log10(value))
  const normalized = value / magnitude
  const nice = normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10
  return nice * magnitude
}

function readInputs(): Inputs {
  return {
    loanBeforeEquity: Math.max(readNumber('loan-before-equity'), 0),
    initialEquity: Math.max(readNumber('initial-equity'), 0),
    monthlyRate: Math.max(readNumber('monthly-rate'), 0),
    loanInterestRate: clamp(readNumber('loan-interest-rate'), 0, 12),
    investmentReturnRate: clamp(readNumber('investment-return-rate'), 0, 10),
    marginalTaxRate: clamp(readNumber('marginal-tax-rate'), 0, 55),
  }
}

function readAmortizationInputs(): AmortizationComparisonInputs {
  const totalYears = Math.max(readNumber('amort-total-years'), 1)
  const constructionYears = Math.min(Math.max(readNumber('amort-construction-years'), 0), totalYears)
  const rateChangeYear = Math.min(Math.max(readNumber('amort-rate-change-year'), 0), totalYears)

  return {
    loanAmount: Math.max(readNumber('amort-loan-amount'), 0),
    interestRate: clamp(readNumber('amort-interest-rate'), 0, 15),
    totalYears,
    constructionYears,
    comparisonReturnRate: clamp(readNumber('amort-comparison-return-rate'), 0, 11),
    rateChangeYear,
    followUpInterestRate: clamp(readNumber('amort-follow-up-interest-rate'), 0, 15),
  }
}

function formatConstructionInterestSummary(
  rows: AmortizationComparisonRow[],
  constructionYears: number,
): string {
  const constructionMonths = Math.round(constructionYears * MONTHS_PER_YEAR)
  if (constructionMonths <= 0) {
    return 'keine Bauzeit'
  }

  const constructionRows = rows.filter((row) => row.month >= 1 && row.month <= constructionMonths)
  const firstInterest = constructionRows[0]?.annuityInterestPayment ?? 0
  const lastInterest = constructionRows[constructionRows.length - 1]?.annuityInterestPayment ?? firstInterest

  if (Math.abs(lastInterest - firstInterest) < 0.5) {
    return `${formatCurrency(firstInterest)} / Monat`
  }

  return `${formatCurrency(firstInterest)} bis ${formatCurrency(lastInterest)} / Monat`
}

function renderAmortizationChart(
  rows: AmortizationComparisonRow[],
  inputs: AmortizationComparisonInputs,
  includeLegend = false,
): string {
  const width = 920
  const height = 390
  const padding = { top: 24, right: 92, bottom: 48, left: 92 }
  const plotWidth = width - padding.left - padding.right
  const plotHeight = height - padding.top - padding.bottom
  const rateValues = rows.flatMap((row) => [row.annuityTotalPayment, row.bulletTotalPayment, 0])
  const capitalValues = rows.flatMap((row) => [
    Math.max(inputs.loanAmount - row.annuityDebt, 0),
    row.replacementSliderNetValue,
    row.cumulativeExtraTaxBenefit,
    0,
  ])
  const rateMax = roundUpToNiceValue(Math.max(...rateValues, 1000))
  const capitalMax = roundUpToNiceValue(Math.max(...capitalValues, inputs.loanAmount, 1000))
  const maxYear = Math.max(inputs.totalYears, 1)
  const scaleX = (year: number): number => padding.left + (year / maxYear) * plotWidth
  const scaleRateY = (value: number): number => padding.top + ((rateMax - value) / rateMax) * plotHeight
  const scaleCapitalY = (value: number): number => padding.top + ((capitalMax - value) / capitalMax) * plotHeight
  const rateTicks = [0, rateMax * 0.25, rateMax * 0.5, rateMax * 0.75, rateMax]
  const capitalTicks = [0, capitalMax * 0.25, capitalMax * 0.5, capitalMax * 0.75, capitalMax]
  const xTicks = buildYearTicks(maxYear)
  const annuityRatePath = buildPath(rows.map((row) => [scaleX(row.year), scaleRateY(row.annuityTotalPayment)]))
  const bulletRatePath = buildPath(rows.map((row) => [scaleX(row.year), scaleRateY(row.bulletTotalPayment)]))
  const annuityCapitalPath = buildPath(rows.map((row) => [scaleX(row.year), scaleCapitalY(Math.max(inputs.loanAmount - row.annuityDebt, 0))]))
  const bulletCapitalPath = buildPath(rows.map((row) => [scaleX(row.year), scaleCapitalY(row.replacementSliderNetValue)]))
  const taxBenefitPath = buildPath(rows.map((row) => [scaleX(row.year), scaleCapitalY(row.cumulativeExtraTaxBenefit)]))

  return `
    <svg viewBox="0 0 ${width} ${height}" aria-hidden="true">
      <rect x="0" y="0" width="${width}" height="${height}" rx="26" fill="#f7f2ea" />
      ${rateTicks
        .map((tick) => {
          const y = scaleRateY(tick)
          return `
            <line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" class="grid-line" />
            <text x="${padding.left - 14}" y="${y + 5}" text-anchor="end" class="axis-label">${formatRateCurrency(tick)}</text>
          `
        })
        .join('')}
      ${capitalTicks
        .map((tick) => {
          const y = scaleCapitalY(tick)
          return `
            <text x="${width - padding.right + 14}" y="${y + 5}" text-anchor="start" class="axis-label">${formatCompactCurrency(tick)}</text>
          `
        })
        .join('')}
      ${xTicks
        .map((tick) => `
          <text x="${scaleX(tick)}" y="${height - 16}" text-anchor="middle" class="axis-label">${formatAxisYearLabel(tick)}</text>
        `)
        .join('')}
      <path d="${annuityRatePath}" class="line" stroke="#3b5ccc" />
      <path d="${bulletRatePath}" class="line" stroke="#d08a1b" />
      <path d="${annuityCapitalPath}" class="line" stroke="#3b5ccc" stroke-dasharray="10 8" />
      <path d="${bulletCapitalPath}" class="line" stroke="#d08a1b" stroke-dasharray="10 8" />
      <path d="${taxBenefitPath}" class="line" stroke="#8fd19e" stroke-dasharray="12 8" />
      ${includeLegend ? renderAmortizationSvgLegend() : ''}
      <text x="${width / 2}" y="${height - 2}" text-anchor="middle" class="axis-title">Jahre</text>
      <text x="20" y="${height / 2}" text-anchor="middle" class="axis-title axis-title-y" transform="rotate(-90 20 ${height / 2})">Rate pro Monat</text>
      <text x="${width - 20}" y="${height / 2}" text-anchor="middle" class="axis-title axis-title-y" transform="rotate(90 ${width - 20} ${height / 2})">Kapital</text>
    </svg>
  `
}

function renderAmortizationSvgLegend(): string {
  return `
    <g class="svg-legend" transform="translate(118 42)">
      <rect x="0" y="0" width="286" height="78" rx="10" fill="#fffdf8" opacity="0.92" stroke="#d9cab8" />
      <line x1="14" y1="22" x2="54" y2="22" stroke="#3b5ccc" stroke-width="5" stroke-linecap="round" />
      <text x="66" y="27" class="svg-legend-label">Annuität Rate/Kapital</text>
      <line x1="14" y1="44" x2="54" y2="44" stroke="#d08a1b" stroke-width="5" stroke-linecap="round" />
      <text x="66" y="49" class="svg-legend-label">Endfällig Rate/Kapital</text>
      <line x1="14" y1="66" x2="54" y2="66" stroke="#8fd19e" stroke-width="5" stroke-linecap="round" stroke-dasharray="10 7" />
      <text x="66" y="71" class="svg-legend-label">Zusätzliche Steuererstattung</text>
    </g>
  `
}

function buildYearTicks(maxYear: number): number[] {
  const ticks = new Set<number>([0, maxYear])
  const interval = maxYear <= 10 ? 2 : 5
  for (let value = interval; value < maxYear; value += interval) {
    ticks.add(value)
  }
  return Array.from(ticks).sort((left, right) => left - right)
}

function formatAxisYearLabel(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toLocaleString('de-DE', { maximumFractionDigits: 1 })
}

function renderAmortizationMatrixHead(returnRate: number): string {
  return `
    <tr>
      <th>Jahr</th>
      <th>Annuität Restschuld</th>
      <th>Endfällig Restschuld</th>
      <th>Kapitalanlage ${formatPercent(returnRate)}</th>
      <th>Gezahlte Raten Annuität</th>
      <th>Gezahlte Raten Endfällig</th>
      <th>Steuerbonus bei Verrentung</th>
      <th>Zusätzliche Steuererstattung aus endfälligem Darlehen</th>
    </tr>
  `
}

function renderAmortizationMatrix(
  rows: AmortizationComparisonRow[],
  inputs: AmortizationComparisonInputs,
): string {
  return getAmortizationMilestones(inputs.totalYears, inputs.constructionYears)
    .map((year) => {
      const row = getAmortizationRowAtYear(rows, year)
      if (!row) {
        return ''
      }

      return `
        <tr>
          <td>${formatAxisYearLabel(year)}</td>
          <td class="debt-value">${formatNetDebt(row.annuityDebt)}</td>
          <td class="${getNetDebtClass(row.bulletNetDebt)}">${formatNetDebt(row.bulletNetDebt)}</td>
          <td>${renderCumulativePaymentCell(row.replacementSliderValue, row.sliderTaxDeduction)}</td>
          <td>${renderCumulativePaymentCell(row.cumulativeAnnuityPayments, row.cumulativeAnnuityTaxBenefit)}</td>
          <td>${renderCumulativePaymentCell(row.cumulativeBulletPayments, row.cumulativeBulletTaxBenefit)}</td>
          <td class="${row.sliderTaxDeduction > 0 ? 'positive' : 'debt-value'}">${formatTaxBonus(row.sliderTaxDeduction)}</td>
          <td class="positive">${formatCurrency(row.cumulativeExtraTaxBenefit)}</td>
        </tr>
      `
    })
    .join('')
}

function renderCumulativePaymentCell(grossPayments: number, taxBenefit: number): string {
  const netPayments = Math.max(grossPayments - taxBenefit, 0)

  return `
    <span class="amount-lines">
      <span><b>vor</b> ${formatCurrency(grossPayments)}</span>
      <span><b>nach</b> ${formatCurrency(netPayments)}</span>
    </span>
  `
}

function getAmortizationMilestones(totalYears: number, constructionYears: number): number[] {
  const milestones = new Set<number>([totalYears])
  if (constructionYears > 0 && constructionYears < totalYears) {
    milestones.add(constructionYears)
  }

  for (let year = 5; year < totalYears; year += 5) {
    milestones.add(year)
  }

  return Array.from(milestones)
    .filter((value) => value > 0)
    .sort((left, right) => left - right)
}

function getAmortizationRowAtYear(rows: AmortizationComparisonRow[], year: number): AmortizationComparisonRow | null {
  const month = Math.round(year * MONTHS_PER_YEAR)
  return rows.find((row) => row.month === month) ?? null
}

function formatAmortizationPaymentSummary(
  startPayment: number,
  followUpPayment: number | null,
  rateChangeYear: number,
): string {
  if (!followUpPayment || rateChangeYear <= 0 || Math.abs(followUpPayment - startPayment) < 0.5) {
    return `${formatCurrency(startPayment)} / Monat`
  }

  return `${formatCurrency(startPayment)} / Monat, ab Jahr ${rateChangeYear} ${formatCurrency(followUpPayment)} / Monat`
}

function formatBulletPaymentSummary(
  rows: AmortizationComparisonRow[],
  constructionYears: number,
  rateChangeYear: number,
  startPayment: number,
  followUpPayment: number | null,
): string {
  const constructionMonths = Math.round(constructionYears * MONTHS_PER_YEAR)
  const lastConstructionPayment =
    constructionMonths > 0
      ? rows.find((row) => row.month === constructionMonths)?.bulletTotalPayment ?? startPayment
      : startPayment

  const baseSummary =
    constructionMonths > 0 && Math.abs(lastConstructionPayment - startPayment) >= 0.5
      ? `${formatCurrency(startPayment)} bis ${formatCurrency(lastConstructionPayment)} / Monat`
      : `${formatCurrency(startPayment)} / Monat`

  if (!followUpPayment || rateChangeYear <= 0 || Math.abs(followUpPayment - lastConstructionPayment) < 0.5) {
    return baseSummary
  }

  return `${baseSummary}, ab Jahr ${rateChangeYear} ${formatCurrency(followUpPayment)} / Monat`
}

function readNumber(id: string): number {
  const input = getElement<HTMLInputElement | HTMLSelectElement>(id)
  const value = Number(parseLocalizedNumber(input.value))
  return Number.isFinite(value) ? value : 0
}

function parseLocalizedNumber(rawValue: string): string {
  const value = rawValue.trim().replace(/[^\d,.-]/g, '')
  const hasComma = value.includes(',')
  const hasDot = value.includes('.')

  if (hasComma && hasDot) {
    return value.replace(/\./g, '').replace(',', '.')
  }

  if (hasComma) {
    return value.replace(',', '.')
  }

  const dotCount = (value.match(/\./g) ?? []).length
  if (dotCount > 1) {
    return value.replace(/\./g, '')
  }

  const dotIndex = value.indexOf('.')
  if (dotIndex >= 0 && value.length - dotIndex - 1 === 3) {
    return value.replace('.', '')
  }

  return value
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function renderCurrencyInput(id: string, label: string, value: number): string {
  return `
    <label class="field">
      <span>${label}</span>
      <div class="input-shell">
        <input id="${id}" type="text" inputmode="decimal" value="${formatInputNumber(value)}" />
        <b>€</b>
      </div>
    </label>
  `
}

function renderPercentInput(
  id: string,
  label: string,
  value: number,
  min: number,
  max: number,
  step: number,
): string {
  return `
    <label class="field">
      <span>${label}</span>
      <div class="input-shell">
        <input id="${id}" type="text" inputmode="decimal" value="${formatInputNumber(value)}" data-min="${min}" data-max="${max}" data-step="${step}" />
        <b>%</b>
      </div>
    </label>
  `
}

function renderSelectInput(
  id: string,
  label: string,
  options: Array<{ value: string; label: string }>,
  selectedValue: string,
): string {
  return `
    <label class="field">
      <span>${label}</span>
      <div class="input-shell">
        <select id="${id}">
          ${options
            .map((option) => `<option value="${option.value}"${option.value === selectedValue ? ' selected' : ''}>${option.label}</option>`)
            .join('')}
        </select>
      </div>
    </label>
  `
}

function formatInputNumber(value: number): string {
  return value.toLocaleString('de-DE', { maximumFractionDigits: 2 })
}

function setText(id: string, value: string): void {
  getElement<HTMLElement>(id).textContent = value
}

function getElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id)
  if (!element) {
    throw new Error(`Element "${id}" wurde nicht gefunden.`)
  }
  return element as T
}

function formatCurrency(value: number): string {
  const normalizedValue = normalizeRoundedCurrencyValue(value)
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(normalizedValue)
}

function formatSignedCurrency(value: number): string {
  const normalizedValue = normalizeRoundedCurrencyValue(value)
  if (normalizedValue === 0) {
    return formatCurrency(0)
  }

  const prefix = normalizedValue > 0 ? '+' : ''
  return `${prefix}${formatCurrency(normalizedValue)}`
}

function formatTaxBonus(value: number): string {
  return value <= 0 ? formatCurrency(0) : formatCurrency(value)
}

function formatRateCurrency(value: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatNetDebt(netDebt: number): string {
  const normalizedDebt = normalizeRoundedCurrencyValue(netDebt)
  if (normalizedDebt === 0) {
    return formatCurrency(0)
  }

  if (normalizedDebt < 0) {
    return `+${formatCurrency(Math.abs(normalizedDebt))}`
  }

  return `-${formatCurrency(normalizedDebt)}`
}

function normalizeRoundedCurrencyValue(value: number): number {
  const roundedValue = Math.round(value)
  return Object.is(roundedValue, -0) ? 0 : roundedValue
}

function formatCompactCurrency(value: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

function formatPercent(value: number): string {
  return `${value.toLocaleString('de-DE', { maximumFractionDigits: 2 })} %`
}

function renderNumberInput(id: string, label: string, value: string): string {
  return `
    <label class="field">
      <span>${label}</span>
      <div class="input-shell">
        <input id="${id}" type="text" inputmode="decimal" value="${value}" />
      </div>
    </label>
  `
}

function renderInterestCalculator(): void {
  const startValue = readOptionalNumber('interest-start')
  const years = readOptionalNumber('interest-years')
  const rate = readOptionalNumber('interest-rate')
  const payment = readOptionalNumber('interest-payment')
  const endValue = readOptionalNumber('interest-end')
  const entries: Array<[InterestFieldId, number | null]> = [
    ['interest-start', startValue],
    ['interest-years', years],
    ['interest-rate', rate],
    ['interest-payment', payment],
    ['interest-end', endValue],
  ]
  const missing = entries.filter(([, value]) => value === null)

  if (missing.length !== 1) {
    setText('interest-result', '–')
    setText('interest-status', 'Bitte genau einen Wert leer lassen')
    return
  }

  const [missingField] = missing[0]
  const result = calculateMissingInterestField(missingField, {
    startValue,
    years,
    rate,
    payment,
    endValue,
  })

  if (!result) {
    setText('interest-result', '–')
    setText('interest-status', 'Mit diesen Angaben nicht eindeutig berechenbar')
    return
  }

  setText('interest-result', result)
  setText('interest-status', getInterestFieldLabel(missingField))
}

function calculateMissingInterestField(
  missingField: InterestFieldId,
  values: {
    startValue: number | null
    years: number | null
    rate: number | null
    payment: number | null
    endValue: number | null
  },
): string | null {
  const { startValue, years, rate, payment, endValue } = values

  switch (missingField) {
    case 'interest-end': {
      if (
        startValue === null ||
        years === null ||
        rate === null ||
        payment === null ||
        startValue < 0 ||
        years < 0 ||
        rate <= -100
      ) {
        return null
      }
      return formatCurrency(calculateFutureValue(startValue, years, rate, payment))
    }
    case 'interest-start': {
      if (
        endValue === null ||
        years === null ||
        rate === null ||
        payment === null ||
        endValue < 0 ||
        years < 0 ||
        rate <= -100
      ) {
        return null
      }
      const computedStart = calculatePresentValue(endValue, years, rate, payment)
      if (!Number.isFinite(computedStart)) {
        return null
      }
      return formatCurrency(computedStart)
    }
    case 'interest-years': {
      if (
        startValue === null ||
        endValue === null ||
        rate === null ||
        payment === null ||
        startValue < 0 ||
        endValue < 0 ||
        rate <= -100
      ) {
        return null
      }
      const computedYears = solveYears(startValue, endValue, rate, payment)
      if (computedYears === null) {
        return null
      }
      return `${computedYears.toLocaleString('de-DE', { maximumFractionDigits: 2 })} Jahre`
    }
    case 'interest-rate': {
      if (
        startValue === null ||
        endValue === null ||
        years === null ||
        payment === null ||
        startValue < 0 ||
        endValue < 0 ||
        years <= 0
      ) {
        return null
      }
      const computedRate = solveAnnualRate(startValue, endValue, years, payment)
      if (computedRate === null || !Number.isFinite(computedRate)) {
        return null
      }
      return formatPercent(computedRate)
    }
    case 'interest-payment': {
      if (
        startValue === null ||
        endValue === null ||
        years === null ||
        rate === null ||
        startValue < 0 ||
        endValue < 0 ||
        years < 0 ||
        rate <= -100
      ) {
        return null
      }
      const computedPayment = solveMonthlyPayment(startValue, endValue, years, rate)
      if (!Number.isFinite(computedPayment)) {
        return null
      }
      return `${formatCurrency(computedPayment)} / Monat`
    }
  }
}

function getInterestFieldLabel(field: InterestFieldId): string {
  switch (field) {
    case 'interest-start':
      return 'Anfangswert berechnet'
    case 'interest-years':
      return 'Laufzeit berechnet'
    case 'interest-rate':
      return 'Zins berechnet'
    case 'interest-payment':
      return 'Rate berechnet'
    case 'interest-end':
      return 'Endwert berechnet'
  }
}

function calculateFutureValue(startValue: number, years: number, annualRatePercent: number, monthlyPayment: number): number {
  const months = years * MONTHS_PER_YEAR
  const monthlyRate = annualRatePercent / 100 / MONTHS_PER_YEAR

  if (months === 0) {
    return startValue
  }

  if (monthlyRate === 0) {
    return startValue + monthlyPayment * months
  }

  const growthFactor = (1 + monthlyRate) ** months
  const contributionFactor = (growthFactor - 1) / monthlyRate
  return startValue * growthFactor + monthlyPayment * contributionFactor
}

function calculatePresentValue(endValue: number, years: number, annualRatePercent: number, monthlyPayment: number): number {
  const months = years * MONTHS_PER_YEAR
  const monthlyRate = annualRatePercent / 100 / MONTHS_PER_YEAR

  if (months === 0) {
    return endValue
  }

  if (monthlyRate === 0) {
    return endValue - monthlyPayment * months
  }

  const growthFactor = (1 + monthlyRate) ** months
  const contributionFactor = (growthFactor - 1) / monthlyRate
  return (endValue - monthlyPayment * contributionFactor) / growthFactor
}


function solveYears(startValue: number, endValue: number, annualRatePercent: number, monthlyPayment: number): number | null {
  const startDifference = calculateFutureValue(startValue, 0, annualRatePercent, monthlyPayment) - endValue
  if (Math.abs(startDifference) < 0.000001) {
    return 0
  }

  let low = 0
  let high = 1
  let lowDifference = startDifference
  let highDifference = calculateFutureValue(startValue, high, annualRatePercent, monthlyPayment) - endValue

  while (Math.sign(lowDifference) === Math.sign(highDifference) && high < 500) {
    low = high
    lowDifference = highDifference
    high *= 2
    highDifference = calculateFutureValue(startValue, high, annualRatePercent, monthlyPayment) - endValue
  }

  if (Math.sign(lowDifference) === Math.sign(highDifference)) {
    return null
  }

  for (let index = 0; index < 80; index += 1) {
    const mid = (low + high) / 2
    const midDifference = calculateFutureValue(startValue, mid, annualRatePercent, monthlyPayment) - endValue
    if (Math.sign(lowDifference) === Math.sign(midDifference)) {
      low = mid
      lowDifference = midDifference
    } else {
      high = mid
      highDifference = midDifference
    }
  }

  return (low + high) / 2
}

function solveAnnualRate(startValue: number, endValue: number, years: number, monthlyPayment: number): number | null {
  let low = -99.9
  let high = 100
  let lowDifference = calculateFutureValue(startValue, years, low, monthlyPayment) - endValue
  let highDifference = calculateFutureValue(startValue, years, high, monthlyPayment) - endValue

  if (Math.abs(lowDifference) < 0.000001) {
    return low
  }

  if (Math.abs(highDifference) < 0.000001) {
    return high
  }

  if (Math.sign(lowDifference) === Math.sign(highDifference)) {
    return null
  }

  for (let index = 0; index < 120; index += 1) {
    const mid = (low + high) / 2
    const midDifference = calculateFutureValue(startValue, years, mid, monthlyPayment) - endValue
    if (Math.sign(lowDifference) === Math.sign(midDifference)) {
      low = mid
      lowDifference = midDifference
    } else {
      high = mid
      highDifference = midDifference
    }
  }

  return (low + high) / 2
}

function readOptionalNumber(id: string): number | null {
  const input = getElement<HTMLInputElement>(id)
  if (input.value.trim() === '') {
    return null
  }

  const value = Number(parseLocalizedNumber(input.value))
  return Number.isFinite(value) ? value : null
}

function getMissingInterestField(entries: Array<[InterestFieldId, number | null]>): InterestFieldId | null {
  const missing = entries.filter(([, value]) => value === null)
  if (missing.length !== 1) {
    return null
  }

  return missing[0][0]
}

function formatOptionalCurrency(value: number | null, fallback: string): string {
  return value === null ? fallback : formatCurrency(value)
}

function formatOptionalMonthlyCurrency(value: number | null, fallback: string): string {
  return value === null ? fallback : `${formatCurrency(value)} / Monat`
}

function formatOptionalNumber(value: number | null, fallback: string): string {
  return value === null ? fallback : value.toLocaleString('de-DE', { maximumFractionDigits: 2 })
}

function renderPrintHtml(documentData: PrintDocument): string {
  const printedAt = new Date().toLocaleDateString('de-DE')

  return `
    <!doctype html>
    <html lang="de">
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(documentData.title)}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 11mm;
          }

          @page :first {
            size: A4 portrait;
            margin: 13mm;
          }

          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            color: #1d2f2a;
            background: #ffffff;
            font-family: "Segoe UI", Arial, sans-serif;
            font-size: 10.5pt;
            line-height: 1.45;
          }

          .print-shell {
            display: grid;
            gap: 16px;
          }

          .print-header {
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 24px;
            padding-bottom: 12px;
            border-bottom: 2px solid #164734;
          }

          .eyebrow {
            margin: 0 0 4px;
            color: #2f7a56;
            font-size: 8.5pt;
            font-weight: 800;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }

          h1,
          h2,
          h3,
          p {
            margin-top: 0;
          }

          h1 {
            margin-bottom: 6px;
            font-size: 24pt;
            line-height: 1.05;
          }

          h2 {
            margin-bottom: 8px;
            font-size: 14pt;
          }

          .print-date {
            color: #6f7f78;
            font-weight: 700;
            text-align: right;
            white-space: nowrap;
          }

          .intro {
            max-width: 165mm;
            margin-bottom: 0;
            color: #4f625a;
          }

          .grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
          }

          .metric-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }

          .box {
            break-inside: avoid;
            padding: 10px 12px;
            border: 1px solid #d9cab8;
            border-radius: 8px;
            background: #fffdf8;
          }

          .box span {
            display: block;
            margin-bottom: 4px;
            color: #6f7f78;
            font-size: 8.5pt;
            font-weight: 700;
          }

          .box strong {
            display: block;
            color: #1d2f2a;
            font-size: 12pt;
          }

          .section {
            break-inside: avoid;
          }

          .matrix-print-section {
            break-before: page;
            page-break-before: always;
          }

          .chart-print {
            padding: 8px;
            border: 1px solid #d9cab8;
            border-radius: 8px;
            background: #f7f2ea;
          }

          .chart-print svg {
            display: block;
            width: 100%;
            height: auto;
            max-height: 92mm;
          }

          .grid-line {
            stroke: rgb(29 47 42 / 10%);
            stroke-width: 1;
          }

          .zero-line {
            stroke: rgb(29 47 42 / 34%);
            stroke-width: 1.6;
          }

          .axis-label,
          .axis-title {
            fill: #6f7f78;
            font-size: 13px;
            font-weight: 700;
          }

          .axis-title {
            fill: #1d2f2a;
            font-size: 14px;
          }

          .svg-legend-label {
            fill: #1d2f2a;
            font-size: 15px;
            font-weight: 800;
          }

          .line {
            fill: none;
            stroke-width: 4;
            stroke-linecap: round;
            stroke-linejoin: round;
          }

          .dot {
            stroke: #fff;
            stroke-width: 2;
          }

          .dot-insurance {
            fill: #2f7a56;
          }

          .dot-depot {
            fill: #c88625;
          }

          .dot-cash {
            fill: #3b5ccc;
          }

          .legend {
            display: flex;
            flex-wrap: wrap;
            gap: 10px 24px;
            margin-top: 12px;
            padding: 0 8px;
            color: #1d2f2a;
            font-size: 11pt;
            font-weight: 800;
          }

          .legend span {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            min-height: 22px;
            white-space: nowrap;
          }

          .legend i {
            flex: 0 0 auto;
            display: block;
            width: 42px;
            height: 0;
            border-top: 5px solid #1d2f2a;
            background: transparent !important;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          .legend-insurance {
            border-top-color: #2f7a56;
          }

          .legend-depot {
            border-top-color: #c88625;
          }

          .legend-cash {
            border-top-color: #3b5ccc;
          }

          .legend-rate-annuity,
          .legend-capital-annuity {
            border-top-color: #3b5ccc;
          }

          .legend-rate-bullet,
          .legend-capital-bullet {
            border-top-color: #d08a1b;
          }

          .legend-tax-benefit {
            border-top-color: #8fd19e;
            border-top-style: dashed;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
            font-size: 8.8pt;
          }

          th,
          td {
            padding: 7px 6px;
            border-bottom: 1px solid #e3ded6;
            text-align: right;
            vertical-align: top;
            overflow-wrap: anywhere;
          }

          th:first-child,
          td:first-child {
            text-align: left;
          }

          th {
            color: #4f625a;
            font-size: 7.3pt;
            text-transform: uppercase;
            letter-spacing: 0.03em;
          }

          td {
            font-weight: 700;
          }

          .matrix-print-section table {
            table-layout: fixed;
            font-size: 7.8pt;
          }

          .matrix-print-section th {
            font-size: 6.1pt;
            line-height: 1.12;
            letter-spacing: 0.02em;
          }

          .matrix-print-section th,
          .matrix-print-section td {
            padding: 6px 3px;
            line-height: 1.2;
          }

          .matrix-print-section h2 {
            margin-bottom: 6px;
            font-size: 12pt;
          }

          .matrix-print-section th:nth-child(1) {
            width: 4%;
          }

          .matrix-print-section th:nth-child(2),
          .matrix-print-section th:nth-child(3) {
            width: 11%;
          }

          .matrix-print-section th:nth-child(4) {
            width: 14%;
          }

          .matrix-print-section th:nth-child(7) {
            width: 12%;
          }

          .matrix-print-section th:nth-child(5),
          .matrix-print-section th:nth-child(6) {
            width: 14%;
          }

          .matrix-print-section th:nth-child(8) {
            width: 20%;
          }

          .matrix-print-section .amount-lines {
            gap: 2px;
          }

          .matrix-print-section .amount-lines b {
            font-size: 6.1pt;
          }

          .amount-lines {
            display: grid;
            gap: 2px;
            line-height: 1.2;
          }

          .amount-lines span {
            display: block;
          }

          .amount-lines b {
            color: #6f7f78;
            font-size: 7.2pt;
            text-transform: uppercase;
          }

          .positive,
          .surplus-value {
            color: #1f7a4d;
          }

          .negative {
            color: #a3482f;
          }

          .debt-value {
            color: #1d2f2a;
          }

          .note {
            margin: 0;
            padding-top: 8px;
            color: #6f7f78;
            font-size: 8.8pt;
            border-top: 1px solid #e3ded6;
          }

          .print-action {
            position: fixed;
            right: 16px;
            bottom: 16px;
            min-height: 44px;
            border: 0;
            border-radius: 8px;
            padding: 10px 18px;
            color: #fff;
            background: #164734;
            font-weight: 800;
            box-shadow: 0 4px 12px rgb(0 0 0 / 18%);
          }

          @media print {
            .print-action {
              display: none;
            }

            .matrix-print-section {
              break-before: page;
              page-break-before: always;
            }
          }
        </style>
      </head>
      <body>
        <main class="print-shell">
          <header class="print-header">
            <div>
              <p class="eyebrow">${escapeHtml(documentData.eyebrow)}</p>
              <h1>${escapeHtml(documentData.title)}</h1>
              <p class="intro">${escapeHtml(documentData.description)}</p>
            </div>
            <div class="print-date">Stand ${escapeHtml(printedAt)}</div>
          </header>

          <section class="section">
            <h2>Eingabeparameter</h2>
            <div class="grid">
              ${documentData.parameters.map(renderPrintItem).join('')}
            </div>
          </section>

          <section class="section">
            <h2>Ergebnisse</h2>
            <div class="grid metric-grid">
              ${documentData.metrics.map(renderPrintItem).join('')}
            </div>
          </section>

          ${documentData.chartHtml ? `
            <section class="section">
              <h2>Diagramm</h2>
              <div class="chart-print">${documentData.chartHtml}</div>
              ${documentData.legendHtml ? `<div class="legend">${documentData.legendHtml}</div>` : ''}
            </section>
          ` : ''}

          ${documentData.tableHeadHtml && documentData.tableBodyHtml ? `
            <section class="section matrix-print-section">
              <h2>${escapeHtml(documentData.tableTitle ?? 'Tabelle')}</h2>
              <table>
                <thead>${documentData.tableHeadHtml}</thead>
                <tbody>${documentData.tableBodyHtml}</tbody>
              </table>
            </section>
          ` : ''}

          ${documentData.note ? `<p class="note">${escapeHtml(documentData.note)}</p>` : ''}
        </main>
        <button class="print-action" type="button" onclick="window.print()">PDF drucken</button>
      </body>
    </html>
  `
}

function renderPrintItem(item: PrintItem): string {
  return `
    <article class="box">
      <span>${escapeHtml(item.label)}</span>
      <strong>${escapeHtml(item.value)}</strong>
    </article>
  `
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
