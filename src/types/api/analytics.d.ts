import type { paths } from ".";

export type GetOverallDesktopGeographicalMapResponseData =
  paths["/analytics/geographical-map/overall/desktop"]["get"]["responses"][200]["content"]["application/json"]["data"];

export type GetOverallHeatmapFiltersResponseData =
  paths["/analytics/heatmap/overall/filters"]["get"]["responses"][200]["content"]["application/json"]["data"];

export type GetOverallOnsiteHeatmapResponseData =
  paths["/analytics/heatmap/overall/onsite"]["get"]["responses"][200]["content"]["application/json"]["data"];

export type GetOverallOnsiteHeatmapParams =
  paths["/analytics/heatmap/overall/onsite"]["get"]["parameters"]["query"];

export type GetOverallDesktopHeatmapResponseData =
  paths["/analytics/heatmap/overall/desktop"]["get"]["responses"][200]["content"]["application/json"]["data"];

export type GetOverallDesktopHeatmapParams =
  paths["/analytics/heatmap/overall/desktop"]["get"]["parameters"]["query"];

export type GetProgramInterviewHeatmapResponseData =
  paths["/analytics/heatmap/program-interviews/{programId}"]["get"]["responses"][200]["content"]["application/json"]["data"];

export type GetProgramInterviewHeatmapParams =
  paths["/analytics/heatmap/program-interviews/{programId}"]["get"]["parameters"]["query"];

export type GetProgramMeasurementHeatmapResponseData =
  paths["/analytics/heatmap/program-measurements/{programId}"]["get"]["responses"][200]["content"]["application/json"]["data"];

export type GetOverallGeographicalMapFiltersResponseData =
  paths["/analytics/overall/geographical-map/filters"]["get"]["responses"][200]["content"]["application/json"]["data"];

export type GetOverallOnsiteGeographicalMapResponseData =
  paths["/analytics/geographical-map/overall-onsite"]["get"]["responses"][200]["content"]["application/json"]["data"];

export type GetOverallDesktopGeographicalMapResponseData =
  paths["/analytics/geographical-map/overall-desktop"]["get"]["responses"][200]["content"]["application/json"]["data"];
