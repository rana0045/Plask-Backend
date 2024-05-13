import { Server } from "socket.io";

const startSocketServer = (server) => {

    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ['GET', 'POST']
        }
    });

    io.on("connection", (socket) => {
        console.log("A user connected",);

        socket.on("message", (data) => {
            console.log("Received message:", data);

            // Send a response back to the client
            socket.emit("hello", data)
            socket.emit("message", "Message received successfully!");
        });

        // Listener for "disconnect" event
        socket.on("disconnect", () => {
            console.log("User disconnected");
            // Handle disconnection event
        });

        // Custom event listener example
        socket.on("customEvent", (data) => {
            console.log("Received message:", data);

            // Send a response back to the client
            socket.emit("response", "Message received successfully!");

            // Handle custom event here
        });
    });
};


export { startSocketServer };
