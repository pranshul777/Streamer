const AsyncWrapper = require('../utils/AsyncWrapper.js');
const {ApiError,customApiError} = require('../utils/ApiError.js');
const {unprocessableContent,badRequest,notAvailable,notFound,serviceUnavailable,unauthorised, forbidden}= require('../utils/errors/error.js');
const user = require('../models/user.model.js');
const video = require('../models/video.model.js');
const playlist = require('../models/playlist.model.js');
const comment = require('../models/comment.model.js');
const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");
const {
    imageUploader,
    videoUploader,
    deleteImage,
    deleteVideo
} = require('../utils/Cloudinary.js');

const uploadVideo = AsyncWrapper(async (req, res, next) => {
    const User = await user.findById(req.user);
    if (!User) {
        return next(customApiError(500, "User not found"));
    }

    const { title, description } = req.body;
    if (!title || !description) {
        return next(unprocessableContent());
    }

    if (!req.files?.thumbnail || !req.files?.video) {
        return next(customApiError(400, "Files are missing"));
    }

    const { url: urlT, public_id: public_idT } = await imageUploader(req.files.thumbnail[0]?.path, next);
    if(!urlT){
        return next(customApiError(500, "Thumbnail URL couldn't be received"));
    }
    const { url: urlV, public_id: public_idV } = await videoUploader(req.files.video[0]?.path, next);
    if (!urlV) {
        return next(customApiError(500, "Video URL couldn't be received"));
    }

    const videoDoc = await video.create({
        title,
        description,
        owner: User._id,
        ownerName : User.username,
        ownerLogo : User.avatar?.url,
        thumbnail: { url: urlT, publicId: public_idT },
        videoFile: { url: urlV, publicId: public_idV },
        views : [],
        likedBy : [],
        comments : [],
    });

    if (!videoDoc) {
        return next(customApiError(500, "Video couldn't be uploaded to the database"));
    }

    User.videos.push(videoDoc._id);
    await User.save();

    res.status(200).json({
        status: "success",
        message: "Video uploaded",
        "url of Thumbnail": urlT,
        "url of Video": urlV
    });
});

const deleteVideoo = AsyncWrapper(async (req, res, next) => {
    const User = await user.findById(req.user);
    if (!User) {
        return next(customApiError(500, "User not found"));
    }

    const videoId = req.params.id;

    // Remove video reference from User
    User.videos.pull(videoId);
    await User.save();

    // Find the video by id
    const Video = await video.findById(videoId);
    if (!Video) {
        return next(customApiError(404, "Video not found"));
    }

    // Get the public_id of the video file for deletion from cloud storage
    const public_id1 = Video.videoFile.publicId;
    const public_id2 = Video.thumbnail.publicId;

    // Delete the video document from the database
    await video.findByIdAndDelete(videoId);

    // Delete the video file from the cloud storage (e.g., Cloudinary)
    await deleteVideo(public_id1);
    await deleteImage(public_id2);

    // Send response
    return res.status(200).json({ "status": "success", "message": "Video deleted successfully" });
});

const changeThumbnail = AsyncWrapper(async (req,res,next)=>{
    // get video id
    const videoId = req.params.id;
    
    // find video
    const Video = await video.findById(videoId);
    if(!Video){
        return next(customApiError(500,"Video can't be recieved"));
    }

    // get that video's thumbnail
    const public_id = await Video.thumbnail.publicId;
    
    // delete existing thumbnail
    await deleteImage(public_id);

    // upload new thumbnail
    const { url: urlT, public_id: public_idT } = await imageUploader(req.file?.path, next);
    if (!urlT) {
        return next(customApiError(500, "File URL couldn't be received"));
    }

    Video.thumbnail={url: urlT, publicId: public_idT};
    await Video.save();

    return res.status(200).json({"status":"success","message":"thumbnail uploaded successfully"});

});

const editVideo = AsyncWrapper(async (req,res,next)=>{
    const {title,description}=req.body;
    const videoId = req.params.id;

    const Video = await video.findById(videoId);
    if(!Video){
        return next(customApiError(500,"Video couldn't recieved"));
    }

    Video.title=title;
    Video.description=description;
    await Video.save();

    return res.status(200).json({"status":"success","message":"video edited successfully"}); 
});

const getAllVideo = AsyncWrapper(async (req,res,next)=>{
    const Videos = await video.find().select("_id title thumbnail ownerName ownerLogo createdAt owner");
    if(!Videos){
        return next(customApiError(500,"Videos can't be recieved"));
    }

    if(Videos.length === 0){
        return res.status(200).json({"status":"success","message":"novideos"});
    }

    // const views = await Videos.countViews();

    return res.status(200).json({"status":"success","data":Videos});

});

const watchVideo = AsyncWrapper(async (req, res, next) => {
    const id = req.params.id;
    let viewer = req.query?.user;
    if(viewer){
        viewer =new mongoose.Types.ObjectId(viewer);
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(badRequest());
    }

    const Video = await video.findById(id).select("-isPublished");
    
    if (!Video) {
        return next(customApiError(500, "Video can't be received"));
    }

    const Likes = await Video.countLikes();
    const Views = await Video.countViews();
    const Comments = await Video.countComments();

    const already = await Video.alreadyViewed(viewer);
    if(viewer && already) Video.views.push(viewer);
    await Video.save();

    return res.status(200).json({
        status: "success",
        data: Video,
        Likes,
        Views,
        Comments
    });
});

const getComments = AsyncWrapper(async (req,res,next)=>{
    const id = req.params.id;

    if(!mongoose.Types.ObjectId.isValid(id)){
        return next(badRequest());
    }

    const Comments = await comment.find({atVideo : id});
    if(!Comments){
        return next(customApiError(500,"Comments can't be recieved"));
    }

    return res.status(200).json({"status":"success","data":Comments});
})

const likeVideo = AsyncWrapper(async (req,res,next)=>{
    if(!req.user){
        return next(customApiError(500,"not logged"));
    }

    const id = req.params.id;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return next(unprocessableContent());
    }

    const Video = await video.findById(id);
    if(!Video){
        return next(customApiError(500,"Video not found"));
    }

    const already = await Video.alreadyLiked(req.user);
    if (already) {
        return next(customApiError(404,"already liked the video"));
    }

    Video.likedBy.push(req.user);
    await Video.save();

    return res.status(200).json({"status":"success","message":"video got liked"});
})

const unlikeVideo = AsyncWrapper(async (req,res,next)=>{
    console.log("unliking");
    if(!req.user){
        return next(customApiError(500,"not logged"));
    }

    const id = req.params.id;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return next(unprocessableContent());
    }

    
    console.log("got the user and video");

    const Video = await video.findById(id);
    if(!Video){
        return next(customApiError(500,"Video not found"));
    }

    
    console.log("got the video");

    const already = await Video.likedBy.includes(req.user);

    console.log(already);

    if (!already) {
        return next(badRequest());
    }

    Video.likedBy.pull(req.user);
    await Video.save();
    console.log("unliked");
    return res.status(200).json({"status":"success","message":"video got unliked"});
})

const makeComment = AsyncWrapper(async (req, res, next) => {4
    const id = req.params.id;

    // Check if the provided post ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(badRequest("Invalid Post ID"));
    }

    // Find the video to comment on
    const Video = await video.findById(id);
    if (!Video) {
        return next(customApiError(404, "Video not found"));
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
        atVideo: id,
        ownername : req.username
    });

    // Add the comment to the post
    Video.comments.push(Comment._id);
    await Video.save();

    return res.status(201).json({
        status: "success",
        message: "Comment created successfully"
    });
});

const getUserVideos = AsyncWrapper(async (req,res,next)=>{
    const { id } = req.params;
    
    if(!id){
        return next(badRequest());
    }
    // Validate if id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(customApiError(400, "Invalid user ID"));
    }
    
    const videos = await video.find({owner : id}).select("_id title thumbnail ownerName ownerLogo createdAt owner");
    res.status(200).json({"status":"success","data":videos});
})

module.exports = {uploadVideo,deleteVideoo,changeThumbnail,editVideo,getAllVideo,watchVideo,likeVideo,unlikeVideo, makeComment, getComments, getUserVideos};