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
  status: "draft" | "active" | "under_review" | "completed" | "archived";
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
    name: "Q3 2025 Newman Mine Asset Management Assessment",
    description:
      "Mining Operations Assessment - comprehensive evaluation of work management, defect elimination, asset strategy and asset health at Newman Mine iron ore operations",
    status: "active",
    type: "onsite",
    business_unit_id: "demo-business-unit-1",
    region_id: "demo-region-1",
    site_id: "demo-site-1",
    asset_group_id: "demo-asset-group-1",
    objectives: [
      {
        id: "demo-assessment-1-objective-1",
        title:
          "Optimize Work Management and Maintenance Planning Effectiveness",
        description:
          "Evaluate and enhance the systematic identification, planning, scheduling, execution, and analysis of maintenance work to achieve >90% schedule compliance and reduce unplanned maintenance interventions across onsite mining equipment and infrastructure.",
      },
      {
        id: "demo-assessment-1-objective-2",
        title:
          "Strengthen Asset Reliability and Defect Elimination Capabilities",
        description:
          "Assess current defect identification processes and root cause analysis methodologies to establish robust defect elimination programs that reduce mining equipment-related production losses by 15% and extend asset life cycles through proactive maintenance strategies.",
      },
      {
        id: "demo-assessment-1-objective-3",
        title: "Enhance Integrated Asset Health and Safety Performance",
        description:
          "Review asset health monitoring systems, condition-based maintenance practices, and safety integration to ensure all onsite mining equipment operates within optimal parameters while maintaining zero harm standards and maximizing operational availability.",
      },
    ],
  },
  {
    id: "demo-assessment-2",
    questionnaire_id: "demo-questionnaire-1",
    name: "Q3 2025 Tom Price Mine Asset Management Assessment",
    description:
      "Mining Operations Assessment - comprehensive evaluation of work management, defect elimination, asset strategy and asset health at Tom Price Mine iron ore operations",
    status: "completed",
    type: "onsite",
    business_unit_id: "demo-business-unit-1",
    region_id: "demo-region-1",
    site_id: "demo-site-3",
    asset_group_id: "demo-asset-group-4",
    objectives: [
      {
        id: "demo-assessment-2-objective-1",
        title:
          "Optimize Work Management and Maintenance Planning Effectiveness",
        description:
          "Evaluate and enhance the systematic identification, planning, scheduling, execution, and analysis of maintenance work to achieve >90% schedule compliance and reduce unplanned maintenance interventions across onsite mining equipment and infrastructure.",
      },
      {
        id: "demo-assessment-2-objective-2",
        title:
          "Strengthen Asset Reliability and Defect Elimination Capabilities",
        description:
          "Assess current defect identification processes and root cause analysis methodologies to establish robust defect elimination programs that reduce mining equipment-related production losses by 15% and extend asset life cycles through proactive maintenance strategies.",
      },
      {
        id: "demo-assessment-2-objective-3",
        title: "Enhance Integrated Asset Health and Safety Performance",
        description:
          "Review asset health monitoring systems, condition-based maintenance practices, and safety integration to ensure all onsite mining equipment operates within optimal parameters while maintaining zero harm standards and maximizing operational availability.",
      },
    ],
  },
  // {
  //   id: "demo-assessment-3",
  //   questionnaire_id: "demo-questionnaire-1",
  //   name: "Q3 2025 Port Hedland Terminal Asset Management Assessment",
  //   description:
  //     "Mining Operations Assessment - comprehensive evaluation of work management, defect elimination, asset strategy and asset health at Port Hedland Terminal iron ore operations",
  //   status: "completed",
  //   type: "onsite",
  //   business_unit_id: "demo-business-unit-1",
  //   region_id: "demo-region-1",
  //   site_id: "demo-site-4",
  //   asset_group_id: "demo-asset-group-6",
  //   objectives: [
  //     {
  //       id: "demo-assessment-3-objective-1",
  //       title:
  //         "Optimize Work Management and Maintenance Planning Effectiveness",
  //       description:
  //         "Evaluate and enhance the systematic identification, planning, scheduling, execution, and analysis of maintenance work to achieve >90% schedule compliance and reduce unplanned maintenance interventions across onsite mining equipment and infrastructure.",
  //     },
  //     {
  //       id: "demo-assessment-3-objective-2",
  //       title:
  //         "Strengthen Asset Reliability and Defect Elimination Capabilities",
  //       description:
  //         "Assess current defect identification processes and root cause analysis methodologies to establish robust defect elimination programs that reduce mining equipment-related production losses by 15% and extend asset life cycles through proactive maintenance strategies.",
  //     },
  //     {
  //       id: "demo-assessment-3-objective-3",
  //       title: "Enhance Integrated Asset Health and Safety Performance",
  //       description:
  //         "Review asset health monitoring systems, condition-based maintenance practices, and safety integration to ensure all onsite mining equipment operates within optimal parameters while maintaining zero harm standards and maximizing operational availability.",
  //     },
  //   ],
  // },
  // {
  //   id: "demo-assessment-4",
  //   questionnaire_id: "demo-questionnaire-1",
  //   name: "Q3 2025 Koolan Island Mine Asset Management Assessment",
  //   description:
  //     "Mining Operations Assessment - comprehensive evaluation of work management, defect elimination, asset strategy and asset health at Koolan Island Mine iron ore operations",
  //   status: "active",
  //   type: "onsite",
  //   business_unit_id: "demo-business-unit-1",
  //   region_id: "demo-region-3",
  //   site_id: "demo-site-5",
  //   asset_group_id: "demo-asset-group-8",
  //   objectives: [
  //     {
  //       id: "demo-assessment-4-objective-1",
  //       title:
  //         "Optimize Work Management and Maintenance Planning Effectiveness",
  //       description:
  //         "Evaluate and enhance the systematic identification, planning, scheduling, execution, and analysis of maintenance work to achieve >90% schedule compliance and reduce unplanned maintenance interventions across onsite mining equipment and infrastructure.",
  //     },
  //     {
  //       id: "demo-assessment-4-objective-2",
  //       title:
  //         "Strengthen Asset Reliability and Defect Elimination Capabilities",
  //       description:
  //         "Assess current defect identification processes and root cause analysis methodologies to establish robust defect elimination programs that reduce mining equipment-related production losses by 15% and extend asset life cycles through proactive maintenance strategies.",
  //     },
  //     {
  //       id: "demo-assessment-4-objective-3",
  //       title: "Enhance Integrated Asset Health and Safety Performance",
  //       description:
  //         "Review asset health monitoring systems, condition-based maintenance practices, and safety integration to ensure all onsite mining equipment operates within optimal parameters while maintaining zero harm standards and maximizing operational availability.",
  //     },
  //   ],
  // },
  {
    id: "demo-assessment-5",
    questionnaire_id: "demo-questionnaire-1",
    name: "Q3 2025 Mount Arthur Mine Asset Management Assessment",
    description:
      "Mining Operations Assessment - comprehensive evaluation of work management, defect elimination, asset strategy and asset health at Mount Arthur Mine coal operations",
    status: "active",
    type: "onsite",
    business_unit_id: "demo-business-unit-2",
    region_id: "demo-region-2",
    site_id: "demo-site-2",
    asset_group_id: "demo-asset-group-2",
    objectives: [
      {
        id: "demo-assessment-5-objective-1",
        title:
          "Optimize Work Management and Maintenance Planning Effectiveness",
        description:
          "Assess and optimize maintenance work identification, planning, scheduling and execution processes to achieve >85% planned work completion and minimize dragline equipment downtime through enhanced preventive maintenance strategies and resource utilization.",
      },
      {
        id: "demo-assessment-5-objective-2",
        title:
          "Strengthen Asset Reliability and Defect Elimination Capabilities",
        description:
          "Evaluate existing failure analysis capabilities and asset tactics development to implement systematic defect elimination processes that reduce coal handling equipment failures by 20% and optimize dragline maintenance intervals through data-driven decision making.",
      },
      {
        id: "demo-assessment-5-objective-3",
        title: "Enhance Integrated Asset Health and Safety Performance",
        description:
          "Review condition monitoring programs, predictive maintenance technologies, and risk assessment processes to ensure dragline operations maintain peak performance while achieving continuous improvement in safety standards and production reliability targets.",
      },
    ],
  },
  // {
  //   id: "demo-assessment-6",
  //   questionnaire_id: "demo-questionnaire-1",
  //   name: "Q3 2025 Bengalla Mine Asset Management Assessment",
  //   description:
  //     "Mining Operations Assessment - comprehensive evaluation of work management, defect elimination, asset strategy and asset health at Bengalla Mine coal operations",
  //   status: "active",
  //   type: "onsite",
  //   business_unit_id: "demo-business-unit-2",
  //   region_id: "demo-region-2",
  //   site_id: "demo-site-6",
  //   asset_group_id: "demo-asset-group-10",
  //   objectives: [
  //     {
  //       id: "demo-assessment-6-objective-1",
  //       title:
  //         "Optimize Work Management and Maintenance Planning Effectiveness",
  //       description:
  //         "Assess and optimize maintenance work identification, planning, scheduling and execution processes to achieve >85% planned work completion and minimize dragline equipment downtime through enhanced preventive maintenance strategies and resource utilization.",
  //     },
  //     {
  //       id: "demo-assessment-6-objective-2",
  //       title:
  //         "Strengthen Asset Reliability and Defect Elimination Capabilities",
  //       description:
  //         "Evaluate existing failure analysis capabilities and asset tactics development to implement systematic defect elimination processes that reduce coal handling equipment failures by 20% and optimize dragline maintenance intervals through data-driven decision making.",
  //     },
  //     {
  //       id: "demo-assessment-6-objective-3",
  //       title: "Enhance Integrated Asset Health and Safety Performance",
  //       description:
  //         "Review condition monitoring programs, predictive maintenance technologies, and risk assessment processes to ensure dragline operations maintain peak performance while achieving continuous improvement in safety standards and production reliability targets.",
  //     },
  //   ],
  // },
  // {
  //   id: "demo-assessment-7",
  //   questionnaire_id: "demo-questionnaire-1",
  //   name: "Q3 2025 Peak Downs Mine Asset Management Assessment",
  //   description:
  //     "Mining Operations Assessment - comprehensive evaluation of work management, defect elimination, asset strategy and asset health at Peak Downs Mine coal operations",
  //   status: "under_review",
  //   type: "onsite",
  //   business_unit_id: "demo-business-unit-2",
  //   region_id: "demo-region-4",
  //   site_id: "demo-site-7",
  //   asset_group_id: "demo-asset-group-12",
  //   objectives: [
  //     {
  //       id: "demo-assessment-7-objective-1",
  //       title:
  //         "Optimize Work Management and Maintenance Planning Effectiveness",
  //       description:
  //         "Evaluate and enhance the systematic identification, planning, scheduling, execution, and analysis of maintenance work to achieve >90% schedule compliance and reduce unplanned maintenance interventions across onsite underground mining equipment and infrastructure.",
  //     },
  //     {
  //       id: "demo-assessment-7-objective-2",
  //       title:
  //         "Strengthen Asset Reliability and Defect Elimination Capabilities",
  //       description:
  //         "Evaluate existing failure analysis capabilities and asset tactics development to implement systematic defect elimination processes that reduce coal handling equipment failures by 20% and optimize longwall maintenance intervals through data-driven decision making.",
  //     },
  //     {
  //       id: "demo-assessment-7-objective-3",
  //       title: "Enhance Integrated Asset Health and Safety Performance",
  //       description:
  //         "Review condition monitoring programs, predictive maintenance technologies, and risk assessment processes to ensure longwall operations maintain peak performance while achieving continuous improvement in safety standards and production reliability targets.",
  //     },
  //   ],
  // },
  // {
  //   id: "demo-assessment-8",
  //   questionnaire_id: "demo-questionnaire-1",
  //   name: "Q3 2025 Goonyella Mine Asset Management Assessment",
  //   description:
  //     "Mining Operations Assessment - comprehensive evaluation of work management, defect elimination, asset strategy and asset health at Goonyella Mine coal operations",
  //   status: "under_review",
  //   type: "onsite",
  //   business_unit_id: "demo-business-unit-2",
  //   region_id: "demo-region-4",
  //   site_id: "demo-site-8",
  //   asset_group_id: "demo-asset-group-14",
  //   objectives: [
  //     {
  //       id: "demo-assessment-8-objective-1",
  //       title:
  //         "Optimize Work Management and Maintenance Planning Effectiveness",
  //       description:
  //         "Evaluate and enhance the systematic identification, planning, scheduling, execution, and analysis of maintenance work to achieve >90% schedule compliance and reduce unplanned maintenance interventions across onsite underground mining equipment and infrastructure.",
  //     },
  //     {
  //       id: "demo-assessment-8-objective-2",
  //       title:
  //         "Strengthen Asset Reliability and Defect Elimination Capabilities",
  //       description:
  //         "Evaluate existing failure analysis capabilities and asset tactics development to implement systematic defect elimination processes that reduce coal handling equipment failures by 20% and optimize longwall maintenance intervals through data-driven decision making.",
  //     },
  //     {
  //       id: "demo-assessment-8-objective-3",
  //       title: "Enhance Integrated Asset Health and Safety Performance",
  //       description:
  //         "Review condition monitoring programs, predictive maintenance technologies, and risk assessment processes to ensure longwall operations maintain peak performance while achieving continuous improvement in safety standards and production reliability targets.",
  //     },
  //   ],
  // },
  // {
  //   id: "demo-assessment-9",
  //   questionnaire_id: "demo-questionnaire-1",
  //   name: "Q3 2025 Perth Training Centre Asset Management Assessment",
  //   description:
  //     "Mining Operations Assessment - comprehensive evaluation of work management, defect elimination, asset strategy and asset health at Perth Training Centre training and safety operations",
  //   status: "under_review",
  //   type: "onsite",
  //   business_unit_id: "demo-business-unit-3",
  //   region_id: "demo-region-5",
  //   site_id: "demo-site-9",
  //   asset_group_id: "demo-asset-group-16",
  //   objectives: [
  //     {
  //       id: "demo-assessment-9-objective-1",
  //       title:
  //         "Optimize Work Management and Maintenance Planning Effectiveness",
  //       description:
  //         "Evaluate and enhance the systematic identification, planning, scheduling, execution, and analysis of maintenance work to achieve >90% schedule compliance and reduce unplanned maintenance interventions across desktop training and safety equipment and infrastructure.",
  //     },
  //     {
  //       id: "demo-assessment-9-objective-2",
  //       title:
  //         "Strengthen Asset Reliability and Defect Elimination Capabilities",
  //       description:
  //         "Assess current safety incident analysis and risk identification processes to establish robust safety improvement programs that reduce safety-related incidents by 25% and enhance emergency response capabilities through systematic problem-solving methodologies.",
  //     },
  //     {
  //       id: "demo-assessment-9-objective-3",
  //       title: "Enhance Integrated Asset Health and Safety Performance",
  //       description:
  //         "Review safety equipment monitoring systems, training program effectiveness, and emergency response integration to ensure all safety systems operate within optimal parameters while maintaining industry-leading safety standards.",
  //     },
  //   ],
  // },
];
