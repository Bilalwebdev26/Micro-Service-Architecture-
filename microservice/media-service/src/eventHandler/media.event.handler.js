import { Media } from "../models/media.model.js";
import { deleteImgFromCloudinary } from "../utils/cloudinary.js";
import { logger } from "../utils/logger.js";

export const handlePostDeleted = async (event) => {
  const { postId, mediaIds } = event;
  try {
    const mediaToDelete = await Media.find({ _id: { $in: mediaIds } });
    //if there is 10 media ids than delete all 10
    for(const media of mediaToDelete){
        //first delete from cloudinary
        await deleteImgFromCloudinary(media.publicId)
        //than delete from database
        await Media.findByIdAndDelete(media._id)
        logger.info(`SuccessFully delete both from DB and cloudinary media id : ${media._id}`)
    }
    logger.info(`Proccess Deleting Media is SuccessFull with postid ${postId}`)
  } catch (error) {
    logger.error(`Error while handling delete Media`);
  }
};

