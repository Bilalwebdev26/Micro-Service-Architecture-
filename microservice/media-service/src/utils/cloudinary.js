import { v2 as cloudinary } from "cloudinary";
import { logger } from "./logger.js";
import dotenv from "dotenv";
dotenv.config()
// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
export const fileUploadeToCloudinary = async(file)=>{
    return new Promise((resolve,reject)=>{
        const uploadStream = cloudinary.uploader.upload_stream({
            resource_type:'auto'
        },(error, uploadResult)=>{
            if(error){
                logger.error(`Error while uploading : ${error}`)
                reject(error)
            }else{
                //resolve
                resolve(uploadResult)
            }
        })
        uploadStream.end(file.buffer) //stream end here
    })
}
//delete functionallity
export const deleteImgFromCloudinary = async(publicId)=>{
    try {
         const result = await cloudinary.uploader.destroy(publicId)
         logger.info(`Media deleted SuccessFully from cloud storage : ${publicId}`)
         return result
    } catch (error) {
         logger.info(`Error while deleting from cloudinary : ${error}`)
         throw error
    }
}