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
  scope?: {
    assessmentName?: string;
    programName?: string;
  }
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
    scope?: {
      assessmentName?: string;
      programName?: string;
    };
  }> {
    if (!config?.table?.entityType) {
      throw new Error("Entity type is required for table data");
    }

    switch (config.table.entityType) {
      case "actions": {
        let query = this.supabase
          .from("interview_response_actions")
          .select(
            "*, interview:interview_id!inner(id, name, assessment:assessment_id(id, name)), response:interview_response_id(id, question:questionnaire_question_id(id, question_text))"
          )
          .eq("company_id", this.companyId)
          .eq("is_deleted", false);

        // Apply assessment scope filter if provided
        if (config.scope?.assessmentId) {
          query = query.eq(
            "interview.assessment_id",
            config.scope.assessmentId
          );
        }

        const { data, error } = await query.order("created_at", {
          ascending: false,
        });

        if (error) throw error;

        const columns = [
          { key: "title", label: "Title" },
          { key: "description", label: "Description" },
          { key: "question", label: "Question" },
          { key: "interview", label: "Interview" },
          { key: "assessment", label: "Assessment" },
          {
            key: "createdAt",
            label: "Created At",
          },
        ];
        const rows =
          data?.map((item) => ({
            id: item.id,
            interview: item.interview?.name || "-",
            assessment: item.interview?.assessment?.name || "-",
            question: item.response?.question?.question_text || "-",
            title: item.title,
            description: item.description,
            createdAt: new Date(item.created_at).toLocaleDateString(),
          })) || [];

        let scope = undefined;
        if (config.scope?.assessmentId) {
          const { data: assessmentData } = await this.supabase
            .from("assessments")
            .select("name")
            .eq("id", config.scope.assessmentId)
            .single();

          if (assessmentData) {
            scope = { assessmentName: assessmentData.name };
          }
        }

        return { columns, rows, scope };
      }
      case "recommendations": {
        let query = this.supabase
          .from("recommendations")
          .select("*")
          .eq("company_id", this.companyId)
          .eq("is_deleted", false);

        // Apply program scope filter if provided
        // Note: Recommendations are linked to programs, not assessments directly
        if (config.scope?.programId) {
          query = query.eq("program_id", config.scope.programId);
        }

        const { data, error } = await query.order("created_at", {
          ascending: false,
        });

        if (error) throw error;

        const cols = [
          {
            key: "content",
            label: "Content",
          },
          {
            key: "context",
            label: "Context",
          },
          {
            key: "title",
            label: "Title",
          },
          {
            key: "priority",
            label: "Priority",
          },
          {
            key: "status",
            label: "Status",
          },
        ];

        const rows =
          data?.map((item) => ({
            id: item.id,
            content: item.content,
            context: item.context,
            title: item.title,
            priority: item.priority,
            status: item.status,
          })) || [];

        let scope = undefined;
        if (config.scope?.programId) {
          const { data: programData } = await this.supabase
            .from("programs")
            .select("name")
            .eq("id", config.scope.programId)
            .single();

          if (programData) {
            scope = { programName: programData.name };
          }
        }

        return { columns: cols, rows, scope };
      }
      case "comments": {
        let query = this.supabase
          .from("interview_responses")
          .select(
            "*, interview:interview_id!inner(id, name, assessment:assessment_id(id, name)), question:questionnaire_question_id(id, question_text)"
          )
          .eq("company_id", this.companyId)
          .neq("comments", null)
          .neq("comments", "")
          .eq("is_deleted", false);

        // Apply assessment scope filter if provided
        if (config.scope?.assessmentId) {
          query = query.eq(
            "interview.assessment_id",
            config.scope.assessmentId
          );
        }

        const { data, error } = await query.order("created_at", {
          ascending: false,
        });

        if (error) throw error;

        const cols = [
          {
            key: "comments",
            label: "Comments",
          },
          { key: "question", label: "Question" },
          { key: "interview", label: "Interview" },
          { key: "assessment", label: "Assessment" },
        ];

        const rows =
          data?.map((item) => ({
            id: item.id,
            comments: item.comments,
            question: item.question?.question_text || "N/A",
            interview: item.interview?.name || "N/A",
            assessment: item.interview?.assessment?.name || "N/A",
          })) || [];

        let scope = undefined;
        if (config.scope?.assessmentId) {
          const { data: assessmentData } = await this.supabase
            .from("assessments")
            .select("name")
            .eq("id", config.scope.assessmentId)
            .single();

          if (assessmentData) {
            scope = { assessmentName: assessmentData.name };
          }
        }

        return { columns: cols, rows, scope };
      }
      default:
        throw new Error(`Unsupported entity type: ${config.table.entityType}`);
    }
  }
}
