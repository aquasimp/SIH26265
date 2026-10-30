import { Metadata } from "next";
import { BlueprintAnalysisStudio } from "@/components/blueprint/BlueprintAnalysisStudio";

export const metadata: Metadata = {
  title: "Architectural Blueprint & Campus Telemetry Studio | AICTE Scrutiny",
  description:
    "Automated architectural space audit, room boundary extraction, and cadastral land contiguity compliance under APH 2024–27.",
};

export default function BlueprintAnalysisPage() {
  return <BlueprintAnalysisStudio />;
}

