import type { Questionnaire } from "../../types";

export const questionnaire: Questionnaire = {
  id: "pre-assessment-mining-ops",
  name: "Mining Operations Readiness Assessment",
  description:
    "Pre-assessment to evaluate organizational readiness and identify priority areas for the comprehensive Mining Operations Questionnaire",
  guidelines:
    "This assessment helps determine your organization's current maturity level and readiness for detailed evaluation. Answer based on current state, not aspirational goals.",
  rating_scales: [
    {
      id: "pre-assessment-mining-ops-rating-scale-1",
      name: "Ad-hoc/Reactive",
      description:
        "Mostly unplanned work, responding to breakdowns and emergencies with no formal processes",
      value: 1,
      order_index: 0,
    },
    {
      id: "pre-assessment-mining-ops-rating-scale-2",
      name: "Basic/Developing",
      description:
        "Some planning and processes exist but are inconsistent and often interrupted",
      value: 2,
      order_index: 1,
    },
    {
      id: "pre-assessment-mining-ops-rating-scale-3",
      name: "Systematic",
      description:
        "Formal processes exist and are generally followed with defined procedures",
      value: 3,
      order_index: 2,
    },
    {
      id: "pre-assessment-mining-ops-rating-scale-4",
      name: "Optimized",
      description:
        "Comprehensive processes with high compliance and continuous improvement",
      value: 4,
      order_index: 3,
    },
  ],
  sections: [
    {
      id: "pre-assessment-mining-ops-section-1",
      title: "Work Management",
      order: 1,
      steps: [
        {
          id: "pre-assessment-mining-ops-section-1-step-1",
          title: "Process Maturity & Data Usage",
          order: 1,
          questions: [
            {
              id: "pre-assessment-mining-ops-section-1-step-1-question-1",
              title: "Work Management Process Maturity",
              question_text:
                "How would you describe your organization's current work management process?",
              context:
                "Process Assessment\nEvaluate the maturity of your work management systems:\n• Planning and scheduling processes\n• Work identification methods\n• PM compliance and execution\n• Emergency work percentage\n• Schedule compliance rates",
              order: 1,
              applicable_roles: [],
              rating_scales: [
                {
                  id: "pre-assessment-mining-ops-section-1-step-1-question-1-rating-scale-1",
                  questionnaire_rating_scale_id:
                    "pre-assessment-mining-ops-rating-scale-1",
                  name: "Ad-hoc/Reactive",
                  description:
                    "Work is mostly unplanned, responding to breakdowns and emergencies. No formal work identification or planning processes.",
                  value: 1,
                },
                {
                  id: "pre-assessment-mining-ops-section-1-step-1-question-1-rating-scale-2",
                  questionnaire_rating_scale_id:
                    "pre-assessment-mining-ops-rating-scale-2",
                  name: "Basic/Developing",
                  description:
                    "Some planning exists but inconsistent. Basic PM schedules in place but often interrupted by urgent work.",
                  value: 2,
                },
                {
                  id: "pre-assessment-mining-ops-section-1-step-1-question-1-rating-scale-3",
                  questionnaire_rating_scale_id:
                    "pre-assessment-mining-ops-rating-scale-3",
                  name: "Systematic",
                  description:
                    "Formal planning and scheduling processes exist and are generally followed. Most work is planned with defined procedures.",
                  value: 3,
                },
                {
                  id: "pre-assessment-mining-ops-section-1-step-1-question-1-rating-scale-4",
                  questionnaire_rating_scale_id:
                    "pre-assessment-mining-ops-rating-scale-4",
                  name: "Optimized",
                  description:
                    "Comprehensive work management with high schedule compliance, integrated planning, and continuous improvement.",
                  value: 4,
                },
              ],
            },
            {
              id: "pre-assessment-mining-ops-section-1-step-1-question-2",
              title: "Data-Driven Decision Making",
              question_text:
                "To what extent does your organization use data and KPIs to drive maintenance decisions?",
              context:
                "Data Utilization\nAssess how data influences maintenance decisions:\n• KPI tracking and reporting\n• Data quality and availability\n• Analytics capabilities\n• Decision-making processes\n• Performance trending",
              order: 2,
              applicable_roles: [],
              rating_scales: [
                {
                  id: "pre-assessment-mining-ops-section-1-step-1-question-2-rating-scale-1",
                  questionnaire_rating_scale_id:
                    "pre-assessment-mining-ops-rating-scale-1",
                  name: "Minimal",
                  description:
                    "Decisions based mainly on experience and intuition. Limited data collection or KPI tracking.",
                  value: 1,
                },
                {
                  id: "pre-assessment-mining-ops-section-1-step-1-question-2-rating-scale-2",
                  questionnaire_rating_scale_id:
                    "pre-assessment-mining-ops-rating-scale-2",
                  name: "Basic Tracking",
                  description:
                    "Some KPIs tracked but not consistently used for decisions. Data exists but not well organized.",
                  value: 2,
                },
                {
                  id: "pre-assessment-mining-ops-section-1-step-1-question-2-rating-scale-3",
                  questionnaire_rating_scale_id:
                    "pre-assessment-mining-ops-rating-scale-3",
                  name: "Regular Analysis",
                  description:
                    "KPIs regularly reviewed and influence decisions. Data drives most maintenance planning.",
                  value: 3,
                },
                {
                  id: "pre-assessment-mining-ops-section-1-step-1-question-2-rating-scale-4",
                  questionnaire_rating_scale_id:
                    "pre-assessment-mining-ops-rating-scale-4",
                  name: "Advanced Analytics",
                  description:
                    "Comprehensive metrics with predictive analytics. All decisions backed by data and trend analysis.",
                  value: 4,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "pre-assessment-mining-ops-section-2",
      title: "Defect Elimination",
      order: 2,
      steps: [
        {
          id: "pre-assessment-mining-ops-section-2-step-1",
          title: "Failure Response & Collaboration",
          order: 1,
          questions: [
            {
              id: "pre-assessment-mining-ops-section-2-step-1-question-1",
              title: "Failure Analysis Culture",
              question_text:
                "How does your organization typically respond to equipment failures?",
              context:
                "Failure Response\nEvaluate your approach to equipment failures:\n• Root cause analysis practices\n• Investigation depth and consistency\n• Corrective action implementation\n• Knowledge capture and sharing\n• Prevention focus",
              order: 1,
              applicable_roles: [],
              rating_scales: [
                {
                  id: "pre-assessment-mining-ops-section-2-step-1-question-1-rating-scale-1",
                  questionnaire_rating_scale_id:
                    "pre-assessment-mining-ops-rating-scale-1",
                  name: "Fix and Forget",
                  description:
                    "Focus on quick repairs to resume operations. Minimal investigation into root causes.",
                  value: 1,
                },
                {
                  id: "pre-assessment-mining-ops-section-2-step-1-question-1-rating-scale-2",
                  questionnaire_rating_scale_id:
                    "pre-assessment-mining-ops-rating-scale-2",
                  name: "Occasional Review",
                  description:
                    "Major failures investigated but no systematic approach. Some lessons learned captured.",
                  value: 2,
                },
                {
                  id: "pre-assessment-mining-ops-section-2-step-1-question-1-rating-scale-3",
                  questionnaire_rating_scale_id:
                    "pre-assessment-mining-ops-rating-scale-3",
                  name: "Systematic Analysis",
                  description:
                    "Formal RCA process for significant failures. Actions tracked and implemented.",
                  value: 3,
                },
                {
                  id: "pre-assessment-mining-ops-section-2-step-1-question-1-rating-scale-4",
                  questionnaire_rating_scale_id:
                    "pre-assessment-mining-ops-rating-scale-4",
                  name: "Proactive Prevention",
                  description:
                    "Comprehensive defect elimination program. Pattern analysis prevents future failures.",
                  value: 4,
                },
              ],
            },
            {
              id: "pre-assessment-mining-ops-section-2-step-1-question-2",
              title: "Cross-Functional Collaboration",
              question_text:
                "How well do Operations, Maintenance, and Reliability teams work together?",
              context:
                "Team Integration\nAssess collaboration between departments:\n• Communication effectiveness\n• Joint planning sessions\n• Shared goals and metrics\n• Problem-solving approach\n• Cultural alignment",
              order: 2,
              applicable_roles: [],
              rating_scales: [
                {
                  id: "pre-assessment-mining-ops-section-2-step-1-question-2-rating-scale-1",
                  questionnaire_rating_scale_id:
                    "pre-assessment-mining-ops-rating-scale-1",
                  name: "Siloed",
                  description:
                    "Departments work independently with minimal communication. Blame culture exists.",
                  value: 1,
                },
                {
                  id: "pre-assessment-mining-ops-section-2-step-1-question-2-rating-scale-2",
                  questionnaire_rating_scale_id:
                    "pre-assessment-mining-ops-rating-scale-2",
                  name: "Basic Coordination",
                  description:
                    "Some communication between departments but limited collaboration on improvements.",
                  value: 2,
                },
                {
                  id: "pre-assessment-mining-ops-section-2-step-1-question-2-rating-scale-3",
                  questionnaire_rating_scale_id:
                    "pre-assessment-mining-ops-rating-scale-3",
                  name: "Good Partnership",
                  description:
                    "Regular meetings and joint planning. Teams work together on problem-solving.",
                  value: 3,
                },
                {
                  id: "pre-assessment-mining-ops-section-2-step-1-question-2-rating-scale-4",
                  questionnaire_rating_scale_id:
                    "pre-assessment-mining-ops-rating-scale-4",
                  name: "Fully Integrated",
                  description:
                    "Seamless collaboration with shared goals and metrics. Joint accountability for results.",
                  value: 4,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "pre-assessment-mining-ops-section-3",
      title: "Asset Strategy Tactics",
      order: 3,
      steps: [
        {
          id: "pre-assessment-mining-ops-section-3-step-1",
          title: "Strategy Development & Criticality",
          order: 1,
          questions: [
            {
              id: "pre-assessment-mining-ops-section-3-step-1-question-1",
              title: "Maintenance Strategy Development",
              question_text:
                "How are maintenance strategies and tactics developed for your equipment?",
              context:
                "Strategy Methodology\nEvaluate maintenance strategy development:\n• Analysis methods used (RCM, FMEA)\n• Decision criteria applied\n• Review and update frequency\n• Optimization approach\n• Documentation quality",
              order: 1,
              applicable_roles: [],
              rating_scales: [
                {
                  id: "pre-assessment-mining-ops-section-3-step-1-question-1-rating-scale-1",
                  questionnaire_rating_scale_id:
                    "pre-assessment-mining-ops-rating-scale-1",
                  name: "OEM/Time-Based",
                  description:
                    "Follow OEM recommendations or calendar-based schedules. No formal analysis.",
                  value: 1,
                },
                {
                  id: "pre-assessment-mining-ops-section-3-step-1-question-1-rating-scale-2",
                  questionnaire_rating_scale_id:
                    "pre-assessment-mining-ops-rating-scale-2",
                  name: "Experience-Based",
                  description:
                    "Tactics based on maintenance team experience. Some informal reviews conducted.",
                  value: 2,
                },
                {
                  id: "pre-assessment-mining-ops-section-3-step-1-question-1-rating-scale-3",
                  questionnaire_rating_scale_id:
                    "pre-assessment-mining-ops-rating-scale-3",
                  name: "Risk-Based",
                  description:
                    "Formal methodology (RCM, FMEA) used for critical equipment. Regular reviews conducted.",
                  value: 3,
                },
                {
                  id: "pre-assessment-mining-ops-section-3-step-1-question-1-rating-scale-4",
                  questionnaire_rating_scale_id:
                    "pre-assessment-mining-ops-rating-scale-4",
                  name: "Optimized Lifecycle",
                  description:
                    "Comprehensive tactics for all equipment based on criticality, with continuous optimization.",
                  value: 4,
                },
              ],
            },
            {
              id: "pre-assessment-mining-ops-section-3-step-1-question-2",
              title: "Equipment Criticality Understanding",
              question_text:
                "Has your organization assessed and ranked equipment criticality?",
              context:
                "Criticality Assessment\nEvaluate equipment criticality analysis:\n• Assessment methodology\n• Ranking criteria used\n• Documentation completeness\n• Update frequency\n• Integration with maintenance planning",
              order: 2,
              applicable_roles: [],
              rating_scales: [
                {
                  id: "pre-assessment-mining-ops-section-3-step-1-question-2-rating-scale-1",
                  questionnaire_rating_scale_id:
                    "pre-assessment-mining-ops-rating-scale-1",
                  name: "No Assessment",
                  description:
                    "No formal criticality ranking. All equipment treated similarly.",
                  value: 1,
                },
                {
                  id: "pre-assessment-mining-ops-section-3-step-1-question-2-rating-scale-2",
                  questionnaire_rating_scale_id:
                    "pre-assessment-mining-ops-rating-scale-2",
                  name: "Informal Knowledge",
                  description:
                    "Team knows critical equipment informally but no documented analysis.",
                  value: 2,
                },
                {
                  id: "pre-assessment-mining-ops-section-3-step-1-question-2-rating-scale-3",
                  questionnaire_rating_scale_id:
                    "pre-assessment-mining-ops-rating-scale-3",
                  name: "Documented Ranking",
                  description:
                    "Formal criticality assessment completed and documented for most equipment.",
                  value: 3,
                },
                {
                  id: "pre-assessment-mining-ops-section-3-step-1-question-2-rating-scale-4",
                  questionnaire_rating_scale_id:
                    "pre-assessment-mining-ops-rating-scale-4",
                  name: "Dynamic Assessment",
                  description:
                    "Comprehensive criticality analysis regularly updated based on operational changes.",
                  value: 4,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "pre-assessment-mining-ops-section-4",
      title: "Asset Health",
      order: 4,
      steps: [
        {
          id: "pre-assessment-mining-ops-section-4-step-1",
          title: "Condition Monitoring & Data Utilization",
          order: 1,
          questions: [
            {
              id: "pre-assessment-mining-ops-section-4-step-1-question-1",
              title: "Condition Monitoring Program",
              question_text:
                "What condition monitoring technologies and practices are currently in use?",
              context:
                "Monitoring Capabilities\nAssess condition monitoring program:\n• Technologies deployed (vibration, oil analysis, thermography)\n• Coverage of critical equipment\n• Route frequency and compliance\n• Online monitoring systems\n• Data quality and accessibility",
              order: 1,
              applicable_roles: [],
              rating_scales: [
                {
                  id: "pre-assessment-mining-ops-section-4-step-1-question-1-rating-scale-1",
                  questionnaire_rating_scale_id:
                    "pre-assessment-mining-ops-rating-scale-1",
                  name: "Run to Failure",
                  description:
                    "Minimal or no condition monitoring. Equipment runs until it fails.",
                  value: 1,
                },
                {
                  id: "pre-assessment-mining-ops-section-4-step-1-question-1-rating-scale-2",
                  questionnaire_rating_scale_id:
                    "pre-assessment-mining-ops-rating-scale-2",
                  name: "Basic Inspections",
                  description:
                    "Visual inspections and basic measurements. Some predictive tools used reactively.",
                  value: 2,
                },
                {
                  id: "pre-assessment-mining-ops-section-4-step-1-question-1-rating-scale-3",
                  questionnaire_rating_scale_id:
                    "pre-assessment-mining-ops-rating-scale-3",
                  name: "Established Program",
                  description:
                    "Regular PdM routes with multiple technologies. Most critical equipment covered.",
                  value: 3,
                },
                {
                  id: "pre-assessment-mining-ops-section-4-step-1-question-1-rating-scale-4",
                  questionnaire_rating_scale_id:
                    "pre-assessment-mining-ops-rating-scale-4",
                  name: "Advanced Integration",
                  description:
                    "Comprehensive condition monitoring with online systems and predictive analytics.",
                  value: 4,
                },
              ],
            },
            {
              id: "pre-assessment-mining-ops-section-4-step-1-question-2",
              title: "Asset Health Data Utilization",
              question_text:
                "How effectively is condition monitoring data used for maintenance decisions?",
              context:
                "Data Application\nEvaluate how condition data drives decisions:\n• Analysis and interpretation quality\n• Response time to anomalies\n• Integration with work planning\n• Predictive capabilities\n• Cost avoidance tracking",
              order: 2,
              applicable_roles: [],
              rating_scales: [
                {
                  id: "pre-assessment-mining-ops-section-4-step-1-question-2-rating-scale-1",
                  questionnaire_rating_scale_id:
                    "pre-assessment-mining-ops-rating-scale-1",
                  name: "Data Not Used",
                  description:
                    "Data collected but rarely influences maintenance decisions.",
                  value: 1,
                },
                {
                  id: "pre-assessment-mining-ops-section-4-step-1-question-2-rating-scale-2",
                  questionnaire_rating_scale_id:
                    "pre-assessment-mining-ops-rating-scale-2",
                  name: "Reactive Use",
                  description:
                    "Data reviewed when problems occur. Limited proactive application.",
                  value: 2,
                },
                {
                  id: "pre-assessment-mining-ops-section-4-step-1-question-2-rating-scale-3",
                  questionnaire_rating_scale_id:
                    "pre-assessment-mining-ops-rating-scale-3",
                  name: "Proactive Planning",
                  description:
                    "Data regularly analyzed and drives maintenance scheduling and planning.",
                  value: 3,
                },
                {
                  id: "pre-assessment-mining-ops-section-4-step-1-question-2-rating-scale-4",
                  questionnaire_rating_scale_id:
                    "pre-assessment-mining-ops-rating-scale-4",
                  name: "Predictive Optimization",
                  description:
                    "Advanced analytics predict failures. Maintenance optimized based on actual condition.",
                  value: 4,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "pre-assessment-mining-ops-section-5",
      title: "Organizational Readiness",
      order: 5,
      steps: [
        {
          id: "pre-assessment-mining-ops-section-5-step-1",
          title: "Capability & Change Management",
          order: 1,
          questions: [
            {
              id: "pre-assessment-mining-ops-section-5-step-1-question-1",
              title: "Resource Capability and Training",
              question_text:
                "How would you assess your team's skills and training for modern maintenance practices?",
              context:
                "Skills Assessment\nEvaluate organizational capabilities:\n• Technical competencies\n• Planning and scheduling skills\n• Reliability engineering knowledge\n• Technology adoption\n• Training programs effectiveness",
              order: 1,
              applicable_roles: [],
              rating_scales: [
                {
                  id: "pre-assessment-mining-ops-section-5-step-1-question-1-rating-scale-1",
                  questionnaire_rating_scale_id:
                    "pre-assessment-mining-ops-rating-scale-1",
                  name: "Significant Gaps",
                  description:
                    "Limited formal training. Skills gaps in planning, reliability, and technology use.",
                  value: 1,
                },
                {
                  id: "pre-assessment-mining-ops-section-5-step-1-question-1-rating-scale-2",
                  questionnaire_rating_scale_id:
                    "pre-assessment-mining-ops-rating-scale-2",
                  name: "Basic Competency",
                  description:
                    "Some training provided but inconsistent. Key roles have basic skills.",
                  value: 2,
                },
                {
                  id: "pre-assessment-mining-ops-section-5-step-1-question-1-rating-scale-3",
                  questionnaire_rating_scale_id:
                    "pre-assessment-mining-ops-rating-scale-3",
                  name: "Well Trained",
                  description:
                    "Comprehensive training programs. Most staff competent in their roles.",
                  value: 3,
                },
                {
                  id: "pre-assessment-mining-ops-section-5-step-1-question-1-rating-scale-4",
                  questionnaire_rating_scale_id:
                    "pre-assessment-mining-ops-rating-scale-4",
                  name: "Continuous Development",
                  description:
                    "Ongoing professional development. Multi-skilled teams with advanced capabilities.",
                  value: 4,
                },
              ],
            },
            {
              id: "pre-assessment-mining-ops-section-5-step-1-question-2",
              title: "Change Readiness",
              question_text:
                "How ready is your organization for implementing maintenance improvement initiatives?",
              context:
                "Implementation Readiness\nAssess change management capability:\n• Leadership support\n• Resource availability\n• Team engagement\n• Past initiative success\n• Improvement culture",
              order: 2,
              applicable_roles: [],
              rating_scales: [
                {
                  id: "pre-assessment-mining-ops-section-5-step-1-question-2-rating-scale-1",
                  questionnaire_rating_scale_id:
                    "pre-assessment-mining-ops-rating-scale-1",
                  name: "Resistant",
                  description:
                    "Strong resistance to change. Previous initiatives have failed. Low management support.",
                  value: 1,
                },
                {
                  id: "pre-assessment-mining-ops-section-5-step-1-question-2-rating-scale-2",
                  questionnaire_rating_scale_id:
                    "pre-assessment-mining-ops-rating-scale-2",
                  name: "Cautious",
                  description:
                    "Some openness to change but skepticism exists. Limited resources for improvements.",
                  value: 2,
                },
                {
                  id: "pre-assessment-mining-ops-section-5-step-1-question-2-rating-scale-3",
                  questionnaire_rating_scale_id:
                    "pre-assessment-mining-ops-rating-scale-3",
                  name: "Supportive",
                  description:
                    "Management supports improvements. Resources available and teams engaged.",
                  value: 3,
                },
                {
                  id: "pre-assessment-mining-ops-section-5-step-1-question-2-rating-scale-4",
                  questionnaire_rating_scale_id:
                    "pre-assessment-mining-ops-rating-scale-4",
                  name: "Change Champions",
                  description:
                    "Strong culture of continuous improvement. Full organizational commitment to excellence.",
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