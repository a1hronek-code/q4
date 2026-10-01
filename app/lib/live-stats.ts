// Definície "naživo" počítadiel pre stránku /slovensko-teraz.
//
// Dôležité: ide o matematický prepočet posledných známych OFICIÁLNYCH ročných
// alebo polročných štatistík na priemernú hodnotu za sekundu – nie o reálny
// real-time dátový feed zo štátnych systémov. Každé počítadlo preto má
// viditeľný zdroj, dátum platnosti údaja a stručnú poznámku o metodike
// prepočtu, nech je zrejmé, že ide o ilustračný odhad rádovej veľkosti javu,
// nie o presné hodnoty k aktuálnej sekunde.

export type StockStat = {
  id: string;
  mode: "stock";
  icon: string;
  title: string;
  unit: string;
  decimals: number;
  /** Hodnota platná k referenceIso (ISO dátum s časovým pásmom). */
  baseValue: number;
  referenceIso: string;
  /** Priemerná zmena hodnoty za sekundu (môže byť záporná). */
  perSecond: number;
  sourceLabel: string;
  sourceUrl: string;
  sourceDate: string;
  note: string;
};

export type FlowStat = {
  id: string;
  mode: "flow-yearly";
  icon: string;
  title: string;
  unit: string;
  decimals: number;
  /** Odhadovaný celkový ročný súčet javu, počítaný od 1. januára bežného roka. */
  annualTotal: number;
  sourceLabel: string;
  sourceUrl: string;
  sourceDate: string;
  note: string;
};

export type HeartbeatStat = {
  id: string;
  mode: "heartbeat-today";
  icon: string;
  title: string;
  unit: string;
  decimals: number;
  population: number;
  beatsPerMinute: number;
  sourceLabel: string;
  sourceUrl: string;
  sourceDate: string;
  note: string;
};

export type LiveStat = StockStat | FlowStat | HeartbeatStat;

export const liveStats: LiveStat[] = [
  {
    id: "statny-dlh",
    mode: "stock",
    icon: "€",
    title: "Štátny dlh Slovenska",
    unit: "€",
    decimals: 0,
    baseValue: 92_000_000_000,
    referenceIso: "2026-10-01T00:00:00+02:00",
    // Schválený deficit verejnej správy na rok 2026: 5,9 mld. € / rok.
    perSecond: 5_900_000_000 / (365 * 24 * 3600),
    sourceLabel: "NKÚ SR a Rada pre rozpočtovú zodpovednosť (schválený rozpočet na rok 2026)",
    sourceUrl: "https://www.rrz.sk/rozpoctovy-semafor-2026-09/",
    sourceDate: "jeseň 2026",
    note: "Základ: odhad NKÚ (≈92 mld. €, jeseň 2026). Rast: schválený ročný deficit verejnej správy 5,9 mld. € prepočítaný na sekundu – v realite dlh nerastie rovnomerne, ale skokovo pri emisiách dlhopisov.",
  },
  {
    id: "obyvatelia",
    mode: "stock",
    icon: "👤",
    title: "Obyvatelia Slovenska",
    unit: "",
    decimals: 0,
    baseValue: 5_403_009,
    referenceIso: "2026-06-30T00:00:00+02:00",
    // Prirodzený úbytok 2026 (odhad ŠÚ SR): 47 815 narodených − 56 940 zomretých ≈ −9 125 / rok.
    perSecond: (47_815 - 56_940) / (365 * 24 * 3600),
    sourceLabel: "Štatistický úrad SR – Stav obyvateľstva k 30. 6. 2026",
    sourceUrl:
      "https://slovak.statistics.sk/wps/portal/ext/home/!ut/p/z1?1dmy&urile=wcm%3apath%3a/obsah-sk-inf-akt/informativne-spravy/vsetky/63fa06f2-4cf5-4e9a-bc70-c26acf8cee83",
    sourceDate: "30. jún 2026",
    note: "Počíta len prirodzený úbytok (narodení mínus zomretí) z ročného odhadu ŠÚ SR, bez vplyvu migrácie, ktorá je v posledných štvrťrokoch takmer nulová.",
  },
  {
    id: "narodeni",
    mode: "flow-yearly",
    icon: "👶",
    title: "Narodené deti na Slovensku (od 1. 1.)",
    unit: "",
    decimals: 0,
    annualTotal: 47_815,
    sourceLabel: "Štatistický úrad SR – demografický odhad 2026",
    sourceUrl:
      "https://slovak.statistics.sk/wps/portal/ext/home/!ut/p/z1?1dmy&urile=wcm%3apath%3a/obsah-sk-inf-akt/informativne-spravy/vsetky/63fa06f2-4cf5-4e9a-bc70-c26acf8cee83",
    sourceDate: "2026 (odhad z 2. štvrťroka)",
    note: "Ročný odhad (extrapolácia z Q2 2026) rozpočítaný rovnomerne na sekundy od 1. januára bežného roka. V skutočnosti sa počet narodených medzi mesiacmi mierne líši.",
  },
  {
    id: "zomreli",
    mode: "flow-yearly",
    icon: "✝",
    title: "Zomretí na Slovensku (od 1. 1.)",
    unit: "",
    decimals: 0,
    annualTotal: 56_940,
    sourceLabel: "Štatistický úrad SR – demografický odhad 2026",
    sourceUrl:
      "https://slovak.statistics.sk/wps/portal/ext/home/!ut/p/z1?1dmy&urile=wcm%3apath%3a/obsah-sk-inf-akt/informativne-spravy/vsetky/63fa06f2-4cf5-4e9a-bc70-c26acf8cee83",
    sourceDate: "2026 (odhad z 2. štvrťroka)",
    note: "Ročný odhad (extrapolácia z Q2 2026) rozpočítaný rovnomerne na sekundy od 1. januára bežného roka.",
  },
  {
    id: "manzelstva",
    mode: "flow-yearly",
    icon: "💍",
    title: "Uzavreté manželstvá (od 1. 1.)",
    unit: "",
    decimals: 0,
    annualTotal: 22_000,
    sourceLabel: "Štatistický úrad SR – Pohyb obyvateľstva (dlhodobý ročný priemer 21 000–23 000)",
    sourceUrl:
      "https://slovak.statistics.sk/wps/portal/ext/products/publikacie/!ut/p/z1?1dmy&urile=wcm%3Apath%3A/OBSAH-SK-PUB/Publikacie/vsetkyPublikacie/2c25ec3d-578a-4dd1-9238-f7fd13cc2ffc",
    sourceDate: "dlhodobý priemer ŠÚ SR",
    note: "Použitý je stred dlhodobého rozpätia 21-tisíc až 23-tisíc sobášov ročne, keďže presné číslo za prebiehajúci rok ešte nie je publikované.",
  },
  {
    id: "rozvody",
    mode: "flow-yearly",
    icon: "✂",
    title: "Rozvody na Slovensku (od 1. 1.)",
    unit: "",
    decimals: 0,
    annualTotal: 8_397,
    sourceLabel: "Ministerstvo spravodlivosti SR – štatistika rozvodov 2024",
    sourceUrl: "https://www.topky.sk/cl/10/3100327/V-roku-2024-sudy-rozviedli-viac-ako-8-tisic-manzelstiev",
    sourceDate: "posledný uzavretý rok: 2024",
    note: "Najnovšie publikované ročné číslo (2024, 8 397 rozvodov) – štatistika za bežný rok ešte nie je k dispozícii.",
  },
  {
    id: "auta",
    mode: "flow-yearly",
    icon: "🚗",
    title: "Autá vyrobené na Slovensku (od 1. 1.)",
    unit: "",
    decimals: 0,
    annualTotal: 993_000,
    sourceLabel: "Zväz automobilového priemyslu SR – produkcia 2024",
    sourceUrl: "https://spravy.stvr.sk/2025/01/slovensko-vyrobilo-v-roku-2024-menej-aut/",
    sourceDate: "posledný uzavretý rok: 2024",
    note: "Posledné potvrdené ročné číslo (2024: 993-tisíc vozidiel). Odhady pre rok 2025/2026 počítajú s miernym rastom nad 1 milión, zatiaľ však nie sú finálne.",
  },
  {
    id: "pivo",
    mode: "flow-yearly",
    icon: "🍺",
    title: "Vypité pivo na Slovensku (od 1. 1.)",
    unit: "l",
    decimals: 0,
    // 48 l/obyvateľa/rok (2024) × 5 403 009 obyvateľov (ŠÚ SR, 30.6.2026).
    annualTotal: 48 * 5_403_009,
    sourceLabel: "Spotreba piva na obyvateľa (2024) × počet obyvateľov SR (ŠÚ SR)",
    sourceUrl:
      "https://www.pravda.sk/spravy/ekonomika/clanok/779619-slovaci-piju-tak-malo-piva-ako-nikdy-predtym-z-96-litrov-na-hlavu-sme",
    sourceDate: "spotreba na hlavu: 2024",
    note: "48 litrov na obyvateľa za rok 2024 (historické minimum) vynásobených aktuálnym odhadom počtu obyvateľov – nejde o priamo meraný celoštátny súčet, ale o dopočítaný odhad.",
  },
  {
    id: "tepy",
    mode: "heartbeat-today",
    icon: "❤",
    title: "Údery sŕdc Slovákov (dnes)",
    unit: "",
    decimals: 0,
    population: 5_403_009,
    beatsPerMinute: 72,
    sourceLabel: "Priemerný pokojový pulz dospelého (60–100 tepov/min, stredná hodnota 72) × počet obyvateľov SR",
    sourceUrl: "https://www.akoliecit.sk/obehova-sustava/pulz/",
    sourceDate: "fyziologická konštanta + ŠÚ SR populácia",
    note: "Modelový odhad: 72 úderov za minútu (bežne uvádzaný priemer pokojového pulzu dospelého) × počet obyvateľov × sekundy od polnoci. Skutočný pulz sa líši podľa veku, aktivity a zdravia.",
  },
];
