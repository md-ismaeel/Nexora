import crypto from "crypto";
import bcrypt from "bcrypt";
import { pubClient } from "@/config/redis.config";

// CONFIG
const EMAIL_OTP_TTL = 600; // 10 minutes
const PHONE_OTP_TTL = 600;

const OTP_COOLDOWN = 60; // resend after 60 sec
const OTP_MAX_ATTEMPTS = 5;

const REFRESH_TOKEN_TTL = 2_592_000; // 30 days

// HELPERS
const hashOtp = (otp: string) =>
    crypto.createHash("sha256").update(otp).digest("hex");

export const generateOtp = (): string =>
    crypto.randomInt(100000, 999999).toString();

// TOKEN BLACKLIST
export const blacklistToken = async (token: string, expiresIn: number): Promise<void> => {
    await pubClient.setex(`blacklist:${token}`, expiresIn, "1");
};

export const isTokenBlacklisted = async (token: string): Promise<boolean> => {
    const result = await pubClient.get(`blacklist:${token}`);
    return result === "1";
};

//  EMAIL OTP
export const storeEmailOtp = async (email: string, otp: string) => {
    const cooldownKey = `otp:email:cooldown:${email}`;

    const cooldown = await pubClient.get(cooldownKey);
    if (cooldown) {
        throw new Error("OTP recently sent. Please wait before requesting again.");
    }

    const key = `otp:email:verify:${email}`;
    const attemptsKey = `otp:email:attempts:${email}`;

    const hashed = hashOtp(otp);

    await pubClient.setex(key, EMAIL_OTP_TTL, hashed);
    await pubClient.setex(cooldownKey, OTP_COOLDOWN, "1");
    await pubClient.del(attemptsKey);
};

export const verifyEmailOtp = async (email: string, candidate: string): Promise<"ok" | "invalid" | "expired" | "locked"> => {
    const key = `otp:email:verify:${email}`;
    const attemptsKey = `otp:email:attempts:${email}`;

    const attempts = parseInt((await pubClient.get(attemptsKey)) ?? "0");

    if (attempts >= OTP_MAX_ATTEMPTS) {
        return "locked";
    }

    const stored = await pubClient.get(key);

    if (!stored) {
        return "expired";
    }

    const hashedCandidate = hashOtp(candidate);

    if (hashedCandidate !== stored) {
        const ttl = await pubClient.ttl(key);

        if (ttl > 0) {
            await pubClient.setex(attemptsKey, ttl, String(attempts + 1));
        }

        return "invalid";
    }

    await pubClient.del(key);
    await pubClient.del(attemptsKey);

    return "ok";
};

//  PHONE OTP
export const storePhoneOtp = async (phone: string, otp: string) => {
    const cooldownKey = `otp:phone:cooldown:${phone}`;

    const cooldown = await pubClient.get(cooldownKey);
    if (cooldown) {
        throw new Error("OTP recently sent. Please wait before requesting again.");
    }

    const key = `otp:phone:verify:${phone}`;
    const attemptsKey = `otp:phone:attempts:${phone}`;

    const hashed = hashOtp(otp);

    await pubClient.setex(key, PHONE_OTP_TTL, hashed);
    await pubClient.setex(cooldownKey, OTP_COOLDOWN, "1");
    await pubClient.del(attemptsKey);
};

export const verifyPhoneOtp = async (phone: string, candidate: string): Promise<"ok" | "invalid" | "expired" | "locked"> => {
    const key = `otp:phone:verify:${phone}`;
    const attemptsKey = `otp:phone:attempts:${phone}`;

    const attempts = parseInt((await pubClient.get(attemptsKey)) ?? "0");

    if (attempts >= OTP_MAX_ATTEMPTS) {
        return "locked";
    }

    const stored = await pubClient.get(key);

    if (!stored) {
        return "expired";
    }

    const hashedCandidate = hashOtp(candidate);

    if (hashedCandidate !== stored) {
        const ttl = await pubClient.ttl(key);

        if (ttl > 0) {
            await pubClient.setex(attemptsKey, ttl, String(attempts + 1));
        }

        return "invalid";
    }

    await pubClient.del(key);
    await pubClient.del(attemptsKey);

    return "ok";
};

//  REFRESH TOKEN STORAGE
export const storeRefreshToken = async (userId: string, token: string): Promise<void> => {
    const hashed = await bcrypt.hash(token, 10);

    await pubClient.setex(`refresh:${userId}`, REFRESH_TOKEN_TTL, hashed);
};

export const getRefreshToken = async (userId: string): Promise<string | null> => {
    return pubClient.get(`refresh:${userId}`);
};

export const deleteRefreshToken = async (userId: string): Promise<void> => {
    await pubClient.del(`refresh:${userId}`);
};