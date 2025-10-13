import { Database } from "../database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export type CreatedBy = Pick<Profile, "full_name" | "email">;

export type SubscriptionTier =
  Database["public"]["Enums"]["subscription_tier_enum"];