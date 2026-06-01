import { Resend } from "resend";
import OTP from "../models/otpModel.js";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOtpService(email) {
  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  // Upsert OTP (replace if it already exists)
  await OTP.findOneAndUpdate(
    { email },
    { otp, createdAt: new Date() },
    { upsert: true } // if otp is not there it insert if it is there than it's update it.
  );

 const html = `
  <div style="font-family: Arial, sans-serif; max-width: 460px; margin: auto; padding: 20px; background: #ffffff; border-radius: 10px; border: 1px solid #e5e5e5;">
      
      <h2 style="color: #4A4A4A; text-align: center; margin-bottom: 10px;">
        Welcome to Our Cloud Storage Service 🎉
      </h2>

      <p style="font-size: 15px; color: #555; text-align: center; margin-top: 0;">
        Thank you for registering with us! We're excited to have you on board.
      </p>

      <div style="margin: 25px 0; padding: 15px; background: #f4f4f4; border-left: 4px solid #4a90e2; border-radius: 6px;">
          <p style="margin: 0; font-size: 16px; color: #333;">
            <strong>Your OTP:</strong>
          </p>
          <h1 style="margin: 10px 0 0; font-size: 32px; color: #4a90e2; letter-spacing: 4px; text-align: center;">
            ${otp}
          </h1>
      </div>

      <p style="font-size: 14px; color: #666; text-align: center;">
        This OTP is valid for <strong>10 minutes</strong>.  
        Please do not share it with anyone.
      </p>

      <p style="text-align: center; margin-top: 30px; font-size: 13px; color: #999;">
        If you didn’t request this, please ignore this email.
      </p>
  </div>
`;


  await resend.emails.send({
    from: "Storage App <otp@sivaprasadkada.tech>",
    to: email,
    subject: "Storage App OTP",
    html,
  });

  return { success: true, message: `OTP sent successfully on ${email}` };
}
