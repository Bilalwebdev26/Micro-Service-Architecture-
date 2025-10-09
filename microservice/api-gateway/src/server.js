import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import Redis from "ioredis";
import helmet from "helmet";
import proxy from "express-http-proxy";
import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { logger } from "./middleware/logger.js";
import { errorHandler } from "./middleware/error-handler.js";
import { methodology } from "./middleware/method.js";
const app = express();
dotenv.config();

const PORT = process.env.PORT || 3000;

const redisClient = new Redis(process.env.REDIS_URL);
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use((req, res, next) => {
  logger.info(`Recieved Req : ${req.url}`);
  logger.info("Request body : ", req.body);
  next();
});
logger.info(`Identity Url : ${process.env.IDENTITY_SERVICE_URL}`);
logger.info(`Post Url : ${process.env.POST_SERVICE_URL}`);
logger.info(`Media Url : ${process.env.MEDIA_SERVICE_URL}`);

//rate limit
// Create and use the rate limiter
const limiter = rateLimit({
  // Rate limiter configuration
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers

  // Redis store configuration
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
});
app.use(limiter);
//proxy middleware
const proxyOptions = {
  proxyReqPathResolver: (req) => {
     return req.originalUrl.replace(/^\/v1/, "/api");
    //  return req.originalUrl.replace(/^\/v1/, "/api");
  },
  proxyErrorHandler: (err, req, res) => {
    logger.error(`Proxy Error : ${err.message}`);
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  },
};
//setting up proxy for identity-service
app.use(
  "/v1/auth",
  proxy(process.env.IDENTITY_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      proxyReqOpts.headers["Content-Type"] = "application/json";
      logger.info(`proxyReqOpts : ${JSON.stringify(proxyReqOpts, null, 2)}`);
      return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(`Response recieved from post service ${proxyRes.statusCode}`);
      logger.info(`proxyResData : ${proxyResData}`);
      return proxyResData;
    },
  })
);
//setting up proxy for post-service
app.use(
  "/v1/post",
  proxy(process.env.POST_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      proxyReqOpts.headers["Content-Type"] = "application/json";
      return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(`Response recieved from post service ${proxyRes.statusCode}`);
      return proxyResData;
    },
  })
);
//setting up proxy for search-service
app.use(
  "/v1/search",
  proxy(process.env.SEARCH_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      proxyReqOpts.headers["Content-Type"] = "application/json";
      return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(`Response recieved from post service ${proxyRes.statusCode}`);
      return proxyResData;
    },
  })
);
//set up proxy for media routes
app.use(
  "/v1/media",
  proxy(process.env.MEDIA_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      //as you know media is for file upload so change header according to req
      if (!srcReq.headers["content-type"].startsWith("multipart/form-data")) {
        proxyReqOpts.headers["Content-Type"] = "application/json";
      }
      return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(
        `Response recieved from media service ${proxyRes.statusCode}`
      );
      return proxyResData;
    },
    parseReqBody:false
  })
);
//error handler
app.use(errorHandler);
app.listen(PORT, () => {
  logger.info(`Server Running on PORT : ${PORT}`);
  logger.info(
    `Identity service Running on PORT : ${process.env.IDENTITY_SERVICE_URL}`
  );
  logger.info(`Post service Running on PORT : ${process.env.POST_SERVICE_URL}`);
  logger.info(
    `Media service Running on PORT : ${process.env.MEDIA_SERVICE_URL}`
  );
  logger.info(`Redis Running on PORT : ${process.env.REDIS_URL}`);
});

//undhandler promise rejection
process.on("unhandledRejection", (reason, promise) => {
  logger.warn(`Uhdandled Rejection at  ${promise} , Reason : ${reason}`);
});
