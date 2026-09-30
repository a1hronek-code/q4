// Shared SEO helpers: canonical URL builder and Open Graph defaults used
// across all page.tsx files' generateMetadata()/metadata exports.

export const SITE_URL = "https://www.q4.sk";
export const SITE_NAME = "Q4.sk";

/** Builds an absolute canonical URL from a site-relative path (must start with "/"). */
export function canonicalUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Shared Open Graph + Twitter Card fields for a page's generateMetadata()/metadata. */
export function openGraphFor(options: {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
}) {
  const url = canonicalUrl(options.path);
  return {
    alternates: { canonical: url },
    openGraph: {
      title: options.title,
      description: options.description,
      url,
      siteName: SITE_NAME,
      locale: "sk_SK",
      type: options.type ?? "website",
    },
    twitter: {
      card: "summary" as const,
      title: options.title,
      description: options.description,
    },
  };
}

/** Builds a BreadcrumbList JSON-LD object matching the <Breadcrumb> component's items. */
export function breadcrumbJsonLd(items: { label: string; href?: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: canonicalUrl(item.href) } : {}),
    })),
  };
}

/** Slugifies text into a lowercase, hyphenated, ASCII-only slug. */
export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Builds the canonical /firmy/{id}-{slug} path for a company profile. */
export function companyProfilePath(id: number | string, name: string): string {
  const slug = slugify(name);
  return slug ? `/firmy/${id}-${slug}` : `/firmy/${id}`;
}


export function jsonLdScriptProps(data: unknown) {
  return {
    type: "application/ld+json",
    dangerouslySetInnerHTML: { __html: JSON.stringify(data) },
  };
}
