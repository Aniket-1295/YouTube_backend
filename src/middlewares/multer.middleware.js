import multer from "multer";

const UPLOAD_DIR = process.env.UPLOAD_DIR;
const storage = multer.diskStorage({
  
      destination: function (req, file, cb) {
      cb(null, UPLOAD_DIR)
    },
    filename: function (req, file, cb) {
    //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.originalname)
    }
  })
  
 export  const upload = multer({
     storage,
 })