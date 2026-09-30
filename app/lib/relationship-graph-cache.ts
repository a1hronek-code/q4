import type { RpoCompanyGraph } from "./rpo";
import slovnaft from "../data/relationship-graphs/1003617.json";
import eset from "../data/relationship-graphs/937053.json";
import tatraBanka from "../data/relationship-graphs/4445617.json";
import jtFinanceGroup from "../data/relationship-graphs/1023969.json";
import orangeSlovensko from "../data/relationship-graphs/1009309.json";
import slovenskaSporitelna from "../data/relationship-graphs/464669.json";
import easyCredit from "../data/relationship-graphs/17630748.json";

// Precomputed relationship-graph snapshots for a curated set of popular
// companies (see scripts/build-relationship-graphs.mjs). The 14.9GB local
// RPO database can't be deployed to production, so these small committed
// JSON snapshots let production still show "Grafické väzby" for companies
// where it matters most, instead of silently hiding the whole section.
// Statically imported (rather than read from disk at runtime) so Next.js
// bundles them into the serverless deployment output.
type CachedGraphSnapshot = { id: number; generatedAt: string; graph: RpoCompanyGraph };

const snapshots: CachedGraphSnapshot[] = [
  slovnaft,
  eset,
  tatraBanka,
  jtFinanceGroup,
  orangeSlovensko,
  slovenskaSporitelna,
  easyCredit,
] as CachedGraphSnapshot[];

const cachedGraphsById = new Map<number, { generatedAt: string; graph: RpoCompanyGraph }>(
  snapshots.map((snapshot) => [snapshot.id, { generatedAt: snapshot.generatedAt, graph: snapshot.graph }]),
);

export function getCachedRelationshipGraph(
  id: number,
): { generatedAt: string; graph: RpoCompanyGraph } | null {
  return cachedGraphsById.get(id) ?? null;
}
