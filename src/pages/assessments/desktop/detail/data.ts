import type { AssessmentStatus } from "@/types";
import type { Measurement } from "@/pages/assessments/desktop/new/types/desktop-assessment";

export const mockAssessment = {
  id: "1",
  name: "Demo Desktop Assessment",
  description: "Demo desktop assessment description",
  status: "draft" as AssessmentStatus,
  created_at: "2024-01-15",
  measurements: [
    {
      id: 1,
      name: "task_list_usage",
      objective: "To view the percentage of completed work orders which had a Task List attached. A large percentage of work orders with Task Lists attached indicates that Work Management can produce quality work orders with predetermined resources, materials and documents.",
      definition: "Total Work orders completed in previous 12 months that has utilised a task list for work planning over the same period.",
      status: "configured" as const,
      data_status: "uploaded" as const,
      last_updated: "2024-01-16",
      completion: 100,
      assessment_categories: ["Identify Work"],
      data_sources: ["SAP", "Maximo", "CSV Upload"],
      terms: [
        {
          id: 1,
          term: "Timeframe",
          description: "12 Months from Current Date",
        },
      ],
    },
    {
      id: 2,
      name: "available_capacity_hours",
      objective: "To view available capacity hours by maintenance work centre, providing a forward-looking snapshot of available capacity.",
      definition: "Total maintenance capacity availability by week from current schedule week to future 26 weeks.",
      status: "pending" as const,
      data_status: "not_uploaded" as const,
      last_updated: null,
      completion: 0,
      assessment_categories: [],
      data_sources: ["SAP", "Maximo", "Oracle", "CSV Upload"],
      terms: [
        {
          id: 1,
          term: "Timeframe",
          description: "Current Date to +26 Weeks",
        },
        {
          id: 2,
          term: "Work Centres",
          description: "All",
        },
      ],
    },
  ],
};

export const availableMeasurements: Measurement[] = [
  {
    id: 1,
    assessment_categories: ["Identify Work"],
    name: "task_list_usage",
    objective:
      "To view the percentage of completed work orders which had a Task List attached. A large percentage of work orders with Task Lists attached indicates that Work Management can produce quality work orders with predetermined resources, materials and documents. ",
    definition:
      "Total Work orders completed in previous 12 months that has utilised a task list for work planning over the same period. ",
    required_columns: [
      // {
      //   name: "work_order_id",
      //   type: "string",
      //   description: "Unique work order identifier",
      //   required: true,
      // },
      // {
      //   name: "has_task_list",
      //   type: "boolean",
      //   description: "Whether work order has task list",
      //   required: true,
      // },
      // {
      //   name: "completion_date",
      //   type: "date",
      //   description: "Work order completion date",
      //   required: false,
      // },
    ],
    data_sources: ["SAP", "Maximo", "CSV Upload"],
    terms: [
      {
        id: 1,
        term: "Timeframe",
        description: "12 Months from Current Date",
      },
    ],
  },
  {
    id: 2,
    assessment_categories: [],
    name: "available_capacity_hours",
    objective:
      "To view available capacity hours by maintenance work centre, providing a forward-looking snapshot of available capacity.",
    definition:
      "Total maintenance capacity availability by week from current schedule week to future 26 weeks.",
    required_columns: [],
    data_sources: ["SAP", "Maximo", "Oracle", "CSV Upload"],
    terms: [
      {
        id: 1,
        term: "Timeframe",
        description: "Current Date to +26 Weeks",
      },
      {
        id: 2,
        term: "Work Centres",
        description: "All",
      },
    ],
  },
  {
    id: 3,
    assessment_categories: [],
    name: "notification_turnover",
    objective:
      "To view the effectiveness of managing notifications and when they are reviewed. ",
    definition:
      "A ratio of all notifications converted to a work order in less than 24 hours over all notifications. ",
    required_columns: [],
    data_sources: ["SAP PM", "Asset Management System", "CSV Upload"],
    terms: [
      {
        id: 1,
        term: "Timeframe",
        description: "Last 12 Months",
      },
      {
        id: 2,
        term: "Notification Type",
        description: "M2",
      },
      {
        id: 3,
        term: "Notification Status Excluded",
        description: "FOO",
      },
    ],
  },
  {
    id: 4,
    assessment_categories: [],
    name: "task_list_material_usage",
    objective:
      "To view the use of task lists with materials that enable effective execution of planned maintenance work and takes into consideration the implications of likely break-in work. ",
    definition:
      "A ratio of task lists with materials on them measured against all task lists used on closed work orders. ",
    required_columns: [],
    data_sources: ["SAP PM", "Maximo", "CSV Upload"],
    terms: [
      { id: 1, term: "Timeframe", description: "Last 12 Months Trending" },
      { id: 2, term: "Task List Status", description: "Active" },
      { id: 3, term: "Work Order Status", description: "Closed" },
      {
        id: 4,
        term: "Work Order Type",
        description: "Capital, Preventative, Corrective",
      },
    ],
  },
];
