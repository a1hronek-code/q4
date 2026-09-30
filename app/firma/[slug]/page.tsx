import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { popularCompanies } from "../../lib/popular-companies";
import { RpoDatabaseError } from "../../lib/rpo";
import { getRpoSubjectAvailable, searchRpoAvailable } from "../../lib/rpo-data";

export const runtime = "nodejs";

export default async function PopularCompanyProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const company = popularCompanies.find((item) => item.slug === slug);
  if (!company) notFound();

  try {
    const results = await searchRpoAvailable(company.ico, true);
    const subject = results.results.find((result) => result.ico === company.ico);
    if (!subject) notFound();

    const profile = await getRpoSubjectAvailable(subject.id);
    if (!profile) notFound();
    permanentRedirect(`/firmy/${profile.id}`);
  } catch (cause) {
    if (cause instanceof RpoDatabaseError) {
      console.error("Popular company profile lookup failed", cause);
      return (
        <main className="page-shell">
          <section className="profile-error" role="alert">
            <span className="eyebrow">Profil spoločnosti</span>
            <h1>Profil sa momentálne nedá načítať</h1>
            <p>{cause.message}</p>
            <Link href="/firmy" className="primary-btn inline-link">
              Vyhľadať firmu
            </Link>
          </section>
        </main>
      );
    }
    throw cause;
  }
}
