import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../model/like.model.js";
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Video } from "../model/video.model.js";
import { Tweet } from "../model/tweet.model.js";
import { $and, $exists } from "sift";
import { from, pipeline } from "form-data";
import { lookup } from "mime";

const toggleVideoLike = asyncHandler(async (req, res) => {
    //TODO: toggle like on video
    //Get The Videoo Id And User_ID
    // Video  Exist Or Not
    // Like Db MAtch Both Present Or Not
    //Like Asnr tr Video_id Delete Karnr
    // Unlike asnr tr Video Id Add Karnr
    // validation
    // Responce

    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(404, "Video ID is Not Present")
    }

    // Video Exist or Not
    const Exist_Video = await Video.findById(videoId)
    if (Exist_Video.trim() == 0) {
        throw new ApiError(404, "Video  is Not exist In the Db ")
    }

    // Like Exist or Not
    const Like_Exist = await Like.findOne(
        {
            likeBy: req.user?._id,
            video: videoId
        }
    )
    console.log("LikeExist", Like_Exist)

    // If Exist Then delete Or Create the data in Like Db
    if (Like_Exist) {
        const Like_Delete = await Like_Exist.deleteOne();
        //Validation
        if (!Like_Delete) {
            throw new ApiError(404, "Like Is  Not Delete ")
        }
        return req
            .status(200)
            .json(
                new ApiResponse(200, {}, "Unlike The video Successfully")
            )
    }
    else {
        // Like The Video Created
        const Like_Create = await Like.create(
            {
                likeBy: req.user?._id,
                video: videoId
            }
        )
        //Validation
        if (Like_Create.trim() == null) {
            throw new ApiError(404, "Comment Is  Not Created")
        }

        return req
            .status(200)
            .json(
                new ApiResponse(200, {}, "like The video Successfully")
            )
    }


})

const toggleCommentLike = asyncHandler(async (req, res) => {
    //TODO: toggle like on comment
    //get commentId ANd LikeBy Id (req.user._id)
    //Validation
    //Comment Exit Karte ki Nahi and validation
    //Findone n Commment ani like Find Karu 
    //Exist like Asnr Tr remove Karu  Nahitr Add Karu
    // Responce
    const { commentId } = req.params
    const Like_by = req.user?._id;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(404, "Comment Id Is not Valide")
    }

    // Comment Exist Or Not
    const Comment_Exist = await Comment.findById(commentId);

    if (!Comment_Exist) {
        throw new ApiError(404, "Comment  Is not Exist")
    }

    // Like Exist Or Not
    const Like_Exist = await Like.findOne
        (
            {
                likeby: Like_by,
                comment: commentId
            }
        )
    console.log("Like_Exist:-", Like_Exist)
    //valiodation
    if (Like_Exist) {

        // Deleat The Like On That Comment
        const deleat_Comment_Like = await Like_Exist.deleteOne();
        if (!deleat_Comment_Like) {
            throw new ApiError(404, "Like Is Not Deleted")
        }
        return
        res.status(200)
            .json(
                new ApiResponse(200, {}, " Comment Like is Unlike")
            )
    }
    else {
        // Creted the Comment Like
        const Crete_Comment_Like = await Like.create(
            {
                likeBy: Like_by,
                comment: commentId
            }
        )
        if (!Crete_Comment_Like) {
            throw new ApiError(404, "Crete comment like Is Not Done")
        }
        return
        res.status(200)
            .json(
                new ApiResponse(200, {}, " Comment  is like")
            )
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    //TODO: toggle like on tweet
    // Get The TweetID And Validate it
    // Exist Tweet And Validta It
    //Like Exist On That Tweet Or Not
    // If like Then unlike By deteting It else like it By Creting it
    // validation
    // responce

    const { tweetId } = req.params
    const Like_by = req.user?._id;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(404, "Tweet Id Is not Valide")
    }

    // Tweet Exist Or Not
    const Tweet_Exist = await Tweet.findById(tweetId);

    if (!Tweet_Exist) {
        throw new ApiError(404, "Tweet  Is not Exist")
    }

    // Like Exist Or Not
    const Like_Exist = await Like.findOne
        (
            {
                likeby: Like_by,
                tweet: tweetId
            }
        )
    console.log("Like_Exist:-", Like_Exist)
    //valiodation
    if (Like_Exist) {

        // Deleat The Like On That Comment
        const deleat_tweet_Like = await Like_Exist.deleteOne();
        if (!deleat_tweet_Like) {
            throw new ApiError(404, "Like Is Not Deleted")
        }
        return res.status(200)
            .json(
                new ApiResponse(200, {}, " Tweet Like is Unlike")
            )
    }
    else {
        // Creted the Comment Like
        const Crete_tweet_Like = await Like.create(
            {
                likeBy: Like_by,
                comment: commentId
            }
        )
        if (!Crete_tweet_Like) {
            throw new ApiError(404, "Crete tweet like Is Not Done")
        }
        return res.status(200)
            .json(
                new ApiResponse(200, {}, " Tweet  is like")
            )
    }

}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    //Get likeId And Validate It 
    //Id Che Like Video Find Karu
    //mongoo Db Aggegation Pipeline
    //validate 
    // responce 

    const { likeId } = req.params;
    // validate
    if (!isValidObjectId(likeId)) {
        throw new ApiError(404, "Like Id Is Not Valide")
    }

    const like_video_Info = await Like.aggregate[
        {
            $match: {
                likeby: mongoose.Types.ObjectId(likeId),
                video: {
                    $exists: true,
                },
            }
        },
        {
            $lookup: {
                from: "videos",
                localfields: "video",
                foreignField: "_id",
                as: "Video_Details",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localfields: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullname: 1,
                                        username: 1,
                                        avtar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $project: {
                            videoFiles: 1,
                            title: 1,
                            thumbnail: 1,
                            duration: 1,
                            view: 1,
                            owner: 1
                        }
                    }
                ]
            }
        }
        , {
            $addField: {
                Video_Details: {
                    $first: "$Video_Details",
                    $first: "$owner"
                }
            }
        }
    ]
    if (like_video_Info.length == 0) {
        return res.status(200)
        .json(
            new ApiResponse(200, {}, "no Like_Video Data exist Of a User")
        )
    }
    else {
        return res.status(200)
            .json(
                new ApiResponse(200, like_video_Info, "Like_Video Data Fetched SuccessFully")
            )
    }
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}