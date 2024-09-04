import { Router } from "express";
import {
    registerUser
    , loginUser,
    LogoutUser,
    AccessToken_Regenerate_Using_RefreshToken,
    Change_Password,
    get_Current_user,
    UpdateAccountDetails,
    UpdateAvtar,
    UpdatecoverImage,
    Get_User_Channel_Profiles,
    Get_Watch_History
} from "../controller/user.controller.js";
import { upload } from "../middleware/multer.middleware.js"
import { VerifyJWT } from "../middleware/Auth.middleware.js";


const router = Router();
router.route('/register').post(
    upload.fields(
        [
            {
                name: "avtar",
                maxCount: 1
            },
            {
                name: "coverimage",
                maxCount: 1
            }]
    )
    ,
    registerUser
)
router.route('/login').post(loginUser)
router.route('/logout').post(VerifyJWT, LogoutUser)
router.route('/refresh-Token').post(AccessToken_Regenerate_Using_RefreshToken)
router.route('/update_Password').post(Change_Password)
router.route('/get_Current_user_Info').get(VerifyJWT, get_Current_user) // Not Creating and Updating Data
router.route('/UpdateAccountDetails').patch(VerifyJWT, UpdateAccountDetails)// Not Change all things 

// single we use see changes
router.route('/UpdateAvtar').patch(VerifyJWT, upload.single('avtar'
), UpdateAvtar)

// 
router.route('/UpdatecoverImage').patch(VerifyJWT, upload.fields(
    [
        {
            name: "coverimage",
            maxCount: 1
        }]
), UpdatecoverImage)
router.route("/Channel_Profile/:username").get(VerifyJWT,Get_User_Channel_Profiles)
router.route("/Watch_History").get(VerifyJWT,Get_Watch_History)

export default router; 