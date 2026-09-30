import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "../../components/Breadcrumb";
import { SiteFooter } from "../../components/SiteFooter";
import { SiteHeader } from "../../components/SiteHeader";
import { elections } from "../../lib/elections";
import { daysUntil } from "../../lib/holidays";

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

function formatCountdown(value: number) {
  if (value === 0) return "Voľby sa konajú dnes.";
  if (value === 1) return "Voľby sa konajú zajtra.";
  if (value === -1) return "Voľby sa konali včera.";
  if (value > 1) return `Do hlasovania zostáva ${value} ${formatDayCount(value)}.`;
  return `Voľby sa konali pred ${Math.abs(value)} ${formatDayCount(value)}.`;
}

function getElectionBySlug(slug: string) {
  return elections.find((election) => election.slug === slug) ?? null;
}

export function generateStaticParams() {
  return elections.map((election) => ({ slug: election.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const election = getElectionBySlug(slug);

  if (!election) return {};

  return {
    title: `${election.name} | Q4.sk`,
    description: `${election.description} Termín: ${formatDate(election.date)}.`,
  };
}

export default async function VolbyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const election = getElectionBySlug(slug);

  if (!election) notFound();

  const now = new Date();
  const remainingDays = daysUntil(election.date, now);

  return (
    <main className="page-shell intelligence-page">
      <SiteHeader />

      <section className="tool-section">
        <div className="detail-page-shell">
          <Breadcrumb
            items={[
              { label: "Domov", href: "/" },
              { label: "Voľby", href: "/volby" },
              { label: election.name },
            ]}
          />

          <header className="detail-page-header">
            <span className="eyebrow">Detail volieb</span>
            <h1>{election.name}</h1>
            <p>{election.description}</p>
          </header>

          <div className="info-grid">
            <div className="info-card">
              <span className="info-card-kicker">Termín hlasovania</span>
              <strong>{formatDate(election.date)}</strong>
              <p>Uvedený dátum predstavuje deň, na ktorý je naplánované hlasovanie.</p>
            </div>

            <div className="info-card">
              <span className="info-card-kicker">Stav termínu</span>
              <strong>{election.dateConfirmed ? "Oficiálne potvrdený" : "Predbežne odhadovaný"}</strong>
              <p>
                {election.dateConfirmed
                  ? "Termín je potvrdený a zodpovedá zverejnenému volebnému kalendáru."
                  : "Termín vychádza zo štandardného volebného cyklu a bude spresnený po oficiálnom vyhlásení."}
              </p>
            </div>

            <div className="info-card">
              <span className="info-card-kicker">Odpočet</span>
              <strong>{formatCountdown(remainingDays)}</strong>
              <p>Odpočet je počítaný voči dnešnému dátumu.</p>
            </div>
          </div>

          <p className="tool-hint">{formatCountdown(remainingDays)}</p>
          <p className="tool-hint">
            Zdroj termínu a ďalšie informácie:{" "}
            <a href={election.sourceUrl} target="_blank" rel="noreferrer">
              oficiálny zdroj
            </a>
            {" "}· <Link href="/volby">späť na prehľad všetkých volieb</Link>
          </p>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
