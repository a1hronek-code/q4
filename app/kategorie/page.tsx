import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "../components/Breadcrumb";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { openGraphFor } from "../lib/seo";

const title = "Rubriky a praktické informácie o Slovensku | Q4.sk";
const description =
  "Prejdite si praktické slovenské informácie o práci, financiách, počasí, kalendári, úradoch a firmách.";

export const metadata: Metadata = {
  title,
  description,
  ...openGraphFor({ title, description, path: "/kategorie" }),
};

const categories = [
  {
    title: "Peniaze a práca",
    description: "Čistá mzda, dávky, dôchodok, hypotéka a ďalšie orientačné výpočty.",
    href: "/kalkulacky",
    icon: "€",
  },
  {
    title: "Počasie",
    description: "Aktuálne počasie a krátkodobá predpoveď pre Bratislavu.",
    href: "/pocasie",
    icon: "☀",
  },
  {
    title: "Kalendár a sviatky",
    description: "Štátne sviatky, dni pracovného pokoja, meniny a školské prázdniny.",
    href: "/sviatky",
    icon: "▦",
  },
  {
    title: "Voľby a verejné dianie",
    description: "Prehľad známych a plánovaných volebných termínov.",
    href: "/volby",
    icon: "✓",
  },
  {
    title: "Štatistiky",
    description: "Menové kurzy, ceny a odkazy na oficiálne štatistické zdroje.",
    href: "/statistiky",
    icon: "#",
  },
  {
    title: "Slovensko naživo",
    description: "Živé počítadlá štátneho dlhu, obyvateľstva, narodených a ďalších čísel.",
    href: "/slovensko-teraz",
    icon: "❤",
  },
  {
    title: "Úrady a verejné služby",
    description: "Oficiálne portály pre dane, sociálne poistenie a elektronické služby.",
    href: "/urady",
    icon: "▤",
  },
  {
    title: "Firmy a osoby",
    description: "Vyhľadávanie slovenských subjektov, štatutárov a obchodných väzieb.",
    href: "/firmy",
    icon: "⌕",
  },
  {
    title: "Obce a mestá",
    description: "Počty registrovaných firiem a inštitúcií podľa obce, z Registra právnických osôb.",
    href: "/obce",
    icon: "⌂",
  },
  {
    title: "Kurzy a ceny",
    description: "Referenčné kurzy mien, ceny palív a čerpacie stanice.",
    href: "/#trhy",
    icon: "↗",
  },
];

export default function KategoriePage() {
  return (
    <main className="page-shell intelligence-page">
      <SiteHeader />
      <section className="tool-section">
        <div className="detail-page-shell">
          <Breadcrumb items={[{ label: "Domov", href: "/" }, { label: "Rubriky" }]} />
          <header className="detail-page-header">
            <span className="eyebrow">Q4.sk</span>
            <h1>Praktické informácie pre život na Slovensku</h1>
            <p>
              Vyberte si tému a prejdite na užitočné prehľady, kalkulačky,
              kalendáre a verejne dostupné údaje.
            </p>
          </header>
          <div className="info-grid">
            {categories.map((category) => (
              <Link className="info-card" href={category.href} key={category.title}>
                <span className="info-card-kicker">{category.icon} · Rubrika</span>
                <strong>{category.title}</strong>
                <p>{category.description}</p>
                <span className="info-card-meta">Otvoriť rubriku →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
