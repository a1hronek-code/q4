import Link from "next/link";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { Breadcrumb } from "../../components/Breadcrumb";
import { RelationshipGraph } from "../../components/RelationshipGraph";
import { getRpoCompanyGraph, hasRpoDatabase, RpoDatabaseError } from "../../lib/rpo";
import { getRpoSubjectAvailable } from "../../lib/rpo-data";
import { breadcrumbJsonLd, companyProfilePath, jsonLdScriptProps, openGraphFor } from "../../lib/seo";

export const runtime = "nodejs";

function parseCompanyId(param: string): number | null {
  const match = param.match(/^(\d+)(?:-.*)?$/);
  if (!match) return null;
  const id = Number(match[1]);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const id = parseCompanyId(slug);
  if (id === null) return {};

  try {
    const subject = await getRpoSubjectAvailable(id);
    if (!subject) return {};
    const description = [
      subject.legalForm,
      subject.city ? `Sídlo: ${subject.city}` : "",
      subject.ico ? `IČO: ${subject.ico}` : "",
      subject.activities[0] || "",
    ]
      .filter(Boolean)
      .join(" · ");
    const title = `${subject.name} | Q4.sk`;
    const resolvedDescription =
      description || `Firemný medailónik subjektu ${subject.name} z registra RPO.`;
    return {
      title,
      description: resolvedDescription,
      ...openGraphFor({
        title,
        description: resolvedDescription,
        path: companyProfilePath(id, subject.name),
      }),
    };
  } catch (cause) {
    console.error("RPO profile metadata lookup failed", cause);
    return {};
  }
}

export default async function CompanyProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const id = parseCompanyId(slug);
  if (id === null) notFound();

  let subject;
  let error = "";
  let graph;
  let graphError = "";
  try {
    subject = await getRpoSubjectAvailable(id);
  } catch (cause) {
    error =
      cause instanceof RpoDatabaseError
        ? cause.message
        : "Nepodarilo sa načítať údaje z registra RPO.";
    console.error("RPO entity lookup failed", cause);
  }

  if (subject && hasRpoDatabase()) {
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

  // Canonicalize to /firmy/{id}-{slug}; redirect any other slug variant
  // (including the bare numeric ID) permanently to avoid duplicate content.
  if (subject) {
    const canonicalPath = companyProfilePath(id, subject.name);
    if (canonicalPath !== `/firmy/${slug}`) {
      permanentRedirect(canonicalPath);
    }
  }

  const breadcrumbItems = [
    { label: "Domov", href: "/" },
    { label: "Firmy", href: "/firmy" },
    { label: subject?.name ?? `Subjekt #${id}` },
  ];

  const organizationJsonLd = subject
    ? {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: subject.name,
        ...(subject.ico ? { identifier: subject.ico, taxID: subject.ico } : {}),
        ...(subject.legalForm ? { legalName: subject.name, additionalType: subject.legalForm } : {}),
        ...(subject.address ? { address: subject.address } : {}),
        ...(subject.establishment ? { foundingDate: subject.establishment } : {}),
        url: `https://www.q4.sk${companyProfilePath(id, subject.name)}`,
      }
    : null;

  return (
    <main className="page-shell">
      {organizationJsonLd ? <script {...jsonLdScriptProps(organizationJsonLd)} /> : null}
      <script {...jsonLdScriptProps(breadcrumbJsonLd(breadcrumbItems))} />
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
        <Breadcrumb items={breadcrumbItems} />
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

            <section className="profile-activity">
              <span className="eyebrow">Firemný medailónik</span>
              <p>
                {subject.name}
                {subject.legalForm ? ` je subjekt s právnou formou ${subject.legalForm}` : ""}
                {subject.city ? ` so sídlom v meste ${subject.city}` : ""}
                {subject.establishment
                  ? `, zapísaný do registra od ${subject.establishment}`
                  : ""}
                . Stav v registri: {subject.legalStatus}.
                {subject.activities[0] ? ` Hlavná evidovaná činnosť: ${subject.activities[0]}` : ""}
              </p>
            </section>

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

            {subject.stakeholders.length > 0 ? (
              <section className="profile-activity">
                <span className="eyebrow">Spoločníci a zainteresované osoby</span>
                <ul className="profile-list">
                  {subject.stakeholders.map((person, index) => (
                    <li key={`${index}-${person}`}>{person}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            {subject.lastUpdated ? (
              <p className="data-source-note">
                Posledná aktualizácia v zdrojovom registri: {subject.lastUpdated}
              </p>
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
