import Link from "next/link";
import { SearchPanel } from "../components/SearchPanel";

export default function CompanyDirectoryPage() {
  return (
    <main className="page-shell">
      <header className="topbar">
        <Link href="/" className="brand-wrap" aria-label="Q4.sk – domov">
          <span className="brand-mark">Q4</span>
          <span>
            <span className="brand-name">Q4.sk</span>
            <span className="brand-subtitle">Vyhľadávanie v štátnom registri</span>
          </span>
        </Link>
        <nav className="nav" aria-label="Navigácia">
          <Link href="/">Domov</Link>
          <a href="#vyhladavanie">Vyhľadávanie</a>
          <a href="https://rpo.statistics.sk/new/" target="_blank" rel="noreferrer">
            Oficiálny register
          </a>
        </nav>
      </header>

      <section className="tool-section">
        <div className="section-heading">
          <span className="eyebrow">Register právnických osôb MV SR</span>
          <h1>Vyhľadajte firmu alebo iný subjekt</h1>
          <p className="directory-intro">
            Výsledky sa načítajú priamo z verejného REST API slovenského registra RPO.
            Vyhľadávať môžete podľa názvu alebo IČO.
          </p>
        </div>

        <SearchPanel />
      </section>

      <p className="data-source-note">
        Zdroj a dokumentácia API:{" "}
        <a href="https://rpo.minv.sk/rpo-api-doc.html" target="_blank" rel="noreferrer">
          Ministerstvo vnútra SR – RPO API
        </a>
      </p>
    </main>
  );
}
