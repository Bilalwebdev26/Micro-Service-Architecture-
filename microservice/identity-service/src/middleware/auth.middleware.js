import User from "../models/user.model.js";
import { logger } from "../utils/logger.js";
import jwt from "jsonwebtoken";
export const authMiddleware = async (req, res, next) => {
  try {
    //work in auth middleare
    // logger.info(JSON.stringify(req))
    const token = req.cookies.accessToken;
    //check there is token or noy
    if (!token) {
      return res
        .status(400)
        .json({ success: false, message: `Token not found` });
    }
    //token -> orignal to get user id
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    if (!decodedToken) {
      return res
        .status(400)
        .json({ success: false, message: `Token is not valid or expired` });
    }
    logger.info(`Decoded Token: ${JSON.stringify(decodedToken, null, 2)}`);
    const user = await User.findById(decodedToken.userId);
    logger.info("User",user);
    req.user = user;
     next()
    //return res.status(200).json({ message: `Access Token : `, token ,user});
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: `Internal Server Error : ${error}` });
  }
};
