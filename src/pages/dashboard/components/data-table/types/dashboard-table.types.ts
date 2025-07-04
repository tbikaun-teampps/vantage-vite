import type { QuestionAnalytics } from "@/stores/dashboard-store";

export interface DashboardDataTableProps {
  data: QuestionAnalytics[];
  isLoading?: boolean;
}

export interface DialogHandlers {
  onViewActions: (question: QuestionAnalytics) => void;
  onViewResponses: (question: QuestionAnalytics) => void;
  onViewAssessments: (question: QuestionAnalytics) => void;
}

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedQuestion: QuestionAnalytics | null;
}