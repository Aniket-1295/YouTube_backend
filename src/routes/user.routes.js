import {Router} from "express";
import {regesterUser} from "../controllers/user.controller.js"
const router = Router();
import { upload } from "../middlewares/multer.middleware.js";


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



export default router;