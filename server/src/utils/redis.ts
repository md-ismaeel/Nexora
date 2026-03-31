import crypto from "crypto";
import bcrypt from "bcrypt";
import { pubClient } from "@/config/redis.config";
import { ApiError } from "@/utils/ApiError";

// ─── Config
const EMAIL_OTP_TTL = 600;    // 10 minutes
const PHONE_OTP_TTL = 600;    // 10 minutes
const OTP_COOLDOWN = 60;      // 1 minute between resends
const OTP_MAX_ATTEMPTS = 5;   // lock after 5 wrong guesses
const REFRESH_TOKEN_TTL = 2_592_000; // 30 days

// ─── OTP result type — returned by verifyEmailOtp / verifyPhoneOtp
// Controllers switch on this rather than catching exceptions from the Redis util
export type OtpVerifyResult = "ok" | "invalid" | "expired" | "locked";

// ─── Internal helpers

/**
 * One-way SHA-256 hash of the raw OTP.
 * We never store plaintext OTPs in Redis — only the hash.
 * Even if Redis is compromised, raw codes cannot be recovered.
 */
const hashOtp = (otp: string): string =>
    crypto.createHash("sha256").update(otp).digest("hex");

// ─── Generation

/** Generates a cryptographically random 6-digit OTP (no Math.random bias). */
export const generateOtp = (): string =>
    crypto.randomInt(100_000, 999_999).toString();

// ─── Token Blacklist

export const blacklistToken = async (
    token: string,
    expiresIn: number,
): Promise<void> => {
    await pubClient.setex(`blacklist:${token}`, expiresIn, "1");
};

export const isTokenBlacklisted = async (token: string): Promise<boolean> => {
    const result = await pubClient.get(`blacklist:${token}`);
    return result === "1";
};

// ─── Email OTP

/**
 * Store a hashed email OTP in Redis and set a resend cooldown.
 * Resets the attempt counter so a fresh OTP always starts at 0 tries.
 * Throws a plain Error (not ApiError) if the cooldown is still active —
 * the controller wraps this into the appropriate ApiError.
 */
export const storeEmailOtp = async (
    email: string,
    otp: string,
): Promise<void> => {
    const cooldownKey = `otp:email:cooldown:${email}`;
    const cooldown = await pubClient.get(cooldownKey);

    if (cooldown) {
        const ttl = await pubClient.ttl(cooldownKey);
        throw new Error(
            `OTP recently sent. Please wait ${ttl} second${ttl === 1 ? "" : "s"} before requesting again.`,
        );
    }

    const key = `otp:email:verify:${email}`;
    const attemptsKey = `otp:email:attempts:${email}`;
    const hashed = hashOtp(otp);

    // Atomic pipeline — avoids partial state if one command fails
    await pubClient
        .multi()
        .setex(key, EMAIL_OTP_TTL, hashed)
        .setex(cooldownKey, OTP_COOLDOWN, "1")
        .del(attemptsKey)
        .exec();
};

/**
 * Verify a submitted email OTP against the stored hash.
 * Returns a discriminated result string — the controller decides the HTTP response.
 *
 *   "ok"      — OTP matched; all Redis keys cleaned up
 *   "invalid" — Wrong code; attempt counter incremented
 *   "expired" — Key no longer in Redis (TTL elapsed or already consumed)
 *   "locked"  — Max attempts reached; OTP invalidated
 */
export const verifyEmailOtp = async (
    email: string,
    candidate: string,
): Promise<OtpVerifyResult> => {
    const key = `otp:email:verify:${email}`;
    const attemptsKey = `otp:email:attempts:${email}`;

    const attempts = parseInt((await pubClient.get(attemptsKey)) ?? "0", 10);

    // Check lockout BEFORE reading the stored hash (avoids timing oracle)
    if (attempts >= OTP_MAX_ATTEMPTS) {
        await pubClient.del(key, attemptsKey);
        return "locked";
    }

    const stored = await pubClient.get(key);
    if (!stored) return "expired";

    const hashedCandidate = hashOtp(candidate);

    if (hashedCandidate !== stored) {
        const ttl = await pubClient.ttl(key);
        // Keep attempt counter TTL in sync with OTP so both expire together
        if (ttl > 0) {
            await pubClient.setex(attemptsKey, ttl, String(attempts + 1));
        }
        // Auto-lock + purge on the final failed attempt
        if (attempts + 1 >= OTP_MAX_ATTEMPTS) {
            await pubClient.del(key, attemptsKey);
        }
        return "invalid";
    }

    // ✅ Correct OTP — clean up all associated keys
    await pubClient.del(key, attemptsKey, `otp:email:cooldown:${email}`);
    return "ok";
};

// ─── Phone OTP

/**
 * Store a hashed phone OTP in Redis and set a resend cooldown.
 * Throws a plain Error if the cooldown is still active.
 */
export const storePhoneOtp = async (
    phone: string,
    otp: string,
): Promise<void> => {
    const cooldownKey = `otp:phone:cooldown:${phone}`;
    const cooldown = await pubClient.get(cooldownKey);

    if (cooldown) {
        const ttl = await pubClient.ttl(cooldownKey);
        throw new Error(
            `OTP recently sent. Please wait ${ttl} second${ttl === 1 ? "" : "s"} before requesting again.`,
        );
    }

    const key = `otp:phone:verify:${phone}`;
    const attemptsKey = `otp:phone:attempts:${phone}`;
    const hashed = hashOtp(otp);

    await pubClient
        .multi()
        .setex(key, PHONE_OTP_TTL, hashed)
        .setex(cooldownKey, OTP_COOLDOWN, "1")
        .del(attemptsKey)
        .exec();
};

/**
 * Verify a submitted phone OTP against the stored hash.
 * Same discriminated result type as verifyEmailOtp.
 */
export const verifyPhoneOtp = async (
    phone: string,
    candidate: string,
): Promise<OtpVerifyResult> => {
    const key = `otp:phone:verify:${phone}`;
    const attemptsKey = `otp:phone:attempts:${phone}`;

    const attempts = parseInt((await pubClient.get(attemptsKey)) ?? "0", 10);

    if (attempts >= OTP_MAX_ATTEMPTS) {
        await pubClient.del(key, attemptsKey);
        return "locked";
    }

    const stored = await pubClient.get(key);
    if (!stored) return "expired";

    const hashedCandidate = hashOtp(candidate);

    if (hashedCandidate !== stored) {
        const ttl = await pubClient.ttl(key);
        if (ttl > 0) {
            await pubClient.setex(attemptsKey, ttl, String(attempts + 1));
        }
        if (attempts + 1 >= OTP_MAX_ATTEMPTS) {
            await pubClient.del(key, attemptsKey);
        }
        return "invalid";
    }

    await pubClient.del(key, attemptsKey, `otp:phone:cooldown:${phone}`);
    return "ok";
};

// ─── Refresh Token Storage
// Stored as a bcrypt hash so a Redis breach can't reuse raw refresh tokens.

export const storeRefreshToken = async (
    userId: string,
    token: string,
): Promise<void> => {
    const hashed = await bcrypt.hash(token, 10);
    await pubClient.setex(`refresh:${userId}`, REFRESH_TOKEN_TTL, hashed);
};

export const getRefreshToken = async (
    userId: string,
): Promise<string | null> => {
    return pubClient.get(`refresh:${userId}`);
};

export const deleteRefreshToken = async (userId: string): Promise<void> => {
    await pubClient.del(`refresh:${userId}`);
};

// ─── Forgot Password OTP (separate namespace to allow different flow than email verification)

// Store a hashed forgot-password OTP in Redis.
// Uses a separate namespace: otp:forgot:verify:email
export const storeForgotPasswordOtp = async (
    email: string,
    otp: string,
): Promise<void> => {
    const cooldownKey = `otp:forgot:cooldown:${email}`;
    const cooldown = await pubClient.get(cooldownKey);

    if (cooldown) {
        const ttl = await pubClient.ttl(cooldownKey);
        throw new Error(
            `OTP recently sent. Please wait ${ttl} second${ttl === 1 ? "" : "s"} before requesting again.`,
        );
    }

    const key = `otp:forgot:verify:${email}`;
    const attemptsKey = `otp:forgot:attempts:${email}`;
    const hashed = hashOtp(otp);

    await pubClient
        .multi()
        .setex(key, EMAIL_OTP_TTL, hashed)
        .setex(cooldownKey, OTP_COOLDOWN, "1")
        .del(attemptsKey)
        .exec();
};

// Verify a submitted forgot-password OTP against the stored hash.
// Uses same result type as verifyEmailOtp.
export const verifyForgotPasswordOtp = async (
    email: string,
    candidate: string,
): Promise<OtpVerifyResult> => {
    const key = `otp:forgot:verify:${email}`;
    const attemptsKey = `otp:forgot:attempts:${email}`;

    const attempts = parseInt((await pubClient.get(attemptsKey)) ?? "0", 10);

    if (attempts >= OTP_MAX_ATTEMPTS) {
        await pubClient.del(key, attemptsKey);
        return "locked";
    }

    const stored = await pubClient.get(key);
    if (!stored) return "expired";

    const hashedCandidate = hashOtp(candidate);

    if (hashedCandidate !== stored) {
        const ttl = await pubClient.ttl(key);
        if (ttl > 0) {
            await pubClient.setex(attemptsKey, ttl, String(attempts + 1));
        }
        if (attempts + 1 >= OTP_MAX_ATTEMPTS) {
            await pubClient.del(key, attemptsKey);
        }
        return "invalid";
    }

    await pubClient.del(key, attemptsKey, `otp:forgot:cooldown:${email}`);
    return "ok";
};

// Issue (generate + store + send) a forgot password OTP.
// Returns the OTP (for dev logging).
export const issueForgotPasswordOtp = async (email: string): Promise<string> => {
    const otp = generateOtp();

    try {
        await storeForgotPasswordOtp(email, otp);
    } catch (err) {
        if (err instanceof Error && !(err instanceof ApiError)) {
            throw ApiError.tooManyRequests(err.message);
        }
        throw err;
    }

    return otp;
};