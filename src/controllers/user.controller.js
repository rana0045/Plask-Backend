import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";


const generateTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    // Get user details
    const { firstName, lastName, email, phoneNumber, organization, password, country } = await req.body;

    // Validate the data
    if ([firstName, lastName, email, organization, password, country].some((field) => field?.trim() === "")) {
        res.status(400).json(404, "All fields are required")
        throw new ApiError(404, "All fields are required");
    }

    // Check if user exists with email or phone
    const isUser = await User.findOne({
        $or: [{ email }, { phone: phoneNumber }],
    });

    if (isUser) {
        res.status(400).json(400, "User with email or phone already exists")
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

    const { email, password } = await req.body
    if (!email && !password) {
        throw new ApiError(400, "email & password is required")
    }

    const user = await User.findOne({ email })
    if (!user) {
        throw new ApiError(401, "User not found!")
    }


    const isPasswordCorrect = await user.isPasswordCorrect(password)
    if (!isPasswordCorrect) {
        res.status(400).json(new ApiResponse(400, "", "password is incorrect!"))
        throw new ApiError(401, "password is incorrect!")
    }

    const { accessToken, refreshToken } = await generateTokens(user._id)

    const loggedInUser = await User.findById(user.id).select("-password -refreshToken")

    const options = {
        httpOnly: false,
        secure: false
    }


    return res.
        status(200).
        cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User logged in successfully!"))

})


const updateUser = asyncHandler(async (req, res) => {



    const updates = await req.body

    const user = await User.findById(req.user._id)
    if (!user) {
        throw new ApiError(404, "User not found!")
    }

    const email = updates.email
    const isEmailExist = await User.findOne({ email })

    if (isEmailExist && isEmailExist._id !== req.user._id && isEmailExist.email === email) {
        res.status(400).json(new ApiResponse(400, "Email already exists", ""))
        throw new ApiError(400, "Email already exists")
    }
    Object.assign(user, updates)
    await user.save({ validateBeforeSave: false })

    const updatedUser = await User.findById(req.user._id).select("-password -refreshToken");
    return res.status(200).json(new ApiResponse(200, updatedUser, "User updated successfully"));

})


const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, {
        $set: {
            refreshToken: undefined
        },

    }, {
        new: true
    }
    )

    const options = {
        httpOnly: false,
        secure: false
    }

    return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(new ApiResponse(200, {}, "User logged out successfully", ""))



})




const googleRegister = asyncHandler(async (req, res) => {
    //get the user data from req body
    const { firstName, lastName, email, image } = req.body;
    console.log(req.body);
    //validate the data coming from the user
    if ([firstName, lastName, email, image].some((field) => field?.trim() === "")) {
        res.status(400).json(404, "All fields are required")
        throw new ApiError(404, "All fields are required");
    }

    //check if the user already exists
    const userExists = await User.find({ email })
    if (!userExists) {
        res.status(400).json(404, "User already exists")
        throw new ApiError(404, "User already exists");
    }

    //create a new user
    const user = await User.create({
        firstName,
        lastName,
        email,
        image,

    })

    //check if user created or not
    const createdUser = await User.findById(user.id)

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong creating user");
    }

    res.status(200).json(new ApiResponse(200, createdUser, "User created successfully"))

})

const googleLogin = asyncHandler(async (req, res) => {
    const email = req.body
    const user = await User.findOne(email).select("-refreshToken")
    if (!user) {
        res.status(400).json(404, "User not found")
        throw new ApiError(404, "User not found");
    }
    const { accessToken, refreshToken } = await generateTokens(user._id)

    const options = {
        httpOnly: true,
        secure: false
    }

    res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, { user: user, accessToken, refreshToken }, "User logged in successfully!"))


})


export { registerUser, loginUser, updateUser, logoutUser, googleRegister, googleLogin };






