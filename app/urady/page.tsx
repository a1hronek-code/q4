import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "../components/Breadcrumb";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { openGraphFor } from "../lib/seo";

const title = "Úrady a služby na Slovensku | Q4.sk";
const description =
  "Užitočné odkazy na slovenské úrady, elektronické služby štátu, dane, dávky a verejné registre.";

export const metadata: Metadata = {
  title,
  description,
  ...openGraphFor({ title, description, path: "/urady" }),
};

const publicServices = [
  {
    title: "Elektronické služby štátu",
    description:
      "Východiskový bod pre elektronickú komunikáciu s orgánmi verejnej správy a životné situácie.",
    href: "https://www.slovensko.sk/",
    label: "Ústredný portál verejnej správy",
  },
  {
    title: "Dane a daňové priznania",
    description:
      "Oficiálne informácie, elektronické formuláre a služby finančnej správy.",
    href: "https://www.financnasprava.sk/",
    label: "Finančná správa SR",
  },
  {
    title: "Sociálne poistenie a dávky",
    description:
      "Podmienky sociálneho poistenia, dôchodkov a dávok si overte priamo v Sociálnej poisťovni.",
    href: "https://www.socpoist.sk/",
    label: "Sociálna poisťovňa",
  },
  {
    title: "Zamestnanosť a pomoc v hmotnej núdzi",
    description:
      "Informácie o službách zamestnanosti a štátnej sociálnej podpore.",
    href: "https://www.upsvr.gov.sk/",
    label: "Ústredie práce, sociálnych vecí a rodiny",
  },
  {
    title: "Doklady a agenda ministerstva vnútra",
    description:
      "Oficiálne informácie k dokladom, evidenciám a ďalším agendám Ministerstva vnútra SR.",
    href: "https://www.minv.sk/",
    label: "Ministerstvo vnútra SR",
  },
  {
    title: "Overenie firmy alebo osoby",
    description:
      "Vyhľadanie subjektu v Registri právnických osôb a zobrazenie dostupných firemných väzieb.",
    href: "/firmy",
    label: "Register právnických osôb",
    internal: true,
  },
];

export default function UradyPage() {
  return (
    <main className="page-shell intelligence-page">
      <SiteHeader />
      <section className="tool-section">
        <div className="detail-page-shell">
          <Breadcrumb items={[{ label: "Domov", href: "/" }, { label: "Úrady a služby" }]} />
          <header className="detail-page-header">
            <span className="eyebrow">Verejné služby na Slovensku</span>
            <h1>Úrady, registre a elektronické služby</h1>
            <p>
              Rýchle odkazy na štátne inštitúcie a verejné registre. Informácie
              o konkrétnom konaní, lehote alebo nároku si vždy potvrďte na
              stránke príslušného úradu.
            </p>
          </header>

          <div className="info-grid">
            {publicServices.map((service) => {
              const content = (
                <>
                  <span className="info-card-kicker">{service.label}</span>
                  <strong>{service.title}</strong>
                  <p>{service.description}</p>
                  <span className="info-card-meta">
                    {service.internal ? "Otvoriť na Q4.sk →" : "Otvoriť oficiálny web ↗"}
                  </span>
                </>
              );
              return service.internal ? (
                <Link className="info-card" href={service.href} key={service.title}>
                  {content}
                </Link>
              ) : (
                <a
                  className="info-card"
                  href={service.href}
                  key={service.title}
                  target="_blank"
                  rel="noreferrer"
                >
                  {content}
                </a>
              );
            })}
          </div>

          <section className="profile-activity">
            <span className="eyebrow">Praktické nástroje</span>
            <h2>Vypočítajte si orientačnú sumu</h2>
            <p>
              Kalkulačky Q4.sk pomáhajú s orientačným výpočtom čistej mzdy,
              nemocenského, materského, rodičovského príspevku a ďalších
              finančných tém. Nenahrádzajú rozhodnutie úradu ani individuálne
              odborné poradenstvo.
            </p>
            <Link className="primary-btn inline-link" href="/kalkulacky">
              Zobraziť kalkulačky
            </Link>
          </section>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
