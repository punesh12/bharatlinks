"use server";

import { Resend } from "resend";

/**
 * Email service for sending notifications using Resend
 */

interface InvitationEmailData {
  email: string;
  workspaceName: string;
  inviterName: string;
  invitationLink: string;
  expiresAt: Date;
}

/**
 * Get Resend client instance
 * Initialize on each call to ensure env vars are loaded
 */
const getResendClient = () => {
  const apiKey = process.env.NEXT_PUBLIC_APP_RESEND_API_KEY?.trim().replace(/^["']|["']$/g, "");
  if (!apiKey) {
    return null;
  }
  return new Resend(apiKey);
};

/**
 * Send workspace invitation email
 */
export const sendInvitationEmail = async (data: InvitationEmailData): Promise<void> => {
  const invitationLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/invite/${data.invitationLink}`;

  // Get API key and check if configured
  const apiKey = process.env.NEXT_PUBLIC_APP_RESEND_API_KEY?.trim().replace(/^["']|["']$/g, "");

  if (!apiKey) {
    console.log(
      "📧 Invitation Email (NEXT_PUBLIC_APP_RESEND_API_KEY not configured - email not sent):",
      {
        to: data.email,
        subject: `You've been invited to join ${data.workspaceName} on BharatLinks`,
        invitationLink,
        expiresAt: data.expiresAt.toLocaleDateString(),
      }
    );
    console.log("To enable email sending, add NEXT_PUBLIC_APP_RESEND_API_KEY to your .env file");
    return;
  }

  const resend = getResendClient();
  if (!resend) {
    console.error("❌ Failed to initialize Resend client");
    return;
  }

  // Get the from email from environment or use a default
  // Note: Resend requires verified domains or use onboarding@resend.dev for testing
  let fromEmail = process.env.NEXT_PUBLIC_APP_RESEND_FROM_EMAIL?.trim().replace(/^["']|["']$/g, "");

  // Validate FROM email format - if it doesn't look like a valid Resend format, use default
  if (!fromEmail || (!fromEmail.includes("@resend.dev") && !fromEmail.includes("<"))) {
    console.warn(
      "⚠️ FROM email not properly formatted or not verified. Using default Resend email."
    );
    fromEmail = "BharatLinks <onboarding@resend.dev>";
  }

  try {
    console.log("📧 Sending invitation email:", {
      to: data.email,
      from: fromEmail,
      workspaceName: data.workspaceName,
      apiKeyPrefix: apiKey.substring(0, 5) + "...",
    });

    const result = await resend.emails.send({
      from: fromEmail,
      to: data.email,
      subject: `You've been invited to join ${data.workspaceName} on BharatLinks`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">You've been invited!</h1>
            </div>
            <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
              <p style="font-size: 16px; margin-bottom: 20px;">
                You've been invited by <strong>${data.inviterName}</strong> to collaborate on the workspace <strong>"${data.workspaceName}"</strong> on BharatLinks.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${invitationLink}" style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
                  Accept Invitation
                </a>
              </div>
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                This invitation will expire on <strong>${data.expiresAt.toLocaleDateString()}</strong>.
              </p>
              <p style="color: #6b7280; font-size: 14px; margin-top: 10px;">
                If you didn't expect this invitation, you can safely ignore this email.
              </p>
            </div>
            <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
              <p>BharatLinks - The Smart Link Management Platform</p>
            </div>
          </body>
        </html>
      `,
      text: `
You've been invited to join ${data.workspaceName} on BharatLinks

You've been invited by ${data.inviterName} to collaborate on the workspace "${data.workspaceName}" on BharatLinks.

Click the link below to accept the invitation:
${invitationLink}

This invitation will expire on ${data.expiresAt.toLocaleDateString()}.

If you didn't expect this invitation, you can safely ignore this email.
      `.trim(),
    });

    console.log(`✅ Invitation email sent successfully to ${data.email}`, result);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Failed to send invitation email:", {
      error: errorMessage,
      details: error,
      to: data.email,
      fromEmail,
      apiKeyPresent: !!apiKey,
    });
    // Don't re-throw - let the caller handle gracefully
    // The invitation is already created, so email failure shouldn't break the flow
  }
};
