const { cloneDeep } = require("lodash");

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
      // when user send a req/event to leave
      socket.on("room-leave", ({ user, roomId }) => {
        console.log("room-leave event", user.profile._id, roomId);
        this.roomLeaveHandler(socket, user, roomId);
      });

      //when page reloads user request for active rooms to display
      socket.on("get-active-room", () => {
        this.updateRooms();
      });
    });
  }

  roomLeaveHandler = (socket, user, roomId) => {
    const ActiveRoom = this.getActiveRoom(roomId);

    this.leaveActiveRoom(roomId, socket.id);
    // send rooms with updated participants
    this.updateRooms();
  };

  roomJoinHandler = (socket, user, roomId) => {
    const participantDetails = {
      userId: user.profile._id,
      socketId: socket.id,
    };
    console.log("participantDetails who want to join", participantDetails);

    const roomDetails = this.getActiveRoom(roomId);

    this.joinActiveRoom(roomId, participantDetails);

    //send information to users in room that they should prepare for incoming connection
    roomDetails.participants.forEach(participant => {
      if(participant.socketId !==participantDetails.socketId){
      socket.to(participant.socketId).emit('conn-prepare',{
        //send our socket id info to all other participants in room
          conUserSocketId:participantDetails.socketId,
       })
     }
    });

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

  leaveActiveRoom = (roomId, participantSocketId) => {
    const activeRoom = activeRooms.find((room) => room.roomId === roomId);

    if (activeRoom) {
      const cloneActiveRoom = cloneDeep(activeRoom);
      // remove the participant from participant list
      cloneActiveRoom.participants = cloneActiveRoom.participants.filter(
        (participant) => participant.socketId !== participantSocketId
      );
      console.log("removing participant from activeRooms", cloneActiveRoom);

      //remove the current room
      activeRooms = activeRooms.filter((room) => room.roomId !== roomId);

      // add the clone room with 1 less participant
      if (cloneActiveRoom.participants.length >= 1) {
        activeRooms.push(cloneActiveRoom);

        console.log(
          "adding room to activeRooms with 1 less partitcipant",
          activeRooms
        );
      }
    }
  };
}

module.exports = { SocketIORoomHandler, roomObject };
