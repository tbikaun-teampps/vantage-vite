// import type { Questionnaire } from "@/types/assessment";

import { shared_role_name_to_id } from "../shared_roles";

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

export const questionnaires: Questionnaire[] = [
  {
    id: "demo-questionnaire-1",
    name: "Mining Operations Questionnaire",
    description:
      "Comprehensive evaluation of mining operations across all critical areas",
    guidelines:
      "Assess all aspects of mining operations including work management, defect elimination, asset strategy, and asset health",
    rating_scales: [
      {
        id: "demo-questionnaire-1-rating-scale-1",
        name: "Optimised",
        description:
          "Exceeds requirements with continuous improvement and leading practices",
        value: 4,
        order_index: 3,
      },
      {
        id: "demo-questionnaire-1-rating-scale-2",
        name: "Proactive",
        description:
          "Meets requirements with systematic and preventive approaches",
        value: 3,
        order_index: 2,
      },
      {
        id: "demo-questionnaire-1-rating-scale-3",
        name: "Planned",
        description:
          "Basic systems exist but inconsistent execution, gaps in compliance",
        value: 2,
        order_index: 1,
      },
      {
        id: "demo-questionnaire-1-rating-scale-4",
        name: "Reactive",
        description:
          "Ad-hoc approaches, fire-fighting mode, immediate intervention required",
        value: 1,
        order_index: 0,
      },
    ],
    sections: [
      {
        id: "demo-questionnaire-1-section-1",
        title: "Work Management",
        order: 1,
        steps: [
          {
            id: "demo-questionnaire-1-section-1-step-1",
            title: "Identify Work",
            order: 1,
            questions: [
              {
                id: "demo-questionnaire-1-section-1-step-1-question-1",
                title: "Work Identification Training",
                question_text:
                  "1. How are new employees being trained in Work Identification and Notification creation?\n2. Have Operators (if applicable, e.g.. inspection routes) and Maintainers received Work Identification training?\n3. Are there any training gaps in your organization regarding entering a work request into your SAP?\n4. Have Service Providers / contractors received Work Identification training?",
                context:
                  "Work Identification Training\nOperators / maintainers / Maint professionals / contractors receive training in Work Identification and Notification creation, considering:\n• Work identification is incorporated into new employees training\n• Sources of training materials may be:\no > Site-specific Work Identification training\no > Work Identification Awareness presentation\no > SAP raising notification training.",
                order: 1,
                applicable_roles: [
                  shared_role_name_to_id["Scheduler"],
                  shared_role_name_to_id["Maintenance Planner"],
                  shared_role_name_to_id["Auditor"],
                  shared_role_name_to_id["Maintenance Supervisor"],
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-1-step-1-question-1-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "Training recipients identified but less than 25% trained.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-1-question-1-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "Training recipients identified but less than 50% trained and most emergent work is incorrectly coded.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-1-question-1-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "75% of people trained and most emergent work is correctly coded.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-1-question-1-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "90% of people trained and all emergent work is correctly coded.",
                    value: 4,
                  },
                ],
              },
              {
                id: "demo-questionnaire-1-section-1-step-1-question-2",
                title: "Preventive Maintenance Work Setup",
                question_text:
                  "1. Is all of the PM Work set up within the SAP?\n2. Is most of the PM work calendar-based, and/or based on OEM recommendations, rather than tactics reviews?\n3. For new equipment, is PM Work  based on formal Asset Tactics Development?  What is the process for entering them into the SAP?\n4.  What is the process for modifications to existing tactics, and entering them into the SAP? How often are formal reviews undertaken?\n5. Preventative work orders are part of the maintenance regime (PM02)",
                context:
                  "Identification of PM work\nPM Work has a defined scope and frequency, and originates from the asset maintenance strategy, and built into its maintenance tactics. The maintenance tactics are a set of activities carried out to enable the realisation of the defined reliability/availability of the Asset. All maintenance strategies and tactics are created within the SAP for automatic generation as PM01",
                order: 2,
                applicable_roles: [
                  shared_role_name_to_id["Scheduler"],
                  shared_role_name_to_id["Maintenance Planner"],
                  shared_role_name_to_id["Auditor"],
                  shared_role_name_to_id["Maintenance Supervisor"],
                  shared_role_name_to_id["Maintenance Superintendent"],
                  shared_role_name_to_id["Reliability Engineer"],
                  shared_role_name_to_id["Operations Supervisor"],
                  shared_role_name_to_id["Maintainer"],
                ],
                rating_scales: [
                  {
                    name: "Reactive",
                    description:
                      "PM Work captured in SAP; is either mostly calendar- based, and/or based on OEM recommendations, rather than tactics reviews. <50% of scheduled work is system generated.",
                    value: 1,
                    id: "demo-questionnaire-1-section-1-step-1-question-2-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                  },
                  {
                    name: "Planned",
                    description:
                      "PM work is identified for new or critical equipment using a formal tactic review process e.g., FMEA, RCM or PMO. >50% of scheduled work is Corrective PM",
                    value: 2,
                    id: "demo-questionnaire-1-section-1-step-1-question-2-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                  },
                  {
                    name: "Proactive",
                    description:
                      "PM work is being identified/modified using formal tactic review process but is not entered into the SAP system in a timely manner. >65% of scheduled work is PM",
                    value: 3,
                    id: "demo-questionnaire-1-section-1-step-1-question-2-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                  },
                  {
                    name: "Optimised",
                    description:
                      "PM work is being identified/modified using formal tactic review process and is being entered into the SAP system in a timely manner. >80% of scheduled work is PM",
                    value: 4,
                    id: "demo-questionnaire-1-section-1-step-1-question-2-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];
