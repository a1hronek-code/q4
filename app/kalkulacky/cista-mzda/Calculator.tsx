"use client";

import { useMemo, useState } from "react";
import { calculateNetSalary, money, positiveNumber } from "../../lib/calculators";

const wholeNumber = (value: number) => Math.floor(Math.max(0, value));

export function Calculator() {
  const [grossMonthlySalary, setGrossMonthlySalary] = useState(1_500);
  const [hasPersonalAllowance, setHasPersonalAllowance] = useState(true);
  const [hasDisability, setHasDisability] = useState(false);
  const [childrenUnder15, setChildrenUnder15] = useState(0);
  const [children15To17, setChildren15To17] = useState(0);

  const result = useMemo(
    () =>
      calculateNetSalary({
        grossMonthlySalary,
        hasPersonalAllowance,
        hasDisability,
        childrenUnder15,
        children15To17,
      }),
    [
      children15To17,
      childrenUnder15,
      grossMonthlySalary,
      hasDisability,
      hasPersonalAllowance,
    ],
  );

  return (
    <div className="tool-card calculator-form-card">
      <span className="tool-kicker">Mesačný prepočet</span>
      <h3>Odhad čistej výplaty</h3>
      <p className="tool-description">
        Zadajte hrubú mzdu a základné údaje pre orientačný prepočet výplaty vrátane
        odvodov a daňového bonusu na deti.
      </p>

      <label>
        Hrubá mesačná mzda
        <input
          type="number"
          min="0"
          step="0.01"
          value={grossMonthlySalary}
          onChange={(event) => setGrossMonthlySalary(positiveNumber(event.target.value))}
        />
      </label>

      <div className="tool-grid">
        <label className="tool-checkbox">
          <input
            type="checkbox"
            checked={hasPersonalAllowance}
            onChange={(event) => setHasPersonalAllowance(event.target.checked)}
          />
          <span>Uplatňujem nezdaniteľnú časť základu dane</span>
        </label>

        <label className="tool-checkbox">
          <input
            type="checkbox"
            checked={hasDisability}
            onChange={(event) => setHasDisability(event.target.checked)}
          />
          <span>Som osoba so zdravotným postihnutím (ZŤP)</span>
        </label>
      </div>

      <div className="tool-row">
        <label>
          Počet detí do 15 rokov
          <input
            type="number"
            min="0"
            step="1"
            value={childrenUnder15}
            onChange={(event) => setChildrenUnder15(wholeNumber(positiveNumber(event.target.value)))}
          />
        </label>

        <label>
          Počet starších detí s nárokom na bonus (15–25 rokov)
          <input
            type="number"
            min="0"
            step="1"
            value={children15To17}
            onChange={(event) => setChildren15To17(wholeNumber(positiveNumber(event.target.value)))}
          />
        </label>
      </div>

      <div className="result-box" aria-live="polite">
        <strong>{money(result.netCash)}</strong>
        <span>Odhad čistej mesačnej mzdy</span>
      </div>

      <dl className="tool-breakdown">
        <div>
          <dt>Sociálne poistenie</dt>
          <dd>{money(result.socialInsurance)}</dd>
        </div>
        <div>
          <dt>Zdravotné poistenie</dt>
          <dd>{money(result.healthInsurance)}</dd>
        </div>
        <div>
          <dt>Daň po bonuse</dt>
          <dd>{money(result.taxAfterBonus)}</dd>
        </div>
        <div>
          <dt>Daňový bonus na deti</dt>
          <dd>{money(result.childBonus)}</dd>
        </div>
      </dl>

      <p className="tool-hint">
        Ide o orientačný prepočet, nie záväzný výpočet mzdovej účtárne, Sociálnej
        poisťovne ani zdravotnej poisťovne.
      </p>
    </div>
  );
}
