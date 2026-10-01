import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import { GoogleAnalyticsConsent } from "./components/GoogleAnalyticsConsent";
import { jsonLdScriptProps, SITE_NAME, SITE_URL } from "./lib/seo";
import "./globals.css";

const bodySans = Plus_Jakarta_Sans({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const homeTitle = "Q4.sk | Praktické informácie pre život na Slovensku";
const homeDescription =
  "Aktuálne informácie o Slovensku: počasie, sviatky, prázdniny, kurzy, ceny palív, kalkulačky a overené údaje o firmách.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: homeTitle,
  description: homeDescription,
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: homeTitle,
    description: homeDescription,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "sk_SK",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: homeTitle,
    description: homeDescription,
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  description: homeDescription,
  areaServed: "SK",
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: "sk-SK",
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/firmy?query={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="sk"
      className={`${bodySans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script {...jsonLdScriptProps(organizationJsonLd)} />
        <script {...jsonLdScriptProps(websiteJsonLd)} />
        {children}
        <GoogleAnalyticsConsent />
      </body>
    </html>
  );
}
