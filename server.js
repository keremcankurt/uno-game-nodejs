const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});

const PORT = process.env.PORT || 4000;

let rooms = {}; // {'roomId': { players: [], isStarted: false, owner: socketId }}

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.get("/", (req, res) => {
  res.send("UNO Game Server is running");
});

const getAllRooms = () => {
  return Object.values(rooms).map((room) => ({
    id: room.id,
    players: room.players.length,
    isStarted: room.isStarted,
  }));
};
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("createRoom", (username, callback) => {
    const roomId = generateRoomId();
    rooms[roomId] = {
      players: [{ id: socket.id, username }],
      isStarted: false,
      owner: socket.id,
      id: roomId
    };
    socket.join(roomId);
    io.to(roomId).emit("updatePlayers", rooms[roomId].players);
    callback({ status: "success", roomId });
    console.log(`Room created: ${roomId}`);
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
        io.to(roomId).emit("updatePlayers", room.players);
        callback({ status: "success" });
        console.log(`User ${username} joined room ${roomId}`);
        io.emit("roomList", getAllRooms());
      }
    } else {
      callback({
        status: "error",
        message: "Room not available or already started",
      });
    }
  });

  socket.on("leaveRoom", (roomId, callback) => {
    rooms[roomId].players = rooms[roomId].players.filter(
      (p) => p.id !== socket.id
    );
    if (rooms[roomId].players.length === 0) {
      delete rooms[roomId];
    } else {
      io.to(roomId).emit("updatePlayers", rooms[roomId].players);
      io.emit("roomList", getAllRooms());
    }
    socket.leave(roomId);
    callback({ status: "success" });
    console.log(`User ${socket.id} left room ${roomId}`);
  });

  socket.on("startGame", (roomId, callback) => {
    const room = rooms[roomId];
    if (room) {
      room.isStarted = true;
      io.to(roomId).emit("gameStarted");
      callback({ status: "success" });
      console.log(`Game started in room ${roomId}`);
      io.emit("roomList", getAllRooms());
    } else {
      callback({ status: "error", message: "Room not found" });
    }
  });

  socket.on("disconnect", () => {
    for (const roomId in rooms) {
      const room = rooms[roomId];
      room.players = room.players.filter((p) => p.id !== socket.id);
      if (room.players.length === 0) {
        delete rooms[roomId];
      } else {
        io.to(roomId).emit("updatePlayers", room.players);
      }
    }
    io.emit("roomList", getAllRooms());
    console.log(`User disconnected: ${socket.id}`);
  });
});

function generateRoomId() {
  return Math.random().toString(36).substring(2, 8);
}
