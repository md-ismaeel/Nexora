import nodemailer, { type Transporter, type SendMailOptions } from "nodemailer";
import { getEnv } from "@/config/env.config";
import { ApiError } from "@/utils/ApiError";

import * as emailTemplates from "@/templates/email.template";

// ─── Singleton transporter
let transporter: Transporter | null = null;

const getTransporter = (): Transporter => {
  if (transporter) return transporter;

  const host = getEnv("SMTP_HOST");
  const port = Number(getEnv("SMTP_PORT", "587"));
  const user = getEnv("SMTP_USER");
  const pass = getEnv("SMTP_PASS");

  if (!host || !user || !pass) {
    throw ApiError.internal("Email service is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS.",);
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
  });

  return transporter;
};

/**
 * Verify the SMTP connection at startup.
 * Call in server.ts after env validation so misconfiguration fails early.
 */
export const verifyEmailConnection = async (): Promise<void> => {
  try {
    await getTransporter().verify();
    console.log("✅ SMTP connection verified");
  } catch (err) {
    console.warn("SMTP connection failed:", (err as Error).message);
  }
};

// ─── Low-level send
const appFrom = (): string => {
  const name = getEnv("APP_NAME", "Discord App");
  return getEnv("SMTP_FROM") || `"${name}" <noreply@discordapp.local>`;
};

/**
 * Base send — attaches a consistent `from` and error-wraps nodemailer.
 * All higher-level helpers call this.
 */
export const sendEmail = async (options: SendMailOptions): Promise<void> => {
  try {
    await getTransporter().sendMail({ from: appFrom(), ...options });
  } catch (err) {
    console.error("Email send failed:", err);
    throw ApiError.internal("Failed to send email. Please try again later.");
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Typed email helpers — one per template
// ─────────────────────────────────────────────────────────────────────────────

// 1. OTP (email address or phone verification)
export const sendOtpEmail = async (
  to: string,
  otp: string,
  type: "email" | "phone" = "email",
): Promise<void> => {
  const appName = getEnv("APP_NAME", "Discord App");
  await sendEmail({
    to,
    subject: `${appName} — Your verification code`,
    text: emailTemplates.otpEmailText(otp, type),
    html: emailTemplates.otpEmailTemplate(otp, type),
  });
};

// 2. Welcome / Registration confirmation
export const sendWelcomeEmail = async (
  to: string,
  opts: emailTemplates.WelcomeTemplateOptions,
): Promise<void> => {
  const appName = getEnv("APP_NAME", "Discord App");
  await sendEmail({
    to,
    subject: `Welcome to ${appName}, ${opts.name}! 🎉`,
    text: emailTemplates.registerText(opts),
    html: emailTemplates.registerTemplate(opts),
  });
};

// 3. New login alert
export const sendLoginAlertEmail = async (
  to: string,
  opts: emailTemplates.LoginAlertTemplateOptions,
): Promise<void> => {
  const appName = getEnv("APP_NAME", "Discord App");
  await sendEmail({
    to,
    subject: `${appName} — New sign-in to your account`,
    text: emailTemplates.loginText(opts),
    html: emailTemplates.loginTemplate(opts),
  });
};

// 4. Forgot password (OTP-based)
export const sendForgotPasswordEmail = async (
  to: string,
  opts: emailTemplates.ForgotPasswordTemplateOptions,
): Promise<void> => {
  const appName = getEnv("APP_NAME", "Discord App");
  await sendEmail({
    to,
    subject: `${appName} — Reset your password`,
    text: emailTemplates.forgetPasswordText(opts),
    html: emailTemplates.forgetPasswordTemplate(opts),
  });
};

// 5. Reset password (link-based)
export const sendResetPasswordEmail = async (
  to: string,
  opts: emailTemplates.ResetPasswordTemplateOptions,
): Promise<void> => {
  const appName = getEnv("APP_NAME", "Discord App");
  await sendEmail({
    to,
    subject: `${appName} — Set a new password`,
    text: emailTemplates.resetPasswordText(opts),
    html: emailTemplates.resetPasswordTemplate(opts),
  });
};

// 6. Password changed confirmation
export const sendPasswordChangedEmail = async (
  to: string,
  opts: emailTemplates.PasswordChangedTemplateOptions,
): Promise<void> => {
  const appName = getEnv("APP_NAME", "Discord App");
  await sendEmail({
    to,
    subject: `${appName} — Your password was changed`,
    text: emailTemplates.passwordChangedText(opts),
    html: emailTemplates.passwordChangedTemplate(opts),
  });
};

// 7. Friend request received
export const sendFriendRequestEmail = async (
  to: string,
  opts: emailTemplates.FriendRequestTemplateOptions,
): Promise<void> => {
  const appName = getEnv("APP_NAME", "Discord App");
  await sendEmail({
    to,
    subject: `${appName} — @${opts.senderUsername} sent you a friend request`,
    text: emailTemplates.friendRequestText(opts),
    html: emailTemplates.friendRequestTemplate(opts),
  });
};

// 8. Friend request accepted
export const sendFriendRequestAcceptedEmail = async (
  to: string,
  opts: emailTemplates.FriendRequestAcceptedTemplateOptions,
): Promise<void> => {
  const appName = getEnv("APP_NAME", "Discord App");
  await sendEmail({
    to,
    subject: `${appName} — @${opts.acceptorUsername} accepted your friend request`,
    text: emailTemplates.friendRequestAcceptedText(opts),
    html: emailTemplates.friendRequestAcceptedTemplate(opts),
  });
};

// 9. Server invite
export const sendServerInviteEmail = async (
  to: string,
  opts: emailTemplates.ServerInviteTemplateOptions,
): Promise<void> => {
  const appName = getEnv("APP_NAME", "Discord App");
  await sendEmail({
    to,
    subject: `${appName} — You've been invited to join ${opts.serverName}`,
    text: emailTemplates.serverInviteText(opts),
    html: emailTemplates.serverInviteTemplate(opts),
  });
};

// 10. Account deleted
export const sendAccountDeletedEmail = async (
  to: string,
  opts: emailTemplates.AccountDeletedTemplateOptions,
): Promise<void> => {
  const appName = getEnv("APP_NAME", "Discord App");
  await sendEmail({
    to,
    subject: `${appName} — Your account has been deleted`,
    text: emailTemplates.accountDeletedText(opts),
    html: emailTemplates.accountDeletedTemplate(opts),
  });
};