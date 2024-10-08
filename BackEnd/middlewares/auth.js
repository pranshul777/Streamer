const jwt = require('jsonwebtoken');
const { customApiError } = require('../utils/ApiError.js');
const badRequest = require("../utils/errors/badRequest.error.js");

module.exports=async (req,res,next)=>{
    try {
        console.log(req.cookies);
        const token =  req.headers.authorization || req.cookies.accessToken;

        if (!token) {
            return next(customApiError(401,'Access token is missing or invalid'))
        }
        if(token.split(" ")[0] != "Bearer"){ // token : Bearer ujhasifhreuif...
            return next(badRequest());
        }
        const decoded = jwt.verify(token.split(" ")[1], process.env.ACCESSKEY);
        req.user = decoded.id;
        req.username = decoded.username;
        console.log("authorised");
        next();
    }
    catch (error){
        if (error.name === 'TokenExpiredError') {
            // Token has expired, redirect to refresh token route
            return res.redirect('/api/v1/user/refreshaccesstoken');
        } else {
            return next(error);
        }
    }
}