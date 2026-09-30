"use client";

import { useMemo, useState } from "react";
import { calculateMaternityPay, money, positiveNumber } from "../../lib/calculators";

export function Calculator() {
  const [grossMonthlyIncome, setGrossMonthlyIncome] = useState(1_500);
  const [weeks, setWeeks] = useState(34);

  const result = useMemo(
    () => calculateMaternityPay(grossMonthlyIncome, weeks),
    [grossMonthlyIncome, weeks],
  );

  return (
    <div className="tool-card calculator-form-card">
      <span className="tool-kicker">Dávka pri materstve</span>
      <h3>Odhad materského</h3>
      <p className="tool-description">
        Výpočet vychádza zo spoločného denného vymeriavacieho základu a orientačnej sumy
        za celé obdobie poberania.
      </p>

      <div className="tool-row">
        <label>
          Hrubý mesačný príjem
          <input
            type="number"
            min="0"
            step="0.01"
            value={grossMonthlyIncome}
            onChange={(event) => setGrossMonthlyIncome(positiveNumber(event.target.value))}
          />
        </label>

        <label>
          Počet týždňov poberania
          <input
            type="number"
            min="0"
            step="1"
            value={weeks}
            onChange={(event) => setWeeks(positiveNumber(event.target.value))}
          />
        </label>
      </div>

      <div className="result-box" aria-live="polite">
        <strong>{money(result.totalAmount)}</strong>
        <span>Orientačná suma materského za celé obdobie</span>
      </div>

      <dl className="tool-breakdown">
        <div>
          <dt>Denný vymeriavací základ (DVZ)</dt>
          <dd>{money(result.dailyAssessmentBase)}</dd>
        </div>
        <div>
          <dt>Denná suma dávky</dt>
          <dd>{money(result.dailyAmount)}</dd>
        </div>
        <div>
          <dt>Počet dní</dt>
          <dd>{result.totalDays} dní</dd>
        </div>
      </dl>

      <p className="tool-hint">
        Ide o orientačný prepočet, nie záväzný výpočet Sociálnej poisťovne.
      </p>
    </div>
  );
}
