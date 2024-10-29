const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const socketConfig = require("./config/socketConfig");

const app = express();
const server = http.createServer(app);
const io = new Server(server, socketConfig);

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.get("/", (req, res) => {
  res.send("UNO Game Server is running");
});

require("./sockets")(io); // Socket işlemlerini başlat
