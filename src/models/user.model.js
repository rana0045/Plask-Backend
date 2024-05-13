import mongoose, { model } from "mongoose";
import Jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
const userSchema = new mongoose.Schema({

    firstName: {
        type: "String",


    },
    lastName: {
        type: "String",


    },
    phoneNumber: {
        type: "String",

    },
    organization: {
        type: "String",

    },
    email: {
        type: "String",
        unique: true,
        required: true,
    },
    password: {
        type: "String",


    },
    country: {
        type: "String",

    },

    image: {
        type: "String",
    },
    refreshToken: {
        type: "String",
    }

}, {
    timestamps: true, // this will automatically add createdAt and updatedAt fields
})

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()

})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = async function () {
    return Jwt.sign({
        _id: this._id,
        email: this.email,
        phone: this.phone,
        organization: this.organization,
        firstname: this.firstname,
        lastname: this.lastname,
    },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: "1d"
        }
    );
};

userSchema.methods.generateRefreshToken = async function () {
    return Jwt.sign({
        _id: this._id,
    },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: "10d"
        }
    );
};

export const User = mongoose.model("User", userSchema)