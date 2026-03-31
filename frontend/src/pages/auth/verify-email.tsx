import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useVerifyEmailOtpMutation, useSendEmailOtpMutation } from "@/api/auth_api";
import { Button } from "@heroui/react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/utils/utils";

interface LocationState { email?: string }
interface ApiErrorResponse { data?: { message?: string } }

const RESEND_COOLDOWN = 60;

export default function VerifyEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = (location.state as LocationState)?.email ?? "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const [verified, setVerified] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [verify, { isLoading: verifying, error: verifyError }] = useVerifyEmailOtpMutation();
  const [resend, { isLoading: resending, isSuccess: resendSuccess }] = useSendEmailOtpMutation();

  const startCooldown = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCooldown(RESEND_COOLDOWN);
    timerRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  }, []);

  // Redirect if no email in location state
  useEffect(() => {
    if (!email) navigate("/register", { replace: true });
  }, [email, navigate]);

  // Start initial cooldown (OTP sent automatically on register)
  // Note: cooldown is already initialised to RESEND_COOLDOWN via useState,
  // so we only need to kick off the interval — no synchronous setCooldown needed.
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

  // Focus first input on mount
  useEffect(() => {
    inputs.current[0]?.focus();
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

  const handleSubmit = async () => {
    const code = otp.join("");
    if (code.length < 6) return;
    try {
      await verify({ email, code }).unwrap();
      setVerified(true);
      setTimeout(() => navigate("/friends", { replace: true }), 2000);
    } catch {
      // verifyError binding shows the error below
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    try {
      await resend({ email }).unwrap();
      setOtp(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
      startCooldown();
    } catch {
      // errors surfaced by RTK Query
    }
  };

  const apiError = (verifyError as ApiErrorResponse)?.data?.message;
  const code = otp.join("");

  // ── Success screen ────────────────────────────────────────────────────────

  if (verified) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex w-full max-w-md flex-col items-center gap-4 rounded-lg bg-surface p-10 text-center shadow-xl">
          <CheckCircle2 className="h-16 w-16 text-success" />
          <h1 className="text-2xl font-bold text-surface-foreground">Email verified!</h1>
          <p className="text-sm text-muted">Redirecting you to the app...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-lg bg-surface p-8 text-center shadow-xl">
        {/* Icon */}
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
          <span className="text-3xl">📧</span>
        </div>

        <h1 className="text-2xl font-bold text-surface-foreground">Check your email</h1>
        <p className="mt-2 text-sm text-muted">
          We sent a 6-digit code to <strong className="text-foreground">{email}</strong>.
          <br />
          Enter it below — it expires in 10 minutes.
        </p>

        {/* Error */}
        {apiError && (
          <div className="mt-4 rounded-md border border-danger/20 bg-danger/10 px-3 py-2 text-sm text-danger">
            {apiError}
          </div>
        )}

        {/* Resend success */}
        {resendSuccess && !apiError && (
          <div className="mt-4 rounded-md border border-success/20 bg-success/10 px-3 py-2 text-sm text-success">
            A new code has been sent to your email.
          </div>
        )}

        {/* OTP inputs */}
        <div className="mt-6 flex justify-center gap-2" onPaste={handlePaste}>
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

        {/* Submit */}
        <Button
          onPress={handleSubmit}
          isspinning={verifying}
          isDisabled={code.length < 6}
          className="button mt-6 h-11 w-full text-base font-medium"
        >
          Verify Email
        </Button>

        {/* Resend */}
        <p className="mt-4 text-sm text-muted">
          Didn't receive it?{" "}
          {cooldown > 0 ? (
            <span className="text-muted">Resend in {cooldown}s</span>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-accent hover:underline disabled:opacity-50"
            >
              {resending ? "Sending..." : "Resend code"}
            </button>
          )}
        </p>

        {/* Wrong email */}
        <p className="mt-2 text-xs text-muted">
          Wrong email?{" "}
          <button onClick={() => navigate("/register")} className="text-accent hover:underline">
            Go back
          </button>
        </p>
      </div>
    </div>
  );
}