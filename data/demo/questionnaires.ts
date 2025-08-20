// import type { Questionnaire } from "@/types/assessment";

export const questionnaire = {
  id: 'demo-questionnaire-1',
  name: "Mining Operations Questionnaire",
  description:
    "Comprehensive evaluation of mining operations across all critical areas",
  guidelines:
    "Assess all aspects of mining operations including work management, defect elimination, asset strategy, and asset health",
  rating_scales: [
    {
      name: "Optimised",
      description:
        "Exceeds requirements with continuous improvement and leading practices",
      value: 4,
    },
    {
      name: "Proactive",
      description:
        "Meets requirements with systematic and preventive approaches",
      value: 3,
    },
    {
      name: "Planned",
      description:
        "Basic systems exist but inconsistent execution, gaps in compliance",
      value: 2,
    },
    {
      name: "Reactive",
      description:
        "Ad-hoc approaches, fire-fighting mode, immediate intervention required",
      value: 1,
    },
  ],
  sections: [
    {
      title: "Work Management",
      order: 1,
      steps: [
        {
          title: "Identify Work",
          order: 1,
          questions: [
            {
              title: "Work Identification Training",
              question_text:
                "1. How are new employees being trained in Work Identification and Notification creation?\n2. Have Operators (if applicable, e.g.. inspection routes) and Maintainers received Work Identification training?\n3. Are there any training gaps in your organization regarding entering a work request into your SAP?\n4. Have Service Providers / contractors received Work Identification training?",
              context:
                "Work Identification Training\nOperators / maintainers / Maint professionals / contractors receive training in Work Identification and Notification creation, considering:\n• Work identification is incorporated into new employees training\n• Sources of training materials may be:\no > Site-specific Work Identification training\no > Work Identification Awareness presentation\no > SAP raising notification training.",
              order: 1,
              applicable_roles: [
                "Scheduler",
                "Maintenance Planner",
                "Auditor",
                "Maintenance Supervisor",
              ],
              rating_scales: [
                {
                  name: "Reactive",
                  description:
                    "Training recipients identified but less than 25% trained.",
                  value: 1,
                },
                {
                  name: "Planned",
                  description:
                    "Training recipients identified but less than 50% trained and most emergent work is incorrectly coded.",
                  value: 2,
                },
                {
                  name: "Proactive",
                  description:
                    "75% of people trained and most emergent work is correctly coded.",
                  value: 3,
                },
                {
                  name: "Optimised",
                  description:
                    "90% of people trained and all emergent work is correctly coded.",
                  value: 4,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
