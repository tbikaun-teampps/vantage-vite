import type { Questionnaire } from "../../types";

export const questionnaire: Questionnaire = {
  id: "tech-readiness-questionnaire-1",
  name: "Digital Work Management Readiness Assessment - Project Phoenix",
  description:
    "Comprehensive evaluation of operational readiness for implementing technology-based work management systems in mining operations",
  guidelines:
    "Assess the organization's preparedness for digital transformation including current technology infrastructure, data management capabilities, workforce digital literacy, and change management readiness",
  rating_scales: [
    {
      id: "tech-readiness-questionnaire-1-rating-scale-0",
      name: "Not Ready",
      description:
        "Significant gaps exist that require immediate attention before technology implementation",
      value: 0,
      order_index: 0,
    },
    {
      id: "tech-readiness-questionnaire-1-rating-scale-1",
      name: "Ready",
      description:
        "Foundation exists with minor gaps that can be addressed during implementation",
      value: 1,
      order_index: 1,
    },
  ],
  sections: [
    {
      id: "tech-readiness-questionnaire-1-section-1",
      title: "Digital Infrastructure & Systems",
      order: 1,
      steps: [
        {
          id: "tech-readiness-questionnaire-1-section-1-step-1",
          title: "Technology Foundation",
          order: 1,
          questions: [
            {
              id: "tech-readiness-questionnaire-1-section-1-step-1-question-1",
              title: "Network Connectivity Assessment",
              question_text:
                "1. Does the site have reliable internet/network connectivity across all operational areas?\n2. Is there adequate bandwidth to support cloud-based applications?\n3. Are backup connectivity solutions in place for critical operations?\n4. Is WiFi/cellular coverage available in underground areas or remote locations?",
              context:
                "Network Infrastructure\nReliable network connectivity is essential for real-time work management systems. Assessment should consider:\n• Bandwidth capacity for concurrent users\n• Network redundancy and failover capabilities\n• Coverage in all operational areas including remote sites\n• Security protocols and VPN access\n• Mobile network coverage for field devices",
              order: 1,
              applicable_roles: [
                "shared-role-22",
                "shared-role-20",
                "shared-role-44",
                "shared-role-8",
              ],
              rating_scales: [
                {
                  id: "tech-readiness-questionnaire-1-section-1-step-1-question-1-rating-scale-0",
                  questionnaire_rating_scale_id:
                    "tech-readiness-questionnaire-1-rating-scale-0",
                  name: "Not Ready",
                  description:
                    "Network coverage <70% of operational areas, frequent outages, insufficient bandwidth for digital systems",
                  value: 0,
                },
                {
                  id: "tech-readiness-questionnaire-1-section-1-step-1-question-1-rating-scale-1",
                  questionnaire_rating_scale_id:
                    "tech-readiness-questionnaire-1-rating-scale-1",
                  name: "Ready",
                  description:
                    "Network coverage >90% of areas, reliable connectivity, sufficient bandwidth with upgrade path identified",
                  value: 1,
                },
              ],
            },
            {
              id: "tech-readiness-questionnaire-1-section-1-step-1-question-2",
              title: "Mobile Device Readiness",
              question_text:
                "1. Are mobile devices (tablets/smartphones) available for field workers?\n2. Are devices ruggedized and suitable for mining environments?\n3. Is there a mobile device management (MDM) system in place?\n4. Are charging stations available in key operational areas?\n5. Is there a replacement/repair process for damaged devices?",
              context:
                "Mobile Device Infrastructure\nField mobility is crucial for real-time work management. Consider:\n• Device specifications and durability ratings\n• Operating system standardization\n• Security and device management capabilities\n• Spare device inventory\n• Support and maintenance procedures",
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
                  id: "tech-readiness-questionnaire-1-section-1-step-1-question-2-rating-scale-0",
                  questionnaire_rating_scale_id:
                    "tech-readiness-questionnaire-1-rating-scale-0",
                  name: "Not Ready",
                  description:
                    "No mobile device program, insufficient devices, no MDM system, devices not suitable for environment",
                  value: 0,
                },
                {
                  id: "tech-readiness-questionnaire-1-section-1-step-1-question-2-rating-scale-1",
                  questionnaire_rating_scale_id:
                    "tech-readiness-questionnaire-1-rating-scale-1",
                  name: "Ready",
                  description:
                    "Mobile devices deployed or procurement planned, MDM system available, support processes defined",
                  value: 1,
                },
              ],
            },
            {
              id: "tech-readiness-questionnaire-1-section-1-step-1-question-3",
              title: "System Integration Capability",
              question_text:
                "1. Does the current ERP/CMMS system have APIs for integration?\n2. Is there experience with system integrations at the site?\n3. Are data standards and formats documented?\n4. Is there a test environment for integration development?\n5. Are integration monitoring tools available?",
              context:
                "Integration Readiness\nSeamless integration between systems is critical for work management efficiency. Assess:\n• API availability and documentation\n• Data exchange protocols\n• Integration middleware or platforms\n• Technical expertise for integration development\n• Testing and validation procedures",
              order: 3,
              applicable_roles: [
                "shared-role-8",
                "shared-role-5",
                "shared-role-44",
                "shared-role-9",
              ],
              rating_scales: [
                {
                  id: "tech-readiness-questionnaire-1-section-1-step-1-question-3-rating-scale-0",
                  questionnaire_rating_scale_id:
                    "tech-readiness-questionnaire-1-rating-scale-0",
                  name: "Not Ready",
                  description:
                    "No integration capabilities, closed systems, no API access, no integration experience on site",
                  value: 0,
                },
                {
                  id: "tech-readiness-questionnaire-1-section-1-step-1-question-3-rating-scale-1",
                  questionnaire_rating_scale_id:
                    "tech-readiness-questionnaire-1-rating-scale-1",
                  name: "Ready",
                  description:
                    "APIs available or planned, integration experience exists, test environment accessible",
                  value: 1,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "tech-readiness-questionnaire-1-section-2",
      title: "Data Management & Analytics",
      order: 2,
      steps: [
        {
          id: "tech-readiness-questionnaire-1-section-2-step-1",
          title: "Data Readiness",
          order: 1,
          questions: [
            {
              id: "tech-readiness-questionnaire-1-section-2-step-1-question-1",
              title: "Master Data Quality",
              question_text:
                "1. Is equipment master data complete and accurate in the system?\n2. Are asset hierarchies properly defined and maintained?\n3. Is location data (GPS/GIS) available for assets?\n4. Are work order categories and types standardized?\n5. Is historical maintenance data digitized and accessible?",
              context:
                "Data Quality Assessment\nHigh-quality master data is fundamental for digital work management. Evaluate:\n• Equipment register completeness\n• Asset hierarchy accuracy\n• Location and spatial data\n• Work order classification standards\n• Historical data availability",
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
                  id: "tech-readiness-questionnaire-1-section-2-step-1-question-1-rating-scale-0",
                  questionnaire_rating_scale_id:
                    "tech-readiness-questionnaire-1-rating-scale-0",
                  name: "Not Ready",
                  description:
                    "Master data <60% complete, multiple data quality issues, no data standards, significant cleanup required",
                  value: 0,
                },
                {
                  id: "tech-readiness-questionnaire-1-section-2-step-1-question-1-rating-scale-1",
                  questionnaire_rating_scale_id:
                    "tech-readiness-questionnaire-1-rating-scale-1",
                  name: "Ready",
                  description:
                    "Master data >80% complete, data standards exist, cleanup plan in place for remaining gaps",
                  value: 1,
                },
              ],
            },
            {
              id: "tech-readiness-questionnaire-1-section-2-step-1-question-2",
              title: "Real-time Data Capture",
              question_text:
                "1. Are IoT sensors deployed on critical equipment?\n2. Is SCADA/telemetry data accessible for integration?\n3. Can equipment status be monitored in real-time?\n4. Are data historians configured to store sensor data?\n5. Is there capability to trigger work orders from sensor alerts?",
              context:
                "Real-time Data Infrastructure\nAutomated data capture enables predictive and condition-based maintenance. Consider:\n• Sensor deployment coverage\n• Data acquisition systems\n• Communication protocols (OPC, MQTT)\n• Data storage and retention\n• Alert and notification systems",
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
                  id: "tech-readiness-questionnaire-1-section-2-step-1-question-2-rating-scale-0",
                  questionnaire_rating_scale_id:
                    "tech-readiness-questionnaire-1-rating-scale-0",
                  name: "Not Ready",
                  description:
                    "Limited or no sensor deployment, SCADA data isolated, no real-time monitoring capability",
                  value: 0,
                },
                {
                  id: "tech-readiness-questionnaire-1-section-2-step-1-question-2-rating-scale-1",
                  questionnaire_rating_scale_id:
                    "tech-readiness-questionnaire-1-rating-scale-1",
                  name: "Ready",
                  description:
                    "Sensors on critical assets, SCADA integration possible, data historian available or planned",
                  value: 1,
                },
              ],
            },
            {
              id: "tech-readiness-questionnaire-1-section-2-step-1-question-3",
              title: "Analytics and Reporting Platform",
              question_text:
                "1. Is there a business intelligence/analytics platform in use?\n2. Can users create custom reports and dashboards?\n3. Is predictive analytics capability available or planned?\n4. Are KPIs defined and automatically calculated?\n5. Can reports be accessed on mobile devices?",
              context:
                "Analytics Capability\nData analytics drives continuous improvement in work management. Assess:\n• BI platform availability (PowerBI, Tableau, etc.)\n• Self-service analytics capabilities\n• Predictive/prescriptive analytics tools\n• KPI framework and automation\n• Mobile analytics access",
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
                  id: "tech-readiness-questionnaire-1-section-2-step-1-question-3-rating-scale-0",
                  questionnaire_rating_scale_id:
                    "tech-readiness-questionnaire-1-rating-scale-0",
                  name: "Not Ready",
                  description:
                    "No analytics platform, manual reporting only, no KPI automation, limited data visibility",
                  value: 0,
                },
                {
                  id: "tech-readiness-questionnaire-1-section-2-step-1-question-3-rating-scale-1",
                  questionnaire_rating_scale_id:
                    "tech-readiness-questionnaire-1-rating-scale-1",
                  name: "Ready",
                  description:
                    "Analytics platform available or selected, KPIs defined, reporting capabilities established",
                  value: 1,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "tech-readiness-questionnaire-1-section-3",
      title: "Workforce & Digital Capability",
      order: 3,
      steps: [
        {
          id: "tech-readiness-questionnaire-1-section-3-step-1",
          title: "Digital Skills Assessment",
          order: 1,
          questions: [
            {
              id: "tech-readiness-questionnaire-1-section-3-step-1-question-1",
              title: "Workforce Digital Literacy",
              question_text:
                "1. What percentage of the workforce uses computers/tablets regularly?\n2. Have digital literacy assessments been conducted?\n3. Are basic computer skills part of job requirements?\n4. Is there evidence of successful technology adoption previously?\n5. Do workers have personal email addresses for system access?",
              context:
                "Digital Skills Baseline\nUnderstanding current digital capability helps plan training needs. Consider:\n• Current technology usage levels\n• Generational diversity and comfort with technology\n• Previous technology rollout experiences\n• Basic computer/tablet skills\n• System access requirements",
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
                  id: "tech-readiness-questionnaire-1-section-3-step-1-question-1-rating-scale-0",
                  questionnaire_rating_scale_id:
                    "tech-readiness-questionnaire-1-rating-scale-0",
                  name: "Not Ready",
                  description:
                    "<40% regular technology users, no digital skills assessment, significant resistance to technology",
                  value: 0,
                },
                {
                  id: "tech-readiness-questionnaire-1-section-3-step-1-question-1-rating-scale-1",
                  questionnaire_rating_scale_id:
                    "tech-readiness-questionnaire-1-rating-scale-1",
                  name: "Ready",
                  description:
                    ">60% comfortable with technology, skills gaps identified, positive technology adoption history",
                  value: 1,
                },
              ],
            },
            {
              id: "tech-readiness-questionnaire-1-section-3-step-1-question-2",
              title: "Training Infrastructure",
              question_text:
                "1. Is there a dedicated training facility with computers/devices?\n2. Are digital training materials and e-learning platforms available?\n3. Can training be delivered remotely or on-shift?\n4. Are super-users or champions identified for peer support?\n5. Is there budget allocated for technology training?",
              context:
                "Training Capability\nEffective training infrastructure ensures successful adoption. Evaluate:\n• Physical and virtual training environments\n• E-learning platforms and content\n• Training delivery methods\n• Champion/super-user programs\n• Training budget and resources",
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
                  id: "tech-readiness-questionnaire-1-section-3-step-1-question-2-rating-scale-0",
                  questionnaire_rating_scale_id:
                    "tech-readiness-questionnaire-1-rating-scale-0",
                  name: "Not Ready",
                  description:
                    "No dedicated training resources, no e-learning capability, no champion program, insufficient budget",
                  value: 0,
                },
                {
                  id: "tech-readiness-questionnaire-1-section-3-step-1-question-2-rating-scale-1",
                  questionnaire_rating_scale_id:
                    "tech-readiness-questionnaire-1-rating-scale-1",
                  name: "Ready",
                  description:
                    "Training facilities available, e-learning platform selected, champions identified, budget allocated",
                  value: 1,
                },
              ],
            },
            {
              id: "tech-readiness-questionnaire-1-section-3-step-1-question-3",
              title: "Technical Support Capability",
              question_text:
                "1. Is there on-site IT support available 24/7?\n2. Are help desk services established?\n3. Can remote support be provided to field devices?\n4. Are service level agreements (SLAs) defined for support?\n5. Is there a knowledge base or self-service portal?",
              context:
                "Support Infrastructure\nRobust support ensures system availability and user confidence. Consider:\n• IT support coverage and availability\n• Help desk maturity and processes\n• Remote support capabilities\n• SLA definitions and monitoring\n• Self-service resources",
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
                  id: "tech-readiness-questionnaire-1-section-3-step-1-question-3-rating-scale-0",
                  questionnaire_rating_scale_id:
                    "tech-readiness-questionnaire-1-rating-scale-0",
                  name: "Not Ready",
                  description:
                    "Limited IT support, no formal help desk, no remote support capability, no SLAs defined",
                  value: 0,
                },
                {
                  id: "tech-readiness-questionnaire-1-section-3-step-1-question-3-rating-scale-1",
                  questionnaire_rating_scale_id:
                    "tech-readiness-questionnaire-1-rating-scale-1",
                  name: "Ready",
                  description:
                    "24/7 support available or planned, help desk established, remote support tools available",
                  value: 1,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "tech-readiness-questionnaire-1-section-4",
      title: "Change Management & Governance",
      order: 4,
      steps: [
        {
          id: "tech-readiness-questionnaire-1-section-4-step-1",
          title: "Organizational Readiness",
          order: 1,
          questions: [
            {
              id: "tech-readiness-questionnaire-1-section-4-step-1-question-1",
              title: "Leadership Commitment",
              question_text:
                "1. Is there visible executive sponsorship for digital transformation?\n2. Has leadership communicated the vision for technology adoption?\n3. Are resources (budget, people, time) committed to the initiative?\n4. Is there a digital transformation roadmap or strategy?\n5. Are success metrics defined and communicated?",
              context:
                "Leadership and Sponsorship\nStrong leadership commitment is critical for transformation success. Assess:\n• Executive sponsorship level\n• Communication of vision and strategy\n• Resource commitment\n• Strategic alignment\n• Success metrics and accountability",
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
                  id: "tech-readiness-questionnaire-1-section-4-step-1-question-1-rating-scale-0",
                  questionnaire_rating_scale_id:
                    "tech-readiness-questionnaire-1-rating-scale-0",
                  name: "Not Ready",
                  description:
                    "Limited leadership engagement, no clear vision communicated, resources not committed, no strategy",
                  value: 0,
                },
                {
                  id: "tech-readiness-questionnaire-1-section-4-step-1-question-1-rating-scale-1",
                  questionnaire_rating_scale_id:
                    "tech-readiness-questionnaire-1-rating-scale-1",
                  name: "Ready",
                  description:
                    "Strong executive sponsorship, vision communicated, resources allocated, roadmap defined",
                  value: 1,
                },
              ],
            },
            {
              id: "tech-readiness-questionnaire-1-section-4-step-1-question-2",
              title: "Change Management Maturity",
              question_text:
                "1. Is there a formal change management methodology in use?\n2. Have change impacts been assessed for all stakeholder groups?\n3. Is there a communication plan for the technology rollout?\n4. Are change champions identified across all departments?\n5. Is there a process to manage resistance and concerns?",
              context:
                "Change Management Capability\nStructured change management increases adoption success. Evaluate:\n• Change management methodology (ADKAR, Kotter, etc.)\n• Stakeholder analysis and engagement\n• Communication planning and execution\n• Change network establishment\n• Resistance management strategies",
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
                  id: "tech-readiness-questionnaire-1-section-4-step-1-question-2-rating-scale-0",
                  questionnaire_rating_scale_id:
                    "tech-readiness-questionnaire-1-rating-scale-0",
                  name: "Not Ready",
                  description:
                    "No formal change management, stakeholders not assessed, no communication plan, resistance expected",
                  value: 0,
                },
                {
                  id: "tech-readiness-questionnaire-1-section-4-step-1-question-2-rating-scale-1",
                  questionnaire_rating_scale_id:
                    "tech-readiness-questionnaire-1-rating-scale-1",
                  name: "Ready",
                  description:
                    "Change methodology adopted, stakeholder analysis complete, communication plan developed, champions identified",
                  value: 1,
                },
              ],
            },
            {
              id: "tech-readiness-questionnaire-1-section-4-step-1-question-3",
              title: "Governance and Continuous Improvement",
              question_text:
                "1. Is there a governance structure for the technology initiative?\n2. Are roles and responsibilities clearly defined (RACI)?\n3. Is there a process for collecting and acting on user feedback?\n4. Are regular reviews scheduled to assess system performance?\n5. Is there a continuous improvement framework in place?",
              context:
                "Governance Framework\nEffective governance ensures sustainable technology adoption. Consider:\n• Governance structure and committees\n• RACI matrices and accountability\n• Feedback mechanisms\n• Performance monitoring\n• Continuous improvement processes",
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
                  id: "tech-readiness-questionnaire-1-section-4-step-1-question-3-rating-scale-0",
                  questionnaire_rating_scale_id:
                    "tech-readiness-questionnaire-1-rating-scale-0",
                  name: "Not Ready",
                  description:
                    "No governance structure, unclear roles, no feedback process, no improvement framework",
                  value: 0,
                },
                {
                  id: "tech-readiness-questionnaire-1-section-4-step-1-question-3-rating-scale-1",
                  questionnaire_rating_scale_id:
                    "tech-readiness-questionnaire-1-rating-scale-1",
                  name: "Ready",
                  description:
                    "Governance established, RACI defined, feedback processes designed, improvement framework adopted",
                  value: 1,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
