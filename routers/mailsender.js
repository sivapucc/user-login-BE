import nodemailer from "nodemailer";
import { generateJwtToken } from "../models/user.js";
import dotenv from "dotenv";

dotenv.config();

export async function mailsender(receiverEmail, otp) {
  try {
    const sender = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "praveencheetak@gmail.com",
        pass: process.env.PASS, // App Password
      },
    });

    const emailOptions = {
      from: "praveencheetak@gmail.com",
      to: receiverEmail.email,
      subject: "Password Reset Request",
      text: `Hi, your password reset code is ${otp}. You can also click this link: https://melodic-lebkuchen-4603a7.netlify.app/otp`,
      html: `<p>Hi,</p>
             <p>Your password reset code is <b>${otp}</b>.</p>
             <p>You can reset your password using this link: 
                <a href="https://melodic-lebkuchen-4603a7.netlify.app/otp">Reset Password</a>.
             </p>
             <p>If you did not request this, please ignore this email.</p>`,
      replyTo: "praveencheetak@gmail.com",
    };
    const token = await generateJwtToken(receiverEmail._id);
    const info = await sender.sendMail(emailOptions);
    //console.log("Email sent successfully:", token);
    return token;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
}
