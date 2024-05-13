import { Server } from "socket.io";
import asyncHandler from "../utils/asyncHandler.js";

const startSocketServer = asyncHandler(async (server) => {

    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ['GET', 'POST']
        }
    });


    const activities = []

    io.on("connection", (socket) => {
        console.log("A user connected",);

        socket.on("message", (data) => {
            console.log("Received message:", data);


            activities.push(data)

            console.log("activities:", activities);

            socket.emit("hello", data)
            socket.emit("message", "Message received successfully!");
        });

        // Listener for "disconnect" event
        socket.on("disconnect", () => {
            console.log("User disconnected");
            // Handle disconnection event
        });



    });

})
export { startSocketServer };






