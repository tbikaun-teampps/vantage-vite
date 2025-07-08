import type { AssessmentStatus } from "@/types";
import type { Measurement } from "@/pages/assessments/desktop/new/types/desktop-assessment";

export const mockAssessment = {
  id: "1",
  name: "Demo Desktop Assessment",
  description:
    "Demo desktop assessment description",
  status: "draft" as AssessmentStatus,
  created_at: "2024-01-15",
  measurements: [
    {
      id: 1,
      name: "Task List Usage Objective",
      status: "configured" as const,
      data_status: "uploaded" as const,
      last_updated: "2024-01-16",
      completion: 100,
    },
    {
      id: 2,
      name: "Work Order Completion Rate",
      status: "pending" as const,
      data_status: "not_uploaded" as const,
      last_updated: null,
      completion: 0,
    },
  ],
};

export const availableMeasurements: Measurement[] = [
  {
    id: 1,
    assessment_category: "Identify Work",
    name: "Task List Usage Objective",
    objective: "Calculate the percentage of work orders using task lists",
    definition:
      "Measures the adoption rate of task lists in maintenance work orders",
    latex:
      "\\frac{\\text{Work Orders with Task Lists}}{\\text{Total Work Orders}} \\times 100",
    required_columns: [
      {
        name: "work_order_id",
        type: "string",
        description: "Unique work order identifier",
        required: true,
      },
      {
        name: "has_task_list",
        type: "boolean",
        description: "Whether work order has task list",
        required: true,
      },
      {
        name: "completion_date",
        type: "date",
        description: "Work order completion date",
        required: false,
      },
    ],
    data_sources: ["SAP", "Maximo", "CSV Upload"],
    terms: [
      {
        id: 1,
        term: "Task List",
        description: "Predefined checklist of maintenance tasks",
      },
    ],
  },
  {
    id: 2,
    assessment_category: "Execute Work",
    name: "Work Order Completion Rate",
    objective: "Measure the percentage of work orders completed on time",
    definition:
      "Tracks maintenance team efficiency by measuring on-time completion",
    latex:
      "\\frac{\\text{On-Time Completions}}{\\text{Total Work Orders}} \\times 100",
    required_columns: [
      {
        name: "work_order_id",
        type: "string",
        description: "Unique work order identifier",
        required: true,
      },
      {
        name: "scheduled_date",
        type: "date",
        description: "Scheduled completion date",
        required: true,
      },
      {
        name: "actual_completion_date",
        type: "date",
        description: "Actual completion date",
        required: true,
      },
    ],
    data_sources: ["SAP", "Maximo", "Oracle", "CSV Upload"],
    terms: [
      {
        id: 1,
        term: "On-Time",
        description: "Completed before or on scheduled date",
      },
    ],
  },
  {
    id: 3,
    name: "Mean Time Between Failures (MTBF)",
    objective: "Calculate average time between equipment failures",
    definition: "Measures equipment reliability and maintenance effectiveness",
    latex: "\\frac{\\sum \\text{Operating Time}}{\\text{Number of Failures}}",
    required_columns: [
      {
        name: "equipment_id",
        type: "string",
        description: "Equipment identifier",
        required: true,
      },
      {
        name: "failure_date",
        type: "date",
        description: "Date of failure",
        required: true,
      },
      {
        name: "repair_duration",
        type: "number",
        description: "Time to repair (hours)",
        required: true,
      },
    ],
    data_sources: ["SAP PM", "Asset Management System", "CSV Upload"],
    terms: [],
  },
  {
    id: 4,
    name: "Preventive Maintenance Compliance",
    objective: "Track adherence to preventive maintenance schedules",
    definition: "Percentage of PM tasks completed on schedule",
    latex:
      "\\frac{\\text{PM Tasks Completed On Schedule}}{\\text{Total PM Tasks}} \\times 100",
    required_columns: [
      {
        name: "pm_task_id",
        type: "string",
        description: "PM task identifier",
        required: true,
      },
      {
        name: "scheduled_date",
        type: "date",
        description: "Scheduled date",
        required: true,
      },
      {
        name: "completion_date",
        type: "date",
        description: "Actual completion date",
        required: false,
      },
      {
        name: "status",
        type: "string",
        description: "Task status",
        required: true,
      },
    ],
    data_sources: ["SAP PM", "Maximo", "CSV Upload"],
    terms: [{ id: 1, term: "PM", description: "Preventive Maintenance" }],
  },
];
