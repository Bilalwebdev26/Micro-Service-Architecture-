import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser"
import { logger } from "./utils/logger.js";
import helmet from "helmet";
import Redis from "ioredis";
import { RateLimiterRedis } from "rate-limiter-flexible";
import cors from "cors";
import identityRoutes from "./routes/identity.routes.js";
import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { errorHandler } from "./middleware/error-handler.js";
const app = express();
dotenv.config();
//conect db

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    logger.info("DataBase Connected SuccessFully");
  })
  .catch((e) => {
    logger.warn("Data Base Failed to connect : ", e);
    process.exit(1);
  });
const redisClient = new Redis(process.env.REDIS_URL);
//middleare
app.use(helmet());
app.use(cors());
app.use(express.json());
// app.use(cookieParser())
app.use(cookieParser());
//custom middleware
app.use((req, res, next) => {
  logger.info(`Recieved Req : ${req.url}`);
  logger.info("Request body : ", req.body);
  next();
});
//----------------------------------------------------------------
//DDOS protection
const rateLimitedChecker = new RateLimiterRedis({
  storeClient: redisClient,
  duration: 1,
  points: 10,
  keyPrefix: "middleware",
});
app.use((req, res, next) => {
  rateLimitedChecker
    .consume(req.ip)
    .then(() => next())
    .catch((e) => {
      logger.warn(`Maximum Request Exceded for IP: ${req.ip}`);
      res.status(429).json({ success: false, message: "Too many Requests" });
    });
});
//----------------------------------------------------------------
//express rate limit
const endPointLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
  handler: (req, res) => {
    logger.warn(`Sensitive endpoint rate limit exceeded for IP : ${req.ip}`);
    res.status(429).json({ success: false, message: "Too many Requests" });
  },
});
//----------------------------------------------------------------
const PORT = process.env.PORT || 3001;
//routes
app.use("/api/auth/register", endPointLimiter);
app.use("/api/auth", identityRoutes);
//app.use("/api/auth/reguster")

app.use(errorHandler);
app.listen(PORT, () => {
  logger.info(`Server Running on PORT : ${PORT}`);
});
//undhandler promise rejection
process.on("unhandledRejection", (reason, promise) => {
  logger.error(`Unhandled Rejection at : ${promise}, Reason : , ${reason}`);
});
