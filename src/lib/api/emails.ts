import { apiClient } from "./client";

// Types for email service
export interface InterviewInvitationData {
  interviewee_email: string;
  interviewee_name?: string;
  interview_name: string;
  assessment_name: string;
  access_code: string;
  interview_id: number;
  interviewer_name?: string;
  sender_name?: string;
  sender_email: string;
  company_name?: string;
}

export interface InviteTeamMemberData {
  email: string;
  name?: string;
  role?: string;
  company_name?: string;
  invite_link?: string;
}

export interface TestEmailData {
  to: string;
  message?: string;
}

export interface EmailResponse {
  success: boolean;
  message: string;
  messageId?: string;
}

export async function sendInterviewInvitation(
  interviewId: number
): Promise<EmailResponse> {
  try {
    const response = await apiClient.post<EmailResponse>(
      `/emails/send-interview-invitation?interviewId=${interviewId}`
    );

    return response.data;
  } catch (error) {
    console.error("Email service error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}

export async function sendTeamMemberInvite(
  data: InviteTeamMemberData
): Promise<EmailResponse> {
  try {
    const response = await apiClient.post<EmailResponse>(
      "/emails/send-team-member-invite",
      data
    );

    return response.data;
  } catch (error) {
    console.error("Email service error:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to send invite",
    };
  }
}

export async function sendTestEmail(data: TestEmailData): Promise<EmailResponse> {
  try {
    const response = await apiClient.post<EmailResponse>(
      "/emails/send-test-email",
      data
    );

    return response.data;
  } catch (error) {
    console.error("Email service error:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to send test email",
    };
  }
}
