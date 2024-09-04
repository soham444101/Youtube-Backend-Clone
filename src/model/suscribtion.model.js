import mongoose,{Schema} from "mongoose";
const SuscriptionSchema = new Schema(
    {
    suscriber:{
        typeof: Schema.Types.ObjectId,// the Suscriber Who Suscribe
        ref:"User"
    },
    channel:{
        typeof: Schema.Types.ObjectId,// the channel Whom Sucriber Suscribe
        ref:"User"
    },
    },
    {
        timestamps:true,
    }
)

export const Suscription = mongoose.model("Suscription",SuscriptionSchema)