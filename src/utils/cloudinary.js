import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
})

//standard way to upload file to cloudinary 
//create a function and pass the file path as an argument.

const uploadOnCloudinary = async (localFilePath)=>{
    try {

        if(!localFilePath) return new Error("File path is required");

      const response= await cloudinary.uploader.upload(localFilePath,{resource_type:"auto",
            public_id: "my_dog",
            overwrite: true,
        })
        
        //file upload to cloudinary successful
        console.log("File uploaded to cloudinary successfully ", response.url);

        return response;


    } catch (error) {

        //here we got the localFilePath as an argument
        //but while uploading to cloudinary we got an error so handle it here

        fs.unlinkSync(localFilePath); // remove the locally saved file as the upload to cloudinary failed
      
        return null;

         
        
    }
}

export {uploadOnCloudinary};




