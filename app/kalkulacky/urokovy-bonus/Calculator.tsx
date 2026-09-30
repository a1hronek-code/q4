"use client";

import { useMemo, useState } from "react";
import {
  calculateMortgageInterestBonus,
  MORTGAGE_BONUS_INCOME_LIMITS,
  money,
  positiveNumber,
} from "../../lib/calculators";

const wholeNumber = (value: number) => Math.floor(Math.max(0, value));

export function Calculator() {
  const [contractYear, setContractYear] = useState<"2024" | "2025" | "2026">("2026");
  const [age, setAge] = useState(30);
  const [hasCoBorrower, setHasCoBorrower] = useState(false);
  const [coBorrowerAge, setCoBorrowerAge] = useState(30);
  const [monthlyIncome, setMonthlyIncome] = useState(1_400);
  const [coBorrowerIncome, setCoBorrowerIncome] = useState(1_000);
  const [interestPaid, setInterestPaid] = useState(1_500);
  const [eligibleMonths, setEligibleMonths] = useState(12);

  const result = useMemo(
    () =>
      calculateMortgageInterestBonus({
        contractYear,
        age,
        hasCoBorrower,
        coBorrowerAge,
        monthlyIncome,
        coBorrowerIncome,
        interestPaid,
        eligibleMonths,
      }),
    [
      age,
      coBorrowerAge,
      coBorrowerIncome,
      contractYear,
      eligibleMonths,
      hasCoBorrower,
      interestPaid,
      monthlyIncome,
    ],
  );

  const combinedIncome = monthlyIncome + (hasCoBorrower ? coBorrowerIncome : 0);
  const combinedLimit = result.maxIncome * (hasCoBorrower ? 2 : 1);

  return (
    <div className="tool-card calculator-form-card">
      <span className="tool-kicker">Daňové zvýhodnenie</span>
      <h3>Bonus na zaplatené úroky</h3>
      <p className="tool-description">
        Orientačný výpočet preverí vek, príjmový limit a zaplatené úroky podľa roka
        uzatvorenia zmluvy.
      </p>

      <div className="tool-row">
        <label>
          Rok uzatvorenia zmluvy
          <select
            value={contractYear}
            onChange={(event) => setContractYear(event.target.value as "2024" | "2025" | "2026")}
          >
            {Object.keys(MORTGAGE_BONUS_INCOME_LIMITS).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>

        <label>
          Vek žiadateľa
          <input
            type="number"
            min="0"
            step="1"
            value={age}
            onChange={(event) => setAge(wholeNumber(positiveNumber(event.target.value)))}
          />
        </label>
      </div>

      <label className="tool-checkbox">
        <input
          type="checkbox"
          checked={hasCoBorrower}
          onChange={(event) => setHasCoBorrower(event.target.checked)}
        />
        <span>Mám spoludlžníka</span>
      </label>

      <label>
        Mesačný príjem žiadateľa
        <input
          type="number"
          min="0"
          step="0.01"
          value={monthlyIncome}
          onChange={(event) => setMonthlyIncome(positiveNumber(event.target.value))}
        />
      </label>

      {hasCoBorrower ? (
        <div className="tool-row">
          <label>
            Vek spoludlžníka
            <input
              type="number"
              min="0"
              step="1"
              value={coBorrowerAge}
              onChange={(event) => setCoBorrowerAge(wholeNumber(positiveNumber(event.target.value)))}
            />
          </label>

          <label>
            Mesačný príjem spoludlžníka
            <input
              type="number"
              min="0"
              step="0.01"
              value={coBorrowerIncome}
              onChange={(event) => setCoBorrowerIncome(positiveNumber(event.target.value))}
            />
          </label>
        </div>
      ) : null}

      <div className="tool-row">
        <label>
          Zaplatené úroky za rok
          <input
            type="number"
            min="0"
            step="0.01"
            value={interestPaid}
            onChange={(event) => setInterestPaid(positiveNumber(event.target.value))}
          />
        </label>

        <label>
          Počet mesiacov s nárokom
          <input
            type="number"
            min="1"
            max="12"
            step="1"
            value={eligibleMonths}
            onChange={(event) =>
              setEligibleMonths(Math.min(12, Math.max(1, wholeNumber(positiveNumber(event.target.value)))))
            }
          />
        </label>
      </div>

      <div className="result-box" aria-live="polite">
        <strong>{money(result.bonus)}</strong>
        <span>Orientačný ročný bonus na zaplatené úroky</span>
        <p
          style={{
            margin: "12px 0 0",
            color: result.isEligible ? "#166534" : "#b91c1c",
            fontSize: "0.86rem",
            fontWeight: 700,
          }}
        >
          {result.isEligible ? "Spĺňate základné podmienky nároku." : "Základné podmienky nároku zatiaľ nespĺňate."}
        </p>
      </div>

      <dl className="tool-breakdown">
        <div>
          <dt>Limit príjmu na žiadateľa</dt>
          <dd>{money(result.maxIncome)}</dd>
        </div>
        <div>
          <dt>Kombinovaný limit pre vašu situáciu</dt>
          <dd>{money(combinedLimit)}</dd>
        </div>
        <div>
          <dt>Posudzovaný spoločný príjem</dt>
          <dd>{money(combinedIncome)}</dd>
        </div>
      </dl>

      <p className="tool-hint">
        Ide o orientačný prepočet, nie záväzný výpočet Finančnej správy.
      </p>
    </div>
  );
}
