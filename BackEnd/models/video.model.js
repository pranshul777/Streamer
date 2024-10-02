const mongoose = require('mongoose');

const videoSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    videoFile: {
        url : {
            type: String,
            required: true
        },
        publicId : {
            type: String,
            required: true
        }
    },
    thumbnail: {
        url : {
            type: String,
            required: true
        },
        publicId : {
            type: String,
            required: true
        }
    },
    owner: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required : true
    },
    isPublished: Boolean,
    views: [{
        type: mongoose.Types.ObjectId,
        ref: 'User'
    }],
    likedBy: [{
        type: mongoose.Types.ObjectId,
        ref: 'User'
    }],
    comments: [{
        type: mongoose.Types.ObjectId,
        ref: 'Comment'
    }]
}, { timestamps: true });

videoSchema.methods.countLikes = async function (){
    return await this.likedBy.length;
},
videoSchema.methods.countComments = async function (){
    return await this.comments.length;
},
videoSchema.methods.countViews = async function(){
    return await this.views.length;
}


module.exports = mongoose.model('Video', videoSchema);