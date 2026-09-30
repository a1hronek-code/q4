import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumb } from "../components/Breadcrumb";
import { SearchPanel } from "../components/SearchPanel";
import { breadcrumbJsonLd, jsonLdScriptProps, openGraphFor } from "../lib/seo";

const title = "Vyhľadávanie firiem v registri RPO | Q4.sk";
const description =
  "Vyhľadajte slovenskú firmu, živnostníka alebo inštitúciu podľa názvu, IČO, sídla či predmetu činnosti v registri právnických osôb MV SR.";
const breadcrumbItems = [{ label: "Domov", href: "/" }, { label: "Firmy" }];

export const metadata: Metadata = {
  title,
  description,
  ...openGraphFor({ title, description, path: "/firmy" }),
};

export default function CompanyDirectoryPage() {
  return (
    <main className="page-shell">
      <script {...jsonLdScriptProps(breadcrumbJsonLd(breadcrumbItems))} />
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
        <Breadcrumb items={breadcrumbItems} />

        <div className="section-heading">
          <span className="eyebrow">Register právnických osôb MV SR</span>
          <h1>Vyhľadajte firmu alebo iný subjekt</h1>
          <p className="directory-intro">
            Vyhľadávanie používa lokálny fulltextový index oficiálneho exportu RPO.
            Hľadať môžete podľa názvu, IČO, sídla alebo činnosti.
          </p>
        </div>

        <Suspense fallback={<div className="search-panel-wrap" aria-hidden="true" />}>
          <SearchPanel />
        </Suspense>
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
