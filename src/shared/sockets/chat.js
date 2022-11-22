const { connectedUsersMap } = require("./user");

class SocketIOChatHandler {
  constructor(io) {
    this.io = io;
  }

  listen() {
    this.io.on("connection", (socket) => {
      //when users open chat page they emit this event
      socket.on("join room", (users) => {
        const { senderName, receiverName } = users;
        const senderSocketId = connectedUsersMap.get(senderName);
        const receiverSocketId = connectedUsersMap.get(receiverName);
        //subscribe the socket to a given channel
        socket.join(senderSocketId);
        socket.join(receiverSocketId);
      });
    });
  }
}

module.exports = { SocketIOChatHandler };
