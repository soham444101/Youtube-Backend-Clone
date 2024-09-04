import { User } from "../model/USer.model.js";
import { ApiError } from "../utilites/APIError.js";
import { asynHandaler } from "../utilites/AsynHandler.js";
import jwt from "jsonwebtoken";


//Cookies betali req pasun (Accesstoken)
//token check
// jwt.verify na verify karu
//DecodedToken token milnar
// req.user or req.anothername madhe find kelela user send krnr
// next()
export const VerifyJWT = asynHandaler(async (req, _, next) => {
    try {
        const Token = req.cookies?.AccessToken || req.header("Authorization")?.replace("Bearer ", "")
        if (!Token) {
            new ApiError(401, "Unvalide Access Token")
        }

        const DecodedINfoToken = jwt.verify(Token, process.env.ACCESE_TOKEN_SECRET)
        const user = await User.findById(DecodedINfoToken?._id).select("-password -refreshToken")
        if (!user) {
            throw new ApiError(401, "Unvalide Access Token")
        }
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error.message || "Invalide Access Token")
    }
}
)