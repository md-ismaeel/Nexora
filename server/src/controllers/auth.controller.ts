import type { Request, Response } from "express";
import type { CookieOptions } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { sendSuccess, sendCreated } from "@/utils/response";
import { ApiError } from "@/utils/ApiError";
import { generateToken, verifyToken } from "@/utils/jwt";
import { hashPassword, comparePassword } from "@/utils/bcrypt";
import { ERROR_MESSAGES } from "@/constants/errorMessages";
import { SUCCESS_MESSAGES } from "@/constants/successMessages";
import { getEnv } from "@/config/env.config";
import { UserModel } from "@/models/user.model";
import { setTokenCookie } from "@/utils/setTokenCookie";
import { blacklistToken, isTokenBlacklisted, deleteRefreshToken } from "@/utils/redis";
import { validateObjectId } from "@/utils/validateObjId";
import { issueEmailOtp } from "@/controllers/otp.controller";
import { issueForgotPasswordOtp, verifyForgotPasswordOtp as verifyForgotPasswordOtpInRedis } from "@/utils/redis";
import { sendWelcomeEmail, sendLoginAlertEmail, sendAccountDeletedEmail, sendEmail } from "@/services/email.service";
import {
  recordLoginAttempt,
  clearLoginAttempts,
  recordRegisterAttempt,
  clearRegisterAttempts,
} from "@/middlewares/rateLimit.middleware";

// ─── Private helpers

// Resolve client IP — honours X-Forwarded-For when Express trust proxy is on
const getClientIp = (req: Request): string =>
  req.clientIp ??
  (req.headers["x-forwarded-for"] as string | undefined)
    ?.split(",")[0]
    ?.trim() ??
  req.ip ??
  req.socket.remoteAddress ??
  "unknown";

// Derive a human-readable device string from the User-Agent header
const parseDevice = (req: Request): string =>
  (req.headers["user-agent"] as string | undefined) ?? "Unknown device";

// Build a consistent timestamp string for security emails
const formatTime = (): string => new Date().toUTCString();

// Extract raw JWT from cookie or Authorization header
const extractToken = (req: Request): string | undefined => {
  const authHeader = req.headers.authorization;
  return (
    (req.cookies as Record<string, string | undefined>)?.["token"] ??
    (authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined)
  );
};

// ─── Register
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, username, phoneNumber } = req.body as {
    name: string;
    email: string;
    password: string;
    username?: string;
    phoneNumber?: string;
  };
  const clientIp = getClientIp(req);

  // Duplicate checks — run in parallel for speed, fail fast before touching DB
  const [existingEmail, existingUsername, existingPhone] = await Promise.all([
    UserModel.findOne({ email }, "_id").lean(),
    username ? UserModel.findOne({ username }, "_id").lean() : null,
    phoneNumber ? UserModel.findOne({ phoneNumber }, "_id").lean() : null,
  ]);

  if (existingEmail) {
    await recordRegisterAttempt(clientIp);
    throw ApiError.conflict(ERROR_MESSAGES.USER_ALREADY_EXISTS);
  }
  if (existingUsername) {
    await recordRegisterAttempt(clientIp);
    throw ApiError.conflict(ERROR_MESSAGES.USERNAME_TAKEN);
  }
  if (existingPhone) {
    await recordRegisterAttempt(clientIp);
    throw ApiError.conflict(ERROR_MESSAGES.PHONE_ALREADY_EXISTS);
  }

  const hashedPassword = await hashPassword(password);

  const user = await UserModel.create({
    name,
    email,
    password: hashedPassword,
    username,
    phoneNumber,
    provider: "email",
    status: "online",
    isEmailVerified: false,
    isPhoneVerified: false,
  });

  // Send verification OTP (non-fatal — user can resend)
  issueEmailOtp(email).catch((err) =>
    console.error("[otp] Email OTP delivery failed after register:", err),
  );

  const userResponse = await UserModel.findById(user._id).select("-password");
  if (!userResponse) throw ApiError.internal("Failed to retrieve created user.");

  const token = generateToken(userResponse._id);
  setTokenCookie(res, token);

  sendWelcomeEmail(email, {
    name: userResponse.name,
    username: userResponse.username ?? userResponse.name,
    loginUrl: `${getEnv("CLIENT_URL")}/login`,
  }).catch((err) => console.error("[email] Welcome email failed:", err));

  await clearRegisterAttempts(clientIp);

  return sendCreated(
    res,
    { user: userResponse, token },
    SUCCESS_MESSAGES.REGISTER_SUCCESS,
  );
});

// ─── Login
// FIX: moved isEmailVerified check BEFORE recordLoginAttempt so legitimate
// users who haven't verified their email don't get rate-limited out of their
// own account. Password is still validated first to prevent email enumeration.
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, username, password } = req.body as {
    email?: string;
    username?: string;
    password: string;
  };
  const clientIp = getClientIp(req);

  const query = email ? { email } : { username };

  // password is select:false — must opt-in explicitly
  const user = await UserModel.findOne(query).select("+password");
  if (!user) {
    await recordLoginAttempt(clientIp);
    throw ApiError.unauthorized(ERROR_MESSAGES.INVALID_CREDENTIALS);
  }

  // Block OAuth users from using password login
  if (user.provider !== "email") {
    await recordLoginAttempt(clientIp);
    throw ApiError.badRequest(
      `This account uses ${user.provider} login. Please sign in with ${user.provider}.`,
    );
  }

  // Paranoia guard — email provider users always have a password
  if (!user.password) {
    await recordLoginAttempt(clientIp);
    throw ApiError.unauthorized(ERROR_MESSAGES.INVALID_CREDENTIALS);
  }

  const isValid = await comparePassword(password, user.password);
  if (!isValid) {
    await recordLoginAttempt(clientIp);
    throw ApiError.unauthorized(ERROR_MESSAGES.INVALID_CREDENTIALS);
  }

  // FIX: check email verification AFTER password validation but WITHOUT
  // recording a login attempt — the user has proven they own the account,
  // they just need to complete verification. Recording an attempt here
  // would lock them out before they can verify.
  if (!user.isEmailVerified) {
    throw ApiError.unauthorized(ERROR_MESSAGES.EMAIL_NOT_VERIFIED);
  }

  await UserModel.findByIdAndUpdate(user._id, {
    status: "online",
    lastSeen: new Date(),
  });

  const token = generateToken(user._id);
  setTokenCookie(res, token);

  const userResponse = await UserModel.findById(user._id).select("-password");
  if (!userResponse) throw ApiError.internal("Failed to retrieve user.");

  await clearLoginAttempts(clientIp);

  if (userResponse.preferences?.notifications?.email !== false) {
    sendLoginAlertEmail(user.email, {
      name: userResponse.name,
      time: formatTime(),
      ipAddress: clientIp,
      device: parseDevice(req),
      securityUrl: `${getEnv("CLIENT_URL")}/settings/security`,
    }).catch((err) => console.error("[email] Login alert failed:", err));
  }

  return sendSuccess(
    res,
    { user: userResponse, token },
    SUCCESS_MESSAGES.LOGIN_SUCCESS,
  );
});

// ─── OAuth callback (Google / GitHub / Facebook)
export const oauthCallback = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized(ERROR_MESSAGES.UNAUTHORIZED);
    }

    const userId = validateObjectId(req.user._id);

    await UserModel.findByIdAndUpdate(userId, {
      status: "online",
      lastSeen: new Date(),
    });

    const token = generateToken(userId);
    setTokenCookie(res, token);

    const clientIp = getClientIp(req);
    if (req.user.preferences?.notifications?.email !== false) {
      sendLoginAlertEmail(req.user.email, {
        name: req.user.name,
        time: formatTime(),
        ipAddress: clientIp,
        device: parseDevice(req),
        securityUrl: `${getEnv("CLIENT_URL")}/settings/security`,
      }).catch((err) =>
        console.error("[email] OAuth login alert failed:", err),
      );
    }

    const clientUrl = getEnv("CLIENT_URL");
    res.redirect(`${clientUrl}/auth/success?token=${token}`);
  },
);

// ─── Logout
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const token = extractToken(req);

  if (token) {
    await blacklistToken(token, 604_800);
  }

  if (!req.user) {
    throw ApiError.unauthorized(ERROR_MESSAGES.UNAUTHORIZED);
  }

  const userId = validateObjectId(req.user._id);

  await deleteRefreshToken(userId.toString());

  await UserModel.findByIdAndUpdate(userId, {
    status: "offline",
    lastSeen: new Date(),
  });

  const isProd = getEnv("NODE_ENV") === "production";
  const cookieOptions: CookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "strict" : "lax",
  };

  res.clearCookie("token", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);

  return sendSuccess(res, null, SUCCESS_MESSAGES.LOGOUT_SUCCESS);
});

// ─── Auth status
export const getAuthStatus = asyncHandler(
  async (req: Request, res: Response) => {
    if (req.user) {
      return sendSuccess(
        res,
        { isAuthenticated: true, user: req.user },
        SUCCESS_MESSAGES.AUTH_STATUS_SUCCESS,
      );
    }
    return sendSuccess(res, { isAuthenticated: false, user: null });
  },
);

// ─── Refresh token
export const refreshToken = asyncHandler(
  async (req: Request, res: Response) => {
    const token: string | undefined =
      (req.cookies as Record<string, string | undefined>)?.["refreshToken"] ??
      (req.body as { refreshToken?: string })?.refreshToken;

    if (!token) {
      throw ApiError.unauthorized("Refresh token is required.");
    }

    const decoded = verifyToken(token);

    const isBlacklisted = await isTokenBlacklisted(token);
    if (isBlacklisted) {
      throw ApiError.unauthorized("Refresh token has been invalidated.");
    }

    const user = await UserModel.findById(decoded.userId);
    if (!user) throw ApiError.unauthorized(ERROR_MESSAGES.USER_NOT_FOUND);

    const newToken = generateToken(user._id);
    setTokenCookie(res, newToken);

    return sendSuccess(
      res,
      { token: newToken },
      SUCCESS_MESSAGES.TOKEN_REFRESHED,
    );
  },
);

// ─── Delete account
export const deleteAccount = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized(ERROR_MESSAGES.UNAUTHORIZED);
    }

    const userId = validateObjectId(req.user._id);

    const user = await UserModel.findById(userId);
    if (!user) throw ApiError.notFound(ERROR_MESSAGES.USER_NOT_FOUND);

    // Require password confirmation for email-provider accounts
    if (user.provider === "email") {
      const { password } = req.body as { password?: string };
      if (!password) {
        throw ApiError.badRequest(
          "Please provide your current password to confirm account deletion.",
        );
      }

      const userWithPassword = await UserModel.findById(userId).select("+password");
      const isValid = await comparePassword(
        password,
        userWithPassword?.password ?? "",
      );
      if (!isValid) {
        throw ApiError.unauthorized("Incorrect password. Account deletion cancelled.");
      }
    }

    const deletedAt = formatTime();
    const { name, email } = user;

    const token = extractToken(req);

    await Promise.all([
      token ? blacklistToken(token, 604_800) : Promise.resolve(),
      deleteRefreshToken(userId.toString()),
    ]);

    await UserModel.findByIdAndDelete(userId);

    const isProd = getEnv("NODE_ENV") === "production";
    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "strict" : "lax",
    };
    res.clearCookie("token", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);

    sendAccountDeletedEmail(email, {
      name,
      deletedAt,
      feedbackUrl: `${getEnv("CLIENT_URL")}/feedback`,
    }).catch((err) =>
      console.error("[email] Account deletion email failed:", err),
    );

    return sendSuccess(res, null, SUCCESS_MESSAGES.USER_DELETED);
  },
);

// ─── Forgot Password (OTP-based)
export const forgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body as { email: string };

    const user = await UserModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw ApiError.notFound(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    // Always respond success to prevent email enumeration
    // But actually send the OTP if user exists
    const otp = await issueForgotPasswordOtp(email.toLowerCase());

    // Send the email
    const { forgetPasswordTemplate, forgetPasswordText } = await import(
      "@/templates/email.template"
    );
    await sendEmail({
      to: email,
      subject: "Reset your Discord App password",
      html: forgetPasswordTemplate({ name: user.name, otp }),
      text: forgetPasswordText({ name: user.name, otp }),
    });

    // Log OTP in development
    if (process.env.NODE_ENV === "development") {
      console.log(`[DEV] Forgot Password OTP for ${email}: ${otp}`);
    }

    return sendSuccess(
      res,
      null,
      "If an account exists with this email, you will receive a password reset code.",
    );
  },
);

// ─── Verify Forgot Password OTP
export const verifyForgotPasswordOtp = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, code } = req.body as { email: string; code: string };

    const user = await UserModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw ApiError.notFound(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    const result = await verifyForgotPasswordOtpInRedis(email.toLowerCase(), code);

    switch (result) {
      case "ok":
        return sendSuccess(res, null, "OTP verified. You can now set a new password.");
      case "expired":
        throw ApiError.badRequest(ERROR_MESSAGES.OTP_EXPIRED);
      case "invalid":
        throw ApiError.badRequest(ERROR_MESSAGES.OTP_INVALID);
      case "locked":
        throw ApiError.tooManyRequests(ERROR_MESSAGES.OTP_LOCKED);
    }
  },
);

// ─── Reset Password (after OTP verification)
export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, code, newPassword } = req.body as {
      email: string;
      code: string;
      newPassword: string;
    };

    const user = await UserModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw ApiError.notFound(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    // First verify the OTP
    const result = await verifyForgotPasswordOtpInRedis(email.toLowerCase(), code);

    if (result !== "ok") {
      switch (result) {
        case "expired":
          throw ApiError.badRequest(ERROR_MESSAGES.OTP_EXPIRED);
        case "invalid":
          throw ApiError.badRequest(ERROR_MESSAGES.OTP_INVALID);
        case "locked":
          throw ApiError.tooManyRequests(ERROR_MESSAGES.OTP_LOCKED);
      }
    }

    // OTP is valid - now update the password
    const hashedPassword = await hashPassword(newPassword);

    await UserModel.findByIdAndUpdate(user._id, { password: hashedPassword });

    // Optionally send a confirmation email
    const { passwordResetConfirmationTemplate, passwordResetConfirmationText } =
      await import("@/templates/email.template");
    sendEmail({
      to: email,
      subject: "Your Discord App password has been changed",
      html: passwordResetConfirmationTemplate({ name: user.name }),
      text: passwordResetConfirmationText({ name: user.name }),
    }).catch((err) =>
      console.error("[email] Password reset confirmation failed:", err),
    );

    return sendSuccess(res, null, SUCCESS_MESSAGES.PASSWORD_RESET);
  },
);