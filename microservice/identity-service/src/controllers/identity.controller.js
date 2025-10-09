import User from "../models/user.model.js";
import { generateToken } from "../utils/generateToken.js";
import { logger } from "../utils/logger.js";
import { validationRegistration } from "../utils/validation.js";

//user-registration
export const registerUser = async (req, res) => {
  logger.info("Registeration End Point Hit...");
  try {
    const { error } = validationRegistration(req.body);
    if (error) {
      logger.warn(
        `Registration Validation Error : ${error.details[0].message}`
      );
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }
    const { username, email, password } = req.body;
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      logger.warn("User already with this email");
      return res.status(409).json({
        success: false,
        message: "User Already Exist with this email",
      });
    }
    //if user not exist create new user
    user = new User({
      username,
      email,
      password,
    });
    await user.save();
    logger.info("User created SuccessFully", user._id);
    //after creating User create jwt tokens
    const { accessToken, refreshToken } = await generateToken(user);
    //cookieOptions
    let options = {
      maxAge: 1000 * 60 * 15, // would expire after 15 minutes
      httpOnly: true, // The cookie only accessible by the web server
      signed: false, // Indicates if the cookie should be signed
    };
    //set in access token cookies
    res.cookie("accessToken", accessToken, options);
    //set in refresh token cookies
    // res.cookie("refreshToken",refreshToken,options)
    return res.status(201).json({
      success: true,
      message: "User Created SuccessFully",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    logger.error("Registeration Error Found : ", error);
    return res.status(500).json({
      success: false,
      message: "Error while registeration User",
    });
  }
};
//userprofile
export const userProfile = async (req, res) => {
  try {
    logger.info("Profile api hit")
    const user = await User.findById(req.user._id);
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User is logout" });
    }
    return res.status(200).json({
      success: true,
      message: "User Found SuccessFully",
      user,
    });
  } catch (error) {
    logger.error("Profile Error Found : ", error);
    return res.status(500).json({
      success: false,
      message: "Error while show profile User",
    });
  }
};
//user-login

//refresh token
//logout user
