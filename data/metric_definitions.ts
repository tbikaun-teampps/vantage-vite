export interface MetricDefinition {
  id: string;
  name: string;
  objective: string;
  description: string;
  calculation_type: "sum" | "average" | "ratio";
  required_csv_columns: Record<string, "string" | "number" | "date">;
  provider: "SAP" | "other";
  calculation?: string;
}

export const metric_definitions: MetricDefinition[] = [
  {
    id: "metric-definition-1",
    name: "Task List Usage",
    objective:
      "To view the percentage of completed work orders which had a Task List attached. A large percentage of work orders with Task Lists attached indicates that Work Management can produce quality work orders with predetermined resources, materials and documents.",
    description:
      "Total Work orders completed in previous 12 months that has utilised a task list for work planning over the same period.",
    calculation_type: "ratio",
    required_csv_columns: {
      work_order_id: "string",
      task_list_id: "string",
      completion_date: "date",
    },
    provider: "SAP",
    calculation:
      "Task List Utilisation = All completed Work Orders / All completed Work Orders with Task List",
  },
  {
    id: "metric-definition-2",
    name: "Available Capacity Hours",
    objective:
      "To view available capacity hours by maintenance work centre, providing a forward-looking snapshot of available capacity.",
    description:
      "Total maintenance capacity availability by week from current schedule week to future 26 weeks.",
    calculation_type: "sum",
    provider: "SAP",
    required_csv_columns: {},
  },
  {
    id: "metric-definition-3",
    name: "Notification Turnover",
    objective:
      "To view the effectiveness of managing notifications and when they are reviewed.",
    description:
      "A ratio of all notifications converted to a work order in less than 24 hours over all notifications.",
    calculation_type: "ratio",
    required_csv_columns: {
      notification_id: "string",
      creation_date: "date",
      work_order_creation_date: "date",
    },
    provider: "SAP",
    calculation:
      "Notification Turnover = All Notifications Converted to Work Orders in under 24 Hours / All Notifications",
  },
  {
    id: "metric-definition-4",
    name: "Task List Materials Usage (Manual DIFOT)",
    objective:
      "To view the use of task lists with materials that enable effective execution of planned maintenance work and takes into consideration the implications of likely break-in work.",
    description:
      "A ratio of task lists with materials on them measured against all task lists used on closed work orders.",
    calculation_type: "ratio",
    required_csv_columns: {
      work_order_id: "string",
      task_list_id: "string",
      material_id: "string",
      work_order_status: "string",
    },
    provider: "SAP",
    calculation:
      "Task List Materials Usage = Work Orders Closed with Materials from Task Lists / All Work Orders Closed with Task Lists",
  },
  {
    id: "metric-definition-5",
    name: "Notification Close Out Quality",
    objective:
      "To view the percentage of notifications completed with all required information. Accurate recording of maintenance history enables analysis for productivity and efficiency improvements.",
    description:
      "A ratio of all completed quality work orders/notifications against all work orders. A quality notification closed is when all the below criteria is completed:\nDamage Code\nCause Code\nSystem Code\nComponent Code",
    calculation_type: "ratio",
    required_csv_columns: {
      notification_id: "string",
      damage_code: "string",
      cause_code: "string",
      system_code: "string",
      component_code: "string",
      notification_status: "string",
      work_order_status: "string",
    },
    provider: "SAP",
    calculation:
      "Notification Close Out Quality = Quality Closed Out Notifications / All Notifications Closed",
  },
  {
    id: "metric-definition-6",
    name: "Workload Control (Manual)",
    objective:
      "To view pending planned work. Workload Control is maintained to assist with budgeting and co-ordinating of major maintenance and other significant events affecting Operations planning.",
    description:
      "A ratio of all planned work orders against all work orders. A planned work order is when the work order has a revision set against it.",
    calculation_type: "ratio",
    required_csv_columns: {
      work_order_id: "string",
      revision: "string",
      work_order_status: "string",
    },
    provider: "SAP",
    calculation: "Workload Control = All Planned Work Orders / All Work Orders",
  },
  {
    id: "metric-definition-7",
    name: "Asset Not Available Reschedule Work",
    objective:
      "To view the impact to planned schedule work/compliance due to assets not arriving when requested. It allows us to gain an appreciation of the magnitude of adherence to Schedule.",
    description:
      "A ratio of all rescheduled work orders with status RSAU against all work orders.",
    calculation_type: "ratio",
    required_csv_columns: {
      work_order_id: "string",
      reschedule_status: "string",
      work_order_status: "string",
    },
    provider: "SAP",
    calculation:
      "Asset Not Available Reschedule Work = All Rescheduled Work Orders with Status RSAU / All Work Orders",
  },
  {
    id: "metric-definition-8",
    name: "Schedule Compliant",
    objective:
      "To view the effectiveness of the scheduling process and completion of work for the schedule period",
    description:
      "The percentage of the scheduled work that was completed in the last 12 months. Work Order measure by count of work orders completed. Scheduled work is all work orders in the current week with a revision assigned.",
    calculation_type: "ratio",
    required_csv_columns: {
      work_order_id: "string",
      revision: "string",
      scheduled_start_date: "date",
      completion_date: "date",
      work_order_status: "string",
    },
    provider: "SAP",
    calculation:
      "Schedule Compliant = All Work Orders Completed / All Scheduled Work Orders",
  },
  {
    id: "metric-definition-9",
    name: "Preventitive Work Effectiveness",
    objective:
      "To view the effectiveness of scheduled preventative and corrective work in identifying corrective work to ensure the asset can be utilised between maintenance periods and break-in work is minimised.",
    description:
      "The percentage of corrective work with status FOO, identified from scheduled preventative and corrective work measured over all closed work orders in the last 12 months. Work orders are a measure by count.",
    calculation_type: "ratio",
    required_csv_columns: {
      work_order_id: "string",
      work_order_type: "string",
      work_order_status: "string",
      completion_date: "date",
    },
    provider: "SAP",
    calculation:
      "Preventative Work Effectiveness = All Corrective Work Orders with Status FOO from Scheduled Work / All Work Orders Closed",
  },
  {
    id: "metric-definition-10",
    name: "Asset Handover Effectiveness (Future)",
    objective:
      "To view the time that the asset is idol, albeit productively or non-productively. It provides an overall measure of how well delivery of the Asset and handover is done between Maintenance and Operations.",
    description:
      "Asset Handover Effectiveness is defined as the percentage of calendar time that the asset was not operating before maintenance begun",
    calculation_type: "ratio",
    required_csv_columns: {
      asset_id: "string",
      handover_start_time: "date",
      maintenance_start_time: "date",
      maintenance_end_time: "date",
    },
    provider: "other",
    calculation:
      "Asset Handover Effectiveness = Asset Handover Time / Total of Asset Handover and Maintenance Downtime Time",
  },
  {
    id: "metric-definition-11",
    name: "Asset Condition",
    objective:
      "To view the condition of the Asset using the Status Code for effective prioritisation and planning of Operations and Maintenance tasks.",
    description:
      "The amount of time an asset has a status code applied to it measured as a percentage of all time by code type.",
    calculation_type: "ratio",
    required_csv_columns: {
      asset_id: "string",
      status_code: "string",
      status_start_date: "date",
      status_end_date: "date",
    },
    provider: "other",
    calculation:
      "Asset Condition For Each Status Code = Time in Code / All Time",
  },
  {
    id: "metric-definition-12",
    name: "Unplanned Work Orders (Manual)",
    objective:
      "To view total amount of work orders that are not planned ready for scheduling and execution. It indicates how effectively Maintenance is keeping up with the volume of work being generated with the resources available.",
    description:
      "A summation count of all work orders not planned in back and forward scheduling periods divided by the summation count of all work orders grouped by the work order start date.",
    calculation_type: "ratio",
    required_csv_columns: {
      work_order_id: "string",
      revision: "string",
      work_order_start_date: "date",
      work_order_status: "string",
    },
    provider: "SAP",
    calculation:
      "Unplanned Work Orders = Unplanned Work Orders / All Work Orders",
  },
  {
    id: "metric-definition-13",
    name: "Notification Priority Age",
    objective:
      "To understand the assessment of notification priorities and to how well we are managing the workload. Priorities of work being performed must be determined based on set guidelines and in line with maintenance and operation requirements.",
    description:
      "A summation of notifications age per priority type divided by the count of notifications per priority type.",
    calculation_type: "average",
    required_csv_columns: {
      notification_id: "string",
      priority: "string",
      creation_date: "date",
      close_date: "date",
    },
    provider: "SAP",
    calculation:
      "Notification Priority = Total Notification Age by Priority / Count of Notifications by Priority",
  },
  {
    id: "metric-definition-14",
    name: "Work Order Priority Age",
    objective:
      "To view how prioritisation of work for planning and scheduling is completed using work order priorities and to observe how well we are managing the workload. Priorities of work being performed must be determined based on set guidelines and in line with maintenance and operation requirements.",
    description:
      "A summation of work orders age per priority type divided by the count of work orders per priority type.",
    calculation_type: "average",
    required_csv_columns: {
      work_order_id: "string",
      priority: "string",
      creation_date: "date",
      close_date: "date",
    },
    provider: "SAP",
    calculation:
      "Work Order Priority = Total Work Order Age by Priority / Count of Work Orders by Priority",
  },
  {
    id: "metric-definition-15",
    name: "Rework (Future)",
    objective:
      "To view the effectiveness and quality of how we executed work during the planned and scheduled period. With quality assurance checks we control the risk of re-work, which is a source of waste and risk of unnecessary downtime/failure.",
    description:
      "A notification raised by RDC within 5 days after depot maintenance, measured across all notifications raised, is an indication our maintenance is not being carried out with quality checks.",
    calculation_type: "ratio",
    required_csv_columns: {
      notification_id: "string",
      notification_creation_date: "date",
      work_order_id: "string",
      work_order_completion_date: "date",
    },
    provider: "SAP",
    calculation:
      "Rework = M2 Notifications by RDC <= 5 Days / All M2 Notifications",
  },
  {
    id: "metric-definition-16",
    name: "Planned Equipment Availability (Future)",
    objective:
      "To view how maintenance work in the future integrates with the operation plans which is reflected by predicting availability of equipment after scheduled maintenance.",
    description:
      "The percentage of calendar time that assets are physically available for work. Calendar time 1440 mins per day and all measurements are to be taken over same period",
    calculation_type: "ratio",
    required_csv_columns: {
      asset_id: "string",
      calendar_time: "number",
      total_hours_future_work_orders: "number",
    },
    provider: "other",
    calculation:
      "Equipment Availability = (Calendar Time - Total Hours Future Work Orders) / Calendar Time",
  },
  {
    id: "metric-definition-17",
    name: "Break-In Work Ration",
    objective:
      "The break-in work ratio measures the distribution of the maintenance work by showing the type of work that maintenance resources are executing.",
    description:
      "The ratio of the break-in maintenance work to the total maintenance work based on work order count calculated over the same period.",
    calculation_type: "ratio",
    required_csv_columns: {
      work_order_id: "string",
      work_order_type: "string",
      work_order_status: "string",
      completion_date: "date",
    },
    provider: "SAP",
    calculation:
      "Break-In Work Ratio = Total Number of Break-In Work Orders Completed / Total Number of Work Orders Completed",
  },
  {
    id: "metric-definition-18",
    name: "Scheduled Loading",
    objective:
      "To view planned utilisation of labour on scheduled work compared to all labour available and the effective use of the work order management system in managing labour.",
    description:
      "It is defined as the percentage of total estimated work hours on scheduled work orders for the scheduling period compared to total available manhours for the scheduling period.",
    calculation_type: "ratio",
    required_csv_columns: {
      work_order_id: "string",
      estimated_work_hours: "number",
      scheduled_start_date: "date",
      scheduled_end_date: "date",
      total_work_hours_available: "number",
    },
    provider: "SAP",
    calculation:
      "Schedule Loading = Total Estimated Work Hours / Total Work Hours Available",
  },
  {
    id: "metric-definition-19",
    name: "Material Demand Forecast (Future)",
    objective: "To view inventory effectiveness with demand forecasting.",
    description:
      "The percentage of materials that are ordered with a requirement date compared to the expected delivery time. Materials are measured as a count.",
    calculation_type: "ratio",
    required_csv_columns: {
      material_id: "string",
      forecast_date: "date",
      order_date: "date",
      delivery_date: "date",
    },
    provider: "other",
    calculation:
      "Material Demand Forecast = Total Materials meet Forecast Date / Total All Materials",
  },
  {
    id: "metric-definition-20",
    name: "Corrective Work Task List Usage (Manual)",
    objective:
      "To view whether task lists are used on corrective work orders that enable effective execution of planned maintenance work.",
    description:
      "A ratio of corrective work orders with task list on them measured against all corrective work orders.",
    calculation_type: "ratio",
    required_csv_columns: {
      work_order_id: "string",
      task_list_id: "string",
      work_order_type: "string",
      work_order_status: "string",
    },
    provider: "SAP",
    calculation:
      "Corrective Work Task List Usage = Corrective Work Orders Closed with Task Lists / All Corrective Work Orders Closed",
  },
  {
    id: "metric-definition-21",
    name: "Preventive Work Profile",
    objective:
      "To view the ratio of Preventative work against Corrective work. It provides an indication of how much work is proactive and scheduled to assure Asset capability.",
    description:
      "Preventative work orders measured against total of all Preventative and Corrective work orders over a period. Period will be measured over the same time frame",
    calculation_type: "ratio",
    required_csv_columns: {
      work_order_id: "string",
      work_order_type: "string",
      work_order_status: "string",
      completion_date: "date",
    },
    provider: "SAP",
    calculation:
      "Preventative Schedule Work = Preventative Work Orders / All Work Orders",
  },
  {
    id: "metric-definition-22",
    name: "On Time Material Delivery (Manual DIFOT)",
    objective:
      "To view inventory efficiency for delivery of materials when required for maintenance. It is an indicator of how supply is meeting maintenance demand in terms of the requested delivery date.",
    description:
      "Materials required ordered date is compared to the actual delivery time and measured as a percentage that meet the required date.",
    calculation_type: "ratio",
    calculation:
      "On Time Material Delivery = Total Materials Meet Required Date / Total All Materials",
    required_csv_columns: {
      material_id: "string",
      required_date: "date",
      delivery_date: "date",
    },
    provider: "SAP",
  },
  {
    id: "metric-definition-23",
    name: "Effective Labour Rate",
    objective:
      "To view the effect of internal labour cost per hour for maintenance work and to benchmark this across depots and compare against budget.",
    description:
      "The total of all direct and indirect labour costs is divided by all work order hours confirmed over the same period.",
    calculation:
      "Effective Labour Rate = Total All Costs / Total All Time Confirmations",
    calculation_type: "average",
    required_csv_columns: {
      work_order_id: "string",
      labour_cost: "number",
      time_confirmation_hours: "number",
      completion_date: "date",
    },
    provider: "SAP",
  },
  {
    id: "metric-definition-24",
    name: "Material Management (Future)",
    objective:
      "To view the effectiveness and management of materials not used on work orders through the timeliness for return.",
    description:
      "All work orders with a return material movement on a work order captures the date the material was returned compared to the work order completion and then averaged in days.",
    calculation_type: "average",
    calculation:
      "Material Management = Sum(Return Material Date - Work Order Completion Date) / Total Count Material Returns",
    required_csv_columns: {
      work_order_id: "string",
      return_material_date: "date",
      completion_date: "date",
    },
    provider: "SAP",
  },
  {
    id: "metric-definition-25",
    name: "Labour Wait Time (Manual)",
    objective:
      "To view the time spent by maintenance personnel waiting for assets to be delivered for scheduled maintenance.",
    description:
      "Capture total time confirmations from standing work orders that have text reference “delayed due to operations” divided by all time confirmations to provide a percentage of time spent waiting.",
    calculation:
      "Labour Wait Time = Total Hours Time Confirmations for Waiting / Total All Time Confirmations",
    calculation_type: "ratio",
    required_csv_columns: {
      work_order_id: "string",
      time_confirmation_hours: "number",
      work_order_text: "string",
      completion_date: "date",
    },
    provider: "SAP",
  },
  {
    id: "metric-definition-26",
    name: "Labour Estimate Accuracy",
    objective:
      "To view the accuracy of the work order planning and scheduling function and the effectiveness of the work order feedback process.",
    description:
      "A ratio of the sum of actual labour hours for all work order operations completed for that period to the sum of planned labour hours for all work order operations completed – expressed as a percentage.",
    calculation:
      "Labour Estimate Accuracy = Total Hours Actual Time Confirmations for all Operations / Total Hours Planned Time Confirmations for all Operations",
    calculation_type: "ratio",
    required_csv_columns: {
      work_order_id: "string",
      actual_time_confirmation_hours: "number",
      planned_time_confirmation_hours: "number",
      completion_date: "date",
    },
    provider: "SAP",
  },
  {
    id: "metric-definition-27",
    name: "Notification Ratio",
    objective:
      "To view the ratio of work generated by Operations compared to Maintenance.",
    description:
      "A summation of notifications created by RDC compared to all notifications created.",
    calculation:
      "Notification Ratio = Total Count Notifications Created by RDC / Total Count All Notifications",
    calculation_type: "ratio",
    required_csv_columns: {
      notification_id: "string",
      created_by: "string",
      creation_date: "date",
    },
    provider: "SAP",
  },
  {
    id: "metric-definition-28",
    name: "Corrective Work Profile",
    objective:
      "To view the ratio of Corrective work against Preventative work. It provides an indication of how much work is reactive or non-proactive and unscheduled in maintaining the Asset.",
    description:
      "Corrective work orders measured against total of all Preventative and Corrective work orders over a period. Period will be measured over the same time frame",
    calculation:
      "Corrective Profile = Total Count Preventative Work Orders / Total Work Orders Count",
    calculation_type: "ratio",
    required_csv_columns: {
      work_order_id: "string",
      work_order_type: "string",
      work_order_status: "string",
      completion_date: "date",
    },
    provider: "SAP",
  },
  {
    id: "metric-definition-29",
    name: "Cost Estimate Accuracy (Future)",
    objective:
      "To view the accuracy of the work order planning function with estimation of works through costing.",
    description:
      "The sum of actual work order costs for all work orders completed for that period compared to the sum planned work order costs for all work orders completed – expressed as a percentage.",
    calculation:
      "Cost Estimate Accuracy = Total Actual Work Order Costs / Total Planned Work Order Costs",
    calculation_type: "ratio",
    required_csv_columns: {
      work_order_id: "string",
      actual_work_order_cost: "number",
      planned_work_order_cost: "number",
      completion_date: "date",
    },
    provider: "SAP",
  },
  {
    id: "metric-definition-30",
    name: "Preventative Work Compliance (Manual)",
    objective:
      "To view effectiveness of completing Preventative work on time to assure Asset compliance and capability.",
    description:
      "A percentage of preventative work orders completed on time measured against all preventative work orders compliance date over a period.",
    calculation:
      "Preventative Work Compliance = Total Preventative Work Orders Completed on Time / Total Preventative Work Orders",
    calculation_type: "ratio",
    required_csv_columns: {
      work_order_id: "string",
      work_order_type: "string",
      compliance_date: "date",
      completion_date: "date",
      work_order_status: "string",
    },
    provider: "SAP",
  },
  {
    id: "metric-definition-31",
    name: "Break-In Work Ratio Hours",
    objective:
      "The break-in work ratio measures the distribution of the maintenance work by showing the type of work that maintenance resources are executing.",
    description:
      "The ratio of the break-in maintenance work to the total maintenance work based on hours booked to work order type calculated over the same period",
    calculation:
      "Break-In Work Ratio Hours = Total Hours from Break-In Work Orders Completed / Total Hours from All Work Orders Completed",
    calculation_type: "ratio",
    required_csv_columns: {
      work_order_id: "string",
      work_order_type: "string",
      work_order_status: "string",
      time_confirmation_hours: "number",
      completion_date: "date",
    },
    provider: "SAP",
  },
  {
    id: "metric-definition-32",
    name: "Scheduled  Work Type Ratio",
    objective:
      "To view the ratio of work type scheduled for the schedule period.",
    description:
      "The percentage of the all scheduled work orders over 12 months as a ratio of Preventative (PM01) and Corrective (PM02). Work Order measure by count of work orders. Scheduled work is all work orders in the current week with a revision assigned.",
    calculation:
      "Schedule Type Ratio = PM01 or PM02 Work Orders / Total All PM01 & PM02 Work Orders",
    calculation_type: "ratio",
    required_csv_columns: {
      work_order_id: "string",
      work_order_type: "string",
      revision: "string",
      scheduled_start_date: "date",
      completion_date: "date",
      work_order_status: "string",
    },
    provider: "SAP",
  },
];
