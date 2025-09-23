import type { Questionnaire } from "../../types";

export const questionnaire: Questionnaire = {
  id: "iso55000-journey-pulse-1",
  name: "ISO 55000 Asset Management System Journey Assessment",
  description:
    "Semi-annual pulse check to assess organizational maturity, progress, and priorities on the journey toward ISO 55000 certification and asset management excellence",
  guidelines:
    "Complete this assessment every 6-12 months to track your organization's progress toward ISO 55000 compliance. Be honest in your ratings to identify genuine improvement opportunities. Consider evidence and examples when rating each area.",
  rating_scales: [
    {
      id: "iso55000-journey-pulse-1-rating-scale-0",
      name: "Initial/Ad-hoc",
      description:
        "Processes are informal, inconsistent, or non-existent. Heavy reliance on individual knowledge.",
      value: 0,
      order_index: 0,
    },
    {
      id: "iso55000-journey-pulse-1-rating-scale-1",
      name: "Developing",
      description:
        "Basic processes documented and partially implemented. Some standardization emerging.",
      value: 1,
      order_index: 1,
    },
    {
      id: "iso55000-journey-pulse-1-rating-scale-2",
      name: "Defined",
      description:
        "Processes are documented, standardized, and consistently applied across the organization.",
      value: 2,
      order_index: 2,
    },
    {
      id: "iso55000-journey-pulse-1-rating-scale-3",
      name: "Managed",
      description:
        "Processes are measured, controlled, and regularly reviewed. Data-driven decision making.",
      value: 3,
      order_index: 3,
    },
    {
      id: "iso55000-journey-pulse-1-rating-scale-4",
      name: "Optimized",
      description:
        "Continuous improvement culture. Industry-leading practices. Predictive and proactive approach.",
      value: 4,
      order_index: 4,
    },
  ],
  sections: [
    {
      id: "iso55000-journey-pulse-1-section-1",
      title: "Leadership & Governance",
      order: 1,
      steps: [
        {
          id: "iso55000-journey-pulse-1-section-1-step-1",
          title: "Strategic Alignment",
          order: 1,
          questions: [
            {
              id: "iso55000-journey-pulse-1-section-1-step-1-question-1",
              title: "Asset Management Policy",
              question_text:
                "How well established is your Asset Management Policy, and how effectively does it align with organizational objectives and stakeholder requirements?",
              context:
                "ISO 55000 Requirement 5.2\nConsider:\n• Policy exists and is documented\n• Aligned with organizational strategic plan\n• Communicated throughout organization\n• Reviewed and updated regularly\n• Signed off by top management",
              order: 1,
              applicable_roles: ["shared-role-4", "shared-role-2", "shared-role-5"],
              rating_scales: [
                {
                  id: "q1-rating-0",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-0",
                  name: "Initial/Ad-hoc",
                  description:
                    "No formal AM policy or only draft versions exist",
                  value: 0,
                },
                {
                  id: "q1-rating-1",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-1",
                  name: "Developing",
                  description:
                    "Policy exists but lacks alignment or communication",
                  value: 1,
                },
                {
                  id: "q1-rating-2",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-2",
                  name: "Defined",
                  description:
                    "Policy documented, approved, and communicated organization-wide",
                  value: 2,
                },
                {
                  id: "q1-rating-3",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-3",
                  name: "Managed",
                  description:
                    "Policy actively drives decisions with regular effectiveness reviews",
                  value: 3,
                },
                {
                  id: "q1-rating-4",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-4",
                  name: "Optimized",
                  description:
                    "Policy fully integrated, driving excellence and continuous improvement",
                  value: 4,
                },
              ],
            },
            {
              id: "iso55000-journey-pulse-1-section-1-step-1-question-2",
              title: "Leadership Commitment",
              question_text:
                "How actively does senior leadership demonstrate commitment to asset management and provide necessary resources?",
              context:
                "ISO 55000 Requirement 5.1\nEvaluate:\n• Visible leadership support and championing\n• Resource allocation (budget, people, tools)\n• Regular review of AM performance\n• Integration into business planning\n• Accountability structures in place",
              order: 2,
              applicable_roles: ["shared-role-4", "shared-role-2", "shared-role-5"],
              rating_scales: [
                {
                  id: "q2-rating-0",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-0",
                  name: "Initial/Ad-hoc",
                  description:
                    "Limited leadership awareness or involvement in asset management",
                  value: 0,
                },
                {
                  id: "q2-rating-1",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-1",
                  name: "Developing",
                  description:
                    "Growing leadership interest but inconsistent support",
                  value: 1,
                },
                {
                  id: "q2-rating-2",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-2",
                  name: "Defined",
                  description:
                    "Clear leadership commitment with defined roles and resources",
                  value: 2,
                },
                {
                  id: "q2-rating-3",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-3",
                  name: "Managed",
                  description:
                    "Leaders actively drive AM initiatives with measured outcomes",
                  value: 3,
                },
                {
                  id: "q2-rating-4",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-4",
                  name: "Optimized",
                  description:
                    "AM fully embedded in leadership culture and decision-making",
                  value: 4,
                },
              ],
            },
            {
              id: "iso55000-journey-pulse-1-section-1-step-1-question-3",
              title: "Strategic Asset Management Plan (SAMP)",
              question_text:
                "How comprehensive and effective is your Strategic Asset Management Plan in translating policy into objectives and plans?",
              context:
                "ISO 55000 Requirement 4.4 & 6.1\nAssess:\n• SAMP documented and approved\n• Clear objectives and KPIs defined\n• Links organizational and AM objectives\n• Defines approach to achieve objectives\n• Regularly reviewed and updated",
              order: 3,
              applicable_roles: ["shared-role-4", "shared-role-2"],
              rating_scales: [
                {
                  id: "q3-rating-0",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-0",
                  name: "Initial/Ad-hoc",
                  description: "No SAMP or only preliminary planning documents",
                  value: 0,
                },
                {
                  id: "q3-rating-1",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-1",
                  name: "Developing",
                  description:
                    "Basic SAMP under development or partially implemented",
                  value: 1,
                },
                {
                  id: "q3-rating-2",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-2",
                  name: "Defined",
                  description:
                    "SAMP documented with clear objectives and implementation approach",
                  value: 2,
                },
                {
                  id: "q3-rating-3",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-3",
                  name: "Managed",
                  description:
                    "SAMP actively managed with performance tracking and updates",
                  value: 3,
                },
                {
                  id: "q3-rating-4",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-4",
                  name: "Optimized",
                  description:
                    "Dynamic SAMP driving strategic value and continuous optimization",
                  value: 4,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "iso55000-journey-pulse-1-section-2",
      title: "Risk & Decision Making",
      order: 2,
      steps: [
        {
          id: "iso55000-journey-pulse-1-section-2-step-1",
          title: "Risk Management",
          order: 1,
          questions: [
            {
              id: "iso55000-journey-pulse-1-section-2-step-1-question-1",
              title: "Asset Risk Assessment",
              question_text:
                "How mature is your approach to identifying, assessing, and managing asset-related risks?",
              context:
                "ISO 55000 Requirement 6.1\nConsider:\n• Risk identification processes\n• Risk assessment methodologies (FMEA, RCM, etc.)\n• Risk register maintenance\n• Criticality analysis\n• Risk treatment plans",
              order: 1,
              applicable_roles: ["shared-role-2", "shared-role-13", "shared-role-45"],
              rating_scales: [
                {
                  id: "q4-rating-0",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-0",
                  name: "Initial/Ad-hoc",
                  description:
                    "Reactive approach, risks addressed when failures occur",
                  value: 0,
                },
                {
                  id: "q4-rating-1",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-1",
                  name: "Developing",
                  description:
                    "Basic risk identification for critical assets only",
                  value: 1,
                },
                {
                  id: "q4-rating-2",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-2",
                  name: "Defined",
                  description:
                    "Systematic risk assessment with documented processes",
                  value: 2,
                },
                {
                  id: "q4-rating-3",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-3",
                  name: "Managed",
                  description:
                    "Quantified risk management with regular reviews and updates",
                  value: 3,
                },
                {
                  id: "q4-rating-4",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-4",
                  name: "Optimized",
                  description:
                    "Predictive risk management integrated into all decisions",
                  value: 4,
                },
              ],
            },
            {
              id: "iso55000-journey-pulse-1-section-2-step-1-question-2",
              title: "Decision-Making Framework",
              question_text:
                "How structured and consistent is your asset investment and intervention decision-making process?",
              context:
                "ISO 55000 Requirement 7.5\nEvaluate:\n• Decision criteria defined\n• Cost-benefit analysis methods\n• Life cycle costing approach\n• Options analysis processes\n• Decision documentation and approval",
              order: 2,
              applicable_roles: ["shared-role-2", "shared-role-13", "shared-role-45"],
              rating_scales: [
                {
                  id: "q5-rating-0",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-0",
                  name: "Initial/Ad-hoc",
                  description: "Decisions based on opinion or emergency needs",
                  value: 0,
                },
                {
                  id: "q5-rating-1",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-1",
                  name: "Developing",
                  description:
                    "Some decision criteria but inconsistently applied",
                  value: 1,
                },
                {
                  id: "q5-rating-2",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-2",
                  name: "Defined",
                  description:
                    "Documented decision framework with standard criteria",
                  value: 2,
                },
                {
                  id: "q5-rating-3",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-3",
                  name: "Managed",
                  description:
                    "Data-driven decisions with value optimization focus",
                  value: 3,
                },
                {
                  id: "q5-rating-4",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-4",
                  name: "Optimized",
                  description:
                    "Advanced analytics driving optimal life cycle decisions",
                  value: 4,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "iso55000-journey-pulse-1-section-3",
      title: "Asset Information & Systems",
      order: 3,
      steps: [
        {
          id: "iso55000-journey-pulse-1-section-3-step-1",
          title: "Information Management",
          order: 1,
          questions: [
            {
              id: "iso55000-journey-pulse-1-section-3-step-1-question-1",
              title: "Asset Data Quality",
              question_text:
                "How complete, accurate, and accessible is your asset data and documentation?",
              context:
                "ISO 55000 Requirement 7.5 & 7.6\nAssess:\n• Asset register completeness\n• Data accuracy and validation\n• Technical documentation availability\n• Data standards and governance\n• Master data management",
              order: 1,
              applicable_roles: [],
              rating_scales: [
                {
                  id: "q6-rating-0",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-0",
                  name: "Initial/Ad-hoc",
                  description:
                    "Fragmented data, multiple sources, poor quality",
                  value: 0,
                },
                {
                  id: "q6-rating-1",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-1",
                  name: "Developing",
                  description: "Basic asset register with known data gaps",
                  value: 1,
                },
                {
                  id: "q6-rating-2",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-2",
                  name: "Defined",
                  description:
                    "Comprehensive asset data with quality standards",
                  value: 2,
                },
                {
                  id: "q6-rating-3",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-3",
                  name: "Managed",
                  description:
                    "High-quality data with regular audits and validation",
                  value: 3,
                },
                {
                  id: "q6-rating-4",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-4",
                  name: "Optimized",
                  description:
                    "Real-time, integrated data driving predictive insights",
                  value: 4,
                },
              ],
            },
            {
              id: "iso55000-journey-pulse-1-section-3-step-1-question-2",
              title: "Information Systems Integration",
              question_text:
                "How well integrated are your asset management information systems (EAM/CMMS, ERP, GIS, etc.)?",
              context:
                "ISO 55000 Requirement 7.6\nConsider:\n• System integration level\n• Data flow automation\n• Single source of truth\n• Real-time information availability\n• Mobile and field access",
              order: 2,
              applicable_roles: [],
              rating_scales: [
                {
                  id: "q7-rating-0",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-0",
                  name: "Initial/Ad-hoc",
                  description: "Standalone systems with manual data transfer",
                  value: 0,
                },
                {
                  id: "q7-rating-1",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-1",
                  name: "Developing",
                  description: "Limited integration between key systems",
                  value: 1,
                },
                {
                  id: "q7-rating-2",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-2",
                  name: "Defined",
                  description:
                    "Core systems integrated with automated workflows",
                  value: 2,
                },
                {
                  id: "q7-rating-3",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-3",
                  name: "Managed",
                  description:
                    "Fully integrated systems with analytics capabilities",
                  value: 3,
                },
                {
                  id: "q7-rating-4",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-4",
                  name: "Optimized",
                  description: "Digital ecosystem with AI/ML-driven insights",
                  value: 4,
                },
              ],
            },
            {
              id: "iso55000-journey-pulse-1-section-3-step-1-question-3",
              title: "Performance Reporting",
              question_text:
                "How effective is your asset performance reporting and visualization capability?",
              context:
                "ISO 55000 Requirement 9.1\nEvaluate:\n• KPI dashboards availability\n• Report automation\n• Trend analysis capability\n• Benchmarking processes\n• Management reporting quality",
              order: 3,
              applicable_roles: ["shared-role-2", "shared-role-45", "shared-role-5"],
              rating_scales: [
                {
                  id: "q8-rating-0",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-0",
                  name: "Initial/Ad-hoc",
                  description: "Manual, ad-hoc reporting when requested",
                  value: 0,
                },
                {
                  id: "q8-rating-1",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-1",
                  name: "Developing",
                  description: "Basic periodic reports with limited metrics",
                  value: 1,
                },
                {
                  id: "q8-rating-2",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-2",
                  name: "Defined",
                  description: "Standardized reporting with defined KPIs",
                  value: 2,
                },
                {
                  id: "q8-rating-3",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-3",
                  name: "Managed",
                  description:
                    "Real-time dashboards with drill-down capability",
                  value: 3,
                },
                {
                  id: "q8-rating-4",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-4",
                  name: "Optimized",
                  description: "Predictive analytics with automated insights",
                  value: 4,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "iso55000-journey-pulse-1-section-4",
      title: "Life Cycle Management",
      order: 4,
      steps: [
        {
          id: "iso55000-journey-pulse-1-section-4-step-1",
          title: "Life Cycle Processes",
          order: 1,
          questions: [
            {
              id: "iso55000-journey-pulse-1-section-4-step-1-question-1",
              title: "Life Cycle Planning",
              question_text:
                "How comprehensive is your approach to planning across the entire asset life cycle from creation to disposal?",
              context:
                "ISO 55000 Requirement 6.2.2\nConsider:\n• Capital planning processes\n• Design for maintainability\n• Commissioning standards\n• Decommissioning planning\n• Total cost of ownership analysis",
              order: 1,
              applicable_roles: ["shared-role-2", "shared-role-13", "shared-role-21"],
              rating_scales: [
                {
                  id: "q9-rating-0",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-0",
                  name: "Initial/Ad-hoc",
                  description:
                    "Focus on acquisition cost only, limited life cycle view",
                  value: 0,
                },
                {
                  id: "q9-rating-1",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-1",
                  name: "Developing",
                  description:
                    "Basic life cycle considerations for major assets",
                  value: 1,
                },
                {
                  id: "q9-rating-2",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-2",
                  name: "Defined",
                  description: "Documented life cycle processes and standards",
                  value: 2,
                },
                {
                  id: "q9-rating-3",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-3",
                  name: "Managed",
                  description:
                    "Optimized life cycle strategies with cost modeling",
                  value: 3,
                },
                {
                  id: "q9-rating-4",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-4",
                  name: "Optimized",
                  description:
                    "Dynamic life cycle optimization with circular economy principles",
                  value: 4,
                },
              ],
            },
            {
              id: "iso55000-journey-pulse-1-section-4-step-1-question-2",
              title: "Maintenance Strategy Optimization",
              question_text:
                "How well-developed and optimized are your maintenance strategies for different asset types?",
              context:
                "ISO 55000 Requirement 8.1 & 8.2\nAssess:\n• Maintenance strategy development\n• RCM/RBI implementation\n• Preventive vs corrective balance\n• Predictive maintenance adoption\n• Strategy review and optimization",
              order: 2,
              applicable_roles: [
                "shared-role-2",
                "shared-role-13",
                "shared-role-21",
                "shared-role-28",
              ],
              rating_scales: [
                {
                  id: "q10-rating-0",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-0",
                  name: "Initial/Ad-hoc",
                  description: "Primarily reactive maintenance approach",
                  value: 0,
                },
                {
                  id: "q10-rating-1",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-1",
                  name: "Developing",
                  description: "Basic PM program with fixed intervals",
                  value: 1,
                },
                {
                  id: "q10-rating-2",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-2",
                  name: "Defined",
                  description: "Risk-based strategies for critical assets",
                  value: 2,
                },
                {
                  id: "q10-rating-3",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-3",
                  name: "Managed",
                  description:
                    "Condition-based and predictive maintenance deployed",
                  value: 3,
                },
                {
                  id: "q10-rating-4",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-4",
                  name: "Optimized",
                  description:
                    "AI-driven prescriptive maintenance optimization",
                  value: 4,
                },
              ],
            },
            {
              id: "iso55000-journey-pulse-1-section-4-step-1-question-3",
              title: "Asset Performance Management",
              question_text:
                "How effectively do you monitor and improve asset reliability and availability?",
              context:
                "ISO 55000 Requirement 9.1 & 9.2\nConsider:\n• Reliability metrics tracking (MTBF, MTTR)\n• Availability monitoring\n• Root cause analysis processes\n• Bad actor programs\n• Performance improvement initiatives",
              order: 3,
              applicable_roles: [],
              rating_scales: [
                {
                  id: "q11-rating-0",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-0",
                  name: "Initial/Ad-hoc",
                  description:
                    "Limited performance tracking, reactive to failures",
                  value: 0,
                },
                {
                  id: "q11-rating-1",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-1",
                  name: "Developing",
                  description: "Basic metrics tracked for critical equipment",
                  value: 1,
                },
                {
                  id: "q11-rating-2",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-2",
                  name: "Defined",
                  description:
                    "Comprehensive monitoring with improvement targets",
                  value: 2,
                },
                {
                  id: "q11-rating-3",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-3",
                  name: "Managed",
                  description: "Proactive reliability improvement programs",
                  value: 3,
                },
                {
                  id: "q11-rating-4",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-4",
                  name: "Optimized",
                  description:
                    "World-class reliability with predictive optimization",
                  value: 4,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "iso55000-journey-pulse-1-section-5",
      title: "Organizational Capability",
      order: 5,
      steps: [
        {
          id: "iso55000-journey-pulse-1-section-5-step-1",
          title: "People & Culture",
          order: 1,
          questions: [
            {
              id: "iso55000-journey-pulse-1-section-5-step-1-question-1",
              title: "Competency Management",
              question_text:
                "How well-developed is your approach to ensuring asset management competencies across the organization?",
              context:
                "ISO 55000 Requirement 7.2\nEvaluate:\n• Competency frameworks defined\n• Skills gap analysis\n• Training programs effectiveness\n• Knowledge management\n• Succession planning",
              order: 1,
              applicable_roles: [],
              rating_scales: [
                {
                  id: "q12-rating-0",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-0",
                  name: "Initial/Ad-hoc",
                  description: "No formal competency management approach",
                  value: 0,
                },
                {
                  id: "q12-rating-1",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-1",
                  name: "Developing",
                  description:
                    "Basic training provided but no competency framework",
                  value: 1,
                },
                {
                  id: "q12-rating-2",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-2",
                  name: "Defined",
                  description: "Competency framework with structured training",
                  value: 2,
                },
                {
                  id: "q12-rating-3",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-3",
                  name: "Managed",
                  description:
                    "Competency-based development with certification programs",
                  value: 3,
                },
                {
                  id: "q12-rating-4",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-4",
                  name: "Optimized",
                  description:
                    "Learning organization with knowledge sharing culture",
                  value: 4,
                },
              ],
            },
            {
              id: "iso55000-journey-pulse-1-section-5-step-1-question-2",
              title: "Organizational Culture",
              question_text:
                "How mature is your asset management culture in terms of ownership, accountability, and continuous improvement?",
              context:
                "ISO 55000 Requirement 7.3\nConsider:\n• Asset ownership clarity\n• Accountability at all levels\n• Proactive mindset\n• Collaboration across silos\n• Innovation and improvement focus",
              order: 2,
              applicable_roles: [],
              rating_scales: [
                {
                  id: "q13-rating-0",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-0",
                  name: "Initial/Ad-hoc",
                  description:
                    "Siloed operations, reactive culture, blame-focused",
                  value: 0,
                },
                {
                  id: "q13-rating-1",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-1",
                  name: "Developing",
                  description: "Growing awareness but old habits persist",
                  value: 1,
                },
                {
                  id: "q13-rating-2",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-2",
                  name: "Defined",
                  description: "Clear ownership with improving collaboration",
                  value: 2,
                },
                {
                  id: "q13-rating-3",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-3",
                  name: "Managed",
                  description: "Proactive culture with strong accountability",
                  value: 3,
                },
                {
                  id: "q13-rating-4",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-4",
                  name: "Optimized",
                  description:
                    "Excellence-driven culture with innovation mindset",
                  value: 4,
                },
              ],
            },
            {
              id: "iso55000-journey-pulse-1-section-5-step-1-question-3",
              title: "Change Management",
              question_text:
                "How effectively does your organization manage change related to asset management improvements?",
              context:
                "ISO 55000 Requirement 8.1\nAssess:\n• Change readiness assessment\n• Stakeholder engagement\n• Communication effectiveness\n• Resistance management\n• Benefits realization tracking",
              order: 3,
              applicable_roles: ["shared-role-4", "shared-role-2", "shared-role-5"],
              rating_scales: [
                {
                  id: "q14-rating-0",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-0",
                  name: "Initial/Ad-hoc",
                  description: "Changes imposed with high resistance",
                  value: 0,
                },
                {
                  id: "q14-rating-1",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-1",
                  name: "Developing",
                  description: "Basic change processes with mixed success",
                  value: 1,
                },
                {
                  id: "q14-rating-2",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-2",
                  name: "Defined",
                  description: "Structured change management approach",
                  value: 2,
                },
                {
                  id: "q14-rating-3",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-3",
                  name: "Managed",
                  description: "Effective change delivery with high adoption",
                  value: 3,
                },
                {
                  id: "q14-rating-4",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-4",
                  name: "Optimized",
                  description: "Change agility with continuous adaptation",
                  value: 4,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "iso55000-journey-pulse-1-section-6",
      title: "Continuous Improvement",
      order: 6,
      steps: [
        {
          id: "iso55000-journey-pulse-1-section-6-step-1",
          title: "Improvement Processes",
          order: 1,
          questions: [
            {
              id: "iso55000-journey-pulse-1-section-6-step-1-question-1",
              title: "Management Review Process",
              question_text:
                "How effective is your management review process for the asset management system?",
              context:
                "ISO 55000 Requirement 9.3\nConsider:\n• Review frequency and attendance\n• Performance data analysis\n• Improvement opportunities identification\n• Action tracking and closure\n• Strategic adjustments made",
              order: 1,
              applicable_roles: ["shared-role-4", "shared-role-2"],
              rating_scales: [
                {
                  id: "q15-rating-0",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-0",
                  name: "Initial/Ad-hoc",
                  description: "No formal management review process",
                  value: 0,
                },
                {
                  id: "q15-rating-1",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-1",
                  name: "Developing",
                  description: "Irregular reviews with limited follow-through",
                  value: 1,
                },
                {
                  id: "q15-rating-2",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-2",
                  name: "Defined",
                  description: "Regular reviews with documented outcomes",
                  value: 2,
                },
                {
                  id: "q15-rating-3",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-3",
                  name: "Managed",
                  description:
                    "Data-driven reviews driving measurable improvements",
                  value: 3,
                },
                {
                  id: "q15-rating-4",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-4",
                  name: "Optimized",
                  description:
                    "Strategic reviews driving competitive advantage",
                  value: 4,
                },
              ],
            },
            {
              id: "iso55000-journey-pulse-1-section-6-step-1-question-2",
              title: "Audit & Assurance",
              question_text:
                "How comprehensive is your internal audit and assurance program for asset management?",
              context:
                "ISO 55000 Requirement 9.2\nEvaluate:\n• Audit program maturity\n• Coverage of AM processes\n• Finding quality and closure\n• Competency of auditors\n• Value added through audits",
              order: 2,
              applicable_roles: ["shared-role-2", "shared-role-5", "shared-role-45"],
              rating_scales: [
                {
                  id: "q16-rating-0",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-0",
                  name: "Initial/Ad-hoc",
                  description: "No structured audit program",
                  value: 0,
                },
                {
                  id: "q16-rating-1",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-1",
                  name: "Developing",
                  description: "Basic compliance audits only",
                  value: 1,
                },
                {
                  id: "q16-rating-2",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-2",
                  name: "Defined",
                  description: "Regular audits with improvement focus",
                  value: 2,
                },
                {
                  id: "q16-rating-3",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-3",
                  name: "Managed",
                  description: "Risk-based audits driving system improvements",
                  value: 3,
                },
                {
                  id: "q16-rating-4",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-4",
                  name: "Optimized",
                  description:
                    "Integrated assurance providing strategic insights",
                  value: 4,
                },
              ],
            },
            {
              id: "iso55000-journey-pulse-1-section-6-step-1-question-3",
              title: "Corrective Action Management",
              question_text:
                "How effective is your process for managing non-conformities and implementing corrective actions?",
              context:
                "ISO 55000 Requirement 10.1\nConsider:\n• Non-conformity identification\n• Root cause analysis quality\n• Corrective action effectiveness\n• Preventive action implementation\n• Lesson learned sharing",
              order: 3,
              applicable_roles: [],
              rating_scales: [
                {
                  id: "q17-rating-0",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-0",
                  name: "Initial/Ad-hoc",
                  description: "Issues addressed individually without system",
                  value: 0,
                },
                {
                  id: "q17-rating-1",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-1",
                  name: "Developing",
                  description: "Basic tracking but poor follow-through",
                  value: 1,
                },
                {
                  id: "q17-rating-2",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-2",
                  name: "Defined",
                  description: "Systematic approach with action tracking",
                  value: 2,
                },
                {
                  id: "q17-rating-3",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-3",
                  name: "Managed",
                  description: "Proactive identification with prevention focus",
                  value: 3,
                },
                {
                  id: "q17-rating-4",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-4",
                  name: "Optimized",
                  description:
                    "Predictive issue prevention with knowledge sharing",
                  value: 4,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "iso55000-journey-pulse-1-section-7",
      title: "Stakeholder & Value",
      order: 7,
      steps: [
        {
          id: "iso55000-journey-pulse-1-section-7-step-1",
          title: "Value Delivery",
          order: 1,
          questions: [
            {
              id: "iso55000-journey-pulse-1-section-7-step-1-question-1",
              title: "Stakeholder Engagement",
              question_text:
                "How well do you identify, engage, and meet the needs of your asset management stakeholders?",
              context:
                "ISO 55000 Requirement 4.2\nAssess:\n• Stakeholder identification and mapping\n• Needs and expectations analysis\n• Communication planning and execution\n• Satisfaction measurement\n• Conflict resolution processes",
              order: 1,
              applicable_roles: ["shared-role-4", "shared-role-2"],
              rating_scales: [
                {
                  id: "q18-rating-0",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-0",
                  name: "Initial/Ad-hoc",
                  description: "Limited stakeholder awareness or engagement",
                  value: 0,
                },
                {
                  id: "q18-rating-1",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-1",
                  name: "Developing",
                  description:
                    "Key stakeholders identified but engagement inconsistent",
                  value: 1,
                },
                {
                  id: "q18-rating-2",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-2",
                  name: "Defined",
                  description:
                    "Structured engagement with regular communication",
                  value: 2,
                },
                {
                  id: "q18-rating-3",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-3",
                  name: "Managed",
                  description:
                    "Proactive engagement with satisfaction tracking",
                  value: 3,
                },
                {
                  id: "q18-rating-4",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-4",
                  name: "Optimized",
                  description: "Strategic partnerships delivering mutual value",
                  value: 4,
                },
              ],
            },
            {
              id: "iso55000-journey-pulse-1-section-7-step-1-question-2",
              title: "Value Realization",
              question_text:
                "How effectively do you demonstrate and communicate the value delivered through asset management?",
              context:
                "ISO 55000 Core Principle\nConsider:\n• Value definition and metrics\n• Benefits tracking and reporting\n• Cost optimization achieved\n• Risk reduction demonstrated\n• Strategic contribution clear",
              order: 2,
              applicable_roles: ["shared-role-4", "shared-role-2", "shared-role-45"],
              rating_scales: [
                {
                  id: "q19-rating-0",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-0",
                  name: "Initial/Ad-hoc",
                  description: "Value not defined or measured",
                  value: 0,
                },
                {
                  id: "q19-rating-1",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-1",
                  name: "Developing",
                  description:
                    "Some value metrics but not consistently tracked",
                  value: 1,
                },
                {
                  id: "q19-rating-2",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-2",
                  name: "Defined",
                  description: "Value framework with regular measurement",
                  value: 2,
                },
                {
                  id: "q19-rating-3",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-3",
                  name: "Managed",
                  description:
                    "Clear value demonstration with optimization focus",
                  value: 3,
                },
                {
                  id: "q19-rating-4",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-4",
                  name: "Optimized",
                  description:
                    "Strategic value creation driving business success",
                  value: 4,
                },
              ],
            },
            {
              id: "iso55000-journey-pulse-1-section-7-step-1-question-3",
              title: "Outsourcing & Supply Chain",
              question_text:
                "How well do you manage outsourced activities and supplier performance in asset management?",
              context:
                "ISO 55000 Requirement 8.3\nEvaluate:\n• Contractor management processes\n• Service level agreements\n• Performance monitoring\n• Knowledge retention\n• Supply chain integration",
              order: 3,
              applicable_roles: ["shared-role-2", "shared-role-5"],
              rating_scales: [
                {
                  id: "q20-rating-0",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-0",
                  name: "Initial/Ad-hoc",
                  description: "Minimal oversight of outsourced activities",
                  value: 0,
                },
                {
                  id: "q20-rating-1",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-1",
                  name: "Developing",
                  description:
                    "Basic contracts but limited performance management",
                  value: 1,
                },
                {
                  id: "q20-rating-2",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-2",
                  name: "Defined",
                  description: "Clear SLAs with regular performance reviews",
                  value: 2,
                },
                {
                  id: "q20-rating-3",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-3",
                  name: "Managed",
                  description: "Strategic partnerships with shared objectives",
                  value: 3,
                },
                {
                  id: "q20-rating-4",
                  questionnaire_rating_scale_id:
                    "iso55000-journey-pulse-1-rating-scale-4",
                  name: "Optimized",
                  description: "Integrated supply chain delivering innovation",
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
