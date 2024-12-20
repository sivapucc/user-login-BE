import express from "express";
import { generateJwtToken, UserLogin } from "../models/user.js";
import bcrypt from "bcrypt";
import { mailsender } from "./mailsender.js";
import { saveOtp } from "../models/otp.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const user = await UserLogin.find({});
    res.status(200).json({ data: user });
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

function validateSignupData(req, res, next) {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  next();
}

router.post("/signup", validateSignupData, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await UserLogin.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await UserLogin.create({
      name,
      email,
      password: hashedPassword,
    });
    const token = await generateJwtToken(newUser._id);

    res.status(201).json({ message: "Registration successful", token });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await UserLogin.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials...." });
    } else {
      const validatePassward = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (!validatePassward) {
        return res.status(400).json({ message: "Invalid credentials...." });
      }

      const token = await generateJwtToken(user._id);

      res.status(200).json({
        message: "Logedin sucessfully....",
        token: token,
        useName: user.name,
      });
    }
  } catch (error) {
    console.log(error);
  }
});

router.post("/forgot", async (req, res) => {
  const { foemail: email } = req.body;

  try {
    const user = await UserLogin.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid Email" });

    const otp = Math.floor(1000 + Math.random() * 9000);
    const token = await mailsender(user, otp);

    const existingOtp = await saveOtp.findOne({ email });

    if (existingOtp) {
      await saveOtp.updateOne({ email }, { otp, token });
    } else {
      await saveOtp.create({ email, otp, token });
    }

    res.status(200).json({ token });
  } catch (error) {
    console.error("Error in forgot route:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
});

router.post("/verifyotp", async (req, res) => {
  const otp = Number(req.body.otp);
  const token = req.headers["token"]; // Check for token in headers

  console.log("Token received on backend:", token);
  console.log("OTP received on backend:", otp);

  try {
    if (!token) return res.status(400).json({ msg: "Token missing" });

    const checkOtp = await saveOtp.findOne({ token });
    console.log("OTP record found in database:", checkOtp);

    if (!checkOtp || checkOtp.otp !== otp) {
      return res.status(400).json({ msg: "Invalid OTP or token" });
    }

    res.status(200).json({ msg: "valid" });
  } catch (error) {
    console.error("Error during OTP verification:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

router.post("/update/password", async (req, res) => {
  try {
    const newpassword = req.body.pass;
    let salt = await bcrypt.genSalt(10);
    let hashpassword = await bcrypt.hash(newpassword, salt);
    const token = req.headers["token"];

    const email = await saveOtp.findOne({ token });
    const user = await UserLogin.findOneAndUpdate(
      { email: email.email },
      { $set: { password: hashpassword } },
      { new: true }
    );

    if (user.password === newpassword) {
      return res
        .status(200)
        .json({ message: "password successfully updated...", isUpdate: true });
    } else {
      return res.status(400);
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "internal server error" });
  }
});

export const userRouter = router;
