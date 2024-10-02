const express = require('express');
const auth = require('../middlewares/auth.js');
const upload = require("../middlewares/multer.middleware.js");
const verify = require("../middlewares/verifyPost.middleware.js");

const {uploadPost, changeImage, deletePost, editPost, likePost, unlikePost, makeComment} = require('../controllers/post.controller.js');


const router = express.Router();

router.route("/uploadpost").post(
    auth,
    (req, res, next) => {
        console.log("starting");
        next();
    },
    upload.single('image'), // Handle both 'video' and 'thumbnail' in one step
    (req, res, next) => {
        console.log("post done"); // req.files now contains both 'video' and 'thumbnail'
        console.log(req.file)
        next();
    },
    uploadPost
);

router.route("/changeimage/:id").patch(auth,verify,upload.single('image'),changeImage);

router.route("/daletpost/:id").delete(auth,verify,deletePost);

router.route("/edit/:id").patch(auth,verify,editPost);

router.route("/like/:id").patch(auth,likePost);

router.route("/unlike/:id",auth,unlikePost);

router.route("/comment/:id",auth,makeComment);

module.exports = router;
