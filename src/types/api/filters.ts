/**
 * Filter and Search Types
 * All types related to filtering, searching, and querying data
 */

import type { AssessmentStatus, InterviewStatus } from '../domains/assessment'
import type { QuestionnaireStatus } from '../domains/questionnaire'

// Base filter types
export interface BaseFilters {
  search?: string
  limit?: number
  offset?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export interface DateRangeFilter {
  date_range?: {
    start: string
    end: string
    preset?: 'today' | 'yesterday' | 'last_7_days' | 'last_30_days' | 'last_90_days' | 'last_year' | 'ytd' | 'custom'
  }
}

export interface StatusFilter<T extends string> {
  status?: T[]
}

export interface UserFilter {
  created_by?: string
  updated_by?: string
  assigned_to?: string
}

export interface CompanyHierarchyFilter {
  company_id?: number
  business_unit_id?: number
  region_id?: number
  site_id?: number
  asset_group_id?: number
}

// Entity-specific filters
export interface AssessmentFilters extends BaseFilters, DateRangeFilter, StatusFilter<AssessmentStatus>, UserFilter, CompanyHierarchyFilter {
  questionnaire_id?: number
  type?: ('onsite' | 'desktop')[]
  interviewer_id?: string
  has_objectives?: boolean
  completion_rate_min?: number
  completion_rate_max?: number
  average_score_min?: number
  average_score_max?: number
}

export interface InterviewFilters extends BaseFilters, DateRangeFilter, StatusFilter<InterviewStatus>, UserFilter {
  assessment_id?: number
  interviewer_id?: string
  has_responses?: boolean
  response_count_min?: number
  response_count_max?: number
  completion_percentage_min?: number
  completion_percentage_max?: number
  average_score_min?: number
  average_score_max?: number
}

export interface QuestionnaireFilters extends BaseFilters, DateRangeFilter, StatusFilter<QuestionnaireStatus>, UserFilter {
  type?: string[]
  is_template?: boolean
  template_category?: string
  rating_scale_id?: number
  has_assessments?: boolean
  section_count_min?: number
  section_count_max?: number
  question_count_min?: number
  question_count_max?: number
  tags?: string[]
}

export interface CompanyFilters extends BaseFilters, DateRangeFilter, UserFilter {
  industry?: string[]
  size?: string[]
  is_demo?: boolean
  has_assessments?: boolean
  location?: string
  employee_count_min?: number
  employee_count_max?: number
}

export interface UserFilters extends BaseFilters, DateRangeFilter {
  role?: string[]
  is_demo_mode?: boolean
  company_id?: number
  last_login_min?: string
  last_login_max?: string
  email_verified?: boolean
}

// Advanced search filters
export interface SearchFilters extends BaseFilters {
  entity_types?: ('assessment' | 'interview' | 'questionnaire' | 'company' | 'user')[]
  content_types?: ('title' | 'description' | 'comments' | 'metadata')[]
  match_type?: 'exact' | 'partial' | 'fuzzy'
  highlight?: boolean
  facets?: string[]
}

// Faceted search
export interface FacetedSearchFilters extends SearchFilters {
  facets: {
    [key: string]: string[] | number[] | boolean[]
  }
}

export interface SearchFacet {
  field: string
  values: FacetValue[]
  type: 'terms' | 'range' | 'date_range'
}

export interface FacetValue {
  value: string | number | boolean
  count: number
  selected?: boolean
}

// Analytics filters
export interface AnalyticsFilters extends BaseFilters, DateRangeFilter, CompanyHierarchyFilter {
  metric_types?: string[]
  group_by?: string[]
  exclude_demo_data?: boolean
  min_sample_size?: number
}

export interface ComparisonFilters extends AnalyticsFilters {
  baseline_entity: {
    type: string
    id: number
  }
  comparison_entities: Array<{
    type: string
    id: number
  }>
  comparison_period?: {
    start: string
    end: string
  }
}

// Report filters
export interface ReportFilters extends BaseFilters, DateRangeFilter, UserFilter {
  report_type?: string[]
  format?: ('pdf' | 'xlsx' | 'csv' | 'html')[]
  status?: ('pending' | 'generating' | 'completed' | 'failed')[]
  is_scheduled?: boolean
  shared?: boolean
}

// Activity and audit filters
export interface ActivityFilters extends BaseFilters, DateRangeFilter, UserFilter {
  entity_type?: string[]
  entity_id?: number
  action_type?: string[]
  ip_address?: string
  user_agent?: string
  success?: boolean
}

export interface AuditFilters extends ActivityFilters {
  severity?: ('low' | 'medium' | 'high' | 'critical')[]
  category?: string[]
  affected_tables?: string[]
  has_sensitive_data?: boolean
}

// Notification filters
export interface NotificationFilters extends BaseFilters, DateRangeFilter {
  type?: string[]
  is_read?: boolean
  priority?: ('low' | 'medium' | 'high' | 'urgent')[]
  channel?: ('email' | 'in_app' | 'sms' | 'push')[]
  recipient_id?: string
}

// File and media filters
export interface FileFilters extends BaseFilters, DateRangeFilter, UserFilter {
  file_type?: string[]
  mime_type?: string[]
  size_min?: number
  size_max?: number
  entity_type?: string[]
  entity_id?: number
  is_public?: boolean
  has_virus_scan?: boolean
  virus_scan_status?: ('clean' | 'infected' | 'suspicious' | 'pending')[]
}

// Geographic filters
export interface LocationFilters {
  country?: string[]
  state?: string[]
  city?: string[]
  postal_code?: string[]
  coordinates?: {
    lat: number
    lng: number
    radius_km: number
  }
  timezone?: string[]
}

// Performance filters
export interface PerformanceFilters extends BaseFilters, DateRangeFilter {
  score_min?: number
  score_max?: number
  completion_rate_min?: number
  completion_rate_max?: number
  response_time_min?: number
  response_time_max?: number
  participation_rate_min?: number
  participation_rate_max?: number
}

// Advanced query types
export interface QueryBuilder {
  conditions: QueryCondition[]
  logic?: 'AND' | 'OR'
  nested_queries?: QueryBuilder[]
}

export interface QueryCondition {
  field: string
  operator: QueryOperator
  value: unknown
  data_type: 'string' | 'number' | 'boolean' | 'date' | 'array'
}

export type QueryOperator = 
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'greater_than_or_equal'
  | 'less_than'
  | 'less_than_or_equal'
  | 'in'
  | 'not_in'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'is_null'
  | 'is_not_null'
  | 'between'
  | 'not_between'

// Saved filters and presets
export interface SavedFilter {
  id: string
  name: string
  description?: string
  entity_type: string
  filters: Record<string, unknown>
  is_public: boolean
  created_by: string
  created_at: string
  usage_count: number
  last_used: string
}

export interface FilterPreset {
  id: string
  name: string
  filters: Record<string, unknown>
  is_default?: boolean
  order_index: number
}

// Filter validation
export interface FilterValidation {
  is_valid: boolean
  errors: FilterValidationError[]
  warnings: FilterValidationWarning[]
}

export interface FilterValidationError {
  field: string
  message: string
  value?: unknown
}

export interface FilterValidationWarning {
  field: string
  message: string
  suggestion?: string
}

// Quick filters for common use cases
export interface QuickFilters {
  my_items?: boolean
  recent?: boolean
  favorites?: boolean
  shared_with_me?: boolean
  needs_attention?: boolean
  high_priority?: boolean
  overdue?: boolean
  completed_today?: boolean
  completed_this_week?: boolean
  completed_this_month?: boolean
}

// Export filter configuration
export interface ExportFilters {
  include_deleted?: boolean
  include_draft?: boolean
  include_archived?: boolean
  flatten_hierarchy?: boolean
  include_metadata?: boolean
  include_relationships?: boolean
  date_format?: string
  timezone?: string
  locale?: string
}