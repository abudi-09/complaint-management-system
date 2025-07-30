import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateTokenAndSetCookie } from "../utils/generateToken.js";

// Signup
export const signup = async (req, res) => {
  try {
    const { name, username, email, password, role } = req.body;

    const allowedRoles = ["user", "staff"];
    if (!allowedRoles.includes(role)) {
      // Only allow 'user' and 'staff' roles
      return res.status(400).json({ error: "Invalid role selected" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username is already taken" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: "Email is already taken" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters long" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      username,
      email,
      password: hashedPassword,
      role,
    });

    await newUser.save();

    // Don't generate token if staff is not approved yet
    if (newUser.role === "staff" && !newUser.isApproved) {
      return res.status(201).json({
        message:
          "Staff registration successful. Please wait for admin approval.",
      });
    }

    generateTokenAndSetCookie(newUser._id, res); // Generate token and set cookie
    // Return user details without password
    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      isApproved: newUser.isApproved,
    });
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "Invalid email" });
    }

    // Block login if staff is not approved
    if (user.role === "staff" && !user.isApproved) {
      return res
        .status(403)
        .json({ error: "Your account is pending admin approval." });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user?.password || ""
    );
    if (!isPasswordCorrect) {
      return res.status(400).json({ error: "Invalid  password" });
    }

    generateTokenAndSetCookie(user._id, res);
    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      role: user.role,
      isApproved: user.isApproved,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Logout
export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getMe = async (req, res) => {
  try {
    // req.user should be set by protectRoute middleware
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    // Remove sensitive info
    const {
      _id,
      fullName,
      username,
      name,
      email,
      role,
      department,
      isApproved,
    } = req.user;
    res.status(200).json({
      _id,
      fullName,
      username,
      name,
      email,
      role,
      department,
      isApproved,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
