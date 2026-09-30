"use client";

import { useMemo, useState } from "react";
import {
  calculateVacationEntitlement,
  positiveNumber,
} from "../../lib/calculators";

export function Calculator() {
  const [age, setAge] = useState(30);
  const [caresForChild, setCaresForChild] = useState(false);
  const [monthsWorked, setMonthsWorked] = useState(12);

  const result = useMemo(
    () => calculateVacationEntitlement(age, caresForChild, monthsWorked),
    [age, caresForChild, monthsWorked],
  );

  return (
    <div className="tool-card calculator-form-card">
      <span className="tool-kicker">Pracovnoprávny nárok</span>
      <h3>Dovolenka za rok</h3>
      <p className="tool-description">
        Odhad ročného aj pomerného nároku na dovolenku podľa veku, starostlivosti o dieťa
        a počtu odpracovaných mesiacov.
      </p>

      <div className="tool-row">
        <label>
          Vek
          <input
            type="number"
            min="0"
            step="1"
            value={age}
            onChange={(event) => setAge(positiveNumber(event.target.value))}
          />
        </label>

        <label>
          Počet odpracovaných mesiacov v roku
          <input
            type="number"
            min="1"
            max="12"
            step="1"
            value={monthsWorked}
            onChange={(event) =>
              setMonthsWorked(Math.min(12, Math.max(1, positiveNumber(event.target.value))))
            }
          />
        </label>
      </div>

      <label className="tool-checkbox">
        <input
          type="checkbox"
          checked={caresForChild}
          onChange={(event) => setCaresForChild(event.target.checked)}
        />
        <span>Trvalo sa starám o dieťa</span>
      </label>

      <div className="result-box" aria-live="polite">
        <strong>{result.proratedDays.toFixed(1)} dní</strong>
        <span>Pomerný nárok na dovolenku za zadané obdobie</span>
      </div>

      <dl className="tool-breakdown">
        <div>
          <dt>Ročný nárok</dt>
          <dd>{result.baseDays} dní</dd>
        </div>
        <div>
          <dt>Pomerný nárok</dt>
          <dd>{result.proratedDays.toFixed(1)} dní</dd>
        </div>
      </dl>

      <p className="tool-hint">
        Ide o orientačný prepočet, nie záväzný výpočet podľa Zákonníka práce.
      </p>
    </div>
  );
}
