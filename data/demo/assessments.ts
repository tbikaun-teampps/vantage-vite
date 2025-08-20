interface AssessmentObjective {
  id: string;
  title: string;
  description: string;
}

export interface Assessment {
  id: string;
  questionnaire_id: string;
  name: string;
  description: string;
  status: string;
  type: "onsite" | "desktop";
  business_unit_id: string;
  region_id: string;
  site_id: string;
  asset_group_id: string;
  objectives: AssessmentObjective[];
}

export const assessments: Assessment[] = [
  {
    id: "demo-assessment-1",
    questionnaire_id: "demo-questionnaire-1",
    name: "Q3 2024 Newman Mine Asset Management Assessment",
    description:
      "Mining Operations Assessment - comprehensive evaluation of work management, defect elimination, asset strategy and asset health at Newman iron ore operations",
    status: "completed",
    type: "onsite",
    business_unit_id: "demo-business-unit-1",
    region_id: "demo-region-1",
    site_id: "demo-site-1",
    asset_group_id: "demo-asset-group-1",
    objectives: [
      {
        id: "demo-assessment-1-objective-1",
        title:
          "Optimise Work Management and Maintenance Planning Effectiveness",
        description:
          "Evaluate and enhance the systematic identification, planning, scheduling, execution, and analysis of maintenance work to achieve >90% schedule compliance and reduce unplanned maintenance interventions across critical mining equipment and infrastructure.",
      },
      {
        id: "demo-assessment-1-objective-2",
        title:
          "Strengthen Asset Reliability and Defect Elimination Capabilities",
        description:
          "Assess current defect identification processes and root cause analysis methodologies to establish robust defect elimination programs that reduce equipment-related production losses by 15% and extend asset life cycles through proactive maintenance strategies.",
      },
      {
        id: "demo-assessment-1-objective-3",
        title: "Enhance Integrated Asset Health and Safety Performance",
        description:
          "Review asset health monitoring systems, condition-based maintenance practices, and safety integration to ensure all critical equipment operates within optimal parameters while maintaining zero harm standards and maximising operational availability.",
      },
    ],
  },
];
