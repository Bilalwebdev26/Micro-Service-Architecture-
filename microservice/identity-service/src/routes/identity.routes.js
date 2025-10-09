import express from "express"
import { registerUser, userProfile } from "../controllers/identity.controller.js"
import { authMiddleware } from "../middleware/auth.middleware.js"
const router = express.Router()

router.post("/register",registerUser)
router.get("/profile",authMiddleware,userProfile)

export default router