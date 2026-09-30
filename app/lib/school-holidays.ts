export type SchoolHoliday = {
  slug: string;
  name: string;
  start: string; // ISO date, first free day
  end: string; // ISO date, last free day
  note?: string;
};

// Slovak school-holiday calendar for 2026/2027 (Ministerstvo školstva).
// Spring break ("jarné prázdniny") dates depend on region.
export const schoolHolidays: SchoolHoliday[] = [
  {
    slug: "jesenne-prazdniny-2026",
    name: "Jesenné prázdniny",
    start: "2026-10-29",
    end: "2026-10-30",
  },
  {
    slug: "vianocne-prazdniny-2026",
    name: "Vianočné prázdniny",
    start: "2026-12-23",
    end: "2027-01-07",
  },
  {
    slug: "polrocne-prazdniny-2027",
    name: "Polročné prázdniny",
    start: "2027-02-01",
    end: "2027-02-01",
  },
  {
    slug: "jarne-prazdniny-2027-bb-za-tn",
    name: "Jarné prázdniny — Banskobystrický, Žilinský, Trenčiansky kraj",
    start: "2027-02-15",
    end: "2027-02-19",
    note: "Ostatné kraje majú jarné prázdniny v iných termínoch.",
  },
  {
    slug: "jarne-prazdniny-2027-ke-po",
    name: "Jarné prázdniny — Košický, Prešovský kraj",
    start: "2027-02-22",
    end: "2027-02-26",
    note: "Ostatné kraje majú jarné prázdniny v iných termínoch.",
  },
  {
    slug: "jarne-prazdniny-2027-ba-nr-tt",
    name: "Jarné prázdniny — Bratislavský, Nitriansky, Trnavský kraj",
    start: "2027-03-01",
    end: "2027-03-05",
    note: "Ostatné kraje majú jarné prázdniny v iných termínoch.",
  },
  {
    slug: "velkonocne-prazdniny-2027",
    name: "Veľkonočné prázdniny",
    start: "2027-03-25",
    end: "2027-03-30",
  },
  {
    slug: "letne-prazdniny-2027",
    name: "Letné prázdniny",
    start: "2027-07-01",
    end: "2027-08-31",
  },
];

/** Returns the next school holiday whose last free day is still ahead of `from`. */
export function getNextSchoolHoliday(from: Date): SchoolHoliday | null {
  const todayIso = from.toISOString().slice(0, 10);
  return schoolHolidays.find((holiday) => holiday.end >= todayIso) ?? null;
}
