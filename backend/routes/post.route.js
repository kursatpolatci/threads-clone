import express from "express"

import { createPost, deletePost, getFeedPosts, getPost, likeUnlikePost, replyToPost } from "../controllers/post.controller.js"
import { protectRoute } from "../middleware/protectRoute.js"

const router = express.Router()

router.post("/create", protectRoute, createPost)
router.get("/post/:id", protectRoute, getPost)
router.delete("/delete/:id", protectRoute, deletePost)
router.post("/like/:id", protectRoute, likeUnlikePost)
router.post("/reply/:id", protectRoute, replyToPost)
router.get("/feed", protectRoute, getFeedPosts)
export default router