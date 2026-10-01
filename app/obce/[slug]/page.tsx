import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "../../components/Breadcrumb";
import { getMunicipality, listMunicipalities } from "../../lib/municipalities";
import {
  breadcrumbJsonLd,
  companyProfilePath,
  jsonLdScriptProps,
  openGraphFor,
} from "../../lib/seo";
import { SiteFooter } from "../../components/SiteFooter";
import { SiteHeader } from "../../components/SiteHeader";

// All municipalities are precomputed statically from the local RPO export
// (see scripts/build-municipalities.mjs), so every /obce/<slug> page can be
// pre-rendered at build time without any runtime database access.
export function generateStaticParams() {
  return listMunicipalities().map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const municipality = getMunicipality(slug);
  if (!municipality) return {};
  const title = `Firmy v obci ${municipality.name} | Q4.sk`;
  const description = `${municipality.totalCompanies.toLocaleString("sk-SK")} subjektov registrovaných v obci ${municipality.name} podľa Registra právnických osôb MV SR.`;
  return {
    title,
    description,
    ...openGraphFor({ title, description, path: `/obce/${slug}` }),
  };
}

export default async function MunicipalityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const municipality = getMunicipality(slug);
  if (!municipality) notFound();

  const breadcrumbItems = [
    { label: "Domov", href: "/" },
    { label: "Obce", href: "/obce" },
    { label: municipality.name },
  ];

  return (
    <main className="page-shell intelligence-page">
      <script {...jsonLdScriptProps(breadcrumbJsonLd(breadcrumbItems))} />
      <SiteHeader />
      <section className="tool-section">
        <div className="detail-page-shell">
          <Breadcrumb items={breadcrumbItems} />
          <header className="detail-page-header">
            <span className="eyebrow">Obec</span>
            <h1>Firmy a inštitúcie – {municipality.name}</h1>
            <p>
              Podľa oficiálneho Registra právnických osôb (RPO) Ministerstva vnútra SR
              je v obci {municipality.name} registrovaných{" "}
              <strong>{municipality.totalCompanies.toLocaleString("sk-SK")}</strong> subjektov,
              z toho aktuálne aktívnych{" "}
              <strong>{municipality.activeCompanies.toLocaleString("sk-SK")}</strong>.
            </p>
          </header>

          <section aria-labelledby="najnovsie-firmy">
            <div className="section-heading">
              <span className="eyebrow">Najnovšie aktívne subjekty</span>
              <h2 id="najnovsie-firmy">Firmy založené v obci {municipality.name}</h2>
            </div>
            {municipality.recentCompanies.length > 0 ? (
              <div className="info-grid">
                {municipality.recentCompanies.map((company) => (
                  <Link
                    className="info-card"
                    href={companyProfilePath(company.id, company.name)}
                    key={company.id}
                    prefetch={false}
                  >
                    <span className="info-card-kicker">
                      {company.establishment ? `Založená ${company.establishment}` : "Dátum nie je uvedený"}
                    </span>
                    <strong>{company.name}</strong>
                    {company.ico ? <p>IČO {company.ico}</p> : null}
                    <span className="info-card-meta">Zobraziť profil firmy →</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="data-source-note">
                Pre túto obec zatiaľ nemáme pripravený zoznam konkrétnych firiem.
                Skúste vyhľadať subjekt priamo podľa názvu alebo IČO.
              </p>
            )}
          </section>

          <section className="profile-activity">
            <span className="eyebrow">Hľadáte konkrétnu firmu?</span>
            <h2>Vyhľadajte subjekt v obci {municipality.name}</h2>
            <p>
              Fulltextové vyhľadávanie prehľadá všetky subjekty registrované v RPO
              podľa názvu, IČO alebo sídla.
            </p>
            <Link className="primary-btn inline-link" href="/firmy">
              Otvoriť vyhľadávanie firiem
            </Link>
          </section>

          <p className="data-source-note">
            Zdroj dát: Register právnických osôb MV SR. Zoznam najnovších firiem
            zobrazuje maximálne 8 aktívnych subjektov s najneskorším dátumom vzniku.
          </p>

          <Link href="/obce" className="inline-link">
            ← Všetky obce
          </Link>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
