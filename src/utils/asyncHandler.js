
//utility function called asyncHandler that is used to simplify error handling 

//why -> so that we don't have to write try-catch blocks in every async route handler
//n Express, route handlers can be asynchronous (e.g., when interacting with a database). If an error occurs in an asynchronous function, it needs to be passed to the next() function for proper error handling. Without this utility, you would need to wrap every asynchronous route handler in a try-catch block, which can lead to repetitive and verbose code.

//The asyncHandler function automates this process by wrapping the asynchronous function and handling errors for you.



const asyncHandler =(reqHandler)=>{
    return (req,res,next)=>{
        Promise.resolve(reqHandler(req,res,next)).catch((error)=>next(error));
    }
}



//This is a higher-order function (a function that returns another function). It takes a single argument fn, which is expected to be an asynchronous function (a function that returns a Promise).
//Inside the returned function, the fn (the original route handler) is called with req, res, and next as arguments.
// The await ensures that the asynchronous operation completes before proceeding.

//If an error occurs during the execution of fn, it is caught here.
// This eliminates the need to manually write try-catch blocks in every route handler.

//You are correct. The asyncHandler function acts as an error-handling middleware wrapper for asynchronous route handlers in Express. It simplifies error handling by automatically catching errors in asynchronous code and passing them to the next() function or handling them directly.

// When you use asyncHandler on a route handler, you don't need to manually write try-catch blocks. Instead, it ensures that any errors are caught and handled properly, making your code cleaner and more maintainable.


// const asyncHandler = (fn)=> async(req,res,next)=>{
//     try {

//         await fn(req,res,next);
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success:false,
//             message:error.message || "Internal Server Error"
//         })
        
//     }
// }

export {asyncHandler};