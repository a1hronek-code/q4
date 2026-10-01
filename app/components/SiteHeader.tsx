import Link from "next/link";
import { calculators } from "../lib/calculators";

export function SiteHeader() {
  return (
    <header className="topbar">
      <Link href="/" className="brand-wrap" aria-label="Q4.sk – domov">
        <span className="brand-mark">Q4</span>
        <span className="brand-name">
          Q4<span className="brand-name-accent">.sk</span>
        </span>
      </Link>

      <nav className="nav" aria-label="Hlavná navigácia">
        <Link href="/pocasie">Počasie</Link>
        <Link href="/sviatky">Kalendár</Link>
        <Link href="/statistiky">Štatistiky</Link>
        <Link href="/slovensko-teraz">Naživo</Link>
        <Link href="/obce">Obce</Link>
        <Link href="/urady">Úrady</Link>
        <div className="nav-dropdown">
          <Link href="/kalkulacky">Kalkulačky</Link>
          <div className="nav-dropdown-panel" role="menu" aria-label="Kalkulačky">
            {calculators.map((calculator) => (
              <Link
                key={calculator.slug}
                href={`/kalkulacky/${calculator.slug}`}
                role="menuitem"
                className="nav-dropdown-item"
              >
                <span className="nav-dropdown-icon" aria-hidden="true">{calculator.icon}</span>
                <span>
                  <strong>{calculator.shortTitle}</strong>
                  <small>{calculator.description}</small>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <div className="actions">
        <Link className="primary-btn nav-cta" href="/#vyhladavanie">Vyhľadať firmu →</Link>
      </div>
    </header>
  );
}
