import { Request, Response } from "express";
import { generateOtp, storeEmailOtp, verifyEmailOtp as verifyEmailOtpInRedis, storePhoneOtp, verifyPhoneOtp as verifyPhoneOtpInRedis } from "@/utils/redis";
import { sendOtpEmail } from "@/services/email.service";
import { sendOtpSms } from "@/services/sms.service";
import { asyncHandler } from "@/utils/asyncHandler";
import { sendSuccess } from "@/utils/response";
import { ApiError } from "@/utils/ApiError";
import { ERROR_MESSAGES } from "@/constants/errorMessages";
import { SUCCESS_MESSAGES } from "@/constants/successMessages";
import { UserModel } from "@/models/user.model";


// COMMON EMAIL OTP GENERATOR
export const issueEmailOtp = async (email: string) => {
    const otp = generateOtp();

    await storeEmailOtp(email, otp);

    try {
        await sendOtpEmail(email, otp);
    } catch (error) {
        console.error("Email OTP send failed:", error);
        throw ApiError.internal(ERROR_MESSAGES.EMAIL_SEND_FAILED);
    }
};


//   SEND EMAIL OTP
export const sendEmailOtp = asyncHandler(async (req: Request, res: Response) => {

    const { email } = req.body as { email: string };

    const user = await UserModel.findOne({ email });

    if (!user) {
        throw ApiError.notFound(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    if (user.isEmailVerified) {
        throw ApiError.conflict(ERROR_MESSAGES.OTP_ALREADY_VERIFIED);
    }

    await issueEmailOtp(email);

    return sendSuccess(res, null, SUCCESS_MESSAGES.OTP_EMAIL_SENT);
});


//   VERIFY EMAIL OTP
export const verifyEmailOtp = asyncHandler(async (req: Request, res: Response) => {

    const { email, code } = req.body as {
        email: string;
        code: string;
    };

    const user = await UserModel.findOne({ email });

    if (!user) {
        throw ApiError.notFound(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    if (user.isEmailVerified) {
        throw ApiError.conflict(ERROR_MESSAGES.OTP_ALREADY_VERIFIED);
    }

    const result = await verifyEmailOtpInRedis(email, code);

    if (result === "expired") {
        throw ApiError.badRequest(ERROR_MESSAGES.OTP_EXPIRED);
    }

    if (result === "invalid") {
        throw ApiError.badRequest(ERROR_MESSAGES.OTP_INVALID);
    }

    if (result === "locked") {
        throw ApiError.tooManyRequests(ERROR_MESSAGES.OTP_LOCKED);
    }

    await UserModel.findByIdAndUpdate(user._id, {
        isEmailVerified: true,
    });

    return sendSuccess(res, null, SUCCESS_MESSAGES.EMAIL_VERIFIED);
});


//   SEND PHONE OTP
export const sendPhoneOtp = asyncHandler(async (req: Request, res: Response) => {

    const { phoneNumber } = req.body as { phoneNumber: string };

    const user = await UserModel.findOne({ phoneNumber });

    if (!user) {
        throw ApiError.notFound(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    if (user.isPhoneVerified) {
        throw ApiError.conflict(ERROR_MESSAGES.OTP_ALREADY_VERIFIED);
    }

    const otp = generateOtp();

    await storePhoneOtp(phoneNumber, otp);

    try {
        await sendOtpSms(phoneNumber, otp);
    } catch (error) {
        console.error("SMS OTP send failed:", error);
        throw ApiError.internal(ERROR_MESSAGES.SMS_SEND_FAILED);
    }

    return sendSuccess(res, null, SUCCESS_MESSAGES.OTP_PHONE_SENT);
});


//   VERIFY PHONE OTP
export const verifyPhoneOtp = asyncHandler(async (req: Request, res: Response) => {

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

    if (result === "expired") {
        throw ApiError.badRequest(ERROR_MESSAGES.OTP_EXPIRED);
    }

    if (result === "invalid") {
        throw ApiError.badRequest(ERROR_MESSAGES.OTP_INVALID);
    }

    if (result === "locked") {
        throw ApiError.tooManyRequests(ERROR_MESSAGES.OTP_LOCKED);
    }

    await UserModel.findByIdAndUpdate(user._id, {
        isPhoneVerified: true,
    });

    return sendSuccess(res, null, SUCCESS_MESSAGES.PHONE_VERIFIED);
});