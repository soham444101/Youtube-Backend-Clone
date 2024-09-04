import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../model/tweet.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    //content and owner id We Get Here
    //validate content
    //Exist Such Contain tweet And Validate it
    //if exist give Error tweet Already Exist else Crete the tweet 
    //validate
    //responce

    const { content } = req.body;
    const owner_id = req.user?._id

    // vallidation
    if (content.trim() == null) {
        throw new ApiError(404, "Content is not in valide form")
    }
    if (!isValidObjectId(owner_id)) {
        throw new ApiError(404, "Owner Id IS Missing Or Not Valide")
    }


    const Exist_Content = await Tweet.findOne(
        {
            content: content,
            owner: owner_id
        }
    )
    //ContentExist Or Not

    if (Exist_Content.trim() == 0) {
        // creating the  Tweet Content
        const Crete_tweet_Content = await Tweet.create(
            {
                content: content,
                owner: owner_id
            }
        )
        if (!Crete_tweet_Content) {
            throw new ApiError(404, "tweet Is Not Creted")
        }
        return res.status(200)
            .json(
                new ApiResponse(200, Crete_tweet_Content, "Content Is Created")
            )
    } else {
        return res.status(200)
            .json(
                new ApiResponse(200, {}, "This Tweet Is Already Present")
            )
    }
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    // Get The Owner Id  and page &limit Value
    // MongoDb Agegation
    // Validation
    // Pagination Of Aggegation
    // Vlaidation
    // res

    const Owner_Id = req.params
    ;const {page = 1 , limit=1} = req.query;

    if (!isValidObjectId(Owner_Id)) {
        throw new ApiError(404, "Owner Id IS Missing Or Not Valide")
    }
    // Option Form For pagination
    const Option = {
        page : parent(page),
       limit:parent(limit)
    }

    // Aggegation 
    const Tweet_Of_User = await Tweet.aggregate[
        {
            $match: {
                owner: Owner_Id,
            }
        },
        {
            $project: {
                content: 1,
                owner: 1
            }
        }
    ]

    console.log("Tweet of the users:", Tweet_Of_User)
    
    // Validation
    if (Tweet_Of_User.length == 0) {
        throw new ApiError(404, "Fault In The Aggegation Time")
    }

    // pagination And Vaidation
    const Tweet_Of_User_02 = await Tweet.aggregatePaginate(Tweet_Of_User,Option);
    if (Tweet_Of_User_02.totalDocs == 0) {

        return res.status(200)
        .json(
            new ApiResponse(200, {}, "User Have No Tweet ")
        )
    }

    
    return res.status(200)
        .json(
            new ApiResponse(200, Tweet_Of_User, "User Tweet Send Successfully")
        )
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    // Get The Tweet Id  and content in params and body
    // Validate It
    // find Tweet by this present of not and update it
    //validate it 
    // responce
    const { tweetiId } = req.params;
    const { content } = req.body;

    // validate
    if (!isValidObjectId(tweetiId)) {
        throw new ApiError(404, " The Tweet Id Is Not valide")
    }
    if (content.trim() == null) {
        throw new ApiError(404, "The Content Is Not Given or Problem in midway")
    }
    // Find And Update the tweet
    const Update_Tweet = await Tweet.findByIdAndUpdate(
        tweetiId,
        {
            $set: {
                content: content
            }
        }, {
        new: true
    }
    )
    // OR
    // Other Approch
    //FindbyId ni instance gheu ani to exist karte ka bhagu ani update karu

    // Validation
    if (!Update_Tweet) {
        throw new ApiError(404, "Problem Occure in exist Of Tweet Or MOngo Db Connection")
    }

    // Responce
    return res.status(200)
        .json(
            new ApiResponse(200, Update_Tweet, "Tweet Update Successfully")
        )
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    // Tweet Id From The user
    //Validate it
    // FInd And Delete KaruDirect 

    // Or

    // Find kaaru Ani Tya natr Exist ahe ka nahi check karu 

    //  Validate ani resp

    const { tweetiId } = req.params;

    // validate
    if (!isValidObjectId(tweetiId)) {
        throw new ApiError(404, " The Tweet Id Is Not valide")
    }

    // FInd And Delete KaruDirect 
    const Delete_Tweet = await Tweet.findByIdAndDelete(tweetiId);

    console.log("DELETE TWEET :-", Delete_Tweet)
    //validate
    if (!Delete_Tweet) {
        throw new ApiError(404, " The Tweet Delete Problem")
    }
    return res.status(200)
        .json(
            new ApiResponse(200, {}, "Deletion Of The Data Successfully")
        )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
