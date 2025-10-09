import express from "express";
import multer from "multer";
import { logger } from "../utils/logger.js";
import { authChecker } from "../middleware/auth.middleware.js";
import { getAllMedia, uploadMedia } from "../controllers/media.controller.js";
const router = express.Router();

// router.use(authChecker);

//configure multer for file upload

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 mb
  },
}).single("file");
router.get("/get",authChecker,getAllMedia)
router.get("/",getAllMedia)
router.post(
  "/upload",
  authChecker,
  (req, res, next) => {
    upload(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        logger.info(`Multer error while uploading : ${err}`);
        return res.status(400).json({
          success: false,
          message: "Multer error while uploading",
          error: err.message,
          stack: err.stack,
        });
      } else if (err) {
        //if err is not instance of multer.MulterError
        logger.info(`Unknown error while uploading : ${err}`);
        return res.status(500).json({
          success: false,
          message: "Unknown error while uploading",
          error: err.message,
          stack: err.stack,
        });
      }
      if (!req.file) {
        logger.info(`No File uploaded.`);
        return res.status(400).json({
          success: false,
          message: "No File uploaded.",
        });
      }
      next();
    });
  },
  uploadMedia
);


export default router;
