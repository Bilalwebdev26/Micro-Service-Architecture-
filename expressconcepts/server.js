import express from "express";
import dotenv from "dotenv";
import { configureCors } from "./config/corsConfig.js";
import { addTimeStamp, requestLogger } from "./middleware/custom.middleware.js";
import { globalErrorHandler } from "./middleware/errorHandler.js";
import { urlVersioning } from "./middleware/apiVersioning.js";
import { basicRateLimit } from "./middleware/rate.limit.js";
import itemRoutes from "./routes/item.routes.js"
const app = express();
dotenv.config()
const PORT = process.env.PORT || 3000;
//custom middleware
app.use(requestLogger)
app.use(addTimeStamp)
//pre define middleware
app.use(configureCors());
//rate limiting
app.use(basicRateLimit(100,15*60*1000))//100 requests -> 15min
app.use(express.json());
//url versioning
app.use(urlVersioning("v1"))
app.use("/api/v1",itemRoutes)
//global error handler
app.use(globalErrorHandler)
app.listen(PORT, () => {
  console.log("Server Running on PORT", process.env.PORT);
});
