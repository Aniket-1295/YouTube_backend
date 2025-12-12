import {Router} from "express";
import {regesterUser,
    loginUser,
    logoutUser,
    refereshAccessToken,
    changePassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
} from "../controllers/user.controller.js"
const router = Router();
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";



router.route("/regester").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    regesterUser) //http://localhost:5000/api/v1/users/regester

router.route("/login").post(loginUser)

//secured routes (only logged in users can access these routes)


router.route("/logout").post( verifyJWT,logoutUser)

router.route("/refresh-token").post(refereshAccessToken) //http://localhost:5000/api/v1/users/refresh-token")


router.route("/change-password").post(verifyJWT,changePassword) //http://localhost:5000/api/v1/users/change-password")


router.route("/current-user").get(verifyJWT,getCurrentUser) //http://localhost:5000/api/v1/users/get-current-user")

routet.route("/update-account").patch(verifyJWT,updateAccountDetails) //http://localhost:5000/api/v1/users/update-account-details")


//take care of the oreder of the middlewares
router.route("/update-user-avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar) //http://localhost:5000/api/v1/users/update-user-avatar")

router.route("/update-user-cover-image").patch(verifyJWT,upload.single("coverImage"),updateUserCoverImage) //http://localhost:5000/api/v1/users/update-user-cover-image"

router.route("/c/:username").get(verifyJWT,getUserChannelProfile) //http://localhost:5000/api/v1/users/get-user-channel-profile")

router.route("/watch-history").get(verifyJWT,getWatchHistory) //http://localhost:5000/api/v1/users/get-watch-history")



export default router;