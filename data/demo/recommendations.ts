import type { Recommendation } from "data/types";

export const recommendations: Recommendation[] = [
  {
    id: "rec-001",
    title: "Develop Comprehensive Training Program for Work Identification",
    content:
      "Create a structured training curriculum that covers work identification and notification creation. This should include site-specific materials and SAP training modules to ensure all personnel can properly identify and document maintenance work. The program should target operators, maintainers, and contractors with role-specific content.",
    context:
      "Current training coverage is below 50% and work identification accuracy is inconsistent across teams. This leads to missed maintenance opportunities and incorrect work coding in the system. Location: Company-wide initiative (coordinated through Health Safety & Environment > Corporate HSE > Perth Training Centre)",
    priority: "high",
    status: "not_started",
  },
  {
    id: "rec-002",
    title: "Transition from Calendar to Tactics-Based Preventive Maintenance",
    content:
      "Review and revise current PM work to move away from purely calendar-based scheduling toward maintenance tactics derived from formal analysis such as FMEA, RCM, or PMO processes. This will ensure maintenance activities are based on actual equipment condition and failure modes rather than arbitrary time intervals.",
    context:
      "Over 60% of scheduled maintenance is still calendar-based rather than condition or reliability-based, resulting in unnecessary maintenance and missed failure prevention opportunities. Location: Iron Ore Operations > Pilbara Region > Newman Mine > Heavy Equipment Fleet",
    priority: "high",
    status: "not_started",
  },
  {
    id: "rec-003",
    title: "Establish Daily Backlog Management Process",
    content:
      "Implement daily backlog review processes with clear accountability for planners and supervisors. Create standards for backlog management including elimination of duplicates, standing work orders, and outdated tasks. Integrate equipment criticality into prioritization decisions.",
    context:
      "Maintenance backlog is growing without systematic management, leading to delayed critical work and resource inefficiencies. No formal process exists for backlog review and prioritization. Location: Iron Ore Operations > Pilbara Region > Tom Price Mine > Open Pit Operations",
    priority: "medium",
    status: "in_progress",
  },
  {
    id: "rec-004",
    title: "Implement Structured Shift Handover Process",
    content:
      "Develop formal shift handover procedures with checklists, documentation requirements, and clear communication protocols. Include pre-shift briefing standards covering work packages, safety issues, and equipment status. Deploy visual management tools to support effective information transfer.",
    context:
      "Information loss between shifts is causing rework and safety concerns. Current handover process is informal and inconsistent across departments. Location: Coal Operations > Hunter Valley > Mount Arthur Mine > Dragline Operations",
    priority: "high",
    status: "not_started",
  },
  {
    id: "rec-005",
    title: "Create Centralized Defect Capture System",
    content:
      "Establish a centralized location and process for capturing defects identified through observations, interviews, and safety interactions. Develop formal processes for converting observations from floor tours and task analysis into actionable defect information that feeds into the maintenance planning system.",
    context:
      "Defects identified through various sources are not being systematically captured, resulting in repeated failures and missed improvement opportunities. Location: Iron Ore Operations > Pilbara Region > Port Hedland Terminal > Ship Loading Terminal",
    priority: "medium",
    status: "not_started",
  },
  {
    id: "rec-006",
    title: "Develop Risk-Based Asset Criticality Ranking",
    content:
      "Conduct comprehensive criticality analysis at the physical asset level for all equipment. Establish systematic criticality ranking based on consequence and likelihood across safety, health, environmental, cost, and operational categories following company guidelines.",
    context:
      "Asset criticality is only defined at system level, not individual asset level, making it difficult to prioritize maintenance activities and resource allocation effectively. Location: Company-wide initiative (starting with Iron Ore Operations > Pilbara Region > Newman Mine > Heavy Equipment Fleet)",
    priority: "high",
    status: "not_started",
  },
  {
    id: "rec-007",
    title: "Establish Root Cause Analysis Training Program",
    content:
      "Develop formal training programs for multiple RCA methods including 5-Whys, Cause-and-Effect, Apollo RCA, and TapRooT. Build internal capability with multiple trained facilitators to reduce dependence on external resources and improve problem-solving effectiveness.",
    context:
      "Limited RCA capability exists within the organization, leading to recurring failures and superficial problem solutions that don't address root causes. Location: Health Safety & Environment > Corporate HSE > Perth Training Centre",
    priority: "medium",
    status: "not_started",
  },
  {
    id: "rec-008",
    title: "Implement Asset Health Monitoring Routes",
    content:
      "Create Asset Health inspection routes for critical equipment and establish processes to ensure they are consistently followed. Develop route optimization based on equipment criticality and condition monitoring requirements.",
    context:
      "Asset health monitoring is ad-hoc with no defined routes, resulting in missed inspections and late detection of developing failures. Location: Coal Operations > Bowen Basin > Peak Downs Mine > Underground Operations",
    priority: "medium",
    status: "in_progress",
  },
  {
    id: "rec-009",
    title: "Enhance Planning Accuracy and Compliance",
    content:
      "Establish and communicate comprehensive maintenance planning standards including resource requirements, safety considerations, and quality specifications. Set planning accuracy targets aiming for at least 80% estimate accuracy through improved scoping practices.",
    context:
      "Planning accuracy is below 60% causing schedule disruptions and resource conflicts. No formal planning standards exist across the organization. Location: Iron Ore Operations > Pilbara Region > Tom Price Mine > Open Pit Operations",
    priority: "high",
    status: "not_started",
  },
  {
    id: "rec-010",
    title: "Deploy Automated Loss Monitoring System",
    content:
      "Implement automated systems to capture operational losses and equipment downtime, replacing manual entry methods. Ensure data accuracy and provide easy access for reliability analysis with 80% correlation between maintenance-related losses and work orders.",
    context:
      "Operational losses are captured manually or verbally, resulting in incomplete data for reliability analysis and improvement initiatives. Location: Iron Ore Operations > Pilbara Region > Port Hedland Terminal > Stockyard Operations",
    priority: "medium",
    status: "not_started",
  },
  {
    id: "rec-011",
    title: "Establish Formal Equipment Handover Procedures",
    content:
      "Implement documented equipment handover procedures covering isolation concerns, testing requirements, and acceptance criteria. Develop detailed acceptance criteria for equipment release with formal sign-off requiring both operations and maintenance approval.",
    context:
      "Equipment handover between operations and maintenance lacks formal procedures, causing delays, rework, and safety concerns. Location: Coal Operations > Hunter Valley > Bengalla Mine > Open Cut Operations",
    priority: "high",
    status: "not_started",
  },
  {
    id: "rec-012",
    title: "Create Integrated 24-Month Maintenance Plan",
    content:
      "Develop comprehensive integrated maintenance and operations plans extending 24 months into the future. Establish quarterly review cycles with operations to ensure alignment and adjust for changing priorities and operational requirements.",
    context:
      "Maintenance planning horizon is limited to weeks or months, preventing effective resource planning and coordination of major maintenance events. Location: Iron Ore Operations > Kimberley Region > Koolan Island Mine > Marine Operations",
    priority: "medium",
    status: "not_started",
  },
  {
    id: "rec-013",
    title: "Implement Defect Elimination Management Team",
    content:
      "Establish regular DE Management Team meetings with structured decision-making processes for methodology selection and project approval. Create formal criteria for selecting appropriate defect elimination methodologies based on impact, complexity, and resources.",
    context:
      "Defect elimination efforts are uncoordinated with no formal management structure, resulting in ineffective problem resolution and wasted resources. Location: Coal Operations > Bowen Basin > Goonyella Mine > Longwall Mining",
    priority: "medium",
    status: "in_progress",
  },
  {
    id: "rec-014",
    title: "Develop Standardized Task Lists for All Work Types",
    content:
      "Create standardized task lists for corrective and breakdown maintenance beyond existing PM task lists. Implement formal process for creating, updating, and managing task lists to ensure consistent application across all work types.",
    context:
      "Task lists only exist for PM work, leading to inconsistent execution of corrective and breakdown maintenance activities. Location: Iron Ore Operations > Pilbara Region > Tom Price Mine > Rail Loading Facility",
    priority: "low",
    status: "not_started",
  },
  {
    id: "rec-015",
    title: "Establish Asset Health Data Sheet Completion",
    content:
      "Prioritize completion of Asset Health data sheets for 100% of critical equipment as foundation for condition monitoring. Expand coverage to achieve 75% completion for all monitored equipment with comprehensive information.",
    context:
      "Less than 25% of equipment has completed Asset Health data sheets, limiting the effectiveness of condition-based maintenance strategies. Location: Coal Operations > Hunter Valley > Mount Arthur Mine > Coal Handling Plant",
    priority: "medium",
    status: "not_started",
  },
  {
    id: "rec-016",
    title: "Implement Supervisor Floor Presence Program",
    content:
      "Define clear expectations and targets for supervisory floor presence and field interaction time. Create systematic processes for supervisors to observe safety practices, assess work quality, and identify improvement opportunities during floor tours.",
    context:
      "Supervisor floor presence is limited, missing opportunities for safety observation, quality assessment, and real-time problem solving. Location: Company-wide initiative (priority implementation at Coal Operations > Bowen Basin > Peak Downs Mine > Underground Operations)",
    priority: "high",
    status: "not_started",
  },
  {
    id: "rec-017",
    title: "Create Work History Quality Standards",
    content:
      "Establish comprehensive standards for capturing detailed work history including failure modes, causes, parts used, and delays. Implement supervisor review processes for all work package completion before closure to ensure quality.",
    context:
      "Work history documentation is incomplete and inconsistent, limiting the ability to perform reliability analysis and identify improvement opportunities. Location: Iron Ore Operations > Kimberley Region > Koolan Island Mine > Crusher Plant",
    priority: "medium",
    status: "in_progress",
  },
  {
    id: "rec-018",
    title: "Develop Tactics Development Database System",
    content:
      "Move from Excel spreadsheets to a relational database system for improved tactics development data management. Create logical equipment hierarchies and establish database links with SAP/AMS systems for seamless data flow.",
    context:
      "Tactics development information is scattered across multiple Excel files with no integration to maintenance systems, causing version control issues and data inconsistencies. Location: Company-wide IT initiative (managed centrally with pilot at Iron Ore Operations > Pilbara Region > Newman Mine)",
    priority: "low",
    status: "not_started",
  },
  {
    id: "rec-019",
    title: "Establish Weekly Performance Review Meetings",
    content:
      "Create structured weekly review meetings with standard agendas focusing on schedule performance and maintenance metrics. Ensure cross-functional participation with systematic analysis of performance gaps and specific action plan development.",
    context:
      "Performance reviews are ad-hoc and focus mainly on urgent issues rather than systematic improvement, missing opportunities for proactive problem prevention. Location: Coal Operations > Hunter Valley > Bengalla Mine > Washery Plant",
    priority: "medium",
    status: "not_started",
  },
  {
    id: "rec-020",
    title: "Implement Asset Health Recommendation Tracking",
    content:
      "Develop systematic methodology for tracking Asset Health recommendation status from initiation through completion. Establish accountability and tracking systems to ensure all recommendations are actioned within appropriate timeframes based on equipment criticality.",
    context:
      "Asset Health recommendations are routinely ignored or delayed due to competing priorities, with no tracking of implementation status or effectiveness. Location: Coal Operations > Bowen Basin > Goonyella Mine > Gas Drainage Systems",
    priority: "high",
    status: "not_started",
  },
];
