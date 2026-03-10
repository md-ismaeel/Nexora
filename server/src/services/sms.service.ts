import twilio, { type Twilio } from "twilio";
import { getEnv } from "@/config/env.config";
import { ApiError } from "@/utils/ApiError";

// ─── Singleton Twilio client
// Initialised once on first use. Twilio client is stateless and safe to reuse.
let client: Twilio | null = null;

const getClient = (): Twilio => {
    if (client) return client;

    const accountSid = getEnv("TWILIO_ACCOUNT_SID");
    const authToken = getEnv("TWILIO_AUTH_TOKEN");

    if (!accountSid || !authToken) {
        throw ApiError.internal(
            "SMS service is not configured. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN.",
        );
    }

    client = twilio(accountSid, authToken);
    return client;
};

// ─── Generic SMS send

/**
 * Low-level SMS sender.
 * Prefer the higher-level helper (sendOtpSms) over calling this directly.
 * @returns Twilio message SID for logging / auditing
 */
export const sendSms = async (to: string, body: string): Promise<string> => {
    const from = getEnv("TWILIO_PHONE_NUMBER");

    if (!from) {
        throw ApiError.internal("SMS service is not configured. Set TWILIO_PHONE_NUMBER.");
    }

    try {
        const message = await getClient().messages.create({ to, from, body });
        return message.sid;
    } catch (err) {
        console.error("SMS send failed:", err);
        throw ApiError.internal("Failed to send SMS. Please try again later.");
    }
};

// ─── OTP SMS

/**
 * Send a 6-digit OTP via SMS to the given phone number.
 * Expects E.164 format: +[country][number], e.g. +919876543210.
 * Called by otp.controller → sendPhoneOtp.
 */
export const sendOtpSms = async (to: string, otp: string): Promise<void> => {
    const appName = getEnv("APP_NAME", "App");

    await sendSms(
        to,
        `[${appName}] Your verification code is: ${otp}\n\nExpires in 10 minutes. Never share this code with anyone.`,
    );
};