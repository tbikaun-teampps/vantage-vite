/**
 * API Response Types
 * All types for API responses and data returned from the server
 */

import type { 
  Assessment, 
  AssessmentWithCounts, 
  Interview, 
  InterviewWithResponses,
  InterviewResponse,
  AssessmentMetrics 
} from '../domains/assessment'
import type { 
  Questionnaire, 
  QuestionnaireWithCounts,
  QuestionnaireHierarchy 
} from '../domains/questionnaire'
import type { 
  Company, 
  CompanyWithCounts,
  CompanyTreeNode 
} from '../domains/company'
import type { UserProfile } from '../domains/auth'

// Generic API response wrapper
export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
  success?: boolean
}

// Paginated response wrapper
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    per_page: number
    total: number
    total_pages: number
    has_next: boolean
    has_previous: boolean
  }
}

// Generic list response
export interface ListResponse<T> {
  items: T[]
  total: number
  limit: number
  offset: number
}

// Authentication responses
export interface LoginResponse {
  user: UserProfile
  access_token: string
  refresh_token: string
  expires_in: number
  redirect_path?: string
}

export interface RefreshTokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number
}

export interface UserSessionResponse {
  user: UserProfile
  session: {
    access_token: string
    refresh_token: string
    expires_at: string
  }
  permissions: string[]
}

// Entity responses
export interface AssessmentResponse extends Assessment {}
export interface AssessmentListResponse extends PaginatedResponse<AssessmentWithCounts> {}

export interface InterviewResponse extends Interview {}
export interface InterviewDetailResponse extends InterviewWithResponses {}
export interface InterviewListResponse extends PaginatedResponse<Interview> {}

export interface QuestionnaireResponse extends Questionnaire {}
export interface QuestionnaireDetailResponse extends QuestionnaireHierarchy {}
export interface QuestionnaireListResponse extends PaginatedResponse<QuestionnaireWithCounts> {}

export interface CompanyResponse extends Company {}
export interface CompanyDetailResponse extends CompanyWithCounts {}
export interface CompanyTreeResponse {
  tree: CompanyTreeNode[]
  expanded_nodes: string[]
}

// Search responses
export interface SearchResponse {
  results: SearchResult[]
  total: number
  search_time_ms: number
  suggestions?: string[]
}

export interface SearchResult {
  id: string
  type: 'assessment' | 'interview' | 'questionnaire' | 'company' | 'user'
  title: string
  description?: string
  url?: string
  score: number
  highlight?: {
    title?: string[]
    description?: string[]
  }
  metadata?: Record<string, unknown>
}

// Analytics responses
export interface AnalyticsResponse {
  metrics: Record<string, number | string>
  charts: ChartData[]
  insights: AnalyticsInsight[]
  generated_at: string
}

export interface ChartData {
  id: string
  type: 'bar' | 'line' | 'pie' | 'area' | 'scatter'
  title: string
  data: unknown[]
  config?: Record<string, unknown>
}

export interface AnalyticsInsight {
  type: 'positive' | 'negative' | 'neutral' | 'warning'
  title: string
  description: string
  confidence: number
  action_items?: string[]
}

export interface DashboardMetricsResponse {
  kpis: KPIData[]
  charts: ChartData[]
  recent_activity: ActivityItem[]
  alerts: AlertItem[]
}

export interface KPIData {
  id: string
  title: string
  value: number | string
  change?: {
    value: number
    type: 'increase' | 'decrease'
    period: string
  }
  format: 'number' | 'percentage' | 'currency' | 'duration'
  color?: string
}

export interface ActivityItem {
  id: string
  type: string
  title: string
  description?: string
  user: Pick<UserProfile, 'id' | 'full_name'>
  timestamp: string
  metadata?: Record<string, unknown>
}

export interface AlertItem {
  id: string
  type: 'info' | 'warning' | 'error' | 'success'
  title: string
  message: string
  created_at: string
  is_read: boolean
  action_url?: string
}

// File upload responses
export interface UploadResponse {
  file_id: string
  filename: string
  size: number
  mime_type: string
  url: string
  uploaded_at: string
}

export interface ImportResponse {
  job_id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  total_records: number
  processed_records: number
  successful_records: number
  failed_records: number
  errors?: ImportError[]
  preview?: unknown[]
}

export interface ImportError {
  row: number
  field?: string
  error: string
  value?: string
}

export interface ExportResponse {
  job_id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  file_url?: string
  expires_at?: string
  error_message?: string
}

// Bulk operation responses
export interface BulkOperationResponse {
  operation_id: string
  total: number
  successful: number
  failed: number
  errors?: BulkOperationError[]
  results?: unknown[]
}

export interface BulkOperationError {
  item_id: string | number
  error: string
  details?: Record<string, unknown>
}

// Validation responses
export interface ValidationResponse {
  is_valid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationError {
  field: string
  message: string
  code?: string
  value?: unknown
}

export interface ValidationWarning {
  field?: string
  message: string
  suggestion?: string
}

// Status check responses
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy'
  version: string
  timestamp: string
  checks: {
    database: ServiceStatus
    cache: ServiceStatus
    storage: ServiceStatus
    external_apis: ServiceStatus
  }
}

export interface ServiceStatus {
  status: 'up' | 'down' | 'degraded'
  response_time_ms?: number
  last_check: string
  error?: string
}

// Report responses
export interface ReportResponse {
  report_id: string
  name: string
  generated_at: string
  format: string
  file_url?: string
  expires_at: string
  metadata: {
    total_records: number
    filters_applied: Record<string, unknown>
    generation_time_ms: number
  }
}

export interface ReportListResponse extends PaginatedResponse<ReportSummary> {}

export interface ReportSummary {
  id: string
  name: string
  type: string
  status: 'pending' | 'generating' | 'completed' | 'failed'
  created_at: string
  created_by: Pick<UserProfile, 'id' | 'full_name'>
  file_size?: number
  download_count: number
}

// Sharing responses
export interface ShareResponse {
  share_id: string
  share_url: string
  expires_at?: string
  permissions: SharePermissions
  created_at: string
}

export interface SharePermissions {
  can_view: boolean
  can_edit: boolean
  can_delete: boolean
  can_share: boolean
}

// Notification responses
export interface NotificationResponse {
  notifications: NotificationItem[]
  unread_count: number
  total_count: number
}

export interface NotificationItem {
  id: string
  type: string
  title: string
  message: string
  data?: Record<string, unknown>
  is_read: boolean
  created_at: string
  action_url?: string
}

// System responses
export interface SystemInfoResponse {
  version: string
  environment: string
  features: FeatureFlag[]
  maintenance: MaintenanceInfo
  limits: SystemLimits
}

export interface FeatureFlag {
  name: string
  enabled: boolean
  description?: string
  rollout_percentage?: number
}

export interface MaintenanceInfo {
  is_scheduled: boolean
  start_time?: string
  end_time?: string
  message?: string
  affected_services?: string[]
}

export interface SystemLimits {
  max_file_size_mb: number
  max_assessments_per_company: number
  max_interviews_per_assessment: number
  max_questions_per_questionnaire: number
  rate_limit_per_minute: number
}

// Error response
export interface ErrorResponse {
  error: {
    code: string
    message: string
    details?: Record<string, unknown>
    timestamp: string
    request_id?: string
  }
  success: false
}