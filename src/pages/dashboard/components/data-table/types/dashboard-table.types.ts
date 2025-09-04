interface QuestionAnalytics {
  location: string;
  question_title: string;
  domain: string;
  avg_score_percentage: number;
  avg_score: number;
  max_scale_value: number;
  risk_level: string;
  action_count: number;
  last_assessed: string;
  assessment_type: "onsite" | "desktop";
  response_count: number;
  assessments: Array<{ id: number; name: string }>;
}

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