export type ElectionEvent = {
  slug: string;
  name: string;
  date: string; // ISO date
  dateConfirmed: boolean;
  description: string;
  sourceUrl: string;
};

// Known and expected upcoming Slovak elections. Dates for elections that
// have not yet been formally called are best-effort estimates based on the
// standard election cycle and public reporting; `dateConfirmed` marks that.
export const elections: ElectionEvent[] = [
  {
    slug: "komunalne-a-krajske-2026",
    name: "Komunálne a krajské voľby 2026",
    date: "2026-10-24",
    dateConfirmed: true,
    description:
      "Voľby starostov, primátorov a poslancov obecných a mestských zastupiteľstiev spolu s voľbami do vyšších územných celkov (VÚC).",
    sourceUrl: "https://www.minv.sk/?volby-oso",
  },
  {
    slug: "parlamentne-2027",
    name: "Voľby do Národnej rady SR 2027",
    date: "2027-09-25",
    dateConfirmed: false,
    description:
      "Riadne parlamentné voľby sa podľa štandardného štvorročného cyklu očakávajú na jeseň 2027. Presný termín vyhlási predseda Národnej rady SR najneskôr 110 dní vopred.",
    sourceUrl: "https://www.nrsr.sk/",
  },
  {
    slug: "prezidentske-2029",
    name: "Prezidentské voľby 2029",
    date: "2029-03-15",
    dateConfirmed: false,
    description:
      "Voľba prezidenta Slovenskej republiky prebieha raz za päť rokov; posledná sa konala v roku 2024, ďalšia sa preto očakáva na jar 2029.",
    sourceUrl: "https://www.minv.sk/?volby-prezident",
  },
];

/** Returns the next election that has not yet taken place, relative to `from`. */
export function getNextElection(from: Date): ElectionEvent | null {
  const todayIso = from.toISOString().slice(0, 10);
  return elections.find((election) => election.date >= todayIso) ?? null;
}
