import { apiClient } from "../api/client";

// Types for email service
interface InterviewInvitationData {
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

interface InviteTeamMemberData {
  email: string;
  name?: string;
  role?: string;
  company_name?: string;
  invite_link?: string;
}

interface TestEmailData {
  to: string;
  message?: string;
}

interface EmailResponse {
  success: boolean;
  message: string;
  messageId?: string;
}

class EmailService {
  async sendInterviewInvitation(
    data: InterviewInvitationData
  ): Promise<EmailResponse> {
    try {
      const response = await apiClient.post<EmailResponse>(
        "/emails/send-interview-invitation",
        data
      );

      return response.data;
    } catch (error) {
      console.error("Email service error:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to send email",
      };
    }
  }

  async sendTeamMemberInvite(
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

  async sendTestEmail(data: TestEmailData): Promise<EmailResponse> {
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
}

// Export singleton instance
export const emailService = new EmailService();

// Export types for use in components
export type {
  InterviewInvitationData,
  InviteTeamMemberData,
  TestEmailData,
  EmailResponse,
};
