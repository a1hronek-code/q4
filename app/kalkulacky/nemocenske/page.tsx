import type { Metadata } from "next";
import { Calculator } from "./Calculator";
import { buildCalculatorMetadata, CalculatorPageLayout } from "../shared";

const slug = "nemocenske";

export function generateMetadata(): Metadata {
  return buildCalculatorMetadata(slug);
}

export default function SickPayPage() {
  return (
    <CalculatorPageLayout slug={slug}>
      <Calculator />
    </CalculatorPageLayout>
  );
}
