import Link from "next/link";
import { BusinessTools } from "./components/BusinessTools";
import { SearchPanel } from "./components/SearchPanel";

const officeCards = [
  {
    name: "Ústredie práce, sociálnych vecí a rodiny",
    city: "Zamestnanosť a dávky",
    detail: "Oficiálne informácie o službách zamestnanosti a sociálnej podpore.",
    href: "https://www.upsvr.gov.sk/",
  },
  {
    name: "Finančná správa SR",
    city: "Dane",
    detail: "Daňové informácie, elektronické služby a formuláre.",
    href: "https://www.financnasprava.sk/",
  },
  {
    name: "Portál slovensko.sk",
    city: "Elektronické služby",
    detail: "Elektronická komunikácia so štátom a životné situácie.",
    href: "https://www.slovensko.sk/",
  },
  {
    name: "Ministerstvo vnútra SR",
    city: "Štátna správa",
    detail: "Informácie a elektronické služby Ministerstva vnútra SR.",
    href: "https://www.minv.sk/",
  },
];

const apiCards = [
  {
    title: "Register právnických osôb",
    status: "Oficiálny export",
    note: "Vyhľadávanie podľa názvu alebo IČO a profily subjektov.",
    href: "https://rpo.minv.sk/rpo-api-doc.html",
  },
  {
    title: "Otvorené dáta RPO",
    status: "Hromadný export",
    note: "Oficiálny export registra a informácie o denných aktualizáciách.",
    href: "https://rpo.minv.sk/rpo-api-doc.html",
  },
  {
    title: "Národný katalóg otvorených dát",
    status: "Oficiálny katalóg",
    note: "Vyhľadávanie otvorených dát z verejnej správy Slovenskej republiky.",
    href: "https://data.slovensko.sk/",
  },
];

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
          <a href="#vyhladavanie">Firmy</a>
          <a href="#kalkulacky">Kalkulačky</a>
          <a href="#urady">Úrady</a>
          <a href="#zdrojove-data">Dáta</a>
        </nav>

        <div className="actions">
          <a className="secondary-btn" href="https://rpo.statistics.sk/new/" target="_blank" rel="noreferrer">
            RPO portál
          </a>
          <Link className="primary-btn" href="/firmy">Vyhľadať subjekt</Link>
        </div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Portál pre podnikanie, štát a korporácie</span>
          <h1>Všetko, čo potrebujete vedieť o podnikaní na Slovensku.</h1>
          <p>
            Vyhľadávajte právnické osoby a podnikateľov v registrovom exporte RPO Ministerstva
            vnútra SR. Každý subjekt má medailónik s dostupnými údajmi z oficiálneho registra.
          </p>

          <SearchPanel />

          <div className="hero-metrics">
            <div className="metric-item">
              <strong>Oficiálne RPO</strong>
              <span>zdroj údajov</span>
            </div>
            <div className="metric-item">
              <strong>Názov</strong>
              <span>vyhľadávanie</span>
            </div>
            <div className="metric-item">
              <strong>IČO</strong>
              <span>presné hľadanie</span>
            </div>
            <div className="metric-item">
              <strong>CC BY 4.0</strong>
              <span>licencia zdroja</span>
            </div>
          </div>
        </div>

        <div className="hero-visual" aria-label="Informácie o štátnom registri">
          <div className="glass-card dashboard-card">
            <div className="dashboard-header">
              <span className="status-dot" />
              <span>Register RPO · Ministerstvo vnútra SR</span>
            </div>

            <div className="company-list">
              <div className="company-item">
                <div>
                  <strong>Vyhľadávanie podľa názvu</strong>
                  <small>Oficiálne údaje o subjektoch</small>
                </div>
                <span className="up">RPO</span>
              </div>
              <div className="company-item">
                <div>
                  <strong>Vyhľadávanie podľa IČO</strong>
                  <small>Presné vyhľadanie záznamu</small>
                </div>
                <span className="up">IČO</span>
              </div>
              <div className="company-item">
                <div>
                  <strong>Údaje aktualizované denne</strong>
                  <small>Podľa dokumentácie registra</small>
                </div>
                <span className="up">24 h</span>
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
            <p>Vyhľadávanie právnických osôb a podnikateľov podľa názvu alebo IČO.</p>
            <a className="category-link" href="#vyhladavanie">Vyhľadať v registri</a>
          </article>
          <article className="category-card">
            <div className="category-icon" style={{ background: "#14b8a6" }} />
            <h3>Verejný sektor</h3>
            <p>Oficiálne portály a elektronické služby verejnej správy.</p>
            <a className="category-link" href="#urady">Zobraziť úrady</a>
          </article>
          <article className="category-card">
            <div className="category-icon" style={{ background: "#8b5cf6" }} />
            <h3>Korporátny trh</h3>
            <p>Oficiálne registračné údaje o spoločnostiach a ich právnej forme.</p>
            <a className="category-link" href="#vyhladavanie">Vyhľadať spoločnosť</a>
          </article>
          <article className="category-card">
            <div className="category-icon" style={{ background: "#f59e0b" }} />
            <h3>Ekonomika a dane</h3>
            <p>Orientačné kalkulačky a odkazy na oficiálne daňové informácie.</p>
            <a className="category-link" href="#kalkulacky">Otvoriť nástroje</a>
          </article>
          <article className="category-card">
            <div className="category-icon" style={{ background: "#ef4444" }} />
            <h3>Obchodné bazáre</h3>
            <p>Overte si slovenský subjekt pred obchodným rokovaním.</p>
            <a className="category-link" href="#vyhladavanie">Overiť subjekt</a>
          </article>
          <article className="category-card">
            <div className="category-icon" style={{ background: "#22c55e" }} />
            <h3>Inovácie a startupy</h3>
            <p>Vyhľadávajte aj nové spoločnosti a podnikateľské subjekty v RPO.</p>
            <a className="category-link" href="#vyhladavanie">Hľadať subjekt</a>
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
              <a href={office.href} target="_blank" rel="noreferrer">Otvoriť oficiálny web</a>
            </article>
          ))}
        </div>
      </section>

      <section className="feature-layout" id="o-portali">
        <div className="feature-panel main-panel">
          <span className="eyebrow">Overiteľný zdroj</span>
          <h2>Údaje z registra bez vymyslených firemných profilov.</h2>
          <ul className="check-list">
            <li>Údaje čerpáme z verejného exportu Registra právnických osôb MV SR.</li>
            <li>Vyhľadávať môžete podľa názvu alebo IČO a filtrovať aktívne záznamy.</li>
            <li>Detail subjektu sa načíta priamo z rovnakého štátneho zdroja.</li>
            <li>Zdrojové údaje sú denne aktualizované a zverejnené pod licenciou CC BY 4.0.</li>
          </ul>
        </div>

        <div className="feature-panel side-panel">
          <div className="mini-stat">
            <span>Zdroj</span>
            <strong>RPO</strong>
            <small>Register právnických osôb MV SR</small>
          </div>
          <div className="mini-stat soft">
            <span>Aktualizácia</span>
            <strong>Denne</strong>
            <small>podľa dokumentácie API</small>
          </div>
          <div className="mini-stat soft">
            <span>Licencia</span>
            <strong>CC BY 4.0</strong>
            <small>uvedená správcom registra</small>
          </div>
        </div>
      </section>

      <section className="company-section">
        <div className="section-heading">
          <span className="eyebrow">Vyhľadávanie subjektov</span>
          <h2>Každý výsledok vedie na živý záznam v registri</h2>
        </div>

        <p className="directory-intro">
          Q4.sk už nezobrazuje ukážkové profily ako skutočné spoločnosti. Zadajte názov alebo IČO
          a otvorte detail načítaný priamo z verejného registra Ministerstva vnútra SR.
        </p>
        <div className="more-button-row">
          <Link href="#vyhladavanie" className="primary-btn inline-link">
            Vyhľadať v registri RPO
          </Link>
          <a
            href="https://rpo.statistics.sk/new/"
            target="_blank"
            rel="noreferrer"
            className="secondary-btn"
          >
            Otvoriť oficiálny portál
          </a>
        </div>
      </section>

      <section className="api-section" id="zdrojove-data">
        <div className="section-heading">
          <span className="eyebrow">API a dátové zdroje</span>
          <h2>Oficiálne zdroje použitých údajov</h2>
        </div>

        <div className="api-grid">
          {apiCards.map((item) => (
            <a
              key={item.title}
              className="api-card"
              href={item.href}
              target="_blank"
              rel="noreferrer"
            >
              <span className="status-pill">{item.status}</span>
              <h3>{item.title}</h3>
              <p>{item.note}</p>
              <span className="source-link">Otvoriť zdroj →</span>
            </a>
          ))}
        </div>
      </section>

      <section className="news" id="spravy">
        <div className="section-heading small-gap">
          <span className="eyebrow">Dôležité informácie</span>
          <h2>Ako čítať údaje z registra</h2>
        </div>

        <div className="news-grid">
          <article className="news-card">
            <span className="tag">Aktualizácia</span>
            <h3>Údaje sa obnovujú denne</h3>
            <p>Zmeny z posledných 24 hodín nemusia byť v API ešte zaznamenané.</p>
          </article>
          <article className="news-card">
            <span className="tag">Rozsah údajov</span>
            <h3>Nie všetky osobné údaje sú verejné</h3>
            <p>Informácie o konečných užívateľoch výhod sa zobrazujú len pri preukázanom oprávnenom záujme.</p>
          </article>
          <article className="news-card">
            <span className="tag">Licencia</span>
            <h3>Údaje RPO sú pod CC BY 4.0</h3>
            <p>Pri ďalšom použití údajov uveďte Register právnických osôb MV SR ako zdroj.</p>
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
          <a href="#o-portali">O portáli</a>
          <Link href="/firmy">Vyhľadávanie</Link>
          <a href="https://rpo.minv.sk/rpo-api-doc.html" target="_blank" rel="noreferrer">
            Dokumentácia API
          </a>
          <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">
            Licencia CC BY 4.0
          </a>
        </div>
      </footer>
    </main>
  );
}
