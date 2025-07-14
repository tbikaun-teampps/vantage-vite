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
  interviewer_id?: string | null;
  assessment_id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  is_public?: boolean;
  access_code?: string;
  public_url_slug?: string;
  assigned_role_id?: string;
  interviewee_email?: string;
  enabled: boolean;
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
  level?: string;
  department?: string;
  description?: string;
  requirements?: string;
  sort_order: number;
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
  average_score: number;
  completion_rate: number;
  interviewer: {
    id: string;
    name: string;
  };
  assessment: {
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
  interviewer_id?: string | null;
  name?: string;
  notes?: string;
  company_id: number;
  is_public?: boolean;
  access_code?: string;
  public_url_slug?: string;
  assigned_role_id?: string;
  interviewee_email?: string;
  enabled: boolean;
}

export interface UpdateInterviewData {
  status?: Interview['status'];
  name?: string;
  notes?: string;
}

export interface CreateInterviewResponseData {
  interview_id: string;
  questionnaire_question_id: string;
  rating_score?: number | null;
  comments?: string;
  role_ids?: string[];
}

export interface UpdateInterviewResponseData {
  rating_score?: number | null;
  comments?: string;
  role_ids?: string[];
}

export interface CreateInterviewResponseActionData {
  interview_response_id: string;
  title?: string;
  description: string;
}

export interface UpdateInterviewResponseActionData {
  title?: string;
  description?: string;
}

// Filter and search types
export interface AssessmentFilters {
  type: 'onsite' | 'desktop';
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
  date_range?: {
    start: string;
    end: string;
  };
}