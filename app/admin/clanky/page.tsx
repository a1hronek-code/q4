import Link from "next/link";
import { connection } from "next/server";
import { auth, signOut } from "@/auth";
import { AdminArticleManager } from "@/app/components/AdminArticleManager";
import {
  configuredOAuthProviders,
  hasAdminEmailAllowlist,
  isAdminAuthConfigured,
  isAdminEmailAllowed,
} from "@/app/lib/admin-access";
import { listAdminArticles } from "@/app/lib/editorial-news";
import type { StoredNewsArticle } from "@/app/lib/news";

export default async function AdminArticlesPage() {
  await connection();
  const session = isAdminAuthConfigured() ? await auth() : null;
  const email = session?.user?.email;

  if (!isAdminEmailAllowed(email)) {
    const allowlistConfigured = hasAdminEmailAllowlist();
    const providers = allowlistConfigured ? configuredOAuthProviders() : [];
    return (
      <main className="page-shell admin-page">
        <Link href="/" className="admin-back-link">← Späť na Q4.sk</Link>
        <section className="admin-panel admin-login-panel">
          <span className="eyebrow">Správa obsahu</span>
          <h1>Administrácia článkov</h1>
          <p>
            Prihlásenie je povolené iba účtom uvedeným v premennej <code>ADMIN_EMAILS</code>.
          </p>
          {providers.length > 0 ? (
            <div className="admin-login-actions">
              {providers.map((provider) => (
                <a
                  className="admin-button admin-button-primary"
                  href={`/api/auth/signin/${provider.id}?callbackUrl=%2Fadmin%2Fclanky`}
                  key={provider.id}
                >
                  {provider.label}
                </a>
              ))}
            </div>
          ) : (
            <p className="admin-alert" role="status">
              {!allowlistConfigured
                ? "Najprv nastavte aspoň jednu adresu v ADMIN_EMAILS."
                : !process.env.AUTH_SECRET
                  ? "Najprv nastavte AUTH_SECRET v prostredí aplikácie."
                  : "Najprv nastavte OAuth prihlasovacie údaje Google alebo GitHub v prostredí aplikácie."}
            </p>
          )}
        </section>
      </main>
    );
  }

  const databaseReady = Boolean(process.env.DATABASE_URL);
  let initialArticles: StoredNewsArticle[] = [];
  let loadError = "";
  if (!databaseReady) {
    loadError = "Na trvalé ukladanie článkov nastavte DATABASE_URL na Neon PostgreSQL.";
  } else {
    try {
      initialArticles = await listAdminArticles();
    } catch (error) {
      console.error("Admin article page could not load articles", error);
      loadError = "Databázu článkov sa nepodarilo pripojiť. Skontrolujte DATABASE_URL.";
    }
  }

  return (
    <main className="page-shell admin-page">
      <header className="admin-header">
        <div>
          <Link href="/" className="admin-back-link">← Späť na Q4.sk</Link>
          <span className="eyebrow">Správa obsahu</span>
          <h1>Administrácia článkov</h1>
          <p>Prihlásený účet: {email}</p>
        </div>
        <form action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}>
          <button className="admin-button" type="submit">Odhlásiť sa</button>
        </form>
      </header>
      {loadError ? <p className="admin-alert" role="alert">{loadError}</p> : null}
      <AdminArticleManager
        initialArticles={initialArticles}
        databaseReady={databaseReady && !loadError}
      />
    </main>
  );
}
