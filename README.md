# Q4.sk

Slovenský portál na vyhľadávanie právnických osôb a podnikateľov v Registri
právnických osôb, podnikateľov a orgánov verejnej moci (RPO).

## Spustenie

```bash
npm install
npm run dev
```

Aplikácia bude dostupná na [http://localhost:3000](http://localhost:3000).

## Údaje z registra

Vyhľadávanie sprostredkúva serverová route `GET /api/search`; profily načítavajú
záznamy z REST API RPO. Zdroj prevádzkuje Ministerstvo vnútra SR a jeho údaje
sa aktualizujú denne. MV SR sprístupňuje príslušné údaje pod licenciou
[Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/).

Oficiálna dokumentácia a portál:

- [Dokumentácia REST API RPO](https://rpo.minv.sk/rpo-api-doc.html)
- [Vyhľadávanie v oficiálnom registri RPO](https://rpo.statistics.sk/new/)

Ak REST API nie je dostupné, vyhľadávanie zobrazí chybu a ponúkne pokračovanie
na oficiálnom portáli. Aplikácia v takom prípade nezobrazuje náhradné ani
ukážkové firemné údaje ako skutočné záznamy.
