import express from "express"
import { authChecker } from "../middleware/auth.middleware.js"
import { searchPostController } from "../controllers/search.controller.js"
const router = express.Router()
router.get("/find",authChecker,searchPostController)
export default router