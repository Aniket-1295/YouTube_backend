import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import {User} from "../models/user.model.js";

//this middleware add a user to the request object so we can use as req.user
//this middleware is used to verify the access token of the user and add the user to the request object so we can use as req.user 
//it jsut veryfy(validate) the access token  is it correct or not 

const verifyJWT = asyncHandler(async (req, _,next)=>{

    try {
        const token = req.cookies?.accessToken || req.headers('Authorization')?.split(' ')[1];
    
        if(!token){
            throw new ApiError(401,"unauthorized request"); 
        }
    
     

        //if we get the token then we have to verify it 

        //we can use await here as well but it is not recommended as it will block the code execution until the token is verified
            const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
    
            const user = await User.findById(decodedToken?.userId).select("-password -refreshToken");
    
            if(!user){
                throw new ApiError(401,"Invalid access token"); 
            }
      
            //add the user to the request object
            req.user = user;
            next();
    } catch (error) {

        throw new ApiError(401, error.message || "Invalid access token");
        
    }


})

export {verifyJWT};