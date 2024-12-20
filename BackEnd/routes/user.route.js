const express = require('express');

const auth = require('../middlewares/auth.js');
const {getUserData,getUserData2,registerUser,userLogin,userUpdate,changePassword,userLogout,refreshAccessToken, uploadAvatar, uploadCover,subscribe,unsubscribe,getUserPosts,getUserVideos} = require('../controllers/user.controller.js');
const upload = require("../middlewares/multer.middleware.js");

const router = express.Router();

router.route('/register').post(registerUser);
router.route('/login').post(userLogin);
router.route("/logout").get(auth,userLogout);
router.route("/refreshaccesstoken").get(refreshAccessToken);
router.route('/:id').get(getUserData2);
router.route('/').get(auth,getUserData);
router.route("/uploadavatar").post(auth,upload.single('image'), uploadAvatar);
router.route("/uploadcover").post(auth,upload.single('image'), uploadCover);
router.route("/updateUser").patch(auth,userUpdate);
router.route("/changePassword").patch(auth,changePassword);

router.route("/subscribe/:id").put(auth,subscribe);
router.route("/unsubscribe/:id").put(auth,unsubscribe);

router.route("/posts/:id").get(getUserPosts);

module.exports = router;