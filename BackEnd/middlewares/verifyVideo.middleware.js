const mongoose  = require('mongoose');
const user = require('../models/user.model.js');
const video = require('../models/video.model.js');
module.exports = async (req,res,next)=>{
    //get user
    const User = await user.findById(req.user);
    if (!User) {
        return next(customApiError(500, "User not found"));
    }
    // get video id
    const videoId = req.params.id;
    // validate id
    if(!mongoose.Types.ObjectId.isValid(videoId)){
        return next(customApiError(400,"video id isnot valid"));
    }

    // check if the loggedIn user contains this video 
    if(!User.videos.includes(videoId)){
        return next(customApiError(400,"Its not user's video"));
    }
    
    console.log("video belongs to the user");
    next();

}