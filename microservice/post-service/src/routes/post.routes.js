import express from "express"
import { createPost, deletePost, getAllPost, getPost } from "../controllers/post.controller.js"
import { authChecker } from "../middleware/auth.middleware.js"
const router = express.Router()

//all authenticated routes
router.use(authChecker)

router.post("/createUserPost",createPost)
router.get("/posts",getAllPost)
router.get("/one-post/:id",getPost)
router.delete("/delete-post/:id",deletePost)

export default router