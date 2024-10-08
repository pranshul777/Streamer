const AsyncWrapper = require('../utils/AsyncWrapper.js');
const {ApiError,customApiError} = require('../utils/ApiError.js');
const {unprocessableContent,badRequest,notAvailable,notFound,serviceUnavailable,unauthorised, forbidden}= require('../utils/errors/error.js');
const user = require('../models/user.model.js');
const video = require('../models/video.model.js');
const playlist = require('../models/playlist.model.js');
const comment = require('../models/comment.model.js');
const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");
const {imageUploader,deleteImage} = require('../utils/Cloudinary.js');

const getUserData = AsyncWrapper(async (req,res,next)=>{
    const  id  = req.user;
    
    if(!id){
        return next(badRequest());
    }
    
    const foundUser = await user.findById(id).select("-password -videos -posts -refreshToken -playlists");
    if(!foundUser){
        return next(notAvailable());
    }

    res.status(200).json({"status":"success","data":foundUser});
})

const getUserData2 = AsyncWrapper(async (req,res,next)=>{
    const { id } = req.params;
    if(!id){
        return next(badRequest());
    }
    
    // Validate if id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(customApiError(400, "Invalid user ID"));
    }
    
    const foundUser = await user.findById(id).select("-password -watchHistory -playlists -refreshToken -subscribedTo -subscribers -videos -posts");
    if(!foundUser){
        return next(notAvailable());
    }
    
    const subscribers = await foundUser.subscribersCount();
    res.status(200).json({"status":"success","data":{...foundUser._doc, subscribers}});
});

const registerUser = AsyncWrapper(async (req,res,next)=>{
    // fetch data
    console.log("register");
    const {username,password,email,firstname, lastname} = req.body;
    if(!username || !password || !email || !firstname || !lastname){
        return next(unprocessableContent());
    }

    // regex
    if(!(/^[0-9A-Za-z]{6,16}$/.test(username))){
        return next(customApiError(403 ,"username is not correct"));
    }
    if(!(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(email))){
        return next(customApiError(403 ,"Email is not correct"));
    }
    if(!(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!#%*?&])[A-Za-z\d@$!#%*?&]{8,}$/.test(password))){
        return next(customApiError(403 ,"Password is not correct"));
    }
    
    console.log("done validation");
    //if user exists
    const existedUser = await user.findOne({
        $or : [{email},{username}]
    })
    if(existedUser){
        return next(forbidden());
    }
    
    console.log("no existing user");
    // create user
    const createdUser =await user.create({username,password,email,firstname,lastname,watchHistory : [], playlists : [], subscribedTo : [], subscribers : [], videos : [], posts : []});
    if(!createdUser){
        return next(customApiError(500,"not able to create a user"));
    }
    
    console.log("user created");
    // generate tokens
    const accessToken =await createdUser.generateAccessToken();
    const refreshToken =await  createdUser.generateRefreshToken();
 
    // setting refreshtoken in user cookie
    createdUser.refreshToken=refreshToken;
    createdUser.save({validateBeforeSave:false});
    
    console.log("refresh token done");
    // get user without password and refresh token
    const foundUser = await user.findById(createdUser._id).select("-password -videos -posts -refreshToken -playlists");
    if(!foundUser){
        return next(customApiError(500,"user is created but server is not able to retrieve it."));
    }
    
    console.log("user fetched");

    // store access refresh token in the cookie
    //set cookie
    res.cookie("refreshToken",refreshToken,{
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    })
    res.cookie("accessToken",accessToken, {
        httpOnly: true,
        maxAge: 60 * 60 * 1000 // 1 hour
    })
    
    console.log("cookie set");
    // send response 
    res
    .status(201)
    .json({"status":"success","data":foundUser,"token":accessToken})
});

const userLogin = AsyncWrapper(async (req, res, next) => {
    // Fetch data
    console.log("login");
    const { username, password, email } = req.body;

    // Check if all fields are present
    if (!(username || email) || !password) {
        return next(unprocessableContent());
    }

    // Check if the user exists
    const existedUser = await user.findOne({ $or: [{ username }, { email }] });
    if (!existedUser) {
        return next(notFound());
    }

    // Check the password
    const isPasswordCorrect = await existedUser.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
        return next(unauthorised());
    }

    // Generate tokens
    const accessToken = await existedUser.generateAccessToken();
    const refreshToken = await existedUser.generateRefreshToken();

    // Store tokens in cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        maxAge: 60 * 60 * 1000 // 1 hour
    });

    // Save refresh token to the user's document
    existedUser.refreshToken = refreshToken;
    await existedUser.save({ validateBeforeSave: false });

    // Get user details excluding password and refreshToken
    const resultUser = await user.findById(existedUser._id).select("-password -videos -posts -refreshToken -playlists");
    if (!resultUser) {
        return next(customApiError(500, "User logged in, but the server couldn't retrieve it"));
    }

    // Send API response
    res.status(200).json({
        status: "success",
        data: resultUser,
        token: accessToken
    });
});

const userLogout = AsyncWrapper(async (req,res,next)=>{
    const loggedUser = await user.findById(req.user);
    if(!loggedUser){
        return next(notFound());
    }
    res.clearCookie('accessToken')
    res.clearCookie('refreshToken');

    loggedUser.refreshToken=null;
    await loggedUser.save();
    // sending api response
    res.status(200).json({"status":"success","message":"logged out"});
})

const userUpdate = AsyncWrapper(async (req,res,next)=>{
    // fetch data
    const {username,email,fullname} = req.body;

    const updateObject = new Object();    

    if(username){
        updateObject.username = username
    }
    if(email){
        updateObject.email = email
    }
    if(fullname){
        updateObject.fullname = fullname
    }
    console.log(updateObject);

    // if nothing to update
    if(Object.keys(updateObject).length==0){
        return next(badRequest());
    }

    // update operation
    const updatedUser = await user.findByIdAndUpdate(req.user,updateObject,{new:true}).select("-refreshToken -password");
    if(!updatedUser){
        return next(customApiError(500,"user didn't get updated or server is unable to fetch it after update"))
    }
    // sending api response
    res.status(200).json({"status":"success","data":updatedUser});
})

const uploadAvatar = AsyncWrapper(async (req,res,next)=>{
    const User = await user.findById(req.user);
    if(!User){
        return next(customApiError(500,"something is going wrong"));
    }

    //check if user already have an image
    const {URL,publicID} = User.avatar;
    if(URL){
        await deleteImage(publicID);
    }
    const {url,public_id} = await imageUploader(req.file.path,next);
    if(!url){
        // console.log(cloudinaryUrl);
        return next(customApiError(500,"file URL can't be recieved"));
    }
    User.avatar={"url" : url, "publicId" : public_id};
    await User.save();
    res.status(200).json({"status":"success","message":"picture uploaded","url":url});
})

const uploadCover = AsyncWrapper(async (req,res,next)=>{
    const User = await user.findById(req.user);
    if(!User){
        return next(customApiError(500,"something is going wrong"));
    }

    //check if user already have an image
    const {URL,publicID} = User.coverImage;
    if(URL){
        await deleteImage(publicID);
    }
    // console.log(req.file);
    const {url,public_id} = await imageUploader(req.file.path,next);
    if(!url){
        // console.log(cloudinaryUrl);
        return next(customApiError(500,"file URL can't be recieved"));
    }
    User.coverImage={"url" : url, "publicId" : public_id};
    await User.save();
    res.status(200).json({"status":"success","message":"picture uploaded","url":url});
})

const changePassword = AsyncWrapper(async (req,res,next)=>{
    const {password,newPassword}=req.body;
    if(!password || !newPassword){
        return next(notAvailable());
    }

    const currentUser = await user.findById(req.user);
    if(!currentUser){
        return next(notFound());
    }

    const isPasswordCorrect = await currentUser.isPasswordCorrect(password);
    if(!isPasswordCorrect){
        return next(unauthorised());
    }

    currentUser.password = newPassword;
    await currentUser.save();

    const updatedUser = await user.findById(req.user).select("-password -refreshToken")
    if(!updatedUser){
        return next(customApiError(500,"password is updated but server couldn't able to get the user"));
    }

    res.status(200).json({"status":"success","data":currentUser});
})

const refreshAccessToken = AsyncWrapper(async (req,res,next)=>{
    console.log(req.cookies);
    const refreshToken = req.cookies.refreshToken ;
    if(!refreshToken){
        return next(customApiError(401,"refresh is not available"));
    }
    const decoded = jwt.verify(refreshToken,process.env.REFRESHKEY);

    const User = await user.findById(decoded.id);
    if(!User){
        return next(customApiError(500, "user can't be fetched through refresh token"));
    }

    if(refreshToken != User.refreshToken){
        return next(customApiError(401,"refresh token incorrect"));
    }

    const newRefreshToken =await User.generateRefreshToken();
    const newAccessToken = await User.generateAccessToken();

    User.refreshToken = newRefreshToken;
    await User.save();
    
    // set cookie
    // first remove it 
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.cookie("refreshToken",newRefreshToken,{
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    })
    res.cookie("accessToken",newAccessToken, {
        httpOnly: true,
        maxAge: 60 * 60 * 1000 // 1 hour
    })

    res.status(200).json({"status":"success","message":"token created successfully","accessToken":newAccessToken});
})

const subscribe = AsyncWrapper(async (req,res,next)=>{
    console.log("here");
    if(req.user===req.params.id){
        return next(badRequest());
    }
    const User = await user.findById(req.user);
    if(!User){
        return next(customApiError(500,"can't fetch user"));
    }

    const channel = req.params.id;
    if(!mongoose.Types.ObjectId.isValid(channel)){
        return next(unprocessableContent());
    }


    const Channel = await user.findById(channel);
    if(!Channel){
        return next(customApiError(500,"can't fetch Channel"));
    }

    
    if(User.isSubscribedTo(channel)){
        return next(customApiError(400,"Already Subscribed"));
    }

    Channel.subscribers.push(User._id);
    await Channel.save();

    User.subscribedTo.push(Channel._id);
    await User.save();

    return res.status(200).json({"status":"sucsess","message":"subscribed successfully"});
})

const unsubscribe = AsyncWrapper(async (req,res,next)=>{
    const User = await user.findById(req.user);
    if(!User){
        return next(customApiError(500,"can't fetch user"));
    }

    const channel = req.params.id;
    if(!mongoose.Types.ObjectId.isValid(channel)){
        return next(unprocessableContent());
    }

    const Channel = await user.findById(channel);
    if(!Channel){
        return next(customApiError(500,"can't fetch Channel"));
    }

    if(!User.isSubscribedTo(channel)){
        return next(customApiError(400,"Not a subscriber"));
    }

    Channel.subscribers.remove(User._id);
    await Channel.save();

    User.subscribedTo.remove(Channel._id);
    await User.save();

    return res.status(200).json({"status":"sucsess","message":"unsubscribed successfully"});
})

const getUserVideos = AsyncWrapper(async (req,res,next)=>{
    const { id } = req.params;
    
    if(!id){
        return next(badRequest());
    }
    // Validate if id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(customApiError(400, "Invalid user ID"));
    }
    
    const foundUser = await user.findById(id).select("videos");
    if(!foundUser){
        return next(notAvailable());
    }

    res.status(200).json({"status":"success","data":foundUser});
})

const getUserPosts = AsyncWrapper(async (req,res,next)=>{
    const { id } = req.params;
    
    if(!id){
        return next(badRequest());
    }
    // Validate if id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(customApiError(400, "Invalid user ID"));
    }
    
    const foundUser = await user.findById(id).select("posts");
    if(!foundUser){
        return next(notAvailable());
    }

    res.status(200).json({"status":"success","data":foundUser});
})

module.exports={getUserData,registerUser,userLogin,userUpdate,uploadAvatar,changePassword,userLogout,refreshAccessToken,uploadCover,subscribe,unsubscribe,getUserPosts,getUserVideos,getUserData2};