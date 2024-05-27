import Productive from "../models/productive.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";



const isProductive = asyncHandler(async (req, res) => {
    const { executable, isProductive, url } = req.body
    if (!executable) {
        res.status(400).json(new ApiResponse(400, {}, "executable is required"))
        throw new ApiError(400, "executable is required")
    }

    const newData = await Productive.create({
        executable: executable,
        isProductive: isProductive,
        url: url || "",
        user: req.user._id
    })

    res.status(200).json(new ApiResponse(200, newData, "Data added successfully"))

})

const getProductive = asyncHandler(async (req, res) => {

    const data = await Productive.find()

    res.status(200).json(new ApiResponse(200, data, "Data fetched successfully"))

})

const getProductiveByID = asyncHandler(async (req, res) => {

    const id = req.query.id
    if (!id) {
        res.status(400).json(new ApiResponse(400, {}, "executable is required"))
        throw new ApiError(400, "executable is required")
    }

    const data = await Productive.findById(id).populate("User")


    res.status(200).json(new ApiResponse(200, data, "Data fetched successfully"))
})

export { isProductive, getProductive, getProductiveByID }



