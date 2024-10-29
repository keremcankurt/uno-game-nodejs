
const { getAllRooms, rooms } = require("../rooms");
const generateRoomId = require("../utils/generateRoomId");




module.exports = (io, socket) => {
  io.emit("roomList", getAllRooms());

  socket.on("createRoom", (username, callback) => {
    const roomId = generateRoomId();
    rooms[roomId] = {
      players: [{ id: socket.id, username }],
      isStarted: false,
      owner: socket.id,
      id: roomId,
    };
    socket.join(roomId);
    io.to(roomId).emit("updatePlayers", rooms[roomId]);
    callback({ status: "success", roomId });
    io.emit("roomList", getAllRooms());
  });

  socket.on("joinRoom", ({ roomId, username }, callback) => {
    const room = rooms[roomId];
    if (room && !room.isStarted) {
      if (room.players.length >= 4) {
        callback({ status: "error", message: "Room is full" });
      } else {
        room.players.push({ id: socket.id, username });
        socket.join(roomId);
        io.to(roomId).emit("updatePlayers", room);
        callback({ status: "success" });
        io.emit("roomList", getAllRooms());
      }
    } else {
      callback({ status: "error", message: "Room not available or already started" });
    }
  });

  socket.on("leaveRoom", (roomId, callback) => {
    const room = rooms[roomId];
    if (!room) {
      return callback({ status: "error", message: "Room not found" });
    }
    if (room.owner === socket.id) {
      io.to(roomId).emit("roomDeleted");
      delete rooms[roomId];
      io.emit("roomList", getAllRooms());
      return callback({ status: "success" });
    }
    room.players = room.players.filter((p) => p.id !== socket.id);
    if (room.players.length === 0) {
      delete rooms[roomId];
    } else {
      io.to(roomId).emit("updatePlayers", room);
    }
    socket.leave(roomId);
    io.emit("roomList", getAllRooms());
    callback({ status: "success" });
  });
};
