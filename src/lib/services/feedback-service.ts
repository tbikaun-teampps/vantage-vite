import { createClient } from "@/lib/supabase/client";

export interface Feedback {
  id?: number;
  message: string;
  page_url: string;
  type: "bug" | "feature" | "general" | "improvement";
  created_at?: string;
  created_by?: string;
}

export interface CreateFeedbackData {
  message: string;
  type: "bug" | "feature" | "general" | "improvement";
}

export class FeedbackService {
  private supabase = createClient();

  async submitFeedback(feedback: CreateFeedbackData): Promise<void> {
    // Get current user
    const {
      data: { user },
      error: userError,
    } = await this.supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("User not authenticated");
    }

    // Get current page URL
    const pageUrl = typeof window !== "undefined" ? window.location.href : "";

    // Insert feedback
    const { error } = await this.supabase
      .from("feedback")
      .insert({
        message: feedback.message,
        type: feedback.type,
        page_url: pageUrl,
        created_by: user.id,
      });

    if (error) throw error;
  }

  async submitErrorReport(feedback: CreateFeedbackData): Promise<void> {
    // Get current user
    const {
      data: { user },
      error: userError,
    } = await this.supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("User not authenticated");
    }

    // Get current page URL
    const pageUrl = typeof window !== "undefined" ? window.location.href : "";

    // Insert error report
    const { error } = await this.supabase
      .from("feedback")
      .insert({
        message: feedback.message,
        type: feedback.type,
        page_url: pageUrl,
        created_by: user.id,
      });

    if (error) throw error;
  }
}

export const feedbackService = new FeedbackService();
