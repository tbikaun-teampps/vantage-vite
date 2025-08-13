/**
 * Dashboard Analytics and Metrics Types
 * All types related to dashboard data, metrics, and analytics
 */

export interface DashboardItem {
  id: number;
  path: string;
  path_name: string;
  region: string;
  risk_level: "low" | "medium" | "high" | "critical";
  process_trend: "improving" | "stable" | "declining";
  compliance_score: number;
  last_desktop: string;
  last_onsite: string;
  action_status: "none_required" | "in_progress" | "completed" | "overdue";
  action_owner: string;
  action_due: string | null;
  notes: string;
}

export interface DashboardMetrics {
  assessments: {
    total?: number;
    trend?: number;
    status?: "up" | "down";
  };
  generatedActions?: {
    total?: number;
    fromLastWeek?: number;
    highPriority?: number;
    fromInterviews?: number;
    trend?: number;
    status?: "up" | "down";
  };
  worstPerformingArea: {
    name?: string;
    trend?: number;
    status?: "up" | "down";
    avgScore?: number;
    affectedLocations?: number;
  };
  criticalAssets: {
    count?: number;
    overdue?: number;
    avgCompliance?: number;
    site?: string;
    riskBreakdown?: {
      critical: number;
      high: number;
      medium: number;
      low: number;
    };
    worstLocation?: string;
  };
  peopleInterviewed: {
    total?: number;
    trend?: number;
    status?: "up" | "down";
  };
}

export interface DashboardAction {
  id: number;
  org_path: string;
  score: number;
  assessment_type: "onsite" | "desktop";
  domain: string;
  action: string;
  assessment_name: string;
  interview_name: string;
  response_comments?: string;
  action_created_at: string;
}

export interface DomainAnalytics {
  domain: string;
  avgScore: number;
  avgScorePercentage: number;
  locationCount: number;
  questionCount: number;
  responseCount: number;
  actionCount: number;
  trend: number;
  status: "up" | "down";
}

export interface AssetRiskAnalytics {
  location: string;
  avgScore: number;
  avgScorePercentage: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  questionCount: number;
  responseCount: number;
  actionCount: number;
  lastAssessed: string;
  overdue: boolean;
}

export interface QuestionAnalytics {
  question_id: number;
  question_title: string;
  domain: string;
  assessment_type: "onsite" | "desktop";
  location: string; // Single location (exploded)
  avg_score: number; // Average rating scale value (1-4, etc.)
  max_scale_value: number; // Maximum possible rating scale value
  avg_score_percentage: number; // Percentage representation
  response_count: number;
  action_count: number;
  risk_level: "low" | "medium" | "high" | "critical";
  last_assessed: string; // Most recent assessment date for this question at this location
  assessments: string[];
  actions: Array<{
    id: number;
    title?: string;
    description: string;
    created_at: string;
    response_score: number;
    assessment_name: string;
    interview_name: string;
    org_path: string;
  }>;
  worst_responses: Array<{
    score: number;
    assessment_name: string;
    interview_name: string;
    org_path: string;
    comments?: string;
  }>;
}

// Service method parameters
export interface DashboardFilters {
  assessmentIds?: number[];
  limit?: number;
}

// Analytics calculation helpers
export interface RiskCalculationParams {
  actionCount: number;
  scorePercentage: number;
  percentiles?: {
    p10: number;
    p25: number;
    p75: number;
  };
}

export interface LocationMetrics {
  scores: number[];
  percentages: number[];
  questionCount: number;
  lastAssessed: string;
}

export interface DomainMetrics {
  scores: number[];
  maxScales: number[];
  locations: Set<string>;
  questions: Set<string>;
  responses: any[];
}