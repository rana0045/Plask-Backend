import mongoose from "mongoose";


const connectDB = async () => {
    try {
        const url = process.env.MONGODB_URI
        const connection = await mongoose.connect(url)
        console.log(`MongoDB connected: ${connection.connection.host}`);
    } catch (error) {
        console.log(error.message);
        process.exit(1)
    }
}



export default connectDB