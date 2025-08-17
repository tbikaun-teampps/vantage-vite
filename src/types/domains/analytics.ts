/**
 * Analytics, Charts, and Reporting Types
 * All types related to data visualization, metrics, and analytics
 */

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