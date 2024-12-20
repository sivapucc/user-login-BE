import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  otp: {
    type: Number,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
});

export const saveOtp = mongoose.model("otp_Datas", otpSchema);
