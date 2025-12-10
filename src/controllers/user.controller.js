import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessTokenAndRefreshToken = async (userId) => {
  try {
    //first we have to find the user by id

    const user = await User.findById(userId);

    //here we need to generate access token and return it as well as refresh token and save to the db

    const accessToken = await user.generateAccessToken();

    const refreshToken = await user.generateRefreshToken();

    //save the refresh token to db without validating a password
    //every time user.save is called it will validate password. so we need to skip password validation

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    //return access token and refresh token
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong while generating access token and refresh token"
    );
  }
};

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
    throw new ApiError(409, "User with this email or username already exists");
  }

  //get the avatar and cover image from request files
  const avatarLocalPath = req.files?.avatar[0]?.path;
  //  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files?.coverImage[0]?.path;
  }

  //  console.log(avatarLocalPath);
  //  console.log(coverImageLocalPath);

  //check if avatar and cover image is uploaded or not
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  //upload avatar and cover image to cloudinary
  const avatarResponse = await uploadOnCloudinary(avatarLocalPath);
  const coverImageResponse = await uploadOnCloudinary(coverImageLocalPath);

  // console.log(avatarResponse);
  // console.log(coverImageResponse);

  //check if avatar and cover image is uploaded or not
  if (!avatarResponse) {
    throw new ApiError(
      501,
      "Avatar or cover image upload to cloudinary failed"
    );
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

  //check user created or not and remove password and refresh token field from response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "something went wrong while registering user");
  }

  //return response
  res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));

  //create entry in db
  // const createdUser = await user.save();
});

const loginUser = asyncHandler(async (req, res) => {
  //logical steps to login a user=>
  //1. get user details from request body(form data or json data) or request query(url) or request params(url) or request headers or request cookies or request files

  //2. validate user details (schema validation)
  //3. check if user exists(email or username)
  //4. check if password is correct
  //6. generate access token and refresh token
  //7. set access token and refresh token in cookies using res.cookies
  //8. return response

  //1.1 get user details from request body
  const { email, username, password } = req.body;

  //1.2 validate user details
  if (!(email || username)) {
    throw new ApiError(400, "Email or username is required");
  }

  //1.3 check if user exists(email or username)
  //get a user by email or username
  //user is an instance of the user model (object)
  const user = await User.findOne({ $or: [{ email }, { username: username }] });

  //1.4 check if user exists or not
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  //1.5 check if password is correct
  const isPasswordMatch = await user.isPasswordMatch(password);

  //1.6 check if password is correct or not
  if (!isPasswordMatch) {
    throw new ApiError(401, "Invalid user credentials");
  }

  //1.7 generate access token and refresh token
  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(user._id);

  //here we can update the  user object with access token and refresh token like this

  // user.refreshToken = refreshToken;
  // await user.save({validateBeforeSave:false});

  //or we can perform DB calls like this but it is a heavy operation

  // const loggedInUser = await User.findByIdAndUpdate(user._id,{refreshToken},{new:true}).select("-password -refreshToken");

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  //now we have to set access token and refresh token in cookies like this
  // res.cookie("accessToken",accessToken,{httpOnly:true,secure:true,sameSite:"none"});
  // res.cookie("refreshToken",refreshToken,{httpOnly:true,secure:true,sameSite:"none"});

  //or

  //options for cookie it is used because we want to set secure cookies frontend does not have access to cookies only server has access to cookies to modify them.
  //in browser we can see cookies in the cookie tab but we can not access them from the browser
  const options = {
    httpOnly: true,
    secure: true,
    // sameSite:"none",
    // maxAge:24*60*60*1000 //1 day
  };

  //here we have set access token and refresh token in response headers as a cookie so that frontend can access them.
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          //here we have to return the user details with access token and refresh token cause user might want to save it in local storage
          user: loggedInUser,
          refreshToken,
          accessToken,
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  // remove the refresh token from the db
  //cleear the cookies from the browser
  // clear the cookies from the server

  //but how to fnd the perticuler user

  //lets see

  //1.remove the referesh token from the DB

  await User.findByIdAndUpdate(
    req.user.userId,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user logged out successfully"));
});

const refereshAccessToken = asyncHandler(async (req, res) => {
  //get the refresh token from the cookies
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  //check we get the refresh token or not
  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  //veryfy the incoming referesh token

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    //check if we get the decoded token or not
    if (!decodedToken) {
      throw new ApiError(401, "Invalid refresh token");
    }

    //find the user by id

    const user = await User.findById(decodedToken.userId);

    //check if we get the user or not
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    //check for incoming refresh token and user refresh token
    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, "refresh token expired or used");
    }

    //generate new access token and refresh token
    const { accessToken, newRefreshToken } =
      await generateAccessTokenAndRefreshToken(user._id);

    //options

    const options = {
      httpOnly: true,
      secure: true,
    };

    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken: newRefreshToken,
          },
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const changePassword = asyncHandler(async (req, res) => {
  //logical steps to change password

  //1.get the oldPassword and newPassword from the req.body

  const { oldPassword, newPassword } = req.body;

  //2.check if we get the oldPassword and newPassword or not

  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "Please provide oldPassword and newPassword");
  }

  //3.find the user by id

  const user = await User.findById(req.user.userId);

  const isoldPasswordIscorrect = await user.isPasswordMatch(oldPassword);

  //4.check if the oldPassword is correct or not

  if (!isoldPasswordIscorrect) {
    throw new ApiError(400, "Old password is incorrect");
  }

  //5.update the new password

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  //6.send the response

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req,res)=>{

  //logical steps =>myne  

  //1.find the user by id

  // const user = await User.findById(req.user.userId).select("-password -refreshToken");

  // //2.send the response

  // return res.status(200)
  // .json(
  //   new ApiResponse(
  //     200,
  //       user,
  //     "User found successfully"
  //   )
  // )


  return res
  .status(200)
  .json(
    new ApiResponse(
      200,
      req.user,
      "User found successfully"
    )
  )



})

const updateAccountDetails = asyncHandler(async (req,res)=>{

  //logical steps to update account details like fullName email and username

  //1.get the fullName email and username from the req.body

  const {fullName,email,username} = req.body;

  //2.check if we get the fullName email and username or not
  //2.check if we get at least one of the fullName, email, or username

  if (!(fullName || email || username)) {
    throw new ApiError(400, "Please provide at least one of fullName, email, or username");
  }

 

  //updateFields is an object which contains the fields which we want to update
  const updateFields = {};
  if (fullName) updateFields.fullName = fullName;
  if (email) updateFields.email = email;
  if (username) updateFields.username = username;

   //3. find the user by id and update the account details
  const user = await User.findByIdAndUpdate(
    req.user.userId,
    {
      $set: updateFields,
    },
    {
      new: true
    }
  ).select("-password");
    
  //when all fields are required =>
  // const user = await User.findByIdAndUpdate(
  //   req.user.userId,
  //   {
  //     $set:{
  //       fullName,
  //       email,
  //       username
  //     },
  //   },
   
  //   {
  //     new: true
  //   }
  // ).select("-password");
 

  //4.send the response

  return res
  .status(200)
  .json(
    new ApiResponse(
      200,
      user,
      "Account details updated successfully"
    )
  )
})

const updateUserAvatar = asyncHandler(async (req,res)=>{

  //logical steps to update user avatar

  //1.get the avatar from the req.file

  const avatarLocalPath = req.file?.path;

  //2.check if we get the avatar or not

  if(!avatarLocalPath){
    throw new ApiError(400,"Please provide avatar");
  }

  //3.upload the avatar to cloudinary

  //3.1 delete old avatar image

  const oldAvatar = req.user?.avatar;

  if(oldAvatar){
    await deleteFromCloudinary(oldAvatar);
  }

  const avatarResponse = await uploadOnCloudinary(avatarLocalPath);

  //check if the avatarResponse is null or not
  
  if(!avatarResponse.url){
    throw new ApiError(500,"Error uploading avatar to cloudinary");
  }

  //4.find the user by id and update the avatar

  const user = await User.findByIdAndUpdate(
    req.user.userId,
    {
      $set: {
        avatar: avatarResponse.url
      }
    },
    {
      new: true
    }
  ).select("-password");

  //5.send the response
  return res
  .status(200)
  .json(
    new ApiResponse(
      200,
      user,
      "Avatar updated successfully"
    )
  )



})

const updateUserCoverImage = asyncHandler(async (req,res)=>{

  //logical steps to update user cover image 

  //get the cover image form req.file

  const coverImageLocalPath = req.file?.path;

  //check if we get the cover image or not

  if(!coverImageLocalPath){
    throw new ApiError(400,"Please provide cover image");
  }

  //delete old cover image

  const oldCoverImage = req.user?.coverImage;

  if(oldCoverImage){
    await deleteFromCloudinary(oldCoverImage);
  }

  //upload the cover image to cloudinary

  const coverImageResponse = await uploadOnCloudinary(coverImageLocalPath);

  //check if the coverImageResponse is null or not  

  if(!coverImageResponse.url){
    throw new ApiError(500,"Error uploading cover image to cloudinary");
  }

  //find the user by id and update the cover image

  const user = await User.findByIdAndUpdate(
    req.user.userId,
    {
      $set: {
        coverImage: coverImageResponse.url
      }
    },
    {
      new: true
    }
  ).select("-password");

  //send the response
  return res
  .status(200)
  .json(
    new ApiResponse(
      200,
      user,
      "Cover image updated successfully"
    )
  )

})


const getUserChannelProfile = asyncHandler(async (req,res)=>{


  //logical steps to get user channel

  //1.get the usename from req.params
  //2.check if the username is provided or not or it is valid or not
  //3.if yes then grt the channel information by appplying aggregation pipeline
  //4.check if the channel is found or not
  //5.send the response


  //1.get the username from req.params
  const {username} = req.params;

  //2.check if the username is provided or not or it is valid or not

  if(!username?.trim()){
    throw new ApiError(400,"Please provide username");
  }

  //3.if yes then grt the channel information by appplying aggregation pipeline

  //how to apply pipeline on user model

  const channelProfile = await User.aggregate([
    {

      $match: {
        username:username.toLowerCase()
      }


    },

    //left join using $lookup operator (subscription model)
    {

      $lookup:{
        from:"subscriptions",
        // localField of user model
        localField:"_id",
        foreignField:"channel",
        as:"subscribers"
      }

    },
    {

      $lookup:{
        from:"subscriptions",
        // localField of user model
        localField:"_id",
        foreignField:"subscriber",
        as:"subscribedTo"
      }

    },
    {

      $addFields:{
        subscribersCount:{$size:"$subscribers"},
        subscribedCount:{$size:"$subscribedTo"},
        isSubscribed:{
          $cond: {
            if: {
              $in: [req.user.userId, "$subscribers.subscriber"]
            },
            then: true,
            else: false
          }

        }
      }

    },

    //projection
    {
      $project: {
        username:1,
        fullName:1,
        avatar:1,
        coverImage:1,
        subscribersCount:1,
        subscribedCount:1,
        isSubscribed:1,
        email: 1
       
      }
    }

  ])


  //4.check if the channel is found or not

  if(!channelProfile?.length){
    throw new ApiError(404,"Channel not found");
  }

  //5.send the response

  return res
  .status(200)
  .json(
    new ApiResponse(
      200,
      channelProfile[0],
      "Channel profile fetched successfully"
    )
  )






})
 


export {
  regesterUser,
  loginUser,
  logoutUser,
  refereshAccessToken,
  changePassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannel
};
