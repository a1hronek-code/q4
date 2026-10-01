"use client";

import { useEffect, useState } from "react";
import type { LiveStat } from "../lib/live-stats";

function secondsInYear(year: number): number {
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  return (isLeap ? 366 : 365) * 24 * 3600;
}

/** Computes the current display value for a given stat, as of `nowMs`. */
function computeValue(stat: LiveStat, nowMs: number): number {
  if (stat.mode === "stock") {
    const elapsedSeconds = (nowMs - Date.parse(stat.referenceIso)) / 1000;
    return stat.baseValue + stat.perSecond * elapsedSeconds;
  }
  if (stat.mode === "flow-yearly") {
    const now = new Date(nowMs);
    const yearStart = new Date(now.getFullYear(), 0, 1).getTime();
    const elapsedSeconds = (nowMs - yearStart) / 1000;
    const ratePerSecond = stat.annualTotal / secondsInYear(now.getFullYear());
    return ratePerSecond * elapsedSeconds;
  }
  // heartbeat-today: cumulative beats since local midnight.
  const now = new Date(nowMs);
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const elapsedSeconds = (nowMs - midnight) / 1000;
  return (stat.population * stat.beatsPerMinute * elapsedSeconds) / 60;
}

function formatValue(value: number, decimals: number): string {
  return value.toLocaleString("sk-SK", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** A single "worldometer"-style live counter. Server-rendered value is the
 * deterministic value at render time; it then ticks forward on the client
 * using the browser clock, so the very first paint and the first tick can
 * legitimately differ (the page was simply rendered a moment earlier). */
export function LiveStatCounter({ stat }: { stat: LiveStat }) {
  const [value, setValue] = useState(() => computeValue(stat, Date.now()));

  useEffect(() => {
    const interval = setInterval(() => {
      setValue(computeValue(stat, Date.now()));
    }, 120);
    return () => clearInterval(interval);
    // `stat` is a static config object from app/lib/live-stats.ts; re-running
    // the effect per render is unnecessary.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stat.id]);

  return (
    <article className="live-stat-card">
      <span className="live-stat-icon" aria-hidden="true">{stat.icon}</span>
      <h3>{stat.title}</h3>
      <p className="live-stat-value" suppressHydrationWarning>
        {formatValue(value, stat.decimals)}
        {stat.unit ? <span className="live-stat-unit"> {stat.unit}</span> : null}
      </p>
      <p className="live-stat-note">{stat.note}</p>
      <a className="live-stat-source" href={stat.sourceUrl} target="_blank" rel="noreferrer">
        Zdroj: {stat.sourceLabel} ({stat.sourceDate}) ↗
      </a>
    </article>
  );
}
