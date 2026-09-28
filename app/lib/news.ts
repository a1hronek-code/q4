export type NewsArticle = {
  title: string;
  link: string;
  publisher: string;
  publishedAt: string | null;
  summary: string;
  imageUrl?: string;
};

export type StoredNewsArticle = NewsArticle & {
  id: string;
  isVisible: boolean;
  isSeed: boolean;
};

export const newsFeeds = [
  { url: "https://hnonline.sk/rss/ekonomika", publisher: "Hospodárske noviny" },
  { url: "https://www.teraz.sk/rss/ekonomika.rss", publisher: "Teraz.sk" },
] as const;

export const seedArticles: StoredNewsArticle[] = [
  {
    id: "seed-vysoke-tatry-lyziarska-sezona",
    title: "Kedy sa vo Vysokých Tatrách začína poriadna lyžiarska sezóna",
    link: "https://predpovedpocasia.sk/clanky/kedy-sa-vo-vysokych-tatrach-zacina-poriadna-lyziarska-sezona",
    publisher: "Predpoveď počasia",
    publishedAt: null,
    summary: "Článok o začiatku lyžiarskej sezóny vo Vysokých Tatrách. Prečítajte si ho na pôvodnom webe.",
    isVisible: true,
    isSeed: true,
  },
];
