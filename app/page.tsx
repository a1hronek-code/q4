import Link from "next/link";
import { BusinessTools } from "./components/BusinessTools";
import { MarketOverview } from "./components/MarketOverview";
import { RelationshipPreview } from "./components/RelationshipPreview";
import { SearchPanel } from "./components/SearchPanel";
import { popularCompanies } from "./lib/popular-companies";

const q4Features = [
  {
    number: "01",
    title: "Firmy",
    description: "Vyhľadávanie spoločností podľa názvu a IČO",
    icon: "⌕",
    href: "#vyhladavanie",
  },
  {
    number: "02",
    title: "Osoby",
    description: "Vyhľadávanie konateľov a spoločníkov",
    icon: "◎",
    href: "#vyhladavanie",
  },
  {
    number: "03",
    title: "Vzťahy",
    description: "Prepojenia medzi firmami a osobami",
    icon: "⌘",
    href: "#vztahy",
  },
  {
    number: "04",
    title: "História",
    description: "Zmeny vo firmách a štatutároch",
    icon: "↗",
    href: "#vyhladavanie",
  },
  {
    number: "05",
    title: "Zmluvy",
    description: "Prepojenia na verejné zmluvy",
    icon: "▤",
    href: "#zdroje-dat",
  },
  {
    number: "06",
    title: "Obchodné siete",
    description: "Grafické zobrazenie vlastníckych väzieb",
    icon: "✳",
    href: "#vztahy",
  },
];

export default function Home() {
  return (
    <main className="page-shell intelligence-page">
      <header className="topbar">
        <Link href="/" className="brand-wrap" aria-label="Q4.sk – domov">
          <span className="brand-mark">Q4</span>
          <span>
            <span className="brand-name">Q4.sk</span>
            <span className="brand-subtitle">Firemná inteligencia</span>
          </span>
        </Link>

        <nav className="nav" aria-label="Hlavná navigácia">
          <a href="#vyhladavanie">Vyhľadávanie</a>
          <a href="#vztahy">Vzťahy</a>
          <a href="#schopnosti">Čo dokáže Q4</a>
          <a href="#trhy">Trhy</a>
        </nav>

        <div className="actions">
          <Link className="primary-btn" href="/firmy">Preskúmať firmy</Link>
        </div>
      </header>

      <section className="hero intelligence-hero">
        <div className="hero-copy">
          <span className="eyebrow">Firemná inteligencia</span>
          <h1>Zistite, kto stojí za firmou.</h1>
          <p>
            Vyhľadajte konateľov, spoločníkov, prepojené firmy, obchodné väzby a verejne
            dostupné informácie o slovenských subjektoch.
          </p>
          <SearchPanel />
          <div className="hero-trustline">
            <span><i aria-hidden="true" />Vyhľadávanie firiem a osôb</span>
            <span>Prepojenia zobrazené v interaktívnom grafe</span>
            <span>Verejne dostupné zdroje</span>
          </div>
        </div>
        <div className="hero-orbit" aria-hidden="true">
          <div className="orbit-ring orbit-ring-outer" />
          <div className="orbit-ring orbit-ring-inner" />
          <span className="orbit-node orbit-node-main">Q4</span>
          <span className="orbit-node orbit-node-person orbit-person-one">JN</span>
          <span className="orbit-node orbit-node-company orbit-company-one">DG</span>
          <span className="orbit-node orbit-node-person orbit-person-two">PH</span>
          <span className="orbit-node orbit-node-company orbit-company-two">AI</span>
          <span className="orbit-line orbit-line-one" />
          <span className="orbit-line orbit-line-two" />
          <span className="orbit-line orbit-line-three" />
          <span className="orbit-line orbit-line-four" />
          <span className="orbit-label orbit-label-company">Firma</span>
          <span className="orbit-label orbit-label-network">Obchodná sieť</span>
        </div>
      </section>

      <MarketOverview />

      <RelationshipPreview />

      <section className="capabilities-section" id="schopnosti">
        <div className="section-heading">
          <span className="eyebrow">Jedna platforma, jasné súvislosti</span>
          <h2>Čo dokáže Q4</h2>
          <p className="directory-intro">
            Od rýchleho vyhľadania subjektu po mapu jeho obchodných väzieb.
          </p>
        </div>
        <div className="capabilities-grid">
          {q4Features.map((feature) => (
            <Link className="capability-card" href={feature.href} key={feature.title}>
              <div className="capability-card-top">
                <span className="capability-icon" aria-hidden="true">{feature.icon}</span>
                <span className="capability-number">{feature.number}</span>
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <span className="capability-link">Objaviť <span aria-hidden="true">↗</span></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="popular-section" id="oblubene-firmy">
        <div className="section-heading">
          <span className="eyebrow">Rýchly prístup</span>
          <h2>Najčastejšie vyhľadávané</h2>
          <p className="directory-intro">
            Profily známych slovenských spoločností z registra firiem.
          </p>
        </div>
        <div className="popular-grid">
          {popularCompanies.map((company, index) => (
            <Link
              className="popular-company-card"
              href={`/firma/${company.slug}`}
              key={company.slug}
              prefetch={false}
            >
              <span className={`popular-company-logo popular-company-logo-${index + 1}`} aria-hidden="true">
                {company.name
                  .split(/\s+/)
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)}
              </span>
              <span className="popular-company-info">
                <strong>{company.name}</strong>
                <small>{company.category}</small>
              </span>
              <span className="popular-company-arrow" aria-hidden="true">↗</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="tool-section" id="kalkulacky">
        <div className="section-heading">
          <span className="eyebrow">Osobné financie</span>
          <h2>Užitočné kalkulačky</h2>
          <p className="directory-intro">
            Čistá mzda, hypotéka, sviatky a ďalšie praktické prehľady pre Slovensko.
          </p>
        </div>
        <BusinessTools />
      </section>

      <section className="data-note-section" id="zdroje-dat">
        <div>
          <span className="eyebrow">Transparentné zdroje</span>
          <h2>Firemné údaje, ktoré si môžete overiť.</h2>
          <p>
            Firemné profily vychádzajú z verejných údajov Registra právnických osôb.
            Dátum aktualizácie a zdroj sú uvedené pri údajoch.
          </p>
        </div>
        <a href="https://rpo.minv.sk/rpo-api-doc.html" target="_blank" rel="noreferrer">
          Metodika a zdrojové dáta <span aria-hidden="true">↗</span>
        </a>
      </section>

      <footer className="footer intelligence-footer">
        <Link href="/" className="footer-brand">
          <span className="brand-mark">Q4</span>
          <strong>Q4.sk <span>•</span> Firemná inteligencia pre Slovensko</strong>
        </Link>
        <div className="footer-links">
          <Link href="/firmy">Vyhľadávanie firiem</Link>
          <a href="#vztahy">Obchodné vzťahy</a>
          <a href="#trhy">Prehľad trhu</a>
          <Link href="/admin/clanky">Administrácia článkov</Link>
        </div>
      </footer>
    </main>
  );
}
