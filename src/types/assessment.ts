import type { WorkGroup, AssetGroup } from "./company";
import type { DatabaseRow, Enums } from "./utils";
import type { Measurement } from "@/types/desktop-assessment";

export type AssessmentTypeEnum = Enums["assessment_types"];
export type AssessmentStatusEnum = Enums["assessment_statuses"];
export type InterviewStatusEnum = Enums["interview_statuses"];
export type RoleLevelEnum = Enums["role_levels"];
export type QuestionnaireStatusEnum = Enums["questionnaire_statuses"];

export type Assessment = DatabaseRow<"assessments">;
export type Interview = DatabaseRow<"interviews">;
export type InterviewResponse = DatabaseRow<"interview_responses">;

export type InterviewResponseAction = DatabaseRow<"interview_response_actions">;
export type SharedRole = DatabaseRow<"shared_roles">;
export type AssessmentObjective = DatabaseRow<"assessment_objectives">;
export interface Role extends DatabaseRow<"roles"> {
  // Computed/UI-only fields (keep these):
  shared_role?: SharedRole;
  work_group?: WorkGroup & {
    asset_group?: Pick<AssetGroup, "id" | "name">;
  };
}

export type QuestionnaireRatingScale =
  DatabaseRow<"questionnaire_rating_scales">;
export type Questionnaire = DatabaseRow<"questionnaires">;

export interface QuestionnaireQuestion
  extends DatabaseRow<"questionnaire_questions"> {
  // Computed/UI-only fields:
  rating_scales: QuestionnaireRatingScale[];
}

export interface QuestionnaireStep extends DatabaseRow<"questionnaire_steps"> {
  // Computed/UI-only fields:
  questions: QuestionnaireQuestion[];
}

export interface QuestionnaireSection
  extends DatabaseRow<"questionnaire_sections"> {
  // Computed/UI-only fields:
  steps: QuestionnaireStep[];
}

export type QuestionnaireQuestionRatingScale =
  DatabaseRow<"questionnaire_question_rating_scales">;

export type QuestionnaireQuestionRole =
  DatabaseRow<"questionnaire_question_roles">;

// Assessment-specific extended types
export interface AssessmentWithCounts extends Assessment {
  interview_count: number;
  completed_interview_count: number;
  total_responses: number;
  questionnaire_name: string;
  questionnaire: {
    name: string;
  };
}

export interface AssessmentWithQuestionnaire extends Assessment {
  questionnaire: {
    id: number;
    name: string;
    description?: string;
    sections: QuestionnaireSection[];
  };
  objectives?: AssessmentObjective[];
}

export interface DesktopAssessment extends Assessment {
  objectives?: AssessmentObjective[];
  location?: {
    business_unit?: { id: number; name: string };
    region?: { id: number; name: string };
    site?: { id: number; name: string };
    asset_group?: { id: number; name: string };
    work_group?: { id: number; name: string };
    role?: { id: number; name: string };
  };
}

// Interview-specific extended types

export interface InterviewResponseWithDetails extends InterviewResponse {
  question: QuestionnaireQuestion;
  response_roles: Role[];
  actions: InterviewResponseAction[];
}
export interface InterviewWithDetails extends Interview {
  average_score: number;
  completion_rate: number;
  max_rating_value: number;
  min_rating_value: number;
  interviewee: {
    id?: number;
    full_name?: string;
    email: string | null;
    title?: string;
    phone?: string;
    role: string | null;
  };
}
export interface InterviewWithResponses extends InterviewWithDetails {
  responses: InterviewResponseWithDetails[];
  interviewer: {
    id: string | null;
    name: string | null;
  };
  assessment: {
    id: number;
    name?: string;
    type?: "onsite" | "desktop";
  };
  program: {
    id: number | null;
    name: string | null;
    program_phase_id: number | null;
    program_phase_name: string | null;
  };
}

// Extended types for UI
export interface QuestionRatingScaleWithDetails
  extends QuestionnaireQuestionRatingScale {
  rating_scale: QuestionnaireRatingScale;
}

export interface QuestionWithRoles extends QuestionnaireQuestionRole {
  role: SharedRole;
}

export interface QuestionWithRatingScales extends QuestionnaireQuestion {
  question_rating_scales: QuestionRatingScaleWithDetails[];
  question_roles?: QuestionWithRoles[];
  question_parts?: Array<{
    id: number;
    text: string;
    order_index: number;
    answer_type: string;
  }>;
}

export interface StepWithQuestions extends QuestionnaireStep {
  questions: QuestionWithRatingScales[];
}

export interface SectionWithSteps extends QuestionnaireSection {
  steps: StepWithQuestions[];
}

export interface QuestionnaireWithStructure extends Questionnaire {
  sections: SectionWithSteps[];
  questionnaire_rating_scales: QuestionnaireRatingScale[];
}


export interface QuestionnaireWithSections extends Questionnaire {
  sections: SectionWithSteps[];
}

export interface AssessmentWithQuestionnaire extends Assessment {}

export interface AssessmentMeasurement extends Measurement {
  active: boolean; // Whether this measurement is active and can be added
  status: "unavailable" | "in_use" | "available";
  data_status: "uploaded" | "not_uploaded" | "partial";
  updated_at: string | null;
  completion: number;
  isInUse?: boolean;
  description?: string;
  measurementRecordId?: number; // ID from measurements_calculated table for deletion
  calculated_value?: number; // The calculated value from measurements_calculated table
  instanceCount?: number; // Count of calculated measurement instances for this definition
  calculation: string | null; // The calculation formula or method
  calculation_type: string | null; // Type of calculation (e.g., sum, average)
  provider: string | null; // Data provider or source
  required_csv_columns: Array<{
    name: string;
    data_type: string;
    description: string | null;
  }> | null; // Required columns for CSV upload
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
