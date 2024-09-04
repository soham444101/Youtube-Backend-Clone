import { types } from "mime-types";
import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const VideoSchema = new Schema(
    {
         videoFiles:{
            type:String,/// Cloudunary Url
            required :true
         },
         title:{
            type:String,
            required :true
         },
         thumbnail :{
            type:String,
            required :true
         },
         description:{
            type:String,
            required :true
         },
         duration:{
            type:Number,// come from cloudinary url
            required :true,
         },
         view:{
            type:Number,
            default:0
         },
         isPublish:{
             type :Boolean,
             default:true
         }
         ,
         owner:{
            type: Schema.Types.ObjectId,
            req: 'User',
         }
    }, {
    timestamps: true
}
)
VideoSchema.plugin(mongooseAggregatePaginate)
export const Video = mongoose.model('Video', VideoSchema)   