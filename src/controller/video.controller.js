import mongoose, { isValidObjectId, Mongoose } from "mongoose";
import { ApiError } from "../utilites/APIError.js";
import { ApiResponse } from "../utilites/API.responce.js";
import { trim } from "lodash";
import { uplodeCloudinary, Deleat_Cloudinary_File } from "../utilites/cloudany.js";
import { User } from "../model/USer.model.js";
import { Video } from "../model/video.model.js";
import { VerifyJWT } from "../middleware/Auth.middleware.js";
import { $in, $size } from "sift";
import { sort } from "semver";
import { asynHandaler } from "../utilites/AsynHandler.js";


const getAllVideos = asyncHandler(async (req, res) => {
    //TODO: get all videos based on query, sort, pagination  // Steps to get all video
    // take all required information from req.query
    // Now, validate all fields to check they are not empty
    /* sortBy -> tells by which field to sort (eg. title, description, etc)
     * sortType -> tells two options ascending(asc) or descending(desc)
    */
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //page: The current page number for pagination (default is 1).
    // limit: The number of items per page (default is 10).
    // query: A search string to filter videos by title.
    // sortBy: The field to sort the results by.
    // sortType: The sort order, either asc (ascending) or desc (descending).
    // userId: The ID of the user whose videos you want to fetch.

    if (!isValidObjectId(userId)) {// Here is the user shich video We want to fetch
        throw new ApiError(404, "User Id Is Not Found")
    }
    if (!query || !sortBy || sortType) {
        throw new ApiError(404, "All Value are required")
    }

    // Here We Set A Parsent funtion for  Getting The Only Number Value IF WE Get Somw String VAlue inside them
    const Option ={
        page: parent(page),
        limit:parseInt(limit)
    }
    

    // WE Used This For The SortOption Object By Taking The SortBy and Sort Type Option
    const SortOPtion={
       [sortBy]: sortType==='desc'?-1:1
    };
     
    // OR

    //here WE Write store the value of the sortby and sortype in SortOption
    // if (sortBy.trim() !== null) {
    //     SortOPtion[sortBy] = sortType === "desc"? -1:1;
    // }    
    Video.aggregate[
        {
            $match:mongoose.Types.ObjectId()
        }
    ]
})


const publishAVideo = asyncHandler(async (req, res) => {
    // TODO: get video, upload to cloudinary, create video
    //get data validate 
    // video gheu ani localfile madhun clodinary madhe uplode
    // add all data to the database
    // user responce madhe video , title , description deu

    const { title, description } = req.body
    if (!title?.trim() || !description?.trim()) {
        throw new ApiError(400, "Title Or Description Empty")
    }
    const Local_Video_File = req.files?.Video[0]?.path;
    const Local_thumbnail_File = req.files?.thumbnail[0]?.path;
    if (!Local_Video_File) {
        throw new ApiError(400, "File Importing on Local_Video_File Problem")
    }
    if (!Local_thumbnail_File) {
        throw new ApiError(400, "File Importing on Local_thumbnail_File Problem")
    }
    const cloudinary_video = await uplodeCloudinary(Local_Video_File)
    const cloudinary_thumbnail = await uplodeCloudinary(Local_Video_File)
        ;
    if (!cloudinary_video) {
        throw new ApiError(400, "File uploding on clodinary Video PrOblem")
    }
    if (!cloudinary_thumbnail) {
        throw new ApiError(400, "File uploding on clodinary Thumbnail PrOblem")
    }
    const videos = await Video.create(
        {
            title: title,
            description: description,
            videoFiles: {
                url: cloudinary_video.url,
                public_id: cloudinary_video.public_id
            },
            duration: cloudinary_video.duration,
            thumbnail: {
                url: cloudinary_thumbnail?.url,
                public_id: cloudinary_thumbnail.public_id,
            },
            owner: req.user?._id,
        }
    )

    // const Videos_Agge = await Video.aggregate(
    //     [
    //         {
    //             $lookup: {
    //                 from: User,
    //                 foreignField: _id,
    //                 localField: owner,
    //                 as: owner,
    //                 // output See Then Change the Project only Goes Id And Name Only

    //                 //USe Here  To Show Only THe Fullname And Username Of the User 
    //                 pipeline: [
    //                     {
    //                         $project: {
    //                             fullname: 1,
    //                             username: 1,
    //                         }
    //                     }
    //                 ]
    //             }
    //         }, {
    //             $addFields: {
    //                 $first: "$owner"
    //             }
    //         },
    //         {
    //             $project: {
    //                 owner: 1,
    //                 _id: 1,
    //                 title: 1,
    //                 description: 1,
    //                 videoFiles: 1,
    //                 duration: 1,
    //                 thumbnail: 1,
    //             }
    //         }
    //     ]
    // )

    return res.json(200)
        .json(
            new ApiResponse(200, videos, "File Publish Properly")
        )
})

const getVideoById = asyncHandler(async (req, res) => {
    //TODO: get video by id
    //get Video_ID And Validations
    // View Add Kela
    // mongoo Db Pipelines
    // responce


    //get Video_ID And Validations
    const videoId = req.params.videoId;
    if (!isValidObjectId(videoId)) {
        throw new ApiError(404, "Video_Id Is Not present here")
    }
    // View Add Kela
    const Video_s = await Video.findById(videoId)

    Video_s.view = Video_s.view + 1;
    await Video_s.save({
        validitBeforeSave: false // No Validation on time of save
    })

    // moongo Db Aggerartion
    // Like ,Comment,subscriber count
    // Is_Subscrinbed OR not
    const Get_Video = await Video.aggregate([

        // A match The Values
        {
            $match: {
                _id: new mongoose.Schema.ObjectId(videoId)
                // Id Store In The (default format is the ObjectId )In moongo Db (Other Time manage Maching Through moongoose)
                // We Used This Because we Direct Iteract with mongoDB
            }
        },
        //Number of subscribers
        {
            $lookup: {
                from: "suscriptions",
                localField: "owner",
                foreignField: "channel",
                as: "Subscriber_Count"
            }
        },
        //Number of Comments
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "video",
                as: 'video_Comment_Count',
            }
        },//number Of Likes
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "Video_Likes_Count"
            }
        },
        // Users Or Owner Details
        {
            $lookup: {
                from: "users",// Name Store in the Database
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            fullname: 1,
                            username: 1,
                            avtar: 1,
                        }
                    }
                ]
            }
        },
        // Add_Field Count The Size of The Subscriber,Comments,Likes,IsSubscribe Or Not
        {
            $addFields: {
                $first: "$owner",
            },

            Subscriber_Count: {
                $size: "$Subscriber_Count"
            },
            video_Comment_Count: {
                $size: "$video_Comment_Count"
            },
            Video_Likes_Count: {
                $size: "$Video_Likes_Count"
            },
            isPublish: {
                //Subscriber_Count Contain Channel,Subscriber All Value Of That Models
                if: { $in: [req.user?._id, "$Subscriber_Count.suscriber"] },
                then: true,
                else: false
            }
        },
        {
            $project: {
                videoFiles: 1,
                title: 1,
                description: 1,
                duration: 1,
                view: 1,
                isPublish: 1,
                owner: 1,
                Subscriber_Count: 1,
                video_Comment_Count: 1,
                Video_Likes_Count: 1
            }
        }
    ])
    if (!Get_Video) {
        throw new ApiError(404, "Aggegation Madhe Problem ahe ")
    }
    return res
        .status(200)
        .json(
            new ApiResponse(200, Get_Video[0], "Video Data fetch properly")
        )
})

const updateVideo = asyncHandler(async (req, res) => {
    //TODO: update video details like title, description, thumbnail
    // get Video Id 
    //validate title ,description
    //get thumnail
    //validate
    // Cloudinary Uplode kara
    //video find Karun Update kara
    // responce

    // get Video Id validate title ,description
    const videoId = req.params.videoId;
    const { title, description } = req.body;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Error Accure In getting Data like id ")
    }
    if (!(title.trim() || description.trim())) {
        throw new ApiError(400, "Error Accure In getting Data like title Description ")
    }

    // GEt Thumnail And Validate
    const Local_thumbnail_File = req.file.path;
    if (!Local_thumbnail_File) {
        throw new ApiError(400, "Error Accure In getting Thumnail")
    }
    // cloudinary
    const cloudynary_Thumnail = await uplodeCloudinary(Local_thumbnail_File)
    // Uplode Succesfully
    if (!cloudynary_Thumnail) {
        throw new ApiError(400, "Error Uploding on Cloudinary")
    }
    // Doute in Follo code // deleat Old File from Cloudinary

    const OLd_thumbnail_PublicId = await Video.findById(videoId).thumbnail.public_id
    const Deleat_Old_Thumnail_Files = Deleat_Cloudinary_File(OLd_thumbnail_PublicId)
    if (!Deleat_Old_Thumnail_Files) {
        throw new ApiError(404, "Deleting Problem in ")
    }

    // Get And Update Video Data
    const Video_d = await Video.findByIdAndUpdate(videoId, {

        $set: {
            title: title,
            description: description,
            thumbnail: {
                url: cloudynary_Thumnail?.url,
                public_id: cloudynary_Thumnail?.public_id,
            },
        }
    },
        {
            new: true
        }).select("-owner")

    // validation
    if (!Video_d) {
        throw new ApiError(402, "DataBase Sobat Bolyla ani update karyla Problem jat ahe")
    }
    // responce

    return res
        .status(200)
        .json(
            new ApiResponse(200, Video_d, "Update Succesfully")
        )
})

const deleteVideo = asyncHandler(async (req, res) => {
    //TODO: delete video 
    // Cloudinary Vrun Pan Kadayacha ahe Re


    //get id of video 
    //verify user
    //moongoDb Pasun Video cha data gheu
    // tyatun video ani Thumnail cHi Public id kadu
    // Cloudinay Delete na deleat karu
    // Validation
    //Database madhhun Deleat Karu
    // validation
    // Responce send Karu



    // /get id of video 
    //verify user
    const videoId = req.params.videoId;
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Error Accure In Finding Id")
    }

    //moongoDb Pasun Video cha data gheu
    const Delete_Video = await Video.findById(videoId);
    console.log(Delete_Video);

    // tyatun video ani Thumnail cHi Public id kadu
    const Video_Public_Id = Delete_Video.videoFiles.public_id;
    const Thumnail_Public_Id = Delete_Video.thumbnail.public_id;

    // Cloudinay Delete na deleat karu
    const Remove_Video_files = await Deleat_Cloudinary_File(Video_Public_Id, "video")
    const Remove_Thumbnail_files = await Deleat_Cloudinary_File(Thumnail_Public_Id)

    // Validation
    if (!(Remove_Thumbnail_files && Remove_Video_files)) {
        throw new ApiError(404, "Deletion on cloudinary Fails")
    }

    //Database madhhun Deleat Karu
    const Deleat_msg = await Delete_Video.deleteOne()
    // Validation
    if (!Deleat_msg) {
        throw new ApiError(404, "Deletion Of Account Fails")
    }
    return res.
        status(200)
        .json(
            new ApiResponse(200, "", "deleted Succesfully video")
        )
})

const togglePublishStatus = asynHandaler(async (req, res) => {
    // Toogle:-Switch the Case having Two Option(Public_Status)
    // Get Vidoe ID then Validate
    // Get MoonGo_DB By id 
    //Validation
    // See Ispublic If true false them and False to True OR Store Value Of IsPublice In a instance/Keyword
    // Validation
    // Responce   


    // Get Vidoe ID then Validate

    const videoId = req.params.videoId;


    if (!(isValidObjectId(videoId))) {
        throw new ApiError(404, "videoID  ID Absent")
    }

    const IsPublic_Instance = await Video.findById(videoId)

    // True Or False Value
    if (IsPublic_Instance.isPublish == true) {
        IsPublic_Instance.isPublish = false;

    } else {
        IsPublic_Instance.isPublish = true;
    }

    // update This values
    const Update_Value = await IsPublic_Instance.save(
        validitBeforeSave = true
    )
    console.log("Value Of video Db after Saving IsPublic value", Update_Value)
    // Validation
    if (!Update_Value) {
        throw new ApiError(404, "Save time Error Of IsPublice status")
    }

    return res.
        status(200)
        .json(
            new ApiResponse(200, Update_Value, "Value Of isPublice Change Succesfully")
        )
})


export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}