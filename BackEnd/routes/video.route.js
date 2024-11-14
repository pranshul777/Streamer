const express = require('express');
const auth = require('../middlewares/auth.js');
const upload = require("../middlewares/multer.middleware.js");
const verify = require("../middlewares/verifyVideo.middleware.js");

const {uploadVideo,changeThumbnail,deleteVideoo,editVideo, getAllVideo, watchVideo, likeVideo, unlikeVideo, makeComment, getComments, getUserVideos} = require('../controllers/video.controller.js');


const router = express.Router();

router.route("/uploadvideo").post(
    auth,
    (req, res, next) => {
        console.log("starting");
        next();
    },
    upload.fields([
        { name: 'video', maxCount: 1 },
        { name: 'thumbnail', maxCount: 1 }
    ]), // Handle both 'video' and 'thumbnail' in one step
    (req, res, next) => {
        console.log("video and thumbnail done"); // req.files now contains both 'video' and 'thumbnail'
        console.log(req.files)
        next();
    },
    uploadVideo
);

router.route("/changethumbnail/:id").patch(auth,verify,upload.single('thumbnail'),changeThumbnail);

router.route("/daletevideo/:id").delete(auth,verify,deleteVideoo);

router.route("/edit/:id").patch(auth,verify,editVideo);

router.route("/").get(getAllVideo);

router.route("/watchvideo/:id").get(watchVideo);

router.route("/like/:id").patch(auth,likeVideo);

router.route("/unlike/:id").patch(auth,unlikeVideo);

router.route("/comment/:id").patch(auth,makeComment);

router.route("/getComments/:id").get(getComments);

router.route("/channel/:id").get(getUserVideos);
module.exports = router;
