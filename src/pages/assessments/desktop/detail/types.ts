import type { Measurement } from "@/pages/assessments/desktop/new/types/desktop-assessment";

export interface AssessmentMeasurement extends Measurement {
  status: "configured" | "pending" | "error" | "uploaded" | "not_uploaded" | "not_configured";
  data_status: "uploaded" | "not_uploaded" | "partial";
  updated_at: string | null;
  completion: number;
  isUploaded?: boolean;
  description?: string;
  measurementRecordId?: number; // ID from calculated_measurements table for deletion
  calculated_value?: number; // The calculated value from calculated_measurements table
}