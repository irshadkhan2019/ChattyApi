let socketIOUserObject;
class SocketIOUserHandler {
  constructor(io) {
    this.io = io;
    socketIOUserObject = io;
  }

  listen() {
    this.io.on("connection", (socket) => {
      socket.on("block user", (data) => {
        this.io.emit("blocked user id", data);
      });

      socket.on("unblock user", (data) => {
        this.io.emit("unblocked user id", data);
      });
    });
  }
}

module.exports = { SocketIOUserHandler };
