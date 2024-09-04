import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../model/comments.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { lookup } from "mime";
import { from, pipeline } from "form-data";
import { Video } from "../model/video.model.js"

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    // Get The Video_Id ANd User_Id and Content
    //Validate  all 
    //Comment.crete Karu  Ani tyat Video Id var Comment add Karu
    // Validate Karu 
    // responce Send karu

    const { videoId } = req.params
    const User_Id = req.user?._id;
    const { content } = req.body;

    // validation
    if (!isValidObjectId(videoId)) {
        throw new ApiError(404, "VideoId Is nahi ahe")
    }
    if (content.trim() == null) {
        throw new ApiError(404, " Content  Is Nahi ahe ")
    }

    // Video Exist Or Not
    const Exist_Video = await Video.findById(videoId)

    if (Exist_Video.trim() == null) {
        throw new ApiError(404, " Video Exist Nahi Kart")
    }

    // Create The Comment Here
    const Comment_Crete = await Comment.create(
        {
            video: videoId,
            owner: await Comment.aggregate[
                {
                    $lookup: {
                        from: "users",
                        localField: "owner",
                        foreignField: "_id",
                        as: "owner",
                        pipeline: [
                            {
                                $project: {
                                    username: 1,
                                    avtar: 1,
                                }
                            }
                        ]
                    },

                },
                {
                    $addField: {
                        owner: {
                            $first: "$owner"
                        }
                    }
                }
            ],
            content: content,
        }
    )

    console.log(Comment_Crete);
    // Validate Comment
    if (Comment_Crete.trim() == 0) {
        throw new ApiError(404, "Comment Mongo Db MAdhe create Katana Problem ala")
    }

    // Return Responce
    return
    res.status(200)
        .json(
            new ApiResponse(200, Comment_Crete, " Comment Creste Successfully")
        )
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    // Get The User_ID and Comment_ID Content We Want To Update
    // Validate all
    //Find And Update The Comment by videoId
    // validation
    // responce

    const { comment_id } = req.params
    const User_Id = req.user?._id;
    const { content } = req.body;
    // validation
    if (!isValidObjectId(comment_id)) {
        throw new ApiError(404, "VideoId Is nahi ahe")
    }
    if (content.trim() == null) {
        throw new ApiError(404, " Content  Is Nahi ahe ")
    }
    
    //Update The Comment by content
  const Comment_Detail=  await Comment.findOneAndUpdate(
        comment_id,
        {
            $set:{
                content:content
            }
        },
        {
            new:true
        }
    )

    return res.
    status(200)
    .json(
        new ApiResponse(200,Comment_Detail,"Comment Conent Update Successfully")
    )
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    // Get The Comment_ID And Vaalidate The 
    // Find The ID  and Deleat the Comment
    // responce Send
    const {comment_id}=req.params;
    if (!isValidObjectId(comment_id)) {
    throw new ApiError(404, "Comment_Id Barobar Nahi ahe")   
    }

   const Deleat_Comment= await Comment.findByIdAndDelete(comment_id);
   console,log(Deleat_Comment)
   
   if (Deleat_Comment !==  null) {
    throw new ApiError(404, "Comment Delete Nahi Zali Ahe Barobar Nahi ahe")   
   }
   return 
   res.status(200)
   .json(
    new ApiResponse(200,{},"Comment Deleat SuccessFully")
   )
})

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    // Ge Id And Validation Of That ID
    // Video ID Exixt Or not
    // Option Write Here  Because Of Gettin Proper Integer VAlue Of The Page and Limit
    // Moongo Aggeration For Get The Video Comment and Owner Of that video 
    // validation
    // Responce

    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    if (!isValidObjectId(videoId)) {
        throw new ApiError(404, " Video Id IS  Missing From Req.Params")
    }

    //Option Write Here  Because Of Gettin Proper Integer VAlue Of The Page and Limit
    const Option = {
        page: parent(page),
        limit: parent(limit)
    }

    // Moongo Aggegetion Pipeline
    const Comment_Details = await Comment.aggregate[
        {
            $match: {
                video: mongoose.Types.ObjectId(videoId)
            }
        },
        {
            lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            avtar: 1,
                        }
                    }
                ]
                ,
                Number_Of_Comment: {
                    $sum: 1
                }
            }
        },
        {
            $addField: {
                owner: {
                    $first: "$owner"
                }
            }
        },
        {
            $project: {
                owner: 1,
                content: 1,
                video: 1,
                Number_Of_Comment: 1
            }
        }
    ]
    // Validation
    if (Comment_Details.lenght == null) {
        throw new ApiError(404, "Problem In Getting Aggegation on Comment ")
    }

    const Comment_Details_02 = await Comment.aggregatePaginate[Comment_Details, Option]
    if (Comment_Details_02.lenght == null) {
        throw new ApiError(404, "Problem In Getting AggegationPaginate on Comment ")
    }
    console.log("Aggegation_Pagination_Of_Comment:-", Comment_Details_02)

    return res.status(200)
        .json(
            new ApiResponse(200, Comment_Details_02, "Comment Details Fetched Succesfully")
        )

})
export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}



