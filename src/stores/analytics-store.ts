import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { analyticsService } from "@/lib/supabase/analytics-service";
import type {
  AssessmentProgress,
  AssessmentMetrics,
  BarChartDataItem,
} from "@/types/assessment";

interface AnalyticsStore {
  // State
  assessmentProgress: Record<string, AssessmentProgress>;
  assessmentMetrics: Record<string, AssessmentMetrics>;
  chartData: BarChartDataItem[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;

  // Actions
  loadAssessmentProgress: (assessmentId: string) => Promise<void>;
  loadAssessmentMetrics: (assessmentId: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export const useAnalyticsStore = create<AnalyticsStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      assessmentProgress: {},
      assessmentMetrics: {},
      chartData: [],
      isLoading: false,
      error: null,
      lastUpdated: null,

      loadAssessmentProgress: async (assessmentId: string) => {
        set({ isLoading: true, error: null });
        try {
          const progress = await analyticsService.getAssessmentProgress(
            assessmentId
          );
          const { assessmentProgress } = get();
          set({
            assessmentProgress: {
              ...assessmentProgress,
              [assessmentId]: progress,
            },
            isLoading: false,
            lastUpdated: new Date().toISOString(),
          });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to load assessment progress",
            isLoading: false,
          });
        }
      },

      loadAssessmentMetrics: async (assessmentId: string) => {
        set({ isLoading: true, error: null });
        try {
          const metrics = await analyticsService.getAssessmentMetrics(
            assessmentId
          );
          const { assessmentMetrics } = get();
          set({
            assessmentMetrics: {
              ...assessmentMetrics,
              [assessmentId]: metrics,
            },
            isLoading: false,
            lastUpdated: new Date().toISOString(),
          });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to load assessment metrics",
            isLoading: false,
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      reset: () => {
        set({
          assessmentProgress: {},
          assessmentMetrics: {},
          chartData: [],
          isLoading: false,
          error: null,
          lastUpdated: null,
        });
      },
    }),
    { name: "analytics-store" }
  )
);
