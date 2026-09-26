import Link from "next/link";
import { companies } from "../lib/companies";

export default function CompanyDirectoryPage() {
  return (
    <main className="page-shell">
      <header className="topbar">
        <div className="brand-wrap">
          <div className="brand-mark">Q4</div>
          <div>
            <div className="brand-name">Q4.sk</div>
            <div className="brand-subtitle">Katalóg spoločností</div>
          </div>
        </div>
        <nav className="nav" aria-label="Navigácia">
          <Link href="/">Domov</Link>
          <Link href="#">Firmy</Link>
          <Link href="#">Databáza</Link>
        </nav>
      </header>

      <section className="tool-section">
        <div className="section-heading">
          <span className="eyebrow">Databáza subjektov</span>
          <h2>Všetky firmy a subjekty v portáli</h2>
        </div>

        <div className="company-grid">
          {companies.map((company) => (
            <Link key={company.slug} href={`/firmy/${company.slug}`} className="company-card">
              <div className="company-card-top">
                <span className="company-badge">{company.industry}</span>
                <span className="company-city">{company.city}</span>
              </div>
              <h3>{company.name}</h3>
              <p>{company.shortDescription}</p>
              <div className="company-meta">
                <span>{company.legalForm}</span>
                <span>IČO {company.ico}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
