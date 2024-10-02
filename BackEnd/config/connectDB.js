const mongoose = require('mongoose');
require('dotenv').config();
module.exports = async ()=>{
    try {
        const connectionInstance = await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected suceesfully at : ",connectionInstance.connection.host);
    } catch (error) {
        console.log("error in database");
        throw error;
    }
}