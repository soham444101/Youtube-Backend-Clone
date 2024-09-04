// import { message } from "statuses"
import { asynHandaler } from "../utilites/AsynHandler.js";
import { ApiError } from "../utilites/APIError.js";
import { uplodeCloudinary } from "../utilites/cloudany.js"
import { ApiResponse } from "../utilites/API.responce.js";
import { c } from "tar";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { User } from "../model/USer.model.js";

const GenerateAccessAndRefresghToken = async (user_id) => {
   try {
      // Find User On bases Of Their ID
      const user = await User.findById(user_id)
      const refreshT = user.GenerateRefreshToken();
      const AcceseT = user.GenerateAccessToken();

      user.refreshToken = refreshT;// Saving refresh Token to database
      // In time of saving data in mongoose Db required field also need 
      await user.save({
         validitBeforeSave: false // No Validation on time of save
      })

      return { AcceseT, refreshT }

   } catch (error) {
      throw new ApiError(501, "Error Occure During Access ANd refresh Token Generation")
   }
}

// Algorithem for Registration

//1. gettting follow thing from user
//2.checking follow things are empoty or not ( Vaildation )
//3.User Exist Or Not Here(// usear exist then show error )
//4.validation for avtar and imangecover
//5. uplode in cloudnary 
//6.checking Avtar (Required field )
//7.crete object an entry in DB
// 8.user form or not check here // And Removing The Password and refreshtoken field from here
const registerUser = asynHandaler(async (req, res) => {

   // gettting follow thing from user
   
   const {username,email,fullname,passsword} = req.body;
   console.log('Response body:', req.body);
   console.log(email)

   // checking follow things are empty or not

   // if ([username, email, fullname, passsword].some((field).field?.trim === "")) {
   //    throw new ApiError(400, "ALLFIELD ARE REQUORED")
   // }
   // OR
   if (username === "") {
      throw new ApiError(400, "USERNAME IS REQUIRED")
   } 
   if (email === "") {
      throw new ApiError(400, "USERNAME IS REQUIRED")
   } 
   if (fullname === "") {
      throw new ApiError(400, "USERNAME IS REQUIRED")
   } 
   if (passsword === "") {
      throw new ApiError(400, "pass IS REQUIRED")
   } 


   // Vaildation of User Exist Or Not Here

   
   const ExistUser = await User.findOne({
      $or: [{ username }, { fullname }, { email }]// we use here $ or  for the checking fullname ,email ,username allin one  
   })
   // usear exist then show error 
   if (ExistUser) {
      throw new ApiError(409, "Usearname and email user alraedy exist")
   }
   //validation for avtar and imangecover

   const avtarLocalPath = req.files?.avtar[0].path;
   // another way to write
   let coverimageLocalPath;
   // req.files because of the avtar and coverImage File
   if (req.files && Array.inArray(req.files.coverimage) && req.files.coverimage.length > 0) {
      coverimageLocalPath = req.files.coverimage[0].path;
   }
   //check  avtar exist or not
   if (!avtarLocalPath) {
      throw new ApiError(400, "Avtar file IS Required")
   }

   // uplode in cloudnary  
   const uploadingAvtar = await uplodeCloudinary(avtarLocalPath)
   const uploadingCoverIMage = await uplodeCloudinary(coverimageLocalPath)
   // checking Avtar Required field 
   if (!uploadingAvtar) {
      throw new ApiError(400, "Avtar file  Required(unuplode in cloud)")
   }

   //crete object an entry in DB
   const User = await User.create({
      fullname,
      email,
      username,
      passsword,
      avtar: uploadingAvtar.url,
      coverimage: uploadingCoverIMage?.url || "" // we not vailde coverimage is present  or not(check it)

   })

   // user form or not check here // And Removing The Password and refreshtoken field from here
   // Not an optimized methode of this
   const CreateUSer = User.findbyid(User_id).select(
      "-passsword -refreshToken"
   )
   if (!CreateUSer) {
      throw new ApiError(500, 'Registration fail due to server problem')
   }
   return res.status(201).json(
      new ApiResponse(200, CreateUSer, "User Register Succesfully")
   )
})


const loginUser = asynHandaler(async (req, res) => {
   // req.body data
   //username &email
   //find the user
   //password  check
   // Accese and refresh token
   // send cookies of accese and refresh token
   const { username, email, passsword } = req.body;
   //username &email check
   if ((!(username || email))) {
      throw new ApiError(404, "Username Or Email Already Exixt")
   }
   // user present or not check
   const ExistUsers = await User.findOne(
      $or = { username }, { email }
   )
   if (!ExistUsers) {
      throw new ApiError(404, "Usearname and email user alraedy exist")
   }
   //password correct or wrong by bycypt

   const isPasswordValide = await ExistUsers.isPasswordCorrect(passsword);
   //if password  wrong 
   if (!isPasswordValide) {
      throw new ApiError(401, "Password is Incorrect ")
   }
   //access and refreshtoken

   // Desructure access And refresh token 
   const { AcceseT, refreshT } = await GenerateAccessAndRefresghToken(ExistUsers._id)
   // we have exist access token and refresh token but this is not save in the ExistUser WE have (We get mongoose Db User before calling the funtion og genereting  access and refresh token)


   //So We can Update Or Reget The ExistUser From User(use one of them on our usese)

   // We not need to call Db For This we Update the db
   const LogInUser = await User.findById(ExistUsers._id).
      select(
         "-password -refreshToken"
      )// .select we select ar avoid the field we want or don't want to passed

   const option = {
      httpOnly: true,// the cookies is only modified by the server not the frontend 
      secure: true,
   }

   return res
      .status(200)
      .cookie("AccessToken", AcceseT, option)
      .cookie("Refreshtoken", refreshT, option)
      .json(
         new ApiResponse(
            200,
            {
               user: LogInUser, AcceseT, refreshT// optional send access and refresh token

            },
            "User Login Success Fully"
         )
      )

})


// User find Karun RefreshToken : Undefine kela
// option set kele
// res madun Cookies clear kela
// json responce send kela

const LogoutUser = asynHandaler(async (req, res) => {
   const UserAfterRemovingRefreshToken = await User.findByIdAndUpdate(req.user_id,
      {
         $unset: {
            refreshToken: 1 // Unset the refreshtoken from db
         }
      },
      {
         new: true // To get new Value of USer Without refreshToken

      }
   )

   const option = {
      httpOnly: true,// the cookies is only modified by the server not the frontend 
      secure: true,
   }

   return res
      .status(200)
      .clearCookies("AccessToken")
      .clearCookies("Refreshtoken")
      .json(
         new ApiResponse(
            200,
            {},
            "USer Logged Out Succesfully "
         )
      )
})

// We are doing for the to get access Token (after Expire ) form Refresh token .
const AccessToken_Regenerate_Using_RefreshToken = asynHandaler(async (req, res) => {
   // cookies pasun refreshtoken yenr
   // check ala ka tr
   // decode kara token la jwt verify ni
   // user ghay moongo DB Pasun 
   // Campare kara moongo Db madhe save ahe te ani user karun alelya cookies pasun

   const Importing_Refresh_Token_From_Cookies = req.cookies?.Refreshtoken || req.body?.Refreshtoken
   if (!Importing_Refresh_Token_From_Cookies) {
      throw new ApiError(401, "Invalide Access")
   }

   const DecodedToken = jwt.verify(Importing_Refresh_Token_From_Cookies, process.env.REFRESH_TOKEN_SECRET)
   const user = await User.findById(DecodedToken?._id)
   if (!user) {
      throw new ApiError(401, "Invalide Refresh Token ")
   }
   if (user?.refreshToken !== DecodedToken) {
      throw new ApiError(401, "Refresh Token Expire , Login In AnotherTime")
   }
   const { AcceseT, refreshT } = await GenerateAccessAndRefresghToken(user._id)
   const option = {
      httpOnly: true,
      secure: true,
   }
   return res.status(200)
      .cookie("AccessToken", AcceseT, option)
      .cookie("RefreshToken", refreshT, option)
      .json(
         new ApiResponse(
            201,
            {
               AcceseT,
               refreshT
            },
            "Access Token Refresh Succesfully"
         )
      )
}
)

// For Create New Password
const Change_Password = asynHandaler(async (req, res) => {
   // Get Old And New Password
   // check old password correct or not
   //add new password to database
   // save the password
   //return responce
   const { oldPassword, newPassword, confPassword } = req.body;
   if (!(newPassword === confPassword)) {
      throw new ApiError(402, 'Conform and new password not match')
   }
   const user = User.findById(oldPassword?._id)
   const is_password_Correct = await user.isPasswordCorrect(oldPassword)
   if (!is_password_Correct) {
      throw new ApiError(401, "Password Is Wrong ")
   }
   user.passsword = newPassword
   await user.save({ validitBeforeSave: false })
   return res
      .status(201)
      .json(
         new ApiResponse(200, {}, 'Password Is Udated')
      )
}
)
// for feathing current user information 
const get_Current_user = asynHandaler(async (req, res) => {
   return res.status(200)
      .json(
         new ApiResponse(200, req.user, "Featch CurrentUser info")
      )
}
)

// Update The NoFile Detail In Account 
const UpdateAccountDetails = asynHandaler(async (req, res) => {

   // filename  ,Email , other Fields We Put When we Want
   // validate kela ale ki nahi manun
   //user DB Madhe Find Kela ani 
   // Update Kela Je JE Change KArche Ahet te
   // Return Kela Responce

   const { fullname, email } = req.body;

   if (!(fullname)) {
      throw new ApiError(401, "Fullname Is ReQuired")
   }
   if (!(email)) {
      throw new ApiError(401, "Email Is ReQuired")
   }
   // we Make Call To find User Then update
   // we apply Select After An another Query Call
   // Only one call With DB
   const user = User.findByIdAndUpdate(
      req.user?._id,
      {
         $set: {
            fullname: fullname,
            email: email,
         }
      },
      {
         new: true
      }
   ).select("-passsword -refreshToken")

   return res.status(200)
      .json(
         new ApiResponse(200, { user }, "fullname & Email Update")
      )
}
)

//File Update Keep Seperate 
// First update Avtar
const UpdateAvtar = asynHandaler(async (req, res) => {
   // Write Multer middleware , Auth Middleware to the router we write

   // Get The Avtar File From the req.files
   // validate the avtar image is present or not 
   // cloudinary call for update
   // update that Url To the DB 
   // Send Return responce


   // req.file because here only one file is present(avtar)
   const avtarLocal = req.file.path;

   if (!avtarLocal) {
      throw new ApiError(401, " Avatar is required")
   }
   const avtar = await uplodeCloudinary(avtarLocal);

   if (!avtar.url) {
      throw new ApiError(401, " Avatar not Uplode Properly ")
   }
   const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
         $set: {
            avtar: avtar.url,
         }
      },
      {
         new: true,
      }
   ).select("-passsword  -refreshToken")
   // deleat old image we store to avtar
   return res
      .status(200)
      .json(
         new ApiResponse(200, user, "Avatar SuccesFully Uploded")
      )
}
)

const UpdatecoverImage = asynHandaler(async (req, res) => {
   // Write Multer middleware , Auth Middleware to the router we write

   // Get The CoverImage File From the req.files
   // validate the avtar image is present or not 
   // cloudinary call for update if previous CoverImage present 
   // update that Url To the DB 
   // Send Return responce


   // req.file because here only one file is present(avtar)
   const CoverImaegeLocalpath = req.file.path;

   if (!CoverImaegeLocalpath) {
      throw new ApiError(401, " CoverImage is required")
   }
   const CoverImage = await uplodeCloudinary(CoverImaegeLocalpath);

   if (!CoverImage.url) {
      throw new ApiError(401, " CoverImage not Uplode Properly ")
   }
   const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
         $set: {
            coverimage: CoverImage.url,
         }
      },
      {
         new: true,
      }
   ).select("-passsword  -refreshToken")

   return res
      .status(200)
      .json(
         new ApiResponse(200, user, "CoverImage SuccesFully Uploded")
      )
}
)
// The Channel Profile Present Of A User
// We have to show the subscribers & No OF Subscribers,Subscribe Or not Such Things Using(Aggeregation Pipeline)
const Get_User_Channel_Profiles = asynHandaler(
   async (req, res) => {
      // Get The Username Or Fullname From Url 
      // valide ahe ki nahi check karu
      //moongo db madhe user find Karu 
      // Aggeration pipeline through  Kadhu ani Project karu
      //Validations 
      //json responce kadhu

      // Get The Username Or Fullname From Url 
      const { username } = req.params;

      // valide ahe ki nahi check karu
      if (!username?.trim()) {
         throw new ApiError(400, "Username is Missing")
      }
      // Direct Aggegration Pipeline use karu
      const Channel = await User.aggregate([

         // Match The Particular User
         {
            $match: {
               username: username
            }
         },
         // Subscriber Of Channels
         {

            $lookup:
            {
               from: "suscriptions",
               localField: "_id",
               foreignField: "channel",
               as: "SubscribersOfChannel",
            }
         },
         // Subscrib To Count
         {
            $lookup:
            {
               from: "suscriptions",
               localField: "_id",
               foreignField: "suscriber",
               as: "Subscribers_To"
            }
         },
         // addnewFiel & Count the things
         {
            $addFields: {
               Subscriber_Count: {
                  $Size: "$SubscribersOfChannel"
               },
               Subscribed_To_Me_Count: {
                  $Size: "$Subscribers_To"
               },
               Is_Subcribed: {
                  $cond: {
                     if: { $in: [req.user_id, "$suscriptions.suscriber"] },
                     then: true,
                     else: false
                  }
               }
            }
         }
         ,
         // Project The keyword WE Want To Show
         {
            $project: {
               fullname: 1,
               avtar: 1,
               coverimage: 1,
               username: 1,
               Subscriber_Count: 1,
               Subscribed_To_Me_Count: 1,
               Is_Subcribed: 1
            }
         }

      ])

      //Validations
      if (!Channel.length) {
         throw new ApiError(400, "Error In aggeration pipelineS")
      }

      // Responce Send
      return res.
         status(200)
         .json(
            new ApiResponse(200, Channel[0], "User Channel Fetched Successfully")
         )

   })

const Get_Watch_History = asynHandaler(async (req, res) =>
    {
      //Algorithem
      //WatchHistory lookup Karchi
      // Tynatr User lookup Karycha ty Video model Madhlya User la
      // project
      // vlidations
      //responce


      const user=await User.aggregate([
        // Match Use 
         {
            $match:{
               _id:new mongoose.Types.ObjectId(req.user?._id)// This We Use Because Of We Directly Coonect to moongoDB WithOut Mongoose So We Need this
            }
         },
         // Lookups used Nested
         {
           $lookup:{
               from: "videos",
               localField: "watchistory",
               foreignField: "_id",
               as: "watchistory",
               pipeline:[
                  {  $lookup:{
                     from: "users",
                     localField: "owner",
                     foreignField: "_id",
                     as: "Owner",
                     pipeline:[
                        {
                           $project:{
                              fullname:1,
                              username:1,
                              avtar:1
                           }
                        }
                     ]
                     }
                  },
                  {
                     // We Use This Because to Get first Arrya Value directly

                     $addFields:{
                         $first:"$Owner"
                     }
                  }
               ]
            }
           
         }
      ])

      if (!user.length) {
         throw new ApiError(400,"Watchistory Aggegration pipeline Problem")
      }

      return res.
      status(200)
      .json(
         new ApiResponse(200,user[0].watchistory,"Watchistory Of the User Fetch Here")
      )
    })
export {
   registerUser,
   loginUser,
   LogoutUser,
   AccessToken_Regenerate_Using_RefreshToken,
   Change_Password,
   get_Current_user,
   UpdateAccountDetails,
   UpdateAvtar,
   UpdatecoverImage,
   Get_User_Channel_Profiles,
   Get_Watch_History
}