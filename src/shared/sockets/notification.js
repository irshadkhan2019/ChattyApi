let socketIONotificationObject;

class SocketIONotificationHandler {
  listen(io) {
    socketIONotificationObject = io;
  }
}
module.exports = { SocketIONotificationHandler };
