import Link from "next/link";
import type { RpoCompanyGraph, RpoSubject } from "../lib/rpo";
import { companyProfilePath } from "../lib/seo";

type RelationshipGraphProps = {
  company: Pick<RpoSubject, "id" | "name" | "ico">;
  graph: RpoCompanyGraph;
};

function shorten(value: string, limit: number): string {
  return value.length > limit ? `${value.slice(0, limit - 1)}…` : value;
}

export function RelationshipGraph({ company, graph }: RelationshipGraphProps) {
  if (graph.people.length === 0) {
    return (
      <section className="profile-activity relationship-section">
        <span className="eyebrow">Grafické väzby</span>
        <h2>V registri nie sú uvedené osoby prepojené so subjektom</h2>
        <p>Graf zobrazuje osoby a súvisiace firmy uvedené v zázname RPO.</p>
      </section>
    );
  }

  const width = 1120;
  const rowGap = 84;
  const height = Math.max(480, (Math.max(graph.people.length, graph.companies.length, 1) + 1) * rowGap);
  const personRows = graph.people.map((person, index) => ({
    person,
    y: ((index + 1) * height) / (graph.people.length + 1),
  }));
  const companyRows = graph.companies.map((relatedCompany, index) => ({
    company: relatedCompany,
    y: ((index + 1) * height) / (graph.companies.length + 1),
  }));
  const personY = new Map(personRows.map(({ person, y }) => [person.id, y]));
  const companyY = new Map(companyRows.map(({ company: relatedCompany, y }) => [relatedCompany.id, y]));
  const rootY = height / 2;

  return (
    <section className="profile-activity relationship-section" aria-labelledby="relationship-title">
      <div className="relationship-heading">
        <div>
          <span className="eyebrow">Sieť osôb a firiem</span>
          <h2 id="relationship-title">Grafické väzby</h2>
          <p>
            Subjekty sú prepojené cez osoby uvedené v štatutárnych orgánoch alebo medzi
            zainteresovanými osobami v registri.
          </p>
        </div>
        <div className="relationship-legend" aria-label="Legenda grafu">
          <span><i className="legend-company" /> Firma</span>
          <span><i className="legend-person" /> Osoba</span>
          <span><i className="legend-current" /> Aktívna väzba</span>
          <span><i className="legend-historical" /> Historická väzba</span>
        </div>
      </div>

      <div className="relationship-canvas">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={`Graf väzieb subjektu ${company.name}`}
        >
          <defs>
            <linearGradient id="relationship-line" x1="0" x2="1">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
          </defs>

          {graph.relationships.map((relationship) => {
            const personPosition = personY.get(relationship.personId);
            const relatedCompanyPosition = companyY.get(relationship.companyId);
            const isRoot = relationship.companyId === company.id;
            const startX = isRoot ? 276 : 696;
            const endX = isRoot ? 424 : 844;
            const startY = isRoot ? rootY : personPosition;
            const endY = isRoot ? personPosition : relatedCompanyPosition;
            if (startY === undefined || endY === undefined) return null;

            return (
              <path
                key={`${relationship.personId}-${relationship.companyId}`}
                d={`M ${startX} ${startY} C ${startX + 56} ${startY}, ${endX - 56} ${endY}, ${endX} ${endY}`}
                className={`relationship-edge${relationship.active ? "" : " is-historical"}`}
                aria-label={`${relationship.role || "Väzba v registri"} · ${relationship.active ? "aktívna" : "historická"}`}
              />
            );
          })}

          <Link href={companyProfilePath(company.id, company.name)} className="relationship-node-link">
            <g className="relationship-node company-node" transform={`translate(24 ${rootY - 38})`}>
              <rect width="252" height="76" rx="16" />
              <text x="16" y="31" className="relationship-node-title">{shorten(company.name, 27)}</text>
              <text x="16" y="54" className="relationship-node-detail">
                {company.ico ? `IČO ${company.ico}` : "Subjekt RPO"}
              </text>
            </g>
          </Link>

          {personRows.map(({ person, y }) => (
            <Link
              key={person.id}
              href={`/firmy?query=${encodeURIComponent(person.name)}`}
              className="relationship-node-link"
              aria-label={`Vyhľadať osobu ${person.name} v registri`}
              title={`${person.name}${person.roles.length ? ` · ${person.roles.join(", ")}` : ""}`}
            >
              <g
                className={`relationship-node person-node${person.active ? "" : " is-historical"}`}
                transform={`translate(424 ${y - 30})`}
              >
                <rect width="272" height="60" rx="15" />
                <circle cx="20" cy="20" r="5" className="relationship-status-dot" />
                <text x="34" y="25" className="relationship-node-title">{shorten(person.name, 27)}</text>
                <text x="16" y="46" className="relationship-node-detail">
                  {shorten(person.roles.join(" · ") || "Osoba uvedená v RPO", 37)}
                </text>
              </g>
            </Link>
          ))}

          {companyRows.map(({ company: relatedCompany, y }) => {
            const relationRoles = graph.relationships
              .filter((relationship) => relationship.companyId === relatedCompany.id)
              .map((relationship) => relationship.role)
              .filter(Boolean);
            return (
              <Link
                key={relatedCompany.id}
                href={companyProfilePath(relatedCompany.id, relatedCompany.name)}
                className="relationship-node-link"
                aria-label={`Otvoriť profil ${relatedCompany.name}`}
                title={`${relatedCompany.name}${relatedCompany.ico ? ` · IČO ${relatedCompany.ico}` : ""}`}
              >
                <g className="relationship-node company-node related-company-node" transform={`translate(844 ${y - 34})`}>
                  <rect width="252" height="68" rx="15" />
                  <text x="15" y="29" className="relationship-node-title">{shorten(relatedCompany.name, 26)}</text>
                  <text x="15" y="51" className="relationship-node-detail">
                    {shorten(relationRoles.join(" · ") || relatedCompany.city || `ID ${relatedCompany.id}`, 34)}
                  </text>
                </g>
              </Link>
            );
          })}
        </svg>
      </div>

      <div className="relationship-notes">
        <span>{graph.people.length} osôb</span>
        <span>{graph.companies.length} ďalších prepojených subjektov</span>
        <p>
          RPO neobsahuje jednoznačný identifikátor osoby. Väzby medzi rôznymi firmami sa preto
          párujú podľa presného mena a môžu zahŕňať menovcov. Graf zobrazuje najviac 12 osôb
          a 12 ďalších subjektov.
        </p>
      </div>
    </section>
  );
}
