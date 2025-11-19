import type { DatabaseRow } from "./utils";

export type Contact = DatabaseRow<"contacts">;

// Entity types that can have contacts
export type ContactableEntityType =
  | "company"
  | "business_unit"
  | "region"
  | "site"
  | "asset_group"
  | "work_group"
  | "role";

// Helper type for entity IDs (company uses string, others use number)
export type EntityId<T extends ContactableEntityType> = T extends "company"
  ? string
  : number;
