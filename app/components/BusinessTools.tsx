'use client';

import { useMemo, useState } from "react";

const toNumber = (value: string) => Number(value || 0);

export function BusinessTools() {
  const [grossSalary, setGrossSalary] = useState("1800");
  const [children, setChildren] = useState("0");
  const [benefits, setBenefits] = useState("120");
  const [taxRate, setTaxRate] = useState("15");

  const netSalary = useMemo(() => {
    const gross = toNumber(grossSalary);
    const childAllowance = Number(children) * 120;
    const payrollTax = gross * 0.13;
    const healthInsurance = gross * 0.04;
    const taxableBase = Math.max(gross - payrollTax - healthInsurance - 350 - childAllowance, 0);
    const incomeTax = taxableBase * (Number(taxRate) / 100);
    const net = gross - payrollTax - healthInsurance - incomeTax + toNumber(benefits);

    return {
      gross,
      social: payrollTax,
      health: healthInsurance,
      tax: incomeTax,
      benefitsValue: toNumber(benefits),
      net: Math.max(net, 0),
    };
  }, [benefits, children, grossSalary, taxRate]);

  const benefitValue = useMemo(() => {
    const monthlyIncome = toNumber(grossSalary);
    const reduced = monthlyIncome * 0.12;
    return Math.min(reduced, 420.5);
  }, [grossSalary]);

  return (
    <div className="tool-shell">
      <div className="tool-card">
        <h3>Čistá mzda</h3>
        <div className="tool-grid">
          <label>
            Hrubá mzda (€)
            <input type="number" value={grossSalary} onChange={(e) => setGrossSalary(e.target.value)} />
          </label>
          <label>
            Počet detí
            <input type="number" value={children} onChange={(e) => setChildren(e.target.value)} />
          </label>
          <label>
            Príspevky / benefity (€)
            <input type="number" value={benefits} onChange={(e) => setBenefits(e.target.value)} />
          </label>
          <label>
            Sadzba dane (%)
            <select value={taxRate} onChange={(e) => setTaxRate(e.target.value)}>
              <option value="15">15 %</option>
              <option value="20">20 %</option>
              <option value="25">25 %</option>
            </select>
          </label>
        </div>
        <div className="result-box">
          <span>Orientačná čistá mzda</span>
          <strong>{netSalary.net.toFixed(2)} €</strong>
          <span>Hrubá mzda {netSalary.gross.toFixed(2)} € • Sociálne príspevky {netSalary.social.toFixed(2)} €</span>
        </div>
      </div>

      <div className="tool-card">
        <h3>Výpočet dávok</h3>
        <div className="tool-grid">
          <label>
            Mesačný príjem (€)
            <input type="number" value={grossSalary} onChange={(e) => setGrossSalary(e.target.value)} />
          </label>
          <label>
            Stav rodiny
            <select defaultValue="samostatne">
              <option value="samostatne">Samostatne</option>
              <option value="s-detmi">S deťmi</option>
              <option value="v-domacnosti">V domácnosti</option>
            </select>
          </label>
        </div>
        <div className="result-box">
          <span>Možná dávka</span>
          <strong>{benefitValue.toFixed(2)} €</strong>
          <span>Orientačný odhad podľa typu podpornej schémy.</span>
        </div>
      </div>

      <div className="tool-card">
        <h3>Daňové kalkulačky</h3>
        <div className="tool-grid">
          <label>
            Základ dane (€)
            <input type="number" value={grossSalary} onChange={(e) => setGrossSalary(e.target.value)} />
          </label>
          <label>
            Odpočítateľné položky (€)
            <input type="number" value="420" readOnly />
          </label>
          <label>
            Typ podnikania
            <select defaultValue="osobne">
              <option value="osobne">Osobné</option>
              <option value="sro">S.R.O.</option>
              <option value="freelancer">Freelancer</option>
            </select>
          </label>
        </div>
        <div className="result-box">
          <span>Daň z príjmu</span>
          <strong>{(toNumber(grossSalary) * (Number(taxRate) / 100)).toFixed(2)} €</strong>
          <span>Přibližný výpočet na základe zvoleného režimu.</span>
        </div>
      </div>
    </div>
  );
}
