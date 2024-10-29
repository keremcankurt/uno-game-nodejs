const lobbyHandlers = require("./lobby");
const gameHandlers = require("./game");
const { getAllRooms, rooms } = require("../rooms");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);
    lobbyHandlers(io, socket);
    gameHandlers(io, socket);
    
    socket.on("disconnect", () => {
      for (const roomId in rooms) {
        const room = rooms[roomId];
        if (room.owner === socket.id) {
          console.log(`Room ${roomId} deleted because owner left.`);
          io.to(roomId).emit("roomDeleted"); 
          delete rooms[roomId];
          io.emit("roomList", getAllRooms());
          return; 
        }
        room.players = room.players.filter((p) => p.id !== socket.id);
        if (room.players.length === 0) {
          delete rooms[roomId];
        } else {
          io.to(roomId).emit("updatePlayers", room);
        }
      }
      io.emit("roomList", getAllRooms());
      console.log(`User disconnected: ${socket.id}`);
    });
  })};
