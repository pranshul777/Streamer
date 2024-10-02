const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
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
    likedBy: [{
        type: mongoose.Types.ObjectId,
        ref: 'User'
    }],
    comments: [{
        type: mongoose.Types.ObjectId,
        ref: 'Comment'
    }]
}, { timestamps: true });

postSchema.methods.countLikes = async function (){
    return await this.likedBy.length;
},
postSchema.methods.countComments = async function (){
    return await this.comments.length;
},


module.exports = mongoose.model('Post', postSchema);