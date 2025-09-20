import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema = new Schema(
  {
   videoFile:{
    type:String,  // video file url we will be getting from cloud storage
    required:[true,"Video file is required"],
   },
   thumbnail:{
    type:String, // thumbnail image url we will be getting from cloud storage
    required:[true,"Thumbnail image is required"],
   },
   title:{
    type:String,
    required:true,
   },
   description:{
    type:String,
   },
   duration:{
    type:Number, // in seconds
    required:true,
   },
   views:{
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
   },
  },
  { timestamps: true }
);

videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);
