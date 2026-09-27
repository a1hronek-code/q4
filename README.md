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

Aplikácia je po spustení dostupná na
[http://localhost:3000](http://localhost:3000).

## Aktualizácia dát

Opätovné spustenie `npm run data:import` vytvorí novú databázu z najnovšieho
snapshotu a všetkých neskorších denných dávok. Pôvodná databáza zostane
nedotknutá, kým sa nová dávka úspešne nestiahne a nezindexuje.

## Zdroj a licencia

- [Dokumentácia REST API a dátových exportov RPO](https://rpo.minv.sk/rpo-api-doc.html)
- [Portál Registra právnických osôb](https://rpo.statistics.sk/new/)
- [Creative Commons Attribution 4.0 (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/)

Pri ďalšom použití údajov treba uviesť Register právnických osôb MV SR ako zdroj.
Export môže byť až o 24 hodín pozadu oproti aktuálnemu stavu registra.

## Online nasadenie

Databáza je zámerne ignorovaná v Gite: ide o veľký súbor, ktorý sa pravidelne
obnovuje. Produkčné nasadenie preto potrebuje Node.js runtime (nie čisto
statický hosting) a trvalé úložisko alebo spravovanú SQLite/PostgreSQL databázu.
Na prvom nasadení treba import spustiť v prostredí, ktoré aplikácii
sprístupňuje databázu v `data/rpo.sqlite`.
