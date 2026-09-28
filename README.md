# Q4.sk

Slovenský portál na vyhľadávanie subjektov v Registri právnických osôb,
podnikateľov a orgánov verejnej moci (RPO). Každý záznam má vlastnú stránku
s medailónikom údajov z oficiálneho registra.

## Požiadavky

- Node.js 22.13.0 alebo novší (`node:sqlite` a FTS5)
- Približne 1 GB dát na stiahnutie a ďalšie miesto na lokálnu databázu

## Prvé spustenie

```bash
npm install
npm run data:import
npm run dev
```

Import stiahne najnovší verejný snapshot RPO a dostupné denné zmeny z objektového
úložiska, vytvorí databázu SQLite s fulltextovým indexom v `data/rpo.sqlite` a
otvorí ju pre vyhľadávanie. Počiatočný snapshot má približne 900 MB komprimovaný,
preto môže sťahovanie a indexovanie chvíľu trvať. Priebeh a prípadné chyby sa
zobrazujú v termináli. Databáza ani stiahnuté súbory sa neukladajú do Gitu.

Profil subjektu obsahuje graf štatutárnych osôb a ďalších firiem prepojených
cez rovnakú osobu. Keďže export RPO nemá jednoznačný identifikátor osoby,
medzifiremné väzby sa spájajú podľa presného mena a môžu obsahovať menovcov.

Aplikácia je po spustení dostupná na
[http://localhost:3000](http://localhost:3000).

## Aktualizácia dát

Opätovné spustenie `npm run data:import` vytvorí novú databázu z najnovšieho
snapshotu a všetkých neskorších denných dávok. Pôvodná databáza zostane
nedotknutá, kým sa nová dávka úspešne nestiahne a nezindexuje.

Ak import skončí po úspešnom spracovaní celého snapshotu, ale pred dennými
zmenami, možno pokračovať bez opätovného sťahovania snapshotu:

```powershell
$env:RPO_DAILY_ONLY = "1"; npm run data:import
```

Tento režim použite iba vtedy, ak terminál potvrdil dokončenie všetkých častí
snapshotu. Pri chybe počas snapshotu spustite bežný `npm run data:import`.

## Zdroj a licencia

- [Dokumentácia REST API a dátových exportov RPO](https://rpo.minv.sk/rpo-api-doc.html)
- [Portál Registra právnických osôb](https://rpo.statistics.sk/new/)
- [Creative Commons Attribution 4.0 (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/)

Pri ďalšom použití údajov treba uviesť Register právnických osôb MV SR ako zdroj.
Export môže byť až o 24 hodín pozadu oproti aktuálnemu stavu registra.

## Online nasadenie

Databáza je zámerne ignorovaná v Gite: ide o veľký súbor, ktorý sa pravidelne
obnovuje. Vyhľadávanie a profily preto používajú lokálnu databázu, ak je dostupná,
a inak prechádzajú na verejný REST endpoint registra RPO. Hostovaná aplikácia tak
môže vytvárať dynamické profily subjektov bez kopírovania celého exportu do
deploymentu. Pri dostupnej lokálnej databáze profil navyše zobrazí graf väzieb
medzi firmami; vzdialený detail RPO obsahuje medailónik, štatutárov,
spoločníkov a ďalšie registrové údaje, nie však tento odvodený graf.

Prístup k lokálnemu exportu vyžaduje Node.js runtime a súbor `data/rpo.sqlite`.
Súbory v `data/` sa nezahŕňajú do Next.js output tracingu, preto treba databázu
sprístupniť aplikácii nezávisle od build procesu. Príkaz `npm run build` používa
Webpack, aby zostavenie nebolo závislé od veľkosti lokálneho databázového súboru.

## Správa článkov

Administrácia je dostupná na `/admin/clanky`. Prihlásiť sa môžu iba OAuth účty
Google alebo GitHub, ktorých e-mail je uvedený v `ADMIN_EMAILS` (viac adries
oddeľte čiarkou). V administrácii možno články pridávať, upravovať, skrývať a
znovu zverejniť. Úvodný článok o lyžiarskej sezóne vo Vysokých Tatrách je
predvyplnený z odkazu používateľa.

Články sa ukladajú do Neon PostgreSQL; pri prvom použití sa vytvorí tabuľka
`q4_news_articles`. Nastavte premenné z `.env.example` lokálne aj v nastaveniach
produkčného projektu Vercel:

- `DATABASE_URL` – pripájací reťazec Neon PostgreSQL (na Vercel použite pooling).
- `AUTH_SECRET` – náhodný tajný kľúč Auth.js; nevkladajte ho do Gitu.
- `ADMIN_EMAILS` – povolené e-mailové adresy administrátorov.
- `AUTH_GOOGLE_ID` a `AUTH_GOOGLE_SECRET` – OAuth aplikácia Google.
- `AUTH_GITHUB_ID` a `AUTH_GITHUB_SECRET` – OAuth aplikácia GitHub.

OAuth callback URL pre lokálny vývoj je
`http://localhost:3000/api/auth/callback/google` alebo
`http://localhost:3000/api/auth/callback/github`. Pre produkciu pridajte rovnakú
cestu na doméne Q4.sk. Nastavte callback iba pre poskytovateľa, ktorého OAuth
údaje ste nakonfigurovali.

Tlačidlo „Načítať z odkazu“ importuje iba metadáta článkov z HN, Teraz.sk a
Predpovede počasia. Ďalšie domény treba výslovne pridať do zoznamu povolených
domén v `app/lib/article-import.ts`. Q4 zobrazuje nadpis, krátky perex a
voliteľný obrázok; celý text článku zostáva na pôvodnom webe.

## Google Analytics

GA4 je zapojené s meracím ID `G-7265T1HV9S`. Skript sa načíta až po výslovnom
súhlase návštevníka; rozhodnutie možno neskôr zmeniť cez „Nastavenia cookies“.
Pri odmietnutí alebo odvolaní súhlasu sa analytické cookies odstránia a ďalšie
meranie sa zastaví. Zobrazenia stránok pri navigácii v aplikácii sleduje GA4
tag po súhlase posiela ako samostatné udalosti. V nastaveniach webového streamu
vypnite v Enhanced Measurement voľbu zmien stránok podľa udalostí histórie
prehliadača, aby sa pri navigácii neodosielali duplicitné zobrazenia.
