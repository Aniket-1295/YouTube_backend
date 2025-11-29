import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js" 
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js"


const regesterUser = asyncHandler(async (req, res) => {
  //we have not implemented user registration yet but we are now testing by creating a route
  // res.status(200).json({
  //     message:"User registered successfully"
  // })

  //logical steps to register a user=>
  //1. get user details from request body(form data or json data) or request query(url) or request params(url) or request headers or request cookies or request files

  //2. validate user details (schema validation)
  //3. check if user already exists(email or username)
  //4.check for images check for avatar from request body of the user(files)
  //5.upload them to cloudinary => get a response from cloudinary(url)
  //check avatar is uploaded or not(cloudinary)
  //6. create user object -> create entry in db

  //(now we get a response with all the created user details from db)
  //7.remove password and refresh token field from response.
  //8.check user created or not
  //9.return response

   //get user details from request body
  const { email, password, fullName, username } = req.body;

  //validate user details
  if (
    [email, password, fullName, username].some((field) => {
      return field?.trim() === "";
    })
  ) {
    throw new ApiError(400, "All fields are required");
  }

  //check if user already exists (email or username) using mongoose query
  const existedUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  //if user already exists throw an error
  if (existedUser) {
    throw new ApiError(409, "Userwith this email or username already exists");
  }
  

  //get the avatar and cover image from request files
 const avatarLocalPath = req.files?.avatar[0]?.path;
 const coverImageLocalPath = req.files?.coverImage[0]?.path;

 //check if avatar and cover image is uploaded or not
 if (!avatarLocalPath) {
  throw new ApiError(400, "Avatar file is required");
}

//upload avatar and cover image to cloudinary
const avatarResponse = await uploadOnCloudinary(avatarLocalPath);
const coverImageResponse = await uploadOnCloudinary(coverImageLocalPath);

//check if avatar and cover image is uploaded or not
if (!avatarResponse) {
  throw new ApiError(400, "Avatar or cover image upload to cloudinary failed");
}

//create user object
// const user = new User({
//   email,
//   password,
//   fullName,
//   username: username.toLowerCase(),
//   avatar: avatarResponse.url,
//   coverImage: coverImageResponse?.url || "",
// });

const user = await User.create({
  email,
  password,
  fullName,
  username: username.toLowerCase(),
  avatar: avatarResponse.url,
  coverImage: coverImageResponse?.url || "",
});


//remove password and refresh token field from response
// user.password = undefined;
// user.refreshToken = undefined;

//check user created or not
// if (!user) {
//   throw new ApiError(500, "something went wrong while creating user");
// }

//check user created or not
const createdUser = await User.findById(user._id).select("-password -refreshToken");

if (!createdUser) {
  throw new ApiError(500, "something went wrong while registering user"); 
}

//return response
res.status(201).json(
  new ApiResponse(201,createdUser,"User registered successfully")
);












//create entry in db
// const createdUser = await user.save();

});
 


export { regesterUser };
