import { Server } from "socket.io";
import asyncHandler from "../utils/asyncHandler.js";
import { Employee } from "../models/employee.model.js"
import ApiError from "../utils/ApiError.js";
import Productive from "../models/productive.model.js";
import { User } from "../models/user.model.js";
const updateEmployeeActivities = async (data) => {
    try {
        // Check if req.user is defined and has the _id property



        const employee = await Employee.findOne({ key: data[0].userID });

        if (!employee) {
            throw new ApiError(404, "Employee not found");
        }



        employee.activities.push(...data);
        const savedEmployee = await employee.save();

        console.log(savedEmployee);
        return { success: true, message: "Employee activities updated successfully" };

    } catch (error) {
        console.error("Error updating employee activities:", error.message);
        return { success: false, message: error.message };
    }
}

const startSocketServer = asyncHandler(async (server) => {

    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ['GET', 'POST']
        }
    });

    var activities = []

    io.on("connection", (socket) => {
        console.log("A user connected",);

        socket.on("message", (data) => {

            console.log(data);

            activities.push(data)

            console.log("activities:", activities.length);


            if (activities.length >= 2) {
                updateEmployeeActivities(activities)
                activities = []
            }

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








