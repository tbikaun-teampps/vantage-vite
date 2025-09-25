import { SupabaseClient } from "@supabase/supabase-js";
import { Database, Tables } from "../types/supabase";

export type Recommendation = Tables<"recommendations">;

export class RecommendationsService {
  private supabase: SupabaseClient<Database>;

  constructor(supabaseClient: SupabaseClient<Database>) {
    this.supabase = supabaseClient;
  }

  async getAllRecommendations(companyId: string): Promise<Recommendation[]> {
    const { data, error } = await this.supabase
      .from("recommendations")
      .select("*")
      .eq("company_id", companyId)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching recommendations:", error);
      throw new Error(`Failed to fetch recommendations: ${error.message}`);
    }

    return data || [];
  }

  async getRecommendationById(
    recommendationId: number
  ): Promise<Recommendation | null> {
    const { data, error } = await this.supabase
      .from("recommendations")
      .select("*")
      .eq("id", recommendationId)
      .eq("is_deleted", false)
      .single();

    if (error) {
      console.error("Error fetching recommendation:", error);
      throw new Error(`Failed to fetch recommendation: ${error.message}`);
    }

    return data;
  }

//   async createRecommendation(
//     data: Omit<
//       Recommendation,
//       "id" | "created_at" | "updated_at" | "deleted_at" | "is_deleted"
//     >
//   ): Promise<Recommendation> {
//     const { data: result, error } = await this.supabase
//       .from("recommendations")
//       .insert(data)
//       .select()
//       .single();

//     if (error) {
//       console.error("Error creating recommendation:", error);
//       throw new Error(`Failed to create recommendation: ${error.message}`);
//     }

//     return result;
//   }

  async updateRecommendation(
    id: number,
    updates: Partial<
      Pick<
        Recommendation,
        "content" | "context" | "priority" | "status" | "program_id"
      >
    >
  ): Promise<Recommendation> {
    const { data, error } = await this.supabase
      .from("recommendations")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("is_deleted", false)
      .select()
      .single();

    if (error) {
      console.error("Error updating recommendation:", error);
      throw new Error(`Failed to update recommendation: ${error.message}`);
    }

    return data;
  }

  async deleteRecommendation(id: number): Promise<void> {
    const { error } = await this.supabase
      .from("recommendations")
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("Error deleting recommendation:", error);
      throw new Error(`Failed to delete recommendation: ${error.message}`);
    }
  }
}