const {ApiError,customApiError} = require('../ApiError.js');
module.exports=()=>{
    return customApiError(401,"client must authenticate itself to get the requested response");
}