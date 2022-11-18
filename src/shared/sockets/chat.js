let socketIOChatObject;

class SocketIOChatHandler {
  constructor(io) {
    this.io = io;
    socketIOChatObject = io;
  }

  listen() {
    this.io.on("connection", (socket) => {
      socket.on("join room", (data) => {
        console.log(data);
      });
    });
  }
}

module.exports = { SocketIOChatHandler, socketIOChatObject };
