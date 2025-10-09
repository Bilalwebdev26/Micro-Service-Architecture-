
import { Search } from "../models/search.model.js";
import { logger } from "../utils/logger.js";

export const handlePostCreateInSearch = async (event) => {
  const { postId, userId,content } = event;
  try {
   const createPost = await Search.create({
    postId,
    userId,
    content
   })
   logger.info(`Search Post created : ${postId}`)
  } catch (error) {
    logger.error(`Error while handling Create search post`);
  }
};
export const handleDeleteFromSearch = async(event)=>{
  const{postId}=event
  console.log("PostId : ",postId)
  if(!postId){
    return
  }
  try {
    const result = await Search.findOneAndDelete({postId})
    if(!result){
      logger.info("Error while deleting Search Post")
      return
    }
     logger.info(`SuccessFully delete Search Post : ${postId}`)
  } catch (error) {
    logger.error(`Error while handling delete search post`);
  }
}

