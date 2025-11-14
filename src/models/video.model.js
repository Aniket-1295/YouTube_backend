import mongoose,{Schema} from "mongoose";
//it is used for pagination of aggregate queries
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema({

    videoFileUrl:{
        type:String, //cloudinary url 
        required:true,  
    },
    thumbnailUrl:{
        type:String, //cloudinary url
        required:true,
    },
    title:{
        type:String,
        required:[true,"Title is required"],
        // trim:true,
        maxlength:100,
    },
    description:{
        type:String,
        required:[true,"Description is required"],
        // trim:true,
        maxlength:500,
    },
    duaration:{
        type:Number, //form cloudinary in seconds
    },
    viwesCount:{
        type:Number,
        default:0,
    },
    isPublished:{
        type:Boolean,
        default:true,
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },





},{timestamps:true});

//plugin for pagination of aggregate queries
//now we can create aggregate paginated queries using Video.aggregatePaginate()
videoSchema.plugin(mongooseAggregatePaginate);





export const Video =mongoose.model("Video",videoSchema);