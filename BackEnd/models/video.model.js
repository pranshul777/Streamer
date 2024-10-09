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
    ownerName : {
        type : String,
        required : true
    },
    ownerLogo : {
        type : String,
    },
    owner: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required : true
    },
    isPublished: Boolean,
    views: [{
        type: mongoose.Types.ObjectId,
        ref: 'User',
    }],
    likedBy: [{
        type: mongoose.Types.ObjectId,
        ref: 'User',
    }],
    comments: [{
        type: mongoose.Types.ObjectId,
        ref: 'Comment',
    }]
}, { timestamps: true });

// Schema Methods to count likes, views, and comments
videoSchema.methods.countLikes = async function () {
    return this.likedBy?.length || 0;
};

videoSchema.methods.alreadyLiked = async function (liker) {
    return this.likedBy.includes(liker)
};

videoSchema.methods.alreadyViewed = async function (viewer) {
    return !this.views.includes(viewer);
};

videoSchema.methods.countComments = async function () {
    return this.comments?.length || 0;
};

videoSchema.methods.countViews = async function () {
    return this.views?.length || 0;
};

module.exports = mongoose.model('Video', videoSchema);
