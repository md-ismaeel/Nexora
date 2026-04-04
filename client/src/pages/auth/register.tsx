import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff, CheckCircle2, Circle } from "lucide-react"
import { useRegisterMutation } from "@/api/auth_api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/utils/utils"

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
})

type FormValues = z.infer<typeof schema>

interface StrengthRule { label: string; test: (v: string) => boolean }

const RULES: StrengthRule[] = [
  { label: "At least 8 characters", test: (v) => v.length >= 8 },
  { label: "One uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { label: "One number", test: (v) => /[0-9]/.test(v) },
  { label: "One special character (optional)", test: (v) => /[^a-zA-Z0-9]/.test(v) },
]

function PasswordStrength({ value }: { value: string }) {
  if (!value) return null
  const passed = RULES.filter((r) => r.test(value)).length
  const colors = ["bg-[#ed4245]", "bg-yellow-500", "bg-yellow-400", "bg-green-500"]
  const color = colors[Math.max(0, passed - 1)]

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {RULES.map((_, i) => (
          <div key={i} className={cn("h-1 flex-1 rounded-full transition-all duration-300", i < passed ? color : "bg-[#3f4147]")} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
        {RULES.map((rule) => {
          const ok = rule.test(value)
          return (
            <span key={rule.label} className={cn("flex items-center gap-1 text-[11px] transition-colors", ok ? "text-green-500" : "text-[#949ba4]")}>
              {ok ? <CheckCircle2 className="h-3 w-3 shrink-0" /> : <Circle className="h-3 w-3 shrink-0" />}
              {rule.label}
            </span>
          )
        })}
      </div>
    </div>
  )
}

export default function Register() {
  const navigate = useNavigate()
  const [showPw, setShowPw] = useState(false)
  const [showCPw, setShowCPw] = useState(false)

  const [registerUser, { isLoading, error }] = useRegisterMutation()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const passwordValue = watch("password") ?? ""

  const onSubmit = async (values: FormValues) => {
    try {
      await registerUser({
        name: values.name,
        email: values.email,
        password: values.password,
        username: values.username || undefined,
        phoneNumber: values.phoneNumber || undefined,
      }).unwrap()
      navigate("/verify-email", { state: { email: values.email } })
    } catch {
      // Handled by RTK Query
    }
  }

  const apiError = (error as { data?: { message?: string } } | undefined)?.data?.message

  return (
    <div className="w-full rounded-lg bg-[#2b2d31] shadow-2xl">
      <div className="p-8 scrollbar-thin scrollbar-thumb-[#202225]">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-white">Create an account</h1>
          <p className="mt-1 text-sm text-[#949ba4]">Join the community today — it's free!</p>
        </div>

        {apiError && (
          <div className="mb-4 rounded-md border border-[#ed4245]/20 bg-[#ed4245]/10 px-3 py-2.5 text-sm text-[#ed4245]">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wide text-[#949ba4]">
              Display Name
            </Label>
            <Input
              {...register("name")}
              id="name"
              placeholder="John Doe"
              className="bg-[#1e1f22] text-white placeholder-[#949ba4] border-[#3f4147]"
            />
            {errors.name && <p className="text-sm text-[#ed4245]">{errors.name.message}</p>}
          </div>

          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wide text-[#949ba4]">
              Email
            </Label>
            <Input
              {...register("email")}
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="bg-[#1e1f22] text-white placeholder-[#949ba4] border-[#3f4147]"
            />
            {errors.email && <p className="text-sm text-[#ed4245]">{errors.email.message}</p>}
          </div>

          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="username" className="text-xs font-bold uppercase tracking-wide text-[#949ba4]">
              Username
            </Label>
            <div className="flex items-center rounded bg-[#1e1f22] border border-[#3f4147]">
              <span className="pl-3 text-sm text-[#949ba4]">@</span>
              <Input
                {...register("username")}
                id="username"
                placeholder="john_doe"
                className="border-0 bg-transparent text-white placeholder-[#949ba4] focus:outline-none focus:ring-0"
              />
            </div>
            <p className="text-[11px] text-[#949ba4]">Lowercase letters, numbers, underscores and dots only</p>
            {errors.username && <p className="text-sm text-[#ed4245]">{errors.username.message}</p>}
          </div>

          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="phoneNumber" className="text-xs font-bold uppercase tracking-wide text-[#949ba4]">
              Phone Number
            </Label>
            <Input
              {...register("phoneNumber")}
              id="phoneNumber"
              type="tel"
              placeholder="+919999999999"
              className="bg-[#1e1f22] text-white placeholder-[#949ba4] border-[#3f4147]"
            />
            <p className="text-[11px] text-[#949ba4]">Include country code, e.g. +919999999999</p>
            {errors.phoneNumber && <p className="text-sm text-[#ed4245]">{errors.phoneNumber.message}</p>}
          </div>

          <div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wide text-[#949ba4]">
                Password
              </Label>
              <div className="relative">
                <Input
                  {...register("password")}
                  id="password"
                  type={showPw ? "text" : "password"}
                  autoComplete="new-password"
                  className="pr-10 bg-[#1e1f22] text-white placeholder-[#949ba4] border-[#3f4147]"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#949ba4] hover:text-white focus:outline-none"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-[#ed4245]">{errors.password.message}</p>}
            </div>
            <PasswordStrength value={passwordValue} />
          </div>

          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-wide text-[#949ba4]">
              Confirm Password
            </Label>
            <div className="relative">
              <Input
                {...register("confirmPassword")}
                id="confirmPassword"
                type={showCPw ? "text" : "password"}
                autoComplete="new-password"
                className="pr-10 bg-[#1e1f22] text-white placeholder-[#949ba4] border-[#3f4147]"
              />
              <button
                type="button"
                onClick={() => setShowCPw((v) => !v)}
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#949ba4] hover:text-white focus:outline-none"
              >
                {showCPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-sm text-[#ed4245]">{errors.confirmPassword.message}</p>}
          </div>

          <p className="text-xs text-[#949ba4]">
            By registering you agree to our{" "}
            <span className="cursor-pointer text-[#5865f2] hover:underline">Terms of Service</span>{" "}
            and{" "}
            <span className="cursor-pointer text-[#5865f2] hover:underline">Privacy Policy</span>.
          </p>

          <Button
            type="submit"
            className="mt-1 h-11 w-full bg-[#5865f2] text-base font-medium hover:bg-[#4752c4]"
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Continue"}
          </Button>
        </form>

        <p className="mt-4 text-sm text-[#949ba4]">
          Already have an account?{" "}
          <Link to="/login" className="text-[#5865f2] hover:underline">Log In</Link>
        </p>
      </div>
    </div>
  )
}
