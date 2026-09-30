"use client";

import { useMemo, useState } from "react";
import {
  calculateParentalAllowance,
  money,
  positiveNumber,
} from "../../lib/calculators";

const wholeNumber = (value: number) => Math.floor(Math.max(0, value));

export function Calculator() {
  const [receivedMaternityPay, setReceivedMaternityPay] = useState(true);
  const [hasMultipleChildren, setHasMultipleChildren] = useState(false);
  const [months, setMonths] = useState(12);

  const result = useMemo(
    () => calculateParentalAllowance(receivedMaternityPay, hasMultipleChildren, months),
    [hasMultipleChildren, months, receivedMaternityPay],
  );

  return (
    <div className="tool-card calculator-form-card">
      <span className="tool-kicker">Podpora rodiny</span>
      <h3>Odhad rodičovského príspevku</h3>
      <p className="tool-description">
        Výsledok zobrazuje orientačnú mesačnú aj celkovú sumu rodičovského príspevku
        podľa zvoleného obdobia poberania.
      </p>

      <div className="tool-grid">
        <label className="tool-checkbox">
          <input
            type="checkbox"
            checked={receivedMaternityPay}
            onChange={(event) => setReceivedMaternityPay(event.target.checked)}
          />
          <span>Poberali ste materské</span>
        </label>

        <label className="tool-checkbox">
          <input
            type="checkbox"
            checked={hasMultipleChildren}
            onChange={(event) => setHasMultipleChildren(event.target.checked)}
          />
          <span>Staráte sa o viac detí súčasne (napr. dvojičky)</span>
        </label>
      </div>

      <label>
        Počet mesiacov poberania
        <input
          type="number"
          min="0"
          step="1"
          value={months}
          onChange={(event) => setMonths(wholeNumber(positiveNumber(event.target.value)))}
        />
      </label>

      <div className="result-box" aria-live="polite">
        <strong>{money(result.monthlyAmount)}</strong>
        <span>Odhad mesačnej sumy rodičovského príspevku</span>
      </div>

      <dl className="tool-breakdown">
        <div>
          <dt>Mesačná suma</dt>
          <dd>{money(result.monthlyAmount)}</dd>
        </div>
        <div>
          <dt>Celková suma za obdobie</dt>
          <dd>{money(result.totalAmount)}</dd>
        </div>
      </dl>

      <p className="tool-hint">
        Ide o orientačný prepočet, nie záväzný výpočet Úradu práce, sociálnych vecí a
        rodiny SR.
      </p>
    </div>
  );
}
