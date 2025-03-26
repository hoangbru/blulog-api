import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import {
  registerValidationSchema,
  loginValidationSchema,
} from "../schemas/auth.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.js";

/**
 * @desc Register a new user
 * @route POST /api/register
 * @access Public
 */
export const register = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    const { error } = registerValidationSchema.validate(
      {
        fullName,
        email,
        password,
      },
      {
        abortEarly: false,
      }
    );
    if (error) {
      return res.status(400).json({
        meta: {
          message: "Validation errors",
          errors: error.details.map((err) => err.message),
        },
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        meta: { message: "Email is already in use", errors: true },
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      meta: { message: "User registered successfully" },
      data: {
        user: { id: user.id, fullName: user.fullName, email: user.email },
      },
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({
      meta: {
        message: "Error registering user",
        errors: error.message || error,
      },
    });
  }
};

/**
 * @desc Login user
 * @route POST /api/login
 * @access Public
 */
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate request body
    const { error } = loginValidationSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({
        meta: {
          message: "Validation errors",
          errors: error.details.map((err) => err.message),
        },
      });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        meta: { message: "Invalid email or password", errors: true },
      });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        meta: { message: "Invalid email or password", errors: true },
      });
    }

    // Generate access token & refresh token
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token in HTTP-Only Cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true, // Prevent XSS attacks
      secure: process.env.NODE_ENV === "production", // Send only in HTTPS in production
      sameSite: "Strict", // Prevent CSRF
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      meta: { message: "Login successful" },
      data: {
        accessToken,
        user: { id: user.id, fullName: user.fullName, email: user.email },
      },
    });
  } catch (error) {
    console.error("Error logging in:", error);
    return res.status(500).json({
      meta: { message: "Error logging in", errors: error.message || error },
    });
  }
};

/**
 * @desc Get user profile
 * @route GET /api/profile
 * @access Private
 */
export const getProfile = async (req, res) => {
  let token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      meta: { message: "Unauthorized" },
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(404).json({
        meta: { message: "User not found", errors: true },
      });
    }

    res.status(200).json({
      meta: { message: "User profile retrieved successfully" },
      data: { user },
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({
      meta: {
        message: "Error fetching profile",
        errors: error.message || error,
      },
    });
  }
};

/**
 * @desc Renew Access Token
 * @route POST /api/refresh-token
 * @access Public
 */
export const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      meta: { message: "Unauthorized", errors: true },
    });
  }

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decoded) => {
      if (err) {
        res.clearCookie("refreshToken");
        return res.status(403).json({
          meta: { message: "Forbidden - Invalid refresh token", errors: true },
        });
      }

      try {
        // Check if user exists
        const user = await User.findById(decoded.id);
        if (!user) {
          res.clearCookie("refreshToken");
          return res.status(403).json({
            meta: { message: "Forbidden - User not found", errors: true },
          });
        }

        // Generate new access token
        const accessToken = jwt.sign(
          { id: user.id },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: process.env.ACCESS_TOKEN_EXPIRE }
        );

        return res.status(200).json({
          meta: { message: "Access token refreshed" },
          data: { accessToken },
        });
      } catch (error) {
        console.error("Error refreshing token:", error);
        return res.status(500).json({
          meta: {
            message: "Error refreshing token",
            errors: error.message || error,
          },
        });
      }
    }
  );
};

/**
 * @desc Logout user (clear refresh token)
 * @route POST /api/logout
 * @access Public
 */
export const logout = (req, res) => {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    return res.status(200).json({
      meta: { message: "Logout successful" },
    });
  } catch (error) {
    console.error("Error logging out:", error);
    return res.status(500).json({
      meta: { message: "Error logging out", errors: error.message || error },
    });
  }
};
