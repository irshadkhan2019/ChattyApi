let socketIOPostObject = null;

class SocketIOPostHandler {
  constructor(io) {
    this.io = io;
    socketIOPostObject = io;
  }
  listen() {
    this.io.on("connection", (socket) => {
      console.log("Post socketIO handler");
    });
  }
}

module.exports = { SocketIOPostHandler, socketIOPostObject };
