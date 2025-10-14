#!/usr/bin/env tsx
/**
 * Interactive Email Template Testing Script
 *
 * Provides an interactive CLI to test all Handlebars email templates.
 * Select from different email types and send them to a test recipient.
 *
 * Usage:
 *   npx tsx scripts/send-test-email.ts
 *
 * Environment variables required:
 *   - RESEND_API_KEY: Your Resend API key
 *   - SITE_URL: The base URL for your application (defaults to http://localhost:5173)
 */

import { config } from "dotenv";
import inquirer from "inquirer";
import { EmailService } from "../server/src/services/EmailService.js";
import type {
  TestEmailData,
  InviteTeamMemberData,
  RoleChangeNotificationData,
  InterviewReminderData,
} from "../server/src/services/EmailService.js";

// Load environment variables from scripts/.env
config({ path: "./scripts/.env" });

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SITE_URL = process.env.SITE_URL || "http://localhost:5173";

type EmailType = "test" | "interview" | "reminder" | "team" | "role";

/**
 * Generate mock data for test email
 */
function generateTestEmailData(recipient: string): TestEmailData {
  return {
    to: recipient,
    message:
      "This test email verifies that the Handlebars template migration is working correctly. The green gradient header and clean styling confirm successful template rendering!",
  };
}

/**
 * Generate mock data for team member invitation
 * Why: Team invites need member name, company, role, and invite link
 */
function generateTeamMemberInviteData(
  recipient: string
): InviteTeamMemberData {
  return {
    email: recipient,
    name: "Sarah Johnson",
    role: "Project Manager",
    company_name: "Vantage Mining Solutions",
    invite_link: `${SITE_URL}/companies/abc123`,
  };
}

/**
 * Generate mock data for role change notification
 * Why: Role changes need old/new roles and who made the change
 */
function generateRoleChangeData(recipient: string): RoleChangeNotificationData {
  return {
    email: recipient,
    name: "Sarah Johnson",
    old_role: "Member",
    new_role: "Administrator",
    company_name: "Vantage Mining Solutions",
    changed_by_name: "Tom Bikaun",
  };
}

/**
 * Generate mock data for interview reminder
 * Why: Reminders need all interview details plus optional due date
 */
function generateInterviewReminderData(
  recipient: string
): InterviewReminderData {
  return {
    interviewee_email: recipient,
    interviewee_name: "Sarah Johnson",
    interview_name: "Site Safety Assessment Interview",
    assessment_name: "Q4 2024 Safety Review",
    access_code: "SAFE-2024-XYZ789",
    interview_id: 12345,
    sender_name: "Tom Bikaun",
    sender_email: "tbikaun@teampps.com.au",
    company_name: "Vantage Mining Solutions",
    due_date: "Friday, 18th October 2024",
  };
}

/**
 * Prompt user to select email type
 */
async function selectEmailType(): Promise<EmailType> {
  const { emailType } = await inquirer.prompt([
    {
      type: "list",
      name: "emailType",
      message: "Select email template to test:",
      choices: [
        {
          name: "📧 Test Email - Simple verification email with green gradient",
          value: "test",
          short: "Test Email",
        },
        {
          name: "📨 Interview Invitation - Purple gradient with interview details and access code",
          value: "interview",
          short: "Interview Invitation",
        },
        {
          name: "📅 Interview Reminder - Purple gradient reminder for incomplete interview",
          value: "reminder",
          short: "Interview Reminder",
        },
        {
          name: "👥 Team Member Invite - Green gradient welcoming new team member",
          value: "team",
          short: "Team Invite",
        },
        {
          name: "🔄 Role Change Notification - Purple gradient showing role update",
          value: "role",
          short: "Role Change",
        },
      ],
      default: "test",
    },
  ]);

  return emailType;
}

/**
 * Prompt user for recipient email
 */
async function promptRecipient(): Promise<string> {
  const { recipient } = await inquirer.prompt([
    {
      type: "input",
      name: "recipient",
      message: "Enter recipient email address:",
      default: "tbikaun@teampps.com.au",
      validate: (input: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(input) || "Please enter a valid email address";
      },
    },
  ]);

  return recipient;
}

/**
 * Display interview invitation info
 * Why: Interview invitations require Supabase data, so we show what would be needed
 */
function displayInterviewInvitationInfo() {
  console.log("\n⚠️  Interview Invitation Limitation:");
  console.log(
    "   Interview invitations require actual database records (interview, contact, profile)."
  );
  console.log(
    "   This email type cannot be tested with mock data via this script.\n"
  );
  console.log("📝 To test interview invitations:");
  console.log(
    "   1. Use the production server's /send-interview-invitation endpoint"
  );
  console.log("   2. Create a real interview in the database first");
  console.log(
    "   3. Or modify EmailService to accept mock data for testing\n"
  );
}

async function main() {
  console.log("📧 Interactive Email Template Testing\n");

  // Validate environment variables
  if (!RESEND_API_KEY) {
    console.error("❌ Missing required environment variable: RESEND_API_KEY");
    console.error("   Please set it in scripts/.env\n");
    process.exit(1);
  }

  console.log("📋 Configuration:");
  console.log(`   API Key: ${RESEND_API_KEY.substring(0, 10)}...`);
  console.log(`   Site URL: ${SITE_URL}\n`);

  // Initialize EmailService
  const emailService = new EmailService(RESEND_API_KEY, SITE_URL);

  // Select email type
  const emailType = await selectEmailType();

  // Handle interview invitation special case
  // Why: Interview invitations need Supabase client and real database records
  if (emailType === "interview") {
    displayInterviewInvitationInfo();
    process.exit(0);
  }

  // Get recipient
  const recipient = await promptRecipient();

  console.log(`\n🚀 Sending ${emailType} email to ${recipient}...\n`);

  try {
    let result;

    // Route to appropriate email service method based on type
    switch (emailType) {
      case "test": {
        const data = generateTestEmailData(recipient);
        result = await emailService.sendTestEmail(data);
        break;
      }

      case "team": {
        const data = generateTeamMemberInviteData(recipient);
        result = await emailService.sendTeamMemberInvite(data);
        break;
      }

      case "reminder": {
        const data = generateInterviewReminderData(recipient);
        result = await emailService.sendInterviewReminder(data);
        break;
      }

      case "role": {
        const data = generateRoleChangeData(recipient);
        result = await emailService.sendRoleChangeNotification(data);
        break;
      }

      default:
        console.error(`❌ Unknown email type: ${emailType}`);
        process.exit(1);
    }

    if (result.success) {
      console.log("✅ Email sent successfully!");
      console.log(`   Message ID: ${result.messageId}`);
      console.log(`   Status: ${result.message}\n`);
      console.log(`📬 Please check ${recipient} for the email.`);
      console.log(
        "   Note: It may take a few moments for the email to arrive.\n"
      );
    } else {
      console.error("❌ Failed to send email:");
      console.error(`   ${result.message}\n`);
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Unexpected error occurred:");
    console.error(
      `   ${error instanceof Error ? error.message : String(error)}\n`
    );
    process.exit(1);
  }
}

// Run the script
main().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
