import Link from "next/link";
import type { Metadata } from "next";
import { Breadcrumb } from "../components/Breadcrumb";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { schoolHolidays } from "../lib/school-holidays";

export const metadata: Metadata = {
  title: "Školské prázdniny 2026/2027 | Q4.sk",
  description:
    "Kalendár školských prázdnin na Slovensku pre školský rok 2026/2027 vrátane regionálnych jarných prázdnin.",
};

const dateFormatter = new Intl.DateTimeFormat("sk-SK", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function formatDate(value: string) {
  return dateFormatter.format(new Date(`${value}T12:00:00`));
}

function formatRange(start: string, end: string) {
  if (start === end) return formatDate(start);
  return `${formatDate(start)} – ${formatDate(end)}`;
}

export default function PrazdninyPage() {
  return (
    <main className="page-shell intelligence-page">
      <SiteHeader />

      <section className="tool-section">
        <div className="detail-page-shell">
          <Breadcrumb items={[{ label: "Domov", href: "/" }, { label: "Prázdniny" }]} />

          <header className="detail-page-header">
            <span className="eyebrow">Školský kalendár</span>
            <h1>Školské prázdniny 2026/2027</h1>
            <p>
              Prehľad termínov školských prázdnin na Slovensku vrátane regionálne rozdelených
              jarných prázdnin. Na detailnej stránke každého termínu nájdete presné dátumy a
              odpočet do začiatku voľna.
            </p>
          </header>

          <div className="info-grid">
            {schoolHolidays.map((holiday) => (
              <Link className="info-card" href={`/prazdniny/${holiday.slug}`} key={holiday.slug}>
                <span className="info-card-kicker">Školské voľno</span>
                <strong>{holiday.name}</strong>
                <p>{formatRange(holiday.start, holiday.end)}</p>
                {holiday.note ? <p>{holiday.note}</p> : null}
                <span className="info-card-meta">Zobraziť detail termínu</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
