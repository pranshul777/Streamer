const AsyncWrapper = require('../utils/AsyncWrapper.js');
const {ApiError,customApiError} = require('../utils/ApiError.js');
const {unprocessableContent,badRequest,notAvailable,notFound,serviceUnavailable,unauthorised, forbidden}= require('../utils/errors/error.js');
const user = require('../models/user.model.js');
const video = require('../models/video.model.js');
const playlist = require('../models/playlist.model.js');
const comment = require('../models/comment.model.js');
const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");
const path = require('path');
const { v4 } = require("uuid");
const { exec } = require("child_process");
const fs = require("fs");

const {
    imageUploader,
    videoUploader,
    deleteImage,
    deleteVideo,
    rawUploader,
    deleteRaw,
    deleteFolder
} = require('../utils/Cloudinary.js');



// uploading segment files and manifest file on cloud
async function uploadToCloud(folderPath, m3u8Path, folderId, next) {
    console.log(folderPath, m3u8Path, folderId, next);
    try {
        const files = fs.readdirSync(folderPath);
        const segmentUrls = [];
      
        for (const file of files) {
            const filePath = path.join(folderPath, file);

            if (file.endsWith('.ts')) {
                try {
                    const result = await videoUploader(filePath, next, folderId);
                    segmentUrls.push({ segment: file, url: result });
                } catch (error) {
                    console.error(`Failed to upload segment: ${file}`, error);
                    throw new Error(`Failed to upload segment: ${file}`);
                }
            }
        }

        let m3u8Content = await fs.promises.readFile(m3u8Path, 'utf-8');
        segmentUrls.forEach(({ segment, url }) => {
            console.log(segment, url);
            m3u8Content = m3u8Content.replace(segment, url);
        });

        const updatedM3u8Path = path.join(folderPath, 'updated_index.m3u8');
        await fs.promises.writeFile(updatedM3u8Path, m3u8Content);

        const result = await rawUploader(updatedM3u8Path, next, folderId);
        return result; // Manifest URL
    } catch (error) {
        console.log(error.message);
        throw new Error('Failed to updated .m3u8');
    }
}
// run ffmpeg commands seperately and returns stored cloud stored manifest file
// Wrap exec in a Promise to use async/await properly
function runExec(ffmpegCommand, videoPath, hlsPath, outputPath, folderId, next) {
    return new Promise((resolve, reject) => {
        exec(ffmpegCommand, async (error, stdout, stderr) => {
            if (error) {
                console.log(`exec error: ${error}`);
                return reject(new Error("Video encoding failed."));
            }

            try {
                console.log(`stdout: ${stdout}`);
                console.log(`stderr: ${stderr}`);
                console.log("File encoded, now uploading to cloud and updating .m3u8");

                // Ensure `uploadToCloud` is awaited and pass folderId
                const manifestUrl = await uploadToCloud(outputPath, hlsPath, folderId, next);
                console.log("All segments uploaded to the cloud and .m3u8 updated");

                // Clean up the local upload directory (use async method)
                await fs.promises.rm(outputPath, { recursive: true, force: true });
                console.log("Cleanup successful, upload complete.");

                resolve(manifestUrl);
            } catch (error) {
                // Clean up even if there's an error
                await fs.promises.rm(outputPath, { recursive: true, force: true });
                console.error("Error during cloud upload or cleanup:", error.message);
                reject(new Error('Failed to run exec'));
            }
        });
    });
}

// Function to generate the master `.m3u8` content
function generateMasterM3U8(url1, url2, url3) {
    let masterContent = '#EXTM3U\n';
    masterContent += `#EXT-X-STREAM-INF:BANDWIDTH=150000,RESOLUTION=256x144\n${url1}\n`;
    masterContent += `#EXT-X-STREAM-INF:BANDWIDTH=1000000,RESOLUTION=1920x1080\n${url2}\n`;
    masterContent += `#EXT-X-STREAM-INF:BANDWIDTH=2500000,RESOLUTION=1280x720\n${url3}\n`;
    return masterContent;
}



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
    
    // Generate unique folder ID
    const folderId = v4();
    const baseUploadDir = path.join(__dirname, '../uploads');

    const { url: urlT, public_id: public_idT } = await imageUploader(req.files.thumbnail[0]?.path, next, folderId);
    if(!urlT){
        return next(customApiError(500, "Thumbnail URL couldn't be received"));
    }

    console.log("Video processing start\n\n");

    if (!req.files.video[0]?.path) {
        return res.status(401).json({ "status": "unsuccessful", "message": "file is missing" });
    }


    const videoPath = req.files.video[0]?.path;
    const outputPath = baseUploadDir;
    const hlsPath = path.join(outputPath,"/masterindex.m3u8" );
    const outputPath144p = path.join(outputPath,"/144p" );
    const hlsPath144p = path.join(outputPath,"/index.m3u8" );
    const outputPath480p = path.join(outputPath,"/480p" );
    const hlsPath480p = path.join(outputPath,"/index.m3u8" );
    const outputPath720p = path.join(outputPath,"/720p" );
    const hlsPath720p = path.join(outputPath,"/index.m3u8" );
    console.log("hlsPath", hlsPath);
        
    // Create directories if they don't exist
    await fs.promises.mkdir(outputPath, { recursive: true });
    await fs.promises.mkdir(outputPath144p, { recursive: true });
    await fs.promises.mkdir(outputPath480p, { recursive: true });
    await fs.promises.mkdir(outputPath720p, { recursive: true });


    // FFmpeg commands for different video resolutions
    const ffmpegCommand144p = `ffmpeg -i ${videoPath} -vf "scale=-2:144" -codec:v libx264 -b:v 300k -preset veryfast -codec:a aac -b:a 64k -hls_time 5 -hls_playlist_type vod -hls_segment_filename "${outputPath144p}/segment%03d.ts" -start_number 0 ${hlsPath144p}`;
    const ffmpegCommand480p = `ffmpeg -i ${videoPath} -vf "scale=-2:480" -codec:v libx264 -b:v 1200k -preset veryfast -codec:a aac -b:a 128k -hls_time 5 -hls_playlist_type vod -hls_segment_filename "${outputPath480p}/segment%03d.ts" -start_number 0 ${hlsPath480p}`;
    const ffmpegCommand720p = `ffmpeg -i ${videoPath} -vf "scale=-2:720" -codec:v libx264 -b:v 2500k -preset veryfast -codec:a aac -b:a 128k -hls_time 5 -hls_playlist_type vod -hls_segment_filename "${outputPath720p}/segment%03d.ts" -start_number 0 ${hlsPath720p}`;


    console.log(hlsPath144p);
    console.log(hlsPath480p);
    console.log(hlsPath720p);


    if (!hlsPath144p || !hlsPath480p || !hlsPath720p) {
        throw new Error("HLS paths are not available");
    }

    console.log("Uploading of 144p...");
    const manifest144p = await runExec(ffmpegCommand144p, videoPath, hlsPath144p, outputPath144p, folderId, next);
    if (!manifest144p) {
        throw new Error("144p manifest couldn't be created");
    }
    console.log("144p upload completed");

    console.log("Uploading of 480p...");
    const manifest480p = await runExec(ffmpegCommand480p, videoPath, hlsPath480p, outputPath480p, folderId, next);
    if (!manifest480p) {
        throw new Error("480p manifest couldn't be created");
    }
    console.log("480p upload completed");

    console.log("Uploading of 720p...");
    const manifest720p = await runExec(ffmpegCommand720p, videoPath, hlsPath720p, outputPath720p, folderId, next);
    if (!manifest720p) {
        throw new Error("720p manifest couldn't be created");
    }
    console.log("720p upload completed");

    console.log(hlsPath144p);
    console.log(hlsPath480p);
    console.log(hlsPath720p);


    if (!hlsPath144p || !hlsPath480p || !hlsPath720p) {
        throw new Error("HLS paths are not available");
    }

    // Generate master M3U8 content
    const masterContent = generateMasterM3U8(manifest144p, manifest480p, manifest720p);
    console.log("Master content generated");

    await fs.promises.writeFile(hlsPath, masterContent);
    console.log("Master written successfully");

    // Upload master M3U8 file
    const masterUrl = await rawUploader(hlsPath, next, folderId);
    console.log("Master URL saved successfully");

    const videoDoc = await video.create({
        title,
        description,
        owner: User._id,
        ownerName : User.username,
        ownerLogo : User.avatar?.url,
        thumbnail: { url: urlT, publicId: public_idT },
        videoFile: masterUrl,
        folder: folderId,
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
        "url of Video": masterUrl
    });
});

const deleteVideoo = AsyncWrapper(async (req, res, next) => {
    const User = await user.findById(req.user);
    if (!User) {
        return next(customApiError(500, "User not found"));
    }

    const videoId = req.params.id;

    // Find the video by id
    const Video = await video.findById(videoId);
    if (!Video) {
        return next(customApiError(404, "Video not found"));
    }
    
    // Get the folder of video file
    const folder = await Video.folder;

    // Delete Complete Folder from Cloudinary
    await deleteFolder(folder, next);

    // Delete the video document from the database
    await video.findByIdAndDelete(videoId);

    // Remove video reference from User
    User.videos.pull(videoId);
    await User.save();

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