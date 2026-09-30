import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { Breadcrumb } from "../components/Breadcrumb";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { getCalculatorMeta } from "../lib/calculators";
import { breadcrumbJsonLd, jsonLdScriptProps, openGraphFor } from "../lib/seo";

export function getRequiredCalculatorMeta(slug: string) {
  const calculator = getCalculatorMeta(slug);
  if (!calculator) notFound();
  return calculator;
}

export function buildCalculatorMetadata(slug: string): Metadata {
  const calculator = getRequiredCalculatorMeta(slug);
  return {
    title: `${calculator.title} | Q4.sk`,
    description: calculator.description,
    ...openGraphFor({
      title: `${calculator.title} | Q4.sk`,
      description: calculator.description,
      path: `/kalkulacky/${slug}`,
    }),
  };
}

export function CalculatorPageLayout({
  slug,
  children,
}: {
  slug: string;
  children: ReactNode;
}) {
  const calculator = getRequiredCalculatorMeta(slug);
  const breadcrumbItems = [
    { label: "Domov", href: "/" },
    { label: "Kalkulačky", href: "/kalkulacky" },
    { label: calculator.shortTitle },
  ];

  return (
    <main className="page-shell intelligence-page">
      <script {...jsonLdScriptProps(breadcrumbJsonLd(breadcrumbItems))} />
      <SiteHeader />
      <div className="detail-page-shell">
        <Breadcrumb items={breadcrumbItems} />

        <section className="detail-page-header">
          <span className="eyebrow">Kalkulačka</span>
          <h1>{calculator.title}</h1>
          <p>{calculator.description}</p>
        </section>

        <div className="calculator-page-shell">{children}</div>
      </div>
      <SiteFooter />
    </main>
  );
}
