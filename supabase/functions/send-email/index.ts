import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

// Types for our email events
interface InterviewInvitationPayload {
  type: "interview_invitation";
  data: {
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
  };
}

interface InviteTeamMemberPayload {
  type: "invite_team_member";
  data: {
    email: string;
    name?: string;
    role?: string;
    company_name?: string;
    invite_link?: string;
  };
}

interface TestEmailPayload {
  type: "test_email";
  data: {
    to: string;
    message?: string;
  };
}

type EmailPayload =
  | InterviewInvitationPayload
  | InviteTeamMemberPayload
  | TestEmailPayload;

interface EmailResponse {
  success: boolean;
  message: string;
  messageId?: string;
}

// Initialize Resend - will be created when needed to avoid module load errors
let resend: InstanceType<typeof Resend> | null = null;

serve(async (req: Request): Promise<Response> => {
  // CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Only allow POST requests
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ success: false, message: "Method not allowed" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse request body
    const payload: EmailPayload = await req.json();

    // Validate payload structure
    if (!payload.type || !payload.data) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Invalid payload structure",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Route to appropriate handler
    let result: EmailResponse;
    switch (payload.type) {
      case "interview_invitation":
        result = await handleInterviewInvitation(payload);
        break;
      case "invite_team_member":
        result = await handleInviteTeamMember(payload);
        break;
      case "test_email":
        result = await handleTestEmail(payload);
        break;
      default:
        return new Response(
          JSON.stringify({ success: false, message: "Unknown email type" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
    }

    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Internal server error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function handleInterviewInvitation(
  payload: InterviewInvitationPayload
): Promise<EmailResponse> {
  const { data } = payload;

  // Initialize Resend if not already done
  if (!resend) {
    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      return {
        success: false,
        message: "RESEND_API_KEY environment variable is not set",
      };
    }
    resend = new Resend(apiKey);
  }

  // Validate required fields
  if (
    !data.interviewee_email ||
    !data.interview_name ||
    !data.access_code ||
    !data.interview_id ||
    !data.sender_email
  ) {
    return {
      success: false,
      message: "Missing required fields for interview invitation (interviewee_email, interview_name, access_code, interview_id, sender_email)",
    };
  }

  // Generate the public interview URL
  const baseUrl = Deno.env.get("SITE_URL") || "https://vantage.teampps.com.au";
  const interviewUrl = `${baseUrl}/external/interview/${data.interview_id}?code=${data.access_code}&email=${encodeURIComponent(data.interviewee_email)}`;

  // Create email content
  const htmlContent = createInterviewInvitationHTML({
    ...data,
    interview_url: interviewUrl,
  });

  const textContent = createInterviewInvitationText({
    ...data,
    interview_url: interviewUrl,
  });

  try {
    const senderName = data.sender_name || data.sender_email;
    const fromCompany = data.company_name ? ` from ${data.company_name}` : "";
    
    const emailResult = await resend.emails.send({
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
      message: `Failed to send email: ${error.message}`,
    };
  }
}

async function handleInviteTeamMember(
  payload: InviteTeamMemberPayload
): Promise<EmailResponse> {
  // Placeholder implementation for future team member invitations
  console.log("Team member invitation requested:", payload);

  return {
    success: false,
    message: "Team member invitations not yet implemented",
  };
}

async function handleTestEmail(
  payload: TestEmailPayload
): Promise<EmailResponse> {
  const { data } = payload;

  // Initialize Resend if not already done
  if (!resend) {
    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      return {
        success: false,
        message: "RESEND_API_KEY environment variable is not set",
      };
    }
    resend = new Resend(apiKey);
  }

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
    const emailResult = await resend.emails.send({
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
                <li><strong>Service:</strong> Resend via Supabase Edge Functions</li>
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
- Service: Resend via Supabase Edge Functions

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
      message: `Failed to send test email: ${error.message}`,
    };
  }
}

// HTML template for interview invitation
function createInterviewInvitationHTML(data: {
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
          
          <p>You have been invited by <strong>${data.sender_name || data.sender_email}</strong>${data.company_name ? ` from <strong>${data.company_name}</strong>` : ""} to complete an interview for the assessment <strong>${data.assessment_name}</strong>.</p>
          
          <div class="details">
            <h3>Interview Details:</h3>
            <ul>
              <li><strong>Interview:</strong> ${data.interview_name}</li>
              <li><strong>Assessment:</strong> ${data.assessment_name}</li>
              <li><strong>Access Code:</strong> <span class="access-code">${data.access_code}</span></li>
              ${data.interviewer_name ? `<li><strong>Interviewer:</strong> ${data.interviewer_name}</li>` : ""}
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
          
          <p>If you have any questions or need assistance, please contact <strong>${data.sender_name || data.sender_email}</strong> at <a href="mailto:${data.sender_email}">${data.sender_email}</a>.</p>
          
          <p>Best regards,<br><strong>${data.sender_name || data.sender_email}</strong>${data.company_name ? `<br>${data.company_name}` : ""}</p>
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
function createInterviewInvitationText(data: {
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

You have been invited by ${data.sender_name || data.sender_email}${data.company_name ? ` from ${data.company_name}` : ""} to complete an interview for the assessment "${data.assessment_name}".

Interview Details:
- Interview: ${data.interview_name}
- Assessment: ${data.assessment_name}
- Access Code: ${data.access_code}
${data.interviewer_name ? `- Interviewer: ${data.interviewer_name}` : ""}

To begin your interview, visit this link:
${data.interview_url}

If you have any questions or need assistance, please contact ${data.sender_name || data.sender_email} at ${data.sender_email}.

Best regards,
${data.sender_name || data.sender_email}${data.company_name ? `
${data.company_name}` : ""}

---
This email was sent by Vantage. Please do not reply to this email.
  `.trim();
}
