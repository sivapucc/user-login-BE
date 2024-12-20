import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  contact: {
    type: Number,
  },
});

export async function generateJwtToken(id) {
  return jwt.sign({ id }, process.env.SECRETKEY);
}
export const UserLogin = mongoose.model("login_users_data", userSchema);
