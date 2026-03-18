import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, CheckCircle2, Circle } from "lucide-react";
import { useRegisterMutation } from "@/api/auth.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// ── Validation ────────────────────────────────────────────────────────────────

const schema = z
    .object({
        name: z
            .string()
            .min(2, "Must be at least 2 characters")
            .max(32, "Must be 32 characters or less"),
        email: z.string().email("Enter a valid email address"),
        username: z
            .string()
            .min(3, "Must be at least 3 characters")
            .max(32, "Must be 32 characters or less")
            .regex(/^[a-z0-9_.]+$/, "Only lowercase letters, numbers, _ and . allowed")
            .optional()
            .or(z.literal("")),
        phoneNumber: z
            .string()
            .regex(/^\+[1-9]\d{7,14}$/, "Must be in format +919999999999")
            .optional()
            .or(z.literal("")),
        password: z
            .string()
            .min(8, "Must be at least 8 characters")
            .regex(/[A-Z]/, "Must contain at least one uppercase letter")
            .regex(/[0-9]/, "Must contain at least one number"),
        confirmPassword: z.string().min(1, "Please confirm your password"),
    })
    .refine((d) => d.password === d.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

type FormValues = z.infer<typeof schema>;

// ── Password strength ─────────────────────────────────────────────────────────

interface StrengthRule {
    label: string;
    test: (v: string) => boolean;
}

const RULES: StrengthRule[] = [
    { label: "At least 8 characters", test: (v) => v.length >= 8 },
    { label: "One uppercase letter", test: (v) => /[A-Z]/.test(v) },
    { label: "One number", test: (v) => /[0-9]/.test(v) },
    { label: "One special character (optional)", test: (v) => /[^a-zA-Z0-9]/.test(v) },
];

function PasswordStrength({ value }: { value: string }) {
    if (!value) return null;
    const passed = RULES.filter((r) => r.test(value)).length;
    const colors = ["bg-[#ed4245]", "bg-orange-400", "bg-yellow-400", "bg-green-400"];
    const color = colors[Math.max(0, passed - 1)];

    return (
        <div className="mt-2 space-y-1.5">
            {/* Bar */}
            <div className="flex gap-1">
                {RULES.map((_, i) => (
                    <div
                        key={i}
                        className={cn(
                            "h-1 flex-1 rounded-full transition-all duration-300",
                            i < passed ? color : "bg-[#3f4147]",
                        )}
                    />
                ))}
            </div>
            {/* Rules */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                {RULES.map((rule) => {
                    const ok = rule.test(value);
                    return (
                        <span
                            key={rule.label}
                            className={cn(
                                "flex items-center gap-1 text-[11px] transition-colors",
                                ok ? "text-green-400" : "text-[#4e5058]",
                            )}
                        >
                            {ok
                                ? <CheckCircle2 className="h-3 w-3 shrink-0" />
                                : <Circle className="h-3 w-3 shrink-0" />}
                            {rule.label}
                        </span>
                    );
                })}
            </div>
        </div>
    );
}

// ── Field wrapper ─────────────────────────────────────────────────────────────

interface FieldProps {
    label: string;
    required?: boolean;
    error?: string;
    hint?: string;
    children: React.ReactNode;
}

function Field({ label, required, error, hint, children }: FieldProps) {
    return (
        <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-bold uppercase tracking-wide text-[#b5bac1]">
                {label}
                {required && <span className="ml-1 text-[#ed4245]">*</span>}
                {!required && (
                    <span className="ml-1 text-[11px] normal-case font-normal text-[#4e5058]">
                        (optional)
                    </span>
                )}
            </Label>
            {children}
            {hint && !error && <p className="text-[11px] text-[#4e5058]">{hint}</p>}
            {error && <p className="text-xs text-[#ed4245]">{error}</p>}
        </div>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function RegisterPage() {
    const navigate = useNavigate();
    const [showPw, setShowPw] = useState(false);
    const [showCPw, setShowCPw] = useState(false);
    const [register, { isLoading, error }] = useRegisterMutation();

    const {
        register: field,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<FormValues>({ resolver: zodResolver(schema) });

    const passwordValue = watch("password") ?? "";

    const onSubmit = async (values: FormValues) => {
        try {
            await register({
                name: values.name,
                email: values.email,
                password: values.password,
                username: values.username || undefined,
                phoneNumber: values.phoneNumber || undefined,
            }).unwrap();
            navigate("/verify-email", { state: { email: values.email } });
        } catch (error) {
            console.log("error", error);

        }
    };

    const apiError = (error as unknown as { data?: { message?: string } })?.data?.message;

    return (
        <div className="w-full rounded-lg bg-[#313338] shadow-2xl">

            {/* Scrollable content */}
            <div className="max-h-[calc(100vh-64px)] overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-[#1e1f22]">

                {/* Heading */}
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-bold text-white">Create an account</h1>
                    <p className="mt-1 text-sm text-[#b5bac1]">
                        Join the community today — it's free!
                    </p>
                </div>

                {/* API error */}
                {apiError && (
                    <div className="mb-4 rounded-md border border-[#ed4245]/20 bg-[#ed4245]/10 px-3 py-2.5 text-sm text-[#ed4245]">
                        {apiError}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

                    {/* Display name */}
                    <Field label="Display Name" required error={errors.name?.message}>
                        <Input
                            {...field("name")}
                            autoFocus
                            placeholder="John Doe"
                            className={cn(
                                "bg-[#1e1f22] border-none text-white placeholder:text-[#4e5058] focus-visible:ring-[#5865f2] focus-visible:ring-2",
                                errors.name && "ring-2 ring-[#ed4245]",
                            )}
                        />
                    </Field>

                    {/* Email */}
                    <Field label="Email" required error={errors.email?.message}>
                        <Input
                            {...field("email")}
                            type="email"
                            autoComplete="email"
                            placeholder="you@example.com"
                            className={cn(
                                "bg-[#1e1f22] border-none text-white placeholder:text-[#4e5058] focus-visible:ring-[#5865f2] focus-visible:ring-2",
                                errors.email && "ring-2 ring-[#ed4245]",
                            )}
                        />
                    </Field>

                    {/* Username */}
                    <Field
                        label="Username"
                        error={errors.username?.message}
                        hint="Lowercase letters, numbers, underscores and dots only"
                    >
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#4e5058]">
                                @
                            </span>
                            <Input
                                {...field("username")}
                                placeholder="john_doe"
                                className={cn(
                                    "bg-[#1e1f22] border-none pl-7 text-white placeholder:text-[#4e5058] focus-visible:ring-[#5865f2] focus-visible:ring-2",
                                    errors.username && "ring-2 ring-[#ed4245]",
                                )}
                            />
                        </div>
                    </Field>

                    {/* Phone number */}
                    <Field
                        label="Phone Number"
                        error={errors.phoneNumber?.message}
                        hint="Include country code, e.g. +919999999999"
                    >
                        <Input
                            {...field("phoneNumber")}
                            type="tel"
                            placeholder="+919999999999"
                            className={cn(
                                "bg-[#1e1f22] border-none text-white placeholder:text-[#4e5058] focus-visible:ring-[#5865f2] focus-visible:ring-2",
                                errors.phoneNumber && "ring-2 ring-[#ed4245]",
                            )}
                        />
                    </Field>

                    {/* Password */}
                    <Field label="Password" required error={errors.password?.message}>
                        <div className="relative">
                            <Input
                                {...field("password")}
                                type={showPw ? "text" : "password"}
                                autoComplete="new-password"
                                className={cn(
                                    "bg-[#1e1f22] border-none pr-10 text-white placeholder:text-[#4e5058] focus-visible:ring-[#5865f2] focus-visible:ring-2",
                                    errors.password && "ring-2 ring-[#ed4245]",
                                )}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPw((v) => !v)}
                                tabIndex={-1}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#949ba4] hover:text-white"
                            >
                                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        <PasswordStrength value={passwordValue} />
                    </Field>

                    {/* Confirm password */}
                    <Field label="Confirm Password" required error={errors.confirmPassword?.message}>
                        <div className="relative">
                            <Input
                                {...field("confirmPassword")}
                                type={showCPw ? "text" : "password"}
                                autoComplete="new-password"
                                className={cn(
                                    "bg-[#1e1f22] border-none pr-10 text-white placeholder:text-[#4e5058] focus-visible:ring-[#5865f2] focus-visible:ring-2",
                                    errors.confirmPassword && "ring-2 ring-[#ed4245]",
                                )}
                            />
                            <button
                                type="button"
                                onClick={() => setShowCPw((v) => !v)}
                                tabIndex={-1}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#949ba4] hover:text-white"
                            >
                                {showCPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </Field>

                    {/* Terms */}
                    <p className="text-xs text-[#949ba4]">
                        By registering you agree to our{" "}
                        <span className="cursor-pointer text-[#5865f2] hover:underline">
                            Terms of Service
                        </span>{" "}
                        and{" "}
                        <span className="cursor-pointer text-[#5865f2] hover:underline">
                            Privacy Policy
                        </span>
                        .
                    </p>

                    {/* Submit */}
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="mt-1 h-11 w-full bg-[#5865f2] text-base font-medium text-white hover:bg-[#4752c4] disabled:opacity-60"
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                Creating account...
                            </span>
                        ) : (
                            "Continue"
                        )}
                    </Button>

                </form>

                {/* Login link */}
                <p className="mt-4 text-sm text-[#949ba4]">
                    Already have an account?{" "}
                    <Link to="/login" className="text-[#5865f2] hover:underline">
                        Log In
                    </Link>
                </p>

            </div>
        </div>
    );
}