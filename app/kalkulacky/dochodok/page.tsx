import type { Metadata } from "next";
import { Calculator } from "./Calculator";
import { buildCalculatorMetadata, CalculatorPageLayout } from "../shared";

const slug = "dochodok";

export function generateMetadata(): Metadata {
  return buildCalculatorMetadata(slug);
}

export default function PensionPage() {
  return (
    <CalculatorPageLayout slug={slug}>
      <Calculator />
    </CalculatorPageLayout>
  );
}
