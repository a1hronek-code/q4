import type { Metadata } from "next";
import { Calculator } from "./Calculator";
import { buildCalculatorMetadata, CalculatorPageLayout } from "../shared";

const slug = "hypoteka-splatka";

export function generateMetadata(): Metadata {
  return buildCalculatorMetadata(slug);
}

export default function MortgagePaymentPage() {
  return (
    <CalculatorPageLayout slug={slug}>
      <Calculator />
    </CalculatorPageLayout>
  );
}
