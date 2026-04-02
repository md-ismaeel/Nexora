import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, CheckCircle2, Circle } from "lucide-react";
import { useRegisterMutation } from "@/api/auth_api";
import { Button, TextField, Label, Input, InputGroup, FieldError, Description } from "@heroui/react";
import { cn } from "@/utils/utils";

// ── Validation ────────────────────────────────────────────────────────────────

const schema = z.object({
  name: z.string().min(2, "Must be at least 2 characters").max(32, "Must be 32 characters or less"),
  email: z.string().email("Enter a valid email address"),
  username: z
    .string().min(3, "Must be at least 3 characters").max(32, "Must be 32 characters or less")
    .regex(/^[a-z0-9_.]+$/, "Only lowercase letters, numbers, _ and . allowed")
    .optional().or(z.literal("")),
  phoneNumber: z
    .string().regex(/^\+[1-9]\d{7,14}$/, "Must be in format +919999999999")
    .optional().or(z.literal("")),
  password: z
    .string().min(8, "Must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof schema>;

// ── Password strength ─────────────────────────────────────────────────────────

interface StrengthRule { label: string; test: (v: string) => boolean }

const RULES: StrengthRule[] = [
  { label: "At least 8 characters", test: (v) => v.length >= 8 },
  { label: "One uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { label: "One number", test: (v) => /[0-9]/.test(v) },
  { label: "One special character (optional)", test: (v) => /[^a-zA-Z0-9]/.test(v) },
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
              {ok ? <CheckCircle2 className="h-3 w-3 shrink-0" /> : <Circle className="h-3 w-3 shrink-0" />}
              {rule.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ── Register page ─────────────────────────────────────────────────────────────

export default function Register() {
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [showCPw, setShowCPw] = useState(false);

  const [registerUser, { isLoading, error }] = useRegisterMutation();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const passwordValue = watch("password") ?? "";

  const onSubmit = async (values: FormValues) => {
    try {
      await registerUser({
        name: values.name,
        email: values.email,
        password: values.password,
        username: values.username || undefined,
        phoneNumber: values.phoneNumber || undefined,
      }).unwrap();
      navigate("/verify-email", { state: { email: values.email } });
    } catch {
      // Handled by RTK Query
    }
  };

  const apiError = (error as { data?: { message?: string } } | undefined)?.data?.message;

  return (
    <div className="w-full rounded-lg bg-surface shadow-2xl">
      <div className="p-8 scrollbar-thin scrollbar-thumb-default">
        {/* Heading */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-surface-foreground">Create an account</h1>
          <p className="mt-1 text-sm text-muted">Join the community today — it's free!</p>
        </div>

        {/* API error */}
        {apiError && (
          <div className="mb-4 rounded-md border border-danger/20 bg-danger/10 px-3 py-2.5 text-sm text-danger">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

          <TextField isRequired isInvalid={!!errors.name} autoFocus>
            <Label className="text-xs font-bold uppercase tracking-wide text-muted">Display Name</Label>
            <Input {...register("name")} placeholder="John Doe" className="text-foreground placeholder:text-muted" />
            <FieldError>{errors.name?.message}</FieldError>
          </TextField>

          <TextField isRequired isInvalid={!!errors.email}>
            <Label className="text-xs font-bold uppercase tracking-wide text-muted">Email</Label>
            <Input {...register("email")} type="email" autoComplete="email" placeholder="you@example.com" className="text-foreground placeholder:text-muted" />
            <FieldError>{errors.email?.message}</FieldError>
          </TextField>

          <TextField isInvalid={!!errors.username}>
            <Label className="text-xs font-bold uppercase tracking-wide text-muted">Username</Label>
            <InputGroup>
              <InputGroup.Prefix><span className="text-sm text-muted">@</span></InputGroup.Prefix>
              <InputGroup.Input {...register("username")} placeholder="john_doe" className="text-foreground placeholder:text-muted" />
            </InputGroup>
            <Description className="text-[11px] text-muted">Lowercase letters, numbers, underscores and dots only</Description>
            <FieldError>{errors.username?.message}</FieldError>
          </TextField>

          <TextField isInvalid={!!errors.phoneNumber}>
            <Label className="text-xs font-bold uppercase tracking-wide text-muted">Phone Number</Label>
            <Input {...register("phoneNumber")} type="tel" placeholder="+919999999999" className="text-foreground placeholder:text-muted" />
            <Description className="text-[11px] text-muted">Include country code, e.g. +919999999999</Description>
            <FieldError>{errors.phoneNumber?.message}</FieldError>
          </TextField>

          <div>
            <TextField isRequired isInvalid={!!errors.password}>
              <Label className="text-xs font-bold uppercase tracking-wide text-muted">Password</Label>
              <InputGroup>
                <InputGroup.Input {...register("password")} type={showPw ? "text" : "password"} autoComplete="new-password" className="text-foreground placeholder:text-muted" />
                <InputGroup.Suffix>
                  <button type="button" onClick={() => setShowPw((v) => !v)} tabIndex={-1} className="text-muted hover:text-foreground">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </InputGroup.Suffix>
              </InputGroup>
              <FieldError>{errors.password?.message}</FieldError>
            </TextField>
            <PasswordStrength value={passwordValue} />
          </div>

          <TextField isRequired isInvalid={!!errors.confirmPassword}>
            <Label className="text-xs font-bold uppercase tracking-wide text-muted">Confirm Password</Label>
            <InputGroup>
              <InputGroup.Input {...register("confirmPassword")} type={showCPw ? "text" : "password"} autoComplete="new-password" className="text-foreground placeholder:text-muted" />
              <InputGroup.Suffix>
                <button type="button" onClick={() => setShowCPw((v) => !v)} tabIndex={-1} className="text-muted hover:text-foreground">
                  {showCPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </InputGroup.Suffix>
            </InputGroup>
            <FieldError>{errors.confirmPassword?.message}</FieldError>
          </TextField>

          {/* Terms */}
          <p className="text-xs text-muted">
            By registering you agree to our{" "}
            <span className="cursor-pointer text-accent hover:underline">Terms of Service</span>{" "}
            and{" "}
            <span className="cursor-pointer text-accent hover:underline">Privacy Policy</span>.
          </p>

          <Button
            type="submit"
            isPending={isLoading}
            className="button mt-1 h-11 w-full text-base font-medium"
          >
            Continue
          </Button>
        </form>

        <p className="mt-4 text-sm text-muted">
          Already have an account?{" "}
          <Link to="/login" className="text-accent hover:underline">Log In</Link>
        </p>
      </div>
    </div>
  );
}