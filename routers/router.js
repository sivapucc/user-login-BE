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
    console.log(error);
    res.status(500);
  }
});

router.post("/signup", async (req, res) => {
  try {
    let userData = await UserLogin.findOne({ email: req.body.email }).populate(
      "email"
    );
    console.log(userData);
    if (userData) {
      return res.status(400).json({ msg: "user already exists" });
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedpassword = await bcrypt.hash(req.body.password, salt);
      userData = await UserLogin.create({
        name: req.body.name,
        email: req.body.email,
        password: hashedpassword,
      });
      const token = await generateJwtToken(userData._id);
      return res
        .status(201)
        .json({ message: "Registration successfull", token });
    }
  } catch (error) {
    console.log(error);
    return res.status(500);
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await UserLogin.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials...." });
    }

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
  } catch (error) {
    console.log(error);
  }
});

router.post("/forgot", async (req, res) => {
  const email = req.body.foemail;
  try {
    const user = await UserLogin.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid Email...." });
    const otp = Math.floor(1000 + Math.random() * 9000);
    const reciever = user;
    const token = await mailsender(reciever, otp);

    if (saveOtp.findOne({ email })) {
      await saveOtp.findOneAndUpdate(
        { email: email },
        { $set: { otp: otp, token: token } },
        { new: true }
      );
    } else {
      await saveOtp.create({
        otp,
        token,
        email,
      });
    }
    res.status(200).json({ token: token });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
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
    const token = headers["token"];
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
