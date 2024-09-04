import cors from "cors";
import cookieParser from "cookie-parser";
import e from "express";
import { extension } from "mime-types";
const app = e();


app.use(cors(
    {   
        origin: process.env.CORS_ORIGIN,
        Credential: true,
    }
)) 

app.use(e.json({ limit: '20kb' }))
// url Encoder For Decode the Url Special Having Special Character.
// extended use for nested object (optional)
app.use(e.urlencoded({ extended: true, limit: '20kb' }))
// Public(folder) Assect to store the Files and other things
app.use(e.static("public"))
//cookies access,set and operation we perform with the help of this:-{CURD operation}
app.use(cookieParser())


/// router import 

import userouter from './routers/user.router.js';
import videorouter from './routers/video.router.js'
 
// router declare
app.use("/user", userouter)
// http://localhost:4000/api/v1(version01)/users
app.use("/video", videorouter)
export { app }