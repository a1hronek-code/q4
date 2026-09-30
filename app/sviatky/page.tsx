import Link from "next/link";
import type { Metadata } from "next";
import { Breadcrumb } from "../components/Breadcrumb";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { getHolidaysForYear } from "../lib/holidays";

export const metadata: Metadata = {
  title: "Štátne sviatky na Slovensku 2026/2027 | Q4.sk",
  description:
    "Kalendár slovenských štátnych sviatkov a dní pracovného pokoja pre roky 2026 a 2027.",
};

const dateFormatter = new Intl.DateTimeFormat("sk-SK", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function formatDate(value: string) {
  return dateFormatter.format(new Date(`${value}T12:00:00`));
}

const years = [2026, 2027] as const;

export default function SviatkyPage() {
  return (
    <main className="page-shell intelligence-page">
      <SiteHeader />

      <section className="tool-section">
        <div className="detail-page-shell">
          <Breadcrumb items={[{ label: "Domov", href: "/" }, { label: "Sviatky" }]} />

          <header className="detail-page-header">
            <span className="eyebrow">Kalendár sviatkov</span>
            <h1>Štátne sviatky na Slovensku v rokoch 2026 a 2027</h1>
            <p>
              Prehľad zahŕňa všetky štátne sviatky a dni pracovného pokoja podľa slovenského
              kalendára. Každý sviatok má vlastnú detailnú stránku s významom a odpočtom do
              konkrétneho dátumu.
            </p>
          </header>

          {years.map((year) => {
            const holidays = getHolidaysForYear(year);

            return (
              <section key={year}>
                <div className="section-heading">
                  <span className="eyebrow">Rok {year}</span>
                  <h2>{year}</h2>
                </div>

                <div className="info-grid">
                  {holidays.map((holiday) => (
                    <Link
                      className="info-card"
                      href={`/sviatky/${holiday.slug}-${year}`}
                      key={`${holiday.slug}-${holiday.date}`}
                    >
                      <span className="info-card-kicker">Štátny sviatok alebo deň pracovného pokoja</span>
                      <strong>{holiday.name}</strong>
                      <p>{formatDate(holiday.date)}</p>
                      <span className="info-card-meta">Zobraziť význam sviatku</span>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
