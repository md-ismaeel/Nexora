// forgot-password.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useForgotPasswordMutation } from "@/api/auth_api";
import { Button, TextField, Label, Input, FieldError } from "@heroui/react";
import { ArrowLeft, Mail } from "lucide-react";

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
});
type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);

  const [forgotPassword, { isLoading, error }] = useForgotPasswordMutation();

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await forgotPassword({ email: values.email }).unwrap();
      setSubmitted(true);
      setTimeout(() => navigate("/reset-password", { state: { email: values.email } }), 2000);
    } catch {
      // Still show success to prevent email enumeration
    }
  };

  const apiError = (error as { data?: { message?: string } } | undefined)?.data?.message;

  // ── Success state ─────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md rounded-lg bg-surface p-8 text-center shadow-xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
            <Mail className="h-8 w-8 text-success" />
          </div>
          <h1 className="text-2xl font-bold text-surface-foreground">Check your email</h1>
          <p className="mt-2 text-sm text-muted">
            If an account exists with this email, you will receive a password reset code.
          </p>
          <p className="mt-4 text-xs text-muted">Redirecting to reset password page…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg bg-surface shadow-2xl">
      <div className="p-8">
        <Link
          to="/login"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Login
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-surface-foreground">Forgot your password?</h1>
          <p className="mt-1 text-sm text-muted">
            No worries, we'll send you a reset code to your email.
          </p>
        </div>

        {apiError && (
          <div className="mb-4 rounded-md border border-danger/20 bg-danger/10 px-3 py-2.5 text-sm text-danger">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/*
            v3 TextField — compound:
              <TextField isRequired isInvalid>
                <Label />
                <Input />
                <FieldError />
              </TextField>
          */}
          <TextField isRequired isInvalid={!!errors.email} autoFocus>
            <Label className="text-xs font-bold uppercase tracking-wide text-muted">
              Email Address
            </Label>
            <Input
              {...register("email")}
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="text-foreground placeholder:text-muted"
            />
            <FieldError>{errors.email?.message}</FieldError>
          </TextField>

          {/*
            v3 Button — use isLoading (not isspinning).
            isLoading shows a spinner and disables the button automatically.
          */}
          <Button
            type="submit"
            variant="primary"
            className="mt-2 h-11 w-full text-base font-medium"
          >
            {isLoading ? "Sending..." : "Send Reset Code"}
          </Button>
        </form>

        <p className="mt-5 text-sm text-muted">
          Remember your password?{" "}
          <Link to="/login" className="text-accent hover:underline">Log In</Link>
        </p>
      </div>
    </div>
  );
}