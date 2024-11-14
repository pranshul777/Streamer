const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
    channel : {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required : true
    },
    user : {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required : true
    },
    sentBy : {
        type : String,
        required : true,
        enum :["User", "Channel"]
    },
    text : {
        type : String,
        required : true
    }
},{timestamps:true});

const message = new mongoose.model('Message', messageSchema);

module.exports = message;