import User, { sriLankaMobile } from "../models/User.js";
import jwt from "jsonwebtoken";

export async function signup(req, res) {
  try {
    const { name, email, mobile, dob, gender, barRegNo, password } = req.body;

    // very basic checks (backend should always validate again)
    if (!password) return res.status(400).json({ error: "password required" });

    const user = new User({ name, email, mobile, dob, gender, barRegNo, passwordHash: "temp" });
    await user.setPassword(password); // hashes the password
    await user.save();

    // never return the passwordHash
    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    // handle duplicate email / barRegNo
    if (err?.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0] || "field";
      return res.status(409).json({ error: `${field} already exists` });
    }
    console.error(err);
    res.status(500).json({ error: "signup_failed" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "email and password required" });

    // 1) find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(401).json({ error: "invalid_credentials" });

    // 2) verify password
    const ok = await user.verifyPassword
      ? user.verifyPassword(password)                 // if you added method
      : (await import("bcryptjs")).default.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "invalid_credentials" });

    // 3) issue a JWT (simple payload for now)
    const token = jwt.sign(
      { sub: user._id.toString(), email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    // 4) return minimal safe info
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "login_failed" });
  }
}

/**
 * GET /auth/me
 * Returns current authenticated user and onboarding completion status
 */
export async function me(req, res) {
  try {
    const user = await User.findById(req.userId)
      .select("name email mobile dob gender barRegNo onboardingCompleted createdAt")
      .lean();
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      dob: user.dob,
      gender: user.gender,
      barRegNo: user.barRegNo,
      onboardingCompleted: !!user.onboardingCompleted,
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error("GET /auth/me error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * PUT /auth/profile
 * Completes lawyer onboarding with Sri Lankan mobile, dob, gender, and BAR reg no
 */
export async function updateProfile(req, res) {
  try {
    const { name, mobile, dob, gender, barRegNo } = req.body;

    if (!mobile || !dob || !gender || !barRegNo) {
      return res.status(400).json({
        error: "Mobile, Date of Birth, Gender, and BAR Association Reg. No. are required",
      });
    }

    if (!sriLankaMobile.test(mobile)) {
      return res.status(400).json({
        error: "Invalid Sri Lankan mobile format. Use 07XXXXXXXX or +947XXXXXXXX",
      });
    }

    // Check if barRegNo is taken by another user
    const existingBar = await User.findOne({
      barRegNo: barRegNo.trim(),
      _id: { $ne: req.userId },
    });
    if (existingBar) {
      return res.status(409).json({ error: "BAR Association Reg. No. already registered" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      {
        ...(name?.trim() ? { name: name.trim() } : {}),
        mobile: mobile.trim(),
        dob: new Date(dob),
        gender,
        barRegNo: barRegNo.trim(),
        onboardingCompleted: true,
      },
      { new: true }
    ).select("name email mobile dob gender barRegNo onboardingCompleted");

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    if (err?.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0] || "field";
      return res.status(409).json({ error: `${field} already exists` });
    }
    console.error("PUT /auth/profile error:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
}