import {Router} from "express";
import {regesterUser,loginUser,logoutUser,refereshAccessToken} from "../controllers/user.controller.js"
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

//secured routes 
//take care of the oreder of the middleware
router.route("/logout").post( verifyJWT,logoutUser)

router.route("/refresh-token").post(refereshAccessToken) //http://localhost:5000/api/v1/users/refresh-token")

export default router;