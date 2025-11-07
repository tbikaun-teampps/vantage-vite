import { z } from "zod";

// Enum schemas
export const AssessmentTypeEnum = z.enum(["onsite", "desktop"]);

export const AxisTypeEnum = z.enum([
  "business_unit",
  "region",
  "site",
  "asset_group",
  "work_group",
  "role",
  "role_level",
  "section",
  "step",
  "question",
]);

export const AxisTypeDesktopEnum = z.enum([
  "business_unit",
  "region",
  "site",
  "asset_group",
  "work_group",
  "role",
  "role_level",
]);

export const QuestionnaireTypeEnum = z.enum(["presite", "onsite"]);

// Params schemas
export const ProgramIdParamsSchema = z.object({
  programId: z.coerce.number(),
});

// Querystring schemas
export const HeatmapFiltersQuerystringSchema = z.object({
  companyId: z.string(),
  assessmentType: AssessmentTypeEnum,
});

export const OnsiteHeatmapQuerystringSchema = z.object({
  companyId: z.string(),
  questionnaireId: z.coerce.number(),
  assessmentId: z.coerce.number().optional(),
  xAxis: AxisTypeEnum.optional(),
  yAxis: AxisTypeEnum.optional(),
});

export const DesktopHeatmapQuerystringSchema = z.object({
  companyId: z.string(),
  assessmentId: z.coerce.number().optional(),
  xAxis: AxisTypeDesktopEnum.optional(),
});

export const OnsiteGeographicalMapQuerystringSchema = z.object({
  companyId: z.string(),
  questionnaireId: z.coerce.number(),
  assessmentId: z.coerce.number().optional(),
});

export const DesktopGeographicalMapQuerystringSchema = z.object({
  companyId: z.string(),
  assessmentId: z.coerce.number().optional(),
});

export const GeographicalMapFiltersQuerystringSchema = z.object({
  companyId: z.string(),
  assessmentType: AssessmentTypeEnum,
});

export const ProgramInterviewsQuerystringSchema = z.object({
  questionnaireType: QuestionnaireTypeEnum,
});

// Heatmap response schemas
const HeatmapDataPointSchema = z.object({
  x: z.string(),
  y: z.string(),
  value: z.number().nullable(),
  sampleSize: z.number(),
  metadata: z.any(),
});

const HeatmapMetricDataSchema = z.object({
  data: z.array(HeatmapDataPointSchema),
  values: z.array(z.number().nullable()),
});

const HeatmapMetricsSchema = z.object({
  average_score: HeatmapMetricDataSchema,
  total_interviews: HeatmapMetricDataSchema,
  completion_rate: HeatmapMetricDataSchema,
  total_actions: HeatmapMetricDataSchema,
});

const HeatmapConfigSchema = z.object({
  xAxis: z.string(),
  yAxis: z.string(),
  questionnaireId: z.number().optional(),
  assessmentId: z.number().nullable().optional(),
});

export const OnsiteHeatmapResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    xLabels: z.array(z.string()),
    yLabels: z.array(z.string()),
    metrics: HeatmapMetricsSchema,
    config: HeatmapConfigSchema,
  }),
});

export const DesktopHeatmapResponseSchema = z.object({
  success: z.boolean(),
  data: z.any(), // Complex structure, using any for flexibility
});

export const HeatmapFiltersResponseSchema = z.object({
  success: z.boolean(),
  data: z.any(), // Filters structure varies, using any for flexibility
});

// Geographical map response schemas
const GeographicalMapPointSchema = z.object({
  name: z.string(),
  lat: z.number(),
  lng: z.number(),
  region: z.string(),
  businessUnit: z.string(),
  score: z.number(),
  interviews: z.number(),
  totalActions: z.number(),
  completionRate: z.number(),
});

export const GeographicalMapResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(GeographicalMapPointSchema),
});

export const DesktopGeographicalMapResponseSchema = z.object({
  success: z.boolean(),
  data: z.any(), // Desktop map has different structure
});

const AssessmentOptionSchema = z.object({
  id: z.number(),
  name: z.string(),
  questionnaireId: z.number().nullable(),
});

const QuestionnaireOptionSchema = z.object({
  id: z.number(),
  name: z.string(),
  assessmentIds: z.array(z.number()),
});

const MeasurementOptionSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export const GeographicalMapFiltersResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    options: z.object({
      assessments: z.array(AssessmentOptionSchema),
      questionnaires: z.array(QuestionnaireOptionSchema),
      measurements: z.array(MeasurementOptionSchema),
      aggregationMethods: z.array(z.enum(["average", "sum", "count"])),
    }),
  }),
});

// Program interview heatmap schemas
const ProgramInterviewHeatmapDataPointSchema = z.object({
  section: z.string(),
  phaseTransition: z.string(),
  difference: z.number(),
  percentChange: z.number(),
  fromValue: z.number(),
  toValue: z.number(),
  fromPhase: z.string(),
  toPhase: z.string(),
  responseCountChange: z.number(),
  interviewCountChange: z.number(),
});

export const ProgramInterviewHeatmapResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    data: z.array(ProgramInterviewHeatmapDataPointSchema),
    transitions: z.array(z.string()),
    sections: z.array(z.string()),
    metadata: z.object({
      totalResponses: z.number(),
      totalInterviews: z.number(),
    }),
  }),
});

// Program measurements heatmap schemas
const ProgramMeasurementDataPointSchema = z.object({
  measurement: z.string(),
  phaseTransition: z.string(),
  difference: z.number(),
  percentChange: z.number(),
  fromValue: z.number(),
  toValue: z.number(),
  fromPhase: z.string(),
  toPhase: z.string(),
});

export const ProgramMeasurementsHeatmapResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    data: z.array(ProgramMeasurementDataPointSchema),
    measurements: z.array(z.string()),
    transitions: z.array(z.string()),
  }),
});

// Error response for routes that might return errors
export const AnalyticsErrorResponseSchema = z.object({
  success: z.boolean(),
  error: z.string(),
});

// Empty data response for program endpoints when no data
export const EmptyProgramDataResponseSchema = z.object({
  data: z.array(z.any()),
  transitions: z.array(z.any()).optional(),
  sections: z.array(z.any()).optional(),
  measurements: z.array(z.any()).optional(),
});

// Export all schemas as a collection
export const AnalyticsSchemas = {
  // Enums
  AssessmentTypeEnum,
  AxisTypeEnum,
  AxisTypeDesktopEnum,
  QuestionnaireTypeEnum,

  // Params
  ProgramIdParamsSchema,

  // Querystring
  HeatmapFiltersQuerystringSchema,
  OnsiteHeatmapQuerystringSchema,
  DesktopHeatmapQuerystringSchema,
  OnsiteGeographicalMapQuerystringSchema,
  DesktopGeographicalMapQuerystringSchema,
  GeographicalMapFiltersQuerystringSchema,
  ProgramInterviewsQuerystringSchema,

  // Responses
  HeatmapFiltersResponseSchema,
  OnsiteHeatmapResponseSchema,
  DesktopHeatmapResponseSchema,
  GeographicalMapResponseSchema,
  DesktopGeographicalMapResponseSchema,
  GeographicalMapFiltersResponseSchema,
  ProgramInterviewHeatmapResponseSchema,
  ProgramMeasurementsHeatmapResponseSchema,
  AnalyticsErrorResponseSchema,
  EmptyProgramDataResponseSchema,
};
