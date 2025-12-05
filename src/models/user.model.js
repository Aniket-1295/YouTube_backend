import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
      minlength: 3,
      maxlength: 50,
    },
    avatar: {
      type: String, //cloudinary url
      required: true,
    },
    coverImage: {
      type: String, //cloudinary url
      required: false,
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],

    password: {
      type: String,
      required: [true, "Password is required"],
    },

    refreshToken: [
      {
        type: String,
      },
    ],
  },

  { timestamps: true }
);

//pre save hook to hash password before saving to DB
//here this refers to the user document
//next is a callback function to move to the next middleware
//if password is not modified then move to next middleware
//if password is modified then hash the password and then move to next middleware
//async function to hash password
//always use function keyword to access this keyword because arrow function does not have its own this context

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// custom method to compare password
//here this refers to the user document
//plainPassword is the password entered by the user
//this.password is the hashed password stored in the DB
//return true if passwords match else false
//async function to compare password (compare method returs a true or false)
//always use function keyword to access this keyword because arrow function does not have its own this context
userSchema.methods.isPasswordMatch = async function (plainPassword) {
  return await bcrypt.compare(plainPassword, this.password);
};

//custom method to generate access token.
//here this refers to the user document
//return access token

userSchema.methods.generateAccessToken = function () {
  //generate and return access token
  return jwt.sign(
    //payload usually we set payload  using only id
    {
      userId: this._id,
      username: this.username,
      email: this.email,
      fullName: this.fullName,
    },
    //secret or private key
    process.env.ACCESS_TOKEN_SECRET,

    //options like expiry
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

//custom method to generate refresh token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ userId: this._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  });
};

//both are jwt tokens but they differ in useses +
//refresh token is used to get new access token
//accesstoken and refresh token differ only in expiry 
//we can gererate access token and refresh token with the same payload with same method but with different expiry
//whenever user need to authentcte ha should have access token but after access token expires we can use refresh token to get new access token
//we can gve refresh toen to user as weel as we save it in db


export const User = mongoose.model("User", userSchema);
