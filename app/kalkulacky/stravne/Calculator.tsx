"use client";

import { useMemo, useState } from "react";
import { calculateTravelMealAllowance, money, positiveNumber } from "../../lib/calculators";

export function Calculator() {
  const [hours, setHours] = useState(10);

  const amount = useMemo(() => calculateTravelMealAllowance(hours), [hours]);

  return (
    <div className="tool-card calculator-form-card">
      <span className="tool-kicker">Pracovná cesta</span>
      <h3>Tuzemské stravné</h3>
      <p className="tool-description">
        Stravné sa prepočíta okamžite podľa dĺžky pracovnej cesty v hodinách.
      </p>

      <label>
        Počet hodín pracovnej cesty
        <input
          type="number"
          min="0"
          step="0.1"
          value={hours}
          onChange={(event) => setHours(positiveNumber(event.target.value))}
        />
      </label>

      <div className="result-box" aria-live="polite">
        <strong>{money(amount)}</strong>
        <span>Orientačná výška stravného</span>
      </div>

      <dl className="tool-breakdown">
        <div>
          <dt>5 – 12 hodín</dt>
          <dd>9,30 €</dd>
        </div>
        <div>
          <dt>12 – 18 hodín</dt>
          <dd>13,80 €</dd>
        </div>
        <div>
          <dt>Nad 18 hodín</dt>
          <dd>20,60 €</dd>
        </div>
      </dl>

      <p className="tool-hint">
        Ide o orientačný prepočet, nie záväzný výpočet podľa Zákonníka práce.
      </p>
    </div>
  );
}
