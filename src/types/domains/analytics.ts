/**
 * Analytics, Charts, and Reporting Types
 * All types related to data visualization, metrics, and analytics
 */

import type {
  AssessmentMetrics,
  AssessmentProgress,
  AssessmentStatus,
  InterviewStatus,
} from "./assessment";

// Chart data types
export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
  metadata?: Record<string, any>;
}

export interface TimeSeriesDataPoint {
  date: string;
  value: number;
  name?: string;
  category?: string;
}

export interface LineChartDataItem extends TimeSeriesDataPoint {
  trend?: "up" | "down" | "stable";
}

export interface PieChartDataItem extends ChartDataPoint {
  percentage: number;
}

export interface HeatmapDataItem {
  x: string | number;
  y: string | number;
  value: number;
  color?: string;
}

export interface ScatterPlotDataItem {
  x: number;
  y: number;
  name?: string;
  size?: number;
  color?: string;
}

// Map visualization types
export interface MapDataPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  score: number;
  interviews: number;
  completion_rate: number;
  region: string;
  business_unit: string;
  metadata?: Record<string, any>;
}

export interface MapRegion {
  id: string;
  name: string;
  coordinates: Array<[number, number]>;
  center: [number, number];
  data_points: MapDataPoint[];
  aggregate_metrics: {
    total_interviews: number;
    average_score: number;
    completion_rate: number;
  };
}

// Metrics and KPI types
export interface MetricValue {
  current: number;
  previous?: number;
  change_percentage?: number;
  trend: "up" | "down" | "stable";
  format: "number" | "percentage" | "currency" | "duration";
}

export interface KPICard {
  id: string;
  title: string;
  value: MetricValue;
  icon?: string;
  color?: string;
  description?: string;
}

// Dashboard analytics
export interface DashboardMetrics {
  assessments: {
    total: MetricValue;
    active: MetricValue;
    completed: MetricValue;
    completion_rate: MetricValue;
  };
  interviews: {
    total: MetricValue;
    pending: MetricValue;
    completed: MetricValue;
    average_score: MetricValue;
  };
  companies: {
    total: MetricValue;
    active: MetricValue;
  };
  users: {
    total: MetricValue;
    active: MetricValue;
  };
}

// Assessment analytics
export interface AssessmentAnalytics {
  assessment_id: number;
  metrics: {
    total_interviews: number;
    completed_interviews: number;
    completion_rate: number;
    average_score: number;
    score_distribution: ScoreDistribution[];
    progress_over_time: TimeSeriesDataPoint[];
  };
  performance_by_role: RolePerformance[];
  performance_by_location: LocationPerformance[];
  question_analytics: QuestionPerformance[];
  trends: {
    score_trend: "improving" | "declining" | "stable";
    completion_trend: "improving" | "declining" | "stable";
    participation_trend: "increasing" | "decreasing" | "stable";
  };
}

export interface ScoreDistribution {
  rating: number;
  count: number;
  percentage: number;
}

export interface RolePerformance {
  role_id: number;
  role_name: string;
  interview_count: number;
  average_score: number;
  completion_rate: number;
  score_distribution: ScoreDistribution[];
}

export interface LocationPerformance {
  location_id: number;
  location_name: string;
  location_type: "business_unit" | "region" | "site" | "asset_group";
  interview_count: number;
  average_score: number;
  completion_rate: number;
  ranking: number;
}

export interface QuestionPerformance {
  question_id: number;
  question_title: string;
  response_count: number;
  average_score: number;
  score_distribution: ScoreDistribution[];
  improvement_opportunity: boolean;
  common_themes: string[];
}

// Comparison analytics
export interface ComparisonAnalytics {
  primary_entity: AnalyticsEntity;
  comparison_entities: AnalyticsEntity[];
  metrics: {
    score_comparison: ChartDataPoint[];
    completion_rate_comparison: ChartDataPoint[];
    volume_comparison: ChartDataPoint[];
  };
  insights: AnalyticsInsight[];
}

export interface AnalyticsEntity {
  id: number;
  name: string;
  type: "assessment" | "business_unit" | "region" | "site" | "questionnaire";
  metrics: {
    average_score: number;
    completion_rate: number;
    total_interviews: number;
    time_period: string;
  };
}

export interface AnalyticsInsight {
  type: "positive" | "negative" | "neutral";
  title: string;
  description: string;
  confidence: number;
  action_items?: string[];
}

// Filter types
export interface AnalyticsFilters {
  assessment_ids?: number[];
  questionnaire_ids?: number[];
  business_unit_ids?: number[];
  region_ids?: number[];
  site_ids?: number[];
  asset_group_ids?: number[];
  role_ids?: number[];
  interview_status?: InterviewStatus[];
  assessment_status?: AssessmentStatus[];
  score_range?: {
    min: number;
    max: number;
  };
  date_range: TimePeriod;
  interviewer_ids?: string[];
  created_by_ids?: string[];
}

export interface TimePeriod {
  start: string;
  end: string;
  preset?:
    | "last_7_days"
    | "last_30_days"
    | "last_90_days"
    | "last_year"
    | "ytd"
    | "custom";
}

// Export types
export interface ExportConfig {
  format: "pdf" | "excel" | "csv" | "json";
  include_charts: boolean;
  include_raw_data: boolean;
  filters: AnalyticsFilters;
  template?: string;
}

// Analytics store

export interface AnalyticsStore {
  // State
  assessmentProgress: Record<string, AssessmentProgress>;
  assessmentMetrics: Record<string, AssessmentMetrics>;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;

  // Actions
  loadAssessmentProgress: (assessmentId: string) => Promise<void>;
  loadAssessmentMetrics: (assessmentId: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}
