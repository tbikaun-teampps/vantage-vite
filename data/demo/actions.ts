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
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-1-step-1-question-2",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-6",
        score: 1,
        title: "Transition from Calendar to Tactics-Based PM",
        description:
          "Review and revise current PM work to move away from purely calendar-based scheduling toward maintenance tactics derived from formal analysis.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-7",
        score: 1,
        title: "Increase System-Generated Work Orders",
        description:
          "Implement processes to ensure more than 50% of scheduled work is automatically generated from the SAP system rather than manually created.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-8",
        score: 1,
        title: "Establish Formal Tactics Review Process",
        description:
          "Implement FMEA, RCM, or PMO processes for developing maintenance tactics for new and critical equipment.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-9",
        score: 2,
        title: "Expand Formal Tactics Development",
        description:
          "Apply formal tactic review processes (FMEA, RCM, PMO) to a broader range of equipment beyond just critical assets.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-10",
        score: 2,
        title: "Improve SAP Integration Timeliness",
        description:
          "Streamline the process for entering tactics modifications into SAP to ensure timely system updates.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-11",
        score: 2,
        title: "Increase Preventive Maintenance Ratio",
        description:
          "Develop strategies to increase the percentage of scheduled work that is preventive rather than corrective maintenance.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-1-step-1-question-3",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-12",
        score: 1,
        title: "Develop Comprehensive Inspection Checklists",
        description:
          "Create detailed operator inspection checklists for all critical equipment, aligned with maintenance strategies and safety requirements.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-13",
        score: 1,
        title: "Implement SAP Notification System",
        description:
          "Train operations personnel to enter defects directly into SAP notifications rather than relying on verbal communication.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-14",
        score: 1,
        title: "Standardize Checklist Design",
        description:
          "Establish a standard template and format for all operator inspection checklists to ensure consistency and completeness.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-15",
        score: 2,
        title: "Expand Checklist Coverage",
        description:
          "Extend inspection checklists beyond critical equipment to cover the majority of operational assets using standardized templates.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-16",
        score: 2,
        title: "Enhance Notification Quality",
        description:
          "Implement quality review processes for notifications to ensure they accurately represent equipment condition and maintenance needs.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-1-step-1-question-4",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-17",
        score: 1,
        title: "Create Maintainer-Specific Checklists",
        description:
          "Develop comprehensive inspection checklists specifically designed for maintainer use, covering all critical equipment with detailed specifications.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-18",
        score: 1,
        title: "Establish Defect Capture Process",
        description:
          "Implement a systematic process for maintainers to document and enter defects found during inspections into the SAP system.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-19",
        score: 1,
        title: "Integrate with Maintenance Planning",
        description:
          "Ensure defects identified through maintainer inspections are properly scheduled through the standard maintenance planning process.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-20",
        score: 2,
        title: "Standardize Checklist Templates",
        description:
          "Implement consistent checklist templates across all maintainer inspection activities to ensure uniformity and completeness.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-21",
        score: 2,
        title: "Improve Defect Elimination Integration",
        description:
          "Establish processes for maintainers to submit defect elimination ideas based on inspection findings.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-1-step-2-question-1",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-22",
        score: 1,
        title: "Implement Company Planning Standards",
        description:
          "Establish and communicate comprehensive maintenance planning standards that include resource requirements, safety considerations, and quality specifications.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-23",
        score: 1,
        title: "Improve Work Order Detail",
        description:
          "Enhance work order operations with detailed scoping, including clean-up requirements, decontamination needs, and rotables information.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-24",
        score: 1,
        title: "Establish Planning Accuracy Targets",
        description:
          "Set and monitor planning accuracy targets, aiming to achieve at least 60% estimate accuracy through improved scoping practices.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-25",
        score: 2,
        title: "Enhance Planning Compliance",
        description:
          "Increase adherence to company planning standards to achieve 80% compliance across all planned work activities.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-26",
        score: 2,
        title: "Improve Estimate Accuracy",
        description:
          "Implement feedback loops and planning reviews to achieve greater than 80% estimate accuracy in work planning.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-1-step-2-question-2",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-27",
        score: 1,
        title: "Establish Planning Horizon Guidelines",
        description:
          "Create clear documentation defining the delineation of tasks between Long Term Planning and Business Units with specific time horizons.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-28",
        score: 1,
        title: "Improve LTP-BU Communication",
        description:
          "Establish regular communication channels between Long Term Planning and Business Units to ensure effective handovers and issue resolution.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-29",
        score: 2,
        title: "Increase Planning Compliance",
        description:
          "Implement monitoring and accountability measures to achieve greater than 80% adherence to planning horizon guidelines.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-30",
        score: 2,
        title: "Enhance Monthly Engagement",
        description:
          "Formalize monthly engagement processes between LTP and Business Units to improve coordination and planning effectiveness.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-1-step-2-question-3",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-31",
        score: 1,
        title: "Develop Corrective Work Task Lists",
        description:
          "Create standardized task lists for corrective and breakdown maintenance beyond the existing PM task lists.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-32",
        score: 1,
        title: "Establish Task List Creation Process",
        description:
          "Implement a formal process for creating, updating, and managing task lists to ensure consistent application across all work types.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-33",
        score: 1,
        title: "Improve Task List Utilization",
        description:
          "Train planners on proper use of existing task lists and establish requirements for their application in work planning.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-34",
        score: 2,
        title: "Expand Task List Coverage",
        description:
          "Increase task list usage to cover 75% of corrective and rotable work orders, not just preventive maintenance.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-35",
        score: 2,
        title: "Enhance Task List Detail",
        description:
          "Improve task list specifications with detailed instructions, material requirements, and safety considerations.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-1-step-2-question-4",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-36",
        score: 1,
        title: "Establish Daily Backlog Management",
        description:
          "Implement daily backlog review processes with clear accountability for planners and supervisors to manage workload effectively.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-37",
        score: 1,
        title: "Implement Backlog Standards",
        description:
          "Create standards for backlog management including elimination of duplicates, standing work orders, and outdated tasks.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-38",
        score: 2,
        title: "Enhance Weekly Review Process",
        description:
          "Establish formal weekly backlog review meetings with structured agendas and decision-making criteria for work prioritization.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-39",
        score: 2,
        title: "Integrate Equipment Criticality",
        description:
          "Incorporate equipment criticality and safety implications into backlog management and work deletion decisions.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-1-step-3-question-1",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-40",
        score: 1,
        title: "Extend Planning Horizon",
        description:
          "Develop rough-cut capacity planning extending to at least 12 months to enable better resource planning and coordination.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-41",
        score: 1,
        title: "Integrate with Operations Planning",
        description:
          "Establish formal processes to integrate maintenance scheduling with operations planning and coordinate major maintenance events.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-42",
        score: 2,
        title: "Develop Integrated 24-Month Plan",
        description:
          "Create comprehensive integrated maintenance and operations plans extending 24 months into the future with regular review cycles.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-43",
        score: 2,
        title: "Establish Regular Review Process",
        description:
          "Implement quarterly reviews of long-term schedules with operations to ensure alignment and adjust for changing priorities.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-1-step-3-question-2",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-44",
        score: 1,
        title: "Improve Contractor Scheduling",
        description:
          "Implement systematic scheduling processes for alliance contractors including work centre setup and capacity management.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-45",
        score: 1,
        title: "Enhance Resource Tracking",
        description:
          "Establish daily work centre and individual scheduling to move beyond basic depot and P&E maintainer scheduling.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-46",
        score: 2,
        title: "Implement Hourly Scheduling",
        description:
          "Move from daily to hourly scheduling granularity for improved resource utilization and work coordination.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-47",
        score: 2,
        title: "Optimize Shared Equipment Scheduling",
        description:
          "Develop comprehensive scheduling processes for shared equipment and specialized resources across all work centres.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-1-step-3-question-3",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-48",
        score: 1,
        title: "Establish Resource Loading Guidelines",
        description:
          "Create and communicate formal guidelines for resource loading including targets for schedule loading and utilization rates.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-49",
        score: 1,
        title: "Implement Resource Tracking Systems",
        description:
          "Deploy systematic resource tracking using SAP or manual tools to monitor availability and allocation of all resources.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-50",
        score: 2,
        title: "Achieve Target Schedule Loading",
        description:
          "Implement processes to consistently achieve schedule loading within 5% of established targets through improved planning.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-51",
        score: 2,
        title: "Enhance External Resource Tracking",
        description:
          "Extend resource tracking to include external contractors and ensure accurate, current availability information.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-1-step-3-question-4",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-52",
        score: 1,
        title: "Establish Formal Meeting Structure",
        description:
          "Create structured scheduling meetings with defined agendas, consistent attendance, and documented minutes and action items.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-53",
        score: 1,
        title: "Improve Operations Participation",
        description:
          "Ensure consistent operations attendance at scheduling meetings and establish clear communication protocols.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-54",
        score: 2,
        title: "Enhance Meeting Effectiveness",
        description:
          "Improve meeting outcomes by ensuring all required participants attend and key KPIs and non-conformances are regularly discussed.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-55",
        score: 2,
        title: "Implement Action Tracking",
        description:
          "Establish robust action item tracking and follow-up processes to ensure meeting decisions are implemented effectively.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-1-step-4-question-1",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-56",
        score: 1,
        title: "Implement Structured Handover Process",
        description:
          "Develop formal shift handover procedures with checklists, documentation requirements, and clear communication protocols.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-57",
        score: 1,
        title: "Establish Pre-Shift Briefing Standards",
        description:
          "Create standardized pre-shift briefing processes covering work packages, safety issues, and equipment status.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-58",
        score: 1,
        title: "Deploy Visual Management Tools",
        description:
          "Implement visual boards and communication tools to support effective information transfer between shifts.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-59",
        score: 2,
        title: "Enhance KPI Communication",
        description:
          "Integrate regular KPI reviews into shift briefings and ensure all relevant performance metrics are communicated.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-60",
        score: 2,
        title: "Improve Work Package Distribution",
        description:
          "Establish processes for detailed work package review and distribution at shift start with supervisor oversight.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-1-step-4-question-2",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-61",
        score: 1,
        title: "Implement Formal Handover Procedures",
        description:
          "Establish documented equipment handover procedures covering isolation concerns, testing requirements, and acceptance criteria.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-62",
        score: 1,
        title: "Improve Equipment Readiness",
        description:
          "Develop processes to ensure equipment is properly prepared and ready for maintenance activities when scheduled.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-63",
        score: 2,
        title: "Enhance Acceptance Criteria",
        description:
          "Develop detailed acceptance criteria and procedures for equipment handover and release to improve quality and reduce rework.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-64",
        score: 2,
        title: "Formalize Sign-off Process",
        description:
          "Implement formal sign-off procedures requiring both operations and maintenance approval for equipment release.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-1-step-4-question-3",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-65",
        score: 1,
        title: "Establish Schedule Interruption Process",
        description:
          "Create formal procedures for managing urgent work that interrupts scheduled maintenance, including decision-making criteria.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-66",
        score: 1,
        title: "Improve Schedule Compliance Tracking",
        description:
          "Implement monitoring systems to track schedule adherence and identify patterns in schedule interruptions.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-67",
        score: 2,
        title: "Enhance Authority Levels",
        description:
          "Establish clear authority levels and escalation procedures for schedule interruption decisions, prioritizing preventive maintenance.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-68",
        score: 2,
        title: "Achieve Target Compliance Rates",
        description:
          "Implement processes to achieve greater than 85% overall schedule compliance and 95% breakdown schedule compliance.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-1-step-4-question-4",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-69",
        score: 1,
        title: "Establish Floor Presence Expectations",
        description:
          "Define clear expectations and targets for supervisory floor presence and field interaction time.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-70",
        score: 1,
        title: "Implement Safety Observation Process",
        description:
          "Create systematic processes for supervisors to observe, question, and correct safety practices during floor tours.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-71",
        score: 2,
        title: "Enhance Work Quality Interactions",
        description:
          "Develop structured approaches for supervisors to assess work quality, identify delays, and capture improvement opportunities.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-72",
        score: 2,
        title: "Improve Problem Communication",
        description:
          "Establish processes for supervisors to effectively communicate findings and solutions to crews to prevent recurring issues.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-1-step-5-question-1",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-73",
        score: 1,
        title: "Develop Integrated Training Program",
        description:
          "Create a comprehensive asset management training program that includes work order completion as a core component.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-74",
        score: 1,
        title: "Establish Training Documentation",
        description:
          "Develop formal training materials and procedures for work order completion linked to relevant work management process sections.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-75",
        score: 2,
        title: "Achieve Training Coverage Targets",
        description:
          "Implement tracking and scheduling to achieve greater than 90% training coverage for all personnel using SAP systems.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-76",
        score: 2,
        title: "Enhance Refresher Training",
        description:
          "Establish regular refresher training schedules and new hire training programs with documented competency requirements.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-1-step-5-question-2",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-77",
        score: 1,
        title: "Implement Work History Standards",
        description:
          "Establish comprehensive standards for capturing detailed work history including failure modes, causes, parts used, and delays.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-78",
        score: 1,
        title: "Develop Feedback Coaching Process",
        description:
          "Create systematic feedback and coaching processes to improve the quality of information captured in work history.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-79",
        score: 2,
        title: "Enhance History Quality Review",
        description:
          "Implement supervisor review processes for all work package completion before work order closure to ensure quality.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-80",
        score: 2,
        title: "Improve Task Feedback Processing",
        description:
          "Establish processes to ensure all task improvement feedback is captured and actioned within 28 days.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-1-step-5-question-3",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-81",
        score: 1,
        title: "Improve Time Confirmation Training",
        description:
          "Enhance training for maintainers on the importance and proper methods of accurate time confirmation in SAP.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-82",
        score: 1,
        title: "Implement Daily Time Confirmation",
        description:
          "Establish processes to ensure maintainers complete time confirmation on the correct operations within one day of work completion.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-83",
        score: 2,
        title: "Enhance Supervisor Review Process",
        description:
          "Implement systematic supervisor review of time confirmations to verify planned versus actual hours and identify improvement opportunities.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-84",
        score: 2,
        title: "Expand Contractor Time Tracking",
        description:
          "Ensure all alliance contractors complete time confirmation with appropriate supervisor verification and review.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-1-step-5-question-4",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-85",
        score: 1,
        title: "Establish Closure Process Compliance",
        description:
          "Implement systematic processes to ensure work order closure procedures are consistently followed within committed timeframes.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-86",
        score: 1,
        title: "Enhance Quality Review Process",
        description:
          "Establish supervisor quality review requirements for all work package completion before work order closure.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-87",
        score: 2,
        title: "Achieve 24-Hour Closure Target",
        description:
          "Implement processes and accountability measures to achieve work order closure within 24 hours of work completion.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-88",
        score: 2,
        title: "Implement Performance Metrics",
        description:
          "Develop and communicate work package completion KPIs to teams and establish regular performance discussions.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-1-step-6-question-1",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-89",
        score: 1,
        title: "Establish Formal Review Meetings",
        description:
          "Create structured weekly review meetings with standard agendas focusing on schedule performance and maintenance metrics rather than just urgent work.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-90",
        score: 1,
        title: "Implement Cross-Functional Participation",
        description:
          "Ensure participation from maintenance, operations, and support departments with clear roles and responsibilities.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-91",
        score: 2,
        title: "Enhance Analysis and Action Planning",
        description:
          "Implement systematic analysis of performance gaps with specific root cause identification and action plan development.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-92",
        score: 2,
        title: "Improve Action Closure Rates",
        description:
          "Establish processes and accountability to achieve greater than 80% weekly action closure rates with named owners and target dates.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-1-step-6-question-2",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-93",
        score: 1,
        title: "Establish Structured Daily Review",
        description:
          "Create formal daily review meetings with structured agendas covering work completion, schedule performance, and improvement opportunities.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-94",
        score: 1,
        title: "Expand Review Scope",
        description:
          "Broaden daily reviews beyond just breakdowns to include preventive maintenance performance and tactics effectiveness.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-95",
        score: 2,
        title: "Enhance Tactics Review Integration",
        description:
          "Integrate discussions about tactics reviews and root cause analysis needs based on equipment and work management performance.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-96",
        score: 2,
        title: "Improve Notification Management",
        description:
          "Establish systematic processes for identifying when notifications are required and ensuring they are properly raised.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-1-step-6-question-3",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-97",
        score: 1,
        title: "Implement KPI Communication Process",
        description:
          "Establish regular KPI communication and discussion processes with maintenance teams to ensure understanding and engagement.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-98",
        score: 1,
        title: "Deploy Visual KPI Management",
        description:
          "Implement visual KPI displays in work areas with regular updates and team discussions about performance trends.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-99",
        score: 2,
        title: "Enhance Decision-Making Integration",
        description:
          "Implement processes to ensure management decisions are systematically based on KPI performance and trends.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-100",
        score: 2,
        title: "Improve Accessibility and Influence",
        description:
          "Make KPI systems easily accessible to maintainers and ensure they directly influence daily work execution decisions.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-1-step-6-question-4",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-101",
        score: 1,
        title: "Establish Formal Reliability Interface",
        description:
          "Create formal processes for interaction between work management and reliability teams including regular meetings and documentation.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-102",
        score: 1,
        title: "Implement Systematic Reporting",
        description:
          "Establish systematic reporting of repetitive failures and performance issues to the reliability group with proper documentation.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-103",
        score: 2,
        title: "Enhance Documentation and Tracking",
        description:
          "Implement comprehensive documentation of reliability interactions and ensure notifications are raised for all findings and recommendations.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-104",
        score: 2,
        title: "Expand Critical Equipment Focus",
        description:
          "Ensure Asset Tactics Development and reviews are systematically conducted on all critical systems and equipment based on formal processes.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-2-step-1-question-1",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-105",
        score: 1,
        title: "Implement Systematic Loss Capture Process",
        description:
          "Establish clear, documented processes for capturing operational losses and equipment downtime with consistent data entry procedures.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-106",
        score: 1,
        title: "Deploy Automated Loss Monitoring",
        description:
          "Implement automated systems to capture operational losses and delays, replacing manual entry and verbal reporting methods.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-107",
        score: 2,
        title: "Improve Data Accuracy and Accessibility",
        description:
          "Enhance automated loss monitoring systems to ensure data accuracy and provide easy access for reliability analysis purposes.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-108",
        score: 2,
        title: "Increase Work Order Correlation",
        description:
          "Improve integration between loss monitoring and SAP systems to achieve 80% correlation between maintenance-related losses and work orders.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-2-step-1-question-2",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-109",
        score: 1,
        title: "Establish Defect Identification Process",
        description:
          "Create systematic processes for identifying defects using available data sources instead of relying on ad-hoc gut-feel approaches.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-110",
        score: 1,
        title: "Implement Single Source Analysis",
        description:
          "Begin systematic defect identification through analysis of at least one key data source such as operational performance or maintenance history.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-111",
        score: 2,
        title: "Expand Multi-Source Analysis",
        description:
          "Implement defect identification processes that utilize several key data sources including operational performance, maintenance history, and logbook data.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-112",
        score: 2,
        title: "Enhance Data Integration",
        description:
          "Develop capabilities to systematically analyze multiple data sources together for more comprehensive defect identification.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-2-step-1-question-3",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-113",
        score: 1,
        title: "Establish Central Defect Capture System",
        description:
          "Create a centralized location and process for capturing defects identified through observations, interviews, and safety interactions.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-114",
        score: 1,
        title: "Implement Observation Defect Process",
        description:
          "Develop formal processes for converting observations from floor tours, task analysis, and direct observation into actionable defect information.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-115",
        score: 2,
        title: "Achieve Complete Defect Capture",
        description:
          "Ensure all defects identified through observations are captured in the central location with proper categorization and follow-up processes.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-116",
        score: 2,
        title: "Integrate with Defect Register",
        description:
          "Connect observation-based defect capture with the formal defect register to ensure comprehensive tracking and management.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-2-step-1-question-4",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-117",
        score: 1,
        title: "Establish Incident Defect Capture Process",
        description:
          "Create formal processes to systematically capture defects identified through incident investigations rather than informal approaches.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-118",
        score: 1,
        title: "Implement Cross-Functional Investigation Teams",
        description:
          "Establish cross-functional teams for major incident investigations to ensure comprehensive root cause analysis and defect identification.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-119",
        score: 2,
        title: "Integrate with Central Defect Register",
        description:
          "Ensure all incident-related defects are captured in the central defect register with proper root cause analysis and corrective actions.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-120",
        score: 2,
        title: "Enhance RCA Tool Application",
        description:
          "Apply sound reliability engineering judgment and data-driven RCA tools to ensure corrective actions are based on facts rather than assumptions.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-2-step-2-question-1",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-121",
        score: 1,
        title: "Implement Systematic Defect Classification",
        description:
          "Establish formal processes for classifying and assessing defects based on safety, operational, and financial impact criteria.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-122",
        score: 1,
        title: "Develop Risk Assessment Framework",
        description:
          "Create comprehensive risk assessment processes that consider safety, health, environment, reputation, and financial factors for defect prioritization.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-123",
        score: 2,
        title: "Implement Company Risk Matrix",
        description:
          "Deploy approved company risk/value matrices for systematic defect prioritization that considers all relevant impact factors.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-124",
        score: 2,
        title: "Establish Monetary Value Assessment",
        description:
          "Develop capabilities to quantify the monetary value of eliminating each defect to support informed investment decisions.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-2-step-2-question-2",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-125",
        score: 1,
        title: "Establish Formal Defect Register",
        description:
          "Create a controlled, formal defect register to replace informal documentation and ensure comprehensive tracking of potential projects.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-126",
        score: 1,
        title: "Expand Register Coverage",
        description:
          "Ensure the defect register captures all potential improvement projects, not just a subset of opportunities.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-127",
        score: 2,
        title: "Integrate with Business Improvement System",
        description:
          "Align the defect register with current business improvement systems to ensure coordinated approach to organizational improvements.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-128",
        score: 2,
        title: "Enhance Register Functionality",
        description:
          "Develop the defect register to support comprehensive project tracking, prioritization, and resource allocation decisions.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-2-step-2-question-3",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-129",
        score: 1,
        title: "Establish Formal Selection Criteria",
        description:
          "Create documented criteria for selecting appropriate defect elimination methodologies based on impact, complexity, and available resources.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-130",
        score: 1,
        title: "Implement DE Management Team Process",
        description:
          "Establish regular DE Management Team meetings with structured decision-making processes for methodology selection and project approval.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-131",
        score: 2,
        title: "Align with Business Processes",
        description:
          "Ensure defect elimination methodology selection criteria align with and integrate with existing business processes and decision frameworks.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-132",
        score: 2,
        title: "Improve Criteria Compliance",
        description:
          "Implement monitoring and accountability measures to ensure formal criteria are consistently followed by the DE Management Team.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-2-step-2-question-4",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-133",
        score: 1,
        title: "Establish DE Management Team Approval",
        description:
          "Implement formal processes requiring DE Management Team approval for all defect elimination team selections and project initiation.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-134",
        score: 1,
        title: "Improve Team Resourcing",
        description:
          "Develop systematic approaches to ensure DE teams are adequately resourced with appropriate skills and time allocation.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-135",
        score: 2,
        title: "Enhance Cross-Functional Representation",
        description:
          "Ensure DE teams include cross-functional representation with all required skill sets rather than single-department focus.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-136",
        score: 2,
        title: "Optimize Team Composition",
        description:
          "Develop guidelines for optimal team composition based on project type, complexity, and required expertise areas.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-2-step-3-question-1",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-137",
        score: 1,
        title: "Develop RCA Training Program",
        description:
          "Establish formal training programs for multiple RCA methods (5-Whys, Cause-and-Effect, Apollo RCA, TapRooT, KT) across the organization.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-138",
        score: 1,
        title: "Build Internal RCA Capability",
        description:
          "Train multiple personnel in facilitating various RCA methods to reduce dependence on external resources and improve problem-solving capability.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-139",
        score: 2,
        title: "Establish Formal RCA Method Portfolio",
        description:
          "Create a comprehensive portfolio of RCA methods with trained facilitators and clear guidelines for method selection and application.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-140",
        score: 2,
        title: "Develop Cross-Functional RCA Teams",
        description:
          "Train personnel from different functional areas in RCA facilitation to enable cross-functional problem-solving approaches.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-2-step-3-question-2",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-141",
        score: 1,
        title: "Establish Method Selection Guidelines",
        description:
          "Create formal criteria and guidelines for selecting appropriate RCA methods based on problem complexity, risk, and available resources.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-142",
        score: 1,
        title: "Improve Team Method Familiarity",
        description:
          "Ensure teams move beyond using only familiar methods to selecting the most appropriate tool for each specific problem situation.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-143",
        score: 2,
        title: "Develop Expert-Led Selection Process",
        description:
          "Implement processes where reliability engineers or experienced team leaders select RCA methods based on professional judgment and problem characteristics.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-144",
        score: 2,
        title: "Create Method Selection Procedures",
        description:
          "Establish clear procedures for RCA method selection with defined criteria and team makeup requirements aligned with methodology choice.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-2-step-3-question-3",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-145",
        score: 1,
        title: "Implement Team Charter Requirements",
        description:
          "Establish requirements for all DE teams to develop formal team charters with clear problem statements before beginning analysis work.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-146",
        score: 1,
        title: "Develop Problem Statement Standards",
        description:
          "Create standards and templates for developing clear, comprehensive problem statements that guide effective team analysis efforts.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-147",
        score: 2,
        title: "Enhance Collaborative Charter Development",
        description:
          "Implement processes where facilitators work collaboratively with teams to develop problem statements and charters rather than working independently.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-148",
        score: 2,
        title: "Improve Stakeholder Communication",
        description:
          "Ensure team charters and problem statements are understood and communicated to all key stakeholders before project initiation.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-2-step-3-question-4",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-149",
        score: 1,
        title: "Establish Team Composition Guidelines",
        description:
          "Create formal guidelines for DE team composition that consider required expertise rather than just availability of personnel.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-150",
        score: 1,
        title: "Expand Beyond Technical Expertise",
        description:
          "Develop team selection processes that include stakeholders affected by defects, not just those with the most technical knowledge.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-151",
        score: 2,
        title: "Implement Cross-Functional Teams",
        description:
          "Establish requirements for cross-functional team representation that includes all areas affected by defects while focusing on supervisory levels and above.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-152",
        score: 2,
        title: "Include Frontline Personnel",
        description:
          "Expand DE team participation to include hourly personnel and frontline workers to make defect elimination a normal daily activity across the organization.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-2-step-4-question-1",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-153",
        score: 1,
        title: "Focus on Root Cause Solutions",
        description:
          "Establish requirements that all identified actions must address actual root causes rather than symptoms or immediate problems.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-154",
        score: 1,
        title: "Implement Action Documentation Process",
        description:
          "Create formal processes for documenting and evaluating all potential solutions and actions developed by DE teams.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-155",
        score: 2,
        title: "Address Contributing Factors",
        description:
          "Expand action development to address not only root causes but also contributing factors that influence problem occurrence.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-156",
        score: 2,
        title: "Consider Short and Long-term Solutions",
        description:
          "Develop comprehensive action plans that consider both immediate fixes and long-term solutions for overall business benefit.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-2-step-4-question-2",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-157",
        score: 1,
        title: "Establish Action Evaluation Criteria",
        description:
          "Create formal criteria for evaluating potential actions including root cause effectiveness, safety implications, cost, and implementation ease.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-158",
        score: 1,
        title: "Implement Systematic Evaluation Process",
        description:
          "Develop processes to ensure all potential actions are systematically evaluated against established criteria before implementation.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-159",
        score: 2,
        title: "Enhance Stakeholder Involvement",
        description:
          "Include key stakeholders in the action evaluation process to ensure comprehensive assessment of all impact areas and implementation requirements.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-160",
        score: 2,
        title: "Align with Site Evaluation Methods",
        description:
          "Ensure action evaluation methodology aligns with site's Edge evaluation methods and established decision-making frameworks.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-2-step-4-question-3",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-161",
        score: 1,
        title: "Create Detailed Action Plans",
        description:
          "Develop comprehensive action plans that include specific actions, clear accountability, measurable targets, and completion deliverables.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-162",
        score: 1,
        title: "Establish Accountability Framework",
        description:
          "Implement clear accountability structures with named individuals responsible for each action and defined completion dates.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-163",
        score: 2,
        title: "Include Benefit Targets",
        description:
          "Enhance action plans to include specific benefit targets and deliverables that support overall business success measurements.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-164",
        score: 2,
        title: "Improve Plan Specificity",
        description:
          "Develop more detailed action plans with specific milestones, resource requirements, and success criteria for effective implementation.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-2-step-4-question-4",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-165",
        score: 1,
        title: "Establish Measurement Framework",
        description:
          "Create systematic measurement plans that include baselines and appropriate KPIs to track the effectiveness of approved actions.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-166",
        score: 1,
        title: "Define Success Criteria",
        description:
          "Clearly define criteria for success that are understood by both teams and management, with measurable outcomes and targets.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-167",
        score: 2,
        title: "Develop Comprehensive KPI System",
        description:
          "Create measurement plans with accurate baselines and process indicators that include both leading and lagging KPIs for comprehensive performance tracking.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-168",
        score: 2,
        title: "Enhance Baseline Accuracy",
        description:
          "Ensure accurate baseline establishment with robust process indicators and KPIs that effectively reflect target improvement areas.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-2-step-5-question-1",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-169",
        score: 1,
        title: "Establish Formal Approval Process",
        description:
          "Create documented approval procedures that ensure proper authorization and change management consideration for all defect elimination actions.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-170",
        score: 1,
        title: "Implement Change Management Integration",
        description:
          "Ensure all improvement actions consider and complete necessary change management requirements before implementation.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-171",
        score: 2,
        title: "Enhance Stakeholder Approval",
        description:
          "Improve approval processes to ensure written approval from all relevant stakeholders and consistent completion of change management requirements.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-172",
        score: 2,
        title: "Include DE Management Review",
        description:
          "Implement high-level review of all findings and actions by the DE management team as part of the formal approval process.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-2-step-5-question-2",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-173",
        score: 1,
        title: "Establish Clear Accountabilities",
        description:
          "Create documented accountability structures for action plan completion that include project management, action completion, and progress monitoring.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-174",
        score: 1,
        title: "Improve Action Management",
        description:
          "Implement systematic action management processes to ensure actions are completed as planned with appropriate oversight.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-175",
        score: 2,
        title: "Enhance Management Monitoring",
        description:
          "Establish regular site leader monitoring of DE team member progress on action plans to ensure consistent completion as planned.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-176",
        score: 2,
        title: "Syndicate with Management",
        description:
          "Ensure management understands and actively supports actions assigned to their team members with regular progress reviews.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-2-step-5-question-3",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-177",
        score: 1,
        title: "Implement Regular Action Review",
        description:
          "Establish systematic review processes for DE team actions and progress at monthly DE Management Team meetings.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-178",
        score: 1,
        title: "Address Action Slippage",
        description:
          "Create processes to identify and address action plan slippage through additional resources, tools, or collaboration as needed.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-179",
        score: 2,
        title: "Focus on Deadline Adherence",
        description:
          "Implement strong focus on meeting action plan deadlines with accountability measures and performance tracking.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-180",
        score: 2,
        title: "Provide Site Leader Support",
        description:
          "Establish site leader support systems to bring delayed actions back on schedule with appropriate resource allocation and problem resolution.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-2-step-5-question-4",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-181",
        score: 1,
        title: "Establish Action Tracking System",
        description:
          "Create systematic action tracking using meeting minutes, action logs, and defect registers to monitor DE team progress.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-182",
        score: 1,
        title: "Implement Regular Updates",
        description:
          "Establish weekly action log updates with distribution to team members and site leaders as requested.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-183",
        score: 2,
        title: "Integrate with Defect Register",
        description:
          "Ensure action plan progress is regularly updated in the defect register along with meeting minutes for comprehensive tracking.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-184",
        score: 2,
        title: "Provide Stakeholder Access",
        description:
          "Make defect register continuously accessible to all site leaders and stakeholders with real-time progress updates and changes.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-2-step-6-question-1",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-185",
        score: 1,
        title: "Document DE Business Process",
        description:
          "Create comprehensive documentation of the defect elimination business process including loss reporting, analysis, and action tracking components.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-186",
        score: 1,
        title: "Implement Formalized Register",
        description:
          "Establish formal register/tracker systems to monitor action status from initiation to closure with systematic reporting processes.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-187",
        score: 2,
        title: "Establish Post-Completion Audit Process",
        description:
          "Implement formal post-completion audit processes to validate the effectiveness of defect elimination actions and outcomes.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-188",
        score: 2,
        title: "Develop Learning Sharing System",
        description:
          "Create processes to share learnings across the company and with vendors and wider industry for continuous improvement.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-2-step-6-question-2",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-189",
        score: 1,
        title: "Establish Regular DE Management Reviews",
        description:
          "Create formal monthly DE Management Team meetings with structured agendas that include current project reviews and KPI assessment.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-190",
        score: 1,
        title: "Improve Reporting Quality",
        description:
          "Develop systematic reporting processes for DE teams that move beyond last-minute preparation to comprehensive project updates.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-191",
        score: 2,
        title: "Enhance Register-Based Reviews",
        description:
          "Implement systematic defect register reviews at each DE Management Team meeting to identify major project non-conformances and issues.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-192",
        score: 2,
        title: "Provide Specific Team Feedback",
        description:
          "Establish processes for DE Management Team to provide specific feedback to DE teams on performance and improvement opportunities.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-2-step-6-question-3",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-193",
        score: 1,
        title: "Implement Project Sustainability Reviews",
        description:
          "Establish systematic reviews of completed DE projects to ensure long-term sustainability of improvements and prevent regression.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-194",
        score: 1,
        title: "Develop Long-term KPI Tracking",
        description:
          "Create long-term KPI allocation and tracking systems for DE projects to monitor sustained benefits over time.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-195",
        score: 2,
        title: "Assign Sustainability Accountability",
        description:
          "Ensure completed DE projects are monitored according to measurement plans by designated DE team members or accountable persons.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-196",
        score: 2,
        title: "Implement Monthly Sustainability Reporting",
        description:
          "Establish monthly reporting of sustainability results to DE Management Team with corrective actions for negative trends.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-2-step-6-question-4",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-197",
        score: 1,
        title: "Improve Outcome Documentation",
        description:
          "Establish systematic documentation and updating of DE project outcomes in the defect register with comprehensive results tracking.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-198",
        score: 1,
        title: "Enhance Information Sharing",
        description:
          "Improve information sharing about DE project outcomes beyond relying primarily on team leaders for project communication.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-199",
        score: 2,
        title: "Implement Site-wide Communication",
        description:
          "Establish systematic communication of DE project outcomes across the site to increase awareness and promote knowledge sharing.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-200",
        score: 2,
        title: "Enable Cross-Site Sharing",
        description:
          "Create processes to make DE project outcomes and learnings available to other company sites for broader organizational benefit.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-3-step-1-question-1",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-201",
        score: 1,
        title: "Implement Asset Criticality Analysis",
        description:
          "Conduct comprehensive criticality analysis at the physical asset level for all equipment, moving beyond system-level analysis only.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-202",
        score: 1,
        title: "Establish Criticality Ranking System",
        description:
          "Develop systematic criticality ranking based on consequence and likelihood across safety, health, environmental, cost, and operational categories.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-203",
        score: 2,
        title: "Align with Company Guidelines",
        description:
          "Ensure asset criticality ranking follows established Company Asset Criticality Guidelines for consistency across operations.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-204",
        score: 2,
        title: "Integrate with Tactics Development",
        description:
          "Systematically incorporate criticality rankings into all asset tactics development and review processes for prioritized maintenance strategies.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-3-step-1-question-2",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-205",
        score: 1,
        title: "Implement Risk Analysis Framework",
        description:
          "Conduct systematic risk analysis at the physical asset level using consequence and likelihood assessments for all critical assets.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-206",
        score: 1,
        title: "Apply Enterprise Risk Framework",
        description:
          "Ensure risk rankings are based on the Company Enterprise Risk Management Framework and Appetite for consistent risk assessment.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-207",
        score: 2,
        title: "Integrate Risk Management with Asset Tactics",
        description:
          "Establish processes to incorporate Material Risks (Level 5 and 6) into Asset Tactic Development activities as part of risk treatment plans.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-208",
        score: 2,
        title: "Centralize Risk Data Management",
        description:
          "Record all approved asset criticality rankings in central databases and capture them in SAP for systematic tracking and management.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-3-step-2-question-1",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-209",
        score: 1,
        title: "Implement Relational Database System",
        description:
          "Move from Excel spreadsheets to a relational database system (such as Access) for improved tactics development data management.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-210",
        score: 1,
        title: "Establish Equipment Hierarchy",
        description:
          "Create logical equipment hierarchies and breakdown structures for critical equipment within the database system.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-211",
        score: 2,
        title: "Deploy Advanced Database Software",
        description:
          "Implement specialized software products with statistical analysis functions for comprehensive tactics development and analysis.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-212",
        score: 2,
        title: "Integrate with SAP Systems",
        description:
          "Establish database links with SAP/AMS systems for seamless data flow and comprehensive asset tactics management.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-3-step-2-question-2",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-213",
        score: 1,
        title: "Establish Formal Review Process",
        description:
          "Create systematic tactics review processes beyond ad-hoc approaches, with documented triggers for review based on time and performance.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-214",
        score: 1,
        title: "Document Review Triggers",
        description:
          "Establish clear, documented triggers for tactics review including time-based, performance-based, and condition change criteria.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-215",
        score: 2,
        title: "Expand Review Criteria",
        description:
          "Implement comprehensive review triggers based on multiple operational performance measures for critical assets beyond basic time and incident triggers.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-216",
        score: 2,
        title: "Develop Comprehensive Review Plan",
        description:
          "Create integrated review plans that consider technical advances, performance trends, and changing operating contexts for systematic tactics improvement.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-3-step-2-question-3",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-217",
        score: 1,
        title: "Establish Formal Tactics Development Teams",
        description:
          "Create structured teams with defined goals and action plans for asset tactics development beyond individual or ad-hoc approaches.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-218",
        score: 1,
        title: "Implement Cross-Functional Teams",
        description:
          "Form teams that include maintenance, reliability, operations, and technical personnel for comprehensive tactics development.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-219",
        score: 2,
        title: "Include OEM Representatives",
        description:
          "Expand team composition to include Original Equipment Manufacturer representatives where needed for specialized equipment knowledge.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-220",
        score: 2,
        title: "Enable Cross-Site Collaboration",
        description:
          "Establish cross-site team collaboration and tactics sharing to leverage organizational knowledge and best practices.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-3-step-2-question-4",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-221",
        score: 1,
        title: "Create Prioritized Project List",
        description:
          "Develop systematic prioritization of tactics development projects using criticality ranking and other defined criteria instead of ad-hoc selection.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-222",
        score: 1,
        title: "Establish Management Selection Process",
        description:
          "Implement formal management approval processes for tactics development project selection with clear boundaries and scope definition.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-223",
        score: 2,
        title: "Include Resource Planning",
        description:
          "Ensure management selection process explicitly includes resource allocation and capacity planning for approved tactics development projects.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-224",
        score: 2,
        title: "Optimize Project Scope",
        description:
          "Design projects to be frequent and focused rather than large and intermittent for better resource utilization and faster results.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-3-step-3-question-1",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-225",
        score: 1,
        title: "Implement Decision Documentation Process",
        description:
          "Create systematic processes to record decision-making history for critical tasks and intervals in a structured Asset Tactic Development database.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-226",
        score: 1,
        title: "Establish Database Documentation",
        description:
          "Move tactics development information from scattered documentation into a centralized Asset Tactic Development database for asset-level tracking.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-227",
        score: 2,
        title: "Expand to Component-Level Documentation",
        description:
          "Enhance decision history documentation to component level for all critical assets with comprehensive RCM, FMEA, and PMO decision logic capture.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-228",
        score: 2,
        title: "Track All Tactics Changes",
        description:
          "Implement comprehensive tracking of all changes and updates to tactics decisions in the database for complete decision history maintenance.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-3-step-3-question-2",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-229",
        score: 1,
        title: "Establish Tactics-CMMS Alignment",
        description:
          "Ensure critical tasks in CMMS systems reflect tactics documented in the Asset Tactic Development database for consistency and traceability.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-230",
        score: 1,
        title: "Achieve 50% Database Coverage",
        description:
          "Implement processes to ensure more than 50% of critical equipment tasks are documented in the tactics database with formal analysis.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-231",
        score: 2,
        title: "Achieve Complete Database Coverage",
        description:
          "Ensure 100% of critical equipment tasks are documented in tactics database with appropriate FMECA/RCM analysis and validation.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-232",
        score: 2,
        title: "Apply to New Asset Acquisitions",
        description:
          "Establish requirements for formal Asset Tactic Development analysis for all new or acquired assets before operational deployment.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-3-step-4-question-1",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-233",
        score: 1,
        title: "Implement Standard Documentation Templates",
        description:
          "Create and deploy standard templates for service sheets and work instructions to ensure consistency across all maintenance tasks.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-234",
        score: 1,
        title: "Improve Task Clarity",
        description:
          "Enhance task documentation to be easily understood and appropriate for expected trade experience levels with clear acceptance criteria.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-235",
        score: 2,
        title: "Standardize Terminology",
        description:
          "Implement consistent terminology across all task documentation and establish standard methods for emphasizing critical tasks.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-236",
        score: 2,
        title: "Apply Documentation Guidelines",
        description:
          "Use comprehensive document design guidelines covering terminology, photos, reference materials, and formatting for optimal task execution.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-3-step-4-question-2",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-237",
        score: 1,
        title: "Establish Field Validation Requirements",
        description:
          "Create formal processes requiring field validation of all new or changed tactics before inclusion in CMMS systems.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-238",
        score: 1,
        title: "Implement Safety Validation",
        description:
          "Ensure all new tasks undergo comprehensive safety, ergonomic, and environmental validation during field testing.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-239",
        score: 2,
        title: "Enhance Complex Task Validation",
        description:
          "Require complex tasks to be validated by both maintainers and reliability engineers for comprehensive assessment of implementation challenges.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-240",
        score: 2,
        title: "Integrate with Change Management",
        description:
          "Incorporate field validation requirements into formal change management procedures for systematic implementation of new tactics.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-3-step-4-question-3",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-241",
        score: 1,
        title: "Develop Task Packaging Process",
        description:
          "Create documented processes for effective task packaging with clearly defined responsibilities in a RACI matrix for systematic implementation.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-242",
        score: 1,
        title: "Consider Maintenance Program Integration",
        description:
          "Ensure new tasks and service sheets are integrated thoughtfully into existing maintenance programs rather than ad-hoc implementation.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-243",
        score: 2,
        title: "Apply to All Critical Assets",
        description:
          "Implement task packaging processes consistently for all critical asset tasks to ensure comprehensive integration with maintenance programs.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-244",
        score: 2,
        title: "Extend to All Assets",
        description:
          "Apply systematic task packaging processes to all assets, not just critical equipment, for comprehensive maintenance program optimization.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-3-step-4-question-4",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-245",
        score: 1,
        title: "Implement Formal Change Process",
        description:
          "Establish formal change management procedures requiring reliability engineer review and approval for all PM/task modifications.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-246",
        score: 1,
        title: "Align with Business Processes",
        description:
          "Ensure change management procedures align with existing business processes and consider actual failure modes and business requirements.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-247",
        score: 2,
        title: "Integrate Methodology Requirements",
        description:
          "Require all PM/task changes to be based on selected methodologies (RCM, FMECA, PMO) rather than ad-hoc decision making.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-248",
        score: 2,
        title: "Enhance Review Criteria",
        description:
          "Strengthen change management procedures to include comprehensive consideration of failure modes, business requirements, and technical implications.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-3-step-5-question-1",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-249",
        score: 1,
        title: "Implement Regular Performance Analysis",
        description:
          "Establish systematic analysis of equipment performance metrics using tools such as Pareto charts for consistent issue identification.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-250",
        score: 1,
        title: "Develop Performance Review Process",
        description:
          "Create regular review processes for equipment performance data to identify emerging issues and tactics optimization opportunities.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-251",
        score: 2,
        title: "Integrate Proactive Risk Assessment",
        description:
          "Implement proactive risk assessments (FMEA) and various performance metrics to identify emerging issues and improvement opportunities in advance.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-252",
        score: 2,
        title: "Implement Lifecycle Costing",
        description:
          "Establish comprehensive lifecycle costing analysis covering procurement, maintenance, operations, and disposal for informed decision making.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-3-step-5-question-2",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-253",
        score: 1,
        title: "Implement Regular PMO Activities",
        description:
          "Establish systematic Preventative Maintenance Optimization reviews for equipment with well-understood failure modes and significant operational history.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-254",
        score: 1,
        title: "Expand PMO Application",
        description:
          "Apply PMO methodology more broadly across equipment with established performance patterns to optimize task intervals and effectiveness.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-255",
        score: 2,
        title: "Increase PMO Frequency",
        description:
          "Implement PMO activities on a more frequent basis, ensuring completed PMO projects within the last 12 months for continuous optimization.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-256",
        score: 2,
        title: "Achieve Widespread PMO Implementation",
        description:
          "Ensure PMO methodology is widely used across all appropriate equipment with demonstrated effective implementation and results.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-3-step-5-question-3",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-257",
        score: 1,
        title: "Establish Individual Site Contacts",
        description:
          "Enable key individuals to develop ad-hoc contacts with other sites for informal tactics discussion and knowledge sharing.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-258",
        score: 1,
        title: "Provide Access to Online Forums",
        description:
          "Ensure key personnel have access to online groups and forums for tactics development collaboration and information sharing.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-259",
        score: 2,
        title: "Participate in Common Practice Groups",
        description:
          "Ensure key individuals actively participate in Common Practice Work Groups for systematic knowledge sharing and collaboration.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-260",
        score: 2,
        title: "Engage in Multi-Site Projects",
        description:
          "Involve key personnel in multi-site tactics development projects for comprehensive collaboration and organizational learning.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-3-step-5-question-4",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-261",
        score: 1,
        title: "Establish DE-Tactics Integration",
        description:
          "Create formal processes to ensure some defect elimination recommendations are integrated into asset tactics development processes.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-262",
        score: 1,
        title: "Implement DE Review Process",
        description:
          "Establish systematic review processes for defect elimination recommendations that impact asset tactics and maintenance strategies.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-263",
        score: 2,
        title: "Enhance DE-Tactics Integration",
        description:
          "Ensure all defect elimination recommendations for tactics changes are systematically integrated into Asset Tactics Development processes.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-264",
        score: 2,
        title: "Implement Approval Process",
        description:
          "Establish formal review and approval processes for all DE-generated tactics changes before implementation to ensure quality and alignment.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-4-step-1-question-1",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-265",
        score: 1,
        title: "Centralize Asset Health Information",
        description:
          "Consolidate scattered Asset Health information into specified, accessible locations with clear organization and retrieval processes.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-266",
        score: 1,
        title: "Implement Change Tracking System",
        description:
          "Establish systematic tracking of Asset Health program changes (e.g., frequency adjustments, parameter modifications) with proper documentation.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-267",
        score: 2,
        title: "Enhance Information Accessibility",
        description:
          "Improve access to Asset Health information stored at various locations and ensure it's readily available to all relevant personnel.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-268",
        score: 2,
        title: "Develop Electronic Access Systems",
        description:
          "Create common electronic storage location for all Asset Health information with controlled access for authorized personnel.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-4-step-1-question-2",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-269",
        score: 1,
        title: "Establish Formal Ownership System",
        description:
          "Create documented ownership system with clear roles and responsibilities for Asset Health activities rather than informal processes.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-270",
        score: 1,
        title: "Implement Asset Health Champion Role",
        description:
          "Designate Asset Health Champions with defined responsibilities for program oversight and stakeholder engagement.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-271",
        score: 2,
        title: "Ensure Consistent System Implementation",
        description:
          "Implement ownership system consistently across all Asset Health activities with proper documentation and regular compliance monitoring.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-272",
        score: 2,
        title: "Activate Champion Participation",
        description:
          "Ensure Asset Health Champions are actively participating in meetings, reviews, and program development activities.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-4-step-2-question-1",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-273",
        score: 1,
        title: "Establish Formal Asset Selection Process",
        description:
          "Create systematic Asset Selection process beyond OEM recommendations, incorporating experience-based criteria and structured decision making.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-274",
        score: 1,
        title: "Implement Vendor/Consultant Reviews",
        description:
          "Engage vendors or consultants to conduct formal equipment reviews for Asset Health program inclusion using Asset Strategy & Tactics development processes.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-275",
        score: 2,
        title: "Deploy Rigorous Selection Process",
        description:
          "Implement comprehensive, approved process for identifying appropriate equipment for Asset Health surveys, including criticality reviews and systematic evaluation.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-276",
        score: 2,
        title: "Integrate with Asset Strategy",
        description:
          "Ensure Asset Selection process is fully integrated with broader Asset Strategy and Tactics development for comprehensive asset management.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-4-step-2-question-2",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-277",
        score: 1,
        title: "Develop Access Management System",
        description:
          "Create systematic processes to address equipment access issues and improve safe access to equipment requiring Asset Health monitoring.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-278",
        score: 1,
        title: "Improve Access Infrastructure",
        description:
          "Invest in access infrastructure improvements to achieve safe access to at least 50% of equipment requiring Asset Health monitoring.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-279",
        score: 2,
        title: "Achieve Comprehensive Access",
        description:
          "Expand access management system to enable safe access to 75% or more of equipment requiring Asset Health monitoring.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-280",
        score: 2,
        title: "Complete Access Solutions",
        description:
          "Implement comprehensive access solutions enabling safe access to all equipment requiring Asset Health monitoring.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-4-step-2-question-3",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-281",
        score: 1,
        title: "Establish Critical Equipment Routes",
        description:
          "Create Asset Health inspection routes for critical equipment and implement processes to ensure they are consistently followed.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-282",
        score: 1,
        title: "Expand Route Coverage",
        description:
          "Develop inspection routes for broader equipment categories beyond just critical assets with systematic route management.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-283",
        score: 2,
        title: "Implement Comprehensive Route System",
        description:
          "Establish Asset Health inspection routes for all relevant equipment categories with consistent execution and route optimization.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-284",
        score: 2,
        title: "Achieve Complete Coverage",
        description:
          "Ensure Asset Health inspection routes are established and consistently followed for all company equipment requiring monitoring.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-4-step-3-question-1",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-285",
        score: 1,
        title: "Develop Asset Health Awareness Program",
        description:
          "Create comprehensive training and awareness programs to improve stakeholder understanding of Asset Health processes and their business value.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-286",
        score: 1,
        title: "Implement Stakeholder Education",
        description:
          "Provide education to stakeholders on Asset Health value and technology for key Asset Health processes and applications.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-287",
        score: 2,
        title: "Integrate Asset Health in Tactics",
        description:
          "Ensure stakeholders understand how to appropriately integrate Asset Health into equipment maintenance tactics for some equipment categories.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-288",
        score: 2,
        title: "Achieve Comprehensive Integration",
        description:
          "Develop company-wide stakeholder understanding and integration of Asset Health into all appropriate equipment maintenance tactics.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-4-step-3-question-2",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-289",
        score: 1,
        title: "Implement Formal Training Process",
        description:
          "Establish formal training programs for new Asset Health technicians to replace informal on-the-job training approaches.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-290",
        score: 1,
        title: "Develop Training Curriculum",
        description:
          "Create structured training curriculum covering condition monitoring techniques, analytical skills, and Asset Health technologies.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-291",
        score: 2,
        title: "Establish Refresher Training",
        description:
          "Implement regular refresher training programs and on-demand training for Asset Health personnel to maintain and enhance skills.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-292",
        score: 2,
        title: "Support Professional Development",
        description:
          "Create professional development programs with peer interaction and advanced training opportunities for Asset Health team members.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-4-step-4-question-1",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-293",
        score: 1,
        title: "Improve Information Clarity",
        description:
          "Enhance Asset Health information clarity and accessibility to ensure shop floor personnel can effectively access and use condition data.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-294",
        score: 1,
        title: "Develop Access Systems",
        description:
          "Create systems and processes to make Asset Health information more accessible to operations and maintenance personnel.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-295",
        score: 2,
        title: "Implement Electronic Media Access",
        description:
          "Deploy electronic media systems to provide ready access to Asset Health information across Above Rail and Non-rail operations with multiple data sources.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-296",
        score: 2,
        title: "Achieve Company-wide Access",
        description:
          "Establish comprehensive electronic access to Asset Health information across all company operations with integrated data sources.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-4-step-4-question-2",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-297",
        score: 1,
        title: "Establish Component Retention Process",
        description:
          "Create systematic processes for retaining failed components to achieve at least 50% retention rate for failure analysis purposes.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-298",
        score: 1,
        title: "Improve Retention Coverage",
        description:
          "Expand failed component retention to achieve 75% coverage of all failures for comprehensive failure analysis capabilities.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-299",
        score: 2,
        title: "Achieve Complete Retention",
        description:
          "Implement comprehensive failed component retention ensuring all failure components under Asset Health programs are retained for full failure analysis.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-300",
        score: 2,
        title: "Enhance Analysis Capability",
        description:
          "Develop comprehensive failure analysis capabilities with systematic root cause analysis for all retained components.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-4-step-4-question-3",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-301",
        score: 1,
        title: "Implement Systematic RCA Process",
        description:
          "Establish consistent Root Cause Analysis processes using systematic methodologies rather than ad-hoc approaches.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-302",
        score: 1,
        title: "Improve RCA Application",
        description:
          "Enhance application of RCA principles with more consistent reporting and documentation of analysis results.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-303",
        score: 2,
        title: "Enhance RCA Documentation",
        description:
          "Ensure most RCA reports are detailed, comprehensive, and readily accessible to relevant stakeholders and decision makers.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-304",
        score: 2,
        title: "Achieve Complete RCA Coverage",
        description:
          "Implement comprehensive RCA processes ensuring all analyses are detailed, documented, and readily accessible across the organization.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-4-step-5-question-1",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-305",
        score: 1,
        title: "Establish P&S Interface",
        description:
          "Create formal interface processes between Asset Health representatives and Planning & Scheduling personnel for improved coordination.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-306",
        score: 1,
        title: "Improve Communication Frequency",
        description:
          "Increase contact frequency between Asset Health representatives and planners/schedulers beyond ad-hoc interactions.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-307",
        score: 2,
        title: "Enhance Scheduling Meeting Participation",
        description:
          "Ensure Asset Health representatives attend scheduling meetings when significant failures or findings occur for immediate coordination.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-308",
        score: 2,
        title: "Achieve Consistent Meeting Attendance",
        description:
          "Establish Asset Health representative attendance at all weekly scheduling meetings for comprehensive integration with maintenance planning.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-4-step-5-question-2",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-309",
        score: 1,
        title: "Improve Failure Documentation",
        description:
          "Enhance failure recording in work orders to achieve proper documentation of at least 75% of critical failures with failure modes and relevant information.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-310",
        score: 1,
        title: "Standardize Documentation Process",
        description:
          "Create standardized processes for failure recording that ensure consistent capture of failure modes and analysis-relevant information.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-311",
        score: 2,
        title: "Achieve Complete Critical Coverage",
        description:
          "Ensure 100% of critical failures are properly documented with comprehensive failure modes and supporting information for reliability analysis.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-312",
        score: 2,
        title: "Expand to All Failures",
        description:
          "Implement comprehensive failure recording processes ensuring all failures are documented consistently for effective reliability analysis.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-4-step-5-question-3",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-313",
        score: 1,
        title: "Establish RE Access Process",
        description:
          "Create systematic processes for Asset Health technicians to access Reliability Engineers and RCA information when needed.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-314",
        score: 1,
        title: "Improve Information Sharing",
        description:
          "Enhance information sharing between Asset Health technicians and Reliability Engineers with regular updates on RCA activities.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-315",
        score: 2,
        title: "Ensure Consistent RE Access",
        description:
          "Establish consistent access for Asset Health technicians to Reliability Engineers and systematic updates on all RCA information.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-316",
        score: 2,
        title: "Achieve Full Integration",
        description:
          "Implement comprehensive integration ensuring Asset Health technicians have full access to and are always updated on all relevant RCA information.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-4-step-6-question-1",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-317",
        score: 1,
        title: "Establish Recommendation Follow-up",
        description:
          "Create systematic processes to ensure Asset Health recommendations are valued and acted upon rather than routinely ignored.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-318",
        score: 1,
        title: "Improve Priority Management",
        description:
          "Develop priority management systems to reduce conflicts that cause Asset Health recommendations to be delayed or canceled.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-319",
        score: 2,
        title: "Achieve Timely Action",
        description:
          "Implement processes to ensure most Asset Health recommendations are actioned within required timeframes considering equipment criticality.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-320",
        score: 2,
        title: "Ensure Complete Implementation",
        description:
          "Establish accountability and tracking systems to ensure all Asset Health recommendations are actioned within appropriate timeframes.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-4-step-6-question-2",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-321",
        score: 1,
        title: "Identify Asset Health Stakeholders",
        description:
          "Conduct comprehensive stakeholder identification and mapping for Asset Health programs and establish feedback mechanisms.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-322",
        score: 1,
        title: "Implement Feedback System",
        description:
          "Create systematic processes for seeking stakeholder feedback on Asset Health programs and services.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-323",
        score: 2,
        title: "Ensure Regular Feedback",
        description:
          "Establish systematic processes ensuring Above Rail and Non-rail stakeholder feedback is regularly collected and always acted upon.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-324",
        score: 2,
        title: "Achieve Company-wide Feedback",
        description:
          "Implement comprehensive stakeholder feedback systems across all company operations with systematic action on all feedback received.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-4-step-6-question-3",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-325",
        score: 1,
        title: "Improve Data Sheet Coverage",
        description:
          "Increase completion of Asset Health data sheets from less than 25% to at least 50% of monitored equipment.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-326",
        score: 1,
        title: "Prioritize Critical Equipment",
        description:
          "Ensure 100% of critical equipment has completed Asset Health data sheets as a priority foundation for condition monitoring.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-327",
        score: 2,
        title: "Achieve Comprehensive Coverage",
        description:
          "Expand data sheet completion to 75% of all monitored equipment with complete coverage of all critical equipment.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-328",
        score: 2,
        title: "Complete Asset Health Documentation",
        description:
          "Ensure accurate, detailed data sheets are available for all equipment under Asset Health surveys with comprehensive information.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-4-step-6-question-4",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-329",
        score: 1,
        title: "Develop Tracking Methodology",
        description:
          "Create systematic methodology for tracking Asset Health recommendation status from initiation through completion.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-330",
        score: 1,
        title: "Implement Tracking Deployment",
        description:
          "Deploy developed tracking methodology across Asset Health programs to monitor recommendation status and completion.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-331",
        score: 2,
        title: "Achieve Consistent Tracking",
        description:
          "Implement consistent methodology for tracking the current status of most Asset Health recommendations with regular updates.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-332",
        score: 2,
        title: "Complete Recommendation Tracking",
        description:
          "Establish comprehensive tracking system ensuring current status of all Asset Health recommendations is systematically monitored and reported.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-4-step-7-question-1",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-333",
        score: 1,
        title: "Deploy Self-Audit Tools",
        description:
          "Make Asset Health self-audit tools readily available and provide training on their use for identifying improvement opportunities.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-334",
        score: 1,
        title: "Implement Improvement Action Process",
        description:
          "Create systematic processes to ensure identified improvement opportunities from self-audits are documented and actioned.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-335",
        score: 2,
        title: "Establish Regular Audit Schedule",
        description:
          "Implement regular schedule for using Asset Health self-audit tools and ensure most identified improvement opportunities are actioned.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-336",
        score: 2,
        title: "Achieve Consistent Improvement",
        description:
          "Establish systematic use of self-audit tools with processes ensuring all identified improvement opportunities are consistently actioned.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-4-step-7-question-2",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-337",
        score: 1,
        title: "Implement Change Documentation",
        description:
          "Establish systematic documentation of changes to Asset Health programs using formal change management processes.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-338",
        score: 1,
        title: "Utilize Asset Health Procedures",
        description:
          "Ensure existing Asset Health procedures are actively utilized and followed for program changes and modifications.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-339",
        score: 2,
        title: "Document All Major Changes",
        description:
          "Implement comprehensive change management processes ensuring most major changes to Asset Health programs are properly documented.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-340",
        score: 2,
        title: "Achieve Complete Change Management",
        description:
          "Establish complete change management processes ensuring all Asset Health program changes are systematically documented and approved.",
      },
    ],
  },
  {
    question_id: "demo-questionnaire-1-section-4-step-7-question-3",
    options: [
      {
        id: "demo-questionnaire-1-interview-response-action-option-341",
        score: 1,
        title: "Develop Value Communication Process",
        description:
          "Create systematic processes for publicizing Asset Health value-add and successes beyond rare or ad-hoc communication.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-342",
        score: 1,
        title: "Implement Recognition System",
        description:
          "Establish recognition systems for Asset Health wins and saves to demonstrate program value and encourage continued success.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-343",
        score: 2,
        title: "Enhance Value Promotion",
        description:
          "Implement regular promotion and communication of Asset Health value-add through multiple channels and communication methods.",
      },
      {
        id: "demo-questionnaire-1-interview-response-action-option-344",
        score: 2,
        title: "Achieve Comprehensive Value Communication",
        description:
          "Establish comprehensive value communication ensuring Asset Health contributions are regularly publicized and promoted through accessible media.",
      },
    ],
  },
];
