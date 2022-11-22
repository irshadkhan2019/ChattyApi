const connectedUsersMap = new Map();
let users = [];

class SocketIOUserHandler {
  constructor(io) {
    this.io = io;
  }

  listen() {
    this.io.on("connection", (socket) => {
      //when client user login to site add them at server side
      socket.on("setup", (data) => {
        this.addClientToMap(data.userId, socket.id);
        this.addUser(data.userId);
        this.io.emit("user online", users);
      });

      socket.on("block user", (data) => {
        this.io.emit("blocked user id", data);
      });

      socket.on("unblock user", (data) => {
        this.io.emit("unblocked user id", data);
      });

      socket.on("disconnect", () => {
        this.removeClientFromMap(socket.id);
      });
    });
  }
  //instance methods
  addClientToMap(username, socketId) {
    if (!connectedUsersMap.has(username)) {
      connectedUsersMap.set(username, socketId);
    }
  }

  removeClientFromMap(socketId) {
    if (Array.from(connectedUsersMap.values()).includes(socketId)) {
      const disconnectedUser = [...connectedUsersMap].find((user) => {
        return user[1] === socketId;
      });
      connectedUsersMap.delete(disconnectedUser[0]);
      this.removeUser(disconnectedUser[0]);
      this.io.emit("user online", users);
    }
  }

  addUser(username) {
    users.push(username);
    users = [...new Set(users)]; //to avoid duplicate users
  }

  removeUser(username) {
    users = users.filter((name) => name != username);
  }
}

module.exports = { SocketIOUserHandler, connectedUsersMap };
