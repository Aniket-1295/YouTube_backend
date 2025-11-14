import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


//this is the async function which returns a promise
const connectDB = async()=>{

   try {
   
    const connectionInstance= await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
   // console.log(connectionInstance); //this will print the connection instance object
   console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);


   } catch (error) {
    console.log("Error connecting to the database:", error);
    process.exit(1);
    
   }


}

export default connectDB;

