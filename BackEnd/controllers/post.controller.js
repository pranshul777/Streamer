const AsyncWrapper = require('../utils/AsyncWrapper.js');
const {ApiError,customApiError} = require('../utils/ApiError.js');
const {unprocessableContent,badRequest,notAvailable,notFound,serviceUnavailable,unauthorised, forbidden}= require('../utils/errors/error.js');
const user = require('../models/user.model.js');
const video = require('../models/video.model.js');
const playlist = require('../models/playlist.model.js');
const comment = require('../models/comment.model.js');
const post = require('../models/post.model.js');
const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");
const {
    imageUploader,
    deleteImage,
} = require('../utils/Cloudinary.js');
const uploadPost = AsyncWrapper(async (req, res, next) => {
    const User = await user.findById(req.user);
    if (!User) {
        return next(customApiError(500, "User not found"));
    }

    const { title, description } = req.body;
    if (!title || !description) {
        return next(unprocessableContent());
    }

    if (!req.file) {
        return next(customApiError(400, "Files are missing"));
    }

    const { url,public_id} = await imageUploader(req.file?.path, next);
    if(!url){
        return next(customApiError(500, "Image URL couldn't be received"));
    }

    const postDoc = await post.create({
        title,
        description,
        owner: User._id,
        image: { url, publicId:public_id },
    });

    if (!postDoc) {
        return next(customApiError(500, "Post couldn't be uploaded to the database"));
    }

    User.posts.push(postDoc._id);
    await User.save();

    res.status(200).json({
        status: "success",
        message: "post uploaded",
    });
});

const deletePost = AsyncWrapper(async (req, res, next) => {
    const User = await user.findById(req.user);
    if (!User) {
        return next(customApiError(500, "User not found"));
    }

    const postId = req.params.id;

    // Remove post reference from User
    User.posts.pull(postId);
    await User.save();

    // Find the post by id
    const Post = await post.findById(postId);
    if (!Post) {
        return next(customApiError(404, "Post not found"));
    }

    // Get the public_id of the image for deletion from cloud storage
    const public_id = Post.image?.publicId;
    if (!public_id) {
        return next(customApiError(500, "Image public ID not found"));
    }

    // Delete the post document from the database
    await post.findByIdAndDelete(postId);

    // Delete the image file from the cloud storage (e.g., Cloudinary)
    await deleteImage(public_id);

    // Send response
    return res.status(200).json({ "status": "success", "message": "Post deleted successfully" });
});

const changeImage = AsyncWrapper(async (req, res, next) => {
    const postId = req.params.id;
    
    // Find post
    const Post = await post.findById(postId);
    if (!Post) {
        return next(customApiError(404, "Post not found"));
    }

    // Get the post's current image public_id
    const public_id = Post.image?.publicId;
    if (public_id) {
        // Delete existing image
        await deleteImage(public_id);
    }

    // Upload new image
    const { url, publicid } = await imageUploader(req.file?.path, next);
    if (!url) {
        return next(customApiError(500, "Image URL couldn't be received"));
    }

    // Update the post with the new image
    Post.image = { url, publicId: publicid };
    await Post.save();

    return res.status(200).json({ "status": "success", "message": "Image updated successfully" });
});

const editPost = AsyncWrapper(async (req,res,next)=>{
    const {title,description}=req.body;
    const postId = req.params.id;

    const Post = await post.findById(postId);
    if(!Post){
        return next(customApiError(500,"Post couldn't recieved"));
    }

    Post.title=title;
    Post.description=description;
    await Post.save();

    return res.status(200).json({"status":"success","message":"post edited successfully"}); 
});

const likePost = AsyncWrapper(async (req,res,next)=>{
    const id = req.params.id;
    const Post = await post.findById(id);
    if(!Post){
        return next(customApiError(500,"Post not found"));
    }

    
    if (Post.likedBy.includes(req.user)) {
        return next(badRequest());
    }

    Post.likedBy.push(req.user);
    await Post.save();

    return res.status(200).json({"status":"Success","Message":"post got liked"});
})

const unlikePost = AsyncWrapper(async (req,res,next)=>{
    const id = req.params.id;
    const Post = await post.findById(id);
    if(!Post){
        return next(customApiError(500,"Post not found"));
    }

    
    if (!Post.likedBy.includes(req.user)) {
        return next(badRequest());
    }

    Post.likedBy.pull(req.user);
    await Post.save();

    return res.status(200).json({"status":"Success","Message":"post got unliked"});
});

const makeComment = AsyncWrapper(async (req, res, next) => {
    const id = req.params.id;

    // Check if the provided post ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(badRequest("Invalid Post ID"));
    }

    // Find the post to comment on
    const Post = await post.findById(id);
    if (!Post) {
        return next(customApiError(404, "Post not found"));
    }

    // Validate comment content
    const content = req.body.content?.trim(); // Trim to avoid empty spaces
    if (!content) {
        return next(badRequest("Comment content cannot be empty"));
    }

    // Create the comment
    const Comment = await comment.create({
        content,
        owner: req.user, 
        atPost: id
    });

    // Add the comment to the post
    Post.comments.push(Comment._id);
    await Post.save();

    return res.status(201).json({
        status: "success",
        message: "Comment created successfully"
    });
});

module.exports = {uploadPost, changeImage, deletePost, editPost, likePost, unlikePost,makeComment};