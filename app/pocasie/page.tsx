import type { Metadata } from "next";
import { Breadcrumb } from "../components/Breadcrumb";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { PocasieClient } from "./PocasieClient";
import { openGraphFor } from "../lib/seo";

const title = "Počasie Bratislava – aktuálne a predpoveď | Q4.sk";
const description =
  "Aktuálne počasie v Bratislave, pocitová teplota, vietor a predpoveď na zajtra.";

export const metadata: Metadata = {
  title,
  description,
  ...openGraphFor({ title, description, path: "/pocasie" }),
};

export default function PocasiePage() {
  return (
    <main className="page-shell intelligence-page">
      <SiteHeader />

      <section className="tool-section">
        <div className="detail-page-shell">
          <Breadcrumb items={[{ label: "Domov", href: "/" }, { label: "Počasie" }]} />

          <header className="detail-page-header">
            <span className="eyebrow">Bratislava</span>
            <h1>Aktuálne počasie a predpoveď</h1>
            <p>
              Praktický prehľad počasia pre Bratislavu s aktuálnou teplotou, pocitovou teplotou,
              vetrom a výhľadom na zajtrajšok. Pre detailnejšiu regionálnu predpoveď môžete prejsť
              aj na špecializovaný meteorologický web.
            </p>
          </header>

          <PocasieClient />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
