import Link from "next/link";
import { notFound } from "next/navigation";
import { RelationshipGraph } from "../../components/RelationshipGraph";
import { getRpoCompanyGraph, getRpoSubject, RpoDatabaseError } from "../../lib/rpo";

export const runtime = "nodejs";

export default async function CompanyProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!/^\d+$/.test(slug)) notFound();

  const id = Number(slug);
  if (!Number.isSafeInteger(id) || id <= 0) notFound();

  let subject;
  let error = "";
  let graph;
  let graphError = "";
  try {
    subject = await getRpoSubject(id);
  } catch (cause) {
    error =
      cause instanceof RpoDatabaseError
        ? cause.message
        : "Nepodarilo sa načítať údaje z lokálnej databázy registra RPO.";
    console.error("RPO entity lookup failed", cause);
  }

  if (subject) {
    try {
      graph = getRpoCompanyGraph(id);
    } catch (cause) {
      graphError =
        cause instanceof RpoDatabaseError
          ? cause.message
          : "Grafické väzby sa nepodarilo načítať.";
      console.error("RPO relationship graph lookup failed", cause);
    }
  }

  if (!subject && !error) notFound();

  return (
    <main className="page-shell">
      <header className="topbar">
        <Link href="/" className="brand-wrap" aria-label="Q4.sk – domov">
          <span className="brand-mark">Q4</span>
          <span>
            <span className="brand-name">Q4.sk</span>
            <span className="brand-subtitle">Firemná inteligencia</span>
          </span>
        </Link>
        <nav className="nav" aria-label="Navigácia">
          <Link href="/">Domov</Link>
          <Link href="/firmy">Vyhľadávanie</Link>
          <a href="https://rpo.statistics.sk/new/" target="_blank" rel="noreferrer">
            Oficiálny register
          </a>
        </nav>
      </header>

      <section className="profile-section">
        {error ? (
          <div className="profile-error" role="alert">
            <span className="eyebrow">Register RPO</span>
            <h1>Údaje sa momentálne nedajú načítať</h1>
            <p>{error}</p>
            <Link href="/firmy" className="primary-btn inline-link">
              Späť na vyhľadávanie
            </Link>
            <a
              className="secondary-btn inline-link"
              href={`https://rpo.statistics.sk/new/organization/${id}/withHistory`}
              target="_blank"
              rel="noreferrer"
            >
              Zobraziť záznam na portáli RPO
            </a>
          </div>
        ) : subject ? (
          <>
            <div className="section-heading">
              <span className="eyebrow">{subject.legalForm || "Záznam v registri RPO"}</span>
              <h1>{subject.name}</h1>
              {subject.termination ? (
                <p className="inactive-notice">Tento subjekt má v registri uvedený dátum zániku.</p>
              ) : null}
            </div>

            <div className="profile-meta-grid">
              <div className="mini-stat soft">
                <span>IČO</span>
                <strong>{subject.ico || "V registri neuvedené"}</strong>
              </div>
              <div className="mini-stat soft">
                <span>Stav</span>
                <strong>{subject.legalStatus}</strong>
              </div>
              <div className="mini-stat soft">
                <span>Právna forma</span>
                <strong>{subject.legalForm || "V registri neuvedená"}</strong>
              </div>
              <div className="mini-stat soft">
                <span>Dátum vzniku</span>
                <strong>{subject.establishment || "V registri neuvedený"}</strong>
              </div>
            </div>

            {subject.address ? (
              <section className="profile-activity">
                <span className="eyebrow">Sídlo</span>
                <p>{subject.address}</p>
              </section>
            ) : null}

            {subject.activities.length > 0 ? (
              <section className="profile-activity">
                <span className="eyebrow">Predmety činnosti</span>
                <ul className="profile-list">
                  {subject.activities.map((activity, index) => (
                    <li key={`${index}-${activity}`}>{activity}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            {subject.statutoryBodies.length > 0 ? (
              <section className="profile-activity">
                <span className="eyebrow">Štatutárne orgány</span>
                <ul className="profile-list">
                  {subject.statutoryBodies.map((person, index) => (
                    <li key={`${index}-${person}`}>{person}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            {graphError ? (
              <section className="profile-activity relationship-section" role="alert">
                <span className="eyebrow">Grafické väzby</span>
                <p>{graphError}</p>
              </section>
            ) : graph ? (
              <RelationshipGraph company={subject} graph={graph} />
            ) : null}

            <p className="data-source-note">
              Zdroj: Register právnických osôb MV SR ·{" "}
              <a
                href="https://rpo.minv.sk/rpo-api-doc.html"
                target="_blank"
                rel="noreferrer"
              >
                dokumentácia a licencia CC BY 4.0
              </a>
            </p>
          </>
        ) : null}
      </section>
    </main>
  );
}
