let socketIOFollowerObject;

class SocketIOFollowerHandler {
  constructor(io) {
    this.io = io;
    socketIOFollowerObject = io;
  }

  listen() {
    this.io.on("connection", (socket) => {
      socket.on("unfollow user", (data) => {
        this.io.emit("remove follower", data);
      });
    });
  }
}

module.exports = { SocketIOFollowerHandler, socketIOFollowerObject };
