export type CompanyProfile = {
  slug: string;
  name: string;
  legalForm: string;
  industry: string;
  city: string;
  ico: string;
  category: "business" | "government" | "corporate";
  shortDescription: string;
  description: string;
  owners: string[];
  related: string[];
  apiEndpoint: string;
};

export const companies: CompanyProfile[] = [
  {
    slug: "q4-solutions",
    name: "Q4 Solutions s.r.o.",
    legalForm: "S.R.O.",
    industry: "IT & analytika",
    city: "Bratislava",
    ico: "52911124",
    category: "business",
    shortDescription: "Digitálne riešenia pre business intelligence, data a obchodnú analytiku.",
    description:
      "Q4 Solutions poskytuje analytické platformy a dátové riešenia pre podniky, verejný sektor a korporácie. Spoločnosť sa zameriava na zviditeľňovanie vzťahov medzi subjektmi, ekonomické dáta a reportovanie.",
    owners: ["Ján Novák", "Peter Horváth"],
    related: ["Slovenská Energetika", "NovaBuild s.r.o.", "DigitalVitaj"],
    apiEndpoint: "/api/register/subject/q4-solutions",
  },
  {
    slug: "slovenska-energetika",
    name: "Slovenská Energetika a.s.",
    legalForm: "A.S.",
    industry: "Energetika",
    city: "Košice",
    ico: "45211898",
    category: "corporate",
    shortDescription: "Veľký energetický subjekt s fokusom na distribúciu a obnoviteľné zdroje.",
    description:
      "Energetická spoločnosť aktívna v distribúcii, investíciách do obnoviteľných zdrojov a digitalizácii energetických procesov. Spoločnosť spolupracuje s verejným sektorom aj priemyselnými klientmi.",
    owners: ["Energo Holding", "Jozef Bartoš"],
    related: ["Q4 Solutions s.r.o.", "NovaBuild s.r.o.", "Mesto Košice"],
    apiEndpoint: "/api/register/subject/slovenska-energetika",
  },
  {
    slug: "novabuild",
    name: "NovaBuild s.r.o.",
    legalForm: "S.R.O.",
    industry: "Stavba & developers",
    city: "Nitra",
    ico: "34851221",
    category: "business",
    shortDescription: "Developer a stavebná spoločnosť s projektmi v rezidenčnom aj komerčnom segmente.",
    description:
      "NovaBuild sa venuje výstavbe, developerským projektom a správnemu riadeniu stavebných zakázok. Spoločnosť má aktívne partnerstvá s bankami, mestami a dodávateľmi.",
    owners: ["Mária Kulichová", "Róbert Dvořák"],
    related: ["Q4 Solutions s.r.o.", "Mesto Nitra", "Slovenská Energetika"],
    apiEndpoint: "/api/register/subject/novabuild",
  },
  {
    slug: "digitalvitaj",
    name: "DigitalVitaj s.r.o.",
    legalForm: "S.R.O.",
    industry: "IT & SaaS",
    city: "Banská Bystrica",
    ico: "63594112",
    category: "business",
    shortDescription: "SaaS platformy pre podniky a digitálny marketing.",
    description:
      "DigitalVitaj prichádza s cloudovými nástrojmi a platformami pre automatizáciu procesov, marketing a operatívne riadenie. Spoločnosť sídli v Banskej Bystrici a rozširuje sa do regiónu V4.",
    owners: ["Ivana Tkáčová", "Lukáš Novotný"],
    related: ["Q4 Solutions s.r.o.", "Mesto Banská Bystrica", "MPS Group"],
    apiEndpoint: "/api/register/subject/digitalvitaj",
  },
  {
    slug: "agrokomplex",
    name: "AgroKomplex s.r.o.",
    legalForm: "S.R.O.",
    industry: "Poľnohospodárstvo",
    city: "Trnava",
    ico: "31109841",
    category: "business",
    shortDescription: "Poľnohospodárska skupina zameraná na výživu, logistiku a distribúciu.",
    description:
      "AgroKomplex vedie poľnohospodárske projekty v oblasti pôdnych zdrojov, skladovania a distribúcie potravín. Spoločnosť je v kontakte s mestskými správami, logistickými partnermi a exportnými platformami.",
    owners: ["Marek Holub", "Petra Balogová"],
    related: ["Mesto Trnava", "SLO Logistics", "Konsolidácia Potravín"],
    apiEndpoint: "/api/register/subject/agrokomplex",
  },
  {
    slug: "povazska-stavba",
    name: "Považská Stavba a.s.",
    legalForm: "A.S.",
    industry: "Stavba & infrastructure",
    city: "Žilina",
    ico: "48381259",
    category: "corporate",
    shortDescription: "Stavebná a dopravná skupina s projektmi v infraštruktúre a dopravných sieťach.",
    description:
      "Považská Stavba realizuje projekty v oblasti dopravnej a verejnej infraštruktúry. Spolupracuje s úradmi, developeri, bankami a dopravnými partnermi.",
    owners: ["Pavol Kováč", "Slovenská Invest Group"],
    related: ["Mesto Žilina", "NovaBuild s.r.o.", "AgroKomplex s.r.o."],
    apiEndpoint: "/api/register/subject/povazska-stavba",
  },
  {
    slug: "mesto-bratislava",
    name: "Mesto Bratislava",
    legalForm: "Mesto",
    industry: "Verejný sektor",
    city: "Bratislava",
    ico: "20226899",
    category: "government",
    shortDescription: "Samosprávny orgán s kompetenciami v rozvoji mesta, investíciách a verejnom obstarávaní.",
    description:
      "Mesto Bratislava je samosprávny orgán zodpovedný za rozvoj infraštruktúry, verejné zakázky, investície a spolupôsobenie so štátom a podnikateľmi.",
    owners: ["Primátor mesta", "Mestské zastupiteľstvo"],
    related: ["Q4 Solutions s.r.o.", "Slovenská Energetika a.s.", "Mesto Nitra"],
    apiEndpoint: "/api/register/subject/mesto-bratislava",
  },
];
