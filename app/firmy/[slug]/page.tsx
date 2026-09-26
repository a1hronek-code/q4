import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { companies } from "../../lib/companies";

export function generateStaticParams() {
  return companies.map((company) => ({ slug: company.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const company = companies.find((item) => item.slug === slug);

  if (!company) {
    return { title: "Firma nebola nájdená" };
  }

  return {
    title: `${company.name} | Q4.sk`,
    description: company.shortDescription,
  };
}

export default async function CompanyProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const company = companies.find((item) => item.slug === slug);

  if (!company) {
    notFound();
  }

  return (
    <main className="page-shell">
      <header className="topbar">
        <div className="brand-wrap">
          <div className="brand-mark">Q4</div>
          <div>
            <div className="brand-name">Q4.sk</div>
            <div className="brand-subtitle">Profil subjektu</div>
          </div>
        </div>
        <nav className="nav" aria-label="Navigácia">
          <Link href="/">Domov</Link>
          <Link href="/firmy">Firmy</Link>
          <Link href="#">Kontakty</Link>
        </nav>
      </header>

      <section className="feature-layout">
        <div className="feature-panel main-panel">
          <span className="eyebrow">{company.industry}</span>
          <h2>{company.name}</h2>
          <p className="company-profile-description">{company.description}</p>

          <div className="profile-meta-grid">
            <div className="mini-stat soft">
              <span>Právna forma</span>
              <strong>{company.legalForm}</strong>
            </div>
            <div className="mini-stat soft">
              <span>Sídlo</span>
              <strong>{company.city}</strong>
            </div>
            <div className="mini-stat soft">
              <span>IČO</span>
              <strong>{company.ico}</strong>
            </div>
          </div>
        </div>

        <div className="feature-panel side-panel">
          <div className="mini-stat">
            <span>Vlastníci</span>
            <strong>{company.owners.length}</strong>
            <small>{company.owners.join(", ")}</small>
          </div>
          <div className="mini-stat soft">
            <span>API zdroj</span>
            <strong>Pripravené</strong>
            <small>{company.apiEndpoint}</small>
          </div>
        </div>
      </section>

      <section className="tool-section">
        <div className="section-heading">
          <span className="eyebrow">Vztahy medzi subjektmi</span>
          <h2>Graf a prepojenie spoločnosti s okolím</h2>
        </div>

        <div className="relationship-box">
          <h3>{company.name}</h3>
          <div className="graph-grid">
            <div className="node">
              <strong>{company.name}</strong>
              <small>{company.legalForm}</small>
            </div>
            {company.related.map((related) => (
              <div key={related} className="node">
                <strong>{related}</strong>
                <small>Subjekt</small>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
