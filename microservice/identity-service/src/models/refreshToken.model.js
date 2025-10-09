import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // 👈 Linked to the User model
      required: true,
    },

    token: {
      type: String, // 👈 The actual refresh token string
      required: true,
      unique: true,
    },

    expiresAt: {
      type: Date, // 👈 Expiry time of the token
      required: true,
    },
  },
  { timestamps: true }
);

refreshTokenSchema.index({ expiresAt: 1 }, { expiresAfterSecond: 0 });

const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);
export default RefreshToken;
