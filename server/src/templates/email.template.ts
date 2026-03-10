/**
 * email_templates.ts
 *
 * All transactional email templates for the app.
 * Design system: dark theme matching the app UI (#0f0f0f bg, #1e1f22 card,
 * #5865f2/#7289da Discord-style indigo accent, #b5bac1 body text, #fff headings).
 *
 * Every template:
 *  - Returns a complete, self-contained HTML string (no external CSS/fonts)
 *  - Uses table-based layout for maximum email-client compatibility
 *  - Includes a plain-text fallback via the `text` export alongside `html`
 *  - Accepts only what it needs — no unused params
 */

// ─── Shared constants & helpers ───────────────────────────────────────────────

const BRAND_PRIMARY = "#5865f2";
const BRAND_GRADIENT = "linear-gradient(135deg,#5865f2,#7289da)";
const BG_PAGE = "#0f0f0f";
const BG_CARD = "#1e1f22";
const BG_INNER = "#2b2d31";
const BG_FOOTER = "#16171a";
const TEXT_BODY = "#b5bac1";
const TEXT_MUTED = "#4e5058";
const TEXT_WHITE = "#ffffff";

const year = () => new Date().getFullYear();

/** Shared outer wrapper — page bg + centered card */
const wrap = (inner: string): string => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
</head>
<body style="margin:0;padding:0;background:${BG_PAGE};font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
         style="background:${BG_PAGE};padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" role="presentation"
               style="width:100%;max-width:480px;background:${BG_CARD};
                      border-radius:12px;overflow:hidden;
                      box-shadow:0 8px 32px rgba(0,0,0,.6);">

          <!-- ── Header ── -->
          <tr>
            <td style="background:${BRAND_GRADIENT};padding:32px;text-align:center;">
              <h1 style="color:${TEXT_WHITE};margin:0;font-size:22px;
                         font-weight:700;letter-spacing:0.5px;">
                🔐 Discord App
              </h1>
            </td>
          </tr>

          <!-- ── Body ── -->
          ${inner}

          <!-- ── Footer ── -->
          <tr>
            <td style="background:${BG_FOOTER};padding:20px 32px;text-align:center;">
              <p style="color:${TEXT_MUTED};margin:0;font-size:12px;line-height:1.6;">
                © ${year()} Discord App. All rights reserved.<br />
                This is an automated message — please do not reply.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

/** Reusable primary CTA button */
const btn = (href: string, label: string): string => `
  <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto;">
    <tr>
      <td style="border-radius:8px;background:${BRAND_PRIMARY};">
        <a href="${href}"
           style="display:inline-block;padding:14px 32px;color:${TEXT_WHITE};
                  font-size:15px;font-weight:600;text-decoration:none;
                  border-radius:8px;letter-spacing:0.3px;">
          ${label}
        </a>
      </td>
    </tr>
  </table>`;

/** OTP code block — big monospace display */
const otpBlock = (otp: string): string => `
  <div style="margin:28px 0;text-align:center;">
    <span style="display:inline-block;background:${BG_INNER};
                 border:2px solid ${BRAND_PRIMARY};border-radius:10px;
                 padding:18px 40px;font-size:38px;font-weight:700;
                 letter-spacing:14px;color:${BRAND_PRIMARY};
                 font-family:'Courier New',Courier,monospace;">
      ${otp}
    </span>
  </div>`;

/** Info box — subtle highlighted note */
const infoBox = (content: string): string => `
  <div style="background:${BG_INNER};border-left:3px solid ${BRAND_PRIMARY};
              border-radius:4px;padding:14px 16px;margin:20px 0;">
    <p style="color:${TEXT_BODY};margin:0;font-size:13px;line-height:1.6;">
      ${content}
    </p>
  </div>`;

/** Standard body <td> wrapper */
const bodyTd = (content: string): string => `
  <tr>
    <td style="padding:36px 32px;">
      ${content}
    </td>
  </tr>`;

/** Heading + subheading pair */
const heading = (title: string, subtitle: string): string => `
  <h2 style="color:${TEXT_WHITE};margin:0 0 10px;font-size:20px;font-weight:700;">
    ${title}
  </h2>
  <p style="color:${TEXT_BODY};margin:0 0 24px;font-size:15px;line-height:1.6;">
    ${subtitle}
  </p>`;

/** Security disclaimer shown at the bottom of auth emails */
const securityNote = (action: string): string => `
  <p style="color:${TEXT_MUTED};font-size:12px;margin:20px 0 0;line-height:1.6;">
    If you didn't ${action}, you can safely ignore this email.
    Your account has not been changed.
  </p>`;

// ─────────────────────────────────────────────────────────────────────────────
// 1. OTP — Email verification & Phone verification
// ─────────────────────────────────────────────────────────────────────────────

/**
 * OTP template used for both email address verification and phone verification.
 * @param otp    6-digit code
 * @param type   "email" → email verification  |  "phone" → phone verification
 */
export const otpEmailTemplate = (
  otp: string,
  type: "email" | "phone",
): string => {
  const label = type === "email" ? "email address" : "phone number";
  const purpose =
    type === "email" ? "verify your email address" : "verify your phone number";

  return wrap(
    bodyTd(`
    ${heading(
      "Verify your " + label,
      `Use the code below to ${purpose}. It expires in <strong style="color:${TEXT_WHITE};">10 minutes</strong>.`,
    )}
    ${otpBlock(otp)}
    <p style="color:${TEXT_BODY};margin:0;font-size:13px;line-height:1.6;">
      Never share this code with anyone — Discord App staff will never ask for it.
    </p>
    ${securityNote("request this code")}
  `),
  );
};

// Plain-text companion
export const otpEmailText = (otp: string, type: "email" | "phone"): string => {
  const label = type === "email" ? "email address" : "phone number";
  return [
    `Verify your ${label}`,
    ``,
    `Your Discord App verification code is: ${otp}`,
    ``,
    `It expires in 10 minutes. Never share this code with anyone.`,
    `If you didn't request this, you can safely ignore this email.`,
  ].join("\n");
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. Welcome — sent after successful registration
// ─────────────────────────────────────────────────────────────────────────────

export interface WelcomeTemplateOptions {
  name: string; // user's display name
  username: string; // @username
  loginUrl: string; // e.g. https://app.example.com/login
}

export const registerTemplate = (opts: WelcomeTemplateOptions): string =>
  wrap(
    bodyTd(`
    ${heading(
      `Welcome, ${opts.name}! 🎉`,
      "Your Discord App account has been created successfully. You're almost ready — just verify your email to get started.",
    )}

    ${infoBox(`Your username: <strong style="color:${TEXT_WHITE};">@${opts.username}</strong>`)}

    <p style="color:${TEXT_BODY};font-size:15px;line-height:1.6;margin:0 0 24px;">
      Once you verify your email you'll be able to:
    </p>
    <table cellpadding="0" cellspacing="0" role="presentation"
           style="width:100%;margin:0 0 28px;">
      ${[
        ["💬", "Send and receive direct messages"],
        ["🌐", "Join and create servers"],
        ["👥", "Connect with friends"],
        ["🔔", "Get real-time notifications"],
      ]
        .map(
          ([icon, text]) => `
        <tr>
          <td width="28" style="padding:4px 0;vertical-align:top;color:${TEXT_BODY};font-size:15px;">${icon}</td>
          <td style="padding:4px 0;color:${TEXT_BODY};font-size:15px;line-height:1.5;">${text}</td>
        </tr>`,
        )
        .join("")}
    </table>

    ${btn(opts.loginUrl, "Go to Discord App")}

    ${securityNote("create this account")}
  `),
  );

export const registerText = (opts: WelcomeTemplateOptions): string =>
  [
    `Welcome to Discord App, ${opts.name}!`,
    ``,
    `Your account has been created successfully.`,
    `Username: @${opts.username}`,
    ``,
    `Verify your email to unlock all features, then log in at: ${opts.loginUrl}`,
    ``,
    `If you didn't create this account, you can safely ignore this email.`,
  ].join("\n");

// ─────────────────────────────────────────────────────────────────────────────
// 3. New Login Alert — sent on every successful login
// ─────────────────────────────────────────────────────────────────────────────

export interface LoginAlertTemplateOptions {
  name: string;
  time: string; // pre-formatted datetime string, e.g. "Tue 10 Mar 2026, 14:32 UTC"
  ipAddress: string;
  device: string; // User-Agent or parsed device string, e.g. "Chrome on Windows"
  securityUrl: string; // link to account security settings
}

export const loginTemplate = (opts: LoginAlertTemplateOptions): string =>
  wrap(
    bodyTd(`
    ${heading(
      "New login to your account",
      `Hi ${opts.name}, we detected a new sign-in to your Discord App account.`,
    )}

    <table cellpadding="0" cellspacing="0" role="presentation"
           style="width:100%;background:${BG_INNER};border-radius:8px;
                  padding:20px;margin:0 0 24px;">
      ${[
        ["🕐 Time", opts.time],
        ["🌐 IP Address", opts.ipAddress],
        ["💻 Device", opts.device],
      ]
        .map(
          ([label, value]) => `
        <tr>
          <td style="padding:6px 16px 6px 0;color:${TEXT_MUTED};
                     font-size:13px;white-space:nowrap;vertical-align:top;">
            ${label}
          </td>
          <td style="padding:6px 0;color:${TEXT_WHITE};font-size:13px;word-break:break-all;">
            ${value}
          </td>
        </tr>`,
        )
        .join("")}
    </table>

    <p style="color:${TEXT_BODY};font-size:15px;line-height:1.6;margin:0 0 24px;">
      If this was you, no action is needed. If you don't recognise this activity,
      secure your account immediately.
    </p>

    ${btn(opts.securityUrl, "Review Account Security")}

    <p style="color:${TEXT_MUTED};font-size:12px;margin:20px 0 0;line-height:1.6;">
      To stop receiving login alerts, update your notification preferences in Settings.
    </p>
  `),
  );

export const loginText = (opts: LoginAlertTemplateOptions): string =>
  [
    `New login detected — Discord App`,
    ``,
    `Hi ${opts.name},`,
    ``,
    `A new sign-in was detected on your account.`,
    `  Time:       ${opts.time}`,
    `  IP Address: ${opts.ipAddress}`,
    `  Device:     ${opts.device}`,
    ``,
    `If this was you, no action is needed.`,
    `If you don't recognise this, visit your security settings: ${opts.securityUrl}`,
  ].join("\n");

// ─────────────────────────────────────────────────────────────────────────────
// 4. Forgot Password — OTP-based reset initiation
// ─────────────────────────────────────────────────────────────────────────────

export interface ForgotPasswordTemplateOptions {
  name: string;
  otp: string; // 6-digit reset code
}

export const forgetPasswordTemplate = (
  opts: ForgotPasswordTemplateOptions,
): string =>
  wrap(
    bodyTd(`
    ${heading(
      "Reset your password",
      `Hi ${opts.name}, use the code below to reset your Discord App password.
       It expires in <strong style="color:${TEXT_WHITE};">10 minutes</strong>.`,
    )}
    ${otpBlock(opts.otp)}
    ${infoBox(
      `Enter this code in the app on the password-reset page.
       Do <strong>not</strong> share this code — Discord App staff will never ask for it.`,
    )}
    ${securityNote("request a password reset")}
  `),
  );

export const forgetPasswordText = (
  opts: ForgotPasswordTemplateOptions,
): string =>
  [
    `Reset your Discord App password`,
    ``,
    `Hi ${opts.name},`,
    ``,
    `Your password reset code is: ${opts.otp}`,
    ``,
    `It expires in 10 minutes. Enter it in the app to set a new password.`,
    `Never share this code with anyone.`,
    ``,
    `If you didn't request a password reset, you can safely ignore this email.`,
  ].join("\n");

// ─────────────────────────────────────────────────────────────────────────────
// 5. Reset Password — link-based alternative (if you prefer tokens over OTP)
// ─────────────────────────────────────────────────────────────────────────────

export interface ResetPasswordTemplateOptions {
  name: string;
  resetUrl: string; // https://app.example.com/reset-password?token=<jwt>
  expiresIn: string; // human-readable, e.g. "1 hour"
}

export const resetPasswordTemplate = (
  opts: ResetPasswordTemplateOptions,
): string =>
  wrap(
    bodyTd(`
    ${heading(
      "Set a new password",
      `Hi ${opts.name}, click the button below to choose a new password for your Discord App account.
       The link expires in <strong style="color:${TEXT_WHITE};">${opts.expiresIn}</strong>.`,
    )}

    <div style="text-align:center;margin:32px 0;">
      ${btn(opts.resetUrl, "Reset My Password")}
    </div>

    ${infoBox(`
      If the button above doesn't work, copy and paste this URL into your browser:<br />
      <a href="${opts.resetUrl}" style="color:${BRAND_PRIMARY};word-break:break-all;">
        ${opts.resetUrl}
      </a>
    `)}

    ${securityNote("request a password reset")}
  `),
  );

export const resetPasswordText = (opts: ResetPasswordTemplateOptions): string =>
  [
    `Reset your Discord App password`,
    ``,
    `Hi ${opts.name},`,
    ``,
    `Click the link below to set a new password (expires in ${opts.expiresIn}):`,
    opts.resetUrl,
    ``,
    `If you didn't request this, you can safely ignore this email.`,
  ].join("\n");

// ─────────────────────────────────────────────────────────────────────────────
// 6. Password Changed Confirmation
// ─────────────────────────────────────────────────────────────────────────────

export interface PasswordChangedTemplateOptions {
  name: string;
  time: string; // pre-formatted datetime
  ipAddress: string;
  securityUrl: string;
}

export const passwordChangedTemplate = (
  opts: PasswordChangedTemplateOptions,
): string =>
  wrap(
    bodyTd(`
    ${heading(
      "Your password was changed ✅",
      `Hi ${opts.name}, your Discord App password was successfully updated.`,
    )}

    <table cellpadding="0" cellspacing="0" role="presentation"
           style="width:100%;background:${BG_INNER};border-radius:8px;
                  padding:20px;margin:0 0 24px;">
      ${[
        ["🕐 Time", opts.time],
        ["🌐 IP Address", opts.ipAddress],
      ]
        .map(
          ([label, value]) => `
        <tr>
          <td style="padding:6px 16px 6px 0;color:${TEXT_MUTED};
                     font-size:13px;white-space:nowrap;vertical-align:top;">${label}</td>
          <td style="padding:6px 0;color:${TEXT_WHITE};font-size:13px;">${value}</td>
        </tr>`,
        )
        .join("")}
    </table>

    <p style="color:${TEXT_BODY};font-size:15px;line-height:1.6;margin:0 0 24px;">
      If this was you, no further action is needed.
      If you did <strong style="color:${TEXT_WHITE};">not</strong> make this change,
      secure your account immediately — your password may be compromised.
    </p>

    ${btn(opts.securityUrl, "Secure My Account")}

    <p style="color:${TEXT_MUTED};font-size:12px;margin:20px 0 0;line-height:1.6;">
      For your protection, all active sessions have been logged out.
      Please log in again with your new password.
    </p>
  `),
  );

export const passwordChangedText = (
  opts: PasswordChangedTemplateOptions,
): string =>
  [
    `Your Discord App password was changed`,
    ``,
    `Hi ${opts.name},`,
    ``,
    `Your password was successfully updated.`,
    `  Time:       ${opts.time}`,
    `  IP Address: ${opts.ipAddress}`,
    ``,
    `If this wasn't you, visit your security settings immediately: ${opts.securityUrl}`,
    `All active sessions have been logged out.`,
  ].join("\n");

// ─────────────────────────────────────────────────────────────────────────────
// 7. Friend Request Received
// ─────────────────────────────────────────────────────────────────────────────

export interface FriendRequestTemplateOptions {
  recipientName: string;
  senderUsername: string;
  senderAvatar?: string; // URL — omit if email client blocks images
  actionUrl: string; // deep link to friend requests page in the app
}

export const friendRequestTemplate = (
  opts: FriendRequestTemplateOptions,
): string =>
  wrap(
    bodyTd(`
    ${heading(
      "New friend request 👋",
      `Hi ${opts.recipientName}, <strong style="color:${TEXT_WHITE};">@${opts.senderUsername}</strong>
       wants to be your friend on Discord App.`,
    )}

    ${infoBox(`
      Open Discord App to accept or decline the request.
      Friend requests expire if not accepted within 30 days.
    `)}

    <div style="text-align:center;margin:28px 0;">
      ${btn(opts.actionUrl, "View Friend Request")}
    </div>

    <p style="color:${TEXT_MUTED};font-size:12px;margin:0;line-height:1.6;">
      To stop receiving friend request emails, update your notification preferences in Settings.
    </p>
  `),
  );

export const friendRequestText = (opts: FriendRequestTemplateOptions): string =>
  [
    `New friend request — Discord App`,
    ``,
    `Hi ${opts.recipientName},`,
    ``,
    `@${opts.senderUsername} sent you a friend request on Discord App.`,
    ``,
    `Open the app to accept or decline: ${opts.actionUrl}`,
  ].join("\n");

// ─────────────────────────────────────────────────────────────────────────────
// 8. Friend Request Accepted
// ─────────────────────────────────────────────────────────────────────────────

export interface FriendRequestAcceptedTemplateOptions {
  recipientName: string; // the original sender whose request was accepted
  acceptorUsername: string; // the person who accepted
  profileUrl: string; // deep link to the new friend's profile / DM
}

export const friendRequestAcceptedTemplate = (
  opts: FriendRequestAcceptedTemplateOptions,
): string =>
  wrap(
    bodyTd(`
    ${heading(
      "Friend request accepted 🎉",
      `Hi ${opts.recipientName}, <strong style="color:${TEXT_WHITE};">@${opts.acceptorUsername}</strong>
       accepted your friend request! You can now message each other directly.`,
    )}

    <div style="text-align:center;margin:28px 0;">
      ${btn(opts.profileUrl, "Send a Message")}
    </div>

    <p style="color:${TEXT_MUTED};font-size:12px;margin:0;line-height:1.6;">
      To stop receiving friend activity emails, update your notification preferences in Settings.
    </p>
  `),
  );

export const friendRequestAcceptedText = (
  opts: FriendRequestAcceptedTemplateOptions,
): string =>
  [
    `Friend request accepted — Discord App`,
    ``,
    `Hi ${opts.recipientName},`,
    ``,
    `@${opts.acceptorUsername} accepted your friend request. You can now message each other!`,
    ``,
    `Start a conversation: ${opts.profileUrl}`,
  ].join("\n");

// ─────────────────────────────────────────────────────────────────────────────
// 9. Server Invite
// ─────────────────────────────────────────────────────────────────────────────

export interface ServerInviteTemplateOptions {
  recipientName: string;
  inviterUsername: string;
  serverName: string;
  serverDescription?: string;
  memberCount: number;
  inviteUrl: string; // https://app.example.com/invites/<code>
  expiresAt?: string; // pre-formatted, e.g. "Mar 17, 2026" — omit if no expiry
}

export const serverInviteTemplate = (
  opts: ServerInviteTemplateOptions,
): string =>
  wrap(
    bodyTd(`
    ${heading(
      `You've been invited to a server 🌐`,
      `Hi ${opts.recipientName}, <strong style="color:${TEXT_WHITE};">@${opts.inviterUsername}</strong>
       has invited you to join <strong style="color:${TEXT_WHITE};">${opts.serverName}</strong>.`,
    )}

    <table cellpadding="0" cellspacing="0" role="presentation"
           style="width:100%;background:${BG_INNER};border-radius:8px;
                  padding:20px;margin:0 0 24px;">
      <tr>
        <td style="padding:6px 16px 6px 0;color:${TEXT_MUTED};font-size:13px;white-space:nowrap;">
          🌐 Server
        </td>
        <td style="padding:6px 0;color:${TEXT_WHITE};font-size:13px;font-weight:600;">
          ${opts.serverName}
        </td>
      </tr>
      <tr>
        <td style="padding:6px 16px 6px 0;color:${TEXT_MUTED};font-size:13px;white-space:nowrap;">
          👥 Members
        </td>
        <td style="padding:6px 0;color:${TEXT_WHITE};font-size:13px;">
          ${opts.memberCount.toLocaleString()}
        </td>
      </tr>
      ${opts.serverDescription
        ? `
      <tr>
        <td style="padding:6px 16px 6px 0;color:${TEXT_MUTED};font-size:13px;white-space:nowrap;vertical-align:top;">
          📝 About
        </td>
        <td style="padding:6px 0;color:${TEXT_BODY};font-size:13px;line-height:1.5;">
          ${opts.serverDescription}
        </td>
      </tr>`
        : ""
      }
      ${opts.expiresAt
        ? `
      <tr>
        <td style="padding:6px 16px 6px 0;color:${TEXT_MUTED};font-size:13px;white-space:nowrap;">
          ⏳ Invite expires
        </td>
        <td style="padding:6px 0;color:${TEXT_BODY};font-size:13px;">
          ${opts.expiresAt}
        </td>
      </tr>`
        : ""
      }
    </table>

    <div style="text-align:center;margin:28px 0;">
      ${btn(opts.inviteUrl, "Join Server")}
    </div>

    ${securityNote("expect this invite")}
  `),
  );

export const serverInviteText = (opts: ServerInviteTemplateOptions): string =>
  [
    `Server invite — Discord App`,
    ``,
    `Hi ${opts.recipientName},`,
    ``,
    `@${opts.inviterUsername} has invited you to join "${opts.serverName}".`,
    opts.serverDescription ? `About: ${opts.serverDescription}` : "",
    `Members: ${opts.memberCount.toLocaleString()}`,
    opts.expiresAt ? `Invite expires: ${opts.expiresAt}` : "",
    ``,
    `Accept the invite: ${opts.inviteUrl}`,
    ``,
    `If you weren't expecting this, you can safely ignore it.`,
  ]
    .filter(Boolean)
    .join("\n");

// ─────────────────────────────────────────────────────────────────────────────
// 10. Account Deleted
// ─────────────────────────────────────────────────────────────────────────────

export interface AccountDeletedTemplateOptions {
  name: string;
  deletedAt: string; // pre-formatted datetime
  feedbackUrl?: string; // optional exit survey
}

export const accountDeletedTemplate = (
  opts: AccountDeletedTemplateOptions,
): string =>
  wrap(
    bodyTd(`
    ${heading(
      "Your account has been deleted",
      `Hi ${opts.name}, your Discord App account and all associated data have been permanently deleted
       as requested on <strong style="color:${TEXT_WHITE};">${opts.deletedAt}</strong>.`,
    )}

    <table cellpadding="0" cellspacing="0" role="presentation"
           style="width:100%;margin:0 0 24px;">
      ${[
        ["💬", "All your messages have been removed"],
        ["🌐", "You've been removed from all servers"],
        ["👥", "Your friend connections have been cleared"],
        ["📁", "Uploaded media has been queued for deletion"],
      ]
        .map(
          ([icon, text]) => `
        <tr>
          <td width="28" style="padding:4px 0;vertical-align:top;
                                color:${TEXT_BODY};font-size:14px;">${icon}</td>
          <td style="padding:4px 0;color:${TEXT_BODY};font-size:14px;line-height:1.5;">${text}</td>
        </tr>`,
        )
        .join("")}
    </table>

    ${opts.feedbackUrl
        ? `
      <p style="color:${TEXT_BODY};font-size:15px;margin:0 0 20px;line-height:1.6;">
        We're sorry to see you go. If you have a moment, we'd appreciate your feedback.
      </p>
      <div style="text-align:center;margin:0 0 24px;">
        ${btn(opts.feedbackUrl, "Share Feedback")}
      </div>`
        : ""
      }

    <p style="color:${TEXT_MUTED};font-size:12px;margin:0;line-height:1.6;">
      This action is permanent and cannot be undone.
      If you believe this was a mistake, please contact our support team promptly.
    </p>
  `),
  );

export const accountDeletedText = (
  opts: AccountDeletedTemplateOptions,
): string =>
  [
    `Your Discord App account has been deleted`,
    ``,
    `Hi ${opts.name},`,
    ``,
    `Your account was permanently deleted on ${opts.deletedAt}.`,
    `All messages, server memberships, and friend connections have been removed.`,
    ``,
    opts.feedbackUrl ? `We'd love your feedback: ${opts.feedbackUrl}` : "",
    ``,
    `This action cannot be undone. Contact support if this was a mistake.`,
  ]
    .filter((l) => l !== undefined)
    .join("\n");
