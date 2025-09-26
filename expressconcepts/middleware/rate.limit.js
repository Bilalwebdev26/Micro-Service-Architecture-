import {rateLimit} from "express-rate-limit"

export const basicRateLimit = (maxRequest,time)=>{
    return rateLimit({
        max:maxRequest,
        windowMs:time,
        message:"Too many Requests,please try again later",
        standardHeaders:true,
        legacyHeaders:false
    })
}