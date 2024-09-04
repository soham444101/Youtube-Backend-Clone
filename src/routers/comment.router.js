import { Router } from "express";
import  {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
} from "../controller/comment.controller.js"
import { from } from "form-data";
import { VerifyJWT } from "../middleware/Auth.middleware.js";

const router = Router();
router.use(VerifyJWT)

router.route('/VideoId').post(addComment).get()
router.route('/Update_Comment').post(updateComment)



export default router;