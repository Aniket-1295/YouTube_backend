// require('dotenv').config({path:'./env'});

//resently intoduced ES6 module syntax
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import {app} from "./app.js";


//we can use as the exprimential feature of ES6 module syntax
dotenv.config({path:"./env"})


connectDB().then(()=>{
    app.on("error",(error)=>{
        console.error("Failed to connect to the database", error);
        process.exit(1);
    })
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
            
//             // Event listeners for successful connection and errors
//             app.on("error",(error)=>{
//                 console.error("Failed to connect to the database", error);
//                 process.exit(1);
//             })

//             app.listen(process.env.PORT,()=>{
//                 console.log(`Server is running on port ${process.env.PORT}`);
//             })


            
//         } catch (error) {
//             console.error("Error connecting to the database:", error);
//             throw error;
            
//         }

//     }

// )()