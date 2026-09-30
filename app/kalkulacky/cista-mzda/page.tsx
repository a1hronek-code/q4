import type { Metadata } from "next";
import { Calculator } from "./Calculator";
import { buildCalculatorMetadata, CalculatorPageLayout } from "../shared";

const slug = "cista-mzda";

export function generateMetadata(): Metadata {
  return buildCalculatorMetadata(slug);
}

export default function NetSalaryPage() {
  return (
    <CalculatorPageLayout slug={slug}>
      <Calculator />
    </CalculatorPageLayout>
  );
}
