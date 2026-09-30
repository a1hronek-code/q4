"use client";

import { useMemo, useState } from "react";
import { calculateMortgagePayment, money, positiveNumber } from "../../lib/calculators";

export function Calculator() {
  const [principal, setPrincipal] = useState(150_000);
  const [annualRatePercent, setAnnualRatePercent] = useState(4.1);
  const [years, setYears] = useState(30);

  const result = useMemo(
    () => calculateMortgagePayment(principal, annualRatePercent, years),
    [annualRatePercent, principal, years],
  );

  return (
    <div className="tool-card calculator-form-card">
      <span className="tool-kicker">Mesačná splátka</span>
      <h3>Hypotéka pod kontrolou</h3>
      <p className="tool-description">
        Rýchly odhad mesačnej splátky, celkovej zaplatenej sumy a celkových úrokov pri
        anuitnom splácaní hypotéky.
      </p>

      <div className="tool-row">
        <label>
          Výška úveru
          <input
            type="number"
            min="0"
            step="100"
            value={principal}
            onChange={(event) => setPrincipal(positiveNumber(event.target.value))}
          />
        </label>

        <label>
          Úroková sadzba %
          <input
            type="number"
            min="0"
            step="0.01"
            value={annualRatePercent}
            onChange={(event) => setAnnualRatePercent(positiveNumber(event.target.value))}
          />
        </label>
      </div>

      <label>
        Doba splácania v rokoch
        <input
          type="number"
          min="0"
          step="1"
          value={years}
          onChange={(event) => setYears(positiveNumber(event.target.value))}
        />
      </label>

      <div className="result-box" aria-live="polite">
        <strong>{money(result.monthlyPayment)}</strong>
        <span>Odhad mesačnej splátky hypotéky</span>
      </div>

      <dl className="tool-breakdown">
        <div>
          <dt>Celkom zaplatíte</dt>
          <dd>{money(result.totalPaid)}</dd>
        </div>
        <div>
          <dt>Z toho úroky</dt>
          <dd>{money(result.totalInterest)}</dd>
        </div>
        <div>
          <dt>Počet splátok</dt>
          <dd>{result.months} mesiacov</dd>
        </div>
      </dl>

      <p className="tool-hint">
        Ide o orientačný prepočet, nie záväzný splátkový kalendár banky alebo veriteľa.
      </p>
    </div>
  );
}
