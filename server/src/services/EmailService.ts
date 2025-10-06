import { SupabaseClient } from "@supabase/supabase-js";
import { Resend } from "resend";

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

export interface EmailResponse {
  success: boolean;
  message: string;
  messageId?: string;
}

export class EmailService {
  private resend: Resend;
  private siteUrl: string;

  constructor(apiKey: string, siteUrl: string) {
    this.resend = new Resend(apiKey);
    this.siteUrl = siteUrl;
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

    // Create email content
    const htmlContent = this.createInterviewInvitationHTML({
      ...data,
      interview_url: interviewUrl,
    });

    const textContent = this.createInterviewInvitationText({
      ...data,
      interview_url: interviewUrl,
    });

    try {
      const fromCompany = data.company_name ? ` from ${data.company_name}` : "";

      const emailResult = await this.resend.emails.send({
        from: "Vantage <vantage@mail.teampps.com.au>",
        to: [data.interviewee_email],
        subject: `Interview Invitation${fromCompany}: ${data.interview_name}`,
        html: htmlContent,
        text: textContent,
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
    const roleText = data.role ? ` as ${data.role}` : "";

    try {
      const htmlContent = this.createTeamMemberInviteHTML({
        member_name: memberName,
        company_name: companyName,
        role: data.role,
        invite_link: data.invite_link,
      });

      const textContent = this.createTeamMemberInviteText({
        member_name: memberName,
        company_name: companyName,
        role: data.role,
        invite_link: data.invite_link,
      });

      const emailResult = await this.resend.emails.send({
        from: "Vantage <vantage@mail.teampps.com.au>",
        to: [data.email],
        subject: `You've been added to ${companyName}`,
        html: htmlContent,
        text: textContent,
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

    try {
      const htmlContent = this.createRoleChangeNotificationHTML({
        member_name: memberName,
        old_role: data.old_role,
        new_role: data.new_role,
        company_name: companyName,
        changed_by_name: data.changed_by_name,
      });

      const textContent = this.createRoleChangeNotificationText({
        member_name: memberName,
        old_role: data.old_role,
        new_role: data.new_role,
        company_name: companyName,
        changed_by_name: data.changed_by_name,
      });

      const emailResult = await this.resend.emails.send({
        from: "Vantage <vantage@mail.teampps.com.au>",
        to: [data.email],
        subject: `Your role has been updated in ${companyName}`,
        html: htmlContent,
        text: textContent,
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

    try {
      const emailResult = await this.resend.emails.send({
        from: "Vantage <noreply@mail.teampps.com.au>",
        to: [data.to],
        subject: "Test Email from Vantage",
        html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Test Email</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { padding: 30px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
            .success { background: #dcfce7; border: 1px solid #86efac; padding: 15px; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Test Email</h1>
              <p>Email service is working correctly!</p>
            </div>

            <div class="content">
              <div class="success">
                <strong>Success!</strong> Your Vantage email service is configured properly.
              </div>

              <p>${customMessage}</p>

              <p><strong>Test Details:</strong></p>
              <ul>
                <li><strong>Sent to:</strong> ${data.to}</li>
                <li><strong>Timestamp:</strong> ${timestamp}</li>
                <li><strong>Service:</strong> Resend via Fastify Server</li>
              </ul>

              <p>If you received this email, your email integration is working correctly and you can now send interview invitations!</p>
            </div>

            <div class="footer">
              <p>This is a test email sent by the Vantage email service.</p>
            </div>
          </div>
        </body>
        </html>
      `,
        text: `
Test Email - Vantage Email Service

✅ Success! Your email service is working correctly.

${customMessage}

Test Details:
- Sent to: ${data.to}
- Timestamp: ${timestamp}
- Service: Resend via Fastify Server

If you received this email, your email integration is working correctly and you can now send interview invitations!

---
This is a test email sent by the Vantage email service.
      `.trim(),
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

  // HTML template for interview invitation
  private createInterviewInvitationHTML(data: {
    interviewee_name?: string;
    interview_name: string;
    assessment_name: string;
    access_code: string;
    interviewer_name?: string;
    sender_name?: string;
    sender_email: string;
    company_name?: string;
    interview_url: string;
  }): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Interview Invitation</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 30px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
        .details { background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        .access-code { font-family: monospace; background: #e9ecef; padding: 8px 12px; border-radius: 4px; font-weight: bold; font-size: 16px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Interview Invitation</h1>
          <p>You've been invited to complete an interview</p>
        </div>

        <div class="content">
          <p>Hello${data.interviewee_name ? ` ${data.interviewee_name}` : ""},</p>

          <p>You have been invited by <strong>${
            data.sender_name || data.sender_email
          }</strong>${
            data.company_name
              ? ` from <strong>${data.company_name}</strong>`
              : ""
          } to complete an interview for the assessment <strong>${
            data.assessment_name
          }</strong>.</p>

          <div class="details">
            <h3>Interview Details:</h3>
            <ul>
              <li><strong>Interview:</strong> ${data.interview_name}</li>
              <li><strong>Assessment:</strong> ${data.assessment_name}</li>
              <li><strong>Access Code:</strong> <span class="access-code">${
                data.access_code
              }</span></li>
              ${
                data.interviewer_name
                  ? `<li><strong>Interviewer:</strong> ${data.interviewer_name}</li>`
                  : ""
              }
            </ul>
          </div>

          <p>To begin your interview, click the button below:</p>

          <div style="text-align: center;">
            <a href="${data.interview_url}" class="button">Start Interview</a>
          </div>

          <p><strong>Alternative access:</strong> If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 14px;">
            ${data.interview_url}
          </p>

          <p>If you have any questions or need assistance, please contact <strong>${
            data.sender_name || data.sender_email
          }</strong> at <a href="mailto:${data.sender_email}">${
            data.sender_email
          }</a>.</p>

          <p>Best regards,<br><strong>${
            data.sender_name || data.sender_email
          }</strong>${data.company_name ? `<br>${data.company_name}` : ""}</p>
        </div>

        <div class="footer">
          <p>This email was sent by Vantage. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  }

  // Plain text template for interview invitation
  private createInterviewInvitationText(data: {
    interviewee_name?: string;
    interview_name: string;
    assessment_name: string;
    access_code: string;
    interviewer_name?: string;
    sender_name?: string;
    sender_email: string;
    company_name?: string;
    interview_url: string;
  }): string {
    return `
Interview Invitation

Hello${data.interviewee_name ? ` ${data.interviewee_name}` : ""},

You have been invited by ${data.sender_name || data.sender_email}${
      data.company_name ? ` from ${data.company_name}` : ""
    } to complete an interview for the assessment "${data.assessment_name}".

Interview Details:
- Interview: ${data.interview_name}
- Assessment: ${data.assessment_name}
- Access Code: ${data.access_code}
${data.interviewer_name ? `- Interviewer: ${data.interviewer_name}` : ""}

To begin your interview, visit this link:
${data.interview_url}

If you have any questions or need assistance, please contact ${
      data.sender_name || data.sender_email
    } at ${data.sender_email}.

Best regards,
${data.sender_name || data.sender_email}${
      data.company_name ? `\n${data.company_name}` : ""
    }

---
This email was sent by Vantage. Please do not reply to this email.
  `.trim();
  }

  // HTML template for team member invitation
  private createTeamMemberInviteHTML(data: {
    member_name: string;
    company_name: string;
    role?: string;
    invite_link?: string;
  }): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Team Invitation</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 30px; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
        .details { background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to the Team!</h1>
          <p>You've been added to ${data.company_name}</p>
        </div>

        <div class="content">
          <p>Hello ${data.member_name},</p>

          <p>Great news! You've been added to <strong>${data.company_name}</strong>${
            data.role ? ` as <strong>${data.role}</strong>` : ""
          }.</p>

          ${
            data.invite_link
              ? `
          <p>Click the button below to access your company workspace:</p>

          <div style="text-align: center;">
            <a href="${data.invite_link}" class="button">Access Company</a>
          </div>

          <p><strong>Alternative access:</strong> If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 14px;">
            ${data.invite_link}
          </p>
          `
              : ""
          }

          <p>You can now collaborate with your team and access all company resources.</p>

          <p>Best regards,<br><strong>The ${data.company_name} Team</strong></p>
        </div>

        <div class="footer">
          <p>This email was sent by Vantage. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  }

  // Plain text template for team member invitation
  private createTeamMemberInviteText(data: {
    member_name: string;
    company_name: string;
    role?: string;
    invite_link?: string;
  }): string {
    return `
Welcome to the Team!

Hello ${data.member_name},

Great news! You've been added to ${data.company_name}${
      data.role ? ` as ${data.role}` : ""
    }.

${
  data.invite_link
    ? `To access your company workspace, visit this link:
${data.invite_link}

`
    : ""
}You can now collaborate with your team and access all company resources.

Best regards,
The ${data.company_name} Team

---
This email was sent by Vantage. Please do not reply to this email.
  `.trim();
  }

  // HTML template for role change notification
  private createRoleChangeNotificationHTML(data: {
    member_name: string;
    old_role: string;
    new_role: string;
    company_name: string;
    changed_by_name?: string;
  }): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Role Update Notification</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 30px; }
        .details { background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0; }
        .role-change { display: flex; align-items: center; justify-content: center; gap: 15px; margin: 20px 0; font-size: 18px; }
        .role { background: #e9ecef; padding: 10px 20px; border-radius: 6px; font-weight: 600; }
        .role.new { background: #d1fae5; color: #065f46; }
        .arrow { color: #667eea; font-size: 24px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Role Updated</h1>
          <p>Your permissions have been updated</p>
        </div>

        <div class="content">
          <p>Hello ${data.member_name},</p>

          <p>Your role in <strong>${data.company_name}</strong> has been updated${
            data.changed_by_name ? ` by <strong>${data.changed_by_name}</strong>` : ""
          }.</p>

          <div class="role-change">
            <span class="role">${data.old_role}</span>
            <span class="arrow">→</span>
            <span class="role new">${data.new_role}</span>
          </div>

          <div class="details">
            <h3>What this means:</h3>
            <p>Your permissions and access levels in ${data.company_name} have been updated to reflect your new role as <strong>${data.new_role}</strong>.</p>
            <p>If you have any questions about your new permissions or responsibilities, please contact your administrator.</p>
          </div>

          <p>Best regards,<br><strong>The ${data.company_name} Team</strong></p>
        </div>

        <div class="footer">
          <p>This email was sent by Vantage. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  }

  // Plain text template for role change notification
  private createRoleChangeNotificationText(data: {
    member_name: string;
    old_role: string;
    new_role: string;
    company_name: string;
    changed_by_name?: string;
  }): string {
    return `
Role Updated

Hello ${data.member_name},

Your role in ${data.company_name} has been updated${
      data.changed_by_name ? ` by ${data.changed_by_name}` : ""
    }.

Role Change:
${data.old_role} → ${data.new_role}

What this means:
Your permissions and access levels in ${data.company_name} have been updated to reflect your new role as ${data.new_role}.

If you have any questions about your new permissions or responsibilities, please contact your administrator.

Best regards,
The ${data.company_name} Team

---
This email was sent by Vantage. Please do not reply to this email.
  `.trim();
  }
}
