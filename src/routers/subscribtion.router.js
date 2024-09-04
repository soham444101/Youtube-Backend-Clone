import { Router } from "express";
import  {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
} from "../controller/suscribtion.controller.js";
import { VerifyJWT } from "../middleware/Auth.middleware.js";


const router = Router();

router.route('/Is_Subscribed').post(VerifyJWT,toggleSubscription)
router.route('/USer_Subscriber_Details').post(VerifyJWT,getUserChannelSubscribers)
router.route('/User_Channel_Details').post(VerifyJWT,getSubscribedChannels)
export default router;