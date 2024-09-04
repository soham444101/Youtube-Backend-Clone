import mongoose, {isValidObjectId} from "mongoose"
import { Playlist } from "../model/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    //TODO: create playlist
    // Get The USerId From The user check It
    // name and decription Of The Playlist
    // validate It
    // name playlist exist karte ki Nahi
    //if yes say this playlist name playlist already
    //else crete the playlist//'
    // Validate It
    //cretes the responce
    
    const {name, description} = req.body;
    const owner_id =req.user?._id;
    //Validation
    if (!name && !description) {
        throw new ApiError(404,"Name and Description Is Required")
    }
    if (!isValidObjectId(owner_id)) {
        throw new ApiError(404,"User Id Is Not Valide")
    }

    // Exist One Find
    const Exist_Playlist = await Playlist.findOne({
        owner:owner_id,
        name:name,
    })
    //validation
    if (Exist_Playlist.length == 0) {
        await Playlist.create(
            {
                name:name,
                description:description,
                owner:owner_id
            }
        )

    } else {
        
    }
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
