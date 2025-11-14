// require('dotenv').config({path:'./env'});

//resently intoduced ES6 module syntax
//as early as possible in tour application import dotenv and configure it
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import {app} from "./app.js";


//we can use as the exprimential feature of ES6 module syntax =>"dev": "nodemon -r dotenv/config  src/index.js"
dotenv.config({path:"./env"})

//this is called separation of concerns here we are separating the app configuration and server configuration
//rather wrrting DB connection logic here we just import the connectDB function from db/index.js file and call it here
//so we have seperate the logic of DB connection from server configuration
connectDB().then(()=>{
    // Event listeners for errors
    app.on("error",(error)=>{
        console.error("Failed to connect to the database", error);
        process.exit(1);
    })

    // Event listeners for successful connection
    //if everything is working fine and DB is connected then only start the server
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is running on port ${process.env.PORT || 8000}`);
    })

}).catch((error)=>{
    console.error("Error connecting to the database:", error);
    process.exit(1);
})

// ;(
//     async()=>{

//         try {

//             await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
            
//             // Event listeners for errors
//             app.on("error",(error)=>{
//                 console.error("Failed to connect to the database", error);
//                 process.exit(1);
//             })

              // Event listeners for successful connection
//             app.listen(process.env.PORT,()=>{
//                 console.log(`Server is running on port ${process.env.PORT}`);
//             })


            
//         } catch (error) {
//             console.error("Error connecting to the database:", error);
//             throw error;
            
//         }

//     }

// )()