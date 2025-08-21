// import type { Questionnaire } from "@/types/assessment";

// import { shared_role_name_to_id } from "../shared_roles";

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
        id: "demo-questionnaire-1-rating-scale-4",
        name: "Optimised",
        description:
          "Exceeds requirements with continuous improvement and leading practices",
        value: 4,
        order_index: 3,
      },
      {
        id: "demo-questionnaire-1-rating-scale-3",
        name: "Proactive",
        description:
          "Meets requirements with systematic and preventive approaches",
        value: 3,
        order_index: 2,
      },
      {
        id: "demo-questionnaire-1-rating-scale-2",
        name: "Planned",
        description:
          "Basic systems exist but inconsistent execution, gaps in compliance",
        value: 2,
        order_index: 1,
      },
      {
        id: "demo-questionnaire-1-rating-scale-1",
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
                  "shared-role-22",
                  "shared-role-20",
                  "shared-role-44",
                  "shared-role-8",
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
                  "shared-role-22",
                  "shared-role-20",
                  "shared-role-44",
                  "shared-role-8",
                  "shared-role-5",
                  
                  "shared-role-9",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-1-step-1-question-2-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "PM Work captured in SAP; is either mostly calendar- based, and/or based on OEM recommendations, rather than tactics reviews. <50% of scheduled work is system generated.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-1-question-2-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "PM work is identified for new or critical equipment using a formal tactic review process e.g., FMEA, RCM or PMO. >50% of scheduled work is Corrective PM",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-1-question-2-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "PM work is being identified/modified using formal tactic review process but is not entered into the SAP system in a timely manner. >65% of scheduled work is PM",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-1-question-2-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "PM work is being identified/modified using formal tactic review process and is being entered into the SAP system in a timely manner. >80% of scheduled work is PM",
                    value: 4,
                  },
                ],
              },
              {
                id: "demo-questionnaire-1-section-1-step-1-question-3",
                title: "Operator Inspection Checklists",
                question_text:
                  "1. Are there Operators' checklists for all equipment? (Note this refers to inspection checklists, not merely pre-op inspection forms).\n2. Is there alignment with the checklist details and the maintenance strategies? How are changes to inspection requirements and strategies transferred to the checklist?\n3. All are all defects entered as Notifications in the SAP in a timely manner?\n4. Do Notifications typically represent all aspects of the true condition of the equipment?",
                context:
                  "Inspection Checklist Design - Operators\nOperator inspection checklists are up-to-date and aligned with equipment maintenance strategy. (Daily, Weekly, Monthly). Defects found as a result are entered in the SAP in a timely manner considering:\n• Safety\n• Materials\n• Tasks including specification\n• Additional Resources\n• Feedback / comments field\n• Sign off.",
                order: 3,
                applicable_roles: [
                  "shared-role-8",
                  "shared-role-5",
                  
                  "shared-role-44",
                  "shared-role-9",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-1-step-1-question-3-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "Checklists are poorly designed and incomplete and do not exist for all critical equipment. Operations verbally notify AM personnel.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-1-question-3-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "Checklists are good quality and up to date but not using a standard design. Exist for all critical equipment. Operations Supv enter Notifications in SAP. Maintenance Supervisors approve Notifications for Work Order creation.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-1-question-3-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "Checklists based on a standard template and exist for the majority of equipment. All Notifications are entered in the SAP.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-1-question-3-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "Checklists periodically reviewed and exist for all equipment as identified through Asset Tactics Development.  All operations personnel enter Notifications in SAP, and reviewed for rejected or additional info, and resubmit as needed.",
                    value: 4,
                  },
                ],
              },
              {
                id: "demo-questionnaire-1-section-1-step-1-question-4",
                title: "Maintainer Inspection Checklists",
                question_text:
                  '1. When inspection checklists are performed by maintainers, are defects found entered in the SAP?\n2. Is there alignment with the checklist details and the maintenance strategies?\n3. How are changes to inspection requirements and strategies transferred to the checklist?\n4. Are defects found as a result of inspections scheduled using the standard Maintenance Planning Process, or executed as part of "scheduled" work?',
                context:
                  "Inspection Checklist Design - Maintainers\nInspection checklists are up-to-date and aligned with equipment maintenance strategy. (Daily, Weekly, Monthly) considering:\n• Safety\n• Materials\n• Tasks including specification\n• Additional Resources\n• Feedback / comments field\n• Sign off.",
                order: 4,
                applicable_roles: [
                  "shared-role-9",
                  "shared-role-8",
                  "shared-role-44",
                  
                  "shared-role-28",
                  "shared-role-20",
                  "shared-role-22",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-1-step-1-question-4-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "Checklists are poorly designed and incomplete and do not exist for all critical equipment. Supervisors enter Notifications from maintainers input, or maintainers execute the work without consulting scheduler or supervisor.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-1-question-4-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "Checklists are good quality and up to date but not using a standard design. They exist for all critical equipment.  Maintainers enter subsequent notifications and submit DE ideas.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-1-question-4-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "Checklists based on a standard template and exist for the majority of equipment.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-1-question-4-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "Checklists periodically reviewed and exist for all equipment as identified through Asset Tactics Development.",
                    value: 4,
                  },
                ],
              },
            ],
          },
          {
            id: "demo-questionnaire-1-section-1-step-2",
            title: "Plan Work",
            order: 2,
            questions: [
              {
                id: "demo-questionnaire-1-section-1-step-2-question-1",
                title: "Work Scoping Standards",
                question_text:
                  "1. Has the Company Maintenance Planning Process been communicated and made available to all?\n2. Is current planning performed as per the Company Maintenance Planning Process?  As applicable, do job scopes include clean-up, decon requirements, and rotables information?\n3. Parts availability is being verified before scheduling of tasks?\n4. Are Tasks rejected which don't comply with current equipment tactics, or rescoped to align with Budget, Tactics, operations and or Equipment stability requirements?",
                context:
                  "Scoping Work\nTo ensure that the planning function is performed in the same manner all the time, well document planning standards for work orders and work management must be in place and followed:\n• Workshop visits by planners during planning of major tasks\n• Task frequencies and durations captured\n• All resource, materials, shared equipment requirements captured\n• Safety requirements determined and captured\n• Validity of Task reviewed in relation to Tactics\n• Additional documentation (checklists) attached",
                order: 1,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-1-step-2-question-1-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "Company guidelines for scoping work known about but not complied with Some Operations in Work Orders but not much detail.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-2-question-1-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "Company guidelines for scoping work are established and followed. More detailed operations with >60% planning accuracy.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-2-question-1-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "Planning standards comply with 80% of Company guidelines for scoping work. Good detail in operations >80% estimate accuracy.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-2-question-1-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "Planning standards fully compliant with the Company Maintenance Planning Process. Very well detailed operations with >90% estimate accuracy.",
                    value: 4,
                  },
                ],
              },
              {
                id: "demo-questionnaire-1-section-1-step-2-question-2",
                title: "Long Term Planning Horizons",
                question_text:
                  "1. Long Term Planning (LTP) develops plans for Preventative and Capital work >26 weeks\n2. Depot Planning receives handover from LTP and is responsible within 26 weeks for Preventative, Corrective and all other work order types until handover to Depot Scheduler at 3 weeks\n3. LTP and Capital Planner is responsible within 26 weeks for Capital Work\n4. Handover from LTP to Depot Planner occurs at 26 weeks on a rolling monthly basis",
                context:
                  "Long Term Planning Horizons & Tasks\nCapital Planning tasks are managed by Long Term Planning (26 weeks to 3 weeks).  Clear differentation of maintenance tasks required to assign maintenance planner form Asset Managament & Startegy or Business Unit.",
                order: 2,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-1-step-2-question-2-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "Guidance for delineation of tasks between LTP and BU is defined but not followed.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-2-question-2-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "Guidance for delineation of tasks between LTP and BU is defined and followed >50%.  Communication channels between LTP and BU is established and LTP raises issues with BU when required.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-2-question-2-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "Guidance for delineation of tasks between LTP and BU is defined and followed >80%, including adhering to time horizons.  LTP is actively engaged with BU on a monthly basis.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-2-question-2-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "Guidance for delineation of tasks between LTP and BU is defined and followed >90%.  LTP is actively engaged with BU.",
                    value: 4,
                  },
                ],
              },
              {
                id: "demo-questionnaire-1-section-1-step-2-question-3",
                title: "Task Lists and Standard Jobs",
                question_text:
                  '1. How many task lists are available?  What % of work (PM, corrective & breakdown) is created from task lists or standard jobs?\n2. Are the task lists that are available used including ordering of required material for jobs?\n3. Is there are formal process to update and create new tasks lists?\n4. Are task list instructions detailed with specification or are they "Is motor hot?" or "Check Alignment"?',
                context:
                  "Task List / Standard Jobs\nTo reduce the amount of work, and support continuous improvement, standard jobs or task lists should be used during the planning process.\nA Job should only ever be planned once, saved as a task list or standard job, and then improved over time.",
                order: 3,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-1-step-2-question-3-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "Task Lists or Standard Jobs have only been developed for and are only used for PM's (Not Corrective or Breakdown).",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-2-question-3-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "Task Lists are developed and used for all PM's and >50% for Corrective Rotable Work Orders PM/Corrective/ZPM6.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-2-question-3-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "Task Lists are developed as required and used for all PM's and >75% for Corrective & Rotable Work Orders PM/Corrective/ZPM6.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-2-question-3-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "Task Lists are developed and used for all tasks. Note - except one off tasks that will not be done again.",
                    value: 4,
                  },
                ],
              },
              {
                id: "demo-questionnaire-1-section-1-step-2-question-4",
                title: "Backlog and Forward Log Management",
                question_text:
                  "1. Is the concept of backlog, forward log and future log understood?\n2. Does the forward log reflect the actual next available down-time condition of the equipment?\n3. How often is the backlog being managed and by whom?\n4. Is equipment criticality taken into consideration during the Planning process and workload reviews?",
                context:
                  "Backlog / Forward Log Work Management\nTo enable effective loading of scheduled maintenance tasks, the Workload must be consistently updated, accurate, and include:\n• No duplicate tasks and no standing work orders\n• Resource requirements including contractors and support equipment\n• Task durations\n• Intended start date, in the future\n• Priorities set.",
                order: 4,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-1-step-2-question-4-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "Planners and supervisors manage when time allows.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-2-question-4-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "Planners and supervisors are managing weekly.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-2-question-4-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "Planners and supervisors are managing daily. No evidence of duplicate and outdated work orders and/or notifications.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-2-question-4-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "Backlog reviewed weekly at the weekly Draft Schedule mtg. Outstanding notifications and work orders may require a group decisions to delete based on equipment criticality and safety implications.",
                    value: 4,
                  },
                ],
              },
            ],
          },
          {
            id: "demo-questionnaire-1-section-1-step-3",
            title: "Schedule Work",
            order: 3,
            questions: [
              {
                id: "demo-questionnaire-1-section-1-step-3-question-1",
                title: "Long-Term Scheduling Horizons",
                question_text:
                  "1. How far in the future is the rough-cut schedule developed and documented?\n2. Is the rough-cut schedule regularly reviewed with Operations? How far in the future?\n3. Does the rough-cut schedule take the operations schedule into account ?\n4. Are there any measures in place or reporting undertaken to ensure this process is followed?\nIs the long-term planning horizon long enough to allow for effective resource planning and an integrated maintenance and operations plan?",
                context:
                  "Long Term Scheduling Time Horizons \nLong term, rough-cut schedules must be developed to assist with budgeting and co-coordinating of major maintenance shutdowns and other significant events affecting operations planning and consider:\n• Rough-cut capacity scheduling is a key element of forward log maintenance planning\n• Maintenance and operations schedules are integrated",
                order: 1,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-1-step-3-question-1-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "Forward log rough-cut capacity planning to 6 months in the future is in place to determine resource needs.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-3-question-1-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "Forward log rough-cut capacity planning to 12 months in the future is in place to determine resource needs and is also reviewed with Operations.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-3-question-1-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "Forward log rough-cut capacity planning to 24 months in the future is in place to determine resource needs and is also reviewed with Operations and aligned with the 12 month Operations plan.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-3-question-1-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "Forward log rough-cut capacity planning to 5 years in the future is in place to determine resource needs and is also reviewed with operations. There is an integrated Maintenance and Operations plan for 24 months into the future which is regularly reviewed.",
                    value: 4,
                  },
                ],
              },
              {
                id: "demo-questionnaire-1-section-1-step-3-question-2",
                title: "Resource Capacity Management",
                question_text:
                  "1. How are non-maintenance activities (training) managed?  Are there any standing work orders used for scheduling?\n2. Is there a formal process for forecasting and reviewing the need for additional resources?\n3. Are the work centre capacities (available man-hours) managed weekly for internal resources and alliance contractors?\n4. Is system functionality for resource tracking used to its fullest extent?",
                context:
                  "Available Resources\nEffective scheduling of work requires control of resources including contractors utilising the following:\n• Leave guidelines\n• Training guidelines and/or competencies\n• Use of available system functionality (preferable),\n• Use of manual resource tracking tool\n• Alliance contractor work centres are set-up and managed",
                order: 2,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-1-step-3-question-2-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "Scheduling for depot/P&E maintainers and limited alliance contractor scheduling.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-3-question-2-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "Scheduling for depot/P&E maintainers and improved contractor scheduling; Tasks are scheduled to the day and the work centre.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-3-question-2-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "Scheduling for all depot/P&E maintainers, contractors, and shared equipment; Tasks are scheduled to the day, the work centre and the individual, using network functionality as required. Scheduling to the hour, not just to the day.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-3-question-2-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "Scheduling for all depot/P&E maintainers, contractors, and shared equipment; Tasks are scheduled to the day, the work centre and the individual, using network functionality as required.",
                    value: 4,
                  },
                ],
              },
              {
                id: "demo-questionnaire-1-section-1-step-3-question-3",
                title: "Resource Loading and Utilization",
                question_text:
                  "1. Are the guidelines determined and documented?  Have these been communicated and aligned with current metrics?\n2.  Does the amount of people available drive what work is scheduled, rather than what work is required drives determines how many resources are scheduled?\n3. Is work order resource planning adequate to enable scheduling of available resources?\n4. What percent of available resources are scheduled on a weekly basis?\n5. Is reporting on Resource Utilization and Use of Resource Availability reviewed regularly?",
                context:
                  "Schedule Resource Loading\nSome guidelines for effective utilization of all resources must be communicated and followed and include:\n• No standing work orders used\n• Loading per person per week in hours\n• Non-maintenance activities are deducted from available hours\n• Work centre resource management\n• Review of KPI's to determine proper schedule loading",
                order: 3,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-1-step-3-question-3-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "Guidelines and targets have been set but not used; Limited resource tracking using SAP or manual resource tracking tool e.g., Excel, Access etc. Only internal resources tracked.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-3-question-3-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "Scheduled hours are consistently below targets as established in the guidelines; Resource tracking using SAP but not always current due to changes (training, adhoc leave etc. not always being updated.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-3-question-3-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "Scheduled hours are consistently scheduled within + or 5% of objective; Resource tracking using SAP, which is used by scheduler and generally accurate. External resources also tracked in the SAP. >80% Schedule Loading for all resources.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-3-question-3-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "Scheduled hours are consistently scheduled within 0 or - 5% of target. There is a controlled process for increasing the scheduled resource loading percentage; Precision resource tracking using system functionality, which is used by scheduler.",
                    value: 4,
                  },
                ],
              },
              {
                id: "demo-questionnaire-1-section-1-step-3-question-4",
                title: "Scheduling Review Meetings",
                question_text:
                  "1. Are there a regular scheduling meetings?\n2. Do the right people attend?\n3. Is the scheduling meeting agenda followed, is there a meeting chair and are minutes taken for distribution?\n4. Are improvement actions being assigned weekly? Is there an Actions Log?",
                context:
                  "Scheduling Review/Lock in Meetings\nThere should be formal 'schedule' meetings.\n• Operations and maintenance sit down to discuss the proposed schedule. This is done in tandem with the operations schedule. Any active discussions regarding schedule inclusions should happen at this meeting.\n• The teams get back together to formally lock down the schedule. This discussion should be a formality and should rarely involve disagreements on the schedule inclusions. The timing of the second meeting is usually dictated by the lock-down date in the SAP.",
                order: 4,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-1-step-3-question-4-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "There are formal schedule meeting agendas. They are not always followed and there are no minutes or actions logs kept. Operations are not invited. Not all required maintenance people always attend the meetings.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-3-question-4-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "Agendas are followed. Minutes and action logs are kept. Maintenance invitees always attend or send a delegate. Operations are invited but do not always attend.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-3-question-4-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "Minutes and action logs are always updated and shared with all meeting attendees. All of the right roles from Operations and maintenance usually attend the meetings. Key KPI's, non- conformances and incomplete operations discussed.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-3-question-4-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "All of the right roles from Operations and maintenance always attend the meetings. Managers randomly attend to demonstrate support and the importance of the meetings.",
                    value: 4,
                  },
                ],
              },
            ],
          },
          {
            id: "demo-questionnaire-1-section-1-step-4",
            title: "Execute Work",
            order: 4,
            questions: [
              {
                id: "demo-questionnaire-1-section-1-step-4-question-1",
                title: "Shift Handover and Communication",
                question_text:
                  "1. Are critical jobs and/or tasks handled differently?\n2. Are additional faults/defects identified during the course of work not completed due to lack of communications between shifts?\n3. Are delay causes identified and relayed to oncoming crews?\n4. How well prepared are the oncoming crew members when they leave their shift start briefing?\n5. Are improvement actions captured during the shift start meetings?",
                context:
                  "Daily Shift Start / Shift Handover\nTo create awareness for oncoming crews an effective handover / turnover process must be in place and address the following:\n• Participated by all relevant personnel\n• Current progress on planned work\n• Possible operations requirements during shift\n• Causes for delays, if any\n• Changes in environment / risks\n• Additional faults / defects found\n• Work packages handed out and reviewed as required",
                order: 1,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-1-step-4-question-1-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "The crews gather for pre-shift briefings but all information is given verbally.\nSupervisors exchange handover information verbally.\nNo equipment or MBP KPI's are discussed.\nMajor SHE issues or events mentioned.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-4-question-1-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "Supervisors use checklists and/or shift logs & discuss scheduled, urgent  and backlog WO's.\nMaintainers are provided with Work Packs at shift start, these are not discussed in any detail.\nKPI's are discussed only when instructed by senior leader.\nRelevant SHE issues discussed.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-4-question-1-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "Supervisors use the SAP to review all unscheduled and scheduled Work.\nAny non-routine work is discussed in detail. Standard KPI's are reviewed.\noperations issues discussed. Visual boards used and always up to date.\nSupervisors run the pre-shift briefing. Maintainers share the task of running the pre-shift briefing.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-4-question-1-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "Innovative ways have been introduced to ensure all work is understood at the start of shift and handed over to the oncoming shift. Additional KPI's are reviewed when relevant to the team.\nMaintainers share the task of running the pre-shift briefing.",
                    value: 4,
                  },
                ],
              },
              {
                id: "demo-questionnaire-1-section-1-step-4-question-2",
                title: "Equipment Handover and Release",
                question_text:
                  "1. Does the operator have the ability to refuse acceptance of  equipment?\n2. Does Operations often insist on equipment release prior to completion of maintenance activities?\n3. How often does equipment fail shortly after a maintenance intervention?\n4. Is there timely operator acceptance of equipment?",
                context:
                  "Equipment Handover & Release\nFormal procedure for interaction between maintainer and operator at equipment exchange (shut down and release) and incorporate the following:\n• Actions required or taken\n• Permits & isolation concerns\n• Status / condition of equipment\n• Equipment / functional testing after maintenance\n• Timely acceptance by operator(s) upon release\n• All tests, clean-up, demob, parts & repairables returned.",
                order: 2,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-1-step-4-question-2-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "Formal handover process  in place but not followed.\nEquipment often not ready for maintainers.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-4-question-2-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "Formal handover process in use for receiving and delivery of equipment and is mostly followed. \nCould use more detailed acceptance criteria.\nEquipment mostly ready for maintainers.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-4-question-2-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "Formal handover process is always followed.\nIncludes sufficiently detailed procedures for acceptance and/or non-acceptance.\nEquipment always ready for maintainers.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-4-question-2-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "Formal sign-off is provided by both operations and maintenance.",
                    value: 4,
                  },
                ],
              },
              {
                id: "demo-questionnaire-1-section-1-step-4-question-3",
                title: "Schedule Adherence and Break-in Work",
                question_text:
                  "1. How often does the scheduled work get stopped to perform non-routine work?\n2. How are decisions being made as to what scheduled work gets stopped and by whom?\n3. Is break-in work being monitored and reviewed to ensure that it is truly urgent work?",
                context:
                  "Urgent or Unscheduled Work\nPriority should be given to performing scheduled work and schedule interruptions must be managed and based on interactions between maintenance and operations.",
                order: 3,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-1-step-4-question-3-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "There is no formal process in place but there is a balance between urgent and scheduled work. PM or Breakdown work is not specifically prioritized.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-4-question-3-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "Urgent work rarely delays scheduled work. Formal process in place and usually followed. Decisions are made by Operations Supervisors or Maintainers. Breakdown schedule compliance is > 75% Overall schedule compliance is <85%.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-4-question-3-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "The Maintenance Supervisor decides when the schedule can be interrupted. Formal process is followed with steps to escalate the level of authority or expertise involved in decision making regarding schedule interruption as req. Breakdown schedule compliance >95% Overall schedule compliance >85%.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-4-question-3-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "Breakdown schedule compliance is always 100% Overall schedule compliance >95%.",
                    value: 4,
                  },
                ],
              },
              {
                id: "demo-questionnaire-1-section-1-step-4-question-4",
                title: "Supervisory Floor Presence",
                question_text:
                  "1. How often does the supervisor visit tasks during execution?\n2. What questions are asked during these visits?\n3. Does the supervisor seek out problems and contribute to the solutions?\n4. Does supervisor communicate his findings with crews to avoid repetition of failures?",
                context:
                  "Floor tours\nTo monitor work execution activities and provide feedback on progress and quality of work\n• SHE is observed, questioned and corrected\n• Work quality interaction\n• Delays recorded\n• Actions & contingencies listed\n• Improvement opportunities identified.",
                order: 4,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-1-step-4-question-4-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "Expectations are not set, supervisors not visbile in field",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-4-question-4-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "Supervisor spends visible time in field.  SHE issues are addressed",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-4-question-4-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description: "Supervisor spends visible time in field.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-4-question-4-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "Supervisor hits time in field targets.  Engagement with maintainers and clear communication of failures/problems form crew are raised and resolved.\nAutonomy exsists within the crew.",
                    value: 4,
                  },
                ],
              },
            ],
          },
          {
            id: "demo-questionnaire-1-section-1-step-5",
            title: "Work Order Completion Training",
            order: 5,
            questions: [
              {
                id: "demo-questionnaire-1-section-1-step-5-question-1",
                title: "Question 33",
                question_text:
                  "1. Have maintainers received Work Order Completion training?\n2. Do maintainers understand the importance of capturing work order history?\n3. Have alliance contractors  received Work Order Completion Awareness training?\n4. How are new employees being trained in Work Order Completion?",
                context:
                  "Work Order Completion & Confirmation Training\n• Company training should be formally provided to new employees and any necessary contractors, and if necessary refreshed annually \n• Online training material is readily available and linked to the relevant sections of the WMP.",
                order: 1,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-1-step-5-question-1-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "Training is available, but not part of an integrated AM training program.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-5-question-1-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "Training is part of an integrated AM training program with refresher and new hire training reasonably well documented and current for >75% of the teams using the SAP.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-5-question-1-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "Refresher and new hire training is current and documented for >90% of team the teams using the SAP.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-5-question-1-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "Further On the Job Training is used with focus on quality and accurate information.",
                    value: 4,
                  },
                ],
              },
              {
                id: "demo-questionnaire-1-section-1-step-5-question-2",
                title: "Work History Documentation",
                question_text:
                  "1. What quality of information is being captured onto work history, and feedback / coaching provided to maintainers?\n2. Does the information get captured into the SAP? How?\n3. Do RE's use available data for analysis?\n4. What percentage of maintenance work orders have history included when Techo'd?",
                context:
                  "Record Maintenance History\nFor continuous analysis of failures, the feedback from maintainers into SAP is critical and must include:\n• Detailed information on work execution\n• Failure modes, causes, parts used and delays recorded    \n• Actual time worked (tool-time)",
                order: 2,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-1-step-5-question-2-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "Failure codes information is captured (Damage, Delay, Cause etc.).\nRarely are task improvements fed back - not always actioned.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-5-question-2-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "History (long text) high quality, failure mode & root cause descriptions easily understood,\nSome task improvement feedback - always actioned.\nWork Pack completion is reviewed by Supv prior to TECO’ing WOs for quality. \nMeasuring points always updated.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-5-question-2-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "Work Performed (long text) history is detailed with all required measurements included prompting regular Asset Tactics improvement. \nRegular task improvement feedback via Notifications & actioned within 28 days.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-5-question-2-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "A process is in place to ensure work history requirements will facilitate reliability-based historical analysis..\nNotifications actioned within 7 days.",
                    value: 4,
                  },
                ],
              },
              {
                id: "demo-questionnaire-1-section-1-step-5-question-3",
                title: "Time Confirmation and Accuracy",
                question_text:
                  "1. What is the variance between Planned vs. Actual being reported?\n2. Are maintainers aware of the importance of capturing accurate times to work orders?\n3. Does a time and attendance process drive a behaviour of capturing incorrect actual times to work orders?\n4. Is there a process for optimising task lists or standard jobs based on actual times historical information?",
                context:
                  "Time Confirmation\nThe accurate capturing of time actually worked is critical. This will allow for:\n• The optimisation of planned labour hours on future tasks\n• The correct labour cost allocation to work performed\n• Must include delay times e.g.: waiting for parts etc.\n• Timecard confirmation review process in place.",
                order: 3,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-1-step-5-question-3-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "Maintainers know how to Time Confirm. Maintainer Labour hours are accurately captured on >50% of the work order / operation / tasks. Supervisors completing all Time Confirmation.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-5-question-3-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "Maintainer Labour hours accurately captured on all work order / operation / tasks in the SAP. Confirming time on multiple work orders within 3 days of work completion. Maintainers completing all Time Confirmation to the correct operation.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-5-question-3-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "Maintainer and Contractor Labour hours are captured on all work order / operation / tasks in the SAP. Confirming tool-time within 1 day of work completion. Supervisor reviewing a sample of time confirmations to confirm Plan vs Actual hrs.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-5-question-3-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "Performance against planned hours is monitored and managed. Confirming tool-time same day of completion. Alliance contractors completing Time Confirmation with Supervisor checking.",
                    value: 4,
                  },
                ],
              },
              {
                id: "demo-questionnaire-1-section-1-step-5-question-4",
                title: "Work Order Closure Timeliness",
                question_text:
                  "1. How much variance in performance data based on delayed closing of work orders?\n2. Are maintainers aware of the consequence of delayed closing on performance metrics?\n3. Do supervisors use the metrics to drive behaviour change in closing or work orders?\n4. SAP-sites question: How many jobs are TECO'ed with zero (0) hours?",
                context:
                  "Closing Work Orders\nThe Closing / confirming process is a critical step in WMP performance metrics and must be done in a timely manner.",
                order: 4,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-1-step-5-question-4-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "Process in place for confirming or closing of WO's but not always followed. Some Work Package completion is quality reviewed by Supervisors prior to TECO’ing WO. Subsequent Notifications not always raised.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-5-question-4-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "The process is followed and confirmation / closing is carried out within the committed week. Most Work Package completion is quality reviewed by Supervisors prior to TECO’ing WO.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-5-question-4-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "Majority of work orders are TECO’ed within 24hrs of work completion. All Work Package completion is quality reviewed by Supervisors prior to TECO’ing WO. Subsequent Notifications always raised, and raised correctly.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-5-question-4-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "All of work orders are TECO’ed the same shift as work completion. Work Package completion KPI's published and discussed with teams.",
                    value: 4,
                  },
                ],
              },
            ],
          },
          {
            id: "demo-questionnaire-1-section-1-step-6",
            title: "Analyse Work",
            order: 6,
            questions: [
              {
                id: "demo-questionnaire-1-section-1-step-6-question-1",
                title: "Weekly Performance Review Meetings",
                question_text:
                  "1. Is the schedule (spreadsheet, Gantt chart, etc.) referred to during the review?\n2. Is Maintenance & operations related delays/losses discussed?\n3. Is action item list up to date with names & dates?\n4. Are actions completed in a timely manner?",
                context:
                  "Meetings - Weekly Review\nWeekly plans, schedules and metrics reviewed to identify potential improvement opportunities.\n• Participation from both maintenance, operations and service departments such as Warehouse\n• Agenda followed and minuted\n• Identify what went well\n• Identify what did not go well - potential improvements\n• Identify what can be done to prevent recurrence of non-conformance.",
                order: 1,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-1-step-6-question-1-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "Ad-hoc informal meeting takes place but focusses on Urgent work.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-6-question-1-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "Plans and schedules are subject to a post execution review at the Weekly Review Meeting. Focus is on Standard Metrics.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-6-question-1-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "Failure to meet targets is analysed, specific causes identified and action plans implemented with owners allocated for each action. >80% of actions closed out each week.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-6-question-1-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "All potential WMP system improvements are raised formally with the Asset Management team for action.",
                    value: 4,
                  },
                ],
              },
              {
                id: "demo-questionnaire-1-section-1-step-6-question-2",
                title: "Daily 24-Hour Work Review Process",
                question_text:
                  "1. Work order completion is reviewed? Do maintainers attend these sessions?\n2. At the 24 hr review, is the following done: Any PM not scheduled needs to be questioned. Any Corrective needs to be questioned. Did it need to be done straight away or could it have been scheduled?\nIs the failure mode captured in the equipment PM?\nIf Yes, Do we need to complete an RCA, PMO on the strategy applied? Is there an action plan?\n3. Is action item list up to date with names & dates?\n4. Are actions completed in a timely manner?",
                context:
                  "Meetings - 24-hour daily review\nDaily Review to identify potential improvement opportunities\n• Agenda followed and minuted\n• Identify what went well\n• Identify what did not go well\n• Identify what can be done to prevent recurrence of non-conformances\n• Discuss any  Notifications raised or whether or not a Noti is required for something",
                order: 2,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-1-step-6-question-2-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "A review takes place and only focuses on breakdowns. There is no agenda. The need for improvements to Tactics and Work Packs not discussed.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-6-question-2-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "Work order completion is reviewed in morning meetings, with an agenda and action plan produced. The review is done at the daily KPI board and focusses on schedule non- conformances. People trust the KPI's are an accurate reflection.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-6-question-2-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "The team discuss the need for Tactics reviews or RCA's as a result of the previous 24hrs equipment, operations and work management performance.  Notifications are raised properly if required.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-6-question-2-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "Management provides support to ensure action plan is effective. This support structure is clearly defined and understood by all.",
                    value: 4,
                  },
                ],
              },
              {
                id: "demo-questionnaire-1-section-1-step-6-question-3",
                title: "KPI Visibility and Understanding",
                question_text:
                  "1. Are metrics posted and up to date?\n2. Are metrics understood by all?\n- Are appropriate metrics in place to measure effectiveness of the work management process?\n- Are the metrics accessible to all relevant personnel and stakeholders?\n- Are metrics posted and up to date?\n- Do the metrics include quality and cost performance?\n3. Are new metrics being rolled out on a regular basis?",
                context:
                  "KPI data\nAppropriate metrics must be in place to measure effectiveness of process:\n• Metrics developed \n• Posted in appropriate work areas\n• Utilised to drive behaviour change\n• Review of overdue statutory requirements",
                order: 3,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-1-step-6-question-3-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "KPIs are clearly understood and communicated. Maintenance team have a weekly KPI discussion.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-6-question-3-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "Management decisions are made based on KPI performance. The KPI system is easily accessible by maintainers and influences daily work execution.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-6-question-3-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "Reliability team analyse KPIs and feed this into DE activities, tactics development activities. Asset Management Metrics and area KPI's are reviewed with all personnel.",
                    value: 4,
                  },
                ],
              },
              {
                id: "demo-questionnaire-1-section-1-step-6-question-4",
                title: "Reliability Integration and Feedback",
                question_text:
                  "1. How is repetitive failures reported to the Reliability Group?\n2. Does the Reliability group have access to the KPI's and WM system?\n3. Where are all the reported findings /  recommendation captured - are the teams using Notifications?\n4. How does the information get reported back to the maintenance teams?",
                context:
                  "Work Management Feedback to / Inclusion of Reliability Group\nInteraction between the WMP and the Reliability Processes (Defect Elimination & Asset Strategy & Tactics) is crucial and must include:\n• Loss Analysis data\n• Repetitive failures occurrences (chronic/systemic)\n• Changes in Tactics\n• Changes in operating conditions\n• Improvements or recommendations\n• Cost over-runs",
                order: 4,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  "shared-role-13",
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-1-step-6-question-4-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "Process consists of informal discussions with very little feedback to the maintenance team.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-6-question-4-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "Process consists of informal discussions which are not always recorded. Some feedback on critical equipment and incidents takes place.  Notifications sometimes raised.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-6-question-4-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "Process consists of formal discussions which are recorded via meeting minutes.Notifications raised as required and resultant ATD (Asset Tactics Development) and reviews are conducted on Critical systems or equipment.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-1-step-6-question-4-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "Reported findings become part of the DE process and the drumbeat ATD process on all systems and equipment.",
                    value: 4,
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "demo-questionnaire-1-section-2",
        title: "Defect Elimination",
        order: 2,
        steps: [
          {
            id: "demo-questionnaire-1-section-2-step-1",
            title: "Identify Losses",
            order: 1,
            questions: [
              {
                id: "demo-questionnaire-1-section-2-step-1-question-1",
                title: "Operational Loss Monitoring Systems",
                question_text:
                  "1. Is there an automated system to capture Operation loss,\n2. Is the system covering all areas of Operation,\n3. Are failure modes and causes captured?",
                context:
                  "Operation Loss Monitoring\nA process exists to capture Operation losses and equipment downtime / delays",
                order: 1,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-2-step-1-question-1-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "Process to capture Operation losses is not clear. Operation losses and delays are captured inconsistently are reported word of mouth or on timecards or shift logs for entry into a database.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-1-question-1-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "Operation losses and delays are captured using an automated system, but data is not always accurate or easily accessible for data analysis.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-1-question-1-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "Operation losses and delays are captured using an automated system and the data is always accurate and easily accessible for data analysis. Close to 80% of maintenance related Operation losses have an associated workorder in the\nSAP (or AMS)",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-1-question-1-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "Operation losses and delays are captured using an automated system and the data is always accurate and easily accessible for data analysis. Close to 95% of maintenance related Operation losses have an associated workorder in the\nSAP (or AMS).",
                    value: 4,
                  },
                ],
              },
              {
                id: "demo-questionnaire-1-section-2-step-1-question-2",
                title: "Data Sources for Defect Identification",
                question_text:
                  "1. Are all Operation areas accounted for?\n2. Are all sources utilised?\n3. What data sources are used?\n4. What are the DE data sources in use at site?",
                context:
                  "Data Sources for Defect Identification\nDefects are identified through the analysis of various sources of data. \nPotential data sources include:\n• Operation Performance data\n• Maintenance History / Work Order data\n• Logbook data\n• Visual Work Place.",
                order: 2,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-2-step-1-question-2-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "No clear process for identifying defects. Defects are identified ad hoc mostly from gut feel.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-1-question-2-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "Defects identified through data analysis of one key source.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-1-question-2-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "Defects identified through data analysis of several key sources.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-1-question-2-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "Defects identified through data analysis of all key sources for all Operation processes.",
                    value: 4,
                  },
                ],
              },
              {
                id: "demo-questionnaire-1-section-2-step-1-question-3",
                title: "Defect Identification Through Observations",
                question_text:
                  "1. Are observations made by technicians, maintainers and operators used to identify defects during execution of work?",
                context:
                  "Observations Leading to Defect Identification\nA process is in place to capture defects through observations and escalate into DE process (as appropriate)\nSources of observation data:\n• Direct observation\n• Interviews\n• Safety interactions\n• Floor Tours / Task Analysis.",
                order: 3,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-2-step-1-question-3-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "No clear process in place to capture defects through observations. Defects from observations are identified through various sources but  not captured in a central location.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-1-question-3-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "Most defects from observations are captured in a central location.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-1-question-3-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "All defects from observations are captured in a central location.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-1-question-3-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "Defects through observations are captured on a defect register",
                    value: 4,
                  },
                ],
              },
              {
                id: "demo-questionnaire-1-section-2-step-1-question-4",
                title: "Incident Investigation for Defect Identification",
                question_text:
                  "1. Are defects identified using incident reports?\n2. What RCA tools are used in incident investigation?\n3. How are defects captured from your SHE system transferred to the defect register?",
                context:
                  "Incident Investigations\nA process exists to capture defects identified by incident investigations.",
                order: 4,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-2-step-1-question-4-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "There is no clear progress or an informal process to capture defects through incidents.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-1-question-4-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "Defects for incidents are captured in a central location for review.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-1-question-4-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "Defects from incidents are captured in the central defect register. Cross- functional teams are used to identify the root cause(s) and required corrective actions for all major incidents.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-1-question-4-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "Defects from incidents are captured in the central defect register. Cross- functional teams are used to identify the root cause(s) and required corrective actions for all major incidents.\nSound reliability engineering judgement is applied in all cases, ensuring that the corrective actions are based on data\nand facts.",
                    value: 4,
                  },
                ],
              },
            ],
          },
          {
            id: "demo-questionnaire-1-section-2-step-2",
            title: "Assess & Prioritise Defects",
            order: 2,
            questions: [
              {
                id: "demo-questionnaire-1-section-2-step-2-question-1",
                title: "Defect Assessment and Prioritization",
                question_text:
                  "1. Does the Defect Register identify the value of each potential defect in monetary terms?\n2. What models/processes are applied to assessing/prioritising defects?\n3. Do you have triggers that require the site to automatically commence an RCA?\n4. Is Safety, Health, and Environment (SHE) considered?\n5. Is reputation considered?",
                context:
                  "Assess and Prioritise Defects\nDefects are assessed and prioritised by quantifying the risk and value of eliminating the defect.\nEstimates must be made for the following factors:\n• Value of eliminating the defect\n• Risk the defect poses to the business\n• Difficulty in eliminating the defect\n• Cost to eliminate defect.",
                order: 1,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-2-step-2-question-1-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description: "lassifying",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-2-question-1-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "Defect are assessed based on some of the factors listed but not all.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-2-question-1-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "Defects are prioritized using a approved Company risk/value matrix.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-2-question-1-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "Proactive Defect Elemination - Protential Defects are prioritized using a approved Company risk/value matrix.",
                    value: 4,
                  },
                ],
              },
              {
                id: "demo-questionnaire-1-section-2-step-2-question-2",
                title: "Defect Register Scope and Integration",
                question_text:
                  "Does the Defect Register include other business improvement initiatives?",
                context:
                  "Defect Register\nA Defect Register is used to capture all potential defect projects. This facilitates the prioritisation of defects and the effective allocation of resources.",
                order: 2,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-2-step-2-question-2-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "The defect register does not exist or is an informal and uncontrolled document.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-2-question-2-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "A formal defect register is setup but does not include all potential projects.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-2-question-2-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "The central defect register is established and aligned with the current Reliability Improvement system.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-2-question-2-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "The central defect register is established and is fully  integrated with the current Business  Improvement system.",
                    value: 4,
                  },
                ],
              },
              {
                id: "demo-questionnaire-1-section-2-step-2-question-3",
                title: "Analysis Process Selection and Triggers",
                question_text:
                  "1. Are  triggers defined/documented for various levels of loss analysis, depending on the severity/impact of the loss?\n2. Is a formalised process implemented for front- line personnel to conduct basic RCA's (e.g. 5- why, etc.)?\n3. Is a formalised process implemented for Reliability engineers or maintenance/ops specialists to conduct more complex RCAs for significant/complex losses?\n4. Are complex RCA's are managed as projects?\n5. Is a formalised process implemented for Reliability engineers or maintenance/ops specialists to conduct an annual/bi-annual review of significant business losses or accumulating losses not picked up at individual loss event?",
                context:
                  'Selection of Process\nA decision is made as to whether a team-based approach is necessary or if the defect can be assigned to an individual to "just do it". \nThere are agreed triggers to initiate the defect elimination process',
                order: 3,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  "shared-role-13",
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-2-step-2-question-3-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "Ad-hoc with no specific process for methodology selection.\nNo or Informal criteria used at DE Management Team meetings.\nDepends on who is at the meeting.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-2-question-3-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "Formal criteria exists but not always followed by the DE Management Team.\nDoes not align with existing business processes.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-2-question-3-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "Formal criteria always followed by the DE Management Team.\nAligns with existing business processes.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-2-question-3-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "Formal criteria always followed by the DE Management Team. Intetgrated with existing business processes.",
                    value: 4,
                  },
                ],
              },
              {
                id: "demo-questionnaire-1-section-2-step-2-question-4",
                title: "DE Team Selection and Resourcing",
                question_text:
                  "Is there attendance at Defect Elimination team meetings?",
                context:
                  "DE Team Selection.\nTeams are selected to work on Defect Elimination projects. The DE Management team must ensure the team is sufficiently resourced.",
                order: 4,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-2-step-2-question-4-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "No specific process for selection of teams or DE teams are selected outside of the DE Management Team usually within a department.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-2-question-4-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "DE teams are approved by the DE Management Team.  Teams are not always sufficiently resourced.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-2-question-4-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "DE teams are sufficiently resourced but not always cross-functional.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-2-question-4-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "DE Teams are cross functional and involve all required skill sets.",
                    value: 4,
                  },
                ],
              },
            ],
          },
          {
            id: "demo-questionnaire-1-section-2-step-3",
            title: "Determining Root Cause",
            order: 3,
            questions: [
              {
                id: "demo-questionnaire-1-section-2-step-3-question-1",
                title: "RCA Method Training and Capability",
                question_text:
                  "Are there personnel trained in each of the different tools available?",
                context:
                  "Root Cause Analysis (RCA)  Methods\nMultiple Root Cause Analysis (RCA) methods are made available to the DE Team and are personnel trained in their use.",
                order: 1,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-2-step-3-question-1-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "No RCA methods used.\nThe business has a few people capable of using ad hoc problem-solving tools.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-3-question-1-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "The business has a few people trained in facilitating RCA methods (5-Whys, Cause-and-Effect/ Structure Tree, Apollo RCA, TapRooT, KT).",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-3-question-1-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "The business has a formal set of RCA methods and has cross functional personnel identified and trained in their use.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-3-question-1-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "A process is in place where the business can select from many areas to choose the best tool and facilitator to address the defect.",
                    value: 4,
                  },
                ],
              },
              {
                id: "demo-questionnaire-1-section-2-step-3-question-2",
                title: "RCA Method Selection Criteria",
                question_text:
                  "1. Is there criteria for what tool or technique will be used?\n2. Is the criteria based on actual or potential impact to the business?",
                context:
                  "Selection of RCA method\nThere are many methods and processes available to assist in the identification of the root causes of a defect.\nThe specific method chosen will depend on a number of factors:\n• Problem complexity\n• Risk defect poses\n• Problem Dimensions\n• If a team is being used.",
                order: 2,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-2-step-3-question-2-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "Limited RCA methods are used. Selection of a tool to determine root cause is left up to the team or individual.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-3-question-2-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "Team or individual selects the RCA method they are most familiar with.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-3-question-2-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "A Reliability Engineer or team leader selects the RCA method to be used based on his / her judgment.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-3-question-2-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "There is a clear procedure for selecting the RCA method to be used and the team make up is aligned with this.",
                    value: 4,
                  },
                ],
              },
              {
                id: "demo-questionnaire-1-section-2-step-3-question-3",
                title: "Problem Statement and Team Charter Developmen",
                question_text:
                  "Are team charters developed including problem statements?",
                context:
                  "Problem Statement\nA Team Charter is developed for each DE Team that includes a clear problem statement.",
                order: 3,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-2-step-3-question-3-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "No clear problem statement or team charter. Only the concept has been explained to the team.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-3-question-3-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "Only the Facilitator develops the problem statement and Team charter.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-3-question-3-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "The Facilitator puts the problem statement and charter together with the Team.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-3-question-3-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "The Facilitator puts the problem statement and charter together with the Team and it is understood and communicated to the key stakeholders.",
                    value: 4,
                  },
                ],
              },
              {
                id: "demo-questionnaire-1-section-2-step-3-question-4",
                title: "Question 17",
                question_text:
                  "How many teams are active and are they comprised of more than just maintenance personnel?",
                context:
                  "Team Composition\nKey stakeholders are represented in the Defect Elimination Team to provide input into the problem and solution analysis? Teams should include roles such as:\n• Facilitator\n• Team Leader\n• Reliability Engineer\n• Team Members (representing areas effected).",
                order: 4,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-2-step-3-question-4-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "Team make up is not considered or team members are chosen based on availability.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-3-question-4-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "Teams are made up of only people that are the most technically knowledgeable of the defect.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-3-question-4-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "There is a cross functional team that represents what's effected by the defect, but only includes supervisors and above.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-3-question-4-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "The DE Management Team strives to involve as many people as possible throughout the organization to make DE a normal daily activity, and the teams include hourly personnel as needed.",
                    value: 4,
                  },
                ],
              },
            ],
          },
          {
            id: "demo-questionnaire-1-section-2-step-4",
            title: "Develop Actions",
            order: 4,
            questions: [
              {
                id: "demo-questionnaire-1-section-2-step-4-question-1",
                title: "Root Cause Action Development",
                question_text:
                  "Are the teams always focused on getting to the root cause.",
                context:
                  "Identify potential actions\nAre all potential solutions and actions evaluated by the responsible DE Team or individual and are they formally documented?\nSolutions and actions have to address the root causes as well as any contributing factors.",
                order: 1,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  "shared-role-13",
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-2-step-4-question-1-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "No actions identified.\nSome actions identified but do not address the root causes.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-4-question-1-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description: "Actions identified address the root cause.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-4-question-1-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "Actions  identified address root cause as well as any contributing factors.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-4-question-1-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "Actions take into account both short and long term time frames for the overall benefit of the business.",
                    value: 4,
                  },
                ],
              },
              {
                id: "demo-questionnaire-1-section-2-step-4-question-2",
                title: "Action Evaluation and Approval",
                question_text:
                  "1. Does the owner of the relevant cost centre get to sign off on the actions?\n2. Is the evaluation methodology aligned with the site's Edge evaluation method?",
                context:
                  "Evaluation of potential actions\nAll potential actions are evaluated against specific criteria. Actions should be evaluated in terms of:\n• Addressing the root cause\n• SHE Implications\n• Cost to implement\n• Ease of implementation.",
                order: 2,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-2-step-4-question-2-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "No evaluation of potential actions is made.\nPotential actions are discussed, but not evaluated against any specific criteria.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-4-question-2-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "Potential actions are informally evaluated against some of the criteria.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-4-question-2-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "Potential actions are formally evaluated against most of the criteria by the DE Team.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-4-question-2-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "Potential actions are formally evaluated against all of the criteria with help from key stakeholders.",
                    value: 4,
                  },
                ],
              },
              {
                id: "demo-questionnaire-1-section-2-step-4-question-3",
                title: "Action Plan Development",
                question_text: "",
                context:
                  "Action Plan\nDetailed action plans developed with clear accountability.\n Action plans should include:\n• Actions\n• Accountability\n• Targets & deliverables\n• Status.",
                order: 3,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-2-step-4-question-3-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "No action plans in place or the action plans are non-specific and hard to measure.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-4-question-3-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "The action plans are aligned with the target areas but need more details",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-4-question-3-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "The action plans include required actions, accountability, and completion dates.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-4-question-3-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "The action plans include benefit targets and deliverables for the overall success of the business.",
                    value: 4,
                  },
                ],
              },
              {
                id: "demo-questionnaire-1-section-2-step-4-question-4",
                title: "Success Measurement Planning",
                question_text:
                  "1. Is the criteria for success clearly defined and understood by the team and management?\n2. Do the KPIs both help to track and manage project progress and ultimately whether or not the project goals were achieved?",
                context:
                  "Establish a measurement plan.\nA measurement plan is in place that includes a baseline with appropriate measures / KPI and targets.",
                order: 4,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-2-step-4-question-4-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "No plan in place or the plan does not  measure the effectiveness of the approved actions.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-4-question-4-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "The plan measures the effectiveness of most of the approved actions.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-4-question-4-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "An accurate baseline has been established with process indicators and KPIs that reflect the target areas.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-4-question-4-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "An accurate baseline has been established with process indicators and KPIs that reflect the target areas and are a mixture of leading and lagging KPI's.",
                    value: 4,
                  },
                ],
              },
            ],
          },
          {
            id: "demo-questionnaire-1-section-2-step-5",
            title: "Implement Actions",
            order: 5,
            questions: [
              {
                id: "demo-questionnaire-1-section-2-step-5-question-1",
                title: "Action Approval Process",
                question_text:
                  "Is there a clearly defined process that is documented?",
                context:
                  "Approval\nProper approval is obtained for all actions prior to implementation (i.e.: change management).",
                order: 1,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-2-step-5-question-1-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "No approval procedure in place or approval is informal and inconsistent. Change management requirements are never considered.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-5-question-1-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "Written approval is usually obtained as required from stakeholders. Change management requirements not always considered.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-5-question-1-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "Approval is always obtained and any necessary change management requirements are always completed before implementing the improvement.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-5-question-1-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "The approval process includes a high level review of all findings and actions by the DE management Team.",
                    value: 4,
                  },
                ],
              },
              {
                id: "demo-questionnaire-1-section-2-step-5-question-2",
                title: "Action Accountability Management",
                question_text:
                  "Does management understand the actions assigned to team members that report to them?",
                context:
                  "Accountability\nClear accountabilities are established for the completion of the action plan and is it syndicated with management. \nAccountabilities to include:\n• Project management\n• Action completion\n• Action management\n• Cost management\n• Monitoring progress.",
                order: 2,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-2-step-5-question-2-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "No clear accountabilities are established or accountability is only discussed at the DE Management Team Meeting.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-5-question-2-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "Accountability is understood by DE Team members and has been documented. Actions are often not managed and completed as planned.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-5-question-2-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "Site Leaders regularly monitor the progress of DE Team members on the action plan, most actions are managed and completed as planned.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-5-question-2-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "Site Leaders regularly monitor the progress of DE Team members and all actions are managed and completed as planned.",
                    value: 4,
                  },
                ],
              },
              {
                id: "demo-questionnaire-1-section-2-step-5-question-3",
                title: "Action Progress Review",
                question_text:
                  "Are current projects on track?\n2. Is allowance made for people to complete their DE actions as well as their other work?",
                context:
                  "Action close out\nThe DE Team's actions and progress reviewed at the monthly DE Management Team meeting. Any slippage in actions must be addressed through additional resources, tools or collaboration.",
                order: 3,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  "shared-role-13",
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-2-step-5-question-3-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "No review is made of the actions and progress of the individual DE Teams.\nThe action plan is reviewed sometimes but is inconsistent.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-5-question-3-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "The action plan is regularly reviewed but team pushes out many actions.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-5-question-3-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "The action plan is regularly reviewed and there is a focus on meeting the deadlines.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-5-question-3-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "The action plan is regularly reviewed and there is always a plan put in place to bring actions back onto schedule with support from Site Leaders.",
                    value: 4,
                  },
                ],
              },
              {
                id: "demo-questionnaire-1-section-2-step-5-question-4",
                title: "Action Progress Tracking",
                question_text:
                  "1. Is there a DE action register for team based activities?\n2. Are larger DE activities formally managed as Projects?\n3. Are the DE Teams using the DE register to help track their projects?",
                context:
                  "Tracking Progress\n DE Team progress is tracked using various documents?\n• Meeting Minutes\n• Who Does What When List (Actions Log)\n• Defect Register.",
                order: 4,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-2-step-5-question-4-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "DE Team progress is not updated.\nAn informal action log is updated infrequently.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-5-question-4-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "An informal action log is updated with action plan progress weekly and distributed to team members and site leaders as requested.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-5-question-4-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "The defect register is updated with action plan progress once a week along with the meeting minutes.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-5-question-4-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "The defect register is continuously kept up to date with all changes and is accessible to all site leaders and stakeholders.",
                    value: 4,
                  },
                ],
              },
            ],
          },
          {
            id: "demo-questionnaire-1-section-2-step-6",
            title: "DE Business Process Framework",
            order: 6,
            questions: [
              {
                id: "demo-questionnaire-1-section-2-step-6-question-1",
                title: "Loss Prevention and Continuous Learning System",
                question_text:
                  "Has a business process been implemented which defines the following:\n• A formalised register/tracker is in place to monitor action status from initiation to closure?\n• A post-completion audit is defined to validate the effectiveness of defect elimination actions?\ndaily/weekly/monthly/annual loss reporting, review and analysis?\n• A process is defined to share the learnings across the company but also to vendors and wider industry?",
                context:
                  "Business process for defect elimination\n\n\nAn effective business process should be defined for defect elimination.",
                order: 1,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-2-step-6-question-1-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "No approval procedure in place or a basic ad-hoc process is in place but it is not documented.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-6-question-1-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      'A documented process is implemented which covers most items listed under "Focus Questions".',
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-6-question-1-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      'A documented process is implemented which covers all items listed under "Focus Questions". No formal audit process in place to audit compliance and effectiveness.',
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-6-question-1-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      'A documented process is implemented which covers all items listed under "Focus Questions". Compliance and effectiveness is audited at least annually.',
                    value: 4,
                  },
                ],
              },
              {
                id: "demo-questionnaire-1-section-2-step-6-question-2",
                title: "DE Management Review Process",
                question_text:
                  "1. Does the agenda for the DE Management Team meeting include time for review of past projects?\n2. Does the DE Management Team's review of current projects focus on KPI's and targets?",
                context:
                  "DE Management Review\nThe DE Teams should be regularly reporting progress back through to the DE Management Team.",
                order: 2,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-2-step-6-question-2-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "No review takes place or there are informal reviews of the measures but no updates from the DE Teams.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-6-question-2-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "The DE Teams provide an update on progress at the Monthly DE Management Team Meeting. Reporting tends to be developed last minute.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-6-question-2-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "The DE Teams update the DE Register prior to the DE Management Teams monthly meeting. DE Management Team reviews the DE Register at each meeting looking for major non-conformances to projects.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-6-question-2-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "DE Management Team gives specific feedback to DE teams on what is going well and where they could improve the results shown in the KPIs and measures.",
                    value: 4,
                  },
                ],
              },
              {
                id: "demo-questionnaire-1-section-2-step-6-question-3",
                title: "Project Sustainability Monitoring",
                question_text:
                  "1. Are any projects completed in the past year still monitored for sustainability?\n2. Are there ever any long term KPI's allocated to DE projects?",
                context:
                  "Sustainability\nThe long-term sustainability actions are assured through scheduled reviews of past DE projects.",
                order: 3,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-2-step-6-question-3-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "Projects results are not sustained.\nSometimes DE Teams or leaders will review trends of project targets against expected KPIs.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-6-question-3-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "The DE Management Team reviews completed DE Projects on an ad-hoc basis.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-6-question-3-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "Completed DE projects are monitored according to the measurement plan by a DE Team member or accountable person.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-6-question-3-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "Results are reported to the DE Management team monthly and corrective actions taken for negative trends.",
                    value: 4,
                  },
                ],
              },
              {
                id: "demo-questionnaire-1-section-2-step-6-question-4",
                title: "Outcome Communication and Sharing",
                question_text:
                  "Is there much awareness about the successful outcome of DE projects throughout the organization?",
                context:
                  "Outcomes\nThe outcomes of the DE Project are updated in the Defect Register and are the outcomes syndicated?",
                order: 4,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-2-step-6-question-4-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "No updates are made of the DE Team's projects or the main source of information about the DE Project is from the Team leader.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-6-question-4-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "The outcomes of the DE Project are updated in the Defect Register.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-6-question-4-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "The outcomes of the DE Project are communicated across the site.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-2-step-6-question-4-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "The outcomes of the DE Project are communicated across the site. The outcomes of the DE Project are made available to other Company sites",
                    value: 4,
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "demo-questionnaire-1-section-3",
        title: "Asset Strategy Tactics",
        order: 3,
        steps: [
          {
            id: "demo-questionnaire-1-section-3-step-1",
            title: "Assess Criticality",
            order: 1,
            questions: [
              {
                id: "demo-questionnaire-1-section-3-step-1-question-1",
                title: "Asset Criticality Assessment",
                question_text:
                  "1. Are supervisors, planners and technicians aware of the criticality ranking of equipment or systems?\n2. Is criticality ranking updated as new changes are made to tactics?\n3. Is criticality ranking updated as operational requirements change?",
                context:
                  "Asset Criticality\nCriticality Analysis is important for determining where to focus Asset Tactic Development activities.  Criticality is based on consequence and likelihood.  Categories may include:\n• Safety, Health & Environmental\n• Costs\n• Operational.",
                order: 1,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-3-step-1-question-1-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "There is no criticality analysis of systems or equipment or there has been a criticality analysis at the system level only for all assets.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-3-step-1-question-1-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "There has been a criticality analysis at the physical asset or item level and ranking scores given to critical assets.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-3-step-1-question-1-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "Asset Criticality ranking is based on the Company Asset Criticality Guideline.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-3-step-1-question-1-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "Asset criticality ranking is always used when reviewing or developing asset tactics.",
                    value: 4,
                  },
                ],
              },
              {
                id: "demo-questionnaire-1-section-3-step-1-question-2",
                title: "Risk Management Integration",
                question_text:
                  "1. Are supervisors, planners and coordinators aware of the Company Enterprise Risk Management Framework and Appetite?\n2. Is Risk rating updated as new changes are made to tactics? Is this communicated to site leadership?\n3. Is Risk rating updated as operational requirements change?",
                context:
                  "Risk Management \nIt is important for determining where to focus Asset Tactic Development activities. Risk Management is based on consequence and likelihood utilising the Company Enterprise Risk Management Framework and Appetite.\nCategories may include:\n• Safety & Environmental\n• Costs\n• Operation.",
                order: 2,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  "shared-role-13",
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-3-step-1-question-2-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "There has been no criticality analysis based on established risk management processes for all assets.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-3-step-1-question-2-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "There has been a risk analysis at the physical asset or item level and ranking scores given to critical assets.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-3-step-1-question-2-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "Risk rankings are based on the Company Enterprise Risk Management Framework and Appetite. All approved asset criticality ranking are recorded in a central database and captured in SAP.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-3-step-1-question-2-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "Risk rankings are based on the Company Enterprise Risk Management Framework and Appetite. All Material Risks (Level 5 and Level 6) have established Asset Tactic Development activities incorporated into risk treatment plans.",
                    value: 4,
                  },
                ],
              },
            ],
          },
          {
            id: "demo-questionnaire-1-section-3-step-2",
            title: "Develop",
            order: 2,
            questions: [
              {
                id: "demo-questionnaire-1-section-3-step-2-question-1",
                title: "Tactics Development Database",
                question_text:
                  "1. Does the database have a logical hierarchy of equipment with a breakdown structure for critical equipment?\n2. Does the database contain a listing of common failure modes?",
                context:
                  "Asset Tactic Development Database\nA database is important to document analysis and track decision making history. Some other functions of a database are:\n• Developing equipment hierarchies & structures\n• Statistical Analysis\n• Asset Tactic Development database containing common failure mechanisms etc.",
                order: 1,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-3-step-2-question-1-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "No database used only Excel Spreadsheets are used.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-3-step-2-question-1-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "A relational database is used such as Access.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-3-step-2-question-1-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "A stand-alone software product is used with statistical analysis functions by Above Rail and Non-rail - IronMan",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-3-step-2-question-1-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "A stand-alone software product is used for all of Company with statistical analysis functions. Database is linked to SAP (or AMS).",
                    value: 4,
                  },
                ],
              },
              {
                id: "demo-questionnaire-1-section-3-step-2-question-2",
                title: "Tactics Review Process",
                question_text:
                  "1. Is there evidence of tactics review sessions?\n2. Are the triggers for review documented?\n3. Does the Reliability group report on reviews that have been completed?",
                context:
                  "Review of Tactics\nA process should be in place which will trigger a re-evaluation of tactics.  Triggers for re-evaluation can include:\n• Time-Based\n• Poor Performance\n• Change in conditions\n• Defect Elimination\n• Change in operating context.",
                order: 2,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-3-step-2-question-2-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "There is no evidence of any  review of Tactics or an ad-hoc review of tactics is made periodically for some equipment.  Triggers are normally incidents or poor equipment performance.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-3-step-2-question-2-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "Most triggered reviews are performed based on time, feedback from maintenance of from incident investigation.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-3-step-2-question-2-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "Triggers are set for review of critical assets. Triggered reviews are performed based numerious operational performance measures.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-3-step-2-question-2-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "There is a comprehensive plan for the review of tactics. It is embedded in how we do business and is triggered by technical advances, performance & operating context.",
                    value: 4,
                  },
                ],
              },
              {
                id: "demo-questionnaire-1-section-3-step-2-question-3",
                title: "Team-Based Tactics Development",
                question_text:
                  "1. Are there agendas and action plans available?\n2.  Have the recommendations made by previous teams actually made it into the SAP/CMMS system?",
                context:
                  "Team-Based Tactics Development\nA team-based approach to Asset Tactic Development will improve the effectiveness of the overall program.  Teams are normally involved in the development & implementation steps:\n• Asset Tactic Development analysis\n• Data gathering\n• Field Validation.",
                order: 3,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-3-step-2-question-3-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "Team based tactics development never or rarely used.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-3-step-2-question-3-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "Formal Teams exist with goals and action plans.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-3-step-2-question-3-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "Teams are cross-functional (Maintenance, Reliability, Operations, Technical) and include OEM representatives where needed.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-3-step-2-question-3-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "Cross site teams are encouraged and effectively complete projects. Share tactics with and adapt tactics from other sites.",
                    value: 4,
                  },
                ],
              },
              {
                id: "demo-questionnaire-1-section-3-step-2-question-4",
                title: "Project Selection and Prioritization",
                question_text:
                  "1. Does a prioritized list exist?\n2. Does each program have clearly defined boundaries for analysis?\n3. Are projects normally of short duration and frequent rather than large and intermittent?",
                context:
                  "Selection of Projects\nTactics development projects are prioritised and selected based on specific criteria:\n• Criticality\n• Performance\n• Value.",
                order: 4,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-3-step-2-question-4-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "No Tactics Development projects are planned or a list exists of Tactics development  projects with limited criteria for prioritization.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-3-step-2-question-4-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "Projects are prioritized utilizing criticality ranking and other criteria.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-3-step-2-question-4-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "Tactics Development projects are approved through a management selection process.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-3-step-2-question-4-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "Management process explicitly includes resourcing of the selected projects.",
                    value: 4,
                  },
                ],
              },
            ],
          },
          {
            id: "demo-questionnaire-1-section-3-step-3",
            title: "Assess Tactics",
            order: 3,
            questions: [
              {
                id: "demo-questionnaire-1-section-3-step-3-question-1",
                title: "Decision History Documentation",
                question_text:
                  "Can the organization demonstrate how critical tasks or intervals were determined?",
                context:
                  "Decision History\nIt is important to record the decision-making history behind tasks and intervals used in a maintenance strategy.  This will facilitate:\n• Review and updating of tactics\n• Identifying gaps in information needs.",
                order: 1,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-3-step-3-question-1-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "Asset Tactic Development decision making history is not recorded or Asset Tactic Development information is documented but not in a Asset Tactic Development database.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-3-step-3-question-1-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "RCM,FMEA, PMO task type and decision logic captured in a Asset Tactic Development database at an Asset level.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-3-step-3-question-1-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "All changes or updates to tactics information is recorded in a Asset Tactic Development database at the component level for all critical assets.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-3-step-3-question-1-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "All changes or updates to tactics decisions are recorded in the Asset Tactic Development database component level.",
                    value: 4,
                  },
                ],
              },
              {
                id: "demo-questionnaire-1-section-3-step-3-question-2",
                title: "Critical Equipment Tactics Validation",
                question_text:
                  "1. Can critical tasks in CMMS be found in the Asset Tactic Development database?\n2.  Are critical tasks derived from a FMECA/RCM analysis?",
                context:
                  "Asset Tactic Development-Critical Equipment Tactics\nTasks and associated intervals recorded in a Tactics database should reflect the actual maintenance strategies in use:\n• Tasks (and intervals) for critical equipment should exist in the Asset Tactic Development database\n• Tasks for critical equipment should have had some level of FMECA/RCM analysis.",
                order: 2,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-3-step-3-question-2-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "There is no database or tasks and intervals used in the CMMS system reflect those in the Tactics Database.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-3-step-3-question-2-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      ">50% of tasks performed for critical equipment exist in tactics database.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-3-step-3-question-2-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "100% of tasks performed for critical equipment are exist in tactics database.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-3-step-3-question-2-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "All new assets/equipment and/or acquired assets/equipment have had formal Asset Tactic Development analysis completed for tasks and intervals for critical assets/equipment.",
                    value: 4,
                  },
                ],
              },
            ],
          },
          {
            id: "demo-questionnaire-1-section-3-step-4",
            title: "Implement",
            order: 4,
            questions: [
              {
                id: "demo-questionnaire-1-section-3-step-4-question-1",
                title: "Task Documentation Standards",
                question_text:
                  "1. Do service sheets have a standard template?\n2. Are inspection tasks clearly defined as to what is considered acceptable or not?\n3. Are the tasks easily understood?\n4. Are critical tasks emphasized in some way?",
                context:
                  "Document Design\nTasks effectiveness is influenced in how they are presented as service sheets or other such documentation. Documentation guidelines should exist as:\n• Standard templates\n• Standard terminology\n• Clearly defined fields for feedback\n• Methods of emphasis.",
                order: 1,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-3-step-4-question-1-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "No standard documentation used or Service sheets / work instructions use a standard template.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-3-step-4-question-1-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "Tasks are written taking into consideration the expected trades experience levels.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-3-step-4-question-1-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "Tasks are written using a standard terminology.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-3-step-4-question-1-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "Document Design guidelines are used for terminology, photo, reference material, etc.",
                    value: 4,
                  },
                ],
              },
              {
                id: "demo-questionnaire-1-section-3-step-4-question-2",
                title: "Field Validation Process",
                question_text:
                  "1. Is there a form to validate new service sheets or tasks?\n2. Have all safety considerations considered when new tasks are implemented?",
                context:
                  "Field Validation\nFirst time execution of a changed or newly created tactic must be evaluated in the field. Not validating tasks in the field will lead to ineffective tactics and a lack of confidence in the entire program.\nField validation should focus on ensuring:\n• Safety, Ergonomic or Environmental issues resolved\n• Proper sequencing of tasks\n• Equipment access issues\n• Identify tools and parts requirements\n• Identify training needs.",
                order: 2,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  "shared-role-13",
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-3-step-4-question-2-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "There is no process to field validate new tasks or service sheets or some Tasks are validated ad hoc in the field after inclusion in CMMS system.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-3-step-4-question-2-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "New tasks are clearly identified and are field validated by maintainers.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-3-step-4-question-2-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "Complex tasks are field validated by maintainers and a reliability engineer.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-3-step-4-question-2-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "Complex Field Validation is part of Change Management Procedures.",
                    value: 4,
                  },
                ],
              },
              {
                id: "demo-questionnaire-1-section-3-step-4-question-3",
                title: "Task Packaging and Integration",
                question_text:
                  "1. Is there a task packaging function for the Asset Tactic Development database used?\n2.  Do tasks have an actual interval less than the derived interval from the FMECA/RCM/Reverse RCM/PMO analysis?",
                context:
                  "Task Packaging\nTasks must integrate with the current maintenance program.  Careful consideration must be taken to how tasks are packaged and scheduled in the maintenance program.",
                order: 3,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-3-step-4-question-3-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "New tasks or service sheets are integrated into the CMMS without much consideration for the overall maintenance program. Output of task/service sheet development is left up to others to be incorporated into maintenance program.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-3-step-4-question-3-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "A documented process exists for effective task packaging responsibilities are clearly defined in a RACI but it's not always followed.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-3-step-4-question-3-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "The process is followed for all critical asset tasks.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-3-step-4-question-3-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description: "The process always followed for all assets.",
                    value: 4,
                  },
                ],
              },
              {
                id: "demo-questionnaire-1-section-3-step-4-question-4",
                title: "Tactics Change Management",
                question_text:
                  "1. Is the ability to change tasks or intervals tightly controlled?\n2. Does everybody understand the processes?\n3.  Is there a form required before any changes can be made?",
                context:
                  "Change Management\nChange Management procedures are crucial to ensure maintenance tasks & procedures comply with the selected methodology (e.g., RCM, FMECA,  PMO) principles\n• Safety\n• Materials\n• Tasks including specification.",
                order: 4,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-3-step-4-question-4-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "There no change management procedures or here is an informal change management process in place that requires notification to reliability group of any changes to PM/tasks.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-3-step-4-question-4-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "Change Management procedure requires a reliability engineer to review and approve all changes to PM/tasks no formal  consideration given to actual failure modes and business requirements.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-3-step-4-question-4-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "Change Management procedure requires a reliability engineer to review and approve all changes to PM/tasks with consideration given to actual failure modes and business requirements.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-3-step-4-question-4-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "Change Management procedures requires  all changes to PM/tasks to be based on the selected methodology e.g., RCM, FMECA, PMO.",
                    value: 4,
                  },
                ],
              },
            ],
          },
          {
            id: "demo-questionnaire-1-section-3-step-5",
            title: "Optimise",
            order: 5,
            questions: [
              {
                id: "demo-questionnaire-1-section-3-step-5-question-1",
                title: "Asset Performance Monitoring",
                question_text:
                  "1. Are Pareto charts used?\n2. Are there reports available comparing expected performance vs revised Asset Tactic Development expected performance?\n3.  Is there an active review of failure information for new failure modes?",
                context:
                  "Asset Performance Review\n A continuous process of improving maintenance tactics requires the monitoring of various sources of information on equipment performance and task effectiveness:\n• Cost Reports\n• Trend Analysis\n• Failure Analysis\n• Tactics Review\n• Defect Elimination\n• Integrity Risk Assessment.",
                order: 1,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-3-step-5-question-1-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "Tools such as pareto analysis charts reviewed intermittently to identify emerging issues.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-3-step-5-question-1-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "Analysis of equipment performance metrics are used regularly.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-3-step-5-question-1-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "Various metrics and proactive risk assessments (e.g., FMEA) are used to identify emerging issues and opportunities to improve tactics in advance.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-3-step-5-question-1-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "Robust Lifecycle costing analysis in place. Combined cost, procurement, maintenance, operations & disposal.",
                    value: 4,
                  },
                ],
              },
              {
                id: "demo-questionnaire-1-section-3-step-5-question-2",
                title: "Preventive Maintenance Optimization",
                question_text:
                  "Have equipment tactics been reviewed to change, eliminate or extend intervals of tasks? Does Senior Management?",
                context:
                  "PMO (Preventative Maintenance  Optimisation)\nPMO is a review of equipment performance to determine the effectiveness of tactics already in place and:\n• Maybe used for equipment with significant history and well understood life cycles\n• Is a method to rapidly review current tactics in bulk.",
                order: 2,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-3-step-5-question-2-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "PMO is not or is sometimes used to optimize equipment tactics for equipment with well-understood failure modes.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-3-step-5-question-2-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "PMO is regularly used to optimize equipment tactics for equipment with well-understood failure modes.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-3-step-5-question-2-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "PMOs are widely used. There has been a PMO activity completed & effectively implemented in the last 36 months.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-3-step-5-question-2-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "PMOs are widely used. There has been a PMO activity completed & effectively implemented in the last 12 months.",
                    value: 4,
                  },
                ],
              },
              {
                id: "demo-questionnaire-1-section-3-step-5-question-3",
                title: "Cross-Site Collaboration",
                question_text:
                  "1. Does Senior Management encourage people to work together on Asset Tactic Development projects?\n2. Does Senior Management feel responsible for the performance of the Asset Tactic Development process?",
                context:
                  "Collaboration\nCollaboration is important to share information and resources across organizations to help improve Asset Tactic Development outcomes.  Collaboration can come in many forms:\n• Asset Management (AM) engagements\n• Common Practice Work Groups (CPWGs)\n• Multi-Site Projects.",
                order: 3,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-3-step-5-question-3-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "Little or no evidence of any collaboration activities.\nIndividuals in key roles have ad hoc contacts with other sites to review or discuss tactics work.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-3-step-5-question-3-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "Key individuals have access to on-line groups or forums.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-3-step-5-question-3-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "Key individuals are part of a Common Practice Work group.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-3-step-5-question-3-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "Key individuals are consulted or involved in multi-site tactics development projects.",
                    value: 4,
                  },
                ],
              },
              {
                id: "demo-questionnaire-1-section-3-step-5-question-4",
                title: "DE Integration with Asset Tactics",
                question_text:
                  "1. Does a Defect Elimination process exist?\n2. Are recommendations for tactics improvement from the Defect Elimination process reviewed and incorporated into existing tactics?\n3. Are tactics changes generated by the Defect Elimination process reviewed and approved prior to implementation?\n4. How often are tactics changed to as an outcome of a DE project? Do you have an example of this?",
                context:
                  "Asset Tactics Integrated with Defect Elimination           \n A process exists to ensure recommendations for tactics improvement generated from the Defect Elimination process are reviewed and incorporated into existing asset tactics.",
                order: 4,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-3-step-5-question-4-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "No Defect Elimination process exists. Or, Defect Elimination process exists, but no integration of Defect Elimination recommendations into Asset Tactics Development process.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-3-step-5-question-4-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "Some integration of Defect Elimination recommendations into Asset Tactics Development process.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-3-step-5-question-4-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "Defect Elimination recommendations for changes to tactics are integrated into the Asset Tactics Development process.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-3-step-5-question-4-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "Defect Elimination recommendations for changes to tactics are fully integrated into the Asset Tactics Development process, including a review and approval of the recommendations prior to implementation.",
                    value: 4,
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "demo-questionnaire-1-section-4",
        title: "Asset Health",
        order: 4,
        steps: [
          {
            id: "demo-questionnaire-1-section-4-step-1",
            title: "Design",
            order: 1,
            questions: [
              {
                id: "demo-questionnaire-1-section-4-step-1-question-1",
                title: "Asset Health Information Management",
                question_text:
                  "How are changes to the Asset Health program tracked. i.e. changed Fmax from 500Hz to 1000Hz?",
                context: "Asset Health information Storage and Sharing",
                order: 1,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-4-step-1-question-1-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "Asset Health information is not readily accessible. Asset Health information is stored at scattered locations and is hardly accessible.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-4-step-1-question-1-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "Asset Health information is stored at various specified locations and is accessible.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-4-step-1-question-1-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "All Asset Health information is stored at a common location and is accessible for certain people.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-4-step-1-question-1-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "All Asset Health information is stored at a common location and is readily accessible via electronic media for all concerned.",
                    value: 4,
                  },
                ],
              },
              {
                id: "demo-questionnaire-1-section-4-step-1-question-2",
                title: "Asset Health Program Ownership",
                question_text: "How do you know what you have?",
                context: "Asset Health Ownership",
                order: 2,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  "shared-role-13",
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-4-step-1-question-2-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "No system in place - Informal process; no documentation.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-4-step-1-question-2-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "A system in place and but not effectively followed.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-4-step-1-question-2-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "A system is  in place, documented and followed most of time  to ensure appropriate people take ownership of Asset Health activity.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-4-step-1-question-2-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "A system is  in place, documented and followed all of time  to ensure appropriate people take ownership of Asset Health activity. Asset Health Champion in place and active participation during meeting/reviews.",
                    value: 4,
                  },
                ],
              },
            ],
          },
          {
            id: "demo-questionnaire-1-section-4-step-2",
            title: "Implement",
            order: 2,
            questions: [
              {
                id: "demo-questionnaire-1-section-4-step-2-question-1",
                title: "Asset Selection Process",
                question_text:
                  "Have visual inspection routes been established?",
                context: "Asset Selection Process",
                order: 1,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-4-step-2-question-1-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "No process in place to select equipment and rely on OEM recommendations.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-4-step-2-question-1-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "informal process based on 'experience' for selecting equipment. Often list provided by customer.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-4-step-2-question-1-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "A formal AS&T development process where vendor/consultant review equipment to be in Asset Health program.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-4-step-2-question-1-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "An approved rigorous process is used in identifying the correct equipment to receive Asset Health surveys (including criticality reviews).",
                    value: 4,
                  },
                ],
              },
              {
                id: "demo-questionnaire-1-section-4-step-2-question-2",
                title: "Equipment Access Management",
                question_text:
                  "How are actionable items reported back to the Asset Health team.",
                context: "Condition Based Maintenance Access",
                order: 2,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-4-step-2-question-2-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "No system in place to address access issues and only 25% of equipment that requires Asset Health can be accessed safely.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-4-step-2-question-2-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "A system in place to address access issues and 50% of equipment that requires Asset Health can be accessed safely.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-4-step-2-question-2-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "A system in place to address access issues and 75% of equipment that requires Asset Health can be accessed safely.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-4-step-2-question-2-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "A system in place to address access issues and all equipment that requires Asset Health can be accessed safely.",
                    value: 4,
                  },
                ],
              },
              {
                id: "demo-questionnaire-1-section-4-step-2-question-3",
                title: "Inspection Route Management",
                question_text: "Is the information (data) centralised?",
                context: "Condition Monintoring Inspection Routes",
                order: 3,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-4-step-2-question-3-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "None to a few Asset Health inspection routes have been established.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-4-step-2-question-3-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "Asset Health inspection routes have been established for Critical and some equipment and followed for routine inspections.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-4-step-2-question-3-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "Asset Health inspection routes have been established for Above Rail and Non-rail equipment and are always followed for routine inspections",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-4-step-2-question-3-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "Asset Health inspection routes have been established for all Company equipment and are all followed for routine inspections.",
                    value: 4,
                  },
                ],
              },
            ],
          },
          {
            id: "demo-questionnaire-1-section-4-step-3",
            title: "Skills",
            order: 3,
            questions: [
              {
                id: "demo-questionnaire-1-section-4-step-3-question-1",
                title: "Stakeholder Training and Awareness",
                question_text:
                  "Have the stakeholders had any awareness training or background in Asset Health?",
                context: "Stakeholder Understanding",
                order: 1,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-4-step-3-question-1-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "Understanding amongst stakeholders about Asset Health processes and their value are misunderstood and there is little or no understanding about Asset Health processes and their value.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-4-step-3-question-1-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "Stakeholders understand the value and technology for some of the Asset Health processes.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-4-step-3-question-1-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "Above Rail and Non-rail Stakeholders understand the value and technology for the Asset Health processes and have integrated Asset Health  appropriately into some equipment maintenance tactics.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-4-step-3-question-1-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "Company Stakeholders understand the value and technology for all of the Asset Health processes and have integrated Asset Health  appropriately into all equipment maintenance tactics.",
                    value: 4,
                  },
                ],
              },
              {
                id: "demo-questionnaire-1-section-4-step-3-question-2",
                title: "Skills Development and Training",
                question_text:
                  "Is there a process in place for continuing development in condition monitoring and analytical skills amongst the teams?",
                context: "Skills & Knowledge",
                order: 2,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-4-step-3-question-2-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "No formal training or process in place. New technicians informally trained by existing staff.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-4-step-3-question-2-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "New technicians formally trained prior to commencing.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-4-step-3-question-2-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "Refresher training is formally provided on a regular and as needed basis.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-4-step-3-question-2-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "Professional development supported with peer interaction encouraged.",
                    value: 4,
                  },
                ],
              },
            ],
          },
          {
            id: "demo-questionnaire-1-section-4-step-4",
            title: "Acquire Data",
            order: 4,
            questions: [
              {
                id: "demo-questionnaire-1-section-4-step-4-question-1",
                title: "Asset Health Information Accessibility",
                question_text:
                  "How accessible is Asset Health information to shop floor personnel?",
                context: "Asset Health / asset condition general information",
                order: 1,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-4-step-4-question-1-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "Asset Health information exists but not clear or accessible.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-4-step-4-question-1-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description: "Asset Health information hard to access.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-4-step-4-question-1-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "Asset Health information readily accessible via electronic media across Above Rail and Non-rail taking into account numerious sources of data",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-4-step-4-question-1-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "Asset Health information readily accessible via electronic media across Company taking into account numerious sources of data",
                    value: 4,
                  },
                ],
              },
              {
                id: "demo-questionnaire-1-section-4-step-4-question-2",
                title: "Failed Component Analysis",
                question_text:
                  "Are failed components retained and sufficient root cause failure analysis completed?",
                context: "Failed Component Retention",
                order: 2,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  "shared-role-13",
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-4-step-4-question-2-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "Failed components are retained ad-hoc. 25% of all failures are retained for Failure Analysis.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-4-step-4-question-2-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "50% of all failures are retained for Failure Analysis.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-4-step-4-question-2-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "75% of all failures are retained for Failure Analysis.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-4-step-4-question-2-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "All failures components under a Asset Health program are retained for a full failure analysis",
                    value: 4,
                  },
                ],
              },
              {
                id: "demo-questionnaire-1-section-4-step-4-question-3",
                title: "RCA Implementation and Documentation",
                question_text: "To what extent are RCA performed?",
                context:
                  "Root Cause Analysis (RCA) Information\nFrom CMMS data",
                order: 3,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  "shared-role-13",
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-4-step-4-question-3-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "RCA is not carried out consistantly using a systematic methodology. Principles of RCA are utilized on occasion but application and reporting is not utilized.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-4-step-4-question-3-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "Principles of RCA are utilized but application and reporting is inconsistent.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-4-step-4-question-3-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "Most RCA reports are detailed and accessible.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-4-step-4-question-3-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "All RCA reports are detailed and readily accessible.",
                    value: 4,
                  },
                ],
              },
            ],
          },
          {
            id: "demo-questionnaire-1-section-4-step-5",
            title: "Analyse Data",
            order: 5,
            questions: [
              {
                id: "demo-questionnaire-1-section-4-step-5-question-1",
                title: "Planning and Scheduling Integration",
                question_text:
                  "How does the Asset Health team interface with P&S?",
                context:
                  "Asset Health Integration with Maintenance Planning & Scheduling",
                order: 1,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  "shared-role-13",
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-4-step-5-question-1-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "Asset Health representative has little or no contact with Planners, and Schedulers but do not attend weekly scheduling meeting.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-4-step-5-question-1-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "Asset Health representative has some contact with planners and schedulers.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-4-step-5-question-1-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "Asset Health representative has good contact with planners and schedulers and is present at scheduling meeting when significant failures/finds occur.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-4-step-5-question-1-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "Asset Health representative has excellent contact with planners and schedulers and is always  present at weekly scheduling meetings.",
                    value: 4,
                  },
                ],
              },
              {
                id: "demo-questionnaire-1-section-4-step-5-question-2",
                title: "Failure Documentation Standards",
                question_text:
                  "1. Are failures well documented sufficiently to allow future reliability analysis?\n2. Do they include failure modes and all other relevant information?",
                context: "Failure Recording",
                order: 2,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  "shared-role-13",
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-4-step-5-question-2-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "Failure modes not consistantly recorded in work order. 25% of critical failures are documented properly.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-4-step-5-question-2-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "75% of critical failures are documented properly.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-4-step-5-question-2-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "100% of critical failures are documented properly.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-4-step-5-question-2-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "All failures are recorded properly in a consistent manner.",
                    value: 4,
                  },
                ],
              },
              {
                id: "demo-questionnaire-1-section-4-step-5-question-3",
                title: "Reliability Engineering Collaboration",
                question_text:
                  "What level of interaction occurs between Asset Health tech's and Res?",
                context: "Asset Health Tech's Access to RE",
                order: 3,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  "shared-role-13",
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-4-step-5-question-3-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description: "Asset Health have little or no access RE's.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-4-step-5-question-3-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "Asset Health have access to and are updated on RCA information upon request.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-4-step-5-question-3-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "Asset Health have access to and are updated on RCA information.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-4-step-5-question-3-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "Asset Health have full access to and are always updated on RCA information.",
                    value: 4,
                  },
                ],
              },
            ],
          },
          {
            id: "demo-questionnaire-1-section-4-step-6",
            title: "Report",
            order: 6,
            questions: [
              {
                id: "demo-questionnaire-1-section-4-step-6-question-1",
                title: "Recommendation Implementation",
                question_text:
                  "When a recommendation for corrective action is made; what happens?",
                context: "Asset Health Recommendations - Actioning",
                order: 1,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  "shared-role-13",
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-4-step-6-question-1-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "Asset Health recommendations are not followed and routinely acted upon.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-4-step-6-question-1-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "Asset Health recommendations are valued but tend to be pushed out when there are conflicting priorities.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-4-step-6-question-1-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "Most recommendations are actioned  within the required timeframe considering criticality.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-4-step-6-question-1-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "All Asset Health recommendations are actioned  within the time frame required.",
                    value: 4,
                  },
                ],
              },
              {
                id: "demo-questionnaire-1-section-4-step-6-question-2",
                title: "Stakeholder Feedback Management",
                question_text: "Have the stakeholders been identified?",
                context: "Stakeholder Feedback",
                order: 2,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-4-step-6-question-2-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "No stakeholders have been identified. No stakeholder feedback is sought or given.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-4-step-6-question-2-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description: "Stakeholder Feedback is sought occasionally.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-4-step-6-question-2-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "A system in place to ensure Above Rail and Non-rail stakeholders feedback is given by and it is always acted upon.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-4-step-6-question-2-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "A system in place to ensure All Company stakeholders feedback is given by and it is always acted upon.",
                    value: 4,
                  },
                ],
              },
              {
                id: "demo-questionnaire-1-section-4-step-6-question-3",
                title: "Asset Health Reporting Standards",
                question_text:
                  "Do Asset Health reports exists and are they standardised?",
                context: "Asset Information",
                order: 3,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-4-step-6-question-3-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "Less than 25% of monitored equipment has completed data sheets.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-4-step-6-question-3-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "50% of monitored equipment has completed data sheets.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-4-step-6-question-3-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "75% of monitored equipment has completed data sheets. \n100% of critical equipment has completed data sheets.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-4-step-6-question-3-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "Accurate detailed data sheets available for all equipment under Asset Health surveys.",
                    value: 4,
                  },
                ],
              },
              {
                id: "demo-questionnaire-1-section-4-step-6-question-4",
                title: "Recommendation Tracking Systems",
                question_text:
                  "How do you know when something is repaired or replaced once a recommendation is acted upon?",
                context: "Asset Health Recommendations - Tracking",
                order: 4,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  "shared-role-13",
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-4-step-6-question-4-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "Asset Health recommendations are not tracked.\nPlan/methodology has not been fully developed for tracking status of recommendations.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-4-step-6-question-4-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "Plan/methodology has been developed for tracking status of recommendations. Working on deployment.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-4-step-6-question-4-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "A consistent methodology is used to track the current status of most recommendations",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-4-step-6-question-4-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "A consistent methodology is used to track the current status of all Asset Health recommendations",
                    value: 4,
                  },
                ],
              },
            ],
          },
          {
            id: "demo-questionnaire-1-section-4-step-7",
            title: "Improve",
            order: 7,
            questions: [
              {
                id: "demo-questionnaire-1-section-4-step-7-question-1",
                title: "Continuous Improvement Process",
                question_text:
                  "How do you know if your equipment is in calibration or not?",
                context: "Asset Health Continuous Improvement",
                order: 1,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  "shared-role-13",
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-4-step-7-question-1-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "Asset Health self-audit tools not readily  available. Some Asset Health self-audit tools are available but not used to identify improvement opportunities.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-4-step-7-question-1-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "Some Asset Health self-audit tools are available and occasionally used to identify improvement opportunities. Improvement opportunities  not often actioned.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-4-step-7-question-1-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "Asset Health self-audit tools are available and often used to identify improvement opportunities. Most Improvement opportunities actioned.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-4-step-7-question-1-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "Asset Health self-audit tools are available and regularly used to identify improvement opportunities. Improvement opportunities are always actioned.",
                    value: 4,
                  },
                ],
              },
              {
                id: "demo-questionnaire-1-section-4-step-7-question-2",
                title: "Change Management Process",
                question_text:
                  "Are they rushed to judgment when it comes to analysis?",
                context: "Asset Health Change Management",
                order: 2,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  "shared-role-13",
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-4-step-7-question-2-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "Changes to Asset Health program not documented. Overall Asset Health procedure in place but not utilized.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-4-step-7-question-2-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description: "Some changes are documented.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-4-step-7-question-2-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "Most Major changes to Asset Health program are documented using a change management process.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-4-step-7-question-2-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "All Changes to Asset Health program are documented using a change management process.",
                    value: 4,
                  },
                ],
              },
              {
                id: "demo-questionnaire-1-section-4-step-7-question-3",
                title: "Value Communication and Recognition",
                question_text: "How are 'wins' or 'saves' acknowledged?",
                context: "Asset Health value add",
                order: 3,
                applicable_roles: [
                  "shared-role-5",
                  "shared-role-9",
                  "shared-role-8",
                  
                  "shared-role-20",
                  "shared-role-22",
                  "shared-role-44",
                  "shared-role-28",
                ],
                rating_scales: [
                  {
                    id: "demo-questionnaire-1-section-4-step-7-question-3-rating-scale-1",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-1",
                    name: "Reactive",
                    description:
                      "Asset Health value add is not or rarely publicised.",
                    value: 1,
                  },
                  {
                    id: "demo-questionnaire-1-section-4-step-7-question-3-rating-scale-2",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-2",
                    name: "Planned",
                    description:
                      "Asset Health value add is publicized occasionally in one way or another.",
                    value: 2,
                  },
                  {
                    id: "demo-questionnaire-1-section-4-step-7-question-3-rating-scale-3",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-3",
                    name: "Proactive",
                    description:
                      "Asset Health value add is often publicized in one way or another.",
                    value: 3,
                  },
                  {
                    id: "demo-questionnaire-1-section-4-step-7-question-3-rating-scale-4",
                    questionnaire_rating_scale_id:
                      "demo-questionnaire-1-rating-scale-4",
                    name: "Optimised",
                    description:
                      "Asset Health value add is regularly publicized and promoted in readily accessible media.",
                    value: 4,
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

// export const questionnaires: Questionnaire[] = [
//   {
//     id: "demo-questionnaire-1",
//     name: "Mining Operations Questionnaire",
//     description:
//       "Comprehensive evaluation of mining operations across all critical areas",
//     guidelines:
//       "Assess all aspects of mining operations including work management, defect elimination, asset strategy, and asset health",
//     rating_scales: [
//       {
//         id: "demo-questionnaire-1-rating-scale-4",
//         name: "Optimised",
//         description:
//           "Exceeds requirements with continuous improvement and leading practices",
//         value: 4,
//         order_index: 3,
//       },
//       {
//         id: "demo-questionnaire-1-rating-scale-3",
//         name: "Proactive",
//         description:
//           "Meets requirements with systematic and preventive approaches",
//         value: 3,
//         order_index: 2,
//       },
//       {
//         id: "demo-questionnaire-1-rating-scale-2",
//         name: "Planned",
//         description:
//           "Basic systems exist but inconsistent execution, gaps in compliance",
//         value: 2,
//         order_index: 1,
//       },
//       {
//         id: "demo-questionnaire-1-rating-scale-1",
//         name: "Reactive",
//         description:
//           "Ad-hoc approaches, fire-fighting mode, immediate intervention required",
//         value: 1,
//         order_index: 0,
//       },
//     ],
//     sections: [
//       {
//         id: "demo-questionnaire-1-section-1",
//         title: "Work Management",
//         order: 1,
//         steps: [
//           {
//             id: "demo-questionnaire-1-section-1-step-1",
//             title: "Identify Work",
//             order: 1,
//             questions: [
//               {
//                 id: "demo-questionnaire-1-section-1-step-1-question-1",
//                 title: "Work Identification Training",
//                 question_text:
//                   "1. How are new employees being trained in Work Identification and Notification creation?\n2. Have Operators (if applicable, e.g.. inspection routes) and Maintainers received Work Identification training?\n3. Are there any training gaps in your organization regarding entering a work request into your SAP?\n4. Have Service Providers / contractors received Work Identification training?",
//                 context:
//                   "Work Identification Training\nOperators / maintainers / Maint professionals / contractors receive training in Work Identification and Notification creation, considering:\n• Work identification is incorporated into new employees training\n• Sources of training materials may be:\no > Site-specific Work Identification training\no > Work Identification Awareness presentation\no > SAP raising notification training.",
//                 order: 1,
//                 applicable_roles: [
//                   shared_role_name_to_id["Scheduler"],
//                   shared_role_name_to_id["Maintenance Planner"],
//                   shared_role_name_to_id["Auditor"],
//                   shared_role_name_to_id["Maintenance Supervisor"],
//                 ],
//                 rating_scales: [
//                   {
//                     id: "demo-questionnaire-1-section-1-step-1-question-1-rating-scale-1",
//                     questionnaire_rating_scale_id:
//                       "demo-questionnaire-1-rating-scale-4",
//                     name: "Reactive",
//                     description:
//                       "Training recipients identified but less than 25% trained.",
//                     value: 1,
//                   },
//                   {
//                     id: "demo-questionnaire-1-section-1-step-1-question-1-rating-scale-2",
//                     questionnaire_rating_scale_id:
//                       "demo-questionnaire-1-rating-scale-3",
//                     name: "Planned",
//                     description:
//                       "Training recipients identified but less than 50% trained and most emergent work is incorrectly coded.",
//                     value: 2,
//                   },
//                   {
//                     id: "demo-questionnaire-1-section-1-step-1-question-1-rating-scale-3",
//                     questionnaire_rating_scale_id:
//                       "demo-questionnaire-1-rating-scale-2",
//                     name: "Proactive",
//                     description:
//                       "75% of people trained and most emergent work is correctly coded.",
//                     value: 3,
//                   },
//                   {
//                     id: "demo-questionnaire-1-section-1-step-1-question-1-rating-scale-4",
//                     questionnaire_rating_scale_id:
//                       "demo-questionnaire-1-rating-scale-1",
//                     name: "Optimised",
//                     description:
//                       "90% of people trained and all emergent work is correctly coded.",
//                     value: 4,
//                   },
//                 ],
//               },
//               {
//                 id: "demo-questionnaire-1-section-1-step-1-question-2",
//                 title: "Preventive Maintenance Work Setup",
//                 question_text:
//                   "1. Is all of the PM Work set up within the SAP?\n2. Is most of the PM work calendar-based, and/or based on OEM recommendations, rather than tactics reviews?\n3. For new equipment, is PM Work  based on formal Asset Tactics Development?  What is the process for entering them into the SAP?\n4.  What is the process for modifications to existing tactics, and entering them into the SAP? How often are formal reviews undertaken?\n5. Preventative work orders are part of the maintenance regime (PM02)",
//                 context:
//                   "Identification of PM work\nPM Work has a defined scope and frequency, and originates from the asset maintenance strategy, and built into its maintenance tactics. The maintenance tactics are a set of activities carried out to enable the realisation of the defined reliability/availability of the Asset. All maintenance strategies and tactics are created within the SAP for automatic generation as PM01",
//                 order: 2,
//                 applicable_roles: [
//                   shared_role_name_to_id["Scheduler"],
//                   shared_role_name_to_id["Maintenance Planner"],
//                   shared_role_name_to_id["Auditor"],
//                   shared_role_name_to_id["Maintenance Supervisor"],
//                   shared_role_name_to_id["Maintenance Superintendent"],
//                   shared_role_name_to_id["Reliability Engineer"],
//                   shared_role_name_to_id["Operations Supervisor"],
//                   shared_role_name_to_id["Maintainer"],
//                 ],
//                 rating_scales: [
//                   {
//                     name: "Reactive",
//                     description:
//                       "PM Work captured in SAP; is either mostly calendar- based, and/or based on OEM recommendations, rather than tactics reviews. <50% of scheduled work is system generated.",
//                     value: 1,
//                     id: "demo-questionnaire-1-section-1-step-1-question-2-rating-scale-1",
//                     questionnaire_rating_scale_id:
//                       "demo-questionnaire-1-rating-scale-1",
//                   },
//                   {
//                     name: "Planned",
//                     description:
//                       "PM work is identified for new or critical equipment using a formal tactic review process e.g., FMEA, RCM or PMO. >50% of scheduled work is Corrective PM",
//                     value: 2,
//                     id: "demo-questionnaire-1-section-1-step-1-question-2-rating-scale-2",
//                     questionnaire_rating_scale_id:
//                       "demo-questionnaire-1-rating-scale-2",
//                   },
//                   {
//                     name: "Proactive",
//                     description:
//                       "PM work is being identified/modified using formal tactic review process but is not entered into the SAP system in a timely manner. >65% of scheduled work is PM",
//                     value: 3,
//                     id: "demo-questionnaire-1-section-1-step-1-question-2-rating-scale-3",
//                     questionnaire_rating_scale_id:
//                       "demo-questionnaire-1-rating-scale-3",
//                   },
//                   {
//                     name: "Optimised",
//                     description:
//                       "PM work is being identified/modified using formal tactic review process and is being entered into the SAP system in a timely manner. >80% of scheduled work is PM",
//                     value: 4,
//                     id: "demo-questionnaire-1-section-1-step-1-question-2-rating-scale-4",
//                     questionnaire_rating_scale_id:
//                       "demo-questionnaire-1-rating-scale-4",
//                   },
//                 ],
//               },
//               {
//                 id: "demo-questionnaire-1-section-1-step-1-question-3",
//                 title: "Operator Inspection Checklists",
//                 question_text:
//                   "1. Are there Operators' checklists for all equipment? (Note this refers to inspection checklists, not merely pre-op inspection forms).\n2. Is there alignment with the checklist details and the maintenance strategies? How are changes to inspection requirements and strategies transferred to the checklist?\n3. All are all defects entered as Notifications in the SAP in a timely manner?\n4. Do Notifications typically represent all aspects of the true condition of the equipment?",
//                 context:
//                   "Inspection Checklist Design - Operators\nOperator inspection checklists are up-to-date and aligned with equipment maintenance strategy. (Daily, Weekly, Monthly). Defects found as a result are entered in the SAP in a timely manner considering:\n• Safety\n• Materials\n• Tasks including specification\n• Additional Resources\n• Feedback / comments field\n• Sign off.",
//                 order: 3,
//                 applicable_roles: [
//                   shared_role_name_to_id["Maintenance Supervisor"],
//                   shared_role_name_to_id["Maintenance Superintendent"],
//                   shared_role_name_to_id["Reliability Engineer"],
//                   shared_role_name_to_id["Auditor"],
//                   shared_role_name_to_id["Operations Supervisor"],
//                 ],
//                 rating_scales: [
//                   {
//                     id: "demo-questionnaire-1-section-1-step-1-question-3-rating-scale-1",
//                     questionnaire_rating_scale_id:
//                       "demo-questionnaire-1-rating-scale-1",
//                     name: "Reactive",
//                     description:
//                       "Checklists are poorly designed and incomplete and do not exist for all critical equipment. Operations verbally notify AM personnel.",
//                     value: 1,
//                   },
//                   {
//                     id: "demo-questionnaire-1-section-1-step-1-question-3-rating-scale-2",
//                     questionnaire_rating_scale_id:
//                       "demo-questionnaire-1-rating-scale-2",
//                     name: "Planned",
//                     description:
//                       "Checklists are good quality and up to date but not using a standard design. Exist for all critical equipment. Operations Supv enter Notifications in SAP. Maintenance Supervisors approve Notifications for Work Order creation.",
//                     value: 2,
//                   },
//                   {
//                     id: "demo-questionnaire-1-section-1-step-1-question-3-rating-scale-3",
//                     questionnaire_rating_scale_id:
//                       "demo-questionnaire-1-rating-scale-3",
//                     name: "Proactive",
//                     description:
//                       "Checklists based on a standard template and exist for the majority of equipment. All Notifications are entered in the SAP.",
//                     value: 3,
//                   },
//                   {
//                     id: "demo-questionnaire-1-section-1-step-1-question-3-rating-scale-4",
//                     questionnaire_rating_scale_id:
//                       "demo-questionnaire-1-rating-scale-4",
//                     name: "Optimised",
//                     description:
//                       "Checklists periodically reviewed and exist for all equipment as identified through Asset Tactics Development.  All operations personnel enter Notifications in SAP, and reviewed for rejected or additional info, and resubmit as needed.",
//                     value: 4,
//                   },
//                 ],
//               },
//               {
//                 id: "demo-questionnaire-1-section-1-step-1-question-4",
//                 title: "Maintainer Inspection Checklists",
//                 question_text:
//                   '1. When inspection checklists are performed by maintainers, are defects found entered in the SAP?\n2. Is there alignment with the checklist details and the maintenance strategies?\n3. How are changes to inspection requirements and strategies transferred to the checklist?\n4. Are defects found as a result of inspections scheduled using the standard Maintenance Planning Process, or executed as part of "scheduled" work?',
//                 context:
//                   "Inspection Checklist Design - Maintainers\nInspection checklists are up-to-date and aligned with equipment maintenance strategy. (Daily, Weekly, Monthly) considering:\n• Safety\n• Materials\n• Tasks including specification\n• Additional Resources\n• Feedback / comments field\n• Sign off.",
//                 order: 4,
//                 applicable_roles: [
//                   shared_role_name_to_id["Operations Supervisor"],
//                   shared_role_name_to_id["Maintenance Supervisor"],
//                   shared_role_name_to_id["Auditor"],
//                   shared_role_name_to_id["Reliability Engineer"],
//                   shared_role_name_to_id["Maintainer"],
//                   shared_role_name_to_id["Maintenance Planner"],
//                   shared_role_name_to_id["Scheduler"],
//                 ],
//                 rating_scales: [
//                   {
//                     id: "demo-questionnaire-1-section-1-step-1-question-4-rating-scale-1",
//                     questionnaire_rating_scale_id:
//                       "demo-questionnaire-1-rating-scale-1",
//                     name: "Reactive",
//                     description:
//                       "Checklists are poorly designed and incomplete and do not exist for all critical equipment. Supervisors enter Notifications from maintainers input, or maintainers execute the work without consulting scheduler or supervisor.",
//                     value: 1,
//                   },
//                   {
//                     id: "demo-questionnaire-1-section-1-step-1-question-4-rating-scale-2",
//                     questionnaire_rating_scale_id:
//                       "demo-questionnaire-1-rating-scale-2",
//                     name: "Planned",
//                     description:
//                       "Checklists are good quality and up to date but not using a standard design. They exist for all critical equipment.  Maintainers enter subsequent notifications and submit DE ideas.",
//                     value: 2,
//                   },
//                   {
//                     id: "demo-questionnaire-1-section-1-step-1-question-4-rating-scale-3",
//                     questionnaire_rating_scale_id:
//                       "demo-questionnaire-1-rating-scale-3",
//                     name: "Proactive",
//                     description:
//                       "Checklists based on a standard template and exist for the majority of equipment.",
//                     value: 3,
//                   },
//                   {
//                     id: "demo-questionnaire-1-section-1-step-1-question-4-rating-scale-4",
//                     questionnaire_rating_scale_id:
//                       "demo-questionnaire-1-rating-scale-4",
//                     name: "Optimised",
//                     description:
//                       "Checklists periodically reviewed and exist for all equipment as identified through Asset Tactics Development.",
//                     value: 4,
//                   },
//                 ],
//               },
//             ],
//           },
//           {
//             id: "demo-questionnaire-1-section-1-step-2",
//             title: "Plan Work",
//             order: 2,
//             questions: [
//               {
//                 id: "demo-questionnaire-1-section-1-step-2-question-1",
//                 title: "Work Scoping Standards",
//                 question_text:
//                   "1. Has the Company Maintenance Planning Process been communicated and made available to all?\n2. Is current planning performed as per the Company Maintenance Planning Process?  As applicable, do job scopes include clean-up, decon requirements, and rotables information?\n3. Parts availability is being verified before scheduling of tasks?\n4. Are Tasks rejected which don't comply with current equipment tactics, or rescoped to align with Budget, Tactics, operations and or Equipment stability requirements?",
//                 context:
//                   "Scoping Work\nTo ensure that the planning function is performed in the same manner all the time, well document planning standards for work orders and work management must be in place and followed:\n• Workshop visits by planners during planning of major tasks\n• Task frequencies and durations captured\n• All resource, materials, shared equipment requirements captured\n• Safety requirements determined and captured\n• Validity of Task reviewed in relation to Tactics\n• Additional documentation (checklists) attached",
//                 order: 1,
//                 applicable_roles: [
//                   shared_role_name_to_id["Maintenance Superintendent"],
//                   shared_role_name_to_id["Operations Supervisor"],
//                   shared_role_name_to_id["Maintenance Supervisor"],
//                   shared_role_name_to_id["Reliability Engineer"],
//                   shared_role_name_to_id["Maintenance Planner"],
//                   shared_role_name_to_id["Scheduler"],
//                   shared_role_name_to_id["Auditor"],
//                   shared_role_name_to_id["Maintainer"],
//                 ],
//                 rating_scales: [
//                   {
//                     id: "demo-questionnaire-1-section-1-step-2-question-1-rating-scale-1",
//                     questionnaire_rating_scale_id:
//                       "demo-questionnaire-1-rating-scale-1",
//                     name: "Reactive",
//                     description:
//                       "Company guidelines for scoping work known about but not complied with Some Operations in Work Orders but not much detail.",
//                     value: 1,
//                   },
//                   {
//                     id: "demo-questionnaire-1-section-1-step-2-question-1-rating-scale-2",
//                     questionnaire_rating_scale_id:
//                       "demo-questionnaire-1-rating-scale-2",
//                     name: "Planned",
//                     description:
//                       "Company guidelines for scoping work are established and followed. More detailed operations with >60% planning accuracy.",
//                     value: 2,
//                   },
//                   {
//                     questionnaire_rating_scale_id:
//                       "demo-questionnaire-1-rating-scale-3",
//                     id: "demo-questionnaire-1-section-1-step-2-question-1-rating-scale-3",
//                     name: "Proactive",
//                     description:
//                       "Planning standards comply with 80% of Company guidelines for scoping work. Good detail in operations >80% estimate accuracy.",
//                     value: 3,
//                   },
//                   {
//                     questionnaire_rating_scale_id:
//                       "demo-questionnaire-1-rating-scale-4",
//                     id: "demo-questionnaire-1-section-1-step-2-question-1-rating-scale-4",
//                     name: "Optimised",
//                     description:
//                       "Planning standards fully compliant with the Company Maintenance Planning Process. Very well detailed operations with >90% estimate accuracy.",
//                     value: 4,
//                   },
//                 ],
//               },
//               {
//                 id: "demo-questionnaire-1-section-1-step-2-question-2",
//                 title: "Long Term Planning Horizons",
//                 question_text:
//                   "1. Long Term Planning (LTP) develops plans for Preventative and Capital work >26 weeks\n2. Depot Planning receives handover from LTP and is responsible within 26 weeks for Preventative, Corrective and all other work order types until handover to Depot Scheduler at 3 weeks\n3. LTP and Capital Planner is responsible within 26 weeks for Capital Work\n4. Handover from LTP to Depot Planner occurs at 26 weeks on a rolling monthly basis",
//                 context:
//                   "Long Term Planning Horizons & Tasks\nCapital Planning tasks are managed by Long Term Planning (26 weeks to 3 weeks).  Clear differentation of maintenance tasks required to assign maintenance planner form Asset Managament & Startegy or Business Unit.",
//                 order: 2,
//                 applicable_roles: [
//                   shared_role_name_to_id["Maintenance Superintendent"],
//                   shared_role_name_to_id["Operations Supervisor"],
//                   shared_role_name_to_id["Maintenance Supervisor"],
//                   shared_role_name_to_id["Reliability Engineer"],
//                   shared_role_name_to_id["Maintenance Planner"],
//                   shared_role_name_to_id["Scheduler"],
//                   shared_role_name_to_id["Auditor"],
//                   shared_role_name_to_id["Maintainer"],
//                 ],
//                 rating_scales: [
//                   {
//                     id: "demo-questionnaire-1-section-1-step-2-question-2-rating-scale-1",
//                     questionnaire_rating_scale_id:
//                       "demo-questionnaire-1-rating-scale-1",
//                     name: "Reactive",
//                     description:
//                       "Guidance for delineation of tasks between LTP and BU is defined but not followed.",
//                     value: 1,
//                   },
//                   {
//                     id: "demo-questionnaire-1-section-1-step-2-question-2-rating-scale-1",
//                     questionnaire_rating_scale_id:
//                       "demo-questionnaire-1-rating-scale-1",
//                     name: "Planned",
//                     description:
//                       "Guidance for delineation of tasks between LTP and BU is defined and followed >50%.  Communication channels between LTP and BU is established and LTP raises issues with BU when required.",
//                     value: 2,
//                   },
//                   {
//                     id: "demo-questionnaire-1-section-1-step-2-question-2-rating-scale-1",
//                     questionnaire_rating_scale_id:
//                       "demo-questionnaire-1-rating-scale-1",
//                     name: "Proactive",
//                     description:
//                       "Guidance for delineation of tasks between LTP and BU is defined and followed >80%, including adhering to time horizons.  LTP is actively engaged with BU on a monthly basis.",
//                     value: 3,
//                   },
//                   {
//                     id: "demo-questionnaire-1-section-1-step-2-question-2-rating-scale-1",
//                     questionnaire_rating_scale_id:
//                       "demo-questionnaire-1-rating-scale-1",
//                     name: "Optimised",
//                     description:
//                       "Guidance for delineation of tasks between LTP and BU is defined and followed >90%.  LTP is actively engaged with BU.",
//                     value: 4,
//                   },
//                 ],
//               },
//               {
//                 id: "demo-questionnaire-1-section-1-step-2-question-3",
//                 title: "Task Lists and Standard Jobs",
//                 question_text:
//                   '1. How many task lists are available?  What % of work (PM, corrective & breakdown) is created from task lists or standard jobs?\n2. Are the task lists that are available used including ordering of required material for jobs?\n3. Is there are formal process to update and create new tasks lists?\n4. Are task list instructions detailed with specification or are they "Is motor hot?" or "Check Alignment"?',
//                 context:
//                   "Task List / Standard Jobs\nTo reduce the amount of work, and support continuous improvement, standard jobs or task lists should be used during the planning process.\nA Job should only ever be planned once, saved as a task list or standard job, and then improved over time.",
//                 order: 3,
//                 applicable_roles: [
//                   shared_role_name_to_id["Maintenance Superintendent"],
//                   shared_role_name_to_id["Operations Supervisor"],
//                   shared_role_name_to_id["Maintenance Supervisor"],
//                   shared_role_name_to_id["Reliability Engineer"],
//                   shared_role_name_to_id["Maintenance Planner"],
//                   shared_role_name_to_id["Scheduler"],
//                   shared_role_name_to_id["Auditor"],
//                   shared_role_name_to_id["Maintainer"],
//                 ],
//                 rating_scales: [
//                   {questionnaire_rating_scale_id:
//                       "demo-questionnaire-1-rating-scale-1",
//                     name: "Reactive",
//                     description:
//                       "Task Lists or Standard Jobs have only been developed for and are only used for PM's (Not Corrective or Breakdown).",
//                     value: 1,
//                   },
//                   {questionnaire_rating_scale_id:
//                       "demo-questionnaire-1-rating-scale-1",
//                     name: "Planned",
//                     description:
//                       "Task Lists are developed and used for all PM's and >50% for Corrective Rotable Work Orders PM/Corrective/ZPM6.",
//                     value: 2,
//                   },
//                   {questionnaire_rating_scale_id:
//                       "demo-questionnaire-1-rating-scale-1",
//                     name: "Proactive",
//                     description:
//                       "Task Lists are developed as required and used for all PM's and >75% for Corrective & Rotable Work Orders PM/Corrective/ZPM6.",
//                     value: 3,
//                   },
//                   {questionnaire_rating_scale_id:
//                       "demo-questionnaire-1-rating-scale-1",
//                     name: "Optimised",
//                     description:
//                       "Task Lists are developed and used for all tasks. Note - except one off tasks that will not be done again.",
//                     value: 4,
//                   },
//                 ],
//               },
//               {
//                 id: "demo-questionnaire-1-section-1-step-2-question-3",
//                 title: "Backlog and Forward Log Management",
//                 question_text:
//                   "1. Is the concept of backlog, forward log and future log understood?\n2. Does the forward log reflect the actual next available down-time condition of the equipment?\n3. How often is the backlog being managed and by whom?\n4. Is equipment criticality taken into consideration during the Planning process and workload reviews?",
//                 context:
//                   "Backlog / Forward Log Work Management\nTo enable effective loading of scheduled maintenance tasks, the Workload must be consistently updated, accurate, and include:\n• No duplicate tasks and no standing work orders\n• Resource requirements including contractors and support equipment\n• Task durations\n• Intended start date, in the future\n• Priorities set.",
//                 order: 4,
//                 applicable_roles: [
//                   shared_role_name_to_id["Maintenance Superintendent"],
//                   shared_role_name_to_id["Operations Supervisor"],
//                   shared_role_name_to_id["Maintenance Supervisor"],
//                   shared_role_name_to_id["Reliability Engineer"],
//                   shared_role_name_to_id["Maintenance Planner"],
//                   shared_role_name_to_id["Scheduler"],
//                   shared_role_name_to_id["Auditor"],
//                   shared_role_name_to_id["Maintainer"],
//                 ],
//                 rating_scales: [
//                   {questionnaire_rating_scale_id:
//                       "demo-questionnaire-1-rating-scale-1",
//                     name: "Reactive",
//                     description:
//                       "Planners and supervisors manage when time allows.",
//                     value: 1,
//                   },
//                   {questionnaire_rating_scale_id:
//                       "demo-questionnaire-1-rating-scale-1",
//                     name: "Planned",
//                     description:
//                       "Planners and supervisors are managing weekly.",
//                     value: 2,
//                   },
//                   {questionnaire_rating_scale_id:
//                       "demo-questionnaire-1-rating-scale-1",
//                     name: "Proactive",
//                     description:
//                       "Planners and supervisors are managing daily. No evidence of duplicate and outdated work orders and/or notifications.",
//                     value: 3,
//                   },
//                   {questionnaire_rating_scale_id:
//                       "demo-questionnaire-1-rating-scale-1",
//                     name: "Optimised",
//                     description:
//                       "Backlog reviewed weekly at the weekly Draft Schedule mtg. Outstanding notifications and work orders may require a group decisions to delete based on equipment criticality and safety implications.",
//                     value: 4,
//                   },
//                 ],
//               },
//             ],
//           },
//           {
//             id: "demo-questionnaire-1-section-1-step-3",
//             title: "Schedule Work",
//             order: 3,
//             questions: [
//               {
//                 id: "demo-questionnaire-1-section-1-step-3-question-1",
//                 title: "Long-Term Scheduling Horizons",
//                 question_text:
//                   "1. How far in the future is the rough-cut schedule developed and documented?\n2. Is the rough-cut schedule regularly reviewed with Operations? How far in the future?\n3. Does the rough-cut schedule take the operations schedule into account ?\n4. Are there any measures in place or reporting undertaken to ensure this process is followed?\nIs the long-term planning horizon long enough to allow for effective resource planning and an integrated maintenance and operations plan?",
//                 context:
//                   "Long Term Scheduling Time Horizons \nLong term, rough-cut schedules must be developed to assist with budgeting and co-coordinating of major maintenance shutdowns and other significant events affecting operations planning and consider:\n• Rough-cut capacity scheduling is a key element of forward log maintenance planning\n• Maintenance and operations schedules are integrated",
//                 order: 1,
//                 applicable_roles: [
//                   shared_role_name_to_id["Maintenance Superintendent"],
//                   shared_role_name_to_id["Operations Supervisor"],
//                   shared_role_name_to_id["Maintenance Supervisor"],
//                   shared_role_name_to_id["Reliability Engineer"],
//                   shared_role_name_to_id["Maintenance Planner"],
//                   shared_role_name_to_id["Scheduler"],
//                   shared_role_name_to_id["Auditor"],
//                   shared_role_name_to_id["Maintainer"],
//                 ],
//                 rating_scales: [
//                   {questionnaire_rating_scale_id:
//                       "demo-questionnaire-1-rating-scale-1",
//                     name: "Reactive",
//                     description:
//                       "Forward log rough-cut capacity planning to 6 months in the future is in place to determine resource needs.",
//                     value: 1,
//                   },
//                   {questionnaire_rating_scale_id:
//                       "demo-questionnaire-1-rating-scale-1",
//                     name: "Planned",
//                     description:
//                       "Forward log rough-cut capacity planning to 12 months in the future is in place to determine resource needs and is also reviewed with Operations.",
//                     value: 2,
//                   },
//                   {questionnaire_rating_scale_id:
//                       "demo-questionnaire-1-rating-scale-1",
//                     name: "Proactive",
//                     description:
//                       "Forward log rough-cut capacity planning to 24 months in the future is in place to determine resource needs and is also reviewed with Operations and aligned with the 12 month Operations plan.",
//                     value: 3,
//                   },
//                   {questionnaire_rating_scale_id:
//                       "demo-questionnaire-1-rating-scale-1",
//                     name: "Optimised",
//                     description:
//                       "Forward log rough-cut capacity planning to 5 years in the future is in place to determine resource needs and is also reviewed with operations. There is an integrated Maintenance and Operations plan for 24 months into the future which is regularly reviewed.",
//                     value: 4,
//                   },
//                 ],
//               },
//               {
//                 id: "demo-questionnaire-1-section-1-step-3-question-2",
//                 title: "Resource Capacity Management",
//                 question_text:
//                   "1. How are non-maintenance activities (training) managed?  Are there any standing work orders used for scheduling?\n2. Is there a formal process for forecasting and reviewing the need for additional resources?\n3. Are the work centre capacities (available man-hours) managed weekly for internal resources and alliance contractors?\n4. Is system functionality for resource tracking used to its fullest extent?",
//                 context:
//                   "Available Resources\nEffective scheduling of work requires control of resources including contractors utilising the following:\n• Leave guidelines\n• Training guidelines and/or competencies\n• Use of available system functionality (preferable),\n• Use of manual resource tracking tool\n• Alliance contractor work centres are set-up and managed",
//                 order: 2,
//                 applicable_roles: [
//                   shared_role_name_to_id["Maintenance Superintendent"],
//                   shared_role_name_to_id["Operations Supervisor"],
//                   shared_role_name_to_id["Maintenance Supervisor"],
//                   shared_role_name_to_id["Reliability Engineer"],
//                   shared_role_name_to_id["Maintenance Planner"],
//                   shared_role_name_to_id["Scheduler"],
//                   shared_role_name_to_id["Auditor"],
//                   shared_role_name_to_id["Maintainer"],
//                 ],
//                 rating_scales: [
//                   {questionnaire_rating_scale_id:
//                       "demo-questionnaire-1-rating-scale-1",
//                     name: "Reactive",
//                     description:
//                       "Scheduling for depot/P&E maintainers and limited alliance contractor scheduling.",
//                     value: 1,
//                   },
//                   {questionnaire_rating_scale_id:
//                       "demo-questionnaire-1-rating-scale-1",
//                     name: "Planned",
//                     description:
//                       "Scheduling for depot/P&E maintainers and improved contractor scheduling; Tasks are scheduled to the day and the work centre.",
//                     value: 2,
//                   },
//                   {questionnaire_rating_scale_id:
//                       "demo-questionnaire-1-rating-scale-1",
//                     name: "Proactive",
//                     description:
//                       "Scheduling for all depot/P&E maintainers, contractors, and shared equipment; Tasks are scheduled to the day, the work centre and the individual, using network functionality as required. Scheduling to the hour, not just to the day.",
//                     value: 3,
//                   },
//                   {questionnaire_rating_scale_id:
//                       "demo-questionnaire-1-rating-scale-1",
//                     name: "Optimised",
//                     description:
//                       "Scheduling for all depot/P&E maintainers, contractors, and shared equipment; Tasks are scheduled to the day, the work centre and the individual, using network functionality as required.",
//                     value: 4,
//                   },
//                 ],
//               },
//               {
//                 id: "demo-questionnaire-1-section-1-step-3-question-3",
//                 title: "Resource Loading and Utilization",
//                 question_text:
//                   "1. Are the guidelines determined and documented?  Have these been communicated and aligned with current metrics?\n2.  Does the amount of people available drive what work is scheduled, rather than what work is required drives determines how many resources are scheduled?\n3. Is work order resource planning adequate to enable scheduling of available resources?\n4. What percent of available resources are scheduled on a weekly basis?\n5. Is reporting on Resource Utilization and Use of Resource Availability reviewed regularly?",
//                 context:
//                   "Schedule Resource Loading\nSome guidelines for effective utilization of all resources must be communicated and followed and include:\n• No standing work orders used\n• Loading per person per week in hours\n• Non-maintenance activities are deducted from available hours\n• Work centre resource management\n• Review of KPI's to determine proper schedule loading",
//                 order: 3,
//                 applicable_roles: [
//                   shared_role_name_to_id["Maintenance Superintendent"],
//                   shared_role_name_to_id["Operations Supervisor"],
//                   shared_role_name_to_id["Maintenance Supervisor"],
//                   shared_role_name_to_id["Reliability Engineer"],
//                   shared_role_name_to_id["Maintenance Planner"],
//                   shared_role_name_to_id["Scheduler"],
//                   shared_role_name_to_id["Auditor"],
//                   shared_role_name_to_id["Maintainer"],
//                 ],
//                 rating_scales: [
//                   {
//                     questionnaire_rating_scale_id:
//                       "demo-questionnaire-1-rating-scale-1",
//                     name: "Reactive",
//                     description:
//                       "Guidelines and targets have been set but not used; Limited resource tracking using SAP or manual resource tracking tool e.g., Excel, Access etc. Only internal resources tracked.",
//                     value: 1,
//                   },
//                   {
//                     name: "Planned",
//                     description:
//                       "Scheduled hours are consistently below targets as established in the guidelines; Resource tracking using SAP but not always current due to changes (training, adhoc leave etc. not always being updated.",
//                     value: 2,
//                   },
//                   {
//                     name: "Proactive",
//                     description:
//                       "Scheduled hours are consistently scheduled within + or 5% of objective; Resource tracking using SAP, which is used by scheduler and generally accurate. External resources also tracked in the SAP. >80% Schedule Loading for all resources.",
//                     value: 3,
//                   },
//                   {
//                     name: "Optimised",
//                     description:
//                       "Scheduled hours are consistently scheduled within 0 or - 5% of target. There is a controlled process for increasing the scheduled resource loading percentage; Precision resource tracking using system functionality, which is used by scheduler.",
//                     value: 4,
//                   },
//                 ],
//               },
//               {
//                 id: "demo-questionnaire-1-section-1-step-3-question-4",
//                 title: "Scheduling Review Meetings",
//                 question_text:
//                   "1. Are there a regular scheduling meetings?\n2. Do the right people attend?\n3. Is the scheduling meeting agenda followed, is there a meeting chair and are minutes taken for distribution?\n4. Are improvement actions being assigned weekly? Is there an Actions Log?",
//                 context:
//                   "Scheduling Review/Lock in Meetings\nThere should be formal 'schedule' meetings.\n• Operations and maintenance sit down to discuss the proposed schedule. This is done in tandem with the operations schedule. Any active discussions regarding schedule inclusions should happen at this meeting.\n• The teams get back together to formally lock down the schedule. This discussion should be a formality and should rarely involve disagreements on the schedule inclusions. The timing of the second meeting is usually dictated by the lock-down date in the SAP.",
//                 order: 4,
//                 applicable_roles: [
//                   shared_role_name_to_id["Maintenance Superintendent"],
//                   shared_role_name_to_id["Operations Supervisor"],
//                   shared_role_name_to_id["Maintenance Supervisor"],
//                   shared_role_name_to_id["Reliability Engineer"],
//                   shared_role_name_to_id["Maintenance Planner"],
//                   shared_role_name_to_id["Scheduler"],
//                   shared_role_name_to_id["Auditor"],
//                   shared_role_name_to_id["Maintainer"],
//                 ],
//                 rating_scales: [
//                   {
//                     name: "Reactive",
//                     description:
//                       "There are formal schedule meeting agendas. They are not always followed and there are no minutes or actions logs kept. Operations are not invited. Not all required maintenance people always attend the meetings.",
//                     value: 1,
//                   },
//                   {
//                     name: "Planned",
//                     description:
//                       "Agendas are followed. Minutes and action logs are kept. Maintenance invitees always attend or send a delegate. Operations are invited but do not always attend.",
//                     value: 2,
//                   },
//                   {
//                     name: "Proactive",
//                     description:
//                       "Minutes and action logs are always updated and shared with all meeting attendees. All of the right roles from Operations and maintenance usually attend the meetings. Key KPI's, non- conformances and incomplete operations discussed.",
//                     value: 3,
//                   },
//                   {
//                     name: "Optimised",
//                     description:
//                       "All of the right roles from Operations and maintenance always attend the meetings. Managers randomly attend to demonstrate support and the importance of the meetings.",
//                     value: 4,
//                   },
//                 ],
//               },
//             ],
//           },
//           {
//             title: "Execute Work",
//             order: 4,
//             questions: [
//               {
//                 title: "Shift Handover and Communication",
//                 question_text:
//                   "1. Are critical jobs and/or tasks handled differently?\n2. Are additional faults/defects identified during the course of work not completed due to lack of communications between shifts?\n3. Are delay causes identified and relayed to oncoming crews?\n4. How well prepared are the oncoming crew members when they leave their shift start briefing?\n5. Are improvement actions captured during the shift start meetings?",
//                 context:
//                   "Daily Shift Start / Shift Handover\nTo create awareness for oncoming crews an effective handover / turnover process must be in place and address the following:\n• Participated by all relevant personnel\n• Current progress on planned work\n• Possible operations requirements during shift\n• Causes for delays, if any\n• Changes in environment / risks\n• Additional faults / defects found\n• Work packages handed out and reviewed as required",
//                 order: 1,
//                 applicable_roles: [
//                   shared_role_name_to_id["Maintenance Superintendent"],
//                   shared_role_name_to_id["Operations Supervisor"],
//                   shared_role_name_to_id["Maintenance Supervisor"],
//                   shared_role_name_to_id["Reliability Engineer"],
//                   shared_role_name_to_id["Maintenance Planner"],
//                   shared_role_name_to_id["Scheduler"],
//                   shared_role_name_to_id["Auditor"],
//                   shared_role_name_to_id["Maintainer"],
//                 ],
//                 rating_scales: [
//                   {
//                     name: "Reactive",
//                     description:
//                       "The crews gather for pre-shift briefings but all information is given verbally.\nSupervisors exchange handover information verbally.\nNo equipment or MBP KPI's are discussed.\nMajor SHE issues or events mentioned.",
//                     value: 1,
//                   },
//                   {
//                     name: "Planned",
//                     description:
//                       "Supervisors use checklists and/or shift logs & discuss scheduled, urgent  and backlog WO's.\nMaintainers are provided with Work Packs at shift start, these are not discussed in any detail.\nKPI's are discussed only when instructed by senior leader.\nRelevant SHE issues discussed.",
//                     value: 2,
//                   },
//                   {
//                     name: "Proactive",
//                     description:
//                       "Supervisors use the SAP to review all unscheduled and scheduled Work.\nAny non-routine work is discussed in detail. Standard KPI's are reviewed.\noperations issues discussed. Visual boards used and always up to date.\nSupervisors run the pre-shift briefing. Maintainers share the task of running the pre-shift briefing.",
//                     value: 3,
//                   },
//                   {
//                     name: "Optimised",
//                     description:
//                       "Innovative ways have been introduced to ensure all work is understood at the start of shift and handed over to the oncoming shift. Additional KPI's are reviewed when relevant to the team.\nMaintainers share the task of running the pre-shift briefing.",
//                     value: 4,
//                   },
//                 ],
//               },
//               {
//                 title: "Equipment Handover and Release",
//                 question_text:
//                   "1. Does the operator have the ability to refuse acceptance of  equipment?\n2. Does Operations often insist on equipment release prior to completion of maintenance activities?\n3. How often does equipment fail shortly after a maintenance intervention?\n4. Is there timely operator acceptance of equipment?",
//                 context:
//                   "Equipment Handover & Release\nFormal procedure for interaction between maintainer and operator at equipment exchange (shut down and release) and incorporate the following:\n• Actions required or taken\n• Permits & isolation concerns\n• Status / condition of equipment\n• Equipment / functional testing after maintenance\n• Timely acceptance by operator(s) upon release\n• All tests, clean-up, demob, parts & repairables returned.",
//                 order: 2,
//                 applicable_roles: [
//                   shared_role_name_to_id["Maintenance Superintendent"],
//                   shared_role_name_to_id["Operations Supervisor"],
//                   shared_role_name_to_id["Maintenance Supervisor"],
//                   shared_role_name_to_id["Reliability Engineer"],
//                   shared_role_name_to_id["Maintenance Planner"],
//                   shared_role_name_to_id["Scheduler"],
//                   shared_role_name_to_id["Auditor"],
//                   shared_role_name_to_id["Maintainer"],
//                 ],
//                 rating_scales: [
//                   {
//                     name: "Reactive",
//                     description:
//                       "Formal handover process  in place but not followed.\nEquipment often not ready for maintainers.",
//                     value: 1,
//                   },
//                   {
//                     name: "Planned",
//                     description:
//                       "Formal handover process in use for receiving and delivery of equipment and is mostly followed. \nCould use more detailed acceptance criteria.\nEquipment mostly ready for maintainers.",
//                     value: 2,
//                   },
//                   {
//                     name: "Proactive",
//                     description:
//                       "Formal handover process is always followed.\nIncludes sufficiently detailed procedures for acceptance and/or non-acceptance.\nEquipment always ready for maintainers.",
//                     value: 3,
//                   },
//                   {
//                     name: "Optimised",
//                     description:
//                       "Formal sign-off is provided by both operations and maintenance.",
//                     value: 4,
//                   },
//                 ],
//               },
//               {
//                 title: "Schedule Adherence and Break-in Work",
//                 question_text:
//                   "1. How often does the scheduled work get stopped to perform non-routine work?\n2. How are decisions being made as to what scheduled work gets stopped and by whom?\n3. Is break-in work being monitored and reviewed to ensure that it is truly urgent work?",
//                 context:
//                   "Urgent or Unscheduled Work\nPriority should be given to performing scheduled work and schedule interruptions must be managed and based on interactions between maintenance and operations.",
//                 order: 3,
//                 applicable_roles: [
//                   shared_role_name_to_id["Maintenance Superintendent"],
//                   shared_role_name_to_id["Operations Supervisor"],
//                   shared_role_name_to_id["Maintenance Supervisor"],
//                   shared_role_name_to_id["Reliability Engineer"],
//                   shared_role_name_to_id["Maintenance Planner"],
//                   shared_role_name_to_id["Scheduler"],
//                   shared_role_name_to_id["Auditor"],
//                   shared_role_name_to_id["Maintainer"],
//                 ],
//                 rating_scales: [
//                   {
//                     name: "Reactive",
//                     description:
//                       "There is no formal process in place but there is a balance between urgent and scheduled work. PM or Breakdown work is not specifically prioritized.",
//                     value: 1,
//                   },
//                   {
//                     name: "Planned",
//                     description:
//                       "Urgent work rarely delays scheduled work. Formal process in place and usually followed. Decisions are made by Operations Supervisors or Maintainers. Breakdown schedule compliance is > 75% Overall schedule compliance is <85%.",
//                     value: 2,
//                   },
//                   {
//                     name: "Proactive",
//                     description:
//                       "The Maintenance Supervisor decides when the schedule can be interrupted. Formal process is followed with steps to escalate the level of authority or expertise involved in decision making regarding schedule interruption as req. Breakdown schedule compliance >95% Overall schedule compliance >85%.",
//                     value: 3,
//                   },
//                   {
//                     name: "Optimised",
//                     description:
//                       "Breakdown schedule compliance is always 100% Overall schedule compliance >95%.",
//                     value: 4,
//                   },
//                 ],
//               },
//               {
//                 title: "Supervisory Floor Presence",
//                 question_text:
//                   "1. How often does the supervisor visit tasks during execution?\n2. What questions are asked during these visits?\n3. Does the supervisor seek out problems and contribute to the solutions?\n4. Does supervisor communicate his findings with crews to avoid repetition of failures?",
//                 context:
//                   "Floor tours\nTo monitor work execution activities and provide feedback on progress and quality of work\n• SHE is observed, questioned and corrected\n• Work quality interaction\n• Delays recorded\n• Actions & contingencies listed\n• Improvement opportunities identified.",
//                 order: 4,
//                 applicable_roles: [
//                   shared_role_name_to_id["Maintenance Superintendent"],
//                   shared_role_name_to_id["Operations Supervisor"],
//                   shared_role_name_to_id["Maintenance Supervisor"],
//                   shared_role_name_to_id["Reliability Engineer"],
//                   shared_role_name_to_id["Maintenance Planner"],
//                   shared_role_name_to_id["Scheduler"],
//                   shared_role_name_to_id["Auditor"],
//                   shared_role_name_to_id["Maintainer"],
//                 ],
//                 rating_scales: [
//                   {
//                     name: "Reactive",
//                     description:
//                       "Expectations are not set, supervisors not visbile in field",
//                     value: 1,
//                   },
//                   {
//                     name: "Planned",
//                     description:
//                       "Supervisor spends visible time in field.  SHE issues are addressed",
//                     value: 2,
//                   },
//                   {
//                     name: "Proactive",
//                     description: "Supervisor spends visible time in field.",
//                     value: 3,
//                   },
//                   {
//                     name: "Optimised",
//                     description:
//                       "Supervisor hits time in field targets.  Engagement with maintainers and clear communication of failures/problems form crew are raised and resolved.\nAutonomy exsists within the crew.",
//                     value: 4,
//                   },
//                 ],
//               },
//             ],
//           },
//           {
//             title: "Work Order Completion Training",
//             order: 5,
//             questions: [
//               {
//                 title: "Question 33",
//                 question_text:
//                   "1. Have maintainers received Work Order Completion training?\n2. Do maintainers understand the importance of capturing work order history?\n3. Have alliance contractors  received Work Order Completion Awareness training?\n4. How are new employees being trained in Work Order Completion?",
//                 context:
//                   "Work Order Completion & Confirmation Training\n• Company training should be formally provided to new employees and any necessary contractors, and if necessary refreshed annually \n• Online training material is readily available and linked to the relevant sections of the WMP.",
//                 order: 1,
//                 applicable_roles: [
//                   shared_role_name_to_id["Maintenance Superintendent"],
//                   shared_role_name_to_id["Operations Supervisor"],
//                   shared_role_name_to_id["Maintenance Supervisor"],
//                   shared_role_name_to_id["Reliability Engineer"],
//                   shared_role_name_to_id["Maintenance Planner"],
//                   shared_role_name_to_id["Scheduler"],
//                   shared_role_name_to_id["Auditor"],
//                   shared_role_name_to_id["Maintainer"],
//                 ],
//                 rating_scales: [
//                   {
//                     name: "Reactive",
//                     description:
//                       "Training is available, but not part of an integrated AM training program.",
//                     value: 1,
//                   },
//                   {
//                     name: "Planned",
//                     description:
//                       "Training is part of an integrated AM training program with refresher and new hire training reasonably well documented and current for >75% of the teams using the SAP.",
//                     value: 2,
//                   },
//                   {
//                     name: "Proactive",
//                     description:
//                       "Refresher and new hire training is current and documented for >90% of team the teams using the SAP.",
//                     value: 3,
//                   },
//                   {
//                     name: "Optimised",
//                     description:
//                       "Further On the Job Training is used with focus on quality and accurate information.",
//                     value: 4,
//                   },
//                 ],
//               },
//               {
//                 title: "Work History Documentation",
//                 question_text:
//                   "1. What quality of information is being captured onto work history, and feedback / coaching provided to maintainers?\n2. Does the information get captured into the SAP? How?\n3. Do RE's use available data for analysis?\n4. What percentage of maintenance work orders have history included when Techo'd?",
//                 context:
//                   "Record Maintenance History\nFor continuous analysis of failures, the feedback from maintainers into SAP is critical and must include:\n• Detailed information on work execution\n• Failure modes, causes, parts used and delays recorded    \n• Actual time worked (tool-time)",
//                 order: 2,
//                 applicable_roles: [
//                   shared_role_name_to_id["Maintenance Superintendent"],
//                   shared_role_name_to_id["Operations Supervisor"],
//                   shared_role_name_to_id["Maintenance Supervisor"],
//                   shared_role_name_to_id["Reliability Engineer"],
//                   shared_role_name_to_id["Maintenance Planner"],
//                   shared_role_name_to_id["Scheduler"],
//                   shared_role_name_to_id["Auditor"],
//                   shared_role_name_to_id["Maintainer"],
//                 ],
//                 rating_scales: [
//                   {
//                     name: "Reactive",
//                     description:
//                       "Failure codes information is captured (Damage, Delay, Cause etc.).\nRarely are task improvements fed back - not always actioned.",
//                     value: 1,
//                   },
//                   {
//                     name: "Planned",
//                     description:
//                       "History (long text) high quality, failure mode & root cause descriptions easily understood,\nSome task improvement feedback - always actioned.\nWork Pack completion is reviewed by Supv prior to TECO’ing WOs for quality. \nMeasuring points always updated.",
//                     value: 2,
//                   },
//                   {
//                     name: "Proactive",
//                     description:
//                       "Work Performed (long text) history is detailed with all required measurements included prompting regular Asset Tactics improvement. \nRegular task improvement feedback via Notifications & actioned within 28 days.",
//                     value: 3,
//                   },
//                   {
//                     name: "Optimised",
//                     description:
//                       "A process is in place to ensure work history requirements will facilitate reliability-based historical analysis..\nNotifications actioned within 7 days.",
//                     value: 4,
//                   },
//                 ],
//               },
//               {
//                 title: "Time Confirmation and Accuracy",
//                 question_text:
//                   "1. What is the variance between Planned vs. Actual being reported?\n2. Are maintainers aware of the importance of capturing accurate times to work orders?\n3. Does a time and attendance process drive a behaviour of capturing incorrect actual times to work orders?\n4. Is there a process for optimising task lists or standard jobs based on actual times historical information?",
//                 context:
//                   "Time Confirmation\nThe accurate capturing of time actually worked is critical. This will allow for:\n• The optimisation of planned labour hours on future tasks\n• The correct labour cost allocation to work performed\n• Must include delay times e.g.: waiting for parts etc.\n• Timecard confirmation review process in place.",
//                 order: 3,
//                 applicable_roles: [
//                   shared_role_name_to_id["Maintenance Superintendent"],
//                   shared_role_name_to_id["Operations Supervisor"],
//                   shared_role_name_to_id["Maintenance Supervisor"],
//                   shared_role_name_to_id["Reliability Engineer"],
//                   shared_role_name_to_id["Maintenance Planner"],
//                   shared_role_name_to_id["Scheduler"],
//                   shared_role_name_to_id["Auditor"],
//                   shared_role_name_to_id["Maintainer"],
//                 ],
//                 rating_scales: [
//                   {
//                     name: "Reactive",
//                     description:
//                       "Maintainers know how to Time Confirm. Maintainer Labour hours are accurately captured on >50% of the work order / operation / tasks. Supervisors completing all Time Confirmation.",
//                     value: 1,
//                   },
//                   {
//                     name: "Planned",
//                     description:
//                       "Maintainer Labour hours accurately captured on all work order / operation / tasks in the SAP. Confirming time on multiple work orders within 3 days of work completion. Maintainers completing all Time Confirmation to the correct operation.",
//                     value: 2,
//                   },
//                   {
//                     name: "Proactive",
//                     description:
//                       "Maintainer and Contractor Labour hours are captured on all work order / operation / tasks in the SAP. Confirming tool-time within 1 day of work completion. Supervisor reviewing a sample of time confirmations to confirm Plan vs Actual hrs.",
//                     value: 3,
//                   },
//                   {
//                     name: "Optimised",
//                     description:
//                       "Performance against planned hours is monitored and managed. Confirming tool-time same day of completion. Alliance contractors completing Time Confirmation with Supervisor checking.",
//                     value: 4,
//                   },
//                 ],
//               },
//               {
//                 title: "Work Order Closure Timeliness",
//                 question_text:
//                   "1. How much variance in performance data based on delayed closing of work orders?\n2. Are maintainers aware of the consequence of delayed closing on performance metrics?\n3. Do supervisors use the metrics to drive behaviour change in closing or work orders?\n4. SAP-sites question: How many jobs are TECO'ed with zero (0) hours?",
//                 context:
//                   "Closing Work Orders\nThe Closing / confirming process is a critical step in WMP performance metrics and must be done in a timely manner.",
//                 order: 4,
//                 applicable_roles: [
//                   shared_role_name_to_id["Maintenance Superintendent"],
//                   shared_role_name_to_id["Operations Supervisor"],
//                   shared_role_name_to_id["Maintenance Supervisor"],
//                   shared_role_name_to_id["Reliability Engineer"],
//                   shared_role_name_to_id["Maintenance Planner"],
//                   shared_role_name_to_id["Scheduler"],
//                   shared_role_name_to_id["Auditor"],
//                   shared_role_name_to_id["Maintainer"],
//                 ],
//                 rating_scales: [
//                   {
//                     name: "Reactive",
//                     description:
//                       "Process in place for confirming or closing of WO's but not always followed. Some Work Package completion is quality reviewed by Supervisors prior to TECO’ing WO. Subsequent Notifications not always raised.",
//                     value: 1,
//                   },
//                   {
//                     name: "Planned",
//                     description:
//                       "The process is followed and confirmation / closing is carried out within the committed week. Most Work Package completion is quality reviewed by Supervisors prior to TECO’ing WO.",
//                     value: 2,
//                   },
//                   {
//                     name: "Proactive",
//                     description:
//                       "Majority of work orders are TECO’ed within 24hrs of work completion. All Work Package completion is quality reviewed by Supervisors prior to TECO’ing WO. Subsequent Notifications always raised, and raised correctly.",
//                     value: 3,
//                   },
//                   {
//                     name: "Optimised",
//                     description:
//                       "All of work orders are TECO’ed the same shift as work completion. Work Package completion KPI's published and discussed with teams.",
//                     value: 4,
//                   },
//                 ],
//               },
//             ],
//           },
//           {
//             title: "Analyse Work",
//             order: 6,
//             questions: [
//               {
//                 title: "Weekly Performance Review Meetings",
//                 question_text:
//                   "1. Is the schedule (spreadsheet, Gantt chart, etc.) referred to during the review?\n2. Is Maintenance & operations related delays/losses discussed?\n3. Is action item list up to date with names & dates?\n4. Are actions completed in a timely manner?",
//                 context:
//                   "Meetings - Weekly Review\nWeekly plans, schedules and metrics reviewed to identify potential improvement opportunities.\n• Participation from both maintenance, operations and service departments such as Warehouse\n• Agenda followed and minuted\n• Identify what went well\n• Identify what did not go well - potential improvements\n• Identify what can be done to prevent recurrence of non-conformance.",
//                 order: 1,
//                 applicable_roles: [
//                   shared_role_name_to_id["Maintenance Superintendent"],
//                   shared_role_name_to_id["Operations Supervisor"],
//                   shared_role_name_to_id["Maintenance Supervisor"],
//                   shared_role_name_to_id["Reliability Engineer"],
//                   shared_role_name_to_id["Maintenance Planner"],
//                   shared_role_name_to_id["Scheduler"],
//                   shared_role_name_to_id["Auditor"],
//                   shared_role_name_to_id["Maintainer"],
//                 ],
//                 rating_scales: [
//                   {
//                     name: "Reactive",
//                     description:
//                       "Ad-hoc informal meeting takes place but focusses on Urgent work.",
//                     value: 1,
//                   },
//                   {
//                     name: "Planned",
//                     description:
//                       "Plans and schedules are subject to a post execution review at the Weekly Review Meeting. Focus is on Standard Metrics.",
//                     value: 2,
//                   },
//                   {
//                     name: "Proactive",
//                     description:
//                       "Failure to meet targets is analysed, specific causes identified and action plans implemented with owners allocated for each action. >80% of actions closed out each week.",
//                     value: 3,
//                   },
//                   {
//                     name: "Optimised",
//                     description:
//                       "All potential WMP system improvements are raised formally with the Asset Management team for action.",
//                     value: 4,
//                   },
//                 ],
//               },
//               {
//                 title: "Daily 24-Hour Work Review Process",
//                 question_text:
//                   "1. Work order completion is reviewed? Do maintainers attend these sessions?\n2. At the 24 hr review, is the following done: Any PM not scheduled needs to be questioned. Any Corrective needs to be questioned. Did it need to be done straight away or could it have been scheduled?\nIs the failure mode captured in the equipment PM?\nIf Yes, Do we need to complete an RCA, PMO on the strategy applied? Is there an action plan?\n3. Is action item list up to date with names & dates?\n4. Are actions completed in a timely manner?",
//                 context:
//                   "Meetings - 24-hour daily review\nDaily Review to identify potential improvement opportunities\n• Agenda followed and minuted\n• Identify what went well\n• Identify what did not go well\n• Identify what can be done to prevent recurrence of non-conformances\n• Discuss any  Notifications raised or whether or not a Noti is required for something",
//                 order: 2,
//                 applicable_roles: [
//                   shared_role_name_to_id["Maintenance Superintendent"],
//                   shared_role_name_to_id["Operations Supervisor"],
//                   shared_role_name_to_id["Maintenance Supervisor"],
//                   shared_role_name_to_id["Reliability Engineer"],
//                   shared_role_name_to_id["Maintenance Planner"],
//                   shared_role_name_to_id["Scheduler"],
//                   shared_role_name_to_id["Auditor"],
//                   shared_role_name_to_id["Maintainer"],
//                 ],
//                 rating_scales: [
//                   {
//                     name: "Reactive",
//                     description:
//                       "A review takes place and only focuses on breakdowns. There is no agenda. The need for improvements to Tactics and Work Packs not discussed.",
//                     value: 1,
//                   },
//                   {
//                     name: "Planned",
//                     description:
//                       "Work order completion is reviewed in morning meetings, with an agenda and action plan produced. The review is done at the daily KPI board and focusses on schedule non- conformances. People trust the KPI's are an accurate reflection.",
//                     value: 2,
//                   },
//                   {
//                     name: "Proactive",
//                     description:
//                       "The team discuss the need for Tactics reviews or RCA's as a result of the previous 24hrs equipment, operations and work management performance.  Notifications are raised properly if required.",
//                     value: 3,
//                   },
//                   {
//                     name: "Optimised",
//                     description:
//                       "Management provides support to ensure action plan is effective. This support structure is clearly defined and understood by all.",
//                     value: 4,
//                   },
//                 ],
//               },
//               {
//                 title: "KPI Visibility and Understanding",
//                 question_text:
//                   "1. Are metrics posted and up to date?\n2. Are metrics understood by all?\n- Are appropriate metrics in place to measure effectiveness of the work management process?\n- Are the metrics accessible to all relevant personnel and stakeholders?\n- Are metrics posted and up to date?\n- Do the metrics include quality and cost performance?\n3. Are new metrics being rolled out on a regular basis?",
//                 context:
//                   "KPI data\nAppropriate metrics must be in place to measure effectiveness of process:\n• Metrics developed \n• Posted in appropriate work areas\n• Utilised to drive behaviour change\n• Review of overdue statutory requirements",
//                 order: 3,
//                 applicable_roles: [
//                   shared_role_name_to_id["Maintenance Superintendent"],
//                   shared_role_name_to_id["Operations Supervisor"],
//                   shared_role_name_to_id["Maintenance Supervisor"],
//                   shared_role_name_to_id["Reliability Engineer"],
//                   shared_role_name_to_id["Maintenance Planner"],
//                   shared_role_name_to_id["Scheduler"],
//                   shared_role_name_to_id["Auditor"],
//                   shared_role_name_to_id["Maintainer"],
//                 ],
//                 rating_scales: [
//                   {
//                     name: "Planned",
//                     description:
//                       "KPIs are clearly understood and communicated. Maintenance team have a weekly KPI discussion.",
//                     value: 2,
//                   },
//                   {
//                     name: "Proactive",
//                     description:
//                       "Management decisions are made based on KPI performance. The KPI system is easily accessible by maintainers and influences daily work execution.",
//                     value: 3,
//                   },
//                   {
//                     name: "Optimised",
//                     description:
//                       "Reliability team analyse KPIs and feed this into DE activities, tactics development activities. Asset Management Metrics and area KPI's are reviewed with all personnel.",
//                     value: 4,
//                   },
//                 ],
//               },
//               {
//                 title: "Reliability Integration and Feedback",
//                 question_text:
//                   "1. How is repetitive failures reported to the Reliability Group?\n2. Does the Reliability group have access to the KPI's and WM system?\n3. Where are all the reported findings /  recommendation captured - are the teams using Notifications?\n4. How does the information get reported back to the maintenance teams?",
//                 context:
//                   "Work Management Feedback to / Inclusion of Reliability Group\nInteraction between the WMP and the Reliability Processes (Defect Elimination & Asset Strategy & Tactics) is crucial and must include:\n• Loss Analysis data\n• Repetitive failures occurrences (chronic/systemic)\n• Changes in Tactics\n• Changes in operating conditions\n• Improvements or recommendations\n• Cost over-runs",
//                 order: 4,
//                 applicable_roles: [
//                   shared_role_name_to_id["Maintenance Superintendent"],
//                   shared_role_name_to_id["Operations Supervisor"],
//                   shared_role_name_to_id["Maintenance Supervisor"],
//                   shared_role_name_to_id["Reliability Engineer"],
//                   shared_role_name_to_id["Maintenance Planner"],
//                   shared_role_name_to_id["Scheduler"],
//                   shared_role_name_to_id["Auditor"],
//                   shared_role_name_to_id["Maintainer"],
//                 ],
//                 rating_scales: [
//                   {
//                     name: "Reactive",
//                     description:
//                       "Process consists of informal discussions with very little feedback to the maintenance team.",
//                     value: 1,
//                   },
//                   {
//                     name: "Planned",
//                     description:
//                       "Process consists of informal discussions which are not always recorded. Some feedback on critical equipment and incidents takes place.  Notifications sometimes raised.",
//                     value: 2,
//                   },
//                   {
//                     name: "Proactive",
//                     description:
//                       "Process consists of formal discussions which are recorded via meeting minutes.Notifications raised as required and resultant ATD (Asset Tactics Development) and reviews are conducted on Critical systems or equipment.",
//                     value: 3,
//                   },
//                   {
//                     name: "Optimised",
//                     description:
//                       "Reported findings become part of the DE process and the drumbeat ATD process on all systems and equipment.",
//                     value: 4,
//                   },
//                 ],
//               },
//             ],
//           },
//         ],
//       },
//       // {
//       //   title: "Defect Elimination",
//       //   order: 2,
//       //   steps: [
//       //     {
//       //       title: "Identify Losses",
//       //       order: 1,
//       //       questions: [
//       //         {
//       //           title: "Operational Loss Monitoring Systems",
//       //           question_text:
//       //             "1. Is there an automated system to capture Operation loss,\n2. Is the system covering all areas of Operation,\n3. Are failure modes and causes captured?",
//       //           context:
//       //             "Operation Loss Monitoring\nA process exists to capture Operation losses and equipment downtime / delays",
//       //           order: 1,
//       //           applicable_roles: [
//       //             shared_role_name_to_id["Maintenance Superintendent"],
//       //             shared_role_name_to_id["Operations Supervisor"],
//       //             shared_role_name_to_id["Maintenance Supervisor"],
//       //             shared_role_name_to_id["Reliability Engineer"],
//       //             shared_role_name_to_id["Maintenance Planner"],
//       //             shared_role_name_to_id["Scheduler"],
//       //             shared_role_name_to_id["Auditor"],
//       //             shared_role_name_to_id["Maintainer"],
//       //           ],
//       //           rating_scales: [
//       //             {
//       //               name: "Reactive",
//       //               description:
//       //                 "Process to capture Operation losses is not clear. Operation losses and delays are captured inconsistently are reported word of mouth or on timecards or shift logs for entry into a database.",
//       //               value: 1,
//       //             },
//       //             {
//       //               name: "Planned",
//       //               description:
//       //                 "Operation losses and delays are captured using an automated system, but data is not always accurate or easily accessible for data analysis.",
//       //               value: 2,
//       //             },
//       //             {
//       //               name: "Proactive",
//       //               description:
//       //                 "Operation losses and delays are captured using an automated system and the data is always accurate and easily accessible for data analysis. Close to 80% of maintenance related Operation losses have an associated workorder in the\nSAP (or AMS)",
//       //               value: 3,
//       //             },
//       //             {
//       //               name: "Optimised",
//       //               description:
//       //                 "Operation losses and delays are captured using an automated system and the data is always accurate and easily accessible for data analysis. Close to 95% of maintenance related Operation losses have an associated workorder in the\nSAP (or AMS).",
//       //               value: 4,
//       //             },
//       //           ],
//       //         },
//       //         {
//       //           title: "Data Sources for Defect Identification",
//       //           question_text:
//       //             "1. Are all Operation areas accounted for?\n2. Are all sources utilised?\n3. What data sources are used?\n4. What are the DE data sources in use at site?",
//       //           context:
//       //             "Data Sources for Defect Identification\nDefects are identified through the analysis of various sources of data. \nPotential data sources include:\n• Operation Performance data\n• Maintenance History / Work Order data\n• Logbook data\n• Visual Work Place.",
//       //           order: 2,
//       //           applicable_roles: [
//       //             shared_role_name_to_id["Maintenance Superintendent"],
//       //             shared_role_name_to_id["Operations Supervisor"],
//       //             shared_role_name_to_id["Maintenance Supervisor"],
//       //             shared_role_name_to_id["Reliability Engineer"],
//       //             shared_role_name_to_id["Maintenance Planner"],
//       //             shared_role_name_to_id["Scheduler"],
//       //             shared_role_name_to_id["Auditor"],
//       //             shared_role_name_to_id["Maintainer"],
//       //           ],
//       //           rating_scales: [
//       //             {
//       //               name: "Reactive",
//       //               description:
//       //                 "No clear process for identifying defects. Defects are identified ad hoc mostly from gut feel.",
//       //               value: 1,
//       //             },
//       //             {
//       //               name: "Planned",
//       //               description:
//       //                 "Defects identified through data analysis of one key source.",
//       //               value: 2,
//       //             },
//       //             {
//       //               name: "Proactive",
//       //               description:
//       //                 "Defects identified through data analysis of several key sources.",
//       //               value: 3,
//       //             },
//       //             {
//       //               name: "Optimised",
//       //               description:
//       //                 "Defects identified through data analysis of all key sources for all Operation processes.",
//       //               value: 4,
//       //             },
//       //           ],
//       //         },
//       //         {
//       //           title: "Defect Identification Through Observations",
//       //           question_text:
//       //             "1. Are observations made by technicians, maintainers and operators used to identify defects during execution of work?",
//       //           context:
//       //             "Observations Leading to Defect Identification\nA process is in place to capture defects through observations and escalate into DE process (as appropriate)\nSources of observation data:\n• Direct observation\n• Interviews\n• Safety interactions\n• Floor Tours / Task Analysis.",
//       //           order: 3,
//       //           applicable_roles: [
//       //             shared_role_name_to_id["Maintenance Superintendent"],
//       //             shared_role_name_to_id["Operations Supervisor"],
//       //             shared_role_name_to_id["Maintenance Supervisor"],
//       //             shared_role_name_to_id["Reliability Engineer"],
//       //             shared_role_name_to_id["Maintenance Planner"],
//       //             shared_role_name_to_id["Scheduler"],
//       //             shared_role_name_to_id["Auditor"],
//       //             shared_role_name_to_id["Maintainer"],
//       //           ],
//       //           rating_scales: [
//       //             {
//       //               name: "Reactive",
//       //               description:
//       //                 "No clear process in place to capture defects through observations. Defects from observations are identified through various sources but  not captured in a central location.",
//       //               value: 1,
//       //             },
//       //             {
//       //               name: "Planned",
//       //               description:
//       //                 "Most defects from observations are captured in a central location.",
//       //               value: 2,
//       //             },
//       //             {
//       //               name: "Proactive",
//       //               description:
//       //                 "All defects from observations are captured in a central location.",
//       //               value: 3,
//       //             },
//       //             {
//       //               name: "Optimised",
//       //               description:
//       //                 "Defects through observations are captured on a defect register",
//       //               value: 4,
//       //             },
//       //           ],
//       //         },
//       //         {
//       //           title: "Incident Investigation for Defect Identification",
//       //           question_text:
//       //             "1. Are defects identified using incident reports?\n2. What RCA tools are used in incident investigation?\n3. How are defects captured from your SHE system transferred to the defect register?",
//       //           context:
//       //             "Incident Investigations\nA process exists to capture defects identified by incident investigations.",
//       //           order: 4,
//       //           applicable_roles: [
//       //             shared_role_name_to_id["Maintenance Superintendent"],
//       //             shared_role_name_to_id["Operations Supervisor"],
//       //             shared_role_name_to_id["Maintenance Supervisor"],
//       //             shared_role_name_to_id["Reliability Engineer"],
//       //             shared_role_name_to_id["Maintenance Planner"],
//       //             shared_role_name_to_id["Scheduler"],
//       //             shared_role_name_to_id["Auditor"],
//       //             shared_role_name_to_id["Maintainer"],
//       //           ],
//       //           rating_scales: [
//       //             {
//       //               name: "Reactive",
//       //               description:
//       //                 "There is no clear progress or an informal process to capture defects through incidents.",
//       //               value: 1,
//       //             },
//       //             {
//       //               name: "Planned",
//       //               description:
//       //                 "Defects for incidents are captured in a central location for review.",
//       //               value: 2,
//       //             },
//       //             {
//       //               name: "Proactive",
//       //               description:
//       //                 "Defects from incidents are captured in the central defect register. Cross- functional teams are used to identify the root cause(s) and required corrective actions for all major incidents.",
//       //               value: 3,
//       //             },
//       //             {
//       //               name: "Optimised",
//       //               description:
//       //                 "Defects from incidents are captured in the central defect register. Cross- functional teams are used to identify the root cause(s) and required corrective actions for all major incidents.\nSound reliability engineering judgement is applied in all cases, ensuring that the corrective actions are based on data\nand facts.",
//       //               value: 4,
//       //             },
//       //           ],
//       //         },
//       //       ],
//       //     },
//       //     {
//       //       title: "Assess & Prioritise Defects",
//       //       order: 2,
//       //       questions: [
//       //         {
//       //           title: "Defect Assessment and Prioritization",
//       //           question_text:
//       //             "1. Does the Defect Register identify the value of each potential defect in monetary terms?\n2. What models/processes are applied to assessing/prioritising defects?\n3. Do you have triggers that require the site to automatically commence an RCA?\n4. Is Safety, Health, and Environment (SHE) considered?\n5. Is reputation considered?",
//       //           context:
//       //             "Assess and Prioritise Defects\nDefects are assessed and prioritised by quantifying the risk and value of eliminating the defect.\nEstimates must be made for the following factors:\n• Value of eliminating the defect\n• Risk the defect poses to the business\n• Difficulty in eliminating the defect\n• Cost to eliminate defect.",
//       //           order: 1,
//       //           applicable_roles: [
//       //             shared_role_name_to_id["Maintenance Superintendent"],
//       //             shared_role_name_to_id["Operations Supervisor"],
//       //             shared_role_name_to_id["Maintenance Supervisor"],
//       //             shared_role_name_to_id["Reliability Engineer"],
//       //             shared_role_name_to_id["Maintenance Planner"],
//       //             shared_role_name_to_id["Scheduler"],
//       //             shared_role_name_to_id["Auditor"],
//       //             shared_role_name_to_id["Maintainer"],
//       //           ],
//       //           rating_scales: [
//       //             {
//       //               name: "Reactive",
//       //               description: "lassifying",
//       //               value: 1,
//       //             },
//       //             {
//       //               name: "Planned",
//       //               description:
//       //                 "Defect are assessed based on some of the factors listed but not all.",
//       //               value: 2,
//       //             },
//       //             {
//       //               name: "Proactive",
//       //               description:
//       //                 "Defects are prioritized using a approved Company risk/value matrix.",
//       //               value: 3,
//       //             },
//       //             {
//       //               name: "Optimised",
//       //               description:
//       //                 "Proactive Defect Elemination - Protential Defects are prioritized using a approved Company risk/value matrix.",
//       //               value: 4,
//       //             },
//       //           ],
//       //         },
//       //         {
//       //           title: "Defect Register Scope and Integration",
//       //           question_text:
//       //             "Does the Defect Register include other business improvement initiatives?",
//       //           context:
//       //             "Defect Register\nA Defect Register is used to capture all potential defect projects. This facilitates the prioritisation of defects and the effective allocation of resources.",
//       //           order: 2,
//       //           applicable_roles: [
//       //             shared_role_name_to_id["Maintenance Superintendent"],
//       //             shared_role_name_to_id["Operations Supervisor"],
//       //             shared_role_name_to_id["Maintenance Supervisor"],
//       //             shared_role_name_to_id["Reliability Engineer"],
//       //             shared_role_name_to_id["Maintenance Planner"],
//       //             shared_role_name_to_id["Scheduler"],
//       //             shared_role_name_to_id["Auditor"],
//       //             shared_role_name_to_id["Maintainer"],
//       //           ],
//       //           rating_scales: [
//       //             {
//       //               name: "Reactive",
//       //               description:
//       //                 "The defect register does not exist or is an informal and uncontrolled document.",
//       //               value: 1,
//       //             },
//       //             {
//       //               name: "Planned",
//       //               description:
//       //                 "A formal defect register is setup but does not include all potential projects.",
//       //               value: 2,
//       //             },
//       //             {
//       //               name: "Proactive",
//       //               description:
//       //                 "The central defect register is established and aligned with the current Reliability Improvement system.",
//       //               value: 3,
//       //             },
//       //             {
//       //               name: "Optimised",
//       //               description:
//       //                 "The central defect register is established and is fully  integrated with the current Business  Improvement system.",
//       //               value: 4,
//       //             },
//       //           ],
//       //         },
//       //         {
//       //           title: "Analysis Process Selection and Triggers",
//       //           question_text:
//       //             "1. Are  triggers defined/documented for various levels of loss analysis, depending on the severity/impact of the loss?\n2. Is a formalised process implemented for front- line personnel to conduct basic RCA's (e.g. 5- why, etc.)?\n3. Is a formalised process implemented for Reliability engineers or maintenance/ops specialists to conduct more complex RCAs for significant/complex losses?\n4. Are complex RCA's are managed as projects?\n5. Is a formalised process implemented for Reliability engineers or maintenance/ops specialists to conduct an annual/bi-annual review of significant business losses or accumulating losses not picked up at individual loss event?",
//       //           context:
//       //             'Selection of Process\nA decision is made as to whether a team-based approach is necessary or if the defect can be assigned to an individual to "just do it". \nThere are agreed triggers to initiate the defect elimination process',
//       //           order: 3,
//       //           applicable_roles: [
//       //             shared_role_name_to_id["Maintenance Superintendent"],
//       //             shared_role_name_to_id["Operations Supervisor"],
//       //             shared_role_name_to_id["Maintenance Supervisor"],
//       //             shared_role_name_to_id["Reliability Engineer"],
//       //             shared_role_name_to_id["Maintenance Planner"],
//       //             shared_role_name_to_id["Scheduler"],
//       //             shared_role_name_to_id["Auditor"],
//       //             shared_role_name_to_id["Maintainer"],
//       //           ],
//       //           rating_scales: [
//       //             {
//       //               name: "Reactive",
//       //               description:
//       //                 "Ad-hoc with no specific process for methodology selection.\nNo or Informal criteria used at DE Management Team meetings.\nDepends on who is at the meeting.",
//       //               value: 1,
//       //             },
//       //             {
//       //               name: "Planned",
//       //               description:
//       //                 "Formal criteria exists but not always followed by the DE Management Team.\nDoes not align with existing business processes.",
//       //               value: 2,
//       //             },
//       //             {
//       //               name: "Proactive",
//       //               description:
//       //                 "Formal criteria always followed by the DE Management Team.\nAligns with existing business processes.",
//       //               value: 3,
//       //             },
//       //             {
//       //               name: "Optimised",
//       //               description:
//       //                 "Formal criteria always followed by the DE Management Team. Intetgrated with existing business processes.",
//       //               value: 4,
//       //             },
//       //           ],
//       //         },
//       //         {
//       //           title: "DE Team Selection and Resourcing",
//       //           question_text:
//       //             "Is there attendance at Defect Elimination team meetings?",
//       //           context:
//       //             "DE Team Selection.\nTeams are selected to work on Defect Elimination projects. The DE Management team must ensure the team is sufficiently resourced.",
//       //           order: 4,
//       //           applicable_roles: [
//       //             shared_role_name_to_id["Maintenance Superintendent"],
//       //             shared_role_name_to_id["Operations Supervisor"],
//       //             shared_role_name_to_id["Maintenance Supervisor"],
//       //             shared_role_name_to_id["Reliability Engineer"],
//       //             shared_role_name_to_id["Maintenance Planner"],
//       //             shared_role_name_to_id["Scheduler"],
//       //             shared_role_name_to_id["Auditor"],
//       //             shared_role_name_to_id["Maintainer"],
//       //           ],
//       //           rating_scales: [
//       //             {
//       //               name: "Reactive",
//       //               description:
//       //                 "No specific process for selection of teams or DE teams are selected outside of the DE Management Team usually within a department.",
//       //               value: 1,
//       //             },
//       //             {
//       //               name: "Planned",
//       //               description:
//       //                 "DE teams are approved by the DE Management Team.  Teams are not always sufficiently resourced.",
//       //               value: 2,
//       //             },
//       //             {
//       //               name: "Proactive",
//       //               description:
//       //                 "DE teams are sufficiently resourced but not always cross-functional.",
//       //               value: 3,
//       //             },
//       //             {
//       //               name: "Optimised",
//       //               description:
//       //                 "DE Teams are cross functional and involve all required skill sets.",
//       //               value: 4,
//       //             },
//       //           ],
//       //         },
//       //       ],
//       //     },
//       //     {
//       //       title: "Determining Root Cause",
//       //       order: 3,
//       //       questions: [
//       //         {
//       //           title: "RCA Method Training and Capability",
//       //           question_text:
//       //             "Are there personnel trained in each of the different tools available?",
//       //           context:
//       //             "Root Cause Analysis (RCA)  Methods\nMultiple Root Cause Analysis (RCA) methods are made available to the DE Team and are personnel trained in their use.",
//       //           order: 1,
//       //           applicable_roles: [
//       //             shared_role_name_to_id["Maintenance Superintendent"],
//       //             shared_role_name_to_id["Operations Supervisor"],
//       //             shared_role_name_to_id["Maintenance Supervisor"],
//       //             shared_role_name_to_id["Reliability Engineer"],
//       //             shared_role_name_to_id["Maintenance Planner"],
//       //             shared_role_name_to_id["Scheduler"],
//       //             shared_role_name_to_id["Auditor"],
//       //             shared_role_name_to_id["Maintainer"],
//       //           ],
//       //           rating_scales: [
//       //             {
//       //               name: "Reactive",
//       //               description:
//       //                 "No RCA methods used.\nThe business has a few people capable of using ad hoc problem-solving tools.",
//       //               value: 1,
//       //             },
//       //             {
//       //               name: "Planned",
//       //               description:
//       //                 "The business has a few people trained in facilitating RCA methods (5-Whys, Cause-and-Effect/ Structure Tree, Apollo RCA, TapRooT, KT).",
//       //               value: 2,
//       //             },
//       //             {
//       //               name: "Proactive",
//       //               description:
//       //                 "The business has a formal set of RCA methods and has cross functional personnel identified and trained in their use.",
//       //               value: 3,
//       //             },
//       //             {
//       //               name: "Optimised",
//       //               description:
//       //                 "A process is in place where the business can select from many areas to choose the best tool and facilitator to address the defect.",
//       //               value: 4,
//       //             },
//       //           ],
//       //         },
//       //         {
//       //           title: "RCA Method Selection Criteria",
//       //           question_text:
//       //             "1. Is there criteria for what tool or technique will be used?\n2. Is the criteria based on actual or potential impact to the business?",
//       //           context:
//       //             "Selection of RCA method\nThere are many methods and processes available to assist in the identification of the root causes of a defect.\nThe specific method chosen will depend on a number of factors:\n• Problem complexity\n• Risk defect poses\n• Problem Dimensions\n• If a team is being used.",
//       //           order: 2,
//       //           applicable_roles: [
//       //             shared_role_name_to_id["Maintenance Superintendent"],
//       //             shared_role_name_to_id["Operations Supervisor"],
//       //             shared_role_name_to_id["Maintenance Supervisor"],
//       //             shared_role_name_to_id["Reliability Engineer"],
//       //             shared_role_name_to_id["Maintenance Planner"],
//       //             shared_role_name_to_id["Scheduler"],
//       //             shared_role_name_to_id["Auditor"],
//       //             shared_role_name_to_id["Maintainer"],
//       //           ],
//       //           rating_scales: [
//       //             {
//       //               name: "Reactive",
//       //               description:
//       //                 "Limited RCA methods are used. Selection of a tool to determine root cause is left up to the team or individual.",
//       //               value: 1,
//       //             },
//       //             {
//       //               name: "Planned",
//       //               description:
//       //                 "Team or individual selects the RCA method they are most familiar with.",
//       //               value: 2,
//       //             },
//       //             {
//       //               name: "Proactive",
//       //               description:
//       //                 "A Reliability Engineer or team leader selects the RCA method to be used based on his / her judgment.",
//       //               value: 3,
//       //             },
//       //             {
//       //               name: "Optimised",
//       //               description:
//       //                 "There is a clear procedure for selecting the RCA method to be used and the team make up is aligned with this.",
//       //               value: 4,
//       //             },
//       //           ],
//       //         },
//       //         {
//       //           title: "Problem Statement and Team Charter Developmen",
//       //           question_text:
//       //             "Are team charters developed including problem statements?",
//       //           context:
//       //             "Problem Statement\nA Team Charter is developed for each DE Team that includes a clear problem statement.",
//       //           order: 3,
//       //           applicable_roles: [
//       //             shared_role_name_to_id["Maintenance Superintendent"],
//       //             shared_role_name_to_id["Operations Supervisor"],
//       //             shared_role_name_to_id["Maintenance Supervisor"],
//       //             shared_role_name_to_id["Reliability Engineer"],
//       //             shared_role_name_to_id["Maintenance Planner"],
//       //             shared_role_name_to_id["Scheduler"],
//       //             shared_role_name_to_id["Auditor"],
//       //             shared_role_name_to_id["Maintainer"],
//       //           ],
//       //           rating_scales: [
//       //             {
//       //               name: "Reactive",
//       //               description:
//       //                 "No clear problem statement or team charter. Only the concept has been explained to the team.",
//       //               value: 1,
//       //             },
//       //             {
//       //               name: "Planned",
//       //               description:
//       //                 "Only the Facilitator develops the problem statement and Team charter.",
//       //               value: 2,
//       //             },
//       //             {
//       //               name: "Proactive",
//       //               description:
//       //                 "The Facilitator puts the problem statement and charter together with the Team.",
//       //               value: 3,
//       //             },
//       //             {
//       //               name: "Optimised",
//       //               description:
//       //                 "The Facilitator puts the problem statement and charter together with the Team and it is understood and communicated to the key stakeholders.",
//       //               value: 4,
//       //             },
//       //           ],
//       //         },
//       //         {
//       //           title: "Question 17",
//       //           question_text:
//       //             "How many teams are active and are they comprised of more than just maintenance personnel?",
//       //           context:
//       //             "Team Composition\nKey stakeholders are represented in the Defect Elimination Team to provide input into the problem and solution analysis? Teams should include roles such as:\n• Facilitator\n• Team Leader\n• Reliability Engineer\n• Team Members (representing areas effected).",
//       //           order: 4,
//       //           applicable_roles: [
//       //             shared_role_name_to_id["Maintenance Superintendent"],
//       //             shared_role_name_to_id["Operations Supervisor"],
//       //             shared_role_name_to_id["Maintenance Supervisor"],
//       //             shared_role_name_to_id["Reliability Engineer"],
//       //             shared_role_name_to_id["Maintenance Planner"],
//       //             shared_role_name_to_id["Scheduler"],
//       //             shared_role_name_to_id["Auditor"],
//       //             shared_role_name_to_id["Maintainer"],
//       //           ],
//       //           rating_scales: [
//       //             {
//       //               name: "Reactive",
//       //               description:
//       //                 "Team make up is not considered or team members are chosen based on availability.",
//       //               value: 1,
//       //             },
//       //             {
//       //               name: "Planned",
//       //               description:
//       //                 "Teams are made up of only people that are the most technically knowledgeable of the defect.",
//       //               value: 2,
//       //             },
//       //             {
//       //               name: "Proactive",
//       //               description:
//       //                 "There is a cross functional team that represents what's effected by the defect, but only includes supervisors and above.",
//       //               value: 3,
//       //             },
//       //             {
//       //               name: "Optimised",
//       //               description:
//       //                 "The DE Management Team strives to involve as many people as possible throughout the organization to make DE a normal daily activity, and the teams include hourly personnel as needed.",
//       //               value: 4,
//       //             },
//       //           ],
//       //         },
//       //       ],
//       //     },
//       //     {
//       //       title: "Develop Actions",
//       //       order: 4,
//       //       questions: [
//       //         {
//       //           title: "Root Cause Action Development",
//       //           question_text:
//       //             "Are the teams always focused on getting to the root cause.",
//       //           context:
//       //             "Identify potential actions\nAre all potential solutions and actions evaluated by the responsible DE Team or individual and are they formally documented?\nSolutions and actions have to address the root causes as well as any contributing factors.",
//       //           order: 1,
//       //           applicable_roles: [
//       //             shared_role_name_to_id["Maintenance Superintendent"],
//       //             shared_role_name_to_id["Operations Supervisor"],
//       //             shared_role_name_to_id["Maintenance Supervisor"],
//       //             shared_role_name_to_id["Reliability Engineer"],
//       //             shared_role_name_to_id["Maintenance Planner"],
//       //             shared_role_name_to_id["Scheduler"],
//       //             shared_role_name_to_id["Auditor"],
//       //             shared_role_name_to_id["Maintainer"],
//       //           ],
//       //           rating_scales: [
//       //             {
//       //               name: "Reactive",
//       //               description:
//       //                 "No actions identified.\nSome actions identified but do not address the root causes.",
//       //               value: 1,
//       //             },
//       //             {
//       //               name: "Planned",
//       //               description: "Actions identified address the root cause.",
//       //               value: 2,
//       //             },
//       //             {
//       //               name: "Proactive",
//       //               description:
//       //                 "Actions  identified address root cause as well as any contributing factors.",
//       //               value: 3,
//       //             },
//       //             {
//       //               name: "Optimised",
//       //               description:
//       //                 "Actions take into account both short and long term time frames for the overall benefit of the business.",
//       //               value: 4,
//       //             },
//       //           ],
//       //         },
//       //         {
//       //           title: "Action Evaluation and Approval",
//       //           question_text:
//       //             "1. Does the owner of the relevant cost centre get to sign off on the actions?\n2. Is the evaluation methodology aligned with the site's Edge evaluation method?",
//       //           context:
//       //             "Evaluation of potential actions\nAll potential actions are evaluated against specific criteria. Actions should be evaluated in terms of:\n• Addressing the root cause\n• SHE Implications\n• Cost to implement\n• Ease of implementation.",
//       //           order: 2,
//       //           applicable_roles: [
//       //             shared_role_name_to_id["Maintenance Superintendent"],
//       //             shared_role_name_to_id["Operations Supervisor"],
//       //             shared_role_name_to_id["Maintenance Supervisor"],
//       //             shared_role_name_to_id["Reliability Engineer"],
//       //             shared_role_name_to_id["Maintenance Planner"],
//       //             shared_role_name_to_id["Scheduler"],
//       //             shared_role_name_to_id["Auditor"],
//       //             shared_role_name_to_id["Maintainer"],
//       //           ],
//       //           rating_scales: [
//       //             {
//       //               name: "Reactive",
//       //               description:
//       //                 "No evaluation of potential actions is made.\nPotential actions are discussed, but not evaluated against any specific criteria.",
//       //               value: 1,
//       //             },
//       //             {
//       //               name: "Planned",
//       //               description:
//       //                 "Potential actions are informally evaluated against some of the criteria.",
//       //               value: 2,
//       //             },
//       //             {
//       //               name: "Proactive",
//       //               description:
//       //                 "Potential actions are formally evaluated against most of the criteria by the DE Team.",
//       //               value: 3,
//       //             },
//       //             {
//       //               name: "Optimised",
//       //               description:
//       //                 "Potential actions are formally evaluated against all of the criteria with help from key stakeholders.",
//       //               value: 4,
//       //             },
//       //           ],
//       //         },
//       //         {
//       //           title: "Action Plan Development",
//       //           question_text: "",
//       //           context:
//       //             "Action Plan\nDetailed action plans developed with clear accountability.\n Action plans should include:\n• Actions\n• Accountability\n• Targets & deliverables\n• Status.",
//       //           order: 3,
//       //           applicable_roles: [
//       //             shared_role_name_to_id["Maintenance Superintendent"],
//       //             shared_role_name_to_id["Operations Supervisor"],
//       //             shared_role_name_to_id["Maintenance Supervisor"],
//       //             shared_role_name_to_id["Reliability Engineer"],
//       //             shared_role_name_to_id["Maintenance Planner"],
//       //             shared_role_name_to_id["Scheduler"],
//       //             shared_role_name_to_id["Auditor"],
//       //             shared_role_name_to_id["Maintainer"],
//       //           ],
//       //           rating_scales: [
//       //             {
//       //               name: "Reactive",
//       //               description:
//       //                 "No action plans in place or the action plans are non-specific and hard to measure.",
//       //               value: 1,
//       //             },
//       //             {
//       //               name: "Planned",
//       //               description:
//       //                 "The action plans are aligned with the target areas but need more details",
//       //               value: 2,
//       //             },
//       //             {
//       //               name: "Proactive",
//       //               description:
//       //                 "The action plans include required actions, accountability, and completion dates.",
//       //               value: 3,
//       //             },
//       //             {
//       //               name: "Optimised",
//       //               description:
//       //                 "The action plans include benefit targets and deliverables for the overall success of the business.",
//       //               value: 4,
//       //             },
//       //           ],
//       //         },
//       //         {
//       //           title: "Success Measurement Planning",
//       //           question_text:
//       //             "1. Is the criteria for success clearly defined and understood by the team and management?\n2. Do the KPIs both help to track and manage project progress and ultimately whether or not the project goals were achieved?",
//       //           context:
//       //             "Establish a measurement plan.\nA measurement plan is in place that includes a baseline with appropriate measures / KPI and targets.",
//       //           order: 4,
//       //           applicable_roles: [
//       //             shared_role_name_to_id["Maintenance Superintendent"],
//       //             shared_role_name_to_id["Operations Supervisor"],
//       //             shared_role_name_to_id["Maintenance Supervisor"],
//       //             shared_role_name_to_id["Reliability Engineer"],
//       //             shared_role_name_to_id["Maintenance Planner"],
//       //             shared_role_name_to_id["Scheduler"],
//       //             shared_role_name_to_id["Auditor"],
//       //             shared_role_name_to_id["Maintainer"],
//       //           ],
//       //           rating_scales: [
//       //             {
//       //               name: "Reactive",
//       //               description:
//       //                 "No plan in place or the plan does not  measure the effectiveness of the approved actions.",
//       //               value: 1,
//       //             },
//       //             {
//       //               name: "Planned",
//       //               description:
//       //                 "The plan measures the effectiveness of most of the approved actions.",
//       //               value: 2,
//       //             },
//       //             {
//       //               name: "Proactive",
//       //               description:
//       //                 "An accurate baseline has been established with process indicators and KPIs that reflect the target areas.",
//       //               value: 3,
//       //             },
//       //             {
//       //               name: "Optimised",
//       //               description:
//       //                 "An accurate baseline has been established with process indicators and KPIs that reflect the target areas and are a mixture of leading and lagging KPI's.",
//       //               value: 4,
//       //             },
//       //           ],
//       //         },
//       //       ],
//       //     },
//       //     {
//       //       title: "Implement Actions",
//       //       order: 5,
//       //       questions: [
//       //         {
//       //           title: "Action Approval Process",
//       //           question_text:
//       //             "Is there a clearly defined process that is documented?",
//       //           context:
//       //             "Approval\nProper approval is obtained for all actions prior to implementation (i.e.: change management).",
//       //           order: 1,
//       //           applicable_roles: [
//       //             shared_role_name_to_id["Maintenance Superintendent"],
//       //             shared_role_name_to_id["Operations Supervisor"],
//       //             shared_role_name_to_id["Maintenance Supervisor"],
//       //             shared_role_name_to_id["Reliability Engineer"],
//       //             shared_role_name_to_id["Maintenance Planner"],
//       //             shared_role_name_to_id["Scheduler"],
//       //             shared_role_name_to_id["Auditor"],
//       //             shared_role_name_to_id["Maintainer"],
//       //           ],
//       //           rating_scales: [
//       //             {
//       //               name: "Reactive",
//       //               description:
//       //                 "No approval procedure in place or approval is informal and inconsistent. Change management requirements are never considered.",
//       //               value: 1,
//       //             },
//       //             {
//       //               name: "Planned",
//       //               description:
//       //                 "Written approval is usually obtained as required from stakeholders. Change management requirements not always considered.",
//       //               value: 2,
//       //             },
//       //             {
//       //               name: "Proactive",
//       //               description:
//       //                 "Approval is always obtained and any necessary change management requirements are always completed before implementing the improvement.",
//       //               value: 3,
//       //             },
//       //             {
//       //               name: "Optimised",
//       //               description:
//       //                 "The approval process includes a high level review of all findings and actions by the DE management Team.",
//       //               value: 4,
//       //             },
//       //           ],
//       //         },
//       //         {
//       //           title: "Action Accountability Management",
//       //           question_text:
//       //             "Does management understand the actions assigned to team members that report to them?",
//       //           context:
//       //             "Accountability\nClear accountabilities are established for the completion of the action plan and is it syndicated with management. \nAccountabilities to include:\n• Project management\n• Action completion\n• Action management\n• Cost management\n• Monitoring progress.",
//       //           order: 2,
//       //           applicable_roles: [
//       //             shared_role_name_to_id["Maintenance Superintendent"],
//       //             shared_role_name_to_id["Operations Supervisor"],
//       //             shared_role_name_to_id["Maintenance Supervisor"],
//       //             shared_role_name_to_id["Reliability Engineer"],
//       //             shared_role_name_to_id["Maintenance Planner"],
//       //             shared_role_name_to_id["Scheduler"],
//       //             shared_role_name_to_id["Auditor"],
//       //             shared_role_name_to_id["Maintainer"],
//       //           ],
//       //           rating_scales: [
//       //             {
//       //               name: "Reactive",
//       //               description:
//       //                 "No clear accountabilities are established or accountability is only discussed at the DE Management Team Meeting.",
//       //               value: 1,
//       //             },
//       //             {
//       //               name: "Planned",
//       //               description:
//       //                 "Accountability is understood by DE Team members and has been documented. Actions are often not managed and completed as planned.",
//       //               value: 2,
//       //             },
//       //             {
//       //               name: "Proactive",
//       //               description:
//       //                 "Site Leaders regularly monitor the progress of DE Team members on the action plan, most actions are managed and completed as planned.",
//       //               value: 3,
//       //             },
//       //             {
//       //               name: "Optimised",
//       //               description:
//       //                 "Site Leaders regularly monitor the progress of DE Team members and all actions are managed and completed as planned.",
//       //               value: 4,
//       //             },
//       //           ],
//       //         },
//       //         {
//       //           title: "Action Progress Review",
//       //           question_text:
//       //             "Are current projects on track?\n2. Is allowance made for people to complete their DE actions as well as their other work?",
//       //           context:
//       //             "Action close out\nThe DE Team's actions and progress reviewed at the monthly DE Management Team meeting. Any slippage in actions must be addressed through additional resources, tools or collaboration.",
//       //           order: 3,
//       //           applicable_roles: [
//       //             shared_role_name_to_id["Maintenance Superintendent"],
//       //             shared_role_name_to_id["Operations Supervisor"],
//       //             shared_role_name_to_id["Maintenance Supervisor"],
//       //             shared_role_name_to_id["Reliability Engineer"],
//       //             shared_role_name_to_id["Maintenance Planner"],
//       //             shared_role_name_to_id["Scheduler"],
//       //             shared_role_name_to_id["Auditor"],
//       //             shared_role_name_to_id["Maintainer"],
//       //           ],
//       //           rating_scales: [
//       //             {
//       //               name: "Reactive",
//       //               description:
//       //                 "No review is made of the actions and progress of the individual DE Teams.\nThe action plan is reviewed sometimes but is inconsistent.",
//       //               value: 1,
//       //             },
//       //             {
//       //               name: "Planned",
//       //               description:
//       //                 "The action plan is regularly reviewed but team pushes out many actions.",
//       //               value: 2,
//       //             },
//       //             {
//       //               name: "Proactive",
//       //               description:
//       //                 "The action plan is regularly reviewed and there is a focus on meeting the deadlines.",
//       //               value: 3,
//       //             },
//       //             {
//       //               name: "Optimised",
//       //               description:
//       //                 "The action plan is regularly reviewed and there is always a plan put in place to bring actions back onto schedule with support from Site Leaders.",
//       //               value: 4,
//       //             },
//       //           ],
//       //         },
//       //         {
//       //           title: "Action Progress Tracking",
//       //           question_text:
//       //             "1. Is there a DE action register for team based activities?\n2. Are larger DE activities formally managed as Projects?\n3. Are the DE Teams using the DE register to help track their projects?",
//       //           context:
//       //             "Tracking Progress\n DE Team progress is tracked using various documents?\n• Meeting Minutes\n• Who Does What When List (Actions Log)\n• Defect Register.",
//       //           order: 4,
//       //           applicable_roles: [
//       //             shared_role_name_to_id["Maintenance Superintendent"],
//       //             shared_role_name_to_id["Operations Supervisor"],
//       //             shared_role_name_to_id["Maintenance Supervisor"],
//       //             shared_role_name_to_id["Reliability Engineer"],
//       //             shared_role_name_to_id["Maintenance Planner"],
//       //             shared_role_name_to_id["Scheduler"],
//       //             shared_role_name_to_id["Auditor"],
//       //             shared_role_name_to_id["Maintainer"],
//       //           ],
//       //           rating_scales: [
//       //             {
//       //               name: "Reactive",
//       //               description:
//       //                 "DE Team progress is not updated.\nAn informal action log is updated infrequently.",
//       //               value: 1,
//       //             },
//       //             {
//       //               name: "Planned",
//       //               description:
//       //                 "An informal action log is updated with action plan progress weekly and distributed to team members and site leaders as requested.",
//       //               value: 2,
//       //             },
//       //             {
//       //               name: "Proactive",
//       //               description:
//       //                 "The defect register is updated with action plan progress once a week along with the meeting minutes.",
//       //               value: 3,
//       //             },
//       //             {
//       //               name: "Optimised",
//       //               description:
//       //                 "The defect register is continuously kept up to date with all changes and is accessible to all site leaders and stakeholders.",
//       //               value: 4,
//       //             },
//       //           ],
//       //         },
//       //       ],
//       //     },
//       //     {
//       //       title: "DE Business Process Framework",
//       //       order: 6,
//       //       questions: [
//       //         {
//       //           title: "Loss Prevention and Continuous Learning System",
//       //           question_text:
//       //             "Has a business process been implemented which defines the following:\n• A formalised register/tracker is in place to monitor action status from initiation to closure?\n• A post-completion audit is defined to validate the effectiveness of defect elimination actions?\ndaily/weekly/monthly/annual loss reporting, review and analysis?\n• A process is defined to share the learnings across the company but also to vendors and wider industry?",
//       //           context:
//       //             "Business process for defect elimination\n\n\nAn effective business process should be defined for defect elimination.",
//       //           order: 1,
//       //           applicable_roles: [
//       //             shared_role_name_to_id["Maintenance Superintendent"],
//       //             shared_role_name_to_id["Operations Supervisor"],
//       //             shared_role_name_to_id["Maintenance Supervisor"],
//       //             shared_role_name_to_id["Reliability Engineer"],
//       //             shared_role_name_to_id["Maintenance Planner"],
//       //             shared_role_name_to_id["Scheduler"],
//       //             shared_role_name_to_id["Auditor"],
//       //             shared_role_name_to_id["Maintainer"],
//       //           ],
//       //           rating_scales: [
//       //             {
//       //               name: "Reactive",
//       //               description:
//       //                 "No approval procedure in place or a basic ad-hoc process is in place but it is not documented.",
//       //               value: 1,
//       //             },
//       //             {
//       //               name: "Planned",
//       //               description:
//       //                 'A documented process is implemented which covers most items listed under "Focus Questions".',
//       //               value: 2,
//       //             },
//       //             {
//       //               name: "Proactive",
//       //               description:
//       //                 'A documented process is implemented which covers all items listed under "Focus Questions". No formal audit process in place to audit compliance and effectiveness.',
//       //               value: 3,
//       //             },
//       //             {
//       //               name: "Optimised",
//       //               description:
//       //                 'A documented process is implemented which covers all items listed under "Focus Questions". Compliance and effectiveness is audited at least annually.',
//       //               value: 4,
//       //             },
//       //           ],
//       //         },
//       //         {
//       //           title: "DE Management Review Process",
//       //           question_text:
//       //             "1. Does the agenda for the DE Management Team meeting include time for review of past projects?\n2. Does the DE Management Team's review of current projects focus on KPI's and targets?",
//       //           context:
//       //             "DE Management Review\nThe DE Teams should be regularly reporting progress back through to the DE Management Team.",
//       //           order: 2,
//       //           applicable_roles: [
//       //             shared_role_name_to_id["Maintenance Superintendent"],
//       //             shared_role_name_to_id["Operations Supervisor"],
//       //             shared_role_name_to_id["Maintenance Supervisor"],
//       //             shared_role_name_to_id["Reliability Engineer"],
//       //             shared_role_name_to_id["Maintenance Planner"],
//       //             shared_role_name_to_id["Scheduler"],
//       //             shared_role_name_to_id["Auditor"],
//       //             shared_role_name_to_id["Maintainer"],
//       //           ],
//       //           rating_scales: [
//       //             {
//       //               name: "Reactive",
//       //               description:
//       //                 "No review takes place or there are informal reviews of the measures but no updates from the DE Teams.",
//       //               value: 1,
//       //             },
//       //             {
//       //               name: "Planned",
//       //               description:
//       //                 "The DE Teams provide an update on progress at the Monthly DE Management Team Meeting. Reporting tends to be developed last minute.",
//       //               value: 2,
//       //             },
//       //             {
//       //               name: "Proactive",
//       //               description:
//       //                 "The DE Teams update the DE Register prior to the DE Management Teams monthly meeting. DE Management Team reviews the DE Register at each meeting looking for major non-conformances to projects.",
//       //               value: 3,
//       //             },
//       //             {
//       //               name: "Optimised",
//       //               description:
//       //                 "DE Management Team gives specific feedback to DE teams on what is going well and where they could improve the results shown in the KPIs and measures.",
//       //               value: 4,
//       //             },
//       //           ],
//       //         },
//       //         {
//       //           title: "Project Sustainability Monitoring",
//       //           question_text:
//       //             "1. Are any projects completed in the past year still monitored for sustainability?\n2. Are there ever any long term KPI's allocated to DE projects?",
//       //           context:
//       //             "Sustainability\nThe long-term sustainability actions are assured through scheduled reviews of past DE projects.",
//       //           order: 3,
//       //           applicable_roles: [
//       //             shared_role_name_to_id["Maintenance Superintendent"],
//       //             shared_role_name_to_id["Operations Supervisor"],
//       //             shared_role_name_to_id["Maintenance Supervisor"],
//       //             shared_role_name_to_id["Reliability Engineer"],
//       //             shared_role_name_to_id["Maintenance Planner"],
//       //             shared_role_name_to_id["Scheduler"],
//       //             shared_role_name_to_id["Auditor"],
//       //             shared_role_name_to_id["Maintainer"],
//       //           ],
//       //           rating_scales: [
//       //             {
//       //               name: "Reactive",
//       //               description:
//       //                 "Projects results are not sustained.\nSometimes DE Teams or leaders will review trends of project targets against expected KPIs.",
//       //               value: 1,
//       //             },
//       //             {
//       //               name: "Planned",
//       //               description:
//       //                 "The DE Management Team reviews completed DE Projects on an ad-hoc basis.",
//       //               value: 2,
//       //             },
//       //             {
//       //               name: "Proactive",
//       //               description:
//       //                 "Completed DE projects are monitored according to the measurement plan by a DE Team member or accountable person.",
//       //               value: 3,
//       //             },
//       //             {
//       //               name: "Optimised",
//       //               description:
//       //                 "Results are reported to the DE Management team monthly and corrective actions taken for negative trends.",
//       //               value: 4,
//       //             },
//       //           ],
//       //         },
//       //         {
//       //           title: "Outcome Communication and Sharing",
//       //           question_text:
//       //             "Is there much awareness about the successful outcome of DE projects throughout the organization?",
//       //           context:
//       //             "Outcomes\nThe outcomes of the DE Project are updated in the Defect Register and are the outcomes syndicated?",
//       //           order: 4,
//       //           applicable_roles: [
//       //             shared_role_name_to_id["Maintenance Superintendent"],
//       //             shared_role_name_to_id["Operations Supervisor"],
//       //             shared_role_name_to_id["Maintenance Supervisor"],
//       //             shared_role_name_to_id["Reliability Engineer"],
//       //             shared_role_name_to_id["Maintenance Planner"],
//       //             shared_role_name_to_id["Scheduler"],
//       //             shared_role_name_to_id["Auditor"],
//       //             shared_role_name_to_id["Maintainer"],
//       //           ],
//       //           rating_scales: [
//       //             {
//       //               name: "Reactive",
//       //               description:
//       //                 "No updates are made of the DE Team's projects or the main source of information about the DE Project is from the Team leader.",
//       //               value: 1,
//       //             },
//       //             {
//       //               name: "Planned",
//       //               description:
//       //                 "The outcomes of the DE Project are updated in the Defect Register.",
//       //               value: 2,
//       //             },
//       //             {
//       //               name: "Proactive",
//       //               description:
//       //                 "The outcomes of the DE Project are communicated across the site.",
//       //               value: 3,
//       //             },
//       //             {
//       //               name: "Optimised",
//       //               description:
//       //                 "The outcomes of the DE Project are communicated across the site. The outcomes of the DE Project are made available to other Company sites",
//       //               value: 4,
//       //             },
//       //           ],
//       //         },
//       //       ],
//       //     },
//       //   ],
//       // },
//       // {
//       //   title: "Asset Strategy Tactics",
//       //   order: 3,
//       //   steps: [
//       //     {
//       //       title: "Assess Criticality",
//       //       order: 1,
//       //       questions: [
//       //         {
//       //           title: "Asset Criticality Assessment",
//       //           question_text:
//       //             "1. Are supervisors, planners and technicians aware of the criticality ranking of equipment or systems?\n2. Is criticality ranking updated as new changes are made to tactics?\n3. Is criticality ranking updated as operational requirements change?",
//       //           context:
//       //             "Asset Criticality\nCriticality Analysis is important for determining where to focus Asset Tactic Development activities.  Criticality is based on consequence and likelihood.  Categories may include:\n• Safety, Health & Environmental\n• Costs\n• Operational.",
//       //           order: 1,
//       //           applicable_roles: [
//       //             shared_role_name_to_id["Maintenance Superintendent"],
//       //             shared_role_name_to_id["Operations Supervisor"],
//       //             shared_role_name_to_id["Maintenance Supervisor"],
//       //             shared_role_name_to_id["Reliability Engineer"],
//       //             shared_role_name_to_id["Maintenance Planner"],
//       //             shared_role_name_to_id["Scheduler"],
//       //             shared_role_name_to_id["Auditor"],
//       //             shared_role_name_to_id["Maintainer"],
//       //           ],
//       //           rating_scales: [
//       //             {
//       //               name: "Reactive",
//       //               description:
//       //                 "There is no criticality analysis of systems or equipment or there has been a criticality analysis at the system level only for all assets.",
//       //               value: 1,
//       //             },
//       //             {
//       //               name: "Planned",
//       //               description:
//       //                 "There has been a criticality analysis at the physical asset or item level and ranking scores given to critical assets.",
//       //               value: 2,
//       //             },
//       //             {
//       //               name: "Proactive",
//       //               description:
//       //                 "Asset Criticality ranking is based on the Company Asset Criticality Guideline.",
//       //               value: 3,
//       //             },
//       //             {
//       //               name: "Optimised",
//       //               description:
//       //                 "Asset criticality ranking is always used when reviewing or developing asset tactics.",
//       //               value: 4,
//       //             },
//       //           ],
//       //         },
//       //         {
//       //           title: "Risk Management Integration",
//       //           question_text:
//       //             "1. Are supervisors, planners and coordinators aware of the Company Enterprise Risk Management Framework and Appetite?\n2. Is Risk rating updated as new changes are made to tactics? Is this communicated to site leadership?\n3. Is Risk rating updated as operational requirements change?",
//       //           context:
//       //             "Risk Management \nIt is important for determining where to focus Asset Tactic Development activities. Risk Management is based on consequence and likelihood utilising the Company Enterprise Risk Management Framework and Appetite.\nCategories may include:\n• Safety & Environmental\n• Costs\n• Operation.",
//       //           order: 2,
//       //           applicable_roles: [
//       //             shared_role_name_to_id["Maintenance Superintendent"],
//       //             shared_role_name_to_id["Operations Supervisor"],
//       //             shared_role_name_to_id["Maintenance Supervisor"],
//       //             shared_role_name_to_id["Reliability Engineer"],
//       //             shared_role_name_to_id["Maintenance Planner"],
//       //             shared_role_name_to_id["Scheduler"],
//       //             shared_role_name_to_id["Auditor"],
//       //             shared_role_name_to_id["Maintainer"],
//       //           ],
//       //           rating_scales: [
//       //             {
//       //               name: "Reactive",
//       //               description:
//       //                 "There has been no criticality analysis based on established risk management processes for all assets.",
//       //               value: 1,
//       //             },
//       //             {
//       //               name: "Planned",
//       //               description:
//       //                 "There has been a risk analysis at the physical asset or item level and ranking scores given to critical assets.",
//       //               value: 2,
//       //             },
//       //             {
//       //               name: "Proactive",
//       //               description:
//       //                 "Risk rankings are based on the Company Enterprise Risk Management Framework and Appetite. All approved asset criticality ranking are recorded in a central database and captured in SAP.",
//       //               value: 3,
//       //             },
//       //             {
//       //               name: "Optimised",
//       //               description:
//       //                 "Risk rankings are based on the Company Enterprise Risk Management Framework and Appetite. All Material Risks (Level 5 and Level 6) have established Asset Tactic Development activities incorporated into risk treatment plans.",
//       //               value: 4,
//       //             },
//       //           ],
//       //         },
//       //       ],
//       //     },
//       //     {
//       //       title: "Develop",
//       //       order: 2,
//       //       questions: [
//       //         {
//       //           title: "Tactics Development Database",
//       //           question_text:
//       //             "1. Does the database have a logical hierarchy of equipment with a breakdown structure for critical equipment?\n2. Does the database contain a listing of common failure modes?",
//       //           context:
//       //             "Asset Tactic Development Database\nA database is important to document analysis and track decision making history. Some other functions of a database are:\n• Developing equipment hierarchies & structures\n• Statistical Analysis\n• Asset Tactic Development database containing common failure mechanisms etc.",
//       //           order: 1,
//       //           applicable_roles: [
//       //             shared_role_name_to_id["Maintenance Superintendent"],
//       //             shared_role_name_to_id["Operations Supervisor"],
//       //             shared_role_name_to_id["Maintenance Supervisor"],
//       //             shared_role_name_to_id["Reliability Engineer"],
//       //             shared_role_name_to_id["Maintenance Planner"],
//       //             shared_role_name_to_id["Scheduler"],
//       //             shared_role_name_to_id["Auditor"],
//       //             shared_role_name_to_id["Maintainer"],
//       //           ],
//       //           rating_scales: [
//       //             {
//       //               name: "Reactive",
//       //               description:
//       //                 "No database used only Excel Spreadsheets are used.",
//       //               value: 1,
//       //             },
//       //             {
//       //               name: "Planned",
//       //               description:
//       //                 "A relational database is used such as Access.",
//       //               value: 2,
//       //             },
//       //             {
//       //               name: "Proactive",
//       //               description:
//       //                 "A stand-alone software product is used with statistical analysis functions by Above Rail and Non-rail - IronMan",
//       //               value: 3,
//       //             },
//       //             {
//       //               name: "Optimised",
//       //               description:
//       //                 "A stand-alone software product is used for all of Company with statistical analysis functions. Database is linked to SAP (or AMS).",
//       //               value: 4,
//       //             },
//       //           ],
//       //         },
//       //         {
//       //           title: "Tactics Review Process",
//       //           question_text:
//       //             "1. Is there evidence of tactics review sessions?\n2. Are the triggers for review documented?\n3. Does the Reliability group report on reviews that have been completed?",
//       //           context:
//       //             "Review of Tactics\nA process should be in place which will trigger a re-evaluation of tactics.  Triggers for re-evaluation can include:\n• Time-Based\n• Poor Performance\n• Change in conditions\n• Defect Elimination\n• Change in operating context.",
//       //           order: 2,
//       //           applicable_roles: [
//       //             shared_role_name_to_id["Maintenance Superintendent"],
//       //             shared_role_name_to_id["Operations Supervisor"],
//       //             shared_role_name_to_id["Maintenance Supervisor"],
//       //             shared_role_name_to_id["Reliability Engineer"],
//       //             shared_role_name_to_id["Maintenance Planner"],
//       //             shared_role_name_to_id["Scheduler"],
//       //             shared_role_name_to_id["Auditor"],
//       //             shared_role_name_to_id["Maintainer"],
//       //           ],
//       //           rating_scales: [
//       //             {
//       //               name: "Reactive",
//       //               description:
//       //                 "There is no evidence of any  review of Tactics or an ad-hoc review of tactics is made periodically for some equipment.  Triggers are normally incidents or poor equipment performance.",
//       //               value: 1,
//       //             },
//       //             {
//       //               name: "Planned",
//       //               description:
//       //                 "Most triggered reviews are performed based on time, feedback from maintenance of from incident investigation.",
//       //               value: 2,
//       //             },
//       //             {
//       //               name: "Proactive",
//       //               description:
//       //                 "Triggers are set for review of critical assets. Triggered reviews are performed based numerious operational performance measures.",
//       //               value: 3,
//       //             },
//       //             {
//       //               name: "Optimised",
//       //               description:
//       //                 "There is a comprehensive plan for the review of tactics. It is embedded in how we do business and is triggered by technical advances, performance & operating context.",
//       //               value: 4,
//       //             },
//       //           ],
//       //         },
//       //         {
//       //           title: "Team-Based Tactics Development",
//       //           question_text:
//       //             "1. Are there agendas and action plans available?\n2.  Have the recommendations made by previous teams actually made it into the SAP/CMMS system?",
//       //           context:
//       //             "Team-Based Tactics Development\nA team-based approach to Asset Tactic Development will improve the effectiveness of the overall program.  Teams are normally involved in the development & implementation steps:\n• Asset Tactic Development analysis\n• Data gathering\n• Field Validation.",
//       //           order: 3,
//       //           applicable_roles: [
//       //             shared_role_name_to_id["Maintenance Superintendent"],
//       //             shared_role_name_to_id["Operations Supervisor"],
//       //             shared_role_name_to_id["Maintenance Supervisor"],
//       //             shared_role_name_to_id["Reliability Engineer"],
//       //             shared_role_name_to_id["Maintenance Planner"],
//       //             shared_role_name_to_id["Scheduler"],
//       //             shared_role_name_to_id["Auditor"],
//       //             shared_role_name_to_id["Maintainer"],
//       //           ],
//       //           rating_scales: [
//       //             {
//       //               name: "Reactive",
//       //               description:
//       //                 "Team based tactics development never or rarely used.",
//       //               value: 1,
//       //             },
//       //             {
//       //               name: "Planned",
//       //               description:
//       //                 "Formal Teams exist with goals and action plans.",
//       //               value: 2,
//       //             },
//       //             {
//       //               name: "Proactive",
//       //               description:
//       //                 "Teams are cross-functional (Maintenance, Reliability, Operations, Technical) and include OEM representatives where needed.",
//       //               value: 3,
//       //             },
//       //             {
//       //               name: "Optimised",
//       //               description:
//       //                 "Cross site teams are encouraged and effectively complete projects. Share tactics with and adapt tactics from other sites.",
//       //               value: 4,
//       //             },
//       //           ],
//       //         },
//       //         {
//       //           title: "Project Selection and Prioritization",
//       //           question_text:
//       //             "1. Does a prioritized list exist?\n2. Does each program have clearly defined boundaries for analysis?\n3. Are projects normally of short duration and frequent rather than large and intermittent?",
//       //           context:
//       //             "Selection of Projects\nTactics development projects are prioritised and selected based on specific criteria:\n• Criticality\n• Performance\n• Value.",
//       //           order: 4,
//       //           applicable_roles: [
//       //             shared_role_name_to_id["Maintenance Superintendent"],
//       //             shared_role_name_to_id["Operations Supervisor"],
//       //             shared_role_name_to_id["Maintenance Supervisor"],
//       //             shared_role_name_to_id["Reliability Engineer"],
//       //             shared_role_name_to_id["Maintenance Planner"],
//       //             shared_role_name_to_id["Scheduler"],
//       //             shared_role_name_to_id["Auditor"],
//       //             shared_role_name_to_id["Maintainer"],
//       //           ],
//       //           rating_scales: [
//       //             {
//       //               name: "Reactive",
//       //               description:
//       //                 "No Tactics Development projects are planned or a list exists of Tactics development  projects with limited criteria for prioritization.",
//       //               value: 1,
//       //             },
//       //             {
//       //               name: "Planned",
//       //               description:
//       //                 "Projects are prioritized utilizing criticality ranking and other criteria.",
//       //               value: 2,
//       //             },
//       //             {
//       //               name: "Proactive",
//       //               description:
//       //                 "Tactics Development projects are approved through a management selection process.",
//       //               value: 3,
//       //             },
//       //             {
//       //               name: "Optimised",
//       //               description:
//       //                 "Management process explicitly includes resourcing of the selected projects.",
//       //               value: 4,
//       //             },
//       //           ],
//       //         },
//       //       ],
//       //     },
//       //     {
//       //       title: "Assess Tactics",
//       //       order: 3,
//       //       questions: [
//       //         {
//       //           title: "Decision History Documentation",
//       //           question_text:
//       //             "Can the organization demonstrate how critical tasks or intervals were determined?",
//       //           context:
//       //             "Decision History\nIt is important to record the decision-making history behind tasks and intervals used in a maintenance strategy.  This will facilitate:\n• Review and updating of tactics\n• Identifying gaps in information needs.",
//       //           order: 1,
//       //           applicable_roles: [
//       //             shared_role_name_to_id["Maintenance Superintendent"],
//       //             shared_role_name_to_id["Operations Supervisor"],
//       //             shared_role_name_to_id["Maintenance Supervisor"],
//       //             shared_role_name_to_id["Reliability Engineer"],
//       //             shared_role_name_to_id["Maintenance Planner"],
//       //             shared_role_name_to_id["Scheduler"],
//       //             shared_role_name_to_id["Auditor"],
//       //             shared_role_name_to_id["Maintainer"],
//       //           ],
//       //           rating_scales: [
//       //             {
//       //               name: "Reactive",
//       //               description:
//       //                 "Asset Tactic Development decision making history is not recorded or Asset Tactic Development information is documented but not in a Asset Tactic Development database.",
//       //               value: 1,
//       //             },
//       //             {
//       //               name: "Planned",
//       //               description:
//       //                 "RCM,FMEA, PMO task type and decision logic captured in a Asset Tactic Development database at an Asset level.",
//       //               value: 2,
//       //             },
//       //             {
//       //               name: "Proactive",
//       //               description:
//       //                 "All changes or updates to tactics information is recorded in a Asset Tactic Development database at the component level for all critical assets.",
//       //               value: 3,
//       //             },
//       //             {
//       //               name: "Optimised",
//       //               description:
//       //                 "All changes or updates to tactics decisions are recorded in the Asset Tactic Development database component level.",
//       //               value: 4,
//       //             },
//       //           ],
//       //         },
//       //         {
//       //           title: "Critical Equipment Tactics Validation",
//       //           question_text:
//       //             "1. Can critical tasks in CMMS be found in the Asset Tactic Development database?\n2.  Are critical tasks derived from a FMECA/RCM analysis?",
//       //           context:
//       //             "Asset Tactic Development-Critical Equipment Tactics\nTasks and associated intervals recorded in a Tactics database should reflect the actual maintenance strategies in use:\n• Tasks (and intervals) for critical equipment should exist in the Asset Tactic Development database\n• Tasks for critical equipment should have had some level of FMECA/RCM analysis.",
//       //           order: 2,
//       //           applicable_roles: [
//       //             shared_role_name_to_id["Maintenance Superintendent"],
//       //             shared_role_name_to_id["Operations Supervisor"],
//       //             shared_role_name_to_id["Maintenance Supervisor"],
//       //             shared_role_name_to_id["Reliability Engineer"],
//       //             shared_role_name_to_id["Maintenance Planner"],
//       //             shared_role_name_to_id["Scheduler"],
//       //             shared_role_name_to_id["Auditor"],
//       //             shared_role_name_to_id["Maintainer"],
//       //           ],
//       //           rating_scales: [
//       //             {
//       //               name: "Reactive",
//       //               description:
//       //                 "There is no database or tasks and intervals used in the CMMS system reflect those in the Tactics Database.",
//       //               value: 1,
//       //             },
//       //             {
//       //               name: "Planned",
//       //               description:
//       //                 ">50% of tasks performed for critical equipment exist in tactics database.",
//       //               value: 2,
//       //             },
//       //             {
//       //               name: "Proactive",
//       //               description:
//       //                 "100% of tasks performed for critical equipment are exist in tactics database.",
//       //               value: 3,
//       //             },
//       //             {
//       //               name: "Optimised",
//       //               description:
//       //                 "All new assets/equipment and/or acquired assets/equipment have had formal Asset Tactic Development analysis completed for tasks and intervals for critical assets/equipment.",
//       //               value: 4,
//       //             },
//       //           ],
//       //         },
//       //       ],
//       //     },
//       //     {
//       //       title: "Implement",
//       //       order: 4,
//       //       questions: [
//       //         {
//       //           title: "Task Documentation Standards",
//       //           question_text:
//       //             "1. Do service sheets have a standard template?\n2. Are inspection tasks clearly defined as to what is considered acceptable or not?\n3. Are the tasks easily understood?\n4. Are critical tasks emphasized in some way?",
//       //           context:
//       //             "Document Design\nTasks effectiveness is influenced in how they are presented as service sheets or other such documentation. Documentation guidelines should exist as:\n• Standard templates\n• Standard terminology\n• Clearly defined fields for feedback\n• Methods of emphasis.",
//       //           order: 1,
//       //           applicable_roles: [
//       //             shared_role_name_to_id["Maintenance Superintendent"],
//       //             shared_role_name_to_id["Operations Supervisor"],
//       //             shared_role_name_to_id["Maintenance Supervisor"],
//       //             shared_role_name_to_id["Reliability Engineer"],
//       //             shared_role_name_to_id["Maintenance Planner"],
//       //             shared_role_name_to_id["Scheduler"],
//       //             shared_role_name_to_id["Auditor"],
//       //             shared_role_name_to_id["Maintainer"],
//       //           ],
//       //           rating_scales: [
//       //             {
//       //               name: "Reactive",
//       //               description:
//       //                 "No standard documentation used or Service sheets / work instructions use a standard template.",
//       //               value: 1,
//       //             },
//       //             {
//       //               name: "Planned",
//       //               description:
//       //                 "Tasks are written taking into consideration the expected trades experience levels.",
//       //               value: 2,
//       //             },
//       //             {
//       //               name: "Proactive",
//       //               description:
//       //                 "Tasks are written using a standard terminology.",
//       //               value: 3,
//       //             },
//       //             {
//       //               name: "Optimised",
//       //               description:
//       //                 "Document Design guidelines are used for terminology, photo, reference material, etc.",
//       //               value: 4,
//       //             },
//       //           ],
//       //         },
//       //         {
//       //           title: "Field Validation Process",
//       //           question_text:
//       //             "1. Is there a form to validate new service sheets or tasks?\n2. Have all safety considerations considered when new tasks are implemented?",
//       //           context:
//       //             "Field Validation\nFirst time execution of a changed or newly created tactic must be evaluated in the field. Not validating tasks in the field will lead to ineffective tactics and a lack of confidence in the entire program.\nField validation should focus on ensuring:\n• Safety, Ergonomic or Environmental issues resolved\n• Proper sequencing of tasks\n• Equipment access issues\n• Identify tools and parts requirements\n• Identify training needs.",
//       //           order: 2,
//       //           applicable_roles: [
//       //             shared_role_name_to_id["Maintenance Superintendent"],
//       //             shared_role_name_to_id["Operations Supervisor"],
//       //             shared_role_name_to_id["Maintenance Supervisor"],
//       //             shared_role_name_to_id["Reliability Engineer"],
//       //             shared_role_name_to_id["Maintenance Planner"],
//       //             shared_role_name_to_id["Scheduler"],
//       //             shared_role_name_to_id["Auditor"],
//       //             shared_role_name_to_id["Maintainer"],
//       //           ],
//       //           rating_scales: [
//       //             {
//       //               name: "Reactive",
//       //               description:
//       //                 "There is no process to field validate new tasks or service sheets or some Tasks are validated ad hoc in the field after inclusion in CMMS system.",
//       //               value: 1,
//       //             },
//       //             {
//       //               name: "Planned",
//       //               description:
//       //                 "New tasks are clearly identified and are field validated by maintainers.",
//       //               value: 2,
//       //             },
//       //             {
//       //               name: "Proactive",
//       //               description:
//       //                 "Complex tasks are field validated by maintainers and a reliability engineer.",
//       //               value: 3,
//       //             },
//       //             {
//       //               name: "Optimised",
//       //               description:
//       //                 "Complex Field Validation is part of Change Management Procedures.",
//       //               value: 4,
//       //             },
//       //           ],
//       //         },
//       //         {
//       //           title: "Task Packaging and Integration",
//       //           question_text:
//       //             "1. Is there a task packaging function for the Asset Tactic Development database used?\n2.  Do tasks have an actual interval less than the derived interval from the FMECA/RCM/Reverse RCM/PMO analysis?",
//       //           context:
//       //             "Task Packaging\nTasks must integrate with the current maintenance program.  Careful consideration must be taken to how tasks are packaged and scheduled in the maintenance program.",
//       //           order: 3,
//       //           applicable_roles: [
//       //             shared_role_name_to_id["Maintenance Superintendent"],
//       //             shared_role_name_to_id["Operations Supervisor"],
//       //             shared_role_name_to_id["Maintenance Supervisor"],
//       //             shared_role_name_to_id["Reliability Engineer"],
//       //             shared_role_name_to_id["Maintenance Planner"],
//       //             shared_role_name_to_id["Scheduler"],
//       //             shared_role_name_to_id["Auditor"],
//       //             shared_role_name_to_id["Maintainer"],
//       //           ],
//       //           rating_scales: [
//       //             {
//       //               name: "Reactive",
//       //               description:
//       //                 "New tasks or service sheets are integrated into the CMMS without much consideration for the overall maintenance program. Output of task/service sheet development is left up to others to be incorporated into maintenance program.",
//       //               value: 1,
//       //             },
//       //             {
//       //               name: "Planned",
//       //               description:
//       //                 "A documented process exists for effective task packaging responsibilities are clearly defined in a RACI but it's not always followed.",
//       //               value: 2,
//       //             },
//       //             {
//       //               name: "Proactive",
//       //               description:
//       //                 "The process is followed for all critical asset tasks.",
//       //               value: 3,
//       //             },
//       //             {
//       //               name: "Optimised",
//       //               description: "The process always followed for all assets.",
//       //               value: 4,
//       //             },
//       //           ],
//       //         },
//       //         {
//       //           title: "Tactics Change Management",
//       //           question_text:
//       //             "1. Is the ability to change tasks or intervals tightly controlled?\n2. Does everybody understand the processes?\n3.  Is there a form required before any changes can be made?",
//       //           context:
//       //             "Change Management\nChange Management procedures are crucial to ensure maintenance tasks & procedures comply with the selected methodology (e.g., RCM, FMECA,  PMO) principles\n• Safety\n• Materials\n• Tasks including specification.",
//       //           order: 4,
//       //           applicable_roles: [
//       //             shared_role_name_to_id["Maintenance Superintendent"],
//       //             shared_role_name_to_id["Operations Supervisor"],
//       //             shared_role_name_to_id["Maintenance Supervisor"],
//       //             shared_role_name_to_id["Reliability Engineer"],
//       //             shared_role_name_to_id["Maintenance Planner"],
//       //             shared_role_name_to_id["Scheduler"],
//       //             shared_role_name_to_id["Auditor"],
//       //             shared_role_name_to_id["Maintainer"],
//       //           ],
//       //           rating_scales: [
//       //             {
//       //               name: "Reactive",
//       //               description:
//       //                 "There no change management procedures or here is an informal change management process in place that requires notification to reliability group of any changes to PM/tasks.",
//       //               value: 1,
//       //             },
//       //             {
//       //               name: "Planned",
//       //               description:
//       //                 "Change Management procedure requires a reliability engineer to review and approve all changes to PM/tasks no formal  consideration given to actual failure modes and business requirements.",
//       //               value: 2,
//       //             },
//       //             {
//       //               name: "Proactive",
//       //               description:
//       //                 "Change Management procedure requires a reliability engineer to review and approve all changes to PM/tasks with consideration given to actual failure modes and business requirements.",
//       //               value: 3,
//       //             },
//       //             {
//       //               name: "Optimised",
//       //               description:
//       //                 "Change Management procedures requires  all changes to PM/tasks to be based on the selected methodology e.g., RCM, FMECA, PMO.",
//       //               value: 4,
//       //             },
//       //           ],
//       //         },
//       //       ],
//       //     },
//       //     {
//       //       title: "Optimise",
//       //       order: 5,
//       //       questions: [
//       //         {
//       //           title: "Asset Performance Monitoring",
//       //           question_text:
//       //             "1. Are Pareto charts used?\n2. Are there reports available comparing expected performance vs revised Asset Tactic Development expected performance?\n3.  Is there an active review of failure information for new failure modes?",
//       //           context:
//       //             "Asset Performance Review\n A continuous process of improving maintenance tactics requires the monitoring of various sources of information on equipment performance and task effectiveness:\n• Cost Reports\n• Trend Analysis\n• Failure Analysis\n• Tactics Review\n• Defect Elimination\n• Integrity Risk Assessment.",
//       //           order: 1,
//       //           applicable_roles: [
//       //             shared_role_name_to_id["Maintenance Superintendent"],
//       //             shared_role_name_to_id["Operations Supervisor"],
//       //             shared_role_name_to_id["Maintenance Supervisor"],
//       //             shared_role_name_to_id["Reliability Engineer"],
//       //             shared_role_name_to_id["Maintenance Planner"],
//       //             shared_role_name_to_id["Scheduler"],
//       //             shared_role_name_to_id["Auditor"],
//       //             shared_role_name_to_id["Maintainer"],
//       //           ],
//       //           rating_scales: [
//       //             {
//       //               name: "Reactive",
//       //               description:
//       //                 "Tools such as pareto analysis charts reviewed intermittently to identify emerging issues.",
//       //               value: 1,
//       //             },
//       //             {
//       //               name: "Planned",
//       //               description:
//       //                 "Analysis of equipment performance metrics are used regularly.",
//       //               value: 2,
//       //             },
//       //             {
//       //               name: "Proactive",
//       //               description:
//       //                 "Various metrics and proactive risk assessments (e.g., FMEA) are used to identify emerging issues and opportunities to improve tactics in advance.",
//       //               value: 3,
//       //             },
//       //             {
//       //               name: "Optimised",
//       //               description:
//       //                 "Robust Lifecycle costing analysis in place. Combined cost, procurement, maintenance, operations & disposal.",
//       //               value: 4,
//       //             },
//       //           ],
//       //         },
//       //         {
//       //           title: "Preventive Maintenance Optimization",
//       //           question_text:
//       //             "Have equipment tactics been reviewed to change, eliminate or extend intervals of tasks? Does Senior Management?",
//       //           context:
//       //             "PMO (Preventative Maintenance  Optimisation)\nPMO is a review of equipment performance to determine the effectiveness of tactics already in place and:\n• Maybe used for equipment with significant history and well understood life cycles\n• Is a method to rapidly review current tactics in bulk.",
//       //           order: 2,
//       //           applicable_roles: [
//       //             shared_role_name_to_id["Maintenance Superintendent"],
//       //             shared_role_name_to_id["Operations Supervisor"],
//       //             shared_role_name_to_id["Maintenance Supervisor"],
//       //             shared_role_name_to_id["Reliability Engineer"],
//       //             shared_role_name_to_id["Maintenance Planner"],
//       //             shared_role_name_to_id["Scheduler"],
//       //             shared_role_name_to_id["Auditor"],
//       //             shared_role_name_to_id["Maintainer"],
//       //           ],
//       //           rating_scales: [
//       //             {
//       //               name: "Reactive",
//       //               description:
//       //                 "PMO is not or is sometimes used to optimize equipment tactics for equipment with well-understood failure modes.",
//       //               value: 1,
//       //             },
//       //             {
//       //               name: "Planned",
//       //               description:
//       //                 "PMO is regularly used to optimize equipment tactics for equipment with well-understood failure modes.",
//       //               value: 2,
//       //             },
//       //             {
//       //               name: "Proactive",
//       //               description:
//       //                 "PMOs are widely used. There has been a PMO activity completed & effectively implemented in the last 36 months.",
//       //               value: 3,
//       //             },
//       //             {
//       //               name: "Optimised",
//       //               description:
//       //                 "PMOs are widely used. There has been a PMO activity completed & effectively implemented in the last 12 months.",
//       //               value: 4,
//       //             },
//       //           ],
//       //         },
//       //         {
//       //           title: "Cross-Site Collaboration",
//       //           question_text:
//       //             "1. Does Senior Management encourage people to work together on Asset Tactic Development projects?\n2. Does Senior Management feel responsible for the performance of the Asset Tactic Development process?",
//       //           context:
//       //             "Collaboration\nCollaboration is important to share information and resources across organizations to help improve Asset Tactic Development outcomes.  Collaboration can come in many forms:\n• Asset Management (AM) engagements\n• Common Practice Work Groups (CPWGs)\n• Multi-Site Projects.",
//       //           order: 3,
//       //           applicable_roles: [
//       //             shared_role_name_to_id["Maintenance Superintendent"],
//       //             shared_role_name_to_id["Operations Supervisor"],
//       //             shared_role_name_to_id["Maintenance Supervisor"],
//       //             shared_role_name_to_id["Reliability Engineer"],
//       //             shared_role_name_to_id["Maintenance Planner"],
//       //             shared_role_name_to_id["Scheduler"],
//       //             shared_role_name_to_id["Auditor"],
//       //             shared_role_name_to_id["Maintainer"],
//       //           ],
//       //           rating_scales: [
//       //             {
//       //               name: "Reactive",
//       //               description:
//       //                 "Little or no evidence of any collaboration activities.\nIndividuals in key roles have ad hoc contacts with other sites to review or discuss tactics work.",
//       //               value: 1,
//       //             },
//       //             {
//       //               name: "Planned",
//       //               description:
//       //                 "Key individuals have access to on-line groups or forums.",
//       //               value: 2,
//       //             },
//       //             {
//       //               name: "Proactive",
//       //               description:
//       //                 "Key individuals are part of a Common Practice Work group.",
//       //               value: 3,
//       //             },
//       //             {
//       //               name: "Optimised",
//       //               description:
//       //                 "Key individuals are consulted or involved in multi-site tactics development projects.",
//       //               value: 4,
//       //             },
//       //           ],
//       //         },
//       //         {
//       //           title: "DE Integration with Asset Tactics",
//       //           question_text:
//       //             "1. Does a Defect Elimination process exist?\n2. Are recommendations for tactics improvement from the Defect Elimination process reviewed and incorporated into existing tactics?\n3. Are tactics changes generated by the Defect Elimination process reviewed and approved prior to implementation?\n4. How often are tactics changed to as an outcome of a DE project? Do you have an example of this?",
//       //           context:
//       //             "Asset Tactics Integrated with Defect Elimination           \n A process exists to ensure recommendations for tactics improvement generated from the Defect Elimination process are reviewed and incorporated into existing asset tactics.",
//       //           order: 4,
//       //           applicable_roles: [
//       //             shared_role_name_to_id["Maintenance Superintendent"],
//       //             shared_role_name_to_id["Operations Supervisor"],
//       //             shared_role_name_to_id["Maintenance Supervisor"],
//       //             shared_role_name_to_id["Reliability Engineer"],
//       //             shared_role_name_to_id["Maintenance Planner"],
//       //             shared_role_name_to_id["Scheduler"],
//       //             shared_role_name_to_id["Auditor"],
//       //             shared_role_name_to_id["Maintainer"],
//       //           ],
//       //           rating_scales: [
//       //             {
//       //               name: "Reactive",
//       //               description:
//       //                 "No Defect Elimination process exists. Or, Defect Elimination process exists, but no integration of Defect Elimination recommendations into Asset Tactics Development process.",
//       //               value: 1,
//       //             },
//       //             {
//       //               name: "Planned",
//       //               description:
//       //                 "Some integration of Defect Elimination recommendations into Asset Tactics Development process.",
//       //               value: 2,
//       //             },
//       //             {
//       //               name: "Proactive",
//       //               description:
//       //                 "Defect Elimination recommendations for changes to tactics are integrated into the Asset Tactics Development process.",
//       //               value: 3,
//       //             },
//       //             {
//       //               name: "Optimised",
//       //               description:
//       //                 "Defect Elimination recommendations for changes to tactics are fully integrated into the Asset Tactics Development process, including a review and approval of the recommendations prior to implementation.",
//       //               value: 4,
//       //             },
//       //           ],
//       //         },
//       //       ],
//       //     },
//       //   ],
//       // },
//       // {
//       //   title: "Asset Health",
//       //   order: 4,
//       //   steps: [
//       //     {
//       //       title: "Design",
//       //       order: 1,
//       //       questions: [
//       //         {
//       //           title: "Asset Health Information Management",
//       //           question_text:
//       //             "How are changes to the Asset Health program tracked. i.e. changed Fmax from 500Hz to 1000Hz?",
//       //           context: "Asset Health information Storage and Sharing",
//       //           order: 1,
//       //           applicable_roles: [
//       //             shared_role_name_to_id["Maintenance Superintendent"],
//       //             shared_role_name_to_id["Operations Supervisor"],
//       //             shared_role_name_to_id["Maintenance Supervisor"],
//       //             shared_role_name_to_id["Reliability Engineer"],
//       //             shared_role_name_to_id["Maintenance Planner"],
//       //             shared_role_name_to_id["Scheduler"],
//       //             shared_role_name_to_id["Auditor"],
//       //             shared_role_name_to_id["Maintainer"],
//       //           ],
//       //           rating_scales: [
//       //             {
//       //               name: "Reactive",
//       //               description:
//       //                 "Asset Health information is not readily accessible. Asset Health information is stored at scattered locations and is hardly accessible.",
//       //               value: 1,
//       //             },
//       //             {
//       //               name: "Planned",
//       //               description:
//       //                 "Asset Health information is stored at various specified locations and is accessible.",
//       //               value: 2,
//       //             },
//       //             {
//       //               name: "Proactive",
//       //               description:
//       //                 "All Asset Health information is stored at a common location and is accessible for certain people.",
//       //               value: 3,
//       //             },
//       //             {
//       //               name: "Optimised",
//       //               description:
//       //                 "All Asset Health information is stored at a common location and is readily accessible via electronic media for all concerned.",
//       //               value: 4,
//       //             },
//       //           ],
//       //         },
//       //         {
//       //           title: "Asset Health Program Ownership",
//       //           question_text: "How do you know what you have?",
//       //           context: "Asset Health Ownership",
//       //           order: 2,
//       //           applicable_roles: [
//       //             shared_role_name_to_id["Maintenance Superintendent"],
//       //             shared_role_name_to_id["Operations Supervisor"],
//       //             shared_role_name_to_id["Maintenance Supervisor"],
//       //             shared_role_name_to_id["Reliability Engineer"],
//       //             shared_role_name_to_id["Maintenance Planner"],
//       //             shared_role_name_to_id["Scheduler"],
//       //             shared_role_name_to_id["Auditor"],
//       //             shared_role_name_to_id["Maintainer"],
//       //           ],
//       //           rating_scales: [
//       //             {
//       //               name: "Reactive",
//       //               description:
//       //                 "No system in place - Informal process; no documentation.",
//       //               value: 1,
//       //             },
//       //             {
//       //               name: "Planned",
//       //               description:
//       //                 "A system in place and but not effectively followed.",
//       //               value: 2,
//       //             },
//       //             {
//       //               name: "Proactive",
//       //               description:
//       //                 "A system is  in place, documented and followed most of time  to ensure appropriate people take ownership of Asset Health activity.",
//       //               value: 3,
//       //             },
//       //             {
//       //               name: "Optimised",
//       //               description:
//       //                 "A system is  in place, documented and followed all of time  to ensure appropriate people take ownership of Asset Health activity. Asset Health Champion in place and active participation during meeting/reviews.",
//       //               value: 4,
//       //             },
//       //           ],
//       //         },
//       //       ],
//       //     },
//       //     {
//       //       title: "Implement",
//       //       order: 2,
//       //       questions: [
//       //         {
//       //           title: "Asset Selection Process",
//       //           question_text:
//       //             "Have visual inspection routes been established?",
//       //           context: "Asset Selection Process",
//       //           order: 1,
//       //           applicable_roles: [
//       //             shared_role_name_to_id["Maintenance Superintendent"],
//       //             shared_role_name_to_id["Operations Supervisor"],
//       //             shared_role_name_to_id["Maintenance Supervisor"],
//       //             shared_role_name_to_id["Reliability Engineer"],
//       //             shared_role_name_to_id["Maintenance Planner"],
//       //             shared_role_name_to_id["Scheduler"],
//       //             shared_role_name_to_id["Auditor"],
//       //             shared_role_name_to_id["Maintainer"],
//       //           ],
//       //           rating_scales: [
//       //             {
//       //               name: "Reactive",
//       //               description:
//       //                 "No process in place to select equipment and rely on OEM recommendations.",
//       //               value: 1,
//       //             },
//       //             {
//       //               name: "Planned",
//       //               description:
//       //                 "informal process based on 'experience' for selecting equipment. Often list provided by customer.",
//       //               value: 2,
//       //             },
//       //             {
//       //               name: "Proactive",
//       //               description:
//       //                 "A formal AS&T development process where vendor/consultant review equipment to be in Asset Health program.",
//       //               value: 3,
//       //             },
//       //             {
//       //               name: "Optimised",
//       //               description:
//       //                 "An approved rigorous process is used in identifying the correct equipment to receive Asset Health surveys (including criticality reviews).",
//       //               value: 4,
//       //             },
//       //           ],
//       //         },
//       //         {
//       //           title: "Equipment Access Management",
//       //           question_text:
//       //             "How are actionable items reported back to the Asset Health team.",
//       //           context: "Condition Based Maintenance Access",
//       //           order: 2,
//       //           applicable_roles: [
//       //             shared_role_name_to_id["Maintenance Superintendent"],
//       //             shared_role_name_to_id["Operations Supervisor"],
//       //             shared_role_name_to_id["Maintenance Supervisor"],
//       //             shared_role_name_to_id["Reliability Engineer"],
//       //             shared_role_name_to_id["Maintenance Planner"],
//       //             shared_role_name_to_id["Scheduler"],
//       //             shared_role_name_to_id["Auditor"],
//       //             shared_role_name_to_id["Maintainer"],
//       //           ],
//       //           rating_scales: [
//       //             {
//       //               name: "Reactive",
//       //               description:
//       //                 "No system in place to address access issues and only 25% of equipment that requires Asset Health can be accessed safely.",
//       //               value: 1,
//       //             },
//       //             {
//       //               name: "Planned",
//       //               description:
//       //                 "A system in place to address access issues and 50% of equipment that requires Asset Health can be accessed safely.",
//       //               value: 2,
//       //             },
//       //             {
//       //               name: "Proactive",
//       //               description:
//       //                 "A system in place to address access issues and 75% of equipment that requires Asset Health can be accessed safely.",
//       //               value: 3,
//       //             },
//       //             {
//       //               name: "Optimised",
//       //               description:
//       //                 "A system in place to address access issues and all equipment that requires Asset Health can be accessed safely.",
//       //               value: 4,
//       //             },
//       //           ],
//       //         },
//       //         {
//       //           title: "Inspection Route Management",
//       //           question_text: "Is the information (data) centralised?",
//       //           context: "Condition Monintoring Inspection Routes",
//       //           order: 3,
//       //           applicable_roles: [
//       //             shared_role_name_to_id["Maintenance Superintendent"],
//       //             shared_role_name_to_id["Operations Supervisor"],
//       //             shared_role_name_to_id["Maintenance Supervisor"],
//       //             shared_role_name_to_id["Reliability Engineer"],
//       //             shared_role_name_to_id["Maintenance Planner"],
//       //             shared_role_name_to_id["Scheduler"],
//       //             shared_role_name_to_id["Auditor"],
//       //             shared_role_name_to_id["Maintainer"],
//       //           ],
//       //           rating_scales: [
//       //             {
//       //               name: "Reactive",
//       //               description:
//       //                 "None to a few Asset Health inspection routes have been established.",
//       //               value: 1,
//       //             },
//       //             {
//       //               name: "Planned",
//       //               description:
//       //                 "Asset Health inspection routes have been established for Critical and some equipment and followed for routine inspections.",
//       //               value: 2,
//       //             },
//       //             {
//       //               name: "Proactive",
//       //               description:
//       //                 "Asset Health inspection routes have been established for Above Rail and Non-rail equipment and are always followed for routine inspections",
//       //               value: 3,
//       //             },
//       //             {
//       //               name: "Optimised",
//       //               description:
//       //                 "Asset Health inspection routes have been established for all Company equipment and are all followed for routine inspections.",
//       //               value: 4,
//       //             },
//       //           ],
//       //         },
//       //       ],
//       //     },
//       //     {
//       //       title: "Skills",
//       //       order: 3,
//       //       questions: [
//       //         {
//       //           title: "Stakeholder Training and Awareness",
//       //           question_text:
//       //             "Have the stakeholders had any awareness training or background in Asset Health?",
//       //           context: "Stakeholder Understanding",
//       //           order: 1,
//       //           applicable_roles: [
//       //             shared_role_name_to_id["Maintenance Superintendent"],
//       //             shared_role_name_to_id["Operations Supervisor"],
//       //             shared_role_name_to_id["Maintenance Supervisor"],
//       //             shared_role_name_to_id["Reliability Engineer"],
//       //             shared_role_name_to_id["Maintenance Planner"],
//       //             shared_role_name_to_id["Scheduler"],
//       //             shared_role_name_to_id["Auditor"],
//       //             shared_role_name_to_id["Maintainer"],
//       //           ],
//       //           rating_scales: [
//       //             {
//       //               name: "Reactive",
//       //               description:
//       //                 "Understanding amongst stakeholders about Asset Health processes and their value are misunderstood and there is little or no understanding about Asset Health processes and their value.",
//       //               value: 1,
//       //             },
//       //             {
//       //               name: "Planned",
//       //               description:
//       //                 "Stakeholders understand the value and technology for some of the Asset Health processes.",
//       //               value: 2,
//       //             },
//       //             {
//       //               name: "Proactive",
//       //               description:
//       //                 "Above Rail and Non-rail Stakeholders understand the value and technology for the Asset Health processes and have integrated Asset Health  appropriately into some equipment maintenance tactics.",
//       //               value: 3,
//       //             },
//       //             {
//       //               name: "Optimised",
//       //               description:
//       //                 "Company Stakeholders understand the value and technology for all of the Asset Health processes and have integrated Asset Health  appropriately into all equipment maintenance tactics.",
//       //               value: 4,
//       //             },
//       //           ],
//       //         },
//       //         {
//       //           title: "Skills Development and Training",
//       //           question_text:
//       //             "Is there a process in place for continuing development in condition monitoring and analytical skills amongst the teams?",
//       //           context: "Skills & Knowledge",
//       //           order: 2,
//       //           applicable_roles: [
//       //             shared_role_name_to_id["Maintenance Superintendent"],
//       //             shared_role_name_to_id["Operations Supervisor"],
//       //             shared_role_name_to_id["Maintenance Supervisor"],
//       //             shared_role_name_to_id["Reliability Engineer"],
//       //             shared_role_name_to_id["Maintenance Planner"],
//       //             shared_role_name_to_id["Scheduler"],
//       //             shared_role_name_to_id["Auditor"],
//       //             shared_role_name_to_id["Maintainer"],
//       //           ],
//       //           rating_scales: [
//       //             {
//       //               name: "Reactive",
//       //               description:
//       //                 "No formal training or process in place. New technicians informally trained by existing staff.",
//       //               value: 1,
//       //             },
//       //             {
//       //               name: "Planned",
//       //               description:
//       //                 "New technicians formally trained prior to commencing.",
//       //               value: 2,
//       //             },
//       //             {
//       //               name: "Proactive",
//       //               description:
//       //                 "Refresher training is formally provided on a regular and as needed basis.",
//       //               value: 3,
//       //             },
//       //             {
//       //               name: "Optimised",
//       //               description:
//       //                 "Professional development supported with peer interaction encouraged.",
//       //               value: 4,
//       //             },
//       //           ],
//       //         },
//       //       ],
//       //     },
//       //     {
//       //       title: "Acquire Data",
//       //       order: 4,
//       //       questions: [
//       //         {
//       //           title: "Asset Health Information Accessibility",
//       //           question_text:
//       //             "How accessible is Asset Health information to shop floor personnel?",
//       //           context: "Asset Health / asset condition general information",
//       //           order: 1,
//       //           applicable_roles: [
//       //             shared_role_name_to_id["Maintenance Superintendent"],
//       //             shared_role_name_to_id["Operations Supervisor"],
//       //             shared_role_name_to_id["Maintenance Supervisor"],
//       //             shared_role_name_to_id["Reliability Engineer"],
//       //             shared_role_name_to_id["Maintenance Planner"],
//       //             shared_role_name_to_id["Scheduler"],
//       //             shared_role_name_to_id["Auditor"],
//       //             shared_role_name_to_id["Maintainer"],
//       //           ],
//       //           rating_scales: [
//       //             {
//       //               name: "Reactive",
//       //               description:
//       //                 "Asset Health information exists but not clear or accessible.",
//       //               value: 1,
//       //             },
//       //             {
//       //               name: "Planned",
//       //               description: "Asset Health information hard to access.",
//       //               value: 2,
//       //             },
//       //             {
//       //               name: "Proactive",
//       //               description:
//       //                 "Asset Health information readily accessible via electronic media across Above Rail and Non-rail taking into account numerious sources of data",
//       //               value: 3,
//       //             },
//       //             {
//       //               name: "Optimised",
//       //               description:
//       //                 "Asset Health information readily accessible via electronic media across Company taking into account numerious sources of data",
//       //               value: 4,
//       //             },
//       //           ],
//       //         },
//       //         {
//       //           title: "Failed Component Analysis",
//       //           question_text:
//       //             "Are failed components retained and sufficient root cause failure analysis completed?",
//       //           context: "Failed Component Retention",
//       //           order: 2,
//       //           applicable_roles: [
//       //             shared_role_name_to_id["Maintenance Superintendent"],
//       //             shared_role_name_to_id["Operations Supervisor"],
//       //             shared_role_name_to_id["Maintenance Supervisor"],
//       //             shared_role_name_to_id["Reliability Engineer"],
//       //             shared_role_name_to_id["Maintenance Planner"],
//       //             shared_role_name_to_id["Scheduler"],
//       //             shared_role_name_to_id["Auditor"],
//       //             shared_role_name_to_id["Maintainer"],
//       //           ],
//       //           rating_scales: [
//       //             {
//       //               name: "Reactive",
//       //               description:
//       //                 "Failed components are retained ad-hoc. 25% of all failures are retained for Failure Analysis.",
//       //               value: 1,
//       //             },
//       //             {
//       //               name: "Planned",
//       //               description:
//       //                 "50% of all failures are retained for Failure Analysis.",
//       //               value: 2,
//       //             },
//       //             {
//       //               name: "Proactive",
//       //               description:
//       //                 "75% of all failures are retained for Failure Analysis.",
//       //               value: 3,
//       //             },
//       //             {
//       //               name: "Optimised",
//       //               description:
//       //                 "All failures components under a Asset Health program are retained for a full failure analysis",
//       //               value: 4,
//       //             },
//       //           ],
//       //         },
//       //         {
//       //           title: "RCA Implementation and Documentation",
//       //           question_text: "To what extent are RCA performed?",
//       //           context:
//       //             "Root Cause Analysis (RCA) Information\nFrom CMMS data",
//       //           order: 3,
//       //           applicable_roles: [
//       //             shared_role_name_to_id["Maintenance Superintendent"],
//       //             shared_role_name_to_id["Operations Supervisor"],
//       //             shared_role_name_to_id["Maintenance Supervisor"],
//       //             shared_role_name_to_id["Reliability Engineer"],
//       //             shared_role_name_to_id["Maintenance Planner"],
//       //             shared_role_name_to_id["Scheduler"],
//       //             shared_role_name_to_id["Auditor"],
//       //             shared_role_name_to_id["Maintainer"],
//       //           ],
//       //           rating_scales: [
//       //             {
//       //               name: "Reactive",
//       //               description:
//       //                 "RCA is not carried out consistantly using a systematic methodology. Principles of RCA are utilized on occasion but application and reporting is not utilized.",
//       //               value: 1,
//       //             },
//       //             {
//       //               name: "Planned",
//       //               description:
//       //                 "Principles of RCA are utilized but application and reporting is inconsistent.",
//       //               value: 2,
//       //             },
//       //             {
//       //               name: "Proactive",
//       //               description:
//       //                 "Most RCA reports are detailed and accessible.",
//       //               value: 3,
//       //             },
//       //             {
//       //               name: "Optimised",
//       //               description:
//       //                 "All RCA reports are detailed and readily accessible.",
//       //               value: 4,
//       //             },
//       //           ],
//       //         },
//       //       ],
//       //     },
//       //     {
//       //       title: "Analyse Data",
//       //       order: 5,
//       //       questions: [
//       //         {
//       //           title: "Planning and Scheduling Integration",
//       //           question_text:
//       //             "How does the Asset Health team interface with P&S?",
//       //           context:
//       //             "Asset Health Integration with Maintenance Planning & Scheduling",
//       //           order: 1,
//       //           applicable_roles: [
//       //             shared_role_name_to_id["Maintenance Superintendent"],
//       //             shared_role_name_to_id["Operations Supervisor"],
//       //             shared_role_name_to_id["Maintenance Supervisor"],
//       //             shared_role_name_to_id["Reliability Engineer"],
//       //             shared_role_name_to_id["Maintenance Planner"],
//       //             shared_role_name_to_id["Scheduler"],
//       //             shared_role_name_to_id["Auditor"],
//       //             shared_role_name_to_id["Maintainer"],
//       //           ],
//       //           rating_scales: [
//       //             {
//       //               name: "Reactive",
//       //               description:
//       //                 "Asset Health representative has little or no contact with Planners, and Schedulers but do not attend weekly scheduling meeting.",
//       //               value: 1,
//       //             },
//       //             {
//       //               name: "Planned",
//       //               description:
//       //                 "Asset Health representative has some contact with planners and schedulers.",
//       //               value: 2,
//       //             },
//       //             {
//       //               name: "Proactive",
//       //               description:
//       //                 "Asset Health representative has good contact with planners and schedulers and is present at scheduling meeting when significant failures/finds occur.",
//       //               value: 3,
//       //             },
//       //             {
//       //               name: "Optimised",
//       //               description:
//       //                 "Asset Health representative has excellent contact with planners and schedulers and is always  present at weekly scheduling meetings.",
//       //               value: 4,
//       //             },
//       //           ],
//       //         },
//       //         {
//       //           title: "Failure Documentation Standards",
//       //           question_text:
//       //             "1. Are failures well documented sufficiently to allow future reliability analysis?\n2. Do they include failure modes and all other relevant information?",
//       //           context: "Failure Recording",
//       //           order: 2,
//       //           applicable_roles: [
//       //             shared_role_name_to_id["Maintenance Superintendent"],
//       //             shared_role_name_to_id["Operations Supervisor"],
//       //             shared_role_name_to_id["Maintenance Supervisor"],
//       //             shared_role_name_to_id["Reliability Engineer"],
//       //             shared_role_name_to_id["Maintenance Planner"],
//       //             shared_role_name_to_id["Scheduler"],
//       //             shared_role_name_to_id["Auditor"],
//       //             shared_role_name_to_id["Maintainer"],
//       //           ],
//       //           rating_scales: [
//       //             {
//       //               name: "Reactive",
//       //               description:
//       //                 "Failure modes not consistantly recorded in work order. 25% of critical failures are documented properly.",
//       //               value: 1,
//       //             },
//       //             {
//       //               name: "Planned",
//       //               description:
//       //                 "75% of critical failures are documented properly.",
//       //               value: 2,
//       //             },
//       //             {
//       //               name: "Proactive",
//       //               description:
//       //                 "100% of critical failures are documented properly.",
//       //               value: 3,
//       //             },
//       //             {
//       //               name: "Optimised",
//       //               description:
//       //                 "All failures are recorded properly in a consistent manner.",
//       //               value: 4,
//       //             },
//       //           ],
//       //         },
//       //         {
//       //           title: "Reliability Engineering Collaboration",
//       //           question_text:
//       //             "What level of interaction occurs between Asset Health tech's and Res?",
//       //           context: "Asset Health Tech's Access to RE",
//       //           order: 3,
//       //           applicable_roles: [
//       //             shared_role_name_to_id["Maintenance Superintendent"],
//       //             shared_role_name_to_id["Operations Supervisor"],
//       //             shared_role_name_to_id["Maintenance Supervisor"],
//       //             shared_role_name_to_id["Reliability Engineer"],
//       //             shared_role_name_to_id["Maintenance Planner"],
//       //             shared_role_name_to_id["Scheduler"],
//       //             shared_role_name_to_id["Auditor"],
//       //             shared_role_name_to_id["Maintainer"],
//       //           ],
//       //           rating_scales: [
//       //             {
//       //               name: "Reactive",
//       //               description: "Asset Health have little or no access RE's.",
//       //               value: 1,
//       //             },
//       //             {
//       //               name: "Planned",
//       //               description:
//       //                 "Asset Health have access to and are updated on RCA information upon request.",
//       //               value: 2,
//       //             },
//       //             {
//       //               name: "Proactive",
//       //               description:
//       //                 "Asset Health have access to and are updated on RCA information.",
//       //               value: 3,
//       //             },
//       //             {
//       //               name: "Optimised",
//       //               description:
//       //                 "Asset Health have full access to and are always updated on RCA information.",
//       //               value: 4,
//       //             },
//       //           ],
//       //         },
//       //       ],
//       //     },
//       //     {
//       //       title: "Report",
//       //       order: 6,
//       //       questions: [
//       //         {
//       //           title: "Recommendation Implementation",
//       //           question_text:
//       //             "When a recommendation for corrective action is made; what happens?",
//       //           context: "Asset Health Recommendations - Actioning",
//       //           order: 1,
//       //           applicable_roles: [
//       //             shared_role_name_to_id["Maintenance Superintendent"],
//       //             shared_role_name_to_id["Operations Supervisor"],
//       //             shared_role_name_to_id["Maintenance Supervisor"],
//       //             shared_role_name_to_id["Reliability Engineer"],
//       //             shared_role_name_to_id["Maintenance Planner"],
//       //             shared_role_name_to_id["Scheduler"],
//       //             shared_role_name_to_id["Auditor"],
//       //             shared_role_name_to_id["Maintainer"],
//       //           ],
//       //           rating_scales: [
//       //             {
//       //               name: "Reactive",
//       //               description:
//       //                 "Asset Health recommendations are not followed and routinely acted upon.",
//       //               value: 1,
//       //             },
//       //             {
//       //               name: "Planned",
//       //               description:
//       //                 "Asset Health recommendations are valued but tend to be pushed out when there are conflicting priorities.",
//       //               value: 2,
//       //             },
//       //             {
//       //               name: "Proactive",
//       //               description:
//       //                 "Most recommendations are actioned  within the required timeframe considering criticality.",
//       //               value: 3,
//       //             },
//       //             {
//       //               name: "Optimised",
//       //               description:
//       //                 "All Asset Health recommendations are actioned  within the time frame required.",
//       //               value: 4,
//       //             },
//       //           ],
//       //         },
//       //         {
//       //           title: "Stakeholder Feedback Management",
//       //           question_text: "Have the stakeholders been identified?",
//       //           context: "Stakeholder Feedback",
//       //           order: 2,
//       //           applicable_roles: [
//       //             shared_role_name_to_id["Maintenance Superintendent"],
//       //             shared_role_name_to_id["Operations Supervisor"],
//       //             shared_role_name_to_id["Maintenance Supervisor"],
//       //             shared_role_name_to_id["Reliability Engineer"],
//       //             shared_role_name_to_id["Maintenance Planner"],
//       //             shared_role_name_to_id["Scheduler"],
//       //             shared_role_name_to_id["Auditor"],
//       //             shared_role_name_to_id["Maintainer"],
//       //           ],
//       //           rating_scales: [
//       //             {
//       //               name: "Reactive",
//       //               description:
//       //                 "No stakeholders have been identified. No stakeholder feedback is sought or given.",
//       //               value: 1,
//       //             },
//       //             {
//       //               name: "Planned",
//       //               description: "Stakeholder Feedback is sought occasionally.",
//       //               value: 2,
//       //             },
//       //             {
//       //               name: "Proactive",
//       //               description:
//       //                 "A system in place to ensure Above Rail and Non-rail stakeholders feedback is given by and it is always acted upon.",
//       //               value: 3,
//       //             },
//       //             {
//       //               name: "Optimised",
//       //               description:
//       //                 "A system in place to ensure All Company stakeholders feedback is given by and it is always acted upon.",
//       //               value: 4,
//       //             },
//       //           ],
//       //         },
//       //         {
//       //           title: "Asset Health Reporting Standards",
//       //           question_text:
//       //             "Do Asset Health reports exists and are they standardised?",
//       //           context: "Asset Information",
//       //           order: 3,
//       //           applicable_roles: [
//       //             shared_role_name_to_id["Maintenance Superintendent"],
//       //             shared_role_name_to_id["Operations Supervisor"],
//       //             shared_role_name_to_id["Maintenance Supervisor"],
//       //             shared_role_name_to_id["Reliability Engineer"],
//       //             shared_role_name_to_id["Maintenance Planner"],
//       //             shared_role_name_to_id["Scheduler"],
//       //             shared_role_name_to_id["Auditor"],
//       //             shared_role_name_to_id["Maintainer"],
//       //           ],
//       //           rating_scales: [
//       //             {
//       //               name: "Reactive",
//       //               description:
//       //                 "Less than 25% of monitored equipment has completed data sheets.",
//       //               value: 1,
//       //             },
//       //             {
//       //               name: "Planned",
//       //               description:
//       //                 "50% of monitored equipment has completed data sheets.",
//       //               value: 2,
//       //             },
//       //             {
//       //               name: "Proactive",
//       //               description:
//       //                 "75% of monitored equipment has completed data sheets. \n100% of critical equipment has completed data sheets.",
//       //               value: 3,
//       //             },
//       //             {
//       //               name: "Optimised",
//       //               description:
//       //                 "Accurate detailed data sheets available for all equipment under Asset Health surveys.",
//       //               value: 4,
//       //             },
//       //           ],
//       //         },
//       //         {
//       //           title: "Recommendation Tracking Systems",
//       //           question_text:
//       //             "How do you know when something is repaired or replaced once a recommendation is acted upon?",
//       //           context: "Asset Health Recommendations - Tracking",
//       //           order: 4,
//       //           applicable_roles: [
//       //             shared_role_name_to_id["Maintenance Superintendent"],
//       //             shared_role_name_to_id["Operations Supervisor"],
//       //             shared_role_name_to_id["Maintenance Supervisor"],
//       //             shared_role_name_to_id["Reliability Engineer"],
//       //             shared_role_name_to_id["Maintenance Planner"],
//       //             shared_role_name_to_id["Scheduler"],
//       //             shared_role_name_to_id["Auditor"],
//       //             shared_role_name_to_id["Maintainer"],
//       //           ],
//       //           rating_scales: [
//       //             {
//       //               name: "Reactive",
//       //               description:
//       //                 "Asset Health recommendations are not tracked.\nPlan/methodology has not been fully developed for tracking status of recommendations.",
//       //               value: 1,
//       //             },
//       //             {
//       //               name: "Planned",
//       //               description:
//       //                 "Plan/methodology has been developed for tracking status of recommendations. Working on deployment.",
//       //               value: 2,
//       //             },
//       //             {
//       //               name: "Proactive",
//       //               description:
//       //                 "A consistent methodology is used to track the current status of most recommendations",
//       //               value: 3,
//       //             },
//       //             {
//       //               name: "Optimised",
//       //               description:
//       //                 "A consistent methodology is used to track the current status of all Asset Health recommendations",
//       //               value: 4,
//       //             },
//       //           ],
//       //         },
//       //       ],
//       //     },
//       //     {
//       //       title: "Improve",
//       //       order: 7,
//       //       questions: [
//       //         {
//       //           title: "Continuous Improvement Process",
//       //           question_text:
//       //             "How do you know if your equipment is in calibration or not?",
//       //           context: "Asset Health Continuous Improvement",
//       //           order: 1,
//       //           applicable_roles: [
//       //             shared_role_name_to_id["Maintenance Superintendent"],
//       //             shared_role_name_to_id["Operations Supervisor"],
//       //             shared_role_name_to_id["Maintenance Supervisor"],
//       //             shared_role_name_to_id["Reliability Engineer"],
//       //             shared_role_name_to_id["Maintenance Planner"],
//       //             shared_role_name_to_id["Scheduler"],
//       //             shared_role_name_to_id["Auditor"],
//       //             shared_role_name_to_id["Maintainer"],
//       //           ],
//       //           rating_scales: [
//       //             {
//       //               name: "Reactive",
//       //               description:
//       //                 "Asset Health self-audit tools not readily  available. Some Asset Health self-audit tools are available but not used to identify improvement opportunities.",
//       //               value: 1,
//       //             },
//       //             {
//       //               name: "Planned",
//       //               description:
//       //                 "Some Asset Health self-audit tools are available and occasionally used to identify improvement opportunities. Improvement opportunities  not often actioned.",
//       //               value: 2,
//       //             },
//       //             {
//       //               name: "Proactive",
//       //               description:
//       //                 "Asset Health self-audit tools are available and often used to identify improvement opportunities. Most Improvement opportunities actioned.",
//       //               value: 3,
//       //             },
//       //             {
//       //               name: "Optimised",
//       //               description:
//       //                 "Asset Health self-audit tools are available and regularly used to identify improvement opportunities. Improvement opportunities are always actioned.",
//       //               value: 4,
//       //             },
//       //           ],
//       //         },
//       //         {
//       //           title: "Change Management Process",
//       //           question_text:
//       //             "Are they rushed to judgment when it comes to analysis?",
//       //           context: "Asset Health Change Management",
//       //           order: 2,
//       //           applicable_roles: [
//       //             shared_role_name_to_id["Maintenance Superintendent"],
//       //             shared_role_name_to_id["Operations Supervisor"],
//       //             shared_role_name_to_id["Maintenance Supervisor"],
//       //             shared_role_name_to_id["Reliability Engineer"],
//       //             shared_role_name_to_id["Maintenance Planner"],
//       //             shared_role_name_to_id["Scheduler"],
//       //             shared_role_name_to_id["Auditor"],
//       //             shared_role_name_to_id["Maintainer"],
//       //           ],
//       //           rating_scales: [
//       //             {
//       //               name: "Reactive",
//       //               description:
//       //                 "Changes to Asset Health program not documented. Overall Asset Health procedure in place but not utilized.",
//       //               value: 1,
//       //             },
//       //             {
//       //               name: "Planned",
//       //               description: "Some changes are documented.",
//       //               value: 2,
//       //             },
//       //             {
//       //               name: "Proactive",
//       //               description:
//       //                 "Most Major changes to Asset Health program are documented using a change management process.",
//       //               value: 3,
//       //             },
//       //             {
//       //               name: "Optimised",
//       //               description:
//       //                 "All Changes to Asset Health program are documented using a change management process.",
//       //               value: 4,
//       //             },
//       //           ],
//       //         },
//       //         {
//       //           title: "Value Communication and Recognition",
//       //           question_text: "How are 'wins' or 'saves' acknowledged?",
//       //           context: "Asset Health value add",
//       //           order: 3,
//       //           applicable_roles: [
//       //             shared_role_name_to_id["Maintenance Superintendent"],
//       //             shared_role_name_to_id["Operations Supervisor"],
//       //             shared_role_name_to_id["Maintenance Supervisor"],
//       //             shared_role_name_to_id["Reliability Engineer"],
//       //             shared_role_name_to_id["Maintenance Planner"],
//       //             shared_role_name_to_id["Scheduler"],
//       //             shared_role_name_to_id["Auditor"],
//       //             shared_role_name_to_id["Maintainer"],
//       //           ],
//       //           rating_scales: [
//       //             {
//       //               name: "Reactive",
//       //               description:
//       //                 "Asset Health value add is not or rarely publicised.",
//       //               value: 1,
//       //             },
//       //             {
//       //               name: "Planned",
//       //               description:
//       //                 "Asset Health value add is publicized occasionally in one way or another.",
//       //               value: 2,
//       //             },
//       //             {
//       //               name: "Proactive",
//       //               description:
//       //                 "Asset Health value add is often publicized in one way or another.",
//       //               value: 3,
//       //             },
//       //             {
//       //               name: "Optimised",
//       //               description:
//       //                 "Asset Health value add is regularly publicized and promoted in readily accessible media.",
//       //               value: 4,
//       //             },
//       //           ],
//       //         },
//       //       ],
//       //     },
//       //   ],
//       // },
//     ],
//   },
// ];
