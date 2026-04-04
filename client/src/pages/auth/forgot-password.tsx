import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Link, useNavigate } from "react-router-dom"
import { useForgotPasswordMutation } from "@/api/auth_api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Mail } from "lucide-react"

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
})
type FormValues = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [submitted, setSubmitted] = useState(false)

  const [forgotPassword, { isLoading, error }] = useForgotPasswordMutation()

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (values: FormValues) => {
    try {
      await forgotPassword({ email: values.email }).unwrap()
      setSubmitted(true)
      setTimeout(() => navigate("/reset-password", { state: { email: values.email } }), 2000)
    } catch {
      // Still show success to prevent email enumeration
    }
  }

  const apiError = (error as { data?: { message?: string } } | undefined)?.data?.message

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#313338] px-4">
        <div className="w-full max-w-md rounded-lg bg-[#2b2d31] p-8 text-center shadow-xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
            <Mail className="h-8 w-8 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-white">Check your email</h1>
          <p className="mt-2 text-sm text-[#949ba4]">
            If an account exists with this email, you will receive a password reset code.
          </p>
          <p className="mt-4 text-xs text-[#949ba4]">Redirecting to reset password page...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full rounded-lg bg-[#2b2d31] shadow-2xl">
      <div className="p-8">
        <Link
          to="/login"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-[#949ba4] transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Login
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Forgot your password?</h1>
          <p className="mt-1 text-sm text-[#949ba4]">
            No worries, we'll send you a reset code to your email.
          </p>
        </div>

        {apiError && (
          <div className="mb-4 rounded-md border border-[#ed4245]/20 bg-[#ed4245]/10 px-3 py-2.5 text-sm text-[#ed4245]">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wide text-[#949ba4]">
              Email Address
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

          <Button
            type="submit"
            className="mt-2 h-11 w-full bg-[#5865f2] text-base font-medium hover:bg-[#4752c4]"
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send Reset Code"}
          </Button>
        </form>

        <p className="mt-5 text-sm text-[#949ba4]">
          Remember your password?{" "}
          <Link to="/login" className="text-[#5865f2] hover:underline">Log In</Link>
        </p>
      </div>
    </div>
  )
}
