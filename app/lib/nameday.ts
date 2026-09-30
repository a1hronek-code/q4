import { slovakNameDays } from "./nameday-data";

function monthDayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}-${day}`;
}

/** Returns the names celebrating their "meniny" on the given date, if any. */
export function getNameDayNames(date: Date): string[] {
  return slovakNameDays[monthDayKey(date)] ?? [];
}

export function formatNameDayLabel(date: Date): string {
  const names = getNameDayNames(date);
  if (names.length === 0) return "Dnes nemá meniny nikto (štátny sviatok)";
  return names.join(", ");
}
