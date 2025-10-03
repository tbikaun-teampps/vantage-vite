import { apiClient } from "./client";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export async function getOverallGeographicalMapFilters(
  companyId: string
): Promise<{
  questionnaires: { id: number; name: string; assessmentIds: number[] }[];
  assessments: { id: number; name: string; questionnaireId: number }[];
}> {
  const response = await apiClient.get<
    ApiResponse<{
      options: {
        questionnaires: { id: number; name: string; assessmentIds: number[] }[];
        assessments: {
          id: number;
          name: string;
          questionnaireId: number;
        }[];
      };
    }>
  >(`/analytics/overall/geographical-map/filters?companyId=${companyId}`);

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to fetch geographical map filters"
    );
  }

  return response.data.data.options;
}

export async function getOverallGeographicalMap(
  companyId: string,
  questionnaireId: number,
  assessmentId?: number
): Promise<
  {
    name: string;
    lat: number;
    lng: number;
    region: string;
    businessUnit: string;
    score: number;
    interviews: number;
    totalActions: number;
    completionRate: number;
  }[]
> {
  let url = `/analytics/overall/geographical-map?companyId=${companyId}&questionnaireId=${questionnaireId}`;
  if (assessmentId) {
    url += `&assessmentId=${assessmentId}`;
  }

  const response = await apiClient.get<
    ApiResponse<
      {
        name: string;
        lat: number;
        lng: number;
        region: string;
        businessUnit: string;
        score: number;
        interviews: number;
        totalActions: number;
        completionRate: number;
      }[]
    >
  >(url);

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch geographical map");
  }

  return response.data.data;
}

export async function getOverallHeatmapFilters(companyId: string): Promise<{
  questionnaires: { id: number; name: string; assessmentIds: number[] }[];
  assessments: { id: number; name: string; questionnaireId: number }[];
  axes: { value: string; category: string }[];
  metrics: string[];
}> {
  const response = await apiClient.get<
    ApiResponse<{
      options: {
        questionnaires: { id: number; name: string; assessmentIds: number[] }[];
        assessments: {
          id: number;
          name: string;
          questionnaireId: number;
        }[];
        axes: { value: string; category: string }[];
        metrics: string[];
      };
    }>
  >(`/analytics/overall/heatmap/filters?companyId=${companyId}`);

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch heatmap filters");
  }

  return response.data.data.options;
}

export async function getOverallHeatmap(
  companyId: string,
  questionnaireId: number,
  assessmentId?: number,
  xAxis?:
    | "business_unit"
    | "region"
    | "site"
    | "asset_group"
    | "work_group"
    | "role"
    | "role_level"
    | "section"
    | "step"
    | "question",
  yAxis?:
    | "business_unit"
    | "region"
    | "site"
    | "asset_group"
    | "work_group"
    | "role"
    | "role_level"
    | "section"
    | "step"
    | "question"
): Promise<{
  xLabels: string[];
  yLabels: string[];
  metrics: {
    average_score: {
      data: {
        x: string;
        y: string;
        value: number;
        sampleSize: number;
        metadata: any;
      }[];
      values: number[];
    };
    total_interviews: {
      data: {
        x: string;
        y: string;
        value: number;
        sampleSize: number;
        metadata: any;
      }[];
      values: number[];
    };
    completion_rate: {
      data: {
        x: string;
        y: string;
        value: number;
        sampleSize: number;
        metadata: any;
      }[];
      values: number[];
    };
    total_actions: {
      data: {
        x: string;
        y: string;
        value: number;
        sampleSize: number;
        metadata: any;
      }[];
      values: number[];
    };
  };
  config: {
    xAxis: string;
    yAxis: string;
    questionnaireId: number;
    assessmentId: number | null;
  };
}> {
  let url = `/analytics/overall/heatmap?companyId=${companyId}&questionnaireId=${questionnaireId}`;
  if (assessmentId) {
    url += `&assessmentId=${assessmentId}`;
  }
  if (xAxis) {
    url += `&xAxis=${xAxis}`;
  }
  if (yAxis) {
    url += `&yAxis=${yAxis}`;
  }

  const response = await apiClient.get<
    ApiResponse<{
      xLabels: string[];
      yLabels: string[];
      metrics: {
        average_score: {
          data: {
            x: string;
            y: string;
            value: number;
            sampleSize: number;
            metadata: any;
          }[];
          values: number[];
        };
        total_interviews: {
          data: {
            x: string;
            y: string;
            value: number;
            sampleSize: number;
            metadata: any;
          }[];
          values: number[];
        };
        completion_rate: {
          data: {
            x: string;
            y: string;
            value: number;
            sampleSize: number;
            metadata: any;
          }[];
          values: number[];
        };
        total_actions: {
          data: {
            x: string;
            y: string;
            value: number;
            sampleSize: number;
            metadata: any;
          }[];
          values: number[];
        };
      };
      config: {
        xAxis: string;
        yAxis: string;
        questionnaireId: number;
        assessmentId: number | null;
      };
    }>
  >(url);

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch heatmap");
  }

  return response.data.data;
}
