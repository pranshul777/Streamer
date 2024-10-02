const {ApiError,customApiError} = require('../ApiError.js');
module.exports=()=>{
    return customApiError(503 ,"The server is currently unable to handle the request temporaryly");
}