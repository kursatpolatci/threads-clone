import jwt from "jsonwebtoken"

import User from "../models/user.model.js"

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.token
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: No token provided"
            })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Invalid Token"
            })
        }

        const user = await User.findById(decoded.userId).select("-password")
        
        req.userId = user._id
        next()
    } catch (error) {
        console.log(`Error in protectRoute middleware: ${error.message}`)
        res.status(500).json({success: false, message: error.message })
    }
}