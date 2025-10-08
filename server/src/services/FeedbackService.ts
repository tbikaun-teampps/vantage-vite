import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase";

export interface SubmitFeedbackData {
  message: string;
  type?: Database["public"]["Enums"]["feedback_types"];
  page_url?: string;
}

export class FeedbackService {
  private supabase: SupabaseClient<Database>;
  private userId: string;

  constructor(supabaseClient: SupabaseClient<Database>, userId: string) {
    this.supabase = supabaseClient;
    this.userId = userId;
  }

  async submitFeedback(data: SubmitFeedbackData): Promise<void> {
    const { error } = await this.supabase.from("feedback").insert({
      message: data.message,
      type: data.type || "general",
      page_url: data.page_url || "",
      created_by: this.userId,
    });

    if (error) {
      throw new Error(`Failed to submit feedback: ${error.message}`);
    }
  }
}
