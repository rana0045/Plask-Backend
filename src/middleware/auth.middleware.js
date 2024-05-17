import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import Jwt from "jsonwebtoken";
export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = await req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

        if (!token) {
            res.status(400).json(new ApiResponse(400, {}, "unauthorized request"))
            throw new ApiError(401, "unauthorized request")
        }
        const decodedToken = Jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
        if (!user) {
            throw new ApiError(401, "invalid access token")
        }

        req.user = user
        next()
    } catch (error) {
        throw new ApiError(401, error.message || "invalid access token")
    }
}) 