import {
  AssessmentStatus,
  AssessmentType,
} from "../types/entities/assessments";

export const AssessmentStatusEnum: AssessmentStatus[] = [
  "draft",
  "active",
  "under_review",
  "completed",
  "archived",
];

export const AssessmentTypeEnum: AssessmentType[] = ["onsite", "desktop"];
