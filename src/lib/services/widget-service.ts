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

    // TODO: scope these by assessment or program

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
          title: config.title || "Generated Recommendations (coming soon)",
          metricType: "generated-recommendations (coming soon)",
        };

        console.log("Returning:", result);

        return result;
      }
      case "worst-performing-domain":
        return {
          title: config.title || "Worst Performing Domain (coming soon)",
          metricType: "worst-performing-domain (coming soon)",
        };
      case "high-risk-areas":
        return {
          title: config.title || "High Risk Areas (coming soon)",
          metricType: "high-risk-areas (coming soon)",
        };
      case "assessment-activity":
        return {
          title: "Assessment Activity (coming soon)",
          metricType: "assessment-activity (coming soon)",
        };
      default:
        throw new Error(
          `Unsupported metric type: ${config?.metric?.metricType}`
        );
    }
  }

  async getActivityData(config: WidgetConfig): Promise<ActivityData> {
    console.log("getActivityData config: ", config);
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

    console.log("Fetched activity data:", data);

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

  async getTableData(config: WidgetConfig): Promise<{
    rows: Array<Record<string, string | number>>;
    columns: Array<{ key: string; label: string }>;
  }> {
    if (!config?.table?.entityType) {
      throw new Error("Entity type is required for table data");
    }

    switch (config.table.entityType) {
      case "actions":
        return {
          columns: [
            { key: "location", label: "Location" },
            { key: "date", label: "Date" },
            { key: "title", label: "Title" },
            { key: "description", label: "Description" },
          ],
          rows: [
            {
              id: "1",
              location: "Australia > Western Australia > Boddington Mine",
              date: "2023-01-01",
              title: "Develop Comprehensive Training Program",
              description:
                "Create a structured training curriculum for work identification and notification creation, including site-specific materials and SAP training modules.",
            },
          ],
        };
      case "recommendations":
        return {
          columns: [
            { key: "location", label: "Location" },
            { key: "date", label: "Date" },
            { key: "title", label: "Title" },
            { key: "description", label: "Description" },
            {
              key: "status",
              label: "Status",
            },
            { key: "priority", label: "Priority" },
          ],
          rows: [
            {
              id: "1",
              location: "Australia > Western Australia > Boddington Mine",
              date: "2023-01-01",
              title: "Safety Procedures Update",
              description:
                "Please review the updated safety procedures for the Boddington Mine.",
              status: "in_progress",
              priority: "high",
            },
            {
              id: "2",
              location: "Australia > Western Australia > Boddington Mine",
              date: "2023-01-01",
              title: "Establish Daily Backlog Management Process",
              content:
                "Implement daily backlog review processes with clear accountability for planners and supervisors. Create standards for backlog management including elimination of duplicates, standing work orders, and outdated tasks. Integrate equipment criticality into prioritization decisions.",
              description:
                "Maintenance backlog is growing without systematic management, leading to delayed critical work and resource inefficiencies. No formal process exists for backlog review and prioritization. Location: Iron Ore Operations > Pilbara Region > Tom Price Mine > Open Pit Operations",
              priority: "medium",
              status: "in_progress",
            },
          ],
        };
      case "comments":
        return {
          columns: [
            { key: "name", label: "Name" },
            { key: "date", label: "Date" },
            { key: "comment", label: "Comment" },
            { key: "question", label: "Question" },
            {
              key: "assessmentName",
              label: "Assessment Name",
            },
            {
              key: "interviewName",
              label: "Interview Name",
            },
          ],
          rows: [
            {
              id: "1",
              name: "John Doe",
              date: "2023-01-01",
              question: "What is the extend of your work order backlog?",
              comment: "We need to review this with the team.",
              assessmentName: "Assessment 1",
              interviewName: "Interview 1",
            },
          ],
        };
      default:
        throw new Error(`Unsupported entity type: ${config.table.entityType}`);
    }
  }
}
