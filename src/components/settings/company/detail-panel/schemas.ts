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
  code: z.string().optional(),
  description: z.string().optional(),
  contact_full_name: z.string().optional(),
  contact_email: z
    .string()
    .optional()
    .refine(
      (val) => !val || z.string().email().safeParse(val).success,
      "Invalid email format"
    ),
});

// Business Unit schema
export const businessUnitSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  name: z.string().min(1, "Business unit name is required"),
  description: z.string().optional(),
  code: z.string().optional(),
  contact_full_name: z.string().optional(),
  contact_email: z
    .string()
    .optional()
    .refine(
      (val) => !val || z.string().email().safeParse(val).success,
      "Invalid email format"
    ),
});

// Region schema
export const regionSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  name: z.string().min(1, "Region name is required"),
  description: z.string().optional(),
  code: z.string().optional(),
  contact_full_name: z.string().optional(),
  contact_email: z
    .string()
    .optional()
    .refine(
      (val) => !val || z.string().email().safeParse(val).success,
      "Invalid email format"
    ),
});

// Site schema
export const siteSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  name: z.string().min(1, "Site name is required"),
  description: z.string().optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  code: z.string().optional(),
  contact_full_name: z.string().optional(),
  contact_email: z
    .string()
    .optional()
    .refine(
      (val) => !val || z.string().email().safeParse(val).success,
      "Invalid email format"
    ),
});

// Asset Group schema
export const assetGroupSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  name: z.string().min(1, "Asset group name is required"),
  description: z.string().optional(),
  code: z.string().optional(),
  contact_full_name: z.string().optional(),
  contact_email: z
    .string()
    .optional()
    .refine(
      (val) => !val || z.string().email().safeParse(val).success,
      "Invalid email format"
    ),
});

// Work Group schema
export const workGroupSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  name: z.string().min(1, "Work group name is required"),
  description: z.string().optional(),
  code: z.string().optional(),
  contact_full_name: z.string().optional(),
  contact_email: z
    .string()
    .optional()
    .refine(
      (val) => !val || z.string().email().safeParse(val).success,
      "Invalid email format"
    ),
});

// Role schema
export const roleSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  level: z.enum(LEVELS as [string, ...string[]]).optional(),
  department: z.enum(DEPARTMENTS as [string, ...[]]).optional(),
  description: z.string().optional(),
  shared_role_id: z.string().min(1, "Role selection is required"),
  contact_full_name: z.string().optional(),
  contact_email: z
    .string()
    .optional()
    .refine(
      (val) => !val || z.string().email().safeParse(val).success,
      "Invalid email format"
    ),
});

// Type exports
export type CompanyFormData = z.infer<typeof companySchema>;
export type BusinessUnitFormData = z.infer<typeof businessUnitSchema>;
export type RegionFormData = z.infer<typeof regionSchema>;
export type SiteFormData = z.infer<typeof siteSchema>;
export type AssetGroupFormData = z.infer<typeof assetGroupSchema>;
export type WorkGroupFormData = z.infer<typeof workGroupSchema>;
export type RoleFormData = z.infer<typeof roleSchema>;
