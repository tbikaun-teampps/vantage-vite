import type { DatabaseRow, Enums } from "./utils";

export type MetricProvidersEnum = Enums["metric_providers"];
export type MetricAlignmentLevelsEnum = Enums["metric_alignment_levels"];

export type MetricDefinition = DatabaseRow<"metric_definitions">;
export type CalculatedMetric = DatabaseRow<"calculated_metrics">;
export type MetricAlignment = DatabaseRow<"metric_alignments">;
