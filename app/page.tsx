import Link from "next/link";
import { Suspense } from "react";
import { HighlightsWidget } from "./components/HighlightsWidget";
import { MarketOverview } from "./components/MarketOverview";
import { NewsCard } from "./components/NewsCard";
import { RelationshipPreview } from "./components/RelationshipPreview";
import { SearchPanel } from "./components/SearchPanel";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";
import { TodayWidget } from "./components/TodayWidget";
import { calculators } from "./lib/calculators";
import { popularCompanies } from "./lib/popular-companies";

const q4Features = [
  {
    number: "01",
    title: "Peníze a práca",
    description: "Kalkulačky mzdy, dávok, hypotéky a osobných financií",
    icon: "€",
    href: "/kalkulacky",
  },
  {
    number: "02",
    title: "Počasie",
    description: "Aktuálne počasie a predpoveď pre Bratislavu",
    icon: "☀",
    href: "/pocasie",
  },
  {
    number: "03",
    title: "Kalendár",
    description: "Štátne sviatky, meniny a školské prázdniny",
    icon: "▦",
    href: "/sviatky",
  },
  {
    number: "04",
    title: "Štatistiky",
    description: "Menové kurzy, ceny a odkazy na oficiálne slovenské dáta",
    icon: "#",
    href: "/statistiky",
  },
  {
    number: "08",
    title: "Slovensko naživo",
    description: "Živé počítadlá štátneho dlhu, obyvateľstva a ďalších čísel",
    icon: "❤",
    href: "/slovensko-teraz",
  },
  {
    number: "05",
    title: "Úrady a služby",
    description: "Overené odkazy na slovenské úrady a elektronické služby",
    icon: "▤",
    href: "/urady",
  },
  {
    number: "06",
    title: "Firmy a osoby",
    description: "Overovanie spoločností, štatutárov a väzieb",
    icon: "⌕",
    href: "/firmy",
  },
  {
    number: "07",
    title: "Obce a mestá",
    description: "Počty firiem a inštitúcií v konkrétnej obci podľa registra RPO",
    icon: "⌂",
    href: "/obce",
  },
];

export default function Home() {
  return (
    <main className="page-shell intelligence-page">
      <SiteHeader />

      <section className="hero intelligence-hero hero-compact">
        <div className="hero-copy">
          <span className="eyebrow">Praktický portál pre Slovensko</span>
          <h1>Všetko dôležité o Slovensku. Na jednom mieste.</h1>
          <p>
            Nájdite užitočné informácie pre každý deň – od počasia, sviatkov a kalkulačiek
            až po overené údaje o slovenských firmách a osobách.
          </p>
          <Suspense fallback={<div className="search-panel-wrap" aria-hidden="true" />}>
            <SearchPanel />
          </Suspense>
          <div className="hero-trustline">
            <span><i aria-hidden="true" />Informácie prispôsobené Slovensku</span>
            <span>Praktické nástroje a aktuálne údaje</span>
            <span>Firemné údaje z verejných registrov</span>
          </div>
        </div>
        <TodayWidget />
      </section>

      <section className="info-row" aria-label="Správy a dôležité termíny">
        <NewsCard />
        <HighlightsWidget />
      </section>

      <MarketOverview />

      <section className="capabilities-section" id="schopnosti">
        <div className="section-heading">
          <span className="eyebrow">Každodenné informácie pre Slovensko</span>
          <h2>Čo práve hľadáte?</h2>
          <p className="directory-intro">
            Prejdite priamo na prehľad, kalkulačku alebo kalendár, ktorý potrebujete.
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
          <span className="eyebrow">Firemná inteligencia Q4</span>
          <h2>Známe slovenské spoločnosti</h2>
          <p className="directory-intro">
            Otvorte profil spoločnosti alebo vyhľadajte inú firmu podľa názvu či IČO.
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
            Čistá mzda, hypotéka, dávky a ďalšie praktické prepočty pre Slovensko – vyberte kalkulačku.
          </p>
        </div>
        <div className="calculator-grid">
          {calculators.map((calculator) => (
            <Link key={calculator.slug} href={`/kalkulacky/${calculator.slug}`} className="calculator-card">
              <span className="calculator-icon" aria-hidden="true">{calculator.icon}</span>
              <strong>{calculator.title}</strong>
              <p>{calculator.description}</p>
              <span className="calculator-cta">Otvoriť kalkulačku <span aria-hidden="true">→</span></span>
            </Link>
          ))}
        </div>
      </section>

      <RelationshipPreview />

      <section className="data-note-section" id="zdroje-dat">
        <div>
          <span className="eyebrow">Transparentné zdroje</span>
          <h2>Údaje o firmách, ktoré si môžete overiť.</h2>
          <p>
            Firemné profily vychádzajú z verejných údajov Registra právnických osôb.
            Pri údajoch uvádzame dostupný zdroj a dátum aktualizácie.
          </p>
        </div>
        <a href="https://rpo.minv.sk/rpo-api-doc.html" target="_blank" rel="noreferrer">
          Metodika a zdrojové dáta <span aria-hidden="true">↗</span>
        </a>
      </section>

      <SiteFooter />
    </main>
  );
}
