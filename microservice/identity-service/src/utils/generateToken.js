import RefreshToken from "../models/refreshToken.model.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
export const generateToken = async(user) => {
  const accessToken = jwt.sign(
    {
      userId: user._id,
      username: user.username,
    },
    process.env.JWT_SECRET,
    { expiresIn: "60min" }
  );
  const refreshToken = crypto.randomBytes(40).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); //valid for next 7 Days
  await RefreshToken.create({
    user:user.id,
    token:refreshToken,
    expiresAt
  })
  return {
    accessToken,
    refreshToken,
  };
};
