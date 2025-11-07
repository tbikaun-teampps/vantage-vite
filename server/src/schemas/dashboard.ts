import { z } from "zod";

// Reusable schema for widget configuration
const WidgetSchema = z.object({
  id: z.string(),
  widgetType: z.string(),
  config: z.record(z.string(), z.unknown()), // Flexible object for widget config
});

// Reusable schema for layout configuration
const LayoutSchema = z.object({
  i: z.string(),
  x: z.number(),
  y: z.number(),
  w: z.number(),
  h: z.number(),
});

// Reusable schema for dashboard data
const DashboardSchema = z.object({
  id: z.number(),
  name: z.string(),
  company_id: z.string(),
  created_by: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  is_deleted: z.boolean(),
  deleted_at: z.string().nullable(),
  widgets: z.any(), // Json type from database
  layout: z.any(), // Json type from database
});

// GET all dashboards for a company
export const GetDashboardsParamsSchema = z.object({
  companyId: z.string(),
});

export const GetDashboardsResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(DashboardSchema),
});

// GET a specific dashboard by ID
export const GetDashboardByIdParamsSchema = z.object({
  companyId: z.string(),
  dashboardId: z.coerce.number(),
});

export const GetDashboardByIdResponseSchema = z.object({
  success: z.boolean(),
  data: DashboardSchema,
});

// POST create new dashboard
export const CreateDashboardParamsSchema = z.object({
  companyId: z.string(),
});

export const CreateDashboardBodySchema = z.object({
  name: z.string(),
  widgets: z.array(WidgetSchema),
  layout: z.array(LayoutSchema),
});

export const CreateDashboardResponseSchema = z.object({
  success: z.boolean(),
  data: DashboardSchema,
});

// PATCH update dashboard
export const UpdateDashboardParamsSchema = z.object({
  companyId: z.string(),
  dashboardId: z.coerce.number(),
});

export const UpdateDashboardBodySchema = z.object({
  name: z.string().optional(),
  widgets: z.any().optional(),
  layout: z.any().optional(),
});

export const UpdateDashboardResponseSchema = z.object({
  success: z.boolean(),
  data: DashboardSchema,
});

// DELETE soft delete dashboard
export const DeleteDashboardParamsSchema = z.object({
  companyId: z.string(),
  dashboardId: z.coerce.number(),
});

export const DeleteDashboardResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
