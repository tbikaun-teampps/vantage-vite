// import type { WidgetConfig } from "@/hooks/useDashboardLayouts";

export interface MetricData {
  value: number | string;
  label: string;
  entityType: string;
  entities: Array<{ id: string; name: string }>;
}

export interface TableData {
  entityType: string;
  rows: Array<Record<string, string | number>>;
  columns: Array<{ key: string; label: string }>;
}