interface DataActions {
  question_id: string;
  options: DataActionOption[];
}

interface DataActionOption {
  id: string;
  score: number;
  title: string;
  description: string;
}

export const actions: DataActions[] = [
  {
    question_id: "demo-questionnaire-1-section-1-step-1-question-1",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-1",
        score: 1,
        title: "Develop Comprehensive Training Program",
        description:
          "Create a structured training curriculum for work identification and notification creation, including site-specific materials and SAP training modules.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-2",
        score: 1,
        title: "Identify Training Recipients",
        description:
          "Conduct a skills gap analysis to identify all personnel who require work identification training, including operators, maintainers, and contractors.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-3",
        score: 1,
        title: "Establish Training Documentation",
        description:
          "Develop standardized training materials, procedures, and assessment criteria for work identification processes.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-4",
        score: 2,
        title: "Increase Training Coverage",
        description:
          "Expand training program to achieve 75% coverage of identified personnel, focusing on consistent application of work identification principles.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-5",
        score: 2,
        title: "Improve Work Coding Accuracy",
        description:
          "Implement refresher training and quality checks to ensure emergent work is correctly coded and classified in the system.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-6",
        score: 3,
        title: "Maintain Training Standards",
        description:
          "Continue monitoring training effectiveness and ensure 90% of personnel remain current with work identification best practices.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-7",
        score: 3,
        title: "Optimize Work Classification",
        description:
          "Fine-tune work identification processes to achieve 100% accuracy in emergent work coding and classification.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-8",
        score: 4,
        title: "Knowledge Sharing Initiative",
        description:
          "Establish a center of excellence to share work identification best practices across the organization and with industry partners.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-9",
        score: 4,
        title: "Continuous Improvement Program",
        description:
          "Implement advanced analytics and feedback loops to continuously refine and optimize work identification processes.",
      },
    ],
  },
];
