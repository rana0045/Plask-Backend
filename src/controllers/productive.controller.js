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

    const id = req.user._id

    const data = await Productive.find({ user: id })


    res.status(200).json(new ApiResponse(200, data, "Data fetched successfully"))

})

const getProductiveByID = asyncHandler(async (req, res) => {

    const id = req.query.id
    if (!id) {
        res.status(400).json(new ApiResponse(400, {}, "executable is required"))
        throw new ApiError(400, "executable is required")
    }


    const data = await Productive.findById(id).populate("user")


    res.status(200).json(new ApiResponse(200, data, "Data fetched successfully"))
})

const deleteProductiveByID = asyncHandler(async (req, res) => {
    const id = req.query.id
    console.log(id);
    if (!id) {
        res.status(400).json(new ApiResponse(400, {}, "ID is required"))
        throw new ApiError(400, "ID is required")
    }
    const Data = await Productive.findByIdAndDelete(id)

    res.status(200).json(new ApiResponse(200, Data, "Data deleted successfully"))
})

const updateProductiveByID = asyncHandler(async (req, res) => {
    const id = req.query.id
    const { executable, isProductive, url } = req.body
    if (!id) {
        res.status(400).json(new ApiResponse(400, {}, "ID is required"))
        throw new ApiError(400, "ID is required")
    }

    const data = await Productive.findByIdAndUpdate(id, {
        executable: executable,
        isProductive: isProductive,
        url: url
    }, { new: true, runValidators: false })

    if (!data) {
        res.status(400).json(new ApiResponse(400, {}, "record not found"))
        throw new ApiError(400, "record not found")
    }
    res.status(200).json(new ApiResponse(200, data, "Data updated successfully"))

})
export { isProductive, getProductive, getProductiveByID, deleteProductiveByID, updateProductiveByID }



