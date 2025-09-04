import type { AssessmentObjective } from "./assessment";

export type Objective = Pick<AssessmentObjective, "title" | "description">;

export interface ObjectiveCategory {
  category: string;
  objectives: Objective[];
}

export type Objectives = ObjectiveCategory[];
