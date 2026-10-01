import type { Metadata } from "next";
import { Breadcrumb } from "../components/Breadcrumb";
import { LiveStatCounter } from "../components/LiveStatCounter";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { liveStats } from "../lib/live-stats";
import { breadcrumbJsonLd, jsonLdScriptProps, openGraphFor } from "../lib/seo";

const title = "Slovensko naživo – štátny dlh, obyvatelia a ďalšie čísla | Q4.sk";
const description =
  "Živé počítadlá štátneho dlhu, obyvateľstva, narodených, úmrtí, manželstiev, výroby áut a ďalších slovenských štatistík – s uvedeným zdrojom a metodikou prepočtu.";
const breadcrumbItems = [{ label: "Domov", href: "/" }, { label: "Slovensko naživo" }];

export const metadata: Metadata = {
  title,
  description,
  ...openGraphFor({ title, description, path: "/slovensko-teraz" }),
};

export default function SlovenskoTerazPage() {
  return (
    <main className="page-shell intelligence-page">
      <script {...jsonLdScriptProps(breadcrumbJsonLd(breadcrumbItems))} />
      <SiteHeader />
      <section className="tool-section">
        <div className="detail-page-shell">
          <Breadcrumb items={breadcrumbItems} />
          <header className="detail-page-header">
            <span className="eyebrow">Slovensko v číslach, naživo</span>
            <h1>Slovensko naživo</h1>
            <p>
              Počítadlá nižšie prepočítavajú posledné oficiálne ročné alebo polročné
              štatistiky na priemernú zmenu za sekundu. <strong>Nejde o reálny
              dátový feed</strong> zo štátnych systémov – v skutočnosti dlh ani
              demografia nerastú úplne rovnomerne. Pri každom počítadle preto
              uvádzame presný zdroj, dátum platnosti údaja a spôsob prepočtu,
              aby bolo jasné, čo číslo znamená a čo nie.
            </p>
          </header>

          <div className="live-stats-grid">
            {liveStats.map((stat) => (
              <LiveStatCounter key={stat.id} stat={stat} />
            ))}
          </div>

          <p className="data-source-note">
            Všetky počítadlá vychádzajú z verejne publikovaných údajov Štatistického úradu SR,
            Rady pre rozpočtovú zodpovednosť, NKÚ SR, Ministerstva spravodlivosti SR a Zväzu
            automobilového priemyslu SR. Odkazy na pôvodné zdroje nájdete pri každom
            počítadle. Stránka slúži na ilustráciu rádovej veľkosti javov, nie ako
            presný real-time monitoring.
          </p>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
