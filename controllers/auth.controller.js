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
import { sendEmail } from "../utils/sendMail.js";

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
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
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

/**
 * @desc Get list of users
 * @route GET /api/users
 * @access Private (Admin only)
 */
export const list = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({
      meta: { message: "User list retrieved successfully" },
      data: { users },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      meta: { message: "Error fetching users", errors: error.message || error },
    });
  }
};

/**
 * @desc Update user status
 * @route PATCH /api/users/:id/status
 * @access Private
 */
export const updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["active", "inactive"].includes(status)) {
    return res.status(400).json({
      meta: { message: "Invalid status", errors: true },
    });
  }

  try {
    const user = await User.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        meta: { message: "User not found", errors: true },
      });
    }

    res.status(200).json({
      meta: { message: "User status updated successfully" },
      data: { user },
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({
      meta: { message: "Error updating user status", errors: error.message },
    });
  }
};

/**
 * @desc Update user information
 * @route PUT /api/users/:id
 * @access Private (User only)
 */
export const update = async (req, res) => {
  const { id } = req.params;
  const { fullName, phone, address, avatar } = req.body;

  try {
    // Validate phone number format if provided
    if (phone && !/^\+?[1-9]\d{1,14}$/.test(phone)) {
      return res.status(400).json({
        meta: { message: "Invalid phone number format", errors: true },
      });
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      id,
      { fullName, phone, address, avatar },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        meta: { message: "User not found", errors: true },
      });
    }

    return res.status(200).json({
      meta: { message: "User profile updated successfully" },
      data: { user },
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({
      meta: { message: "Error updating user", errors: error.message || error },
    });
  }
};

/**
 * @desc Delete user
 * @route DELETE /api/users/:id
 * @access Private (Admin only)
 */
export const remove = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({
        meta: { message: "User not found", errors: true },
      });
    }

    res.status(200).json({
      meta: { message: "User deleted successfully" },
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      meta: { message: "Error deleting user", errors: error.message },
    });
  }
};

/**
 * @desc Send reset password link
 * @route POST /api/auth/forgot-password
 * @access Public
 */
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        meta: { message: "User not found", errors: true },
      });
    }

    // Generate reset token (expires in 15 minutes)
    const token = jwt.sign({ id: user._id }, process.env.RESET_TOKEN_SECRET, {
      expiresIn: process.env.RESET_TOKEN_EXPIRE,
    });

    // Send email with reset link
    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
    await sendEmail(
      email,
      "Password Reset Request",
      "",
      `<p>Click <a href="${resetLink}">here</a> to reset your password. This link will expire in 15 minutes.</p>`
    );

    res.status(200).json({
      meta: { message: "Password reset link sent successfully" },
    });
  } catch (error) {
    console.error("Error sending password reset email:", error);
    res.status(500).json({
      meta: { message: "Error sending password reset email", errors: error },
    });
  }
};

/**
 * @desc Reset user password
 * @route POST /api/auth/reset-password
 * @access Public
 */
export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.RESET_TOKEN_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({
        meta: { message: "User not found", errors: true },
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.findByIdAndUpdate(user._id, { password: hashedPassword });

    res.status(200).json({
      meta: { message: "Password reset successfully" },
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(400).json({
      meta: { message: "Invalid or expired token", errors: true },
    });
  }
};
