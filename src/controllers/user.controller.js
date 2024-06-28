import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import bcrypt, { hash } from "bcrypt"
const generateTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
};

const registerUser = asyncHandler(async (req, res) => {
    // Get user details
    const { firstName, lastName, email, phoneNumber, organization, password, country } = await req.body;

    // Validate the data
    if ([firstName, lastName, email, organization, password, country].some((field) => field?.trim() === "")) {
        res.status(400).json(404, "All fields are required");
        throw new ApiError(404, "All fields are required");
    }

    // Check if user exists with email or phone
    const isUser = await User.findOne({
        $or: [{ email }, { phone: phoneNumber }],
    });

    if (isUser) {
        res.status(400).json(400, "User with email or phone already exists");
        throw new ApiError(409, "User with email or phone already exists");
    }

    // Create user object and create entry in database
    const user = await User.create({
        firstName,
        lastName,
        email,
        phoneNumber,
        organization,
        password,
        country,
    });

    // Remove password from the response
    const createdUser = await User.findById(user.id).select("-password -refreshToken");

    // Check if the user was created
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong creating user");
    }

    // Return response
    return res.status(200).json(new ApiResponse(200, createdUser, "User created successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = await req.body;
    if (!email && !password) {
        throw new ApiError(400, "email & password is required");
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(401, "User not found!");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
        res.status(400).json(new ApiResponse(400, "", "password is incorrect!"));
        throw new ApiError(401, "password is incorrect!");
    }

    const { accessToken, refreshToken } = await generateTokens(user._id);

    const loggedInUser = await User.findById(user.id).select("-password -refreshToken");

    const options = {
        httpOnly: false,
        secure: false, // Set to true for HTTPS, required when SameSite=None
        sameSite: 'None' // Required for cookies to be sent in cross-origin requests
    };


    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User logged in successfully!"));
});

const updateUser = asyncHandler(async (req, res) => {
    const updates = await req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(404, "User not found!");
    }

    const email = updates.email;
    const isEmailExist = await User.findOne({ email });

    if (isEmailExist && isEmailExist._id !== req.user._id && isEmailExist.email === email) {
        res.status(400).json(new ApiResponse(400, "Email already exists", ""));
        throw new ApiError(400, "Email already exists");
    }

    if (updates.password && updates.oldPassword == undefined) {
        res.status(409).json(new ApiResponse(409, "Old password is required", ""));
        throw new ApiError(409, "Old password is required");
    }

    if (updates.oldPassword) {
        const hashPass = await bcrypt.compare(updates.oldPassword, user.password)

        if (hashPass === false) {
            res.status(409).json(new ApiResponse(409, "Incorrect password", ""));
            throw new ApiError(409, "Incorrect password");
        }
    }
    Object.assign(user, updates);
    await user.save({ validateBeforeSave: false });

    const updatedUser = await User.findById(req.user._id).select("-password -refreshToken");
    return res.status(200).json(new ApiResponse(200, updatedUser, "User updated successfully"));
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined,
            },
        },
        {
            new: true,
        }
    );

    const options = {
        httpOnly: false,
        secure: false,
    };

    return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(new ApiResponse(200, {}, "User logged out successfully", ""));
});

const googleLogin = asyncHandler(async (req, res) => {
    // Get the user data from req body
    const { firstName, lastName, email, image } = req.body;

    // Validate the incoming data
    if ([firstName, lastName, email, image].some((field) => !field?.trim())) {
        res.status(400).json(new ApiResponse(400, "", "All fields are required"));
        return;
    }

    // Check if the user already exists
    const userExists = await User.find({ email }).select("-password -refreshToken");

    // If user exists, generate tokens and send response
    if (userExists.length > 0) {
        const { accessToken, refreshToken } = await generateTokens(userExists[0]._id);
        const options = {
            httpOnly: false,
            secure: false, // Set to true if using HTTPS in production
            sameSite: "None", // Ensure this is correctly spelled
        };

        // Set cookie

        res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(new ApiResponse(200, { user: userExists, accessToken, refreshToken }, "User logged in successfully!"));
        return
    }

    // Create a new user
    const user = await User.create({
        firstName,
        lastName,
        email,
        image,
    });
    // Check if user created successfully
    if (!user) {
        throw new ApiError(500, "Something went wrong creating user");
    }
    // Generate tokens for the new user
    const { accessToken, refreshToken } = await generateTokens(user._id);
    const options = {
        httpOnly: false,
        secure: false,
        sameSiteL: "none",

    };
    // Send response for the new user
    res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, { user, accessToken, refreshToken }, "User created successfully!"));
});

export { registerUser, loginUser, updateUser, logoutUser, googleLogin };