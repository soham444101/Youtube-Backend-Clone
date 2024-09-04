import { Router } from "express";
import {VerifyJWT} from "../middleware/Auth.middleware.js"
import { upload } from "../middleware/multer.middleware.js";
import {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
} from "../controller/video.controller.js";

import { from } from "form-data";

const router = Router();


router.route('/Publish-Video').post(
    VerifyJWT,
    upload.fields(
        [{
            name:"Video",
            maxCount: 1
        },
        {
            name:"thumbnail",
            maxCount:1
        }
    ]
    ),publishAVideo
),
router.route('/get_Video').get(VerifyJWT,getVideoById),
router.route('/Updat_Video_Details').get(VerifyJWT , upload.single('thumbnail'),updateVideo);
router.route.apply('/Delete_VIdeo').post(VerifyJWT,deleteVideo)
router.route.apply('/Is_Public').post(VerifyJWT,togglePublishStatus)

export default router;