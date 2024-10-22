import express from "express"

import { followUnfollowUser, getUserProfile, loginUser, logoutUser, signupUser, updateUser } from "../controllers/user.controller.js"
import { protectRoute } from "../middleware/protectRoute.js"

const router = express.Router()

router.post("/signup", signupUser)
router.post("/login", loginUser)
router.post("/logout", logoutUser)
router.post("/follow/:id", protectRoute, followUnfollowUser)
router.post("/update/:id", protectRoute, updateUser)
router.get("/profile/:username", protectRoute, getUserProfile)

export default router