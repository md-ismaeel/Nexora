import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useLoginMutation } from "@/api/auth.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/utils";

// ── Validation 
const schema = z.object({
  emailOrUsername: z.string().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

// ── OAuth icon components 
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"
      />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

// ── Field wrapper 
interface FieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

function Field({ label, required, error, children, action }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-bold uppercase tracking-wide text-[#b5bac1]">
          {label}
          {required && <span className="ml-1 text-[#ed4245]">*</span>}
        </Label>
        {action}
      </div>
      {children}
      {error && <p className="text-xs text-[#ed4245]">{error}</p>}
    </div>
  );
}

// ── Page 
const API = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api/v1";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // FIX: sanitize open redirect — only allow internal paths starting with "/"
  // Without this, `from` coming from location.state could be "http://evil.com"
  const rawFrom = (location.state as { from?: string })?.from;
  const from = rawFrom && rawFrom.startsWith("/") ? rawFrom : "/friends";

  const [showPw, setShowPw] = useState(false);
  const [login, { isLoading, error }] = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    const isEmail = values.emailOrUsername.includes("@");
    try {
      await login(
        isEmail
          ? { email: values.emailOrUsername, password: values.password }
          : { username: values.emailOrUsername, password: values.password },
      ).unwrap();
      navigate(from, { replace: true });
    } catch {
      // RTK Query stores the error in the `error` binding above — no extra handling needed
    }
  };

  const apiError = (error as { data?: { message?: string } } | undefined)?.data
    ?.message;

  return (
    <div className="w-full rounded-lg bg-[#313338] p-8 shadow-2xl">
      {/* Heading */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-white">Welcome back!</h1>
        <p className="mt-1 text-sm text-[#b5bac1]">
          We're so excited to see you again!
        </p>
      </div>

      {/* API error */}
      {apiError && (
        <div className="mb-4 rounded-md border border-[#ed4245]/20 bg-[#ed4245]/10 px-3 py-2.5 text-sm text-[#ed4245]">
          {apiError}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <Field
          label="Email or Username"
          required
          error={errors.emailOrUsername?.message}
        >
          <Input
            {...register("emailOrUsername")}
            autoComplete="username"
            autoFocus
            className={cn(
              "border-none bg-[#1e1f22] text-white placeholder:text-[#4e5058]",
              "focus-visible:ring-2 focus-visible:ring-[#5865f2]",
              errors.emailOrUsername && "ring-2 ring-[#ed4245]",
            )}
          />
        </Field>

        <Field
          label="Password"
          required
          error={errors.password?.message}
          action={
            <Link
              to="/forgot-password"
              className="text-xs text-[#5865f2] hover:underline"
            >
              Forgot your password?
            </Link>
          }
        >
          <div className="relative">
            <Input
              {...register("password")}
              type={showPw ? "text" : "password"}
              autoComplete="current-password"
              className={cn(
                "border-none bg-[#1e1f22] pr-10 text-white placeholder:text-[#4e5058]",
                "focus-visible:ring-2 focus-visible:ring-[#5865f2]",
                errors.password && "ring-2 ring-[#ed4245]",
              )}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#949ba4] hover:text-white"
              tabIndex={-1}
            >
              {showPw ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </Field>

        <Button
          type="submit"
          disabled={isLoading}
          className="mt-1 h-11 w-full bg-[#5865f2] text-base font-medium text-white hover:bg-[#4752c4] disabled:opacity-60"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Logging in...
            </span>
          ) : (
            "Log In"
          )}
        </Button>
      </form>

      {/* OAuth divider */}
      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-[#35363c]" />
        <span className="text-xs text-[#949ba4]">or continue with</span>
        <div className="h-px flex-1 bg-[#35363c]" />
      </div>

      {/* OAuth buttons */}
      <div className="flex flex-col gap-2.5">
        <a
          href={`${API}/auth/google`}
          className="flex h-10 w-full items-center justify-center gap-2.5 rounded-md bg-white px-4 text-sm font-medium text-[#3c4043] shadow-sm transition-opacity hover:opacity-90"
        >
          <GoogleIcon /> Continue with Google
        </a>
        <a
          href={`${API}/auth/github`}
          className="flex h-10 w-full items-center justify-center gap-2.5 rounded-md bg-[#24292e] px-4 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          <GithubIcon /> Continue with GitHub
        </a>
        <a
          href={`${API}/auth/facebook`}
          className="flex h-10 w-full items-center justify-center gap-2.5 rounded-md bg-[#1877f2] px-4 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          <FacebookIcon /> Continue with Facebook
        </a>
      </div>

      {/* Register link */}
      <p className="mt-5 text-sm text-[#949ba4]">
        Need an account?{" "}
        <Link to="/register" className="text-[#5865f2] hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}
