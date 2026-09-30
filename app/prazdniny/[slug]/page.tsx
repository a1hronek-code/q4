import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "../../components/Breadcrumb";
import { SiteFooter } from "../../components/SiteFooter";
import { SiteHeader } from "../../components/SiteHeader";
import { schoolHolidays } from "../../lib/school-holidays";
import { daysUntil } from "../../lib/holidays";

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

function formatDayCount(value: number) {
  const abs = Math.abs(value);
  const mod10 = abs % 10;
  const mod100 = abs % 100;
  return mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14) ? "dni" : "dní";
}

function formatRelativeDays(value: number) {
  if (value === 0) return "Prázdniny sa začínajú dnes.";
  if (value === 1) return "Prázdniny sa začínajú zajtra.";
  if (value === -1) return "Prázdniny sa začali včera.";
  if (value > 1) return `Do začiatku zostáva ${value} ${formatDayCount(value)}.`;
  return `Prázdniny sa začali pred ${Math.abs(value)} ${formatDayCount(value)}.`;
}

function getHolidayBySlug(slug: string) {
  return schoolHolidays.find((holiday) => holiday.slug === slug) ?? null;
}

function getDurationInDays(start: string, end: string) {
  const [startYear, startMonth, startDay] = start.split("-").map(Number);
  const [endYear, endMonth, endDay] = end.split("-").map(Number);
  const startUtc = Date.UTC(startYear, startMonth - 1, startDay);
  const endUtc = Date.UTC(endYear, endMonth - 1, endDay);
  return Math.round((endUtc - startUtc) / 86_400_000) + 1;
}

export function generateStaticParams() {
  return schoolHolidays.map((holiday) => ({ slug: holiday.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const holiday = getHolidayBySlug(slug);

  if (!holiday) return {};

  return {
    title: `${holiday.name} | Q4.sk`,
    description: `Termín školských prázdnin: ${formatRange(holiday.start, holiday.end)}.`,
  };
}

export default async function PrazdninyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const holiday = getHolidayBySlug(slug);

  if (!holiday) notFound();

  const remainingDays = daysUntil(holiday.start, new Date());
  const duration = getDurationInDays(holiday.start, holiday.end);

  return (
    <main className="page-shell intelligence-page">
      <SiteHeader />

      <section className="tool-section">
        <div className="detail-page-shell">
          <Breadcrumb
            items={[
              { label: "Domov", href: "/" },
              { label: "Prázdniny", href: "/prazdniny" },
              { label: holiday.name },
            ]}
          />

          <header className="detail-page-header">
            <span className="eyebrow">Detail prázdnin</span>
            <h1>{holiday.name}</h1>
            <p>
              Termín voľna je {formatRange(holiday.start, holiday.end)}.
              {holiday.note ? ` ${holiday.note}` : ""}
            </p>
          </header>

          <div className="info-grid">
            <div className="info-card">
              <span className="info-card-kicker">Termín</span>
              <strong>{formatRange(holiday.start, holiday.end)}</strong>
              <p>Presný rozsah dní pracovného voľna podľa školského kalendára.</p>
            </div>

            <div className="info-card">
              <span className="info-card-kicker">Začiatok</span>
              <strong>{formatRelativeDays(remainingDays)}</strong>
              <p>Odpočet sa vzťahuje na prvý deň prázdnin.</p>
            </div>

            <div className="info-card">
              <span className="info-card-kicker">Dĺžka voľna</span>
              <strong>{duration} dní</strong>
              <p>{holiday.note ?? "Termín platí pre uvedené školy alebo regióny."}</p>
            </div>
          </div>

          <p className="tool-hint">
            <Link href="/prazdniny">← Späť na prehľad školských prázdnin</Link>
          </p>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
