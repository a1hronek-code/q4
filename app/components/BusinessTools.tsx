"use client";

import { useState } from "react";

const SOCIAL_RATE = 0.094;
const SOCIAL_MAX_BASE = 16_764;
const INCOME_TAX_BANDS = [
  { limit: 3_665.28, rate: 0.19 },
  { limit: 5_029.1, rate: 0.25 },
  { limit: 6_250.86, rate: 0.3 },
  { limit: Number.POSITIVE_INFINITY, rate: 0.35 },
];
const TAX_BONUS_REDUCTION_THRESHOLD = 27_432;
const MORTGAGE_INCOME_LIMITS: Record<string, number> = {
  "2024": 2_288,
  "2025": 2_438.4,
  "2026": 2_592,
};

const holidays2026 = [
  { date: "2026-01-01", name: "Deň vzniku Slovenskej republiky" },
  { date: "2026-01-06", name: "Zjavenie Pána (Traja králi)" },
  { date: "2026-04-03", name: "Veľký piatok" },
  { date: "2026-04-06", name: "Veľkonočný pondelok" },
  { date: "2026-05-01", name: "Sviatok práce" },
  { date: "2026-12-24", name: "Štedrý deň" },
  { date: "2026-12-25", name: "Prvý sviatok vianočný" },
];

const money = (value: number) =>
  new Intl.NumberFormat("sk-SK", {
    style: "currency",
    currency: "EUR",
  }).format(value);

const positiveNumber = (value: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(parsed, 0) : 0;
};

function progressiveTax(monthlyTaxBase: number) {
  let remaining = monthlyTaxBase;
  let lowerLimit = 0;
  let tax = 0;

  for (const band of INCOME_TAX_BANDS) {
    const taxableInBand = Math.max(0, Math.min(remaining, band.limit - lowerLimit));
    tax += taxableInBand * band.rate;
    remaining -= taxableInBand;
    lowerLimit = band.limit;
    if (remaining <= 0) break;
  }

  return tax;
}

function yearAllowance(annualTaxBase: number) {
  if (annualTaxBase <= 26_083.13) return 5_966.73;
  return Math.max(0, 14_661.11 - annualTaxBase / 3);
}

function childBonusRate(children: number) {
  if (children <= 0) return 0;
  if (children === 1) return 0.29;
  if (children === 2) return 0.36;
  if (children === 3) return 0.43;
  if (children === 4) return 0.5;
  if (children === 5) return 0.57;
  return 0.64;
}

export function BusinessTools() {
  const [grossSalary, setGrossSalary] = useState("1800");
  const [hasPersonalAllowance, setHasPersonalAllowance] = useState(true);
  const [hasDisability, setHasDisability] = useState(false);
  const [childrenUnder15, setChildrenUnder15] = useState("0");
  const [children15To17, setChildren15To17] = useState("0");
  const [carPrice, setCarPrice] = useState("0");
  const [carYear, setCarYear] = useState("2026");
  const [isGroupZero, setIsGroupZero] = useState(false);

  const [mortgageYear, setMortgageYear] = useState("2026");
  const [mortgageAge, setMortgageAge] = useState("30");
  const [mortgageIncome, setMortgageIncome] = useState("1800");
  const [hasCoBorrower, setHasCoBorrower] = useState(false);
  const [coBorrowerAge, setCoBorrowerAge] = useState("30");
  const [coBorrowerIncome, setCoBorrowerIncome] = useState("0");
  const [interestPaid, setInterestPaid] = useState("1200");
  const [eligibleMonths, setEligibleMonths] = useState("12");

  const [tripHours, setTripHours] = useState("8");

  const gross = positiveNumber(grossSalary);
  const inputPrice = positiveNumber(carPrice);
  const yearsInUse = 2026 - Number(carYear) + 1;
  const carBenefit =
    yearsInUse >= 1 && yearsInUse <= 8
      ? (inputPrice * Math.max(0, 1 - (yearsInUse - 1) * 0.125) * (isGroupZero ? 0.005 : 0.01))
      : 0;
  const assessableMonthlyIncome = gross + carBenefit;
  const social = Math.min(assessableMonthlyIncome, SOCIAL_MAX_BASE) * SOCIAL_RATE;
  const health = assessableMonthlyIncome * (hasDisability ? 0.025 : 0.05);
  const annualTaxBase = Math.max(0, (assessableMonthlyIncome - social - health) * 12);
  const annualAllowance = hasPersonalAllowance ? yearAllowance(annualTaxBase) : 0;
  const monthlyTaxBase = Math.max(0, (annualTaxBase - annualAllowance) / 12);
  const taxBeforeBonus = progressiveTax(monthlyTaxBase);
  const childCount =
    positiveNumber(childrenUnder15) + positiveNumber(children15To17);
  const childBonusBeforeLimits =
    positiveNumber(childrenUnder15) * 100 + positiveNumber(children15To17) * 50;
  const reducedChildBonus = Math.max(
    0,
    childBonusBeforeLimits -
      Math.max(0, annualTaxBase - TAX_BONUS_REDUCTION_THRESHOLD) * 0.1 * childCount,
  );
  const monthlyChildBonus = Math.min(
    reducedChildBonus,
    (annualTaxBase * childBonusRate(childCount)) / 12,
  );
  const taxAfterBonus = Math.max(0, taxBeforeBonus - monthlyChildBonus);
  const netCash = Math.max(
    0,
    gross - social - health - taxBeforeBonus + monthlyChildBonus,
  );

  const maxIncome = MORTGAGE_INCOME_LIMITS[mortgageYear];
  const hasEligibleAge =
    Number(mortgageAge) >= 18 &&
    Number(mortgageAge) <= 35 &&
    (!hasCoBorrower ||
      (Number(coBorrowerAge) >= 18 && Number(coBorrowerAge) <= 35));
  const hasEligibleIncome =
    positiveNumber(mortgageIncome) + (hasCoBorrower ? positiveNumber(coBorrowerIncome) : 0) <=
    maxIncome * (hasCoBorrower ? 2 : 1);
  const mortgageIsEligible = hasEligibleAge && hasEligibleIncome;
  const mortgageMonths = Math.min(12, positiveNumber(eligibleMonths));
  const mortgageBonus = mortgageIsEligible
    ? Math.min(
        positiveNumber(interestPaid) * 0.5,
        1_200 * (mortgageMonths / 12),
      )
    : 0;

  const hours = positiveNumber(tripHours);
  const travelMealAllowance = hours < 5 ? 0 : hours <= 12 ? 9.3 : hours <= 18 ? 13.8 : 20.6;

  return (
    <div className="tool-shell">
      <section className="tool-card payroll-card" aria-labelledby="netto-title">
        <span className="tool-kicker">Mzdová kalkulačka · 2026</span>
        <h3 id="netto-title">Kalkulačka čistej mzdy</h3>
        <p className="tool-description">
          Odhad mesačnej výplaty zamestnanca vrátane zdaniteľného služobného auta a
          daňového bonusu na deti.
        </p>

        <div className="tool-grid">
          <label>
            Hrubá mesačná mzda (€)
            <input
              type="number"
              min="0"
              step="50"
              value={grossSalary}
              onChange={(event) => setGrossSalary(event.target.value)}
            />
          </label>
          <label className="tool-checkbox">
            <input
              type="checkbox"
              checked={hasPersonalAllowance}
              onChange={(event) => setHasPersonalAllowance(event.target.checked)}
            />
            <span>Uplatňujem si nezdaniteľnú časť u zamestnávateľa</span>
          </label>
          <label className="tool-checkbox">
            <input
              type="checkbox"
              checked={hasDisability}
              onChange={(event) => setHasDisability(event.target.checked)}
            />
            <span>Mám uznané zdravotné postihnutie (zdravotné odvody 2,5 %)</span>
          </label>
        </div>

        <details className="tool-details">
          <summary>Deti a služobné auto</summary>
          <div className="tool-row">
            <label>
              Deti do 15 rokov
              <input
                type="number"
                min="0"
                max="20"
                value={childrenUnder15}
                onChange={(event) => setChildrenUnder15(event.target.value)}
              />
            </label>
            <label>
              Deti od 15 do 17 rokov
              <input
                type="number"
                min="0"
                max="20"
                value={children15To17}
                onChange={(event) => setChildren15To17(event.target.value)}
              />
            </label>
          </div>
          <div className="tool-row">
            <label>
              Vstupná cena auta s DPH (€)
              <input
                type="number"
                min="0"
                step="500"
                value={carPrice}
                onChange={(event) => setCarPrice(event.target.value)}
              />
            </label>
            <label>
              Rok zaradenia do užívania
              <select value={carYear} onChange={(event) => setCarYear(event.target.value)}>
                {Array.from({ length: 8 }, (_, index) => 2026 - index).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="tool-checkbox">
            <input
              type="checkbox"
              checked={isGroupZero}
              onChange={(event) => setIsGroupZero(event.target.checked)}
            />
            <span>Vozidlo je zaradené v odpisovej skupine 0 (sadzba 0,5 %)</span>
          </label>
          <p className="tool-hint">
            Pri bežnom vozidle sa zdaňuje 1 % vstupnej ceny mesačne; suma sa v ďalších
            rokoch znižuje o 12,5 % ročne. Auto zvyšuje daňový a odvodový základ, nie
            hotovostnú mzdu. Výpočet nezahŕňa prípadné technické zhodnotenie vozidla.
          </p>
        </details>

        <div className="result-box">
          <span>Odhad čistej hotovostnej mzdy</span>
          <strong>{money(netCash)}</strong>
          <span>Nepeňažný benefit auta: {money(carBenefit)} / mesiac</span>
        </div>
        <dl className="tool-breakdown">
          <div><dt>Sociálne poistenie</dt><dd>{money(social)}</dd></div>
          <div><dt>Zdravotné poistenie</dt><dd>{money(health)}</dd></div>
          <div><dt>Preddavok na daň pred bonusom</dt><dd>{money(taxBeforeBonus)}</dd></div>
          <div><dt>Preddavok po odpočítaní bonusu</dt><dd>{money(taxAfterBonus)}</dd></div>
          <div><dt>Odhadovaný bonus na deti</dt><dd>{money(monthlyChildBonus)}</dd></div>
        </dl>
        <p className="tool-hint">
          Orientačný model pre celý rok 2026: odvody zamestnanca 9,4 % (sociálne
          poistenie s mesačným stropom {money(SOCIAL_MAX_BASE)}), zdravotné poistenie
          5 % alebo 2,5 % pri uznanom postihnutí, NČZD a progresívne sadzby dane
          19/25/30/35 %. Bonus na deti je ročný odhad rozpočítaný na mesiac; vek dieťaťa
          a nárok sa môžu počas roka meniť. Model nezahŕňa všetky výnimky ani súbeh
          zamestnaní.
        </p>
        <div className="tool-link-list">
          <a href="https://podpora.financnasprava.sk/418585-V%C3%BDpo%C4%8Det-preddavkov-na-da%C5%88---sadzba-dane" target="_blank" rel="noreferrer">
            Progresívne sadzby dane — Finančná správa →
          </a>
          <a href="https://www.socpoist.sk/socialne-poistenie/platenie-poistneho/tabulky-platenia-poistneho/tabulky-platenia-poistneho-od-1-6" target="_blank" rel="noreferrer">
            Sadzby a strop sociálneho poistenia — Sociálna poisťovňa →
          </a>
          <a href="https://www.vszp.sk/platitelia/platenie-poistneho/oznamenia-zmeny/zmeny-od-01-01.2026/" target="_blank" rel="noreferrer">
            Zdravotné poistenie od roku 2026 — VšZP →
          </a>
          <a href="https://podpora.financnasprava.sk/573977-Poskytnutie-vozidla-" target="_blank" rel="noreferrer">
            Služobné vozidlo na súkromné účely — Finančná správa →
          </a>
          <a href="https://podpora.financnasprava.sk/549090-Da%C5%88ov%C3%BD-bonus-na-vy%C5%BEivovan%C3%A9-die%C5%A5a-v-roku-2026" target="_blank" rel="noreferrer">
            Podmienky bonusu na dieťa — Finančná správa →
          </a>
        </div>
      </section>

      <section className="tool-card" aria-labelledby="mortgage-title">
        <span className="tool-kicker">Daňový bonus · ročné zúčtovanie</span>
        <h3 id="mortgage-title">Bonus na zaplatené úroky z hypotéky</h3>
        <p className="tool-description">
          Samostatný odhad ročného bonusu. Nie je to mesačný odpočet zo základu dane.
        </p>
        <div className="tool-grid">
          <label>
            Rok uzavretia zmluvy
            <select value={mortgageYear} onChange={(event) => setMortgageYear(event.target.value)}>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
          </label>
          <label>
            Vek žiadateľa pri žiadosti o úver
            <input
              type="number"
              min="0"
              max="120"
              value={mortgageAge}
              onChange={(event) => setMortgageAge(event.target.value)}
            />
          </label>
          <label>
            Priemerný mesačný príjem v predchádzajúcom roku (€)
            <input
              type="number"
              min="0"
              step="50"
              value={mortgageIncome}
              onChange={(event) => setMortgageIncome(event.target.value)}
            />
          </label>
          <label>
            Zaplatené úroky v danom roku (€)
            <input
              type="number"
              min="0"
              step="50"
              value={interestPaid}
              onChange={(event) => setInterestPaid(event.target.value)}
            />
          </label>
          <label>
            Mesiace v päťročnom období nároku
            <input
              type="number"
              min="0"
              max="12"
              step="1"
              value={eligibleMonths}
              onChange={(event) => {
                const value = event.target.value;
                if (value === "") {
                  setEligibleMonths("");
                  return;
                }
                const parsed = Number(value);
                setEligibleMonths(
                  String(Math.min(12, Math.max(0, Number.isFinite(parsed) ? parsed : 0))),
                );
              }}
            />
          </label>
          <label className="tool-checkbox">
            <input
              type="checkbox"
              checked={hasCoBorrower}
              onChange={(event) => setHasCoBorrower(event.target.checked)}
            />
            <span>Úver má aj spoludlžníka (započíta sa príjem oboch)</span>
          </label>
          {hasCoBorrower && (
            <div className="tool-row">
              <label>
                Vek spoludlžníka pri žiadosti
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={coBorrowerAge}
                  onChange={(event) => setCoBorrowerAge(event.target.value)}
                />
              </label>
              <label>
                Priemerný mesačný príjem spoludlžníka (€)
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={coBorrowerIncome}
                  onChange={(event) => setCoBorrowerIncome(event.target.value)}
                />
              </label>
            </div>
          )}
        </div>
        <div className="result-box">
          <span>
            {mortgageIsEligible ? "Orientačný ročný bonus" : "Zadané údaje nespĺňajú vekový alebo príjmový limit"}
          </span>
          <strong>{money(mortgageBonus)}</strong>
          <span>
            Limit príjmu pre zmluvu z roku {mortgageYear}: {money(maxIncome)} mesačne
            {hasCoBorrower ? " na každého z dvoch dlžníkov" : ""}.
          </span>
        </div>
        <p className="tool-hint">
          Pri zmluvách od roku 2024 ide o 50 % zaplatených úrokov, najviac 1 200 €
          ročne (v prvom alebo poslednom roku pomerne podľa mesiacov). Vek 18–35 rokov
          sa posudzuje pri žiadosti o úver; príjmový limit závisí od roka zmluvy.
          Spoludlžník musí spĺňať vekovú podmienku. Predpokladá sa vlastné trvalé
          bývanie a splnenie ostatných zákonných podmienok.
        </p>
        <a
          className="tool-source"
          href="https://podpora.financnasprava.sk/612955-Da%C5%88ov%C3%BD-bonus-na-zaplaten%C3%A9-%C3%BAroky---zmluvy-o-%C3%BAveroch-na-b%C3%BDvanie-uzavret%C3%A9-najsk%C3%B4r-od-112024-"
          target="_blank"
          rel="noreferrer"
        >
          Podmienky bonusu na Finančnej správe →
        </a>
      </section>

      <section className="tool-card" aria-labelledby="calendar-title">
        <span className="tool-kicker">Kalendár Slovenska</span>
        <h3 id="calendar-title">Sviatky a prázdniny 2026</h3>
        <p className="tool-description">
          Dni pracovného pokoja podľa kalendára na rok 2026. Nie každý štátny sviatok
          je v tomto roku dňom pracovného pokoja.
        </p>
        <ul className="date-list">
          {holidays2026.map(({ date, name }) => (
            <li key={date}>
              <time dateTime={date}>
                {new Intl.DateTimeFormat("sk-SK", {
                  day: "numeric",
                  month: "long",
                  weekday: "short",
                }).format(new Date(`${date}T12:00:00`))}
              </time>
              <span>{name}</span>
            </li>
          ))}
        </ul>
        <p className="tool-hint">
          V roku 2026 sú 8. máj, 1. september, 15. september, 28. október a
          17. november pracovnými dňami. Školské prázdniny sa líšia podľa krajov;
          termíny na školský rok 2026/2027 overte v oficiálnom kalendári ministerstva.
        </p>
        <p className="tool-hint">
          Štyri dni voľna vychádzajú na Veľkú noc (3.–6. apríla) a Vianoce
          (24.–27. decembra); predĺžený májový víkend trvá 1.–3. mája.
        </p>
        <div className="tool-link-list">
          <a href="https://www.slov-lex.sk/ezbierky/pravne-predpisy/SK/ZZ/1993/241/" target="_blank" rel="noreferrer">
            Zákon o štátnych sviatkoch (Slov-Lex) →
          </a>
          <a href="https://www.minedu.sk/data/att/73f/29962.1b3154.pdf" target="_blank" rel="noreferrer">
            Školské prázdniny 2026/2027 — ministerstvo školstva →
          </a>
        </div>
      </section>

      <section className="tool-card" aria-labelledby="travel-title">
        <span className="tool-kicker">Pracovné cesty · Slovensko</span>
        <h3 id="travel-title">Stravné na pracovnej ceste</h3>
        <p className="tool-description">
          Orientačné tuzemské stravné podľa dĺžky pracovnej cesty.
        </p>
        <label>
          Trvanie cesty v hodinách
          <input
            type="number"
            min="0"
            step="0.5"
            value={tripHours}
            onChange={(event) => setTripHours(event.target.value)}
          />
        </label>
        <div className="result-box">
          <span>Nárok na stravné</span>
          <strong>{money(travelMealAllowance)}</strong>
          <span>
            {hours < 5
              ? "Cesta kratšia ako 5 hodín"
              : hours <= 12
                ? "5 až 12 hodín"
                : hours <= 18
                  ? "Viac ako 12 až 18 hodín"
                  : "Viac ako 18 hodín"}
          </span>
        </div>
        <p className="tool-hint">
          Výpočet nezohľadňuje bezplatne poskytnuté jedlo ani osobitné pravidlá.
        </p>
        <a
          className="tool-source"
          href="https://www.slov-lex.sk/ezbierky/pravne-predpisy/SK/ZZ/2025/280/20251028"
          target="_blank"
          rel="noreferrer"
        >
          Opatrenie o sumách stravného (Slov-Lex) →
        </a>
      </section>

      <section className="tool-card" aria-labelledby="family-title">
        <span className="tool-kicker">Rodina a sociálne dávky</span>
        <h3 id="family-title">Kde overiť nárok na dávky</h3>
        <p className="tool-description">
          Výška dávok závisí od životnej situácie a aktuálnych pravidiel. Namiesto
          neovereného odhadu odkazujeme priamo na príslušné úrady.
        </p>
        <div className="tool-link-list">
          <a href="https://www.upsvr.gov.sk/" target="_blank" rel="noreferrer">
            Prídavok na dieťa a rodičovský príspevok — ÚPSVaR →
          </a>
          <a href="https://www.socpoist.sk/" target="_blank" rel="noreferrer">
            Materské, nemocenské a dávka v nezamestnanosti — Sociálna poisťovňa →
          </a>
          <a href="https://www.financnasprava.sk/" target="_blank" rel="noreferrer">
            Ročné zúčtovanie dane a daňové bonusy — Finančná správa →
          </a>
        </div>
      </section>
    </div>
  );
}
