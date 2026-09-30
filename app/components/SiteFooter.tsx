import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="footer intelligence-footer">
      <Link href="/" className="footer-brand">
        <span className="brand-mark">Q4</span>
        <strong>Q4.sk <span>•</span> Firemná inteligencia pre Slovensko</strong>
      </Link>
      <div className="footer-links">
        <Link href="/firmy">Vyhľadávanie firiem</Link>
        <Link href="/#vztahy">Obchodné vzťahy</Link>
        <Link href="/#trhy">Prehľad trhu</Link>
        <Link href="/kalkulacky">Kalkulačky</Link>
        <Link href="/admin/clanky">Administrácia článkov</Link>
      </div>
    </footer>
  );
}
