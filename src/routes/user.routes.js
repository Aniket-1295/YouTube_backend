import {Router} from "express";
import {regesterUser} from "../controllers/user.controller.js"
const router = Router();


router.route("/regester").post(regesterUser) //http://localhost:5000/api/v1/users/regester



export default router;