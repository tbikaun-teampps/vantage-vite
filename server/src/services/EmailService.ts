import { SupabaseClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { TemplateService } from "./TemplateService.js";

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

export interface RoleChangeNotificationData {
  email: string;
  name?: string;
  old_role: string;
  new_role: string;
  company_name?: string;
  changed_by_name?: string;
}

export interface InterviewReminderData {
  interviewee_email: string;
  interviewee_name?: string;
  interview_name: string;
  assessment_name: string;
  access_code: string;
  interview_id: number;
  sender_name?: string;
  sender_email?: string;
  company_name?: string;
  due_date?: string;
}

export interface EmailResponse {
  success: boolean;
  message: string;
  messageId?: string;
}

export class EmailService {
  private resend: Resend;
  private siteUrl: string;
  private templateService: TemplateService;

  constructor(apiKey: string, siteUrl: string) {
    this.resend = new Resend(apiKey);
    this.siteUrl = siteUrl;
    this.templateService = new TemplateService();
  }

  async sendInterviewInvitation(
    supabase: SupabaseClient,
    userId: string,
    interviewId: number
  ): Promise<EmailResponse> {
    // Fetch interview
    const { data: interview, error: interviewError } = await supabase
      .from("interviews")
      .select(`*, assessments(name), companies(name)`)
      .eq("id", interviewId)
      .single();

    if (interviewError || !interview) {
      console.error("Failed to fetch interview:", interviewError);
      return {
        success: false,
        message: "Failed to fetch interview details",
      };
    }

    // Get contact assigned to the interview
    const { data: contact, error: contactError } = await supabase
      .from("contacts")
      .select()
      .eq("id", interview.interview_contact_id)
      .single();

    if (contactError || !contact) {
      console.error("Failed to fetch contact:", contactError);
      return {
        success: false,
        message: "Failed to fetch interviewee contact details",
      };
    }

    // Generate the public interview URL
    const interviewUrl = `${this.siteUrl}/external/interview/${
      interview.id
    }?code=${interview.access_code}&email=${encodeURIComponent(contact.email)}`;

    // Fetch sender information
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select()
      .eq("id", userId)
      .single();

    if (profileError) {
      console.error("Failed to fetch sender profile:", profileError);
      return {
        success: false,
        message: "Failed to fetch sender profile",
      };
    }

    const data: InterviewInvitationData = {
      interviewee_email: contact.email,
      interviewee_name: contact.full_name || contact.email.split("@")[0],
      interview_name: interview.name,
      assessment_name: interview.assessments.name,
      access_code: interview.access_code,
      interview_id: interview.id,
      sender_email: profile.email,
      sender_name: profile.full_name || profile.email.split("@")[0],
      company_name: interview.companies.name,
    };

    console.log("Sending interview invitation with data:", data);

    // Prepare template data
    const templateData = {
      interviewee_name: data.interviewee_name,
      interview_name: data.interview_name,
      assessment_name: data.assessment_name,
      access_code: data.access_code,
      interviewer_name: data.interviewer_name,
      sender_name: data.sender_name,
      sender_email: data.sender_email,
      company_name: data.company_name,
      interview_url: interviewUrl,
      title: "Interview Invitation",
    };

    // Render email content using templates
    // Note: Resend automatically generates plain text version from HTML
    const htmlContent = this.templateService.renderEmail(
      "interview-invitation",
      templateData
    );

    try {
      const fromCompany = data.company_name ? ` from ${data.company_name}` : "";

      const emailResult = await this.resend.emails.send({
        from: "Vantage <vantage@mail.teampps.com.au>",
        to: [data.interviewee_email],
        subject: `Interview Invitation${fromCompany}: ${data.interview_name}`,
        html: htmlContent,
      });

      if (emailResult.error) {
        console.error("Resend error:", emailResult.error);
        return {
          success: false,
          message: `Failed to send email: ${emailResult.error.message}`,
        };
      }

      return {
        success: true,
        message: "Interview invitation sent successfully",
        messageId: emailResult.data?.id,
      };
    } catch (error) {
      console.error("Email sending error:", error);
      return {
        success: false,
        message: `Failed to send email: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  async sendInterviewReminder(
    data: InterviewReminderData
  ): Promise<EmailResponse> {
    // Validate required fields
    if (!data.interviewee_email) {
      return {
        success: false,
        message: "Missing required 'interviewee_email' field",
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.interviewee_email)) {
      return {
        success: false,
        message: "Invalid email address format",
      };
    }

    // Generate the public interview URL
    const interviewUrl = `${this.siteUrl}/external/interview/${
      data.interview_id
    }?code=${data.access_code}&email=${encodeURIComponent(
      data.interviewee_email
    )}`;

    console.log("Sending interview reminder with data:", data);

    // Prepare template data
    const templateData = {
      interviewee_name: data.interviewee_name,
      interview_name: data.interview_name,
      assessment_name: data.assessment_name,
      access_code: data.access_code,
      sender_name: data.sender_name,
      sender_email: data.sender_email,
      company_name: data.company_name,
      due_date: data.due_date,
      interview_url: interviewUrl,
      title: "Interview Reminder",
    };

    // Render email content using templates
    const htmlContent = this.templateService.renderEmail(
      "interview-reminder",
      templateData
    );

    try {
      const emailResult = await this.resend.emails.send({
        from: "Vantage <vantage@mail.teampps.com.au>",
        to: [data.interviewee_email],
        subject: `Reminder: Complete Your Interview - ${data.interview_name}`,
        html: htmlContent,
      });

      if (emailResult.error) {
        console.error("Resend error:", emailResult.error);
        return {
          success: false,
          message: `Failed to send reminder: ${emailResult.error.message}`,
        };
      }

      return {
        success: true,
        message: "Interview reminder sent successfully",
        messageId: emailResult.data?.id,
      };
    } catch (error) {
      console.error("Interview reminder sending error:", error);
      return {
        success: false,
        message: `Failed to send reminder: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  async sendTeamMemberInvite(
    data: InviteTeamMemberData
  ): Promise<EmailResponse> {
    // Validate required fields
    if (!data.email) {
      return {
        success: false,
        message: "Missing required 'email' field for team member invite",
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return {
        success: false,
        message: "Invalid email address format",
      };
    }

    const memberName = data.name || data.email.split("@")[0];
    const companyName = data.company_name || "the team";

    // Prepare template data
    const templateData = {
      member_name: memberName,
      company_name: companyName,
      role: data.role,
      invite_link: data.invite_link,
      title: "Team Invitation",
    };

    try {
      const htmlContent = this.templateService.renderEmail(
        "team-member-invite",
        templateData
      );

      const emailResult = await this.resend.emails.send({
        from: "Vantage <vantage@mail.teampps.com.au>",
        to: [data.email],
        subject: `You've been added to ${companyName}`,
        html: htmlContent,
      });

      if (emailResult.error) {
        console.error("Resend error:", emailResult.error);
        return {
          success: false,
          message: `Failed to send team invite: ${emailResult.error.message}`,
        };
      }

      return {
        success: true,
        message: "Team member invitation sent successfully",
        messageId: emailResult.data?.id,
      };
    } catch (error) {
      console.error("Team invite email sending error:", error);
      return {
        success: false,
        message: `Failed to send team invite: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  async sendRoleChangeNotification(
    data: RoleChangeNotificationData
  ): Promise<EmailResponse> {
    // Validate required fields
    if (!data.email) {
      return {
        success: false,
        message: "Missing required 'email' field for role change notification",
      };
    }

    if (!data.old_role || !data.new_role) {
      return {
        success: false,
        message: "Missing required 'old_role' or 'new_role' fields",
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return {
        success: false,
        message: "Invalid email address format",
      };
    }

    const memberName = data.name || data.email.split("@")[0];
    const companyName = data.company_name || "the team";

    // Prepare template data
    const templateData = {
      member_name: memberName,
      old_role: data.old_role,
      new_role: data.new_role,
      company_name: companyName,
      changed_by_name: data.changed_by_name,
      title: "Role Update",
    };

    try {
      const htmlContent = this.templateService.renderEmail(
        "role-change-notification",
        templateData
      );

      const emailResult = await this.resend.emails.send({
        from: "Vantage <vantage@mail.teampps.com.au>",
        to: [data.email],
        subject: `Your role has been updated in ${companyName}`,
        html: htmlContent,
      });

      if (emailResult.error) {
        console.error("Resend error:", emailResult.error);
        return {
          success: false,
          message: `Failed to send role change notification: ${emailResult.error.message}`,
        };
      }

      return {
        success: true,
        message: "Role change notification sent successfully",
        messageId: emailResult.data?.id,
      };
    } catch (error) {
      console.error("Role change notification email sending error:", error);
      return {
        success: false,
        message: `Failed to send role change notification: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  async sendTestEmail(data: TestEmailData): Promise<EmailResponse> {
    // Validate required fields
    if (!data.to) {
      return {
        success: false,
        message: "Missing required 'to' field for test email",
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.to)) {
      return {
        success: false,
        message: "Invalid email address format",
      };
    }

    const customMessage =
      data.message || "This is a test email from your Vantage email service.";
    const timestamp = new Date().toISOString();

    // Prepare template data
    const templateData = {
      to: data.to,
      message: customMessage,
      timestamp: timestamp,
      title: "Test Email",
    };

    try {
      const htmlContent = this.templateService.renderEmail(
        "test-email",
        templateData
      );

      const emailResult = await this.resend.emails.send({
        from: "Vantage <noreply@mail.teampps.com.au>",
        to: [data.to],
        subject: "Test Email from Vantage",
        html: htmlContent,
      });

      if (emailResult.error) {
        console.error("Resend error:", emailResult.error);
        return {
          success: false,
          message: `Failed to send test email: ${emailResult.error.message}`,
        };
      }

      return {
        success: true,
        message: "Test email sent successfully",
        messageId: emailResult.data?.id,
      };
    } catch (error) {
      console.error("Test email sending error:", error);
      return {
        success: false,
        message: `Failed to send test email: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }
}
