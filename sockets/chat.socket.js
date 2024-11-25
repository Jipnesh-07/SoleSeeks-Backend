const socketIO = require('socket.io');

module.exports = (server) => {
    const io = socketIO(server, {
        cors: {
            origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:5173"],
            credentials: true
        }
    });

    io.on("connection", (socket) => {
        console.log("A user connected");

        socket.on("new-message", (data) => {
            if (!data || !data.groupId || !data.userId || !data.conversationMembers) return;
            data.conversationMembers.forEach(member => {
                if (member !== data.userId) {
                    io.emit(`${member}-new-message`, data);
                }
            });
        });

        socket.on("disconnect", () => {
            console.log("User disconnected");
        });
    });

    return io;
};
