import bcryptjs from "bcryptjs"

import User from "../models/user.model.js"
import generateTokenAndSetCookie from "../utils/generateTokenAndSetCookie.js"

export const signupUser = async (req, res) => {
    try {
        const { email, username, name, password } = req.body

        const user = await User.findOne({
            $or: [
                { email },
                { username }
            ]
        })
        if (user) {
            return res.status(400).json({ success: false, message: "User already exists" })
        }

        const salt = await bcryptjs.genSalt(10)
        const hashedPassword = await bcryptjs.hash(password, salt)

        const newUser = new User({
            name,
            username,
            email,
            password: hashedPassword
        })

        await newUser.save();

        if (newUser) {
            generateTokenAndSetCookie(newUser._id, res)

            res.status(201).json({
                success: true,
                message: "User created successfully",
                user: {
                    ...newUser._doc,
                    password: undefined
                }
            })
        } else {
            res.status(400).json({ success: false, message: "Invalid user data" })
        }
    } catch (error) {
        console.log(`Error in signup controller: ${error.message}`)
        res.status(500).json({ success: false, message: error.message })
    }
}

export const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body

        const user = await User.findOne({ username })
        const isPasswordCorrect = await bcryptjs.compare(password, user?.password || "")

        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" })
        }
        else if (!isPasswordCorrect) {
            return res.status(400).json({ success: false, message: "Invalid password" })
        }

        generateTokenAndSetCookie(user._id, res)

        res.status(200).json({
            success: true,
            message: "Login successfully",
            user: {
                ...user._doc,
                password: undefined
            }
        })
    } catch (error) {
        console.log(`Error in login controller: ${error.message}`)
        res.status(500).json({ success: false, message: error.message })
    }
}

export const logoutUser = async (req, res) => {
    try {
        res.clearCookie("token")
        res.status(200).json({
            success: true,
            message: "Logout successfully"
        })
    } catch (error) {
        console.log(`Error in logout controller: ${error.message}`)
        res.status(500).json({ success: false, message: error.message })
    }
}

export const followUnfollowUser = async (req, res) => {
    try {
        const { id: followId } = req.params
        const userId = req.userId

        const userToModify = await User.findById(followId)
        const currentUser = await User.findById(userId)

        if (followId === userId.toString()) {
            return res.status(400).json({ success: false, message: "You cannot follow/unfollow yourself" })
        }

        if (!userToModify || !currentUser) {
            return res.status(400).json({ success: false, message: "User not found" })
        }

        const isFollowing = currentUser.following.includes(followId)
        if (isFollowing) {
            await User.findByIdAndUpdate(followId, { $pull: { followers: userId } })
            await User.findByIdAndUpdate(userId, { $pull: { following: followId } })
            res.status(200).json({ success: true, message: "User unfollowed successfully" })
        } else {
            await User.findByIdAndUpdate(followId, { $push: { followers: userId } })
            await User.findByIdAndUpdate(userId, { $push: { following: followId } })
            res.status(200).json({ success: true, message: "User followed successfully" })
        }
    } catch (error) {
        console.log(`Error in followUnfollowUser controller: ${error.message}`)
        res.status(500).json({ success: false, message: error.message })
    }
}

export const updateUser = async (req, res) => {
    try {
        const userId = req.userId;
        const { name, email, username, password, profilePic, bio} = req.body

        if (req.params.id !== userId.toString()) {
            return res.status(400).json({success: false, message: "You cannot update other user's profile"})
        }

        let user = await User.findById(userId)
        if (!user) {
            return res.status(400).json({success: false, message: "User not found"})
        }

        if (password) {
            const salt = await bcryptjs.genSalt(10)
            const hashedPassword = await bcryptjs.hash(password, salt)
            user.password = hashedPassword
        }

        user.name = name || user.name
        user.email = email || user.email
        user.username = username || user.username
        user.profilePic = profilePic || user.profilePic
        user.bio = bio || user.bio

        await user.save()

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: {
                user,
                password: undefined
            }
        })
    } catch (error) {
        console.log(`Error in updateUser controller: ${error.message}`)
        res.status(500).json({ success: false, message: error.message })
    }
}

export const getUserProfile = async (req, res) => {
    try {
        const { username }= req.params;

        const user = await User.findOne({username}).select("-password").select("-updatedAt")
        if (!user) {
            return res.status(400).json({success: false, message: "User not found"})
        }

        res.status(200).json({
            success: true,
            user: user
        })
    } catch (error) {
        console.log(`Error in getUserProfile controller: ${error.message}`)
        res.status(500).json({ success: false, message: error.message })
    }
}