import type { Request, Response } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { sendSuccess } from "@/utils/response";
import { ApiError } from "@/utils/ApiError";
import { ERROR_MESSAGES } from "@/constants/errorMessages";
import { SUCCESS_MESSAGES } from "@/constants/successMessages";
import { UserModel } from "@/models/user.model";
import {
    generateOtp,
    storeEmailOtp,
    verifyEmailOtp as verifyEmailOtpInRedis,
    storePhoneOtp,
    verifyPhoneOtp as verifyPhoneOtpInRedis,
    type OtpVerifyResult,
} from "@/utils/redis";
import { sendOtpEmail } from "@/services/email.service";
import { sendOtpSms } from "@/services/sms.service";

// ─── Internal helper
// Generates, stores, and delivers an email OTP in one step.
// Extracted so auth.controller.register() can reuse it without an extra HTTP round-trip.
export const issueEmailOtp = async (email: string): Promise<void> => {
    const otp = generateOtp();

    // storeEmailOtp throws a plain Error if the cooldown is still active —
    // auth.controller wraps this appropriately.
    await storeEmailOtp(email, otp);

    try {
        await sendOtpEmail(email, otp);
    } catch (err) {
        console.error("Email OTP delivery failed:", err);
        throw ApiError.internal(ERROR_MESSAGES.EMAIL_SEND_FAILED);
    }

    // Log OTP to console in development so you can test without a real SMTP server
    if (process.env.NODE_ENV === "development") {
        console.log(`[DEV] Email OTP for ${email}: ${otp}`);
    }
};

// ─── Map OtpVerifyResult → ApiError
// Single place that defines what each Redis result means in HTTP terms.
const handleOtpResult = (result: OtpVerifyResult): void => {
    switch (result) {
        case "ok":
            return; // success — caller continues
        case "expired":
            throw ApiError.badRequest(ERROR_MESSAGES.OTP_EXPIRED);
        case "invalid":
            throw ApiError.badRequest(ERROR_MESSAGES.OTP_INVALID);
        case "locked":
            throw ApiError.tooManyRequests(ERROR_MESSAGES.OTP_LOCKED);
    }
};

// ─── POST /auth/send-email-otp
// Resend / initial send of an email verification OTP.
// Requires authentication — the user must be logged in (verified they own the email via register).
export const sendEmailOtp = asyncHandler(
    async (req: Request, res: Response) => {
        const { email } = req.body as { email: string };

        const user = await UserModel.findOne({ email });
        if (!user) {
            throw ApiError.notFound(ERROR_MESSAGES.USER_NOT_FOUND);
        }

        if (user.isEmailVerified) {
            throw ApiError.conflict(ERROR_MESSAGES.OTP_ALREADY_VERIFIED);
        }

        try {
            await issueEmailOtp(email);
        } catch (err) {
            // Rethrow cooldown errors from storeEmailOtp as 429
            if (err instanceof Error && !(err instanceof ApiError)) {
                throw ApiError.tooManyRequests(err.message);
            }
            throw err;
        }

        return sendSuccess(res, null, SUCCESS_MESSAGES.OTP_EMAIL_SENT);
    },
);

// ─── POST /auth/verify-email-otp
// Verify a 6-digit OTP previously sent to an email address.
// On success: marks user.isEmailVerified = true.
export const verifyEmailOtp = asyncHandler(
    async (req: Request, res: Response) => {
        const { email, code } = req.body as { email: string; code: string };

        const user = await UserModel.findOne({ email });
        if (!user) {
            throw ApiError.notFound(ERROR_MESSAGES.USER_NOT_FOUND);
        }

        if (user.isEmailVerified) {
            throw ApiError.conflict(ERROR_MESSAGES.OTP_ALREADY_VERIFIED);
        }

        const result = await verifyEmailOtpInRedis(email, code);
        handleOtpResult(result); // throws on non-"ok" result

        await UserModel.findByIdAndUpdate(user._id, { isEmailVerified: true });

        return sendSuccess(res, null, SUCCESS_MESSAGES.EMAIL_VERIFIED);
    },
);

// ─── POST /auth/send-phone-otp
// Sends a 6-digit OTP via SMS to the user's registered phone number.
// Requires authentication — phone is looked up from the logged-in user's record.
export const sendPhoneOtp = asyncHandler(
    async (req: Request, res: Response) => {
        const { phoneNumber } = req.body as { phoneNumber: string };

        const user = await UserModel.findOne({ phoneNumber });
        if (!user) {
            throw ApiError.notFound(ERROR_MESSAGES.USER_NOT_FOUND);
        }

        if (user.isPhoneVerified) {
            throw ApiError.conflict(ERROR_MESSAGES.OTP_ALREADY_VERIFIED);
        }

        const otp = generateOtp();

        try {
            await storePhoneOtp(phoneNumber, otp);
        } catch (err) {
            // storePhoneOtp throws a plain Error on cooldown
            if (err instanceof Error && !(err instanceof ApiError)) {
                throw ApiError.tooManyRequests(err.message);
            }
            throw err;
        }

        try {
            await sendOtpSms(phoneNumber, otp);
        } catch (err) {
            console.error("Phone OTP delivery failed:", err);
            throw ApiError.internal(ERROR_MESSAGES.SMS_SEND_FAILED);
        }

        if (process.env.NODE_ENV === "development") {
            console.log(`[DEV] Phone OTP for ${phoneNumber}: ${otp}`);
        }

        return sendSuccess(res, null, SUCCESS_MESSAGES.OTP_PHONE_SENT);
    },
);

// ─── POST /auth/verify-phone-otp
// Verify a 6-digit OTP previously sent via SMS.
// On success: marks user.isPhoneVerified = true.
export const verifyPhoneOtp = asyncHandler(
    async (req: Request, res: Response) => {
        const { phoneNumber, code } = req.body as {
            phoneNumber: string;
            code: string;
        };

        const user = await UserModel.findOne({ phoneNumber });
        if (!user) {
            throw ApiError.notFound(ERROR_MESSAGES.USER_NOT_FOUND);
        }

        if (user.isPhoneVerified) {
            throw ApiError.conflict(ERROR_MESSAGES.OTP_ALREADY_VERIFIED);
        }

        const result = await verifyPhoneOtpInRedis(phoneNumber, code);
        handleOtpResult(result);

        await UserModel.findByIdAndUpdate(user._id, { isPhoneVerified: true });

        return sendSuccess(res, null, SUCCESS_MESSAGES.PHONE_VERIFIED);
    },
);