import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="footer intelligence-footer">
      <Link href="/" className="footer-brand">
        <span className="brand-mark">Q4</span>
        <strong>Q4.sk <span>•</span> Praktické informácie pre Slovensko</strong>
      </Link>
      <div className="footer-links">
        <Link href="/kategorie">Všetky rubriky</Link>
        <Link href="/pocasie">Počasie</Link>
        <Link href="/sviatky">Štátne sviatky</Link>
        <Link href="/prazdniny">Školské prázdniny</Link>
        <Link href="/volby">Voľby</Link>
        <Link href="/meniny">Meniny</Link>
        <Link href="/#trhy">Kurzy a ceny</Link>
        <Link href="/statistiky">Štatistiky</Link>
        <Link href="/urady">Úrady a služby</Link>
        <Link href="/firmy">Vyhľadávanie firiem</Link>
        <Link href="/kalkulacky">Kalkulačky</Link>
        <Link href="/admin/clanky">Administrácia článkov</Link>
      </div>
    </footer>
  );
}
