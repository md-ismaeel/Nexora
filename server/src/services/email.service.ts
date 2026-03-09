import nodemailer, { type Transporter, type SendMailOptions } from "nodemailer";
import { getEnv } from "@/config/env.config";
import { otpEmailTemplate } from "@/templates/otp_template";
import { ApiError } from "@/utils/ApiError";

// Singleton transporter
let transporter: Transporter | null = null;

const createTransporter = (): Transporter => {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: getEnv("SMTP_HOST"),
    port: Number(getEnv("SMTP_PORT")),
    secure: Number(getEnv("SMTP_PORT")) === 465,
    auth: {
      user: getEnv("SMTP_USER"),
      pass: getEnv("SMTP_PASS"),
    },
  });

  return transporter;
};

// Generic mail sender
export const sendEmail = async (options: SendMailOptions): Promise<void> => {
  try {
    const transport = createTransporter();

    await transport.sendMail({
      from: `"Discord App" <${getEnv("EMAIL_FROM")}>`,
      ...options,
    });

  } catch (error) {
    console.error("Email sending failed:", error);
    throw ApiError.internal("Failed to send email");
  }
};

// OTP Email Sender
export const sendOtpEmail = async (to: string, otp: string): Promise<void> => {

  const mailOptions: SendMailOptions = {
    to,
    subject: "Your verification code",
    text: `Your Discord App verification code is: ${otp}. It expires in 10 minutes.`,
    html: otpEmailTemplate(otp, "email"),
  };

  await sendEmail(mailOptions);
};