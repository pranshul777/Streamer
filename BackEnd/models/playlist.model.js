const mongoose = require('mongoose');

const playlistSchema = mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    videos : [{
        type : mongoose.Types.ObjectId,
        ref : 'Video'
    }],
    owner : {
        type : mongoose.Types.ObjectId,
        ref : 'User',
        required : true
    }
},{timestamps : true});

module.exports = mongoose.model('Playlist',playlistSchema);