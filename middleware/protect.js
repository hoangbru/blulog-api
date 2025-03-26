import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

/**
 * Middleware to authenticate user
 */
export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  let token =
    authHeader && authHeader.startsWith("Bearer")
      ? authHeader.split(" ")[1]
      : null;

  if (!token) {
    return res.status(401).json({
      meta: { message: "Unauthorized - No token provided" },
    });
  }

  if (!process.env.ACCESS_TOKEN_SECRET) {
    console.error("ACCESS_TOKEN_SECRET is missing in environment variables");
    return res.status(500).json({
      meta: { message: "Server configuration error" },
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    if (!decoded.id || typeof decoded.id !== "string") {
      return res.status(400).json({
        meta: { message: "Invalid user ID in token" },
      });
    }

    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(404).json({
        meta: { message: "User not found, authentication failed" },
      });
    }

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        meta: { message: "Token expired, please log in again" },
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        meta: { message: "Invalid token, not authorized" },
      });
    }

    console.error("Authentication error:", error);
    return res.status(500).json({
      meta: { message: "Internal server error", error: error.message },
    });
  }
};

/**
 * Middleware to protect admin routes
 */
export const protect = async (req, res, next) => {
  await authenticate(req, res, async () => {
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        meta: { message: "Access forbidden: Admins only" },
      });
    }

    next();
  });
};
