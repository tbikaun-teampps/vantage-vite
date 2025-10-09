import type { Measurement } from "@/pages/assessments/desktop/new/types/desktop-assessment";

export interface AssessmentMeasurement extends Measurement {
  status: "configured" | "pending" | "error" | "in_use" | "available";
  data_status: "uploaded" | "not_uploaded" | "partial";
  updated_at: string | null;
  completion: number;
  isInUse?: boolean;
  description?: string;
  measurementRecordId?: number; // ID from calculated_measurements table for deletion
  calculated_value?: number; // The calculated value from calculated_measurements table
  instanceCount?: number; // Count of calculated measurement instances for this definition
}

// Represents an actual measurement instance record from the API
export interface MeasurementInstance {
  id: number;
  created_at: string;
  updated_at: string;
  measurement_id: number;
  data_source: string | null;
  calculated_value: number;
  calculation_metadata: any | null;
  program_phase_id: number | null;
  created_by: string;
  company_id: string;
  business_unit_id: number | null;
  region_id: number | null;
  site_id: number | null;
  asset_group_id: number | null;
  work_group_id: number | null;
  role_id: number | null;
  assessment_id: number;
  business_unit: { name: string } | null;
  region: { name: string } | null;
  site: { name: string } | null;
  asset_group: { name: string } | null;
  work_group: { name: string } | null;
  role: { name: string } | null;
}

// Measurement instance enriched with measurement definition details
export interface EnrichedMeasurementInstance extends MeasurementInstance {
  measurement_name: string;
  measurement_description?: string;
}