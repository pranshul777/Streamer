const mongoose  = require('mongoose');
const user = require('../models/user.model.js');
const post = require('../models/post.model.js');
module.exports = async (req,res,next)=>{
    //get user
    const User = await user.findById(req.user);
    if (!User) {
        return next(customApiError(500, "User not found"));
    }
    // get post id
    const postId = req.params.id;
    // validate id
    if(!mongoose.Types.ObjectId.isValid(postId)){
        return next(customApiError(400,"post id isnot valid"));
    }

    // check if the loggedIn user contains this video 
    if(!User.posts.includes(postId)){
        return next(customApiError(400,"Its not user's post"));
    }
    
    console.log("post belongs to the user");
    next();

}