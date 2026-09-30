export type Holiday = {
  date: string; // ISO date, YYYY-MM-DD
  name: string;
  slug: string;
};

// Fixed and Easter-derived Slovak "štátne sviatky a dni pracovného pokoja"
// (Zákon č. 241/1993 Z. z.) for the current and following year.
export const holidays: Holiday[] = [
  { date: "2026-01-01", name: "Deň vzniku Slovenskej republiky", slug: "den-vzniku-sr" },
  { date: "2026-01-06", name: "Zjavenie Pána (Traja králi)", slug: "zjavenie-pana" },
  { date: "2026-04-03", name: "Veľký piatok", slug: "velky-piatok" },
  { date: "2026-04-06", name: "Veľkonočný pondelok", slug: "velkonocny-pondelok" },
  { date: "2026-05-01", name: "Sviatok práce", slug: "sviatok-prace" },
  { date: "2026-05-08", name: "Deň víťazstva nad fašizmom", slug: "den-vitazstva-nad-fasizmom" },
  { date: "2026-07-05", name: "Sviatok svätého Cyrila a Metoda", slug: "cyril-a-metod" },
  { date: "2026-08-29", name: "Výročie Slovenského národného povstania", slug: "snp" },
  { date: "2026-09-01", name: "Deň Ústavy Slovenskej republiky", slug: "den-ustavy-sr" },
  { date: "2026-09-15", name: "Sedembolestná Panna Mária", slug: "sedembolestna-panna-maria" },
  { date: "2026-11-01", name: "Sviatok všetkých svätých", slug: "vsetci-svati" },
  { date: "2026-11-17", name: "Deň boja za slobodu a demokraciu", slug: "den-boja-za-slobodu-a-demokraciu" },
  { date: "2026-12-24", name: "Štedrý deň", slug: "stedry-den" },
  { date: "2026-12-25", name: "Prvý sviatok vianočný", slug: "prvy-sviatok-vianocny" },
  { date: "2026-12-26", name: "Druhý sviatok vianočný", slug: "druhy-sviatok-vianocny" },

  { date: "2027-01-01", name: "Deň vzniku Slovenskej republiky", slug: "den-vzniku-sr" },
  { date: "2027-01-06", name: "Zjavenie Pána (Traja králi)", slug: "zjavenie-pana" },
  { date: "2027-03-26", name: "Veľký piatok", slug: "velky-piatok" },
  { date: "2027-03-29", name: "Veľkonočný pondelok", slug: "velkonocny-pondelok" },
  { date: "2027-05-01", name: "Sviatok práce", slug: "sviatok-prace" },
  { date: "2027-05-08", name: "Deň víťazstva nad fašizmom", slug: "den-vitazstva-nad-fasizmom" },
  { date: "2027-07-05", name: "Sviatok svätého Cyrila a Metoda", slug: "cyril-a-metod" },
  { date: "2027-08-29", name: "Výročie Slovenského národného povstania", slug: "snp" },
  { date: "2027-09-01", name: "Deň Ústavy Slovenskej republiky", slug: "den-ustavy-sr" },
  { date: "2027-09-15", name: "Sedembolestná Panna Mária", slug: "sedembolestna-panna-maria" },
  { date: "2027-11-01", name: "Sviatok všetkých svätých", slug: "vsetci-svati" },
  { date: "2027-11-17", name: "Deň boja za slobodu a demokraciu", slug: "den-boja-za-slobodu-a-demokraciu" },
  { date: "2027-12-24", name: "Štedrý deň", slug: "stedry-den" },
  { date: "2027-12-25", name: "Prvý sviatok vianočný", slug: "prvy-sviatok-vianocny" },
  { date: "2027-12-26", name: "Druhý sviatok vianočný", slug: "druhy-sviatok-vianocny" },
];

/** Returns the next upcoming holiday strictly after `from` (inclusive of today). */
export function getNextHoliday(from: Date): Holiday | null {
  const todayIso = from.toISOString().slice(0, 10);
  return holidays.find((holiday) => holiday.date >= todayIso) ?? null;
}

export function getHolidaysForYear(year: number): Holiday[] {
  return holidays.filter((holiday) => holiday.date.startsWith(String(year)));
}

export function daysUntil(dateIso: string, from: Date): number {
  const target = new Date(`${dateIso}T00:00:00`);
  const start = new Date(from.toISOString().slice(0, 10) + "T00:00:00");
  return Math.round((target.getTime() - start.getTime()) / 86_400_000);
}
