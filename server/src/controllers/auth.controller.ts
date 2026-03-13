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
import {
  blacklistToken,
  isTokenBlacklisted,
  deleteRefreshToken,
} from "@/utils/redis";
import { validateObjectId } from "@/utils/validateObjId";
import {
  recordLoginAttempt,
  clearLoginAttempts,
  recordRegisterAttempt,
  clearRegisterAttempts,
} from "@/middlewares/rateLimit.middleware";
import { issueEmailOtp } from "@/controllers/otp.controller";
import {
  sendWelcomeEmail,
  sendLoginAlertEmail,
  sendAccountDeletedEmail,
} from "@/services/email.service";

// ─── Internal helpers

/** Resolve client IP — honours X-Forwarded-For when Express trust proxy is on */
const getClientIp = (req: Request): string =>
  req.clientIp ??
  (req.headers["x-forwarded-for"] as string | undefined)
    ?.split(",")[0]
    ?.trim() ??
  req.ip ??
  req.socket.remoteAddress ??
  "unknown";

/** Derive a human-readable device string from the User-Agent header */
const parseDevice = (req: Request): string =>
  (req.headers["user-agent"] as string | undefined) ?? "Unknown device";

/** Build a consistent timestamp string for security emails */
const formatTime = (): string => new Date().toUTCString();

// ─────────────────────────────────────────────────────────────────────────────
// POST /auth/register
// ─────────────────────────────────────────────────────────────────────────────

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, username, phoneNumber } = req.body as {
    name: string;
    email: string;
    password: string;
    username?: string;
    phoneNumber?: string;
  };
  const clientIp = getClientIp(req);

  // ── Duplicate checks — run in parallel for speed, fail fast before touching DB
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
    throw ApiError.conflict("An account with this phone number already exists.");
  }

  const hashedPassword = await hashPassword(password);

  // ── Create user
  // No session needed on a standalone MongoDB instance.
  // If OTP delivery fails we still have a valid account — the user can
  // request a new OTP via POST /auth/send-email-otp.
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

  // ── Send verification OTP (non-fatal — user can resend)
  issueEmailOtp(email).catch((err) =>
    console.error("[otp] Email OTP delivery failed after register:", err),
  );

  // ── Fetch clean response (no password, no private select:false fields)
  const userResponse = await UserModel.findById(user._id).select("-password");
  if (!userResponse)
    throw ApiError.internal("Failed to retrieve created user.");

  // ── Issue JWT
  const token = generateToken(userResponse._id);
  setTokenCookie(res, token);

  // ── Fire-and-forget welcome email
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

// ─────────────────────────────────────────────────────────────────────────────
// POST /auth/login
// ─────────────────────────────────────────────────────────────────────────────

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

  // ── Uncomment when email verification is enforced
  if (!user.isEmailVerified) {
    await recordLoginAttempt(clientIp);
    throw ApiError.unauthorized("Please verify your email first.");
  }

  // ── Update presence
  await UserModel.findByIdAndUpdate(user._id, {
    status: "online",
    lastSeen: new Date(),
  });

  const token = generateToken(user._id);
  setTokenCookie(res, token);

  const userResponse = await UserModel.findById(user._id).select("-password");
  if (!userResponse) throw ApiError.internal("Failed to retrieve user.");

  await clearLoginAttempts(clientIp);

  // ── Fire-and-forget login alert (non-critical)
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

// ─────────────────────────────────────────────────────────────────────────────
// GET /auth/google|github|facebook/callback  — OAuth handler
// ─────────────────────────────────────────────────────────────────────────────

export const oauthCallback = asyncHandler(
  async (req: Request, res: Response) => {
    // Populated by Passport — type comes from express.d.ts augmentation
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

    // ── Fire-and-forget login alert for OAuth sign-ins too
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

// ─────────────────────────────────────────────────────────────────────────────
// POST /auth/logout
// ─────────────────────────────────────────────────────────────────────────────

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token: string | undefined =
    req.cookies?.token ??
    (authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined);

  // Blacklist the access token for the remainder of its 7-day TTL
  if (token) {
    await blacklistToken(token, 604_800);
  }

  if (!req.user) {
    throw ApiError.unauthorized(ERROR_MESSAGES.UNAUTHORIZED);
  }

  const userId = validateObjectId(req.user._id);

  // Invalidate any stored refresh token for this user
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

// ─────────────────────────────────────────────────────────────────────────────
// GET /auth/status
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// POST /auth/refresh
// ─────────────────────────────────────────────────────────────────────────────

export const refreshToken = asyncHandler(
  async (req: Request, res: Response) => {
    const token: string | undefined =
      req.cookies?.refreshToken ?? req.body?.refreshToken;

    if (!token) {
      throw ApiError.unauthorized("Refresh token is required.");
    }

    // verifyToken throws ApiError on invalid/expired
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
      "Token refreshed successfully.",
    );
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /auth/account  — permanent account deletion
// ─────────────────────────────────────────────────────────────────────────────

export const deleteAccount = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized(ERROR_MESSAGES.UNAUTHORIZED);
    }

    const userId = validateObjectId(req.user._id);

    // Fetch before deleting — we need email + name for the confirmation email
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

      const userWithPassword =
        await UserModel.findById(userId).select("+password");
      const isValid = await comparePassword(
        password,
        userWithPassword?.password ?? "",
      );
      if (!isValid) {
        throw ApiError.unauthorized(
          "Incorrect password. Account deletion cancelled.",
        );
      }
    }

    const deletedAt = formatTime();
    const { name, email } = user;

    // ── Invalidate all active tokens
    const authHeader = req.headers.authorization;
    const token: string | undefined =
      req.cookies?.token ??
      (authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined);

    await Promise.all([
      token ? blacklistToken(token, 604_800) : Promise.resolve(),
      deleteRefreshToken(userId.toString()),
    ]);

    // ── Destroy the account
    await UserModel.findByIdAndDelete(userId);

    // ── Clear cookies
    const isProd = getEnv("NODE_ENV") === "production";
    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "strict" : "lax",
    };
    res.clearCookie("token", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);

    // ── Fire-and-forget deletion confirmation email
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
