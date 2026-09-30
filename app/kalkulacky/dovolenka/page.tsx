import type { Metadata } from "next";
import { Calculator } from "./Calculator";
import { buildCalculatorMetadata, CalculatorPageLayout } from "../shared";

const slug = "dovolenka";

export function generateMetadata(): Metadata {
  return buildCalculatorMetadata(slug);
}

export default function VacationPage() {
  return (
    <CalculatorPageLayout slug={slug}>
      <Calculator />
    </CalculatorPageLayout>
  );
}
