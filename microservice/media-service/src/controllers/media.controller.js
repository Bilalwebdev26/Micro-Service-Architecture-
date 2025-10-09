import { Media } from "../models/media.model.js";
import {
  deleteImgFromCloudinary,
  fileUploadeToCloudinary,
} from "../utils/cloudinary.js";
import { logger } from "../utils/logger.js";

export const uploadMedia = async (req, res) => {
  logger.info("Starring media uplaod");
  try {
    console.log("File upload : ", req.file);
    if (!req.file) {
      logger.error("No file present Please add or upload file.");
      return res
        .status(400)
        .json({ success: false, message: "File not uploaded." });
    }
    const { originalname, mimetype, buffer } = req.file;
    logger.info(
      `File Details -> File Name : ${originalname} Type : ${mimetype}`
    );
    logger.info(`Uploading to CLoudinary....`);
    const cloudinaryUploadResult = await fileUploadeToCloudinary(req.file);
    logger.info(
      `Cloudinary upload successfully . Public Id : ${cloudinaryUploadResult.public_id}`
    );
    //After successFully Added to cloudianry now add in Our DB
    const newlyCreateMedia = new Media({
      publicId: cloudinaryUploadResult.public_id,
      originalName: originalname,
      url: cloudinaryUploadResult.secure_url,
      userId: req?.user._id,
      mimetype,
    });
    await newlyCreateMedia.save();
    return res.status(201).json({
      success: true,
      message: "File added SuccessFully",
      mediaId: newlyCreateMedia.id,
      url: newlyCreateMedia.url,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: `Internal Server Error : ${error}` });
  }
};
export const getAllMedia = async (req, res) => {
  try {
    const media = await Media.find({});
    if(!media){
      return res
      .status(400)
      .json({ success: false, message: `Error while getting media` });
    }
    return res.status(200).json({ data:media });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: `Internal Server Error : ${error}` });
  }
};

export const deleteMedia = async (req, res) => {
  try {
    await deleteImgFromCloudinary(req.body.publicId);
  } catch (error) {}
};
