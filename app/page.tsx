import Link from "next/link";
import { BusinessTools } from "./components/BusinessTools";
import { SearchPanel } from "./components/SearchPanel";
import { companies } from "./lib/companies";

const officeCards = [
  { name: "Úrad práce, sociálnych vecí a rodiny", city: "Bratislava", detail: "Registrácia, dávky, podporené zamestnanie." },
  { name: "Daňový úrad SR", city: "Bratislava", detail: "Daňové priznania, zrážky a preddavky." },
  { name: "Obecné úrady", city: "Národné", detail: "Podnikateľské preukazy a licencie." },
  { name: "Centrálne orgány štátu", city: "Národné", detail: "Legislatíva, výnosy a zriadenie podnikania." },
];

const apiCards = [
  { title: "Register ekonomických subjektov", status: "Pripravené na API", note: "Získavanie IČO, právnej formy, sídla a vlastníkov." },
  { title: "Verejné obstarávanie", status: "Integrácia", note: "Tendery, výzvy, výsledky a partnerstvá." },
  { title: "Data z úradov", status: "Čiastočne k dispozícii", note: "Dávky, práce, dotácie a štátne záznamy." },
];

const featuredCompanies = companies.slice(0, 3);

export default function Home() {
  return (
    <main className="page-shell">
      <header className="topbar">
        <div className="brand-wrap">
          <div className="brand-mark">Q4</div>
          <div>
            <div className="brand-name">Q4.sk</div>
            <div className="brand-subtitle">Biznis, úrad a korporácie</div>
          </div>
        </div>

        <nav className="nav" aria-label="Hlavná navigácia">
          <a href="#firmy">Firmy</a>
          <a href="#kalkulacky">Kalkulačky</a>
          <a href="#urady">Úrady</a>
          <a href="#spravy">Správy</a>
        </nav>

        <div className="actions">
          <button className="secondary-btn">Prihlásiť sa</button>
          <button className="primary-btn">Zobraziť databázu</button>
        </div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Portál pre podnikanie, štát a korporácie</span>
          <h1>Všetko, čo potrebujete vedieť o podnikaní na Slovensku.</h1>
          <p>
            Vyhľadávajte firmy, vlastníkov, verejné obstarávania, dátové zdroje, dávky a daňové
            výpočty na jednom mieste. Q4.sk je pripravený na rozhodovanie, obchod, investície a
            správne riadenie podnikania.
          </p>

          <SearchPanel />

          <div className="hero-metrics">
            <div className="metric-item">
              <strong>92 340+</strong>
              <span>spoločností</span>
            </div>
            <div className="metric-item">
              <strong>14 800+</strong>
              <span>osôb a konateľov</span>
            </div>
            <div className="metric-item">
              <strong>480+</strong>
              <span>obcí a miest</span>
            </div>
            <div className="metric-item">
              <strong>24/7</strong>
              <span>dostupnosť údajov</span>
            </div>
          </div>
        </div>

        <div className="hero-visual" aria-label="Prehľad portálu">
          <div className="glass-card dashboard-card">
            <div className="dashboard-header">
              <span className="status-dot" />
              <span>Aktívne trhy</span>
            </div>

            <div className="mini-chart">
              <span style={{ height: "38%" }} />
              <span style={{ height: "54%" }} />
              <span style={{ height: "72%" }} />
              <span style={{ height: "86%" }} />
              <span style={{ height: "76%" }} />
              <span style={{ height: "96%" }} />
            </div>

            <div className="company-list">
              <div className="company-item">
                <div>
                  <strong>Slovenská Energetika</strong>
                  <small>Energetika</small>
                </div>
                <span className="up">+8,4%</span>
              </div>
              <div className="company-item">
                <div>
                  <strong>NovaBuild s.r.o.</strong>
                  <small>Stavba</small>
                </div>
                <span className="up">+6,2%</span>
              </div>
              <div className="company-item">
                <div>
                  <strong>DigitalVitaj</strong>
                  <small>IT a SaaS</small>
                </div>
                <span className="up">+12,1%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="categories" id="firmy">
        <div className="section-heading">
          <span className="eyebrow">Rýchle hľadanie</span>
          <h2>Prehľad najdôležitejších oblastí</h2>
        </div>

        <div className="category-grid">
          <article className="category-card">
            <div className="category-icon" style={{ background: "#3b82f6" }} />
            <h3>Firmy a podnikatelia</h3>
            <p>Detailné profily, kontakty, vlastníctvo a vývoj spoločností na Slovensku.</p>
            <span>Preskúmať</span>
          </article>
          <article className="category-card">
            <div className="category-icon" style={{ background: "#14b8a6" }} />
            <h3>Verejný sektor</h3>
            <p>Úradné rozhodnutia, zmluvy, dotácie a financovanie pre obce a štát.</p>
            <span>Preskúmať</span>
          </article>
          <article className="category-card">
            <div className="category-icon" style={{ background: "#8b5cf6" }} />
            <h3>Korporátny trh</h3>
            <p>Správy o akciových spoločnostiach, partnerstvách a investíciách.</p>
            <span>Preskúmať</span>
          </article>
          <article className="category-card">
            <div className="category-icon" style={{ background: "#f59e0b" }} />
            <h3>Ekonomika a dane</h3>
            <p>Kurzové sadzby, dane, legislatíva a prehľad vývoja trhu.</p>
            <span>Preskúmať</span>
          </article>
          <article className="category-card">
            <div className="category-icon" style={{ background: "#ef4444" }} />
            <h3>Obchodné bazáre</h3>
            <p>Porovnanie dodávateľov, partnerov, služieb a nových projektov.</p>
            <span>Preskúmať</span>
          </article>
          <article className="category-card">
            <div className="category-icon" style={{ background: "#22c55e" }} />
            <h3>Inovácie a startupy</h3>
            <p>Najnovšie startupy, fondy, inovácie a nápady meniacich slovenský trh.</p>
            <span>Preskúmať</span>
          </article>
        </div>
      </section>

      <section className="tool-section" id="kalkulacky">
        <div className="section-heading">
          <span className="eyebrow">Výpočty a kalkulačky</span>
          <h2>Praktické nástroje pre podnikateľov a zamestnancov</h2>
        </div>
        <BusinessTools />
      </section>

      <section className="office-section" id="urady">
        <div className="section-heading">
          <span className="eyebrow">Úrady a pracovné portály</span>
          <h2>Priamy prístup k informáciám od úradov a zamestnávania</h2>
        </div>

        <div className="office-grid">
          {officeCards.map((office) => (
            <article key={office.name} className="office-card">
              <span className="office-badge">{office.city}</span>
              <h3>{office.name}</h3>
              <p>{office.detail}</p>
              <a href="#">Prejsť na službu</a>
            </article>
          ))}
        </div>
      </section>

      <section className="feature-layout" id="trhy">
        <div className="feature-panel main-panel">
          <span className="eyebrow">Prečo práve my</span>
          <h2>Jednotný zdroj informácií pre podnikanie, štát, korporácie a ľudí.</h2>
          <ul className="check-list">
            <li>Komplexné profily firiem, vlastníkov a vzťahov medzi subjektmi.</li>
            <li>Aktuality z ekonomiky, verejného sektora a podnikania v reálnom čase.</li>
            <li>Jednoduché vyhľadávanie podľa názvu, IČO, odvetvia alebo lokality.</li>
            <li>Nástroje pre investície, partnerstvá, verejné obstarávanie a analýzu trhu.</li>
          </ul>
        </div>

        <div className="feature-panel side-panel">
          <div className="mini-stat">
            <span>Aktuálne správy</span>
            <strong>1 482</strong>
            <small>nových záznamov za 7 dní</small>
          </div>
          <div className="mini-stat soft">
            <span>Verejné obstarávania</span>
            <strong>396</strong>
            <small>priebežné tendery</small>
          </div>
          <div className="mini-stat soft">
            <span>Investičné projekty</span>
            <strong>241</strong>
            <small>plánovaných projektov</small>
          </div>
        </div>
      </section>

      <section className="company-section">
        <div className="section-heading">
          <span className="eyebrow">Databáza firiem</span>
          <h2>Firmy a spoločnosti s individuálnym profilom</h2>
        </div>

        <div className="company-grid">
          {featuredCompanies.map((company) => (
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

        <div className="more-button-row">
          <Link href="/firmy" className="primary-btn inline-link">Zobraziť všetky firmy</Link>
        </div>
      </section>

      <section className="api-section">
        <div className="section-heading">
          <span className="eyebrow">API a dátové zdroje</span>
          <h2>Pripravené na napojenie na oficiálne úradné a obchodné API</h2>
        </div>

        <div className="api-grid">
          {apiCards.map((item) => (
            <article key={item.title} className="api-card">
              <span className="status-pill">{item.status}</span>
              <h3>{item.title}</h3>
              <p>{item.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="news" id="spravy">
        <div className="section-heading small-gap">
          <span className="eyebrow">Najnovšie</span>
          <h2>Správy z trhu a podnikania</h2>
        </div>

        <div className="news-grid">
          <article className="news-card">
            <span className="tag">Ekonomika</span>
            <h3>Slovenské firmy rýchlo expandujú do strednej Európy</h3>
            <p>Analýza rastu exportu a nových investícií v priemyselných a technologických odvetviach.</p>
            <a href="#">Prečítať viac</a>
          </article>
          <article className="news-card">
            <span className="tag">Verejný sektor</span>
            <h3>Nové schémy dotácií pre malé a stredné podniky</h3>
            <p>Ministerstvo pripravilo ďalšie podporné programy pre zelenú transformáciu a digitalizáciu.</p>
            <a href="#">Prečítať viac</a>
          </article>
          <article className="news-card">
            <span className="tag">Korporáty</span>
            <h3>Najväčšie korporácie zvyšujú investície do AI a automatizácie</h3>
            <p>Zvýšenie produktivity a digitalizácie sa stáva najdôležitejším impulzom pre rast.</p>
            <a href="#">Prečítať viac</a>
          </article>
        </div>
      </section>

      <footer className="footer">
        <div>
          <div className="brand-wrap">
            <div className="brand-mark">Q4</div>
            <div>
              <div className="brand-name">Q4.sk</div>
            </div>
          </div>
        </div>
        <div className="footer-links">
          <a href="#">O portáli</a>
          <a href="#">Kontakty</a>
          <a href="#">Podmienky</a>
          <a href="#">Cookies</a>
        </div>
      </footer>
    </main>
  );
}
