import mongoose from "mongoose"
const mediaScehma = new mongoose.Schema({
    publicId:{//for delete or get asset from cloudinary
        type:String,
        required:true
    },
    originalName:{
        type:String,
        required:true
    },
    url:{
        type:String,
        required:true
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    }
},{timestamps:true})

export const Media = mongoose.model("Media",mediaScehma)

//first upload in cliudinary
//than store in DB