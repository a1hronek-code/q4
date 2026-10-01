import type { Metadata } from "next";
import { Breadcrumb } from "../components/Breadcrumb";
import { MunicipalityFinder } from "../components/MunicipalityFinder";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { listMunicipalities } from "../lib/municipalities";
import { breadcrumbJsonLd, jsonLdScriptProps, openGraphFor } from "../lib/seo";

const title = "Obce a mestá Slovenska – firmy v registri RPO | Q4.sk";
const description =
  "Vyhľadajte obec alebo mesto a zobrazte si počet registrovaných firiem a inštitúcií podľa oficiálneho Registra právnických osôb.";
const breadcrumbItems = [{ label: "Domov", href: "/" }, { label: "Obce" }];

export const metadata: Metadata = {
  title,
  description,
  ...openGraphFor({ title, description, path: "/obce" }),
};

export default function ObcePage() {
  const municipalities = listMunicipalities();
  const listItems = municipalities.map((item) => ({
    name: item.name,
    slug: item.slug,
    totalCompanies: item.totalCompanies,
  }));

  return (
    <main className="page-shell intelligence-page">
      <script {...jsonLdScriptProps(breadcrumbJsonLd(breadcrumbItems))} />
      <SiteHeader />
      <section className="tool-section">
        <div className="detail-page-shell">
          <Breadcrumb items={breadcrumbItems} />
          <header className="detail-page-header">
            <span className="eyebrow">Slovensko podľa obcí</span>
            <h1>Firmy a inštitúcie v obciach a mestách</h1>
            <p>
              Dáta pochádzajú z oficiálneho Registra právnických osôb (RPO) Ministerstva
              vnútra SR. Pre každú obec zobrazujeme reálny počet registrovaných subjektov
              a vybrané aktívne firmy – žiadne odhady ani vymyslené čísla.
            </p>
          </header>

          <MunicipalityFinder municipalities={listItems} />

          <p className="data-source-note">
            Zdroj dát: Register právnických osôb MV SR. Zoznam zahŕňa{" "}
            {municipalities.length.toLocaleString("sk-SK")} obcí a mestských častí
            s aspoň 25 registrovanými subjektmi. Hodnoty sa aktualizujú pri obnove
            lokálneho exportu registra.
          </p>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
