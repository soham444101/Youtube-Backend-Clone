import { ApiError } from "../utilites/APIError.js"
import { ApiResponse } from "../utilites/API.responce.js"
import { asynHandaler } from "../utilites/AsynHandler.js"
import { response } from "express"
import mongoose, { isValidObjectId } from "mongoose";
import { Suscription } from "../model/suscribtion.model.js";
import { $and } from "sift";
import { User } from "../model/USer.model.js";
import { lookup } from "mime";
import { from, pipeline } from "form-data";
import { countBy, sum } from "lodash";

const toggleSubscription = asynHandaler(async (req, res) => {
    // TODO: toggle subscription
    // channel id 
    // user id subscriber chi 
    // validation both 
    //match karu channel ani user id la
    // if find zal tar channel id subscriber madhun deleat karu
    // nahi zal tr crete karu channel madhe subscriber and vise versa
    //  response send karu

    const Channel_id = req.params.channelId

    const Subscriber_id = req.user._id
    // Validation Kela Data La
    if (!isValidObjectId(Channel_id)) {
        throw new ApiError(404, "Channel Id Problems")
    }

    const Exist_User = await User.findById(Channel_id);
    if (!Exist_User) {
        throw new ApiError(404, "Channel Id  Not Exist")
    }
    //Check The the Channel and that particual Subscriber Exixt Or Not
    const Subscribe = await Suscription.findOne(
        {
            suscriber: Subscriber_id,
            channel: Channel_id,
        }
    )
    console.log("Find Value Data", Subscribe)

    // If Subscriber Exist then Delete the subscriber else Create The Subscriber
    // Responce Send
    if (Subscribe == true) {
        const Deleat_Subscriber = await Subscribe.delete();

        if (Deleat_Subscriber?.trim() !== null) {
            throw new ApiError(404, "Unsusbiring Work is Not Done ")
        }
        else {
            return res.status(200)
                .json(
                    new ApiResponse(200, "User Unsubscribed The Channels")
                )
        }
    }
    else {
        const Creat_New_Subscriber = await Subscribe.create(
            {
                suscriber: Subscriber_id,
                channel: Channel_id,
            }
        )

        if (!Creat_New_Subscriber) {
            throw new ApiError(404, "", "New Subscriber to This Channel Not Created")
        }

        return res.status(200)
            .json(
                new ApiResponse(404, "", "New Subscriber Is Created")
            )
    }
    // Apun Kelela
    // const subscribed = await Suscription.aggregate[
    //     {
    //         $match: {
    //             $and: [
    //                 channel._id = Channel_id,
    //                 suscriber._id = Subscriber_id
    //             ]
    //         }
    //     }
    // ]
    // const Subscriber_Db = await Suscription.findByObject(Subscriber_id)
    // const Channel_Db = await Suscription.findByObject(Channel_id)
    // // Validation
    // if (subscribed == true) {
    //     Subscriber_Db.Channel_id = null;
    //     Channel_Db.Subscriber_id = null;

    //     // Other Step To Deleat channel Id From The Subscriber_ID
    //     //    const toggle = await Suscription.findByIdAndDelete(
    //     //         Subscriber_id,
    //     //         {
    //     //             Channel_id : null
    //     //         }
    //     //     )

    // } else {

    //   Subscriber_Db.create(
    //     channel = Channel_id
    //   )
    //   Channel_Db.create(
    //     suscriber = Subscriber_id
    //   )

    // }

    // await Subscriber_Db.save(
    //     {
    //         validitBeforeSave: false
    //     }
    // )
    // await Channel_Db.save(
    //     {
    //         validitBeforeSave: false
    //     }
    // )
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asynHandaler(async (req, res) => {
    // Get All Subscriber And Subscriber Count ,Subscriber List
    // get channel id
    // Validation
    //channel Exist Or Not
    //Channel Find Karun Ani Subscriber che User kadhu(Aggegation pipeline)
    // Count Karu
    // Responce

    const Channel_id = req.params.channelId

    // Validation Kela Data La
    if (!isValidObjectId(Channel_id)) {
        throw new ApiError(404, "Channel Id Problems")
    }

    const Exist_User = await User.findById(Channel_id);
    if (!Exist_User) {
        throw new ApiError(404, "Channel Id  Not Exist")
    }

    // Aggegation pipeline
    const Subscriber_Details = await Suscription.aggregate[
        {
            $match:
            {
                channel: mongoose.Types.ObjectId(Channel_id)
            }
        },
        {
            lookup: {
                from: "users",
                localField: "suscriber",
                foreignField: "_id",
                as: "Subscriber_Info",
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
            ,
            Number_Of_Subscriber: {
                $sum: 1
            }
        },
        {
            $addField: {
                Subscriber_Info: {
                    $first: "$Subscriber_Info"
                }
            }
        }
    ]
    if (Subscriber_Details.length !== 0) {
        throw new ApiError(404, "Subscriber Aggegation Problems")
    }
    return res.
        status(200)
        .json(
            new ApiResponse(200, Subscriber_Details, "Subscriber Data Fetch SuccessFully")
        )
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asynHandaler(async (req, res) => {
    // Get All Channel List
    // Get The ID
    //Validate
    //Moongoose Aggegation(Number Of Channels And Channel Full name ,Etc)
    //Responce
    const { subscriberId } = req.params;

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(404, "Subscrber Id Not Found")
    }

   const Channel_Details= await Suscription.aggregate[
        {
            $match: {
                suscriber: mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "Channel_List",
                pipeline: [
                    {
                        $project: {
                            fullname: 1,
                            username: 1,
                            avtar: 1
                        }
                    }
                ]


            },
        },
        {
            $addField: {
                Channel_List: {
                    $first: "$Channel_List"
                }
            }
        }
    ]
    if (Channel_Details.length !== 0) {
        throw new ApiError(404, "Channel Aggegation Problems")
    }
    return res.
        status(200)
        .json(
            new ApiResponse(200, Channel_Details, "Channel Data Data Fetch SuccessFully")
        )
})


export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}