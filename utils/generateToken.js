import jwt from "jsonwebtoken";

// Generate Access Token (Expires after 15 minutes)
export const generateAccessToken = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRE }
  );

  return accessToken;
};

// Generate Refresh Token (Expires after 7 days)
export const generateRefreshToken = (user) => {
  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRE }
  );

  return refreshToken;
};
