const {ApiError,customApiError} = require('../ApiError.js');
module.exports=()=>{
    return customApiError(422,"the server understood the content type of the request entity, and the syntax of the request entity was correct, but it was unable to process the contained instructions.");
}