import type { MetricConfig, WidgetConfig } from "@/hooks/useDashboardLayouts";
import { createClient } from "../supabase/client";
import type { Database } from "@/types/database";
import { BRAND_COLORS } from "../brand";

type InterviewStatus = Database["public"]["Enums"]["interview_statuses"];
type AssessmentStatus = Database["public"]["Enums"]["assessment_statuses"];
type ProgramStatus = Database["public"]["Enums"]["program_statuses"];

export interface ActivityData {
  total: number;
  breakdown: Record<string, number>;
}

const STATUS_MAPS = {
  interviews: [
    "pending",
    "in_progress",
    "completed",
    "cancelled",
  ] as InterviewStatus[],
  assessments: [
    "draft",
    "active",
    "under_review",
    "completed",
    "archived",
  ] as AssessmentStatus[],
  programs: [
    "draft",
    "active",
    "under_review",
    "completed",
    "archived",
  ] as ProgramStatus[],
} as const;

export class WidgetService {
  private supabase = createClient();
  private companyId: string;

  constructor(companyId: string) {
    this.companyId = companyId;
  }

  async getMetricData(config: WidgetConfig): Promise<MetricConfig> {
    console.log("getMetricData called with:", config);
    console.log("metric config:", config?.metric);
    console.log("metricType:", config?.metric?.metricType);

    switch (config?.metric?.metricType) {
      case "generated-actions": {
        const { data, error } = await this.supabase
          .from("interview_response_actions")
          .select("id, company_id, is_deleted", { count: "exact" })
          .eq("company_id", this.companyId)
          .eq("is_deleted", false);

        if (error) throw error;

        return {
          title: config.title || "Generated Actions",
          metricType: "generated-actions",
          value: data?.length || 0,
          phaseBadge: {
            text: "improve",
            color: BRAND_COLORS.pinkFlamingo,
                            borderColor: BRAND_COLORS.pinkFlamingo,
          },
          badges: [
            {
              text: `X This Week`,
              color: BRAND_COLORS.mediumPurple,
              borderColor: BRAND_COLORS.mediumPurple,
            },
          ],
          secondaryMetrics: [
            {
              value: "X",
              label: "high priority",
              icon: "IconAlertTriangle",
            },
            {
              value: "Y",
              label: "from interviews",
              icon: "IconUserCheck",
            },
          ],
          subtitle: "Actions identified from interview responses",
        };
      }
      case "generated-recommendations": {
        console.log("About to query recommendations table");
        // const { data, error } = await this.supabase
        //   .from("recommendations")
        //   .select("*", { count: "exact" })
        //   .eq("company_id", this.companyId);

        // if (error) throw error;

        const result = {
          title: config.title || "Generated Recommendations",
          metricType: "generated-recommendations",
        };

        console.log("Returning:", result);

        return result;
      }
      case "worst-performing-domain":
        return {
          title: config.title || "Worst Performing Domain",
          metricType: "worst-performing-domain",
        };
      case "high-risk-areas":
        return {
          title: config.title || "High Risk Areas",
          metricType: "high-risk-areas",
        };
      case "assessment-activity":
        return {
          title: "Assessment Activity",
          metricType: "assessment-activity",
        };
      default:
        throw new Error(
          `Unsupported metric type: ${config?.metric?.metricType}`
        );
    }
  }

  async getActivityData(config: WidgetConfig): Promise<ActivityData> {
    if (!config?.entity?.entityType) {
      throw new Error("Entity type is required for activity data");
    }

    const validEntityTypes = ["interviews", "assessments", "programs"] as const;
    if (
      !validEntityTypes.includes(
        config.entity.entityType as (typeof validEntityTypes)[number]
      )
    ) {
      throw new Error(`Unsupported entity type: ${config.entity.entityType}`);
    }

    const entityType = config.entity.entityType as keyof typeof STATUS_MAPS;
    const allStatuses = STATUS_MAPS[entityType];

    const { data, error } = await this.supabase
      .from(entityType)
      .select("id, status, company_id, is_deleted")
      .eq("company_id", this.companyId)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Initialize breakdown with all statuses set to 0
    const breakdown = allStatuses.reduce(
      (acc, status) => {
        acc[status] = 0;
        return acc;
      },
      {} as Record<string, number>
    );

    // Count actual data
    data?.forEach((item) => {
      if (
        item.status &&
        Object.prototype.hasOwnProperty.call(breakdown, item.status)
      ) {
        breakdown[item.status]++;
      }
    });

    return { total: data?.length || 0, breakdown };
  }

  async getActionsData(config: WidgetConfig): Promise<any[]> {
    if (!config?.entity?.entityType) {
      throw new Error("Entity type is required for actions data");
    }

    return ["hello", "world"];
  }
}
