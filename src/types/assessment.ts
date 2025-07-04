// types/assessment.ts

// Core entity types
export interface Assessment {
  id: number;
  created_at: string;
  updated_at: string;
  questionnaire_id: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'under_review' | 'completed' | 'archived';
  start_date?: string;
  end_date?: string;
  created_by: string;
  type: "onsite" | "desktop";
}

export interface Interview {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  interviewer_id: string;
  assessment_id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
}

export interface InterviewResponse {
  id: number;
  created_at: string;
  updated_at: string;
  rating_score: number;
  comments?: string;
  answered_at: string;
  created_by: string;
  interview_id: number;
  questionnaire_question_id: number;
}

export interface InterviewResponseRole {
  id: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  role_id: number;
  interview_response_id: number;
}

export interface InterviewResponseAction {
  id: number;
  created_at: string;
  updated_at: string;
  company_id: number;
  title?: string;
  description: string;
  interview_response_id: number;
  created_by: string;
}

// Shared types from questionnaire system
export interface SharedRole {
  id: number;
  created_at: string;
  name: string;
  description?: string;
  created_by: string;
}

export interface OrgChart {
  id: number;
  name: string;
  site_id: number;
}

export interface Role {
  id: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  org_chart_id: number;
  name: string;
  level?: string;
  department?: string;
  description?: string;
  requirements?: string;
  sort_order: number;
  is_active: boolean;
  code?: string;
  reports_to_role_id?: number;
  shared_role_id?: number;
  shared_role?: SharedRole;
  org_chart?: OrgChart;
}

export interface RatingScale {
  id: number;
  name: string;
  description?: string;
  value: number
}

export interface Questionnaire {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  status: 'draft' | 'active' | 'under_review' | 'archived';
  description?: string;
  created_by: string;
  guidelines?: string;
  company_id: number;
}

export interface QuestionnaireQuestion {
  id: number;
  title: string;
  question_text: string;
  context?: string;
  order_index: number;
  rating_scales: RatingScale[];
}

export interface QuestionnaireStep {
  id: number;
  title: string;
  order_index: number;
  questions: QuestionnaireQuestion[];
}

export interface QuestionnaireSection {
  id: number;
  title: string;
  order_index: number;
  steps: QuestionnaireStep[];
}

// Assessment-specific extended types
export interface AssessmentWithCounts extends Assessment {
  interview_count: number;
  completed_interview_count: number;
  total_responses: number;
  questionnaire_name: string;
  created_by_email?: string;
  last_modified: string;
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

// Interview-specific extended types
export interface InterviewResponseWithDetails extends InterviewResponse {
  question: QuestionnaireQuestion;
  response_roles: Role[];
  actions: InterviewResponseAction[];
}

export interface InterviewWithResponses extends Interview {
  responses: InterviewResponseWithDetails[];
  interviewer: {
    id: string;
    name: string;
  };
  company: {
    id: number,
    name: string;
  };
  assessment?: {
    id: number;
    name: string;
    type: 'onsite' | 'desktop';
  };
}

export interface InterviewProgress {
  interview_id: number;
  total_questions: number;
  answered_questions: number;
  completion_percentage: number;
  current_step?: string;
  current_section?: string;
  next_question_id?: string;
}

export interface InterviewSession {
  interview: InterviewWithResponses;
  progress: InterviewProgress;
  current_question?: QuestionnaireQuestion;
  questionnaire_structure: QuestionnaireSection[];
}

// Analytics-specific types
export interface AssessmentProgress {
  assessment_id: number;
  total_interviews: number;
  completed_interviews: number;
  total_questions: number;
  answered_questions: number;
  average_score: number;
  completion_percentage: number;
}

export interface ScoreDistribution {
  score_range: string;
  count: number;
  percentage: number;
}

export interface QuestionAnalytics {
  question_id: number;
  question_title: string;
  average_score: number;
  response_count: number;
  score_variance: number;
}

export interface RoleAnalytics {
  role_id: number;
  role_name: string;
  average_score: number;
  response_count: number;
}

export interface InterviewerAnalytics {
  interviewer_id: string;
  interviewer_name: string;
  interviews_completed: number;
  average_completion_time: number;
}

export interface AssessmentAnalytics {
  assessment_id: number;
  score_distribution: ScoreDistribution[];
  question_analytics: QuestionAnalytics[];
  role_analytics: RoleAnalytics[];
  interviewer_analytics: InterviewerAnalytics[];
  generated_at: string;
}

export interface TrendData {
  period: string;
  average_score: number;
  completion_rate: number;
  interview_count: number;
}

export interface ComparisonData {
  assessment_id: number;
  assessment_name: string;
  average_score: number;
  completion_rate: number;
  interview_count: number;
}

// Data transfer objects
export interface AssessmentObjective {
  title: string;
  description?: string;
}

export interface CreateAssessmentData {
  questionnaire_id: string;
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  company_id?: number;
  business_unit_id?: number;
  region_id?: number;
  site_id?: number;
  asset_group_id?: number;
  objectives?: AssessmentObjective[];
}

export interface UpdateAssessmentData {
  name?: string;
  description?: string;
  status?: Assessment['status'];
  start_date?: string;
  end_date?: string;
}

export interface CreateInterviewData {
  assessment_id: string;
  interviewer_id: string;
  name?: string;
  notes?: string;
  company_id: number;
}

export interface UpdateInterviewData {
  status?: Interview['status'];
  name?: string;
  notes?: string;
}

export interface CreateInterviewResponseData {
  interview_id: string;
  questionnaire_question_id: string;
  rating_score: number;
  comments?: string;
  role_ids?: string[];
  company_id: number;
}

export interface UpdateInterviewResponseData {
  rating_score?: number;
  comments?: string;
  role_ids?: string[];
}

export interface CreateInterviewResponseActionData {
  interview_response_id: string;
  title?: string;
  description: string;
  company_id: number;
}

export interface UpdateInterviewResponseActionData {
  title?: string;
  description?: string;
}

// Filter and search types
export interface AssessmentFilters {
  status?: Assessment['status'][];
  questionnaire_id?: number;
  created_by?: string;
  company_id?: number;
  date_range?: {
    start: string;
    end: string;
  };
  search?: string;
}

export interface InterviewFilters {
  assessment_id?: number;
  status?: Interview['status'][];
  interviewer_id?: string;
  company_id?: number;
  date_range?: {
    start: string;
    end: string;
  };
}

export interface AnalyticsFilters {
  assessment_ids?: number[];
  date_range?: {
    start: string;
    end: string;
  };
  role_ids?: number[];
  interviewer_ids?: string[];
}

// Enhanced Analytics Types
export interface ChartDataPoint {
  label: string;
  value: number;
  category?: string;
  metadata?: Record<string, any>;
}

export interface MapDataPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  value: number;
  category?: string;
  metadata?: {
    total_interviews?: number;
    completion_rate?: number;
    average_score?: number;
    [key: string]: any;
  };
}

export interface EnhancedAnalyticsFilters extends AnalyticsFilters {
  business_unit_ids?: string[];
  region_ids?: string[];
  site_ids?: string[];
  asset_group_ids?: string[];
  questionnaire_questionnaire_section_ids?: string[];
  questionnaire_questionnaire_step_ids?: string[];
}

export type DataType = 'average_score' | 'total_interviews' | 'completion_rate';
export type GroupByOption = 'questionnaire_section' | 'questionnaire_step' | 'business_unit' | 'region' | 'site' | 'asset_group';
export type ColorByOption = 'business_unit' | 'region' | 'performance_tier' | 'completion_status' | 'risk_level';

export interface VisualizationConfig {
  assessmentIds: string[];
  dataType: DataType;
  groupBy: GroupByOption;
  colorBy?: ColorByOption;
}

export interface FilterOptions {
  assessments: Array<{id: string, name: string}>;
  business_units: Array<{id: string, name: string}>;
  regions: Array<{id: string, name: string}>;
  sites: Array<{id: string, name: string}>;
  asset_groups: Array<{id: string, name: string}>;
  questionnaire_sections: Array<{id: string, name: string}>; // Note: maps title to name for consistency
  questionnaire_steps: Array<{id: string, name: string}>; // Note: maps title to name for consistency
}

// Assessment Metrics Types for Bar Chart
export interface AssessmentMetrics {
  assessment: {
    id: number;
    name: string;
    status: string;
    start_date?: string;
    end_date?: string;
  };
  questionnaire: {
    id: number;
    name: string;
    description?: string;
    total_questions: number;
    total_sections: number;
    total_steps: number;
  };
  hierarchy: {
    company?: HierarchyMetrics;
    business_unit?: HierarchyMetrics;
    region?: HierarchyMetrics;
    site?: HierarchyMetrics;
    asset_group?: HierarchyMetrics;
  };
  question_breakdown: Record<string, QuestionMetrics>;
  role_breakdown: Record<string, RoleMetrics>;
  summary: SummaryMetrics;
  raw_responses: RawResponseData[];
  generated_at: string;
}

export interface RawResponseData {
  response_id: number;
  interview_id: number;
  interview_name: string;
  interview_status: string;
  question_id: number;
  question: {
    id: number;
    title: string;
    question_text: string;
    step: string;
    section: string;
    step_order: number;
    section_order: number;
    order_index: number;
  };
  rating_score: number;
  comments: string;
  answered_at: string;
  role: {
    id: number;
    name: string;
    level?: string;
    department?: string;
  };
}

export interface HierarchyMetrics {
  id: number;
  name: string;
  code?: string;
  parent_type?: string;
  metrics: {
    average_score: number;
    completion_rate: number;
    total_responses: number;
    total_possible: number;
    total_interviews: number;
    response_rate_per_interview: number;
    score_distribution: Record<number, number>;
  };
}

export interface QuestionMetrics {
  id: number;
  title: string;
  question_text: string;
  section: string;
  step: string;
  section_order: number;
  step_order: number;
  question_order: number;
  metrics: {
    average_score: number;
    completion_rate: number;
    total_responses: number;
    unique_interviews: number;
    score_distribution: Record<number, number>;
    comments: Array<{
      comment: string;
      score: number;
      interview: string;
    }>;
  };
}

export interface RoleMetrics {
  id: number;
  name: string;
  level?: string;
  department?: string;
  metrics: {
    average_score: number;
    completion_rate: number;
    total_responses: number;
    unique_interviews: number;
    score_distribution: Record<number, number>;
    comments: Array<{
      comment: string;
      score: number;
      interview: string;
    }>;
  };
}

export interface SummaryMetrics {
  total_interviews: number;
  completed_interviews: number;
  total_questions: number;
  total_possible_responses: number;
  total_actual_responses: number;
  overall_completion_rate: number;
  overall_average_score: number;
  interviews_completion_rate: number;
}

// Bar Chart Data Types
export interface BarChartDataItem {
  label: string;
  value: number;
  id: string;
  metadata: {
    average_score?: number;
    completion_rate?: number;
    total_interviews?: number;
    total_responses?: number;
    risk_level?: 'low' | 'medium' | 'high' | 'critical';
    trend?: 'improving' | 'stable' | 'declining';
  };
}