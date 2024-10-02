const {ApiError,customApiError} = require('../ApiError.js');
module.exports=()=>{
    return customApiError(403,"The client does not have access rights to the content");
}