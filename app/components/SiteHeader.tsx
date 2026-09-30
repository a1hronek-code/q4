import Link from "next/link";
import { calculators } from "../lib/calculators";

export function SiteHeader() {
  return (
    <header className="topbar">
      <Link href="/" className="brand-wrap" aria-label="Q4.sk – domov">
        <span className="brand-mark">Q4</span>
        <span>
          <span className="brand-name">Q4.sk</span>
          <span className="brand-subtitle">Firemná inteligencia</span>
        </span>
      </Link>

      <nav className="nav" aria-label="Hlavná navigácia">
        <Link href="/#vyhladavanie">Vyhľadávanie</Link>
        <Link href="/#vztahy">Vzťahy</Link>
        <Link href="/#schopnosti">Čo dokáže Q4</Link>
        <Link href="/#trhy">Trhy</Link>
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
        <Link className="primary-btn" href="/firmy">Preskúmať firmy</Link>
      </div>
    </header>
  );
}
