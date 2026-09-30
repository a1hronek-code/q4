import Link from "next/link";
import { getNextElection } from "../lib/elections";
import { daysUntil, getNextHoliday } from "../lib/holidays";
import { getNextSchoolHoliday } from "../lib/school-holidays";

const dateFormatter = new Intl.DateTimeFormat("sk-SK", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function formatDate(iso: string): string {
  return dateFormatter.format(new Date(`${iso}T12:00:00`));
}

function formatDaysLeft(days: number): string {
  if (days === 0) return "dnes";
  if (days === 1) return "zajtra";
  return `o ${days} ${days >= 2 && days <= 4 ? "dni" : "dní"}`;
}

export function HighlightsWidget() {
  const now = new Date();
  const nextElection = getNextElection(now);
  const nextHoliday = getNextHoliday(now);
  const nextSchoolHoliday = getNextSchoolHoliday(now);

  return (
    <article className="highlights-widget" aria-labelledby="highlights-title">
      <div className="market-card-heading">
        <span className="market-icon">◈</span>
        <div>
          <h3 id="highlights-title">Najnovšie informácie</h3>
          <span>Voľby, sviatky a prázdniny na Slovensku</span>
        </div>
      </div>

      <ul className="highlights-list">
        {nextElection ? (
          <li>
            <Link href={`/volby/${nextElection.slug}`}>
              <span className="highlights-kicker">Najbližšie voľby</span>
              <strong>{nextElection.name}</strong>
              <span className="highlights-meta">
                {formatDate(nextElection.date)} · {formatDaysLeft(daysUntil(nextElection.date, now))}
                {!nextElection.dateConfirmed ? " · predbežný termín" : ""}
              </span>
            </Link>
          </li>
        ) : null}
        {nextHoliday ? (
          <li>
            <Link href={`/sviatky/${nextHoliday.slug}-${new Date(nextHoliday.date).getFullYear()}`}>
              <span className="highlights-kicker">Najbližší štátny sviatok</span>
              <strong>{nextHoliday.name}</strong>
              <span className="highlights-meta">
                {formatDate(nextHoliday.date)} · {formatDaysLeft(daysUntil(nextHoliday.date, now))}
              </span>
            </Link>
          </li>
        ) : null}
        {nextSchoolHoliday ? (
          <li>
            <Link href={`/prazdniny/${nextSchoolHoliday.slug}`}>
              <span className="highlights-kicker">Najbližšie školské prázdniny</span>
              <strong>{nextSchoolHoliday.name}</strong>
              <span className="highlights-meta">
                {formatDate(nextSchoolHoliday.start)} – {formatDate(nextSchoolHoliday.end)}
              </span>
            </Link>
          </li>
        ) : null}
      </ul>

      <div className="highlights-footer">
        <Link href="/volby">Všetky voľby</Link>
        <Link href="/sviatky">Kalendár sviatkov</Link>
        <Link href="/prazdniny">Kalendár prázdnin</Link>
      </div>
    </article>
  );
}
