import { logger } from "./logger.js"

export const methodology = (req,res,next)=>{
    logger.info(`Req header : ${JSON.stringify(req?.headers['authorization'],null,2)}`)
    next()
}