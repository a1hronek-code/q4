import type { Metadata } from "next";
import { Calculator } from "./Calculator";
import { buildCalculatorMetadata, CalculatorPageLayout } from "../shared";

const slug = "urokovy-bonus";

export function generateMetadata(): Metadata {
  return buildCalculatorMetadata(slug);
}

export default function MortgageInterestBonusPage() {
  return (
    <CalculatorPageLayout slug={slug}>
      <Calculator />
    </CalculatorPageLayout>
  );
}
