"use client";

import { useMemo, useState } from "react";
import { calculateSickPay, money, positiveNumber } from "../../lib/calculators";

const wholeNumber = (value: number) => Math.floor(Math.max(0, value));

export function Calculator() {
  const [grossMonthlyIncome, setGrossMonthlyIncome] = useState(1_400);
  const [sickDays, setSickDays] = useState(14);

  const result = useMemo(
    () => calculateSickPay(grossMonthlyIncome, sickDays),
    [grossMonthlyIncome, sickDays],
  );

  return (
    <div className="tool-card calculator-form-card">
      <span className="tool-kicker">Dávka pri PN</span>
      <h3>Orientačné nemocenské</h3>
      <p className="tool-description">
        Prepočet rozlišuje náhradu príjmu od zamestnávateľa a nemocenské od Sociálnej
        poisťovne podľa počtu dní PN.
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
          Počet dní PN
          <input
            type="number"
            min="0"
            step="1"
            value={sickDays}
            onChange={(event) => setSickDays(wholeNumber(positiveNumber(event.target.value)))}
          />
        </label>
      </div>

      <div className="result-box" aria-live="polite">
        <strong>{money(result.totalAmount)}</strong>
        <span>Odhad celkovej sumy nemocenského</span>
      </div>

      <dl className="tool-breakdown">
        <div>
          <dt>Denný vymeriavací základ (DVZ)</dt>
          <dd>{money(result.dailyAssessmentBase)}</dd>
        </div>
        <div>
          <dt>Suma od zamestnávateľa</dt>
          <dd>{money(result.employerAmount)}</dd>
        </div>
        <div>
          <dt>Suma od Sociálnej poisťovne</dt>
          <dd>{money(result.socialInsuranceAmount)}</dd>
        </div>
      </dl>

      <p className="tool-hint">
        Ide o orientačný prepočet, nie záväzný výpočet Sociálnej poisťovne.
      </p>
    </div>
  );
}
