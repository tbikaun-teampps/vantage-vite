// stores/dashboard-store.ts
import { create } from "zustand";
import { useAuthStore } from "./auth-store";
import { useCompanyStore } from "./company-store";
import { createClient } from "@/lib/supabase/client";

export interface DashboardItem {
  id: number;
  path: string;
  path_name: string;
  region: string;
  risk_level: "low" | "medium" | "high" | "critical";
  process_trend: "improving" | "stable" | "declining";
  compliance_score: number;
  last_desktop: string;
  last_onsite: string;
  action_status: "none_required" | "in_progress" | "completed" | "overdue";
  action_owner: string;
  action_due: string | null;
  notes: string;
}

export interface DashboardMetrics {
  assessments: {
    total?: number;
    trend?: number;
    status?: "up" | "down";
  };
  generatedActions?: {
    total?: number;
    fromLastWeek?: number;
    highPriority?: number;
    fromInterviews?: number;
    trend?: number;
    status?: "up" | "down";
  };
  worstPerformingArea: {
    name?: string;
    trend?: number;
    status?: "up" | "down";
    avgScore?: number;
    affectedLocations?: number;
  };
  criticalAssets: {
    count?: number;
    overdue?: number;
    avgCompliance?: number;
    site?: string;
    riskBreakdown?: {
      critical: number;
      high: number;
      medium: number;
      low: number;
    };
    worstLocation?: string;
  };
  peopleInterviewed: {
    total?: number;
    trend?: number;
    status?: "up" | "down";
  };
}

export interface DashboardAction {
  id: number;
  org_path: string;
  score: number;
  assessment_type: "onsite" | "desktop";
  domain: string;
  action: string;
  assessment_name: string;
  interview_name: string;
  response_comments?: string;
  action_created_at: string;
}

export interface DomainAnalytics {
  domain: string;
  avgScore: number;
  avgScorePercentage: number;
  locationCount: number;
  questionCount: number;
  responseCount: number;
  actionCount: number;
  trend: number;
  status: "up" | "down";
}

export interface AssetRiskAnalytics {
  location: string;
  avgScore: number;
  avgScorePercentage: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  questionCount: number;
  responseCount: number;
  actionCount: number;
  lastAssessed: string;
  overdue: boolean;
}

export interface QuestionAnalytics {
  question_id: number;
  question_title: string;
  domain: string;
  assessment_type: "onsite" | "desktop";
  location: string; // Single location (exploded)
  avg_score: number; // Average rating scale value (1-4, etc.)
  max_scale_value: number; // Maximum possible rating scale value
  avg_score_percentage: number; // Percentage representation
  response_count: number;
  action_count: number;
  risk_level: "low" | "medium" | "high" | "critical";
  last_assessed: string; // Most recent assessment date for this question at this location
  assessments: string[];
  actions: Array<{
    id: number;
    title?: string;
    description: string;
    created_at: string;
    response_score: number;
    assessment_name: string;
    interview_name: string;
    org_path: string;
  }>;
  worst_responses: Array<{
    score: number;
    assessment_name: string;
    interview_name: string;
    org_path: string;
    comments?: string;
  }>;
}

interface DashboardStore {
  metrics: DashboardMetrics;
  actions: DashboardAction[];
  questionAnalytics: QuestionAnalytics[];
  domainAnalytics: DomainAnalytics[];
  assetRiskAnalytics: AssetRiskAnalytics[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadMetrics: () => Promise<void>;
  loadActions: () => Promise<void>;
  loadQuestionAnalytics: (limit?: number) => Promise<void>;
  loadDomainAnalytics: () => Promise<void>;
  loadAssetRiskAnalytics: () => Promise<void>;
  loadGeneratedActionsAnalytics: () => Promise<void>;
  updateMetricsFromAnalytics: () => void;
  setItems: (items: DashboardItem[]) => void;
  setMetrics: (metrics: DashboardMetrics) => void;
  setActions: (actions: DashboardAction[]) => void;
  setQuestionAnalytics: (analytics: QuestionAnalytics[]) => void;
  setDomainAnalytics: (analytics: DomainAnalytics[]) => void;
  setAssetRiskAnalytics: (analytics: AssetRiskAnalytics[]) => void;

  // Store management
  reset: () => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  actions: [],
  questionAnalytics: [],
  domainAnalytics: [],
  assetRiskAnalytics: [],
  metrics: {
    assessments: {
      total: undefined,
      trend: undefined,
      status: undefined,
    },
    worstPerformingArea: {
      name: undefined,
      trend: undefined,
      status: undefined,
    },
    criticalAssets: {
      count: undefined,
      overdue: undefined,
      avgCompliance: undefined,
      site: undefined,
    },
    peopleInterviewed: {
      total: undefined,
      trend: undefined,
      status: undefined,
    },
  },
  isLoading: false,
  error: null,

  loadMetrics: async () => {
    const { isDemoMode } = useAuthStore.getState();
    const { selectedCompany } = useCompanyStore.getState();

    if (!selectedCompany) {
      set({ error: "No company selected" });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const supabase = createClient();

      // Get total assessments with company join
      let assessmentsQuery = supabase
        .from("assessments")
        .select("*, company:companies!inner(id, is_demo, deleted_at)", {
          count: "exact",
          head: true,
        })
        .is("company.deleted_at", null);

      if (isDemoMode) {
        assessmentsQuery = assessmentsQuery.eq("company.is_demo", true);
      } else {
        assessmentsQuery = assessmentsQuery
          .eq("company.id", selectedCompany.id)
          .eq("company.is_demo", false);
      }

      const { count: totalAssessments, error: assessmentsError } =
        await assessmentsQuery;

      if (assessmentsError) throw assessmentsError;

      // Get total interviews with company join
      let interviewsQuery = supabase
        .from("interviews")
        .select("*, company:companies!inner(id, is_demo, deleted_at)", {
          count: "exact",
          head: true,
        })
        .is("company.deleted_at", null);

      if (isDemoMode) {
        interviewsQuery = interviewsQuery.eq("company.is_demo", true);
      } else {
        interviewsQuery = interviewsQuery
          .eq("company.id", selectedCompany.id)
          .eq("company.is_demo", false);
      }

      const { count: totalInterviews, error: interviewsError } =
        await interviewsQuery;

      if (interviewsError) throw interviewsError;

      // Update metrics with real data, keeping other values as placeholders
      set((state) => ({
        metrics: {
          ...state.metrics,
          assessments: {
            ...state.metrics.assessments,
            total: totalAssessments || 0,
          },
          peopleInterviewed: {
            ...state.metrics.peopleInterviewed,
            total: totalInterviews || 0,
          },
        },
        isLoading: false,
      }));

      // Load analytics data and update metrics
      const store = useDashboardStore.getState();
      await Promise.all([
        store.loadDomainAnalytics(),
        store.loadAssetRiskAnalytics(),
        store.loadGeneratedActionsAnalytics(),
      ]);

      // Update metrics from analytics data
      store.updateMetricsFromAnalytics();
    } catch (error) {
      console.error("Error loading dashboard metrics:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to load metrics",
        isLoading: false,
      });
    }
  },

  loadActions: async () => {
    const { isDemoMode } = useAuthStore.getState();
    const { selectedCompany } = useCompanyStore.getState();

    if (!selectedCompany) {
      set({ error: "No company selected" });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const supabase = createClient();

      // Build the complex query for aggregated actions data
      let actionsQuery = supabase
        .from("interview_response_actions")
        .select(
          `
          id,
          description,
          created_at,
          interview_responses!inner(
            rating_score,
            comments,
            questionnaire_questions!inner(
              title,
              questionnaire_steps!inner(
                title,
                questionnaire_sections!inner(title)
              )
            ),
            interviews!inner(
              name,
              assessments!inner(
                name,
                type,
                business_units!inner(name),
                regions!inner(name),
                sites!inner(name),
                company:companies!inner(id, is_demo, deleted_at)
              )
            )
          )
        `
        )
        .is(
          "interview_responses.interviews.assessments.company.deleted_at",
          null
        );

      if (isDemoMode) {
        actionsQuery = actionsQuery.eq(
          "interview_responses.interviews.assessments.company.is_demo",
          true
        );
      } else {
        actionsQuery = actionsQuery
          .eq(
            "interview_responses.interviews.assessments.company.id",
            selectedCompany.id
          )
          .eq(
            "interview_responses.interviews.assessments.company.is_demo",
            false
          );
      }

      const { data, error } = await actionsQuery;

      if (error) throw error;

      // Transform the data to match our DashboardAction interface
      const transformedActions: DashboardAction[] = (data || []).map(
        (item: any) => {
          const response = item.interview_responses;
          const interview = response.interviews;
          const assessment = interview.assessments;
          const question = response.questionnaire_questions;
          const step = question.questionnaire_steps;
          const section = step.questionnaire_sections;

          return {
            id: item.id,
            org_path: `${assessment.business_units.name} > ${assessment.regions.name} > ${assessment.sites.name}`,
            score: response.rating_score,
            assessment_type: assessment.type,
            domain: `${section.title} > ${step.title} > ${question.title}`,
            action: item.description,
            assessment_name: assessment.name,
            interview_name: interview.name,
            response_comments: response.comments,
            action_created_at: item.created_at,
          };
        }
      );

      set({ actions: transformedActions, isLoading: false });
    } catch (error) {
      console.error("Error loading actions:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to load actions",
        isLoading: false,
      });
    }
  },

  loadQuestionAnalytics: async (limit = 20) => {
    const { isDemoMode } = useAuthStore.getState();
    const { selectedCompany } = useCompanyStore.getState();

    if (!selectedCompany) {
      set({ error: "No company selected" });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const supabase = createClient();

      // Get all interview responses with their question, rating scales, and assessment details
      let responsesQuery = supabase
        .from("interview_responses")
        .select(
          `
          id,
          rating_score,
          comments,
          questionnaire_questions!inner(
            id,
            title,
            questionnaire_steps!inner(
              title,
              questionnaire_sections!inner(title),
              questionnaire_section_id
            ),
            questionnaire_question_rating_scales!inner(
              questionnaire_rating_scales!inner(
                value,
                questionnaire_id
              )
            )
          ),
          interviews!inner(
            name,
            assessments!inner(
              name,
              type,
              questionnaire_id,
              created_at,
              updated_at,
              business_units!inner(name),
              regions!inner(name),
              sites!inner(name),
              company:companies!inner(id, is_demo, deleted_at)
            )
          )
        `
        )
        .is("interviews.assessments.company.deleted_at", null);

      if (isDemoMode) {
        responsesQuery = responsesQuery.eq(
          "interviews.assessments.company.is_demo",
          true
        );
      } else {
        responsesQuery = responsesQuery
          .eq("interviews.assessments.company.id", selectedCompany.id)
          .eq("interviews.assessments.company.is_demo", false);
      }

      const { data: responses, error: responsesError } = await responsesQuery;
      if (responsesError) throw responsesError;

      // Get action details per question
      let actionsQuery = supabase
        .from("interview_response_actions")
        .select(
          `
          id,
          title,
          description,
          created_at,
          interview_responses!inner(
            rating_score,
            questionnaire_questions!inner(id),
            interviews!inner(
              name,
              assessments!inner(
                name,
                business_units!inner(name),
                regions!inner(name),
                sites!inner(name),
                company:companies!inner(id, is_demo, deleted_at)
              )
            )
          )
        `
        )
        .is(
          "interview_responses.interviews.assessments.company.deleted_at",
          null
        );

      if (isDemoMode) {
        actionsQuery = actionsQuery.eq(
          "interview_responses.interviews.assessments.company.is_demo",
          true
        );
      } else {
        actionsQuery = actionsQuery
          .eq(
            "interview_responses.interviews.assessments.company.id",
            selectedCompany.id
          )
          .eq(
            "interview_responses.interviews.assessments.company.is_demo",
            false
          );
      }

      const { data: actions, error: actionsError } = await actionsQuery;
      if (actionsError) throw actionsError;

      // Group responses by question + location combination
      const questionLocationMap = new Map<
        string,
        {
          question: any;
          location: string;
          responses: any[];
          actions: any[];
        }
      >();

      // Process responses
      (responses || []).forEach((response: any) => {
        const questionId = response.questionnaire_questions.id;
        const assessment = response.interviews.assessments;
        const location = `${assessment.business_units.name} > ${assessment.regions.name} > ${assessment.sites.name}`;
        const key = `${questionId}-${location}`;

        if (!questionLocationMap.has(key)) {
          questionLocationMap.set(key, {
            question: response.questionnaire_questions,
            location,
            responses: [],
            actions: [],
          });
        }

        questionLocationMap.get(key)!.responses.push(response);
      });

      // Process actions
      (actions || []).forEach((action: any) => {
        const questionId =
          action.interview_responses.questionnaire_questions.id;
        const assessment = action.interview_responses.interviews.assessments;
        const location = `${assessment.business_units.name} > ${assessment.regions.name} > ${assessment.sites.name}`;
        const key = `${questionId}-${location}`;

        if (questionLocationMap.has(key)) {
          questionLocationMap.get(key)!.actions.push(action);
        }
      });

      // Calculate analytics for each question-location combination
      const analytics: QuestionAnalytics[] = Array.from(
        questionLocationMap.entries()
      ).map(([key, data]) => {
        const scores = data.responses.map((r) => r.rating_score);
        const avgScore =
          scores.reduce((sum, score) => sum + score, 0) / scores.length;

        // Get max scale value from rating scales
        const ratingScales =
          data.responses[0]?.questionnaire_questions
            ?.questionnaire_question_rating_scales || [];
        const maxScaleValue =
          ratingScales.length > 0
            ? Math.max(
                ...ratingScales.map(
                  (rs: any) => rs.questionnaire_rating_scales.value
                )
              )
            : 5; // Default to 5 if no scale found

        // Calculate percentage representation
        const avgScorePercentage = Math.round((avgScore / maxScaleValue) * 100);

        // Calculate risk level based on action count
        const getRiskLevel = (
          actionCount: number
        ): "low" | "medium" | "high" => {
          if (actionCount >= 4) return "high";
          if (actionCount >= 3) return "medium";
          return "low";
        };

        // Get unique assessments for this location
        const assessments = [
          ...new Set(data.responses.map((r) => r.interviews.assessments.name)),
        ];

        // Get the most recent assessment date for this question at this location
        const lastAssessed = data.responses.reduce((latest, r) => {
          const responseDate = new Date(
            r.interviews.assessments.created_at ||
              r.interviews.assessments.updated_at
          );
          const latestDate = new Date(latest);
          return responseDate > latestDate
            ? responseDate.toISOString()
            : latest;
        }, data.responses[0]?.interviews?.assessments?.created_at || new Date().toISOString());

        // Get worst responses (bottom 3) for this location
        const worstResponses = data.responses
          .sort((a, b) => a.rating_score - b.rating_score)
          .slice(0, 3)
          .map((r) => {
            const assessment = r.interviews.assessments;
            return {
              score: r.rating_score,
              assessment_name: assessment.name,
              interview_name: r.interviews.name,
              org_path: data.location,
              comments: r.comments,
            };
          });

        // Transform actions with full details for this location
        const actionDetails = data.actions.map((a) => {
          const assessment = a.interview_responses.interviews.assessments;
          return {
            id: a.id,
            title: a.title,
            description: a.description,
            created_at: a.created_at,
            response_score: a.interview_responses.rating_score,
            assessment_name: assessment.name,
            interview_name: a.interview_responses.interviews.name,
            org_path: data.location,
          };
        });

        const step = data.question.questionnaire_steps;
        const section = step.questionnaire_sections;
        const questionId = parseInt(key.split("-")[0]);

        return {
          question_id: questionId,
          question_title: data.question.title,
          domain: `${section.title} > ${step.title} > ${data.question.title}`,
          assessment_type:
            data.responses[0]?.interviews?.assessments?.type || "onsite",
          location: data.location,
          avg_score: Math.round(avgScore * 100) / 100,
          max_scale_value: maxScaleValue,
          avg_score_percentage: avgScorePercentage,
          response_count: data.responses.length,
          action_count: data.actions.length,
          risk_level: getRiskLevel(data.actions.length),
          last_assessed: lastAssessed,
          assessments,
          actions: actionDetails,
          worst_responses: worstResponses,
        };
      });

      // Sort by average score (worst first) and take top k
      const sortedAnalytics = analytics
        .sort((a, b) => a.avg_score - b.avg_score)
        .slice(0, limit);

      set({ questionAnalytics: sortedAnalytics, isLoading: false });
    } catch (error) {
      console.error("Error loading question analytics:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to load question analytics",
        isLoading: false,
      });
    }
  },

  loadDomainAnalytics: async () => {
    const { isDemoMode } = useAuthStore.getState();
    const { selectedCompany } = useCompanyStore.getState();

    if (!selectedCompany) {
      set({ error: "No company selected" });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const supabase = createClient();

      // Get all interview responses to calculate domain analytics
      let responsesQuery = supabase
        .from("interview_responses")
        .select(
          `
          id,
          rating_score,
          questionnaire_questions!inner(
            id,
            title,
            questionnaire_steps!inner(
              title,
              questionnaire_sections!inner(title)
            ),
            questionnaire_question_rating_scales!inner(
              questionnaire_rating_scales!inner(
                value,
                questionnaire_id
              )
            )
          ),
          interviews!inner(
            name,
            assessments!inner(
              name,
              type,
              created_at,
              business_units!inner(name),
              regions!inner(name),
              sites!inner(name),
              company:companies!inner(id, is_demo, deleted_at)
            )
          )
        `
        )
        .is("interviews.assessments.company.deleted_at", null);

      if (isDemoMode) {
        responsesQuery = responsesQuery.eq(
          "interviews.assessments.company.is_demo",
          true
        );
      } else {
        responsesQuery = responsesQuery
          .eq("interviews.assessments.company.id", selectedCompany.id)
          .eq("interviews.assessments.company.is_demo", false);
      }

      const { data: responses, error: responsesError } = await responsesQuery;
      if (responsesError) throw responsesError;

      // Group by domain (section level)
      const domainMap = new Map<
        string,
        {
          scores: number[];
          maxScales: number[];
          locations: Set<string>;
          questions: Set<string>;
          responses: any[];
        }
      >();

      (responses || []).forEach((response: any) => {
        const section =
          response.questionnaire_questions.questionnaire_steps
            .questionnaire_sections;
        const domain = section.title;
        const location = `${response.interviews.assessments.business_units.name} > ${response.interviews.assessments.regions.name} > ${response.interviews.assessments.sites.name}`;

        // Get max scale value
        const ratingScales =
          response.questionnaire_questions
            .questionnaire_question_rating_scales || [];
        const maxScaleValue =
          ratingScales.length > 0
            ? Math.max(
                ...ratingScales.map(
                  (rs: any) => rs.questionnaire_rating_scales.value
                )
              )
            : 5;

        if (!domainMap.has(domain)) {
          domainMap.set(domain, {
            scores: [],
            maxScales: [],
            locations: new Set(),
            questions: new Set(),
            responses: [],
          });
        }

        const domainData = domainMap.get(domain)!;
        domainData.scores.push(response.rating_score);
        domainData.maxScales.push(maxScaleValue);
        domainData.locations.add(location);
        domainData.questions.add(response.questionnaire_questions.title);
        domainData.responses.push(response);
      });

      // Calculate domain analytics
      const domainAnalytics: DomainAnalytics[] = Array.from(
        domainMap.entries()
      ).map(([domain, data]) => {
        const avgScore =
          data.scores.reduce((sum, score) => sum + score, 0) /
          data.scores.length;
        const avgMaxScale =
          data.maxScales.reduce((sum, scale) => sum + scale, 0) /
          data.maxScales.length;
        const avgScorePercentage = Math.round((avgScore / avgMaxScale) * 100);

        return {
          domain,
          avgScore: Math.round(avgScore * 100) / 100,
          avgScorePercentage,
          locationCount: data.locations.size,
          questionCount: data.questions.size,
          responseCount: data.scores.length,
          actionCount: 0, // TODO: Calculate from actions data
          trend: 0, // TODO: Calculate trend
          status: "down" as const, // TODO: Calculate status based on trend
        };
      });

      // Sort by worst performing (lowest average score)
      const sortedDomainAnalytics = domainAnalytics.sort(
        (a, b) => a.avgScorePercentage - b.avgScorePercentage
      );

      set({ domainAnalytics: sortedDomainAnalytics, isLoading: false });
    } catch (error) {
      console.error("Error loading domain analytics:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to load domain analytics",
        isLoading: false,
      });
    }
  },

  loadAssetRiskAnalytics: async () => {
    const { isDemoMode } = useAuthStore.getState();
    const { selectedCompany } = useCompanyStore.getState();

    if (!selectedCompany) {
      set({ error: "No company selected" });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const supabase = createClient();

      // Get all interview responses to calculate asset risk analytics
      let responsesQuery = supabase
        .from("interview_responses")
        .select(
          `
          id,
          rating_score,
          questionnaire_questions!inner(
            questionnaire_question_rating_scales!inner(
              questionnaire_rating_scales!inner(value)
            )
          ),
          interviews!inner(
            assessments!inner(
              created_at,
              business_units!inner(name),
              regions!inner(name),
              sites!inner(name),
              company:companies!inner(id, is_demo, deleted_at)
            )
          )
        `
        )
        .is("interviews.assessments.company.deleted_at", null);

      if (isDemoMode) {
        responsesQuery = responsesQuery.eq(
          "interviews.assessments.company.is_demo",
          true
        );
      } else {
        responsesQuery = responsesQuery
          .eq("interviews.assessments.company.id", selectedCompany.id)
          .eq("interviews.assessments.company.is_demo", false);
      }

      const { data: responses, error: responsesError } = await responsesQuery;
      if (responsesError) throw responsesError;

      // Calculate percentiles for risk classification
      const allScores = (responses || []).map((r: any) => {
        const ratingScales =
          r.questionnaire_questions.questionnaire_question_rating_scales || [];
        const maxScaleValue =
          ratingScales.length > 0
            ? Math.max(
                ...ratingScales.map(
                  (rs: any) => rs.questionnaire_rating_scales.value
                )
              )
            : 5;
        return (r.rating_score / maxScaleValue) * 100;
      });

      allScores.sort((a, b) => a - b);
      const p10 = allScores[Math.floor(allScores.length * 0.1)] || 0;
      const p25 = allScores[Math.floor(allScores.length * 0.25)] || 0;
      const p75 = allScores[Math.floor(allScores.length * 0.75)] || 0;

      // Group by location
      const locationMap = new Map<
        string,
        {
          scores: number[];
          percentages: number[];
          questionCount: number;
          lastAssessed: string;
        }
      >();

      (responses || []).forEach((response: any) => {
        const location = `${response.interviews.assessments.business_units.name} > ${response.interviews.assessments.regions.name} > ${response.interviews.assessments.sites.name}`;

        const ratingScales =
          response.questionnaire_questions
            .questionnaire_question_rating_scales || [];
        const maxScaleValue =
          ratingScales.length > 0
            ? Math.max(
                ...ratingScales.map(
                  (rs: any) => rs.questionnaire_rating_scales.value
                )
              )
            : 5;
        const percentage = (response.rating_score / maxScaleValue) * 100;

        if (!locationMap.has(location)) {
          locationMap.set(location, {
            scores: [],
            percentages: [],
            questionCount: 0,
            lastAssessed: response.interviews.assessments.created_at,
          });
        }

        const locationData = locationMap.get(location)!;
        locationData.scores.push(response.rating_score);
        locationData.percentages.push(percentage);
        locationData.questionCount++;

        // Update last assessed if this is more recent
        if (
          new Date(response.interviews.assessments.created_at) >
          new Date(locationData.lastAssessed)
        ) {
          locationData.lastAssessed =
            response.interviews.assessments.created_at;
        }
      });

      // Calculate asset risk analytics
      const assetRiskAnalytics: AssetRiskAnalytics[] = Array.from(
        locationMap.entries()
      ).map(([location, data]) => {
        const avgScore =
          data.scores.reduce((sum, score) => sum + score, 0) /
          data.scores.length;
        const avgPercentage =
          data.percentages.reduce((sum, pct) => sum + pct, 0) /
          data.percentages.length;

        // Classify risk based on percentiles
        let riskLevel: "low" | "medium" | "high" | "critical";
        if (avgPercentage <= p10) {
          riskLevel = "critical";
        } else if (avgPercentage <= p25) {
          riskLevel = "high";
        } else if (avgPercentage <= p75) {
          riskLevel = "medium";
        } else {
          riskLevel = "low";
        }

        // Check if overdue (more than 6 months for onsite, 3 months for desktop)
        const daysSinceAssessed = Math.floor(
          (new Date().getTime() - new Date(data.lastAssessed).getTime()) /
            (1000 * 60 * 60 * 24)
        );
        const overdue = daysSinceAssessed > 180; // Simplified to 6 months

        return {
          location,
          avgScore: Math.round(avgScore * 100) / 100,
          avgScorePercentage: Math.round(avgPercentage),
          riskLevel,
          questionCount: data.questionCount,
          responseCount: data.scores.length,
          actionCount: 0, // TODO: Calculate from actions data
          lastAssessed: data.lastAssessed,
          overdue,
        };
      });

      // Sort by risk level (critical first, then high, etc.)
      const riskOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const sortedAssetRiskAnalytics = assetRiskAnalytics.sort(
        (a, b) =>
          riskOrder[a.riskLevel] - riskOrder[b.riskLevel] ||
          a.avgScorePercentage - b.avgScorePercentage
      );
      set({ assetRiskAnalytics: sortedAssetRiskAnalytics, isLoading: false });
    } catch (error) {
      console.error("Error loading asset risk analytics:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to load asset risk analytics",
        isLoading: false,
      });
    }
  },

  loadGeneratedActionsAnalytics: async () => {
    const { isDemoMode } = useAuthStore.getState();
    const { selectedCompany } = useCompanyStore.getState();

    if (!selectedCompany) {
      set({ error: "No company selected" });
      return;
    }

    try {
      const supabase = createClient();

      // Get all actions with response scores to calculate priorities
      let actionsQuery = supabase
        .from("interview_response_actions")
        .select(
          `
          id,
          title,
          description,
          created_at,
          interview_responses!inner(
            rating_score,
            questionnaire_questions!inner(
              questionnaire_question_rating_scales!inner(
                questionnaire_rating_scales!inner(value)
              )
            ),
            interviews!inner(
              assessments!inner(
                company:companies!inner(id, is_demo, deleted_at)
              )
            )
          )
        `
        )
        .is(
          "interview_responses.interviews.assessments.company.deleted_at",
          null
        );

      if (isDemoMode) {
        actionsQuery = actionsQuery.eq(
          "interview_responses.interviews.assessments.company.is_demo",
          true
        );
      } else {
        actionsQuery = actionsQuery
          .eq(
            "interview_responses.interviews.assessments.company.id",
            selectedCompany.id
          )
          .eq(
            "interview_responses.interviews.assessments.company.is_demo",
            false
          );
      }

      const { data: actions, error: actionsError } = await actionsQuery;
      if (actionsError) throw actionsError;

      // Calculate analytics
      const total = actions?.length || 0;

      // Calculate actions from last week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const fromLastWeek =
        actions?.filter((action) => new Date(action.created_at) >= oneWeekAgo)
          .length || 0;

      // Calculate high priority actions (from responses with scores in bottom 25%)
      const allScores = (actions || []).map((action: any) => {
        const ratingScales =
          action.interview_responses.questionnaire_questions
            .questionnaire_question_rating_scales || [];
        const maxScaleValue =
          ratingScales.length > 0
            ? Math.max(
                ...ratingScales.map(
                  (rs: any) => rs.questionnaire_rating_scales.value
                )
              )
            : 5;
        return (action.interview_responses.rating_score / maxScaleValue) * 100;
      });

      allScores.sort((a, b) => a - b);
      const p25 = allScores[Math.floor(allScores.length * 0.25)] || 0;

      const highPriority = (actions || []).filter((action: any) => {
        const ratingScales =
          action.interview_responses.questionnaire_questions
            .questionnaire_question_rating_scales || [];
        const maxScaleValue =
          ratingScales.length > 0
            ? Math.max(
                ...ratingScales.map(
                  (rs: any) => rs.questionnaire_rating_scales.value
                )
              )
            : 5;
        const percentage =
          (action.interview_responses.rating_score / maxScaleValue) * 100;
        return percentage <= p25;
      }).length;

      // All actions are from interviews by definition
      const fromInterviews = total;

      // Calculate trend (compare this week vs last week)
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      const fromPreviousWeek =
        actions?.filter((action) => {
          const actionDate = new Date(action.created_at);
          return actionDate >= twoWeeksAgo && actionDate < oneWeekAgo;
        }).length || 1; // Avoid division by zero

      const trend =
        fromPreviousWeek > 0
          ? Math.round(
              ((fromLastWeek - fromPreviousWeek) / fromPreviousWeek) * 100
            )
          : 0;

      // Update metrics
      set((state) => ({
        metrics: {
          ...state.metrics,
          generatedActions: {
            total,
            fromLastWeek,
            highPriority,
            fromInterviews,
            trend,
            status: trend >= 0 ? ("up" as const) : ("down" as const),
          },
        },
      }));
    } catch (error) {
      console.error("Error loading generated actions analytics:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to load generated actions analytics",
      });
    }
  },

  updateMetricsFromAnalytics: () => {
    const { domainAnalytics, assetRiskAnalytics, metrics } =
      useDashboardStore.getState();
    // Update worst performing area
    const worstDomain = domainAnalytics[0]; // Already sorted by worst performing
    const worstPerformingArea = worstDomain
      ? {
          name: worstDomain.domain,
          trend: worstDomain.trend,
          status: worstDomain.status,
          avgScore: worstDomain.avgScorePercentage,
          affectedLocations: worstDomain.locationCount,
        }
      : metrics.worstPerformingArea;

    // Update critical assets - handle empty array case
    const riskBreakdown =
      assetRiskAnalytics.length > 0
        ? assetRiskAnalytics.reduce(
            (acc, asset) => {
              acc[asset.riskLevel]++;
              return acc;
            },
            { critical: 0, high: 0, medium: 0, low: 0 }
          )
        : { critical: 0, high: 0, medium: 0, low: 0 };

    const criticalAndHighRiskCount =
      riskBreakdown.critical + riskBreakdown.high;
    const overdueCount = assetRiskAnalytics.filter(
      (asset) => asset.overdue
    ).length;
    const worstLocation =
      assetRiskAnalytics[0]?.location.split(" > ").pop() ||
      metrics.criticalAssets.site;
    const avgCompliance =
      assetRiskAnalytics.length > 0
        ? Math.round(
            assetRiskAnalytics.reduce(
              (sum, asset) => sum + asset.avgScorePercentage,
              0
            ) / assetRiskAnalytics.length
          )
        : metrics.criticalAssets.avgCompliance;

    const criticalAssets = {
      count: criticalAndHighRiskCount,
      overdue: overdueCount,
      avgCompliance,
      site: worstLocation,
      riskBreakdown,
      worstLocation:
        assetRiskAnalytics[0]?.location || metrics.criticalAssets.site,
    };
    // Update metrics
    set({
      metrics: {
        ...metrics,
        worstPerformingArea,
        criticalAssets,
      },
    });
  },

  setItems: (items) => set({ items, isLoading: false, error: null }),
  setMetrics: (metrics) => set({ metrics }),
  setActions: (actions) => set({ actions }),
  setQuestionAnalytics: (analytics) => set({ questionAnalytics: analytics }),
  setDomainAnalytics: (analytics) => set({ domainAnalytics: analytics }),
  setAssetRiskAnalytics: (analytics) => set({ assetRiskAnalytics: analytics }),

  // Store management
  reset: () => {
    set({
      actions: [],
      questionAnalytics: [],
      domainAnalytics: [],
      assetRiskAnalytics: [],
      metrics: {
        assessments: {
          total: undefined,
          trend: undefined,
          status: undefined,
        },
        worstPerformingArea: {
          name: undefined,
          trend: undefined,
          status: undefined,
        },
        generatedActions: {
          total: undefined,
          fromLastWeek: undefined,
          highPriority: undefined,
          fromInterviews: undefined,
          trend: undefined,
          status: undefined,
        },
      },
      isLoading: false,
      error: null,
    });
  },
}));
