import mongoose, { Schema } from "mongoose";

const Like_Schema = new Schema(
    {
        likeBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            require: true
        },
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video"
        },
        tweet: {
            type: Schema.Types.ObjectId,
            ref: "Tweet"
        },
        comment: {
            type: Schema.Types.ObjectId,
            ref: "Comment"
        }
    },

    { timestamps: true })

export const Like = mongoose.model('Like', Like_Schema)