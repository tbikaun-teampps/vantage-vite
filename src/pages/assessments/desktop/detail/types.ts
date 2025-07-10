import type { Measurement } from "@/pages/assessments/desktop/new/types/desktop-assessment";

export interface AssessmentMeasurement extends Measurement {
  status: "configured" | "pending" | "error";
  data_status: "uploaded" | "not_uploaded" | "partial";
  last_updated: string | null;
  completion: number;
  isSelected?: boolean;
}