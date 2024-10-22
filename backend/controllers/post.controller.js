import User from "../models/user.model.js"
import Post from "../models/post.model.js"

export const createPost = async (req, res) => {
    try {
        const { postedBy, text, img } = req.body
        const userId = req.userId

        if (!postedBy || !text) {
            return res.status(400).json({ success: false, message: "Postedby and text field are required" })
        }

        const user = await User.findById(postedBy)
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" })
        }

        if (user._id.toString() !== userId.toString()) {
            return res.status(401).json({ success: false, message: "Unauthorized to create post" })
        }

        const maxLength = 1500
        if (text.length > maxLength) {
            return res.status(400).json({ message: `Text must be less than ${maxLength} characters` })
        }

        const newPost = new Post({
            postedBy,
            text,
            img
        })

        await newPost.save()
        res.status(201).json({
            success: true,
            message: "Post created successfully",
            post: newPost
        })
    } catch (error) {
        console.log(`Error in createPost controller: ${error.message}`)
        res.status(500).json({ success: false, message: error.message })
    }
}

export const getPost = async (req, res) => {
    try {
        const { id: postId } = req.params

        const post = await Post.findById(postId)
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" })
        }

        res.status(200).json({ post })
    } catch (error) {
        console.log(`Error in getPost controller: ${error.message}`)
        res.status(500).json({ success: false, message: error.message })
    }
}

export const deletePost = async (req, res) => {
    try {
        const { id: postId } = req.params
        const userId = req.userId

        const post = await Post.findById(postId)
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" })
        }

        if (post.postedBy.toString() !== userId.toString()) {
            return res.status(401).json({ success: false, message: "Unauthorized to delete post" })
        }

        await Post.findByIdAndDelete(postId)

        res.status(200).json({ success: true, message: "Post deleted successfully" })
    } catch (error) {
        console.log(`Error in deletePost controller: ${error.message}`)
        res.status(500).json({ success: false, message: error.message })
    }
}

export const likeUnlikePost = async (req, res) => {
    try {
        const { id: postId } = req.params
        const userId = req.userId

        const post = await Post.findById(postId)
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" })
        }

        const userLikedPost = post.likes.includes(userId)
        if (userLikedPost) {
            await Post.updateOne({ _id: postId }, { $pull: { likes: userId } })
            res.status(200).json({ success: true, message: "Post unliked successfully" })
        } else {
            await Post.updateOne({ _id: postId }, { $push: { likes: userId } })
            res.status(200).json({ success: true, message: "Post liked successfully" })
        }
    } catch (error) {
        console.log(`Error in likeUnlikePost controller: ${error.message}`)
        res.status(500).json({ success: false, message: error.message })
    }
}

export const replyToPost = async (req, res) => {
    try {
        const { text } = req.body
        const { id: postId } = req.params
        const userId = req.userId

        if (!text) {
            return res.status(400).json({ success: false, message: "Text field is required" })
        }

        const post = await Post.findById(postId)
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" })
        }

        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" })
        }

        const userProfilePic = user.profilePic
        const username = user.username
        const reply = { userId, text, userProfilePic, username }

        post.replies.push(reply)
        await post.save()

        res.status(200).json({
            success: true,
            message: "Reply added successfully",
            post: post
        })
    } catch (error) {
        console.log(`Error in replyToPost controller: ${error.message}`)
        res.status(500).json({ success: false, message: error.message })
    }
}

export const getFeedPosts = async (req, res) => {
    try {
        const userId = req.userId;

        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({success: false, message: "User not found"})
        }

        console.log(user)
        const following = user.following;
        const feedPosts = await Post.find({postedBy: {$in: following}})
        .sort({createdAt: -1})

        res.status(200).json({feedPosts})
    } catch (error) {
        console.log(`Error in getFeedPosts controller: ${error.message}`)
        res.status(500).json({ success: false, message: error.message })
    }
}