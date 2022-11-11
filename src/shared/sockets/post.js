let socketIOPostObject;

class SocketIOPostHandler {
  constructor(io) {
    this.io = io;
    socketIOPostObject = io;
  }
  listen() {
    // console.log(socketIOPostObject);
    this.io.on("connection", (socket) => {
      console.log("Post socketIO handler");

      //listen for reaction event from client
      socket.on("reaction", (reactionDoc) => {
        //emit event to all connected client.
        this.io.emit("update like", reactionDoc);
      });

      socket.on("comment", (commentDoc) => {
        //emit event to all connected client.
        this.io.emit("update comment", commentDoc);
      });
    });
  }
}

module.exports = { SocketIOPostHandler, socketIOPostObject };
