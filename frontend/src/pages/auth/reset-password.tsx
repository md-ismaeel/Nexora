import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, CheckCircle2, ArrowLeft } from "lucide-react";
import { useResetPasswordMutation } from "@/api/auth_api";
import { Button, TextField, Label, InputGroup, FieldError } from "@heroui/react";
import { cn } from "@/utils/utils";

interface LocationState { email?: string }
interface ApiErrorResponse { data?: { message?: string } }

const RESEND_COOLDOWN = 60;

const schema = z.object({
  newPassword: z
    .string()
    .min(8, "Must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof schema>;

interface StrengthRule { label: string; test: (v: string) => boolean }

const RULES: StrengthRule[] = [
  { label: "At least 8 characters", test: (v) => v.length >= 8 },
  { label: "One uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { label: "One number", test: (v) => /[0-9]/.test(v) },
];

function PasswordStrength({ value }: { value: string }) {
  if (!value) return null;
  const passed = RULES.filter((r) => r.test(value)).length;
  const colors = ["bg-danger", "bg-warning", "bg-yellow-400", "bg-success"];
  const color = colors[Math.max(0, passed - 1)];

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {RULES.map((_, i) => (
          <div key={i} className={cn("h-1 flex-1 rounded-full transition-all duration-300", i < passed ? color : "bg-border")} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
        {RULES.map((rule) => {
          const ok = rule.test(value);
          return (
            <span key={rule.label} className={cn("flex items-center gap-1 text-[11px] transition-colors", ok ? "text-success" : "text-muted")}>
              {ok ? <CheckCircle2 className="h-3 w-3 shrink-0" /> : <span className="h-3 w-3 rounded-full border border-current" />}
              {rule.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = (location.state as LocationState)?.email ?? "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const [showPw, setShowPw] = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [resetPassword, { isLoading, error: resetError }] = useResetPasswordMutation();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const passwordValue = watch("newPassword") ?? "";

  useEffect(() => {
    if (!email) {
      navigate("/forgot-password", { replace: true });
    }
  }, [email, navigate]);

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) inputs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const next = [...otp];
      next[index - 1] = "";
      setOtp(next);
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      inputs.current[5]?.focus();
    }
  };

  const onSubmit = async (values: FormValues) => {
    const code = otp.join("");
    if (code.length < 6) return;

    try {
      await resetPassword({
        email,
        code,
        newPassword: values.newPassword,
      }).unwrap();
      setResetSuccess(true);
      setTimeout(() => navigate("/login", { replace: true }), 2000);
    } catch {
      // Error handled by RTK Query
    }
  };

  const apiError = (resetError as ApiErrorResponse)?.data?.message;
  const code = otp.join("");

  if (resetSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md rounded-lg bg-surface p-8 text-center shadow-xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="h-8 w-8 text-success" />
          </div>
          <h1 className="text-2xl font-bold text-surface-foreground">Password reset!</h1>
          <p className="mt-2 text-sm text-muted">
            Your password has been changed successfully.
          </p>
          <p className="mt-4 text-xs text-muted">
            Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg bg-surface shadow-2xl">
      <div className="p-8 scrollbar-thin scrollbar-thumb-default">
        <Link
          to="/forgot-password"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-surface-foreground">Reset your password</h1>
          <p className="mt-1 text-sm text-muted">
            Enter the 6-digit code sent to <strong className="text-foreground">{email}</strong> and set a new password.
          </p>
        </div>

        {apiError && (
          <div className="mb-4 rounded-md border border-danger/20 bg-danger/10 px-3 py-2.5 text-sm text-danger">
            {apiError}
          </div>
        )}

        <div className="mb-6 flex justify-center gap-2" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={cn(
                "h-14 w-12 rounded-lg border-2 bg-default text-center text-2xl font-bold text-foreground",
                "outline-none transition-all duration-150",
                digit ? "border-accent" : "border-border focus:border-accent",
              )}
            />
          ))}
        </div>

        <p className="mb-4 text-xs text-muted">
          Code expires in 10 minutes. Didn't receive it?{" "}
          {cooldown > 0 ? (
            <span className="text-muted">Resend in {cooldown}s</span>
          ) : (
            <span className="text-muted">Check your spam folder or try again later.</span>
          )}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <TextField isRequired isInvalid={!!errors.newPassword}>
              <Label className="text-xs font-bold uppercase tracking-wide text-muted">New Password</Label>
              <InputGroup>
                <InputGroup.Input
                  {...register("newPassword")}
                  type={showPw ? "text" : "password"}
                  autoComplete="new-password"
                  className="text-foreground placeholder:text-muted"
                />
                <InputGroup.Suffix>
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    tabIndex={-1}
                    className="text-muted hover:text-foreground focus:outline-none"
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </InputGroup.Suffix>
              </InputGroup>
              <FieldError>{errors.newPassword?.message}</FieldError>
            </TextField>
            <PasswordStrength value={passwordValue} />
          </div>

          <TextField isRequired isInvalid={!!errors.confirmPassword}>
            <Label className="text-xs font-bold uppercase tracking-wide text-muted">Confirm Password</Label>
            <InputGroup>
              <InputGroup.Input
                {...register("confirmPassword")}
                type={showCPw ? "text" : "password"}
                autoComplete="new-password"
                className="text-foreground placeholder:text-muted"
              />
              <InputGroup.Suffix>
                <button
                  type="button"
                  onClick={() => setShowCPw((v) => !v)}
                  tabIndex={-1}
                  className="text-muted hover:text-foreground focus:outline-none"
                >
                  {showCPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </InputGroup.Suffix>
            </InputGroup>
            <FieldError>{errors.confirmPassword?.message}</FieldError>
          </TextField>

          <Button
            type="submit"
            isPending={isLoading}
            isDisabled={code.length < 6}
            className="button mt-2 h-11 w-full text-base font-medium"
          >
            Reset Password
          </Button>
        </form>
      </div>
    </div>
  );
}