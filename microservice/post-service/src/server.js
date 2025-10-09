import express from "express";
import cors from "cors";
import postRoutes from "./routes/post.routes.js";
import { logger } from "./utils/logger.js";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import helmet from "helmet";
import Redis from "ioredis";
import { RateLimiterRedis } from "rate-limiter-flexible";
import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { RabbitMQconnection } from "./utils/rabbitmq.js";

const app = express();
dotenv.config();
//connect MONGODB
await mongoose
  .connect(`${process.env.MONGODB_URI}`)
  .then(() => logger.info("MongoDB connected SuccessFully"))
  .catch((e) => {
    logger.warn(`Connection Error ${e}`), process.exit(1);
  });
const PORT = process.env.PORT || 3002;

//middleware
app.use(express.json());
app.use(cors());
app.use(cookieParser());
//--------------------------------------
const redisClient = new Redis(process.env.REDIS_URL);
//middleare
app.use(helmet());
//custom middleware
app.use((req, res, next) => {
  logger.info(`Recieved Req : ${req.url}`);
  logger.info("Request body : ", req.body);
  next();
});
//---------------------
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
//--------------------------------------
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
//implemnet IP Based rate limiting for sensitive endpoints
//routes
app.use(
  "/api/post",
  (req, res, next) => {
    req.redisClient = redisClient;
    next();
  },
  postRoutes
);

async function startServer() {
  try {
    await RabbitMQconnection();
    app.listen(PORT, () => {
      logger.info(`Post Server Running on Port : ${PORT}`);
    });
  } catch (error) {
    logger.warn(`Failed to connect with server : ${error}`);
    process.exit(1);
  }
}
startServer();
//unhandeled error
process.on("unhandledRejection", (reason, promise) => {
  logger.error(`Unhandled error : ${reason} due to ${promise}`);
});
