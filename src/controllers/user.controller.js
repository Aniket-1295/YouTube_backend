import {asyncHandler} from "../utils/asyncHandler.js";


const regesterUser = asyncHandler(async (req,res)=>{

    //we have not implemented user registration yet but we are now testing by creating a route 
    // res.status(200).json({
    //     message:"User registered successfully"
    // })

    //logical steps to register a user
    //1. get user details from request body
    //2. validate user details
    //3. check if user already exists
    //4.check for images check for avatar from request body of the user
    //5.upload them to cloudinary => get a response from cloudinary
    //check avatar is uploaded or not
    //6. create user object -> create entry in db

    //(now we get a response with all the created user details from db)
    //7.remove password and refresh token field from response.
    //8.check user created or not
    //9.return response
   


})



export {regesterUser}