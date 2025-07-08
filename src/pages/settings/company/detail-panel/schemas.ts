import { z } from "zod";
import { LEVELS, DEPARTMENTS } from "@/lib/library/roles";

// Base coordinates schema
export const coordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

// Company schema
export const companySchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  name: z.string().min(1, "Company name is required"),
  code: z.string().min(1, "Company code is required"),
  description: z.string().optional(),
});

// Business Unit schema
export const businessUnitSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  name: z.string().min(1, "Business unit name is required"),
  description: z.string().optional(),
  manager: z.string().optional(),
});

// Region schema
export const regionSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  name: z.string().min(1, "Region name is required"),
});

// Site schema
export const siteSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  name: z.string().min(1, "Site name is required"),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
});

// Asset Group schema
export const assetGroupSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  name: z.string().min(1, "Asset group name is required"),
  description: z.string().optional(),
});

// Org Chart schema
export const orgChartSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  name: z.string().min(1, "Chart name is required"),
  description: z.string().optional(),
  chart_type: z
    .enum(["operational", "functional", "departmental", "project"])
    .default("operational"),
});

// Role schema
export const roleSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  name: z.string().optional(), // Made optional since we're using shared_role_id now
  level: z.enum(LEVELS).optional(),
  department: z.enum(DEPARTMENTS).optional(),
  // reports_to: z.string().optional(),
  // requirements: z.string().optional(),
  shared_role_id: z.string().min(1, "Role selection is required"), // Now required
});

// Type exports
export type CompanyFormData = z.infer<typeof companySchema>;
export type BusinessUnitFormData = z.infer<typeof businessUnitSchema>;
export type RegionFormData = z.infer<typeof regionSchema>;
export type SiteFormData = z.infer<typeof siteSchema>;
export type AssetGroupFormData = z.infer<typeof assetGroupSchema>;
export type OrgChartFormData = z.infer<typeof orgChartSchema>;
export type RoleFormData = z.infer<typeof roleSchema>;
