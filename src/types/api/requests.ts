/**
 * API Request Types
 * All types for data transfer objects (DTOs) used in API requests
 */

import type { CreateInput, UpdateInput } from '../utils'

// Authentication requests
export interface LoginRequest {
  email: string
  password: string
}

export interface SignUpRequest {
  email: string
  password: string
  full_name: string
  signup_code: string
}

export interface ResetPasswordRequest {
  email: string
}

export interface UpdatePasswordRequest {
  current_password: string
  new_password: string
}

// Profile requests
export interface UpdateProfileRequest {
  full_name?: string
  email?: string
  is_demo_mode?: boolean
  demo_progress?: {
    toursCompleted?: string[]
    featuresExplored?: string[]
    lastActivity?: string
    welcomeShown?: boolean
  }
}

// Company hierarchy requests
export type CreateCompanyRequest = CreateInput<'companies'>
export type UpdateCompanyRequest = UpdateInput<'companies'>

export type CreateBusinessUnitRequest = CreateInput<'business_units'>
export type UpdateBusinessUnitRequest = UpdateInput<'business_units'>

export type CreateRegionRequest = CreateInput<'regions'>
export type UpdateRegionRequest = UpdateInput<'regions'>

export type CreateSiteRequest = CreateInput<'sites'>
export type UpdateSiteRequest = UpdateInput<'sites'>

export type CreateAssetGroupRequest = CreateInput<'asset_groups'>
export type UpdateAssetGroupRequest = UpdateInput<'asset_groups'>

export type CreateOrgChartRequest = CreateInput<'org_charts'>
export type UpdateOrgChartRequest = UpdateInput<'org_charts'>

export type CreateRoleRequest = CreateInput<'roles'>
export type UpdateRoleRequest = UpdateInput<'roles'>

// Assessment requests
export type CreateAssessmentRequest = CreateInput<'assessments'>
export type UpdateAssessmentRequest = UpdateInput<'assessments'>

export type CreateAssessmentObjectiveRequest = CreateInput<'assessment_objectives'>
export type UpdateAssessmentObjectiveRequest = UpdateInput<'assessment_objectives'>

// Interview requests
export type CreateInterviewRequest = CreateInput<'interviews'>
export type UpdateInterviewRequest = UpdateInput<'interviews'>

export type CreateInterviewResponseRequest = CreateInput<'interview_responses'>
export type UpdateInterviewResponseRequest = UpdateInput<'interview_responses'>

export type CreateInterviewResponseActionRequest = CreateInput<'interview_response_actions'>
export type UpdateInterviewResponseActionRequest = UpdateInput<'interview_response_actions'>

export interface CreateInterviewResponseWithRolesRequest extends CreateInterviewResponseRequest {
  role_ids?: number[]
}

export interface UpdateInterviewResponseWithRolesRequest extends UpdateInterviewResponseRequest {
  role_ids?: number[]
}

// Questionnaire requests
export type CreateQuestionnaireRequest = CreateInput<'questionnaires'>
export type UpdateQuestionnaireRequest = UpdateInput<'questionnaires'>

export type CreateQuestionnaireSectionRequest = CreateInput<'questionnaire_sections'>
export type UpdateQuestionnaireSectionRequest = UpdateInput<'questionnaire_sections'>

export type CreateQuestionnaireSectionStepRequest = CreateInput<'questionnaire_section_steps'>
export type UpdateQuestionnaireSectionStepRequest = UpdateInput<'questionnaire_section_steps'>

export type CreateQuestionnaireQuestionRequest = CreateInput<'questionnaire_questions'>
export type UpdateQuestionnaireQuestionRequest = UpdateInput<'questionnaire_questions'>

export interface CreateQuestionnaireQuestionWithRolesRequest extends CreateQuestionnaireQuestionRequest {
  role_ids?: number[]
}

export interface UpdateQuestionnaireQuestionWithRolesRequest extends UpdateQuestionnaireQuestionRequest {
  role_ids?: number[]
}

// Bulk operation requests
export interface BulkCreateRequest<T> {
  items: T[]
  batch_size?: number
}

export interface BulkUpdateRequest<T> {
  items: Array<T & { id: number }>
  batch_size?: number
}

export interface BulkDeleteRequest {
  ids: number[]
  cascade?: boolean
}

// Reorder requests
export interface ReorderRequest {
  items: Array<{
    id: number
    order_index: number
  }>
}

// Copy/duplicate requests
export interface CopyAssessmentRequest {
  source_assessment_id: number
  name: string
  description?: string
  copy_interviews?: boolean
  copy_responses?: boolean
}

export interface CopyQuestionnaireRequest {
  source_questionnaire_id: number
  name: string
  description?: string
  copy_as_template?: boolean
}

// Import/export requests
export interface ImportRequest {
  file_data: string | ArrayBuffer
  format: 'csv' | 'xlsx' | 'json'
  mapping?: Record<string, string>
  options?: {
    skip_duplicates?: boolean
    update_existing?: boolean
    validate_only?: boolean
  }
}

export interface ExportRequest {
  entity_type: 'assessments' | 'interviews' | 'questionnaires' | 'companies'
  entity_ids?: number[]
  format: 'csv' | 'xlsx' | 'json' | 'pdf'
  filters?: Record<string, any>
  include_relations?: boolean
  template?: string
}

// Search and filter requests
export interface SearchRequest {
  query: string
  entity_types?: string[]
  filters?: Record<string, any>
  limit?: number
  offset?: number
}

export interface FilterRequest {
  filters: Record<string, any>
  sort_by?: string
  sort_order?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

// Analytics requests
export interface AnalyticsRequest {
  metric_types: string[]
  entity_ids?: number[]
  entity_type?: string
  date_range: {
    start: string
    end: string
  }
  group_by?: string[]
  filters?: Record<string, any>
}

export interface ComparisonRequest {
  primary_entity: {
    type: string
    id: number
  }
  comparison_entities: Array<{
    type: string
    id: number
  }>
  metrics: string[]
  time_period: {
    start: string
    end: string
  }
}

// Report generation requests
export interface GenerateReportRequest {
  report_type: string
  config: {
    entities: Array<{
      type: string
      ids: number[]
    }>
    metrics: string[]
    time_period: {
      start: string
      end: string
    }
    filters?: Record<string, any>
    format: 'pdf' | 'xlsx' | 'html'
    template?: string
  }
  delivery?: {
    email_recipients?: string[]
    schedule?: {
      frequency: 'once' | 'daily' | 'weekly' | 'monthly'
      start_date?: string
      end_date?: string
    }
  }
}

// File upload requests
export interface UploadRequest {
  file: File
  entity_type: string
  entity_id?: number
  category?: string
  metadata?: Record<string, any>
}

// Sharing requests
export interface ShareRequest {
  entity_type: string
  entity_id: number
  share_with: {
    user_ids?: string[]
    company_ids?: number[]
    public?: boolean
  }
  permissions: {
    can_view: boolean
    can_edit: boolean
    can_delete: boolean
    can_share: boolean
  }
  expires_at?: string
  message?: string
}

// Notification requests
export interface NotificationRequest {
  recipient_ids: string[]
  type: string
  title: string
  message: string
  data?: Record<string, any>
  channels?: ('email' | 'in_app' | 'sms')[]
  schedule_at?: string
}

// Feedback requests
export interface FeedbackRequest {
  type: 'bug' | 'feature' | 'improvement' | 'general'
  title: string
  description: string
  category?: string
  priority?: 'low' | 'medium' | 'high'
  attachments?: string[]
  user_agent?: string
  page_url?: string
}