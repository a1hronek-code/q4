import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "../components/Breadcrumb";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { openGraphFor } from "../lib/seo";

const title = "Štatistiky Slovenska a verejné údaje | Q4.sk";
const description =
  "Prehľad slovenských verejných štatistík, kurzov, cien a oficiálnych zdrojov údajov.";

export const metadata: Metadata = {
  title,
  description,
  ...openGraphFor({ title, description, path: "/statistiky" }),
};

const q4Data = [
  {
    title: "Menové kurzy",
    description: "Referenčné kurzy eura voči svetovým menám z feedu NBS a ECB.",
    href: "/#trhy",
    label: "Aktuálne údaje",
  },
  {
    title: "Ceny palív",
    description: "Týždenné priemerné ceny benzínu a nafty na Slovensku.",
    href: "/#trhy",
    label: "Týždenný prehľad",
  },
  {
    title: "Počasie",
    description: "Aktuálne podmienky a krátkodobá predpoveď pre Bratislavu.",
    href: "/pocasie",
    label: "Aktualizované priebežne",
  },
];

const officialSources = [
  {
    title: "Štatistický úrad SR",
    description:
      "Oficiálne údaje o obyvateľstve, cenách, mzdách, zamestnanosti, ekonomike a regiónoch.",
    href: "https://www.statistics.sk/",
    label: "Národné štatistiky",
  },
  {
    title: "Štatistické dáta ŠÚ SR",
    description:
      "Katalóg a prístup k štatistickým tabuľkám. Pri údajoch si overte obdobie a stav konkrétneho datasetu.",
    href: "https://data.statistics.sk/api/",
    label: "Dátový katalóg",
  },
  {
    title: "Eurostat",
    description:
      "Porovnateľné údaje Slovenska a ostatných krajín Európskej únie vrátane regiónov.",
    href: "https://ec.europa.eu/eurostat/",
    label: "Európske porovnania",
  },
  {
    title: "Národná banka Slovenska",
    description:
      "Menová a finančná štatistika a referenčné kurzy publikované spolu s Európskou centrálnou bankou.",
    href: "https://nbs.sk/",
    label: "Finančné údaje",
  },
];

export default function StatistikyPage() {
  return (
    <main className="page-shell intelligence-page">
      <SiteHeader />
      <section className="tool-section">
        <div className="detail-page-shell">
          <Breadcrumb items={[{ label: "Domov", href: "/" }, { label: "Štatistiky" }]} />
          <header className="detail-page-header">
            <span className="eyebrow">Slovensko v číslach</span>
            <h1>Štatistiky a verejné údaje o Slovensku</h1>
            <p>
              Na jednom mieste nájdete živé prehľady Q4 aj odkazy na oficiálne
              štatistické zdroje. Pri každom externom datasete si skontrolujte
              dátum aktualizácie, metodiku a licenciu.
            </p>
          </header>

          <section aria-labelledby="q4-live-data">
            <div className="section-heading">
              <span className="eyebrow">Údaje na Q4.sk</span>
              <h2 id="q4-live-data">Aktuálne prehľady</h2>
            </div>
            <div className="info-grid">
              {q4Data.map((item) => (
                <Link className="info-card" href={item.href} key={item.title}>
                  <span className="info-card-kicker">{item.label}</span>
                  <strong>{item.title}</strong>
                  <p>{item.description}</p>
                  <span className="info-card-meta">Otvoriť prehľad →</span>
                </Link>
              ))}
            </div>
          </section>

          <section aria-labelledby="official-statistics">
            <div className="section-heading">
              <span className="eyebrow">Primárne zdroje</span>
              <h2 id="official-statistics">Oficiálne štatistiky a dátové katalógy</h2>
            </div>
            <div className="info-grid">
              {officialSources.map((source) => (
                <a
                  className="info-card"
                  href={source.href}
                  key={source.title}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="info-card-kicker">{source.label}</span>
                  <strong>{source.title}</strong>
                  <p>{source.description}</p>
                  <span className="info-card-meta">Otvoriť oficiálny zdroj ↗</span>
                </a>
              ))}
            </div>
          </section>

          <p className="data-source-note">
            Q4.sk neuvádza neoverené odhady ako oficiálne štatistiky. Rozhranie
            DATAcube Štatistického úradu SR prechádza zmenou; nové automatické
            napojenia pridáme až po potvrdení stabilného endpointu a podmienok
            použitia konkrétneho datasetu.
          </p>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
