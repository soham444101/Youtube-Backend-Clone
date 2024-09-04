import mongoose, { Schema } from "mongoose";

const playlist_Schema = new Schema(
  {
    // We Can ADD Thumbnail Here For Playlist
    name: {
      type: String,
      require: true
    },
    description: {
      type: String,
      require: true
    },
    videos: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video"
      }
    ],
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      require: true
    },
    thumbnails:{
      type:String,// Url of cloudinary,
      require:true
    }

  },
  {
    timestamps: true
  }
)

export const Playlist = mongoose.model('Playlist', playlist_Schema)