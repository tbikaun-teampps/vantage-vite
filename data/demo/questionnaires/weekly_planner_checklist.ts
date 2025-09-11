import type { Questionnaire } from "../../types";

export const questionnaire: Questionnaire = {
  id: "weekly-planner-checkin-1",
  name: "Weekly Planner Performance Check-In",
  description:
    "Quick weekly assessment to evaluate planning effectiveness, workload management, and identify improvement opportunities for maintenance planners",
  guidelines:
    "Complete this check-in at the end of each week to track planning performance, identify bottlenecks, and ensure continuous improvement in work planning processes",
  rating_scales: [
    {
      id: "weekly-planner-checkin-1-rating-scale-0",
      name: "Needs Attention",
      description:
        "Performance below expectations or significant challenges encountered requiring immediate support",
      value: 0,
      order_index: 0,
    },
    {
      id: "weekly-planner-checkin-1-rating-scale-1",
      name: "On Track",
      description:
        "Performance meeting expectations with minor issues that can be managed",
      value: 1,
      order_index: 1,
    },
    {
      id: "weekly-planner-checkin-1-rating-scale-2",
      name: "Exceeding",
      description:
        "Performance above expectations with opportunities to share best practices",
      value: 2,
      order_index: 2,
    },
  ],
  sections: [
    {
      id: "weekly-planner-checkin-1-section-1",
      title: "Work Planning Performance",
      order: 1,
      steps: [
        {
          id: "weekly-planner-checkin-1-section-1-step-1",
          title: "Planning Metrics",
          order: 1,
          questions: [
            {
              id: "weekly-planner-checkin-1-section-1-step-1-question-1",
              title: "Work Order Planning Completion",
              question_text:
                "How many work orders did you fully plan this week compared to your target? Consider job plans, materials, labor estimates, and safety requirements completed.",
              context:
                "Target vs Actual\nAssess the volume of work orders completely planned including all required elements:\n• Job plans with detailed steps\n• Bill of materials identified\n• Labor hours estimated\n• Permits and safety requirements documented\n• Special tools identified",
              order: 1,
              applicable_roles: ["shared-role-20", "shared-role-21"],
              rating_scales: [
                {
                  id: "weekly-planner-checkin-1-section-1-step-1-question-1-rating-scale-0",
                  questionnaire_rating_scale_id:
                    "weekly-planner-checkin-1-rating-scale-0",
                  name: "Needs Attention",
                  description:
                    "Completed <70% of target work orders or significant elements missing from plans",
                  value: 0,
                },
                {
                  id: "weekly-planner-checkin-1-section-1-step-1-question-1-rating-scale-1",
                  questionnaire_rating_scale_id:
                    "weekly-planner-checkin-1-rating-scale-1",
                  name: "On Track",
                  description:
                    "Completed 70-100% of target work orders with most planning elements included",
                  value: 1,
                },
                {
                  id: "weekly-planner-checkin-1-section-1-step-1-question-1-rating-scale-2",
                  questionnaire_rating_scale_id:
                    "weekly-planner-checkin-1-rating-scale-2",
                  name: "Exceeding",
                  description:
                    "Completed >100% of target with high-quality comprehensive plans",
                  value: 2,
                },
              ],
            },
            {
              id: "weekly-planner-checkin-1-section-1-step-1-question-2",
              title: "Schedule Compliance",
              question_text:
                "What percentage of your planned work was executed as scheduled this week? Consider both timing and scope of work completed.",
              context:
                "Schedule Effectiveness\nMeasure how well planned work translated to execution:\n• Work started on scheduled date\n• Work completed within estimated duration\n• No major scope changes during execution\n• Resources available as planned",
              order: 2,
              applicable_roles: ["shared-role-20", "shared-role-21"],
              rating_scales: [
                {
                  id: "weekly-planner-checkin-1-section-1-step-1-question-2-rating-scale-0",
                  questionnaire_rating_scale_id:
                    "weekly-planner-checkin-1-rating-scale-0",
                  name: "Needs Attention",
                  description:
                    "<60% schedule compliance, multiple delays or rework required",
                  value: 0,
                },
                {
                  id: "weekly-planner-checkin-1-section-1-step-1-question-2-rating-scale-1",
                  questionnaire_rating_scale_id:
                    "weekly-planner-checkin-1-rating-scale-1",
                  name: "On Track",
                  description:
                    "60-85% schedule compliance with manageable deviations",
                  value: 1,
                },
                {
                  id: "weekly-planner-checkin-1-section-1-step-1-question-2-rating-scale-2",
                  questionnaire_rating_scale_id:
                    "weekly-planner-checkin-1-rating-scale-2",
                  name: "Exceeding",
                  description:
                    ">85% schedule compliance with minimal disruptions",
                  value: 2,
                },
              ],
            },
            {
              id: "weekly-planner-checkin-1-section-1-step-1-question-3",
              title: "Planning Quality Feedback",
              question_text:
                "What feedback did you receive from maintenance crews about your work plans this week? Consider completeness, accuracy, and usability of plans.",
              context:
                "Execution Feedback\nQuality indicators from field execution:\n• All required materials were available\n• Labor estimates were accurate\n• Job steps were clear and complete\n• Safety requirements were appropriate\n• No significant rework needed",
              order: 3,
              applicable_roles: ["shared-role-20", "shared-role-21"],
              rating_scales: [
                {
                  id: "weekly-planner-checkin-1-section-1-step-1-question-3-rating-scale-0",
                  questionnaire_rating_scale_id:
                    "weekly-planner-checkin-1-rating-scale-0",
                  name: "Needs Attention",
                  description:
                    "Multiple complaints about missing information, materials, or unclear instructions",
                  value: 0,
                },
                {
                  id: "weekly-planner-checkin-1-section-1-step-1-question-3-rating-scale-1",
                  questionnaire_rating_scale_id:
                    "weekly-planner-checkin-1-rating-scale-1",
                  name: "On Track",
                  description:
                    "Generally positive feedback with minor improvement suggestions",
                  value: 1,
                },
                {
                  id: "weekly-planner-checkin-1-section-1-step-1-question-3-rating-scale-2",
                  questionnaire_rating_scale_id:
                    "weekly-planner-checkin-1-rating-scale-2",
                  name: "Exceeding",
                  description:
                    "Consistently positive feedback, plans used as examples for others",
                  value: 2,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "weekly-planner-checkin-1-section-2",
      title: "Resource & Material Management",
      order: 2,
      steps: [
        {
          id: "weekly-planner-checkin-1-section-2-step-1",
          title: "Resource Coordination",
          order: 1,
          questions: [
            {
              id: "weekly-planner-checkin-1-section-2-step-1-question-1",
              title: "Material Availability",
              question_text:
                "How effective was your material planning and procurement this week? Consider lead times, stock availability, and coordination with warehouse.",
              context:
                "Material Management\nAssess material planning effectiveness:\n• Critical spares identified and available\n• Long-lead items ordered in time\n• Warehouse stock levels verified\n• Kitting completed before work start\n• No work delays due to materials",
              order: 1,
              applicable_roles: ["shared-role-20", "shared-role-21"],
              rating_scales: [
                {
                  id: "weekly-planner-checkin-1-section-2-step-1-question-1-rating-scale-0",
                  questionnaire_rating_scale_id:
                    "weekly-planner-checkin-1-rating-scale-0",
                  name: "Needs Attention",
                  description:
                    "Multiple material shortages caused delays, poor coordination with supply chain",
                  value: 0,
                },
                {
                  id: "weekly-planner-checkin-1-section-2-step-1-question-1-rating-scale-1",
                  questionnaire_rating_scale_id:
                    "weekly-planner-checkin-1-rating-scale-1",
                  name: "On Track",
                  description:
                    "Most materials available, minor delays managed through workarounds",
                  value: 1,
                },
                {
                  id: "weekly-planner-checkin-1-section-2-step-1-question-1-rating-scale-2",
                  questionnaire_rating_scale_id:
                    "weekly-planner-checkin-1-rating-scale-2",
                  name: "Exceeding",
                  description:
                    "All materials staged and ready, proactive identification of future needs",
                  value: 2,
                },
              ],
            },
            {
              id: "weekly-planner-checkin-1-section-2-step-1-question-2",
              title: "Labor Resource Planning",
              question_text:
                "How well did you match labor resources to work requirements this week? Consider skills, availability, and workload distribution.",
              context:
                "Labor Coordination\nEvaluate labor planning accuracy:\n• Right skills matched to tasks\n• Crew sizes appropriate for work\n• Contractor resources coordinated\n• Overtime requirements minimized\n• Workload balanced across teams",
              order: 2,
              applicable_roles: ["shared-role-20", "shared-role-21"],
              rating_scales: [
                {
                  id: "weekly-planner-checkin-1-section-2-step-1-question-2-rating-scale-0",
                  questionnaire_rating_scale_id:
                    "weekly-planner-checkin-1-rating-scale-0",
                  name: "Needs Attention",
                  description:
                    "Significant skill mismatches, over/under-resourced jobs, excessive overtime",
                  value: 0,
                },
                {
                  id: "weekly-planner-checkin-1-section-2-step-1-question-2-rating-scale-1",
                  questionnaire_rating_scale_id:
                    "weekly-planner-checkin-1-rating-scale-1",
                  name: "On Track",
                  description:
                    "Generally good resource matching with occasional adjustments needed",
                  value: 1,
                },
                {
                  id: "weekly-planner-checkin-1-section-2-step-1-question-2-rating-scale-2",
                  questionnaire_rating_scale_id:
                    "weekly-planner-checkin-1-rating-scale-2",
                  name: "Exceeding",
                  description:
                    "Optimal resource utilization, skills perfectly matched, balanced workload",
                  value: 2,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "weekly-planner-checkin-1-section-3",
      title: "Communication & Collaboration",
      order: 3,
      steps: [
        {
          id: "weekly-planner-checkin-1-section-3-step-1",
          title: "Stakeholder Engagement",
          order: 1,
          questions: [
            {
              id: "weekly-planner-checkin-1-section-3-step-1-question-1",
              title: "Operations Coordination",
              question_text:
                "How effectively did you coordinate with operations this week for equipment access and shutdown planning?",
              context:
                "Operations Interface\nAssess coordination effectiveness:\n• Production schedules considered\n• Shutdown windows optimized\n• Equipment isolation planned\n• Impact on production minimized\n• Clear communication of requirements",
              order: 1,
              applicable_roles: ["shared-role-20", "shared-role-21"],
              rating_scales: [
                {
                  id: "weekly-planner-checkin-1-section-3-step-1-question-1-rating-scale-0",
                  questionnaire_rating_scale_id:
                    "weekly-planner-checkin-1-rating-scale-0",
                  name: "Needs Attention",
                  description:
                    "Poor coordination caused production delays or access conflicts",
                  value: 0,
                },
                {
                  id: "weekly-planner-checkin-1-section-3-step-1-question-1-rating-scale-1",
                  questionnaire_rating_scale_id:
                    "weekly-planner-checkin-1-rating-scale-1",
                  name: "On Track",
                  description:
                    "Good coordination with minor scheduling adjustments required",
                  value: 1,
                },
                {
                  id: "weekly-planner-checkin-1-section-3-step-1-question-1-rating-scale-2",
                  questionnaire_rating_scale_id:
                    "weekly-planner-checkin-1-rating-scale-2",
                  name: "Exceeding",
                  description:
                    "Excellent coordination, seamless equipment access, zero production impact",
                  value: 2,
                },
              ],
            },
            {
              id: "weekly-planner-checkin-1-section-3-step-1-question-2",
              title: "Cross-functional Collaboration",
              question_text:
                "How well did you collaborate with other departments (Engineering, Safety, Supply Chain) to support your planning activities?",
              context:
                "Team Collaboration\nEvaluate cross-functional working:\n• Technical support from engineering\n• Safety requirements clarified\n• Procurement processes followed\n• Information sharing effective\n• Issues resolved quickly",
              order: 2,
              applicable_roles: ["shared-role-20", "shared-role-21"],
              rating_scales: [
                {
                  id: "weekly-planner-checkin-1-section-3-step-1-question-2-rating-scale-0",
                  questionnaire_rating_scale_id:
                    "weekly-planner-checkin-1-rating-scale-0",
                  name: "Needs Attention",
                  description:
                    "Limited collaboration, delays getting support, communication breakdowns",
                  value: 0,
                },
                {
                  id: "weekly-planner-checkin-1-section-3-step-1-question-2-rating-scale-1",
                  questionnaire_rating_scale_id:
                    "weekly-planner-checkin-1-rating-scale-1",
                  name: "On Track",
                  description:
                    "Regular collaboration with most departments, reasonable response times",
                  value: 1,
                },
                {
                  id: "weekly-planner-checkin-1-section-3-step-1-question-2-rating-scale-2",
                  questionnaire_rating_scale_id:
                    "weekly-planner-checkin-1-rating-scale-2",
                  name: "Exceeding",
                  description:
                    "Proactive collaboration, excellent support, issues prevented through teamwork",
                  value: 2,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "weekly-planner-checkin-1-section-4",
      title: "Continuous Improvement",
      order: 4,
      steps: [
        {
          id: "weekly-planner-checkin-1-section-4-step-1",
          title: "Learning & Development",
          order: 1,
          questions: [
            {
              id: "weekly-planner-checkin-1-section-4-step-1-question-1",
              title: "Process Improvement",
              question_text:
                "What improvements did you identify or implement in planning processes this week? Consider efficiency gains, standardization, or quality enhancements.",
              context:
                "Improvement Initiatives\nCapture improvement activities:\n• New job plan templates created\n• Planning processes streamlined\n• Lessons learned documented\n• Best practices shared\n• Time-saving methods adopted",
              order: 1,
              applicable_roles: ["shared-role-20", "shared-role-21"],
              rating_scales: [
                {
                  id: "weekly-planner-checkin-1-section-4-step-1-question-1-rating-scale-0",
                  questionnaire_rating_scale_id:
                    "weekly-planner-checkin-1-rating-scale-0",
                  name: "Needs Attention",
                  description:
                    "No improvements identified, following same processes, not capturing lessons",
                  value: 0,
                },
                {
                  id: "weekly-planner-checkin-1-section-4-step-1-question-1-rating-scale-1",
                  questionnaire_rating_scale_id:
                    "weekly-planner-checkin-1-rating-scale-1",
                  name: "On Track",
                  description:
                    "Some improvements identified, minor process enhancements made",
                  value: 1,
                },
                {
                  id: "weekly-planner-checkin-1-section-4-step-1-question-1-rating-scale-2",
                  questionnaire_rating_scale_id:
                    "weekly-planner-checkin-1-rating-scale-2",
                  name: "Exceeding",
                  description:
                    "Multiple improvements implemented, measurable efficiency gains achieved",
                  value: 2,
                },
              ],
            },
            {
              id: "weekly-planner-checkin-1-section-4-step-1-question-2",
              title: "Personal Workload Management",
              question_text:
                "How well did you manage your personal workload and priorities this week? Consider time management, stress levels, and work-life balance.",
              context:
                "Workload Balance\nSelf-assessment of workload management:\n• Priorities clearly defined\n• Time allocated effectively\n• Deadlines met without rushing\n• Stress levels manageable\n• Adequate time for planning vs. reactive work",
              order: 2,
              applicable_roles: ["shared-role-20", "shared-role-21"],
              rating_scales: [
                {
                  id: "weekly-planner-checkin-1-section-4-step-1-question-2-rating-scale-0",
                  questionnaire_rating_scale_id:
                    "weekly-planner-checkin-1-rating-scale-0",
                  name: "Needs Attention",
                  description:
                    "Overwhelmed with work, missing deadlines, high stress, mostly reactive",
                  value: 0,
                },
                {
                  id: "weekly-planner-checkin-1-section-4-step-1-question-2-rating-scale-1",
                  questionnaire_rating_scale_id:
                    "weekly-planner-checkin-1-rating-scale-1",
                  name: "On Track",
                  description:
                    "Workload manageable, meeting most deadlines, reasonable balance",
                  value: 1,
                },
                {
                  id: "weekly-planner-checkin-1-section-4-step-1-question-2-rating-scale-2",
                  questionnaire_rating_scale_id:
                    "weekly-planner-checkin-1-rating-scale-2",
                  name: "Exceeding",
                  description:
                    "Excellent time management, proactive planning, helping others with capacity",
                  value: 2,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
