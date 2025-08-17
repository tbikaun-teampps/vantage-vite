// Types for importing

import type { QuestionnaireRatingScale } from "@/types/assessment";

export interface ImportRatingScale {
  name: string;
  description: string;
  value: number;
}

export interface ImportQuestion {
  title: string;
  question_text: string;
  context?: string;
  order: number;
}

export interface ImportStep {
  title: string;
  order: number;
  questions: ImportQuestion[];
}

export interface ImportSection {
  title: string;
  order: number;
  steps: ImportStep[];
}

export interface ImportQuestionnaire {
  name?: string;
  description?: string;
  rating_scales: ImportRatingScale[];
  sections: ImportSection[];
}

export interface ValidationError {
  field: string;
  message: string;
  path: string;
}

export interface ImportResult {
  success: boolean;
  errors: ValidationError[];
  questionnaire?: ImportQuestionnaire;
  stats?: {
    ratingsCount: number;
    sectionsCount: number;
    stepsCount: number;
    questionsCount: number;
  };
}

export interface ConflictResolution {
  templateScale: ImportRatingScale;
  existingScale?: QuestionnaireRatingScale;
  conflictType: "name" | "value" | "both";
  resolution: "skip" | "rename" | "replace" | "use_existing";
}
