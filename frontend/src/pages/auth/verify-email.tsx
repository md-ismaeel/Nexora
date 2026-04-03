import { useState, useRef, useEffect, useCallback } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useVerifyEmailOtpMutation, useSendEmailOtpMutation } from "@/api/auth_api"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"
import { cn } from "@/utils/utils"

interface LocationState { email?: string }
interface ApiErrorResponse { data?: { message?: string } }

const RESEND_COOLDOWN = 60

export default function VerifyEmailPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const email = (location.state as LocationState)?.email ?? ""

  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN)
  const [verified, setVerified] = useState(false)
  const inputs = useRef<(HTMLInputElement | null)[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [verify, { isLoading: verifying, error: verifyError }] = useVerifyEmailOtpMutation()
  const [resend, { isLoading: resending, isSuccess: resendSuccess }] = useSendEmailOtpMutation()

  const startCooldown = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    setCooldown(RESEND_COOLDOWN)
    timerRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(timerRef.current!)
          return 0
        }
        return c - 1
      })
    }, 1000)
  }, [])

  useEffect(() => {
    if (!email) navigate("/register", { replace: true })
  }, [email, navigate])

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(timerRef.current!)
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  useEffect(() => {
    inputs.current[0]?.focus()
  }, [])

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return
    const next = [...otp]
    next[index] = value
    setOtp(next)
    if (value && index < 5) inputs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const next = [...otp]
      next[index - 1] = ""
      setOtp(next)
      inputs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    if (pasted.length === 6) {
      setOtp(pasted.split(""))
      inputs.current[5]?.focus()
    }
  }

  const handleSubmit = async () => {
    const code = otp.join("")
    if (code.length < 6) return
    try {
      await verify({ email, code }).unwrap()
      setVerified(true)
      setTimeout(() => navigate("/friends", { replace: true }), 2000)
    } catch {
      // verifyError binding shows the error below
    }
  }

  const handleResend = async () => {
    if (cooldown > 0 || resending) return
    try {
      await resend({ email }).unwrap()
      setOtp(["", "", "", "", "", ""])
      inputs.current[0]?.focus()
      startCooldown()
    } catch {
      // errors surfaced by RTK Query
    }
  }

  const apiError = (verifyError as ApiErrorResponse)?.data?.message
  const code = otp.join("")

  if (verified) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#313338]">
        <div className="flex w-full max-w-md flex-col items-center gap-4 rounded-lg bg-[#2b2d31] p-10 text-center shadow-xl">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
          <h1 className="text-2xl font-bold text-white">Email verified!</h1>
          <p className="text-sm text-[#949ba4]">Redirecting you to the app...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#313338] px-4">
      <div className="w-full max-w-md rounded-lg bg-[#2b2d31] p-8 text-center shadow-xl">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#5865f2]/10">
          <span className="text-3xl">📧</span>
        </div>

        <h1 className="text-2xl font-bold text-white">Check your email</h1>
        <p className="mt-2 text-sm text-[#949ba4]">
          We sent a 6-digit code to <strong className="text-white">{email}</strong>.
          <br />
          Enter it below — it expires in 10 minutes.
        </p>

        {apiError && (
          <div className="mt-4 rounded-md border border-[#ed4245]/20 bg-[#ed4245]/10 px-3 py-2 text-sm text-[#ed4245]">
            {apiError}
          </div>
        )}

        {resendSuccess && !apiError && (
          <div className="mt-4 rounded-md border border-green-500/20 bg-green-500/10 px-3 py-2 text-sm text-green-500">
            A new code has been sent to your email.
          </div>
        )}

        <div className="mt-6 flex justify-center gap-2" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputs.current[i] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={cn(
                "h-14 w-12 rounded-lg border-2 bg-[#1e1f22] text-center text-2xl font-bold text-white",
                "outline-none transition-all duration-150",
                digit ? "border-[#5865f2]" : "border-[#3f4147] focus:border-[#5865f2]",
              )}
            />
          ))}
        </div>

        <Button
          onClick={handleSubmit}
          className="mt-6 h-11 w-full bg-[#5865f2] text-base font-medium hover:bg-[#4752c4]"
          disabled={verifying || code.length < 6}
        >
          {verifying ? "Verifying..." : "Verify Email"}
        </Button>

        <p className="mt-4 text-sm text-[#949ba4]">
          Didn't receive it?{" "}
          {cooldown > 0 ? (
            <span className="text-[#949ba4]">Resend in {cooldown}s</span>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-[#5865f2] hover:underline disabled:opacity-50"
            >
              {resending ? "Sending..." : "Resend code"}
            </button>
          )}
        </p>

        <p className="mt-2 text-xs text-[#949ba4]">
          Wrong email?{" "}
          <button onClick={() => navigate("/register")} className="text-[#5865f2] hover:underline">
            Go back
          </button>
        </p>
      </div>
    </div>
  )
}
