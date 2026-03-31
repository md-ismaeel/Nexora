import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSendPhoneOtpMutation, useVerifyPhoneOtpMutation } from "@/api/auth_api";
import { Button } from "@heroui/react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/utils/utils";

interface LocationState { phoneNumber?: string }
interface ApiErrorResponse { data?: { message?: string } }

const RESEND_COOLDOWN = 60;

export default function VerifyPhonePage() {
    const location = useLocation();
    const navigate = useNavigate();
    const phoneNumber = (location.state as LocationState)?.phoneNumber ?? "";

    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [cooldown, setCooldown] = useState(0); // starts at 0 — user must request first
    const [verified, setVerified] = useState(false);
    const inputs = useRef<(HTMLInputElement | null)[]>([]);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const [verify, { isLoading: verifying, error: verifyError }] = useVerifyPhoneOtpMutation();
    const [sendOtp, { isLoading: sending, isSuccess: sendSuccess }] = useSendPhoneOtpMutation();

    useEffect(() => {
        if (!phoneNumber) navigate("/register", { replace: true });
    }, [phoneNumber, navigate]);

    useEffect(() => {
        inputs.current[0]?.focus();
    }, []);

    const startCooldown = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        setCooldown(RESEND_COOLDOWN);
        timerRef.current = setInterval(() => {
            setCooldown((c) => {
                if (c <= 1) { clearInterval(timerRef.current!); return 0; }
                return c - 1;
            });
        }, 1000);
    }, []);

    useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

    const handleChange = (index: number, value: string) => {
        if (!/^\d?$/.test(value)) return;
        const next = [...otp]; next[index] = value; setOtp(next);
        if (value && index < 5) inputs.current[index + 1]?.focus();
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            const next = [...otp]; next[index - 1] = ""; setOtp(next);
            inputs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (pasted.length === 6) { setOtp(pasted.split("")); inputs.current[5]?.focus(); }
    };

    const handleSendOtp = async () => {
        try {
            await sendOtp({ phoneNumber }).unwrap();
            startCooldown();
            setOtp(["", "", "", "", "", ""]);
            inputs.current[0]?.focus();
        } catch { /* sendOtp error shown via isError */ }
    };

    const handleSubmit = async () => {
        const code = otp.join("");
        if (code.length < 6) return;
        try {
            await verify({ phoneNumber, code }).unwrap();
            setVerified(true);
            setTimeout(() => navigate("/channels/@me", { replace: true }), 2000);
        } catch { /* verifyError binding handles display */ }
    };

    const apiError = (verifyError as ApiErrorResponse)?.data?.message;
    const code = otp.join("");

    if (verified) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="flex w-full max-w-md flex-col items-center gap-4 rounded-lg bg-surface p-10 text-center shadow-xl">
                    <CheckCircle2 className="h-16 w-16 text-success" />
                    <h1 className="text-2xl font-bold text-surface-foreground">Phone verified!</h1>
                    <p className="text-sm text-muted">Redirecting you to the app...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <div className="w-full max-w-md rounded-lg bg-surface p-8 text-center shadow-xl">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
                    <span className="text-3xl">📱</span>
                </div>
                <h1 className="text-2xl font-bold text-surface-foreground">Verify your phone</h1>
                <p className="mt-2 text-sm text-muted">
                    We'll send a 6-digit code to <strong className="text-foreground">{phoneNumber}</strong>.
                    <br />Enter it below — it expires in 10 minutes.
                </p>

                {apiError && (
                    <div className="mt-4 rounded-md border border-danger/20 bg-danger/10 px-3 py-2 text-sm text-danger">{apiError}</div>
                )}
                {sendSuccess && (
                    <div className="mt-4 rounded-md border border-success/20 bg-success/10 px-3 py-2 text-sm text-success">Code sent to your phone.</div>
                )}

                {/* Request code first */}
                {cooldown === 0 && !sendSuccess && (
                    <Button
                        onPress={handleSendOtp}
                        isspinning={sending}
                        className="button mt-6 h-11 w-full text-base font-medium"
                    >
                        Send Code
                    </Button>
                )}

                {/* OTP inputs — show after code sent */}
                {(sendSuccess || cooldown > 0) && (
                    <>
                        <div className="mt-6 flex justify-center gap-2" onPaste={handlePaste}>
                            {otp.map((digit, i) => (
                                <input key={i} ref={(el) => { inputs.current[i] = el; }}
                                    type="text" inputMode="numeric" maxLength={1} value={digit}
                                    onChange={(e) => handleChange(i, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(i, e)}
                                    className={cn(
                                        "h-14 w-12 rounded-lg border-2 bg-default text-center text-2xl font-bold text-foreground outline-none transition-all duration-150",
                                        digit ? "border-accent" : "border-border focus:border-accent",
                                    )}
                                />
                            ))}
                        </div>

                        <Button
                            onPress={handleSubmit}
                            isspinning={verifying}
                            isDisabled={code.length < 6}
                            className="button mt-6 h-11 w-full text-base font-medium"
                        >
                            Verify Phone
                        </Button>

                        <p className="mt-4 text-sm text-muted">
                            Didn't receive it?{" "}
                            {cooldown > 0 ? (
                                <span className="text-muted">Resend in {cooldown}s</span>
                            ) : (
                                <button onClick={handleSendOtp} disabled={sending} className="text-accent hover:underline disabled:opacity-50">
                                    {sending ? "Sending..." : "Resend code"}
                                </button>
                            )}
                        </p>
                    </>
                )}

                <p className="mt-2 text-xs text-muted">
                    Wrong number?{" "}
                    <button onClick={() => navigate("/register")} className="text-accent hover:underline">Go back</button>
                </p>
            </div>
        </div>
    );
}