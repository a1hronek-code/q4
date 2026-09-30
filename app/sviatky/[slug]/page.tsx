import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "../../components/Breadcrumb";
import { SiteFooter } from "../../components/SiteFooter";
import { SiteHeader } from "../../components/SiteHeader";
import { holidays, daysUntil } from "../../lib/holidays";

const holidayNotes: Record<string, string> = {
  "den-vzniku-sr":
    "Pripomína vznik samostatnej Slovenskej republiky 1. januára 1993 po rozdelení Českej a Slovenskej Federatívnej Republiky.",
  "zjavenie-pana":
    "Kresťanský sviatok Zjavenia Pána, známy aj ako Traja králi, pripomína príchod mudrcov do Betlehema a zjavenie Krista svetu.",
  "velky-piatok":
    "Veľký piatok je v kresťanskej tradícii dňom pripomienky ukrižovania a smrti Ježiša Krista.",
  "velkonocny-pondelok":
    "Veľkonočný pondelok nadväzuje na Veľkú noc a na Slovensku je spojený s tradičnými ľudovými zvykmi šibačky a oblievačky.",
  "sviatok-prace":
    "Sviatok práce je medzinárodný sviatok venovaný pracujúcim a historickému boju za lepšie pracovné podmienky.",
  "den-vitazstva-nad-fasizmom":
    "Deň víťazstva nad fašizmom pripomína ukončenie druhej svetovej vojny v Európe v máji 1945.",
  "cyril-a-metod":
    "Sviatok svätých Cyrila a Metoda pripomína vierozvestcov, ktorí v 9. storočí priniesli na Veľkú Moravu kresťanstvo a staroslovienske písmo.",
  snp:
    "Výročie Slovenského národného povstania pripomína ozbrojené vystúpenie proti nacizmu a ľudáckemu režimu, ktoré sa začalo 29. augusta 1944.",
  "den-ustavy-sr":
    "Deň Ústavy Slovenskej republiky pripomína prijatie ústavy Slovenskou národnou radou 1. septembra 1992.",
  "sedembolestna-panna-maria":
    "Sedembolestná Panna Mária je patrónkou Slovenska a sviatok má v krajine silné duchovné aj historické postavenie.",
  "vsetci-svati":
    "Sviatok všetkých svätých je kresťanským dňom pamiatky na všetkých svätých, známych aj neznámych.",
  "den-boja-za-slobodu-a-demokraciu":
    "Deň boja za slobodu a demokraciu pripomína 17. november 1939 aj udalosti Nežnej revolúcie z roku 1989.",
  "stedry-den":
    "Štedrý deň je tradičný večer pred Vianocami, spojený s rodinnou večerou a slovenskými vianočnými zvykmi.",
  "prvy-sviatok-vianocny":
    "Prvý sviatok vianočný, teda Božie narodenie, pripomína v kresťanskej tradícii narodenie Ježiša Krista.",
  "druhy-sviatok-vianocny":
    "Druhý sviatok vianočný pokračuje v oslave Vianoc a v kresťanskej tradícii sa viaže aj k sviatku svätého Štefana.",
};

const dateFormatter = new Intl.DateTimeFormat("sk-SK", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function formatDate(value: string) {
  return dateFormatter.format(new Date(`${value}T12:00:00`));
}

function formatDayCount(value: number) {
  const abs = Math.abs(value);
  const mod10 = abs % 10;
  const mod100 = abs % 100;
  return mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14) ? "dni" : "dní";
}

function formatRelativeDays(value: number) {
  if (value === 0) return "Sviatok pripadá na dnešok.";
  if (value === 1) return "Sviatok je zajtra.";
  if (value === -1) return "Sviatok bol včera.";
  if (value > 1) return `Do sviatku zostáva ${value} ${formatDayCount(value)}.`;
  return `Sviatok bol pred ${Math.abs(value)} ${formatDayCount(value)}.`;
}

function parseHolidayParam(value: string) {
  const match = value.match(/^(.*)-(2026|2027)$/);
  if (!match) return null;

  return {
    slug: match[1],
    year: Number(match[2]),
  };
}

function getHolidayByParam(value: string) {
  const parsed = parseHolidayParam(value);
  if (!parsed) return null;

  return holidays.find(
    (holiday) => holiday.slug === parsed.slug && holiday.date.startsWith(String(parsed.year)),
  ) ?? null;
}

export function generateStaticParams() {
  return holidays.map((holiday) => ({
    slug: `${holiday.slug}-${new Date(holiday.date).getFullYear()}`,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const holiday = getHolidayByParam(slug);

  if (!holiday) return {};

  const year = new Date(holiday.date).getFullYear();

  return {
    title: `${holiday.name} ${year} | Q4.sk`,
    description: `${holidayNotes[holiday.slug]} Dátum v roku ${year}: ${formatDate(holiday.date)}.`,
  };
}

export default async function HolidayDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const holiday = getHolidayByParam(slug);

  if (!holiday) notFound();

  const remainingDays = daysUntil(holiday.date, new Date());

  return (
    <main className="page-shell intelligence-page">
      <SiteHeader />

      <section className="tool-section">
        <div className="detail-page-shell">
          <Breadcrumb
            items={[
              { label: "Domov", href: "/" },
              { label: "Sviatky", href: "/sviatky" },
              { label: holiday.name },
            ]}
          />

          <header className="detail-page-header">
            <span className="eyebrow">Štátny sviatok</span>
            <h1>{holiday.name}</h1>
            <p>{holidayNotes[holiday.slug]}</p>
          </header>

          <div className="info-grid">
            <div className="info-card">
              <span className="info-card-kicker">Dátum</span>
              <strong>{formatDate(holiday.date)}</strong>
              <p>Ide o konkrétny termín sviatku v zvolenom roku.</p>
            </div>

            <div className="info-card">
              <span className="info-card-kicker">Odpočet</span>
              <strong>{formatRelativeDays(remainingDays)}</strong>
              <p>Odpočet je počítaný voči dnešnému dňu.</p>
            </div>

            <div className="info-card">
              <span className="info-card-kicker">Význam sviatku</span>
              <strong>{holiday.name}</strong>
              <p>{holidayNotes[holiday.slug]}</p>
            </div>
          </div>

          <p className="tool-hint">
            <Link href="/sviatky">← Späť na kalendár sviatkov</Link>
          </p>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
