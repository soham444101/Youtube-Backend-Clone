import mongoose,{Schema, Types} from "mongoose";

const Tweet_Schema = new Schema(
    {
    content:{
        type: String,
        require:true,
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
        require:true
    }

    },{
        timestamps:true
    }
)


export const Tweet = mongoose.model("Tweet",Tweet_Schema)