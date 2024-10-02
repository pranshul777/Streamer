const {ApiError,customApiError}=require('./ApiError.js');
module.exports = (err,req,res,next)=>{
    let status = err.scode || 500;
    res.status(status).json({"status" : "failed","message":err.message});
}