const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    likedBy: [{
        type: mongoose.Types.ObjectId,
        ref: 'User',
    }],
    atVideo: {
        type: mongoose.Types.ObjectId,
        ref: 'Video',
    },
    atPost: {
        type: mongoose.Types.ObjectId,
        ref: 'Post',
    },
    owner: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    ownername : {
        type : String,
        required : true
    }
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);