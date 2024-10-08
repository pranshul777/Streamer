const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const userSchema = mongoose.Schema({
    username : {
        type : String,
        unique : true,
        required : true
    },
    email : {
        type : String,
        unique : true,
        required : true
    },
    firstname : {
        type : String,
        required : true
    },
    lastname : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    avatar : { // schema inside a field
        url : String,
        publicId : String
    },
    coverImage :{ // schema inside a field
        url : String,
        publicId : String
    },
    refreshToken : String,
    watchHistory :[{
        type : mongoose.Types.ObjectId,
        ref : 'Video'
    }],
    playlists : [{
        type : mongoose.Types.ObjectId,
        ref : 'Playlist'
    }],
    subscribedTo : [{
        type : mongoose.Types.ObjectId,
        ref : 'User'
    }],
    subscribers : [{
        type : mongoose.Types.ObjectId,
        ref : 'User'
    }],
    videos :[{
        type : mongoose.Types.ObjectId,
        ref : 'Video'
    }],
    posts : [{
        type : mongoose.Types.ObjectId,
        ref : 'Post'
    }]
},{timestamps : true});

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();
})

userSchema.methods.isSubscribedTo = async function (channelId) {
    return await this.subscribedTo.includes(channelId);
};

userSchema.methods.subscribersCount = async function () {
    return this.subscribers?.length || 0;
};

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password);
};

userSchema.methods.generateAccessToken = function (){
    return jwt.sign(
        {
            id: this._id,
            username: this.username,
            email: this.email
        },
        process.env.ACCESSKEY,
        {
            expiresIn: process.env.ACCESSEXPIRY
        }
    )
};

userSchema.methods.generateRefreshToken = function (){
    return jwt.sign(
        {
            id: this._id,
        },
        process.env.REFRESHKEY,
        {
            expiresIn: process.env.REFRESHEXPIRY
        }
    )
};

module.exports = mongoose.model("User",userSchema);