import type { Metadata } from "next";
import { Calculator } from "./Calculator";
import { buildCalculatorMetadata, CalculatorPageLayout } from "../shared";

const slug = "rodicovsky-prispevok";

export function generateMetadata(): Metadata {
  return buildCalculatorMetadata(slug);
}

export default function ParentalAllowancePage() {
  return (
    <CalculatorPageLayout slug={slug}>
      <Calculator />
    </CalculatorPageLayout>
  );
}
