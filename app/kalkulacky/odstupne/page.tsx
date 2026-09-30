import type { Metadata } from "next";
import { Calculator } from "./Calculator";
import { buildCalculatorMetadata, CalculatorPageLayout } from "../shared";

const slug = "odstupne";

export function generateMetadata(): Metadata {
  return buildCalculatorMetadata(slug);
}

export default function SeverancePage() {
  return (
    <CalculatorPageLayout slug={slug}>
      <Calculator />
    </CalculatorPageLayout>
  );
}
