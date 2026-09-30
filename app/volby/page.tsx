import Link from "next/link";
import type { Metadata } from "next";
import { Breadcrumb } from "../components/Breadcrumb";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { elections, getNextElection } from "../lib/elections";
import { daysUntil } from "../lib/holidays";

export const metadata: Metadata = {
  title: "Najbližšie voľby na Slovensku | Q4.sk",
  description:
    "Prehľad najbližších slovenských volieb s termínmi, stavom potvrdenia a odpočtom do hlasovania.",
};

const dateFormatter = new Intl.DateTimeFormat("sk-SK", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function formatDate(value: string) {
  return dateFormatter.format(new Date(`${value}T12:00:00`));
}

function formatDayCount(value: number) {
  const abs = Math.abs(value);
  const mod10 = abs % 10;
  const mod100 = abs % 100;
  return mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14) ? "dni" : "dní";
}

function formatRelativeDays(value: number) {
  if (value === 0) return "Dnes prebieha hlasovanie.";
  if (value === 1) return "Voľby sú zajtra.";
  if (value === -1) return "Voľby prebehli včera.";
  if (value > 1) return `Do hlasovania zostáva ${value} ${formatDayCount(value)}.`;
  return `Voľby prebehli pred ${Math.abs(value)} ${formatDayCount(value)}.`;
}

export default function VolbyPage() {
  const now = new Date();
  const nextElection = getNextElection(now);

  return (
    <main className="page-shell intelligence-page">
      <SiteHeader />

      <section className="tool-section">
        <div className="detail-page-shell">
          <Breadcrumb items={[{ label: "Domov", href: "/" }, { label: "Voľby" }]} />

          <header className="detail-page-header">
            <span className="eyebrow">Volebný kalendár Slovenska</span>
            <h1>Najbližšie voľby na Slovensku</h1>
            <p>
              Sledujte potvrdené aj očakávané termíny celoštátnych a samosprávnych volieb.
              Každá karta obsahuje dátum, stav potvrdenia a rýchly odpočet do hlasovania.
              {nextElection
                ? ` Najbližšie sú momentálne ${nextElection.name.toLowerCase()} ${formatDate(nextElection.date)}.`
                : ""}
            </p>
          </header>

          <div className="info-grid">
            {elections.map((election) => {
              const remainingDays = daysUntil(election.date, now);

              return (
                <Link className="info-card" href={`/volby/${election.slug}`} key={election.slug}>
                  <span className="info-card-kicker">
                    {election.dateConfirmed ? "Potvrdený termín" : "Predbežný termín"}
                  </span>
                  <strong>{election.name}</strong>
                  <p>{formatDate(election.date)}</p>
                  <p>
                    {election.dateConfirmed
                      ? "Dátum je zverejnený ako potvrdený termín hlasovania."
                      : "Termín vychádza z volebného cyklu a čaká na oficiálne vyhlásenie."}
                  </p>
                  <span className="info-card-meta">{formatRelativeDays(remainingDays)}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
