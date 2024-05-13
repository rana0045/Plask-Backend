import connectDB from "./db/connect.js";
import dotenv from "dotenv"
import { startSocketServer } from "./socket/socket.js";
import app from "./app.js";

dotenv.config({
    path: "./env"
});

connectDB().then(() => {
    const server = app.listen(process.env.PORT, () => {
        console.log("app is running on the port:", process.env.PORT);
    })
    startSocketServer(server)


}).catch((error) => {
    console.log(error.massage);
})

