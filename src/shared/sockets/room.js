let roomObject;
let activeRooms = [];

class SocketIORoomHandler {
  constructor(io) {
    this.io = io;
    roomObject = io;
  }

  listen() {
    this.io.on("connection", (socket) => {
      socket.on("room-create", (user) => {
        console.log("room-create event", user);
        this.roomCreateHandler(socket, user);
      });
    });
  }

  roomCreateHandler = (socket, user) => {
    const socketId = socket.id;
    const userId = user.profile._id;

    console.log("creating room for ", socketId, userId);
    //create the room
    const roomDetails = this.addNewActiveRoom(userId, socketId);
    // send created room details to the user
    socket.emit("room-create", {
      roomDetails,
    });
    console.log(activeRooms);
  };

  addNewActiveRoom(userId, socketId) {
    const newActiveRoom = {
      roomCreator: {
        userId,
        socketId,
      },
      participants: [
        {
          userId,
          socketId,
        },
      ],
      // room id the id of user who created room
      roomId: userId,
    };

    activeRooms.push([...activeRooms, newActiveRoom]);
    return newActiveRoom;
  }
}

module.exports = { SocketIORoomHandler, roomObject };
