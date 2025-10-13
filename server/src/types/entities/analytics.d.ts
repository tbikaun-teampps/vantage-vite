// Explicit types matching Supabase PostgREST query results
export interface RawOverallAnalyticsData {
  id: number;
  status: string;
  name: string;
  interview_responses: {
    id: number;
    rating_score: number | null;
    is_applicable: boolean;
    questionnaire_question_id: number;
    interview_response_roles: {
      id: number;
      roles: {
        id: number;
        level: string | null;
        shared_roles: {
          name: string;
          description: string | null;
        };
        work_groups: {
          id: number;
          name: string;
          description: string | null;
          asset_groups: {
            id: number;
            name: string;
            description: string | null;
            sites: {
              id: number;
              name: string;
              description: string | null;
              lat: number | null;
              lng: number | null;
              regions: {
                id: number;
                name: string;
                description: string | null;
                business_units: {
                  id: number;
                  name: string;
                  description: string | null;
                };
              };
            };
          };
        };
      };
    }[];
  }[];
}

// ===== Heatmap =====

export type HeatmapCompanyAxisType =
  | "business_unit"
  | "region"
  | "site"
  | "asset_group"
  | "work_group"
  | "role"
  | "role_level";

export type HeatmapQuestionnaireAxisType = "section" | "step" | "question";

export type HeatmapAxisType =
  | HeatmapCompanyAxisType
  | HeatmapQuestionnaireAxisType;

export type HeatmapMetric =
  | "average_score"
  | "total_interviews"
  | "completion_rate"
  | "total_actions";

export interface OverallHeatmapFilters {
  options: {
    assessments: {
      id: number;
      name: string;
      questionnaireId: number | null;
    }[];
    questionnaires: {
      id: number;
      name: string;
      assessmentIds: number[];
    }[];
    axes: Array<
      | {
          value: HeatmapCompanyAxisType;
          category: "company";
          order: number;
        }
      | {
          value: HeatmapQuestionnaireAxisType;
          category: "questionnaire";
          order: number;
        }
    >;
    metrics: HeatmapMetric[];
    regions: number[] | null;
    businessUnits: number[] | null;
    sites: number[] | null;
    assetGroups: number[] | null;
    workGroups: number[] | null;
    roles: number[] | null;
  };
}

// ===== Raw Heatmap Data Types =====
export interface RawOverallHeatmapData extends RawOverallAnalyticsData {
  questionnaires: {
    id: number;
    name: string;
    description: string | null;
    questionnaire_sections: {
      id: number;
      title: string;
      questionnaire_steps: {
        id: number;
        title: string;
        questionnaire_questions: {
          id: number;
          title: string;
          question_text: string;
          context: string | null;
        }[];
      }[];
    }[];
  }[];
}

export interface FlattenedOverallHeatmapData {
  interview_id: number;
  interview_name: string;
  interview_status: string;
  response_id: number;
  rating_score: number | null;
  is_applicable: boolean;

  //   Flattened company details
  business_unit: string | null;
  region: string | null;
  site: string | null;
  asset_group: string | null;
  work_group: string | null;
  role: string | null;
  role_level: string | null;

  //   Geographic data
  site_lat: number | null;
  site_lng: number | null;

  //   Question details (can be null if question not found in hierarchy)
  section_id: number | null;
  section_title: string | null;
  step_id: number | null;
  step_title: string | null;
  question_id: number | null;
  question_title: string | null;
  question_text: string | null;
  question_context: string | null;
}

export interface HeatmapMetricResult {
  x: string;
  y: string;
  value: number | null;
  sampleSize: number;
  metadata: object;
}

// ===== Geographical Map =====

export interface GeographicalMapSiteData {
  name: string;
  lat: number | null;
  lng: number | null;
  region: string;
  businessUnit: string;
  score: number;
  interviews: number;
  totalActions: number;
  completionRate: number;
}

export interface GeographicalMapFilters {
  options: {
    assessments: {
      id: number;
      name: string;
      questionnaireId: number | null;
    }[];
    questionnaires: {
      id: number;
      name: string;
      assessmentIds: number[];
    }[];
  };
}
