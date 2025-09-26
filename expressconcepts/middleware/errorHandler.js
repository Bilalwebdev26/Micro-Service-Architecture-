//custom error class
export class APIError extends Error {
  //build in error class
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = "APIError"; //set the error type APIError
  }
}

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const globalErrorHandler = (err,req,res,next)=>{
    console.error(err.stack) //log the error stack
    if(err instanceof APIError){
        return res.status(err.statusCode).json({
            status:"Error",
            message:err.message
        })
    }
    //handle mongoose validation
    else if(err.name === "validationError"){
        return res.status(400).json({
            status:"error",
            message:"validation Error"
        })
    }else{
        return res.status(500).json({
            status:"error",
            message:"An unexpected Error occured"
        })
    }
}