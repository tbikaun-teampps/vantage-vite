import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../types/supabase";

type InterviewStatus = Database["public"]["Enums"]["interview_statuses"];
type AssessmentStatus = Database["public"]["Enums"]["assessment_statuses"];
type ProgramStatus = Database["public"]["Enums"]["program_statuses"];

export interface ActivityData {
  total: number;
  breakdown: Record<string, number>;
}

export interface MetricData {
  title: string;
  metricType: string;
  value?: number | string;
  phaseBadge?: {
    text: string;
    color?: string;
    borderColor?: string;
  };
  badges?: Array<{
    text: string;
    color?: string;
    borderColor?: string;
    icon?: string;
  }>;
  secondaryMetrics?: Array<{
    value: number | string;
    label: string;
    icon?: string;
  }>;
  subtitle?: string;
  description?: string;
  trend?: number;
  status?: "up" | "down" | "neutral";
}

export interface ConfigOptions {
  assessments: Array<{
    id: number;
    name: string;
    status: string;
  }>;
  programs: Array<{
    id: number;
    name: string;
    status: string;
  }>;
  interviews: Array<{
    id: number;
    name: string;
    status: string;
  }>;
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
  private supabase: SupabaseClient<Database>;
  private companyId: string;

  constructor(companyId: string, supabaseClient: SupabaseClient<Database>) {
    this.companyId = companyId;
    this.supabase = supabaseClient;
  }

  async getActivityData(
    entityType: "interviews" | "assessments" | "programs"
  ): Promise<ActivityData> {
    const validEntityTypes = ["interviews", "assessments", "programs"] as const;
    if (!validEntityTypes.includes(entityType)) {
      throw new Error(`Unsupported entity type: ${entityType}`);
    }

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

  async getMetricData(
    metricType:
      | "generated-actions"
      | "generated-recommendations"
      | "worst-performing-domain"
      | "high-risk-areas"
      | "assessment-activity",
    title?: string
  ): Promise<MetricData> {
    switch (metricType) {
      case "generated-actions": {
        const { data, error } = await this.supabase
          .from("interview_response_actions")
          .select("id, company_id, is_deleted", { count: "exact" })
          .eq("company_id", this.companyId)
          .eq("is_deleted", false);

        if (error) throw error;

        // Calculate actions from last week
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const { data: recentActions, error: recentError } = await this.supabase
          .from("interview_response_actions")
          .select("id, created_at")
          .eq("company_id", this.companyId)
          .eq("is_deleted", false)
          .gte("created_at", oneWeekAgo.toISOString());

        if (recentError) throw recentError;

        return {
          title: title || "Generated Actions",
          metricType: "generated-actions",
          value: data?.length || 0,
          phaseBadge: {
            text: "improve",
            color: "#FF006E",
            borderColor: "#FF006E",
          },
          badges: [
            {
              text: `${recentActions?.length || 0} This Week`,
              color: "#9D4EDD",
              borderColor: "#9D4EDD",
            },
          ],
          subtitle: "Actions identified from interview responses",
        };
      }

      case "generated-recommendations": {
        // Placeholder - recommendations table may not exist yet
        return {
          title: title || "Generated Recommendations",
          metricType: "generated-recommendations",
          value: 0,
        };
      }

      case "worst-performing-domain": {
        return {
          title: title || "Worst Performing Domain",
          metricType: "worst-performing-domain",
          value: "-",
        };
      }

      case "high-risk-areas": {
        return {
          title: title || "High Risk Areas",
          metricType: "high-risk-areas",
          value: "-",
        };
      }

      case "assessment-activity": {
        const { data, error } = await this.supabase
          .from("assessments")
          .select("id", { count: "exact" })
          .eq("company_id", this.companyId)
          .eq("is_deleted", false);

        if (error) throw error;

        return {
          title: title || "Assessment Activity",
          metricType: "assessment-activity",
          value: data?.length || 0,
          subtitle: "Total assessments",
        };
      }

      default:
        throw new Error(`Unsupported metric type: ${metricType}`);
    }
  }

  async getConfigOptions(): Promise<ConfigOptions> {
    // Fetch assessments
    const { data: assessments, error: assessmentsError } = await this.supabase
      .from("assessments")
      .select("id, name, status")
      .eq("company_id", this.companyId)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false });
      // .in("status", ["active", "under_review", "completed"])

    if (assessmentsError) throw assessmentsError;

    // Fetch programs
    const { data: programs, error: programsError } = await this.supabase
      .from("programs")
      .select("id, name, status")
      .eq("company_id", this.companyId)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false });
      // .in("status", ["active", "under_review", "completed"])

    if (programsError) throw programsError;

    // Fetch interviews
    const { data: interviews, error: interviewsError } = await this.supabase
      .from("interviews")
      .select("id, name, status")
      .eq("company_id", this.companyId)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false })
      .limit(50); // Limit to recent interviews to avoid overwhelming the UI
      // .in("status", ["pending", "in_progress", "completed"])

    if (interviewsError) throw interviewsError;

    return {
      assessments: assessments || [],
      programs: programs || [],
      interviews: interviews || [],
    };
  }
}