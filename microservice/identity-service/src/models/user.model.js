import mongoose from "mongoose";
import argon2 from "argon2";

// 1️⃣ Define the schema
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // 🚫 don't return password in queries by default
    },
  },
  { timestamps: true }
);

// 2️⃣ Pre-save middleware → hash password before saving
userSchema.pre("save", async function (next) {
  // If password field was NOT modified, skip hashing
  if (!this.isModified("password")) return next();

  try {
    this.password = await argon2.hash(this.password);
    next();
  } catch (err) {
    next(err);
  }
});

// 3️⃣ Add a method to verify password
userSchema.methods.comparePassword = async function (plainPassword) {
  try {
    return await argon2.verify(this.password, plainPassword);
  } catch (error) {
    throw error;
  }
};

userSchema.index({ username: "text" });

// 4️⃣ Export model
const User = mongoose.model("User", userSchema);
export default User;
