import twilio, { type Twilio } from "twilio";
import { getEnv } from "@/config/env.config";
import { ApiError } from "@/utils/ApiError";

// Singleton client
let client: Twilio | null = null;

const getClient = (): Twilio => {
    if (client) return client;

    const accountSid = getEnv("TWILIO_ACCOUNT_SID");
    const authToken = getEnv("TWILIO_AUTH_TOKEN");

    if (!accountSid || !authToken) {
        throw ApiError.internal(
            "Twilio credentials are not configured. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN."
        );
    }

    client = twilio(accountSid, authToken);
    return client;
};

// Generic SMS sender
export const sendSms = async (to: string, body: string) => {
    const from = getEnv("TWILIO_PHONE_NUMBER");

    if (!from) {
        throw ApiError.internal("TWILIO_PHONE_NUMBER is not configured.");
    }

    try {
        const message = await getClient().messages.create({
            to,
            from,
            body,
        });

        return message.sid;
    } catch (error) {
        console.error("SMS sending failed:", error);
        throw ApiError.internal("Failed to send SMS");
    }
};

// OTP SMS sender
export const sendOtpSms = async (to: string, otp: string): Promise<void> => {
    const body = `Your Discord App verification code is: ${otp}. It expires in 10 minutes. Do not share this code.`;

    await sendSms(to, body);
};
