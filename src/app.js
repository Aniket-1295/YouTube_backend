import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';


//now app has the superpowers of express
const app= express();

//to configure something or add middleware in express we use app.use()
app.use(cors({
    origin:process.env.CORS_ORIGIN || "http://localhost:3000",
    methods:["GET","POST","PUT","DELETE","PATCH"],
    credentials:true
}))

//express.json() is a inbuilt  middleware to parse json data from request body
app.use(express.json({limit:'10kb'})); //to parse json data from request body

app.use(express.urlencoded({extended:true, limit:'10kb'})); //to parse urlencoded data from request body or url query

app.use(express.static('public')); //to serve static files from public folder and store on the server
app.use(cookieParser()); //to parse cookies from request headers here we access the cookies using req.cookies of the user and res.cookies to set cookies for the user



//now we have to import all the routes here
import userRouter from "./routes/user.routes.js";
// import authRouter from "./routes/auth.routes.js";
// import tourRouter from "./routes/tour.routes.js";
// import reviewRouter from "./routes/review.routes.js";
// import historyRouter from "./routes/history.routes.js";


//routes declaration as a middleware
app.use("/api/v1/users",userRouter); //http://localhost:8000/api/v1/users



export {app};


