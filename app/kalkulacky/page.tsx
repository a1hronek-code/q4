import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "../components/Breadcrumb";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { calculators } from "../lib/calculators";

export const metadata: Metadata = {
  title: "Kalkulačky | Q4.sk",
  description:
    "Praktické kalkulačky pre čistú mzdu, hypotéku, sociálne dávky a ďalšie osobné financie na Slovensku.",
};

export default function CalculatorsIndexPage() {
  return (
    <main className="page-shell intelligence-page">
      <SiteHeader />

      <div className="detail-page-shell">
        <Breadcrumb items={[{ label: "Domov", href: "/" }, { label: "Kalkulačky" }]} />

        <section className="detail-page-header">
          <span className="eyebrow">Osobné financie</span>
          <h1>Kalkulačky</h1>
          <p>
            Praktické prepočty pre čistú mzdu, splátku hypotéky, dávky aj pracovnoprávne
            nároky – všetko prehľadne na jednom mieste.
          </p>
        </section>

        <section aria-label="Prehľad kalkulačiek">
          <div className="info-grid">
            {calculators.map((calculator) => (
              <Link
                key={calculator.slug}
                href={`/kalkulacky/${calculator.slug}`}
                className="info-card"
              >
                <span aria-hidden="true" style={{ fontSize: "1.5rem", lineHeight: 1 }}>
                  {calculator.icon}
                </span>
                <span className="info-card-kicker">Kalkulačka</span>
                <strong>{calculator.shortTitle}</strong>
                <p>{calculator.description}</p>
                <span className="info-card-meta">Otvoriť výpočet →</span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <SiteFooter />
    </main>
  );
}
