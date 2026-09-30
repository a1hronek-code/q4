import Link from "next/link";
import type { Metadata } from "next";
import { Breadcrumb } from "../components/Breadcrumb";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { formatNameDayLabel, getNameDayNames } from "../lib/nameday";
import { openGraphFor } from "../lib/seo";

const title = "Meninový kalendár na Slovensku | Q4.sk";
const description =
  "Denný meninový kalendár pre Slovensko s dnešnými a zajtrajšími meninami a prehľadom celého mesiaca.";

export const metadata: Metadata = {
  title,
  description,
  ...openGraphFor({ title, description, path: "/meniny" }),
};

export const revalidate = 3600;

const fullDateFormatter = new Intl.DateTimeFormat("sk-SK", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

const monthFormatter = new Intl.DateTimeFormat("sk-SK", { month: "long" });

const monthNames = Array.from({ length: 12 }, (_, index) =>
  monthFormatter.format(new Date(2026, index, 1)),
);

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getTomorrow(date: Date) {
  const tomorrow = new Date(date);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow;
}

function parseMonth(value: string | string[] | undefined, currentMonth: number) {
  const resolved = Array.isArray(value) ? value[0] : value;
  const parsed = Number(resolved);
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 12 ? parsed : currentMonth;
}

export default async function MeninyPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string | string[] }>;
}) {
  const resolvedSearchParams = await searchParams;
  const today = startOfDay(new Date());
  const currentMonth = today.getMonth() + 1;
  const selectedMonth = parseMonth(resolvedSearchParams.month, currentMonth);
  const selectedYear = today.getFullYear();
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const tomorrow = getTomorrow(today);

  return (
    <main className="page-shell intelligence-page">
      <SiteHeader />

      <section className="tool-section">
        <div className="detail-page-shell">
          <Breadcrumb items={[{ label: "Domov", href: "/" }, { label: "Meniny" }]} />

          <header className="detail-page-header">
            <span className="eyebrow">Slovenský kalendár</span>
            <h1>Meninový kalendár na Slovensku</h1>
            <p>
              Pozrite si, kto má meniny dnes a zajtra, alebo si prejdite celý mesiac deň po dni.
              Meninový kalendár vychádza zo slovenského občianskeho kalendára.
            </p>
          </header>

          <div className="info-grid">
            <div className="info-card">
              <span className="info-card-kicker">Dnes</span>
              <strong>{formatNameDayLabel(today)}</strong>
              <p>{fullDateFormatter.format(today)}</p>
            </div>

            <div className="info-card">
              <span className="info-card-kicker">Zajtra</span>
              <strong>
                {getNameDayNames(tomorrow).length > 0 ? getNameDayNames(tomorrow).join(", ") : "štátny sviatok"}
              </strong>
              <p>{fullDateFormatter.format(tomorrow)}</p>
            </div>

            <div className="info-card">
              <span className="info-card-kicker">Vybraný mesiac</span>
              <strong>{monthNames[selectedMonth - 1]}</strong>
              <p>Na navigáciu medzi mesiacmi použite odkazy nižšie.</p>
            </div>
          </div>

          <nav className="nameday-month-nav" aria-label="Výber mesiaca meninového kalendára">
            {monthNames.map((monthName, index) => {
              const monthNumber = index + 1;
              const isActive = monthNumber === selectedMonth;

              return (
                <Link
                  className={isActive ? "is-active" : undefined}
                  href={monthNumber === currentMonth ? "/meniny" : `/meniny?month=${monthNumber}`}
                  key={monthName}
                >
                  {monthName}
                </Link>
              );
            })}
          </nav>

          <div className="section-heading">
            <span className="eyebrow">Kalendár po dňoch</span>
            <h2>{monthNames[selectedMonth - 1]}</h2>
          </div>

          <div className="nameday-calendar">
            {Array.from({ length: daysInMonth }, (_, index) => {
              const day = index + 1;
              const date = new Date(selectedYear, selectedMonth - 1, day);
              const names = getNameDayNames(date);
              const isToday =
                date.getFullYear() === today.getFullYear()
                && date.getMonth() === today.getMonth()
                && date.getDate() === today.getDate();

              return (
                <div className={`nameday-day${isToday ? " is-today" : ""}`} key={`${selectedMonth}-${day}`}>
                  <strong>{day}. {monthNames[selectedMonth - 1]}</strong>
                  <span>{names.length > 0 ? names.join(", ") : "štátny sviatok"}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
