import express from "express";
import passport from "passport";
import { validateBody } from "@/middlewares/validate.middleware";
import {
  registerSchema,
  loginSchema,
  sendEmailOtpSchema,
  verifyEmailSchema,
  sendPhoneOtpSchema,
  verifyPhoneOtpSchema,
  forgotPasswordSchema,
  verifyForgotPasswordSchema,
  resetPasswordSchema,
} from "@/validations/auth.validation";
import {
  register,
  login,
  oauthCallback,
  logout,
  getAuthStatus,
  refreshToken,
  forgotPassword,
  verifyForgotPasswordOtp,
  resetPassword,
} from "@/controllers/auth.controller";
import { authenticated, optionalAuth } from "@/middlewares/auth.middleware";
import {
  registerRateLimit,
  loginRateLimit,
  emailVerificationRateLimit,
  phoneOtpRateLimit,
} from "@/middlewares/rateLimit.middleware";
import {
  sendEmailOtp,
  verifyEmailOtp,
  sendPhoneOtp,
  verifyPhoneOtp,
} from "@/controllers/otp.controller";

const authRouter = express.Router();

//  Register new user with email/password
authRouter.post(
  "/register",
  registerRateLimit,
  validateBody(registerSchema),
  register,
);

//  Login user with email/password
authRouter.post("/login", loginRateLimit, validateBody(loginSchema), login);

//  Refresh access token using refresh token
authRouter.post("/refresh", refreshToken);

// GOOGLE OAUTH
authRouter.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

authRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login?error=oauth_failed",
  }),
  oauthCallback,
);

// GITHUB OAUTH
authRouter.get(
  "/github",
  passport.authenticate("github", {
    scope: ["user:email"],
    session: false,
  }),
);

authRouter.get(
  "/github/callback",
  passport.authenticate("github", {
    session: false,
    failureRedirect: "/login?error=oauth_failed",
  }),
  oauthCallback,
);

// FACEBOOK OAUTH
authRouter.get(
  "/facebook",
  passport.authenticate("facebook", {
    scope: ["email"],
    session: false,
  }),
);

authRouter.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    session: false,
    failureRedirect: "/login?error=oauth_failed",
  }),
  oauthCallback,
);

// AUTH STATUS & LOGOUT
authRouter.get("/status", optionalAuth, getAuthStatus);
authRouter.post("/logout", authenticated, logout);

//  OTP Verification

// Email OTP - send
authRouter.post(
  "/send-email-otp",
  emailVerificationRateLimit,
  validateBody(sendEmailOtpSchema),
  sendEmailOtp,
);

// Email OTP - verify
authRouter.post(
  "/verify-email-otp",
  emailVerificationRateLimit,
  validateBody(verifyEmailSchema),
  verifyEmailOtp,
);

// Phone OTP - send
authRouter.post(
  "/send-phone-otp",
  phoneOtpRateLimit,
  validateBody(sendPhoneOtpSchema),
  sendPhoneOtp,
);

// Phone OTP - verify
authRouter.post(
  "/verify-phone-otp",
  phoneOtpRateLimit,
  validateBody(verifyPhoneOtpSchema),
  verifyPhoneOtp,
);

// Forgot Password - request reset (OTP sent to email)
authRouter.post(
  "/forgot-password",
  emailVerificationRateLimit,
  validateBody(forgotPasswordSchema),
  forgotPassword,
);

// Forgot Password - verify OTP
authRouter.post(
  "/verify-forgot-password",
  emailVerificationRateLimit,
  validateBody(verifyForgotPasswordSchema),
  verifyForgotPasswordOtp,
);

// Forgot Password - reset with new password
authRouter.post(
  "/reset-password",
  emailVerificationRateLimit,
  validateBody(resetPasswordSchema),
  resetPassword,
);

export { authRouter };
