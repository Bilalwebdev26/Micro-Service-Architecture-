import { Search } from "../models/search.model.js";
import { logger } from "../utils/logger.js";

export const searchPostController = async (req, res) => {
  logger.info("Search Post controller hit...");
  try {
    //by qyery
    const {query} = req.query;
    console.log("Query : ",query)
    const result = await Search.find(
      {
        $text: { $search: query },
      },
      {
        score: { $meta: "textScore" },
      }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(10);
    if(result.length < 1){
        return res.status(400).json({message:"No Post found"})
    }  
    return res.json({ result });
  } catch (error) {
    logger.error("Error while search post", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error while search POST",
    });
  }
};
