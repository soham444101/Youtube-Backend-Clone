//me
import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";// use jani data phatavla tylach data share karnr asa akarte haaaa(high security)
const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            require: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        email: {
            type: String,
            require: true,
            unique: true,
            trim: true,
        },
        fullname: {
            type: String,
            require: true,
            trim:true,
            index: true,
        }
        , avtar: {
            type: String, // Cloudinary Url
            require: true,

        }
        , coverimage: {
            type: String//clodanary
        },
        watchistory: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Video',
            }
        ],
        passsword: {
            type: String,
            require: [true, 'Password Is Required']
        }
        , refreshToken: {
            type: String
        }
    }, {
    timestamps: true
}


)

// encrupt password with help of bycrpt 

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password =  bcrypt.hash(this.password/*kay hash karach ahe/, 10/*no of hashing*/ );
    next();
});
                                                                                                                                                                                 
// check paassword correct or not by bycrypt

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password/*Coming from user in string form*/, this.password/*Coming from database in encrypted form*/)
}

userSchema.methods.GenerateAccessToken = function () {
    return jwt.sign(
        {//paylode=data
            /*Coming from database*/    
            _id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname,
        },
        process.env.ACCESS_TOKEN_SECRET,/*Coming from .env*/
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
};

userSchema.methods.GenerateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
};





export  const User = mongoose.model('User', userSchema);
 
