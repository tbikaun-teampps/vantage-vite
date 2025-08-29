import { createClient } from '../supabase/client';

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
  private supabase = createClient();

  async sendInterviewInvitation(data: InterviewInvitationData): Promise<EmailResponse> {
    try {
      const { data: result, error } = await this.supabase.functions.invoke('send-email', {
        body: {
          type: 'interview_invitation',
          data,
        },
      });

      if (error) {
        console.error('Supabase function error:', error);
        return {
          success: false,
          message: error.message || 'Failed to send email',
        };
      }

      return result as EmailResponse;
    } catch (error) {
      console.error('Email service error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send email',
      };
    }
  }

  async sendTeamMemberInvite(data: InviteTeamMemberData): Promise<EmailResponse> {
    try {
      const { data: result, error } = await this.supabase.functions.invoke('send-email', {
        body: {
          type: 'invite_team_member',
          data,
        },
      });

      if (error) {
        console.error('Supabase function error:', error);
        return {
          success: false,
          message: error.message || 'Failed to send invite',
        };
      }

      return result as EmailResponse;
    } catch (error) {
      console.error('Email service error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send invite',
      };
    }
  }

  async sendTestEmail(data: TestEmailData): Promise<EmailResponse> {
    try {
      const { data: result, error } = await this.supabase.functions.invoke('send-email', {
        body: {
          type: 'test_email',
          data,
        },
      });

      if (error) {
        console.error('Supabase function error:', error);
        return {
          success: false,
          message: error.message || 'Failed to send test email',
        };
      }

      return result as EmailResponse;
    } catch (error) {
      console.error('Email service error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send test email',
      };
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();

// Export types for use in components
export type { InterviewInvitationData, InviteTeamMemberData, TestEmailData, EmailResponse };