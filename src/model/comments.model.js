import mongoose, { Schema } from "mongoose";

const Comment_Schema = new Schema(
    {
        content: {
            type: String,
            require: true,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            require: true
        },
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video",
            require: true
        }
        

    },

    { timestamps: true })

export const Comment = mongoose.model('Comment', Comment_Schema)