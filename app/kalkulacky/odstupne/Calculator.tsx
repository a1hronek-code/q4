"use client";

import { useMemo, useState } from "react";
import {
  calculateSeverancePay,
  money,
  positiveNumber,
  type SeveranceMethod,
} from "../../lib/calculators";

export function Calculator() {
  const [averageMonthlyEarnings, setAverageMonthlyEarnings] = useState(1_500);
  const [yearsOfEmployment, setYearsOfEmployment] = useState(7);
  const [method, setMethod] = useState<SeveranceMethod>("vypoved");

  const result = useMemo(
    () => calculateSeverancePay(averageMonthlyEarnings, yearsOfEmployment, method),
    [averageMonthlyEarnings, method, yearsOfEmployment],
  );

  return (
    <div className="tool-card calculator-form-card">
      <span className="tool-kicker">Skončenie pracovného pomeru</span>
      <h3>Odhad odstupného</h3>
      <p className="tool-description">
        Nárok závisí od spôsobu skončenia pracovného pomeru a od rokov odpracovaných u
        toho istého zamestnávateľa.
      </p>

      <div className="tool-row">
        <label>
          Priemerný mesačný zárobok
          <input
            type="number"
            min="0"
            step="0.01"
            value={averageMonthlyEarnings}
            onChange={(event) => setAverageMonthlyEarnings(positiveNumber(event.target.value))}
          />
        </label>

        <label>
          Roky odpracované u zamestnávateľa
          <input
            type="number"
            min="0"
            step="1"
            value={yearsOfEmployment}
            onChange={(event) => setYearsOfEmployment(positiveNumber(event.target.value))}
          />
        </label>
      </div>

      <label>
        Spôsob skončenia pracovného pomeru
        <select
          value={method}
          onChange={(event) => setMethod(event.target.value as SeveranceMethod)}
        >
          <option value="vypoved">Výpoveď z organizačných dôvodov</option>
          <option value="dohoda">Dohoda z organizačných dôvodov</option>
        </select>
      </label>

      <div className="result-box" aria-live="polite">
        <strong>{money(result.amount)}</strong>
        <span>
          {result.multiplier > 0
            ? `${result.multiplier}× priemerný mesačný zárobok`
            : "Pri tejto kombinácii rokov a spôsobu nárok nevzniká"}
        </span>
      </div>

      <dl className="tool-breakdown">
        <div>
          <dt>Násobok mzdy</dt>
          <dd>{result.multiplier}×</dd>
        </div>
        <div>
          <dt>Odhad sumy</dt>
          <dd>{money(result.amount)}</dd>
        </div>
      </dl>

      <p className="tool-hint">
        Ide o orientačný prepočet, nie záväzný výpočet podľa Zákonníka práce a interných
        podkladov zamestnávateľa.
      </p>
    </div>
  );
}
