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
      // when user send a req/event to join
      socket.on("room-join", ({ user, roomId }) => {
        console.log("room-join event", user, roomId);
        this.roomJoinHandler(socket, user, roomId);
      });
    });
  }

  roomJoinHandler = (socket, user, roomId) => {
    const participantDetails = {
      userId: user.profile._id,
      socketId: socket.id,
    };
    console.log("participantDetails who want to join", participantDetails);

    const roomDetails = this.getActiveRoom(roomId);

    this.joinActiveRoom(roomId, participantDetails);

    // send rooms with updated participants
    this.updateRooms();
  };

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

    // send update room emit to all users
    this.updateRooms();
    // console.log(activeRooms);
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

    activeRooms.push(newActiveRoom);
    return newActiveRoom;
  }

  updateRooms = (targetId = null) => {
    if (targetId) {
      this.io.to(targetId).emit("active-rooms", {
        activeRooms,
      });
    } else {
      this.io.emit("active-rooms", {
        activeRooms,
      });
    }
  };

  getActiveRoom = (roomId) => {
    const activeRoom = activeRooms.find((room) => room.roomId === roomId);
    return activeRoom;
  };

  joinActiveRoom = (roomId, newParticipant) => {
    const room = activeRooms.find((room) => room.roomId === roomId);

    console.log("Old activeRooms", activeRooms);
    activeRooms = activeRooms.filter((room) => room.roomId !== roomId);

    console.log("Room participantDetails want to join", room);
    console.log("removing room from activeRooms", activeRooms);
    // add participant in the room
    const updatedRoom = {
      ...room,
      participants: [...room.participants, newParticipant],
    };

    activeRooms.push(updatedRoom);
    console.log("adding room to activeRooms", activeRooms);
  };
}

module.exports = { SocketIORoomHandler, roomObject };
