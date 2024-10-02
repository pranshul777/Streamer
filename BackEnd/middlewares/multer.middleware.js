const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("uploading");
    console.log('Destination Directory:', path.join(__dirname, '../public/temp'));
    cb(null, path.join(__dirname, '../public/temp'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix);
  }
});

const upload = multer({ storage: storage });
module.exports = upload;
