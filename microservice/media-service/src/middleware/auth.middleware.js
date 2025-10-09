import axios from "axios";
import { logger } from "../utils/logger.js";
export const authChecker = async (req, res, next) => {
  //axios -> identity-service ->is user authenticated or not
  try {
    //first logger to check middleware
    logger.info("Auth middleware called");
    //send axios req to identity service
    const headers = {
  Cookie: req.headers.cookie || "",
  Authorization: req.headers.authorization || "",
};
logger.info(`Header : ${JSON.stringify(headers,null,2)}`)
    const data = await axios.get(
      `${process.env.IDENTITY_SERVICE_URL}/api/auth/profile`,
      {headers, withCredentials: true }
    );
    logger.info(`Res : ${JSON.stringify(data.data, null, 2)}`);
    if(!data?.data?.user._id){
        return res.status(400).josn({message:"User not loggedIn"})
    }
    req.user = data?.data?.user
    logger.info(`Req.user : ${JSON.stringify(req.user, null, 2)}`)
    next()
  } catch (error) {
    logger.warn(`Error in authChecker : ${error}`);
    return res
      .status(500)
      .json({ success: false, message: `Internal Server error : ${error}` });
  }
};

// {
//   const userId = req.headers['x-user-id']
//   if(!userId){}
//   req.user = {userId}
//   next()
// }