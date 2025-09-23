import type { DatabaseRow } from "./utils";

export type Contact = DatabaseRow<"contacts">;

// Junction table types for entity-contact relationships
export type CompanyContact = DatabaseRow<"company_contacts">;
export type BusinessUnitContact = DatabaseRow<"business_unit_contacts">;
export type RegionContact = DatabaseRow<"region_contacts">;
export type SiteContact = DatabaseRow<"site_contacts">;
export type AssetGroupContact = DatabaseRow<"asset_group_contacts">;
export type WorkGroupContact = DatabaseRow<"work_group_contacts">;
export type RoleContact = DatabaseRow<"role_contacts">;

// Entity types that can have contacts
export type ContactableEntityType = 
  | "company" 
  | "business_unit" 
  | "region" 
  | "site" 
  | "asset_group" 
  | "work_group" 
  | "role";

// Contact form data for create/update operations
export interface ContactFormData {
  id?: number;
  full_name: string;
  email: string;
  phone?: string;
  title?: string;
}

// Helper type for entity IDs (company uses string, others use number)
export type EntityId<T extends ContactableEntityType> = T extends "company" ? string : number;