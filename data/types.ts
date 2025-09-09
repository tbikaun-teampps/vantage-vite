export interface Contact {
  id: string;
  fullname: string;
  email: string;
  title?: string;
}

export interface Role {
  id: string;
  shared_role_id: string;
  level:
    | "executive"
    | "management"
    | "supervisor"
    | "professional"
    | "technician"
    | "operator"
    | "specialist"
    | "other";
  contacts: Contact[];
  direct_reports?: Role[];
}

export interface WorkGroup {
  id: string;
  name: string;
  code: string;
  description: string;
  contacts: Contact[];
  roles: Role[];
}

export interface AssetGroup {
  id: string;
  name: string;
  code: string;
  description: string;
  contacts: Contact[];
  work_groups: WorkGroup[];
}

export interface Site {
  id: string;
  name: string;
  code: string;
  description: string;
  lat: number;
  lng: number;
  contacts: Contact[];
  asset_groups: AssetGroup[];
}

export interface Region {
  id: string;
  name: string;
  code: string;
  description: string;
  contacts: Contact[];
  sites: Site[];
}

export interface BusinessUnit {
  id: string;
  name: string;
  code: string;
  description: string;
  contacts: Contact[];
  regions: Region[];
}

export interface Company {
  id: string;
  name: string;
  code: string;
  description: string;
  contacts: Contact[];
  business_units: BusinessUnit[];
}

// Questionnaire

interface BaseRatingScale {
  // id: string;
  name: string;
  description: string;
  value: number;
  // order_index: number;
}

interface BaseSection {
  // id: string;
  title: string;
  // order: number;
  steps: BaseStep[];
}

interface BaseStep {
  // id: string;
  title: string;
  // order: number;
  questions: BaseQuestion[];
}

interface BaseQuestionRatingScale {
  // id: string;
  // questionnaire_rating_scale_id: string;
  name: string;
  description: string;
  value: number;
}

interface BaseQuestion {
  // id: string;
  title: string;
  question_text: string;
  context: string;
  // order: number;
  applicable_roles: string[];
  rating_scales: BaseQuestionRatingScale[];
}

export interface BaseQuestionnaire {
  // id: string;
  name: string;
  description: string;
  guidelines: string;
  rating_scales: BaseRatingScale[];
  sections: BaseSection[];
}

interface RatingScale {
  id: string;
  name: string;
  description: string;
  value: number;
  order_index: number;
}

interface Section {
  id: string;
  title: string;
  order: number;
  steps: Step[];
}

interface Step {
  id: string;
  title: string;
  order: number;
  questions: Question[];
}

interface QuestionRatingScale {
  id: string;
  questionnaire_rating_scale_id: string;
  name: string;
  description: string;
  value: number;
}

interface Question {
  id: string;
  title: string;
  question_text: string;
  context: string;
  order: number;
  applicable_roles: string[];
  rating_scales: QuestionRatingScale[];
}

export interface Questionnaire {
  id: string;
  name: string;
  description: string;
  guidelines: string;
  rating_scales: RatingScale[];
  sections: Section[];
}

export interface Recommendation {
  id: string;
  title: string;
  content: string;
  context: string;
  priority: "low" | "medium" | "high";
  status: "not_started" | "in_progress" | "completed";
}
