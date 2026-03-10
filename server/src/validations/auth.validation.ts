import { z } from "zod";

// ─── Shared constants
const USERNAME_MIN = 3;
const USERNAME_MAX = 30;
const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;
const PASSWORD_MIN = 6;
const PASSWORD_MAX = 100;
const NAME_MIN = 1;
const NAME_MAX = 50;
const BIO_MAX = 500;
const CUSTOM_STATUS_MAX = 128;

// E.164 phone number format: +[country code][number], e.g. +919876543210
const PHONE_E164_REGEX = /^\+[1-9]\d{7,14}$/;

// ─── Auth schemas

export const registerSchema = z.object({
    username: z
        .string()
        .min(USERNAME_MIN, `Username must be at least ${USERNAME_MIN} characters`)
        .max(USERNAME_MAX, `Username cannot exceed ${USERNAME_MAX} characters`)
        .regex(USERNAME_REGEX, "Username can only contain letters, numbers, and underscores")
        .trim(),
    email: z
        .string()
        .email("Please provide a valid email address")
        .toLowerCase()
        .trim(),
    password: z
        .string()
        .min(PASSWORD_MIN, `Password must be at least ${PASSWORD_MIN} characters`)
        .max(PASSWORD_MAX, `Password cannot exceed ${PASSWORD_MAX} characters`),
    name: z
        .string()
        .min(NAME_MIN, "Display name is required")
        .max(NAME_MAX, `Display name cannot exceed ${NAME_MAX} characters`)
        .trim(),
    phoneNumber: z
        .string()
        .regex(PHONE_E164_REGEX, "Phone number must be in E.164 format (e.g. +919876543210)")
        .optional(),
});

export const loginSchema = z
    .object({
        email: z
            .string()
            .email("Please provide a valid email")
            .toLowerCase()
            .trim()
            .optional(),
        username: z
            .string()
            .min(USERNAME_MIN, `Username must be at least ${USERNAME_MIN} characters`)
            .max(USERNAME_MAX, `Username cannot exceed ${USERNAME_MAX} characters`)
            .trim()
            .optional(),
        password: z.string().min(1, "Password is required"),
    })
    .refine((data) => data.email || data.username, {
        message: "Either email or username is required",
        path: ["email"],
    });

// ─── Profile schemas

export const updateProfileSchema = z.object({
    name: z
        .string()
        .min(NAME_MIN, `Name must be at least ${NAME_MIN} characters`)
        .max(NAME_MAX, `Name cannot exceed ${NAME_MAX} characters`)
        .trim()
        .optional(),
    username: z
        .string()
        .min(USERNAME_MIN, `Username must be at least ${USERNAME_MIN} characters`)
        .max(USERNAME_MAX, `Username cannot exceed ${USERNAME_MAX} characters`)
        .regex(USERNAME_REGEX, "Username can only contain letters, numbers, and underscores")
        .trim()
        .optional(),
    avatar: z.string().url("Avatar must be a valid URL").optional().or(z.literal("")).nullable(),
    status: z
        .enum(["online", "offline", "away", "dnd"], {
            error: "Status must be one of: online, offline, away, dnd",
        })
        .optional(),
    customStatus: z
        .string()
        .max(CUSTOM_STATUS_MAX, `Custom status cannot exceed ${CUSTOM_STATUS_MAX} characters`)
        .optional(),
    bio: z.string().max(BIO_MAX, `Bio cannot exceed ${BIO_MAX} characters`).optional(),
});

export const updateUserProfileSchema = z.object({
    username: z
        .string()
        .min(USERNAME_MIN, `Username must be at least ${USERNAME_MIN} characters`)
        .max(USERNAME_MAX, `Username cannot exceed ${USERNAME_MAX} characters`)
        .regex(USERNAME_REGEX, "Username can only contain letters, numbers, and underscores")
        .trim()
        .optional(),
    name: z
        .string()
        .min(NAME_MIN, "Display name cannot be empty")
        .max(NAME_MAX, `Display name cannot exceed ${NAME_MAX} characters`)
        .trim()
        .optional(),
    avatar: z.string().url("Avatar must be a valid URL").optional().or(z.literal("")).nullable(),
    bio: z.string().max(BIO_MAX, `Bio cannot exceed ${BIO_MAX} characters`).optional(),
    status: z
        .enum(["online", "offline", "away", "dnd"], {
            error: "Status must be one of: online, offline, away, dnd",
        })
        .optional(),
    customStatus: z
        .string()
        .max(CUSTOM_STATUS_MAX, `Custom status cannot exceed ${CUSTOM_STATUS_MAX} characters`)
        .optional(),
});

// ─── Password schemas

export const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: z
            .string()
            .min(PASSWORD_MIN, `New password must be at least ${PASSWORD_MIN} characters`)
            .max(PASSWORD_MAX, `New password cannot exceed ${PASSWORD_MAX} characters`),
        confirmPassword: z.string().min(1, "Please confirm your new password"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export const resetPasswordRequestSchema = z.object({
    email: z
        .string()
        .email("Please provide a valid email address")
        .toLowerCase()
        .trim(),
});

export const resetPasswordSchema = z
    .object({
        token: z.string().min(1, "Reset token is required"),
        newPassword: z
            .string()
            .min(PASSWORD_MIN, `Password must be at least ${PASSWORD_MIN} characters`)
            .max(PASSWORD_MAX, `Password cannot exceed ${PASSWORD_MAX} characters`),
        confirmPassword: z.string().min(1, "Please confirm your password"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

// ─── Status schema

export const updateUserStatusSchema = z.object({
    status: z.enum(["online", "offline", "away", "dnd"], {
        error: "Status must be one of: online, offline, away, dnd",
    }),
    customStatus: z
        .string()
        .max(CUSTOM_STATUS_MAX, `Custom status cannot exceed ${CUSTOM_STATUS_MAX} characters`)
        .optional(),
});

// ─── OTP schemas

// Send email OTP — body just needs the email address
export const sendEmailOtpSchema = z.object({
    email: z
        .string()
        .email("Please provide a valid email address")
        .toLowerCase()
        .trim(),
});

export type SendEmailOtpInput = z.infer<typeof sendEmailOtpSchema>;

// Verify email OTP — email + 6-digit code
// Field is named "code" in body to match the existing verifyEmailSchema already used in auth.routes
export const verifyEmailSchema = z.object({
    email: z
        .string()
        .email("Please provide a valid email address")
        .toLowerCase()
        .trim(),
    code: z
        .string()
        .length(6, "Verification code must be exactly 6 digits")
        .regex(/^\d{6}$/, "Verification code must contain only numbers"),
});

export type VerifyEmailOtpInput = z.infer<typeof verifyEmailSchema>;

// Send phone OTP — body needs the E.164 phone number
export const sendPhoneOtpSchema = z.object({
    phoneNumber: z
        .string()
        .regex(
            PHONE_E164_REGEX,
            "Phone number must be in E.164 format (e.g. +919876543210)",
        ),
});

export type SendPhoneOtpInput = z.infer<typeof sendPhoneOtpSchema>;

// Verify phone OTP — phone + 6-digit code
export const verifyPhoneOtpSchema = z.object({
    phoneNumber: z
        .string()
        .regex(
            PHONE_E164_REGEX,
            "Phone number must be in E.164 format (e.g. +919876543210)",
        ),
    code: z
        .string()
        .length(6, "Verification code must be exactly 6 digits")
        .regex(/^\d{6}$/, "Verification code must contain only numbers"),
});

export type VerifyPhoneOtpInput = z.infer<typeof verifyPhoneOtpSchema>;