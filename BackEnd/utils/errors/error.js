const badRequest= require('./badRequest.error.js');
const notAvailable= require('./notAvailable.error.js');
const notFound= require('./notFound.error.js');
const serviceUnavailable= require('./serviceUnavailable.error.js');
const unauthorised= require('./unauthorised.error.js');
const forbidden= require('./forbidden.error.js');
const unprocessableContent = require('./unprocessableContent.error.js');
module.exports={unprocessableContent,badRequest,notAvailable,notFound,serviceUnavailable,unauthorised,forbidden};