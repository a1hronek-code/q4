"use client";

import { useMemo, useState } from "react";
import {
  CURRENT_PENSION_VALUE_2026,
  estimatePension,
  money,
  positiveNumber,
} from "../../lib/calculators";

export function Calculator() {
  const [personalWagePoint, setPersonalWagePoint] = useState(1);
  const [insuranceYears, setInsuranceYears] = useState(40);

  const result = useMemo(
    () => estimatePension(personalWagePoint, insuranceYears),
    [insuranceYears, personalWagePoint],
  );

  return (
    <div className="tool-card calculator-form-card">
      <span className="tool-kicker">Starobný dôchodok</span>
      <h3>Zjednodušený odhad dôchodku</h3>
      <p className="tool-description">
        Kalkulačka používa aktuálnu dôchodkovú hodnotu pre rok 2026 a zjednodušený vzorec
        bez ďalších zákonných špecifík.
      </p>

      <div className="tool-row">
        <label>
          Osobný mzdový bod
          <input
            type="number"
            min="0"
            step="0.01"
            value={personalWagePoint}
            onChange={(event) => setPersonalWagePoint(positiveNumber(event.target.value))}
          />
        </label>

        <label>
          Počet rokov dôchodkového poistenia
          <input
            type="number"
            min="0"
            step="1"
            value={insuranceYears}
            onChange={(event) => setInsuranceYears(positiveNumber(event.target.value))}
          />
        </label>
      </div>

      <div className="result-box" aria-live="polite">
        <strong>{money(result.monthlyPension)}</strong>
        <span>Orientačný mesačný dôchodok</span>
      </div>

      <dl className="tool-breakdown">
        <div>
          <dt>Použitá aktuálna dôchodková hodnota</dt>
          <dd>{money(CURRENT_PENSION_VALUE_2026)}</dd>
        </div>
        <div>
          <dt>Osobný mzdový bod</dt>
          <dd>{personalWagePoint.toFixed(2)}</dd>
        </div>
        <div>
          <dt>Roky poistenia</dt>
          <dd>{insuranceYears} rokov</dd>
        </div>
      </dl>

      <p className="tool-hint">
        Osobný mzdový bod sa zvyčajne pohybuje približne medzi 0,2 a 3 a tento model je
        iba zjednodušený. Ide o orientačný prepočet, nie záväzný výpočet Sociálnej
        poisťovne.
      </p>
    </div>
  );
}
