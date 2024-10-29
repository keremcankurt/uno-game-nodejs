
const { rooms } = require("../rooms");
const { generateDeck } = require("../utils/deck");

module.exports = (io, socket) => {
    socket.on("startGame", (roomId, callback) => {
        const room = rooms[roomId];
        if (!room || room.isStarted) {
          callback({ status: "error", message: "Room not available or already started" });
        }
      
        room.isStarted = true;
        room.deck = generateDeck();
        room.hands = {};
      
        room.players.forEach((player) => {
          room.hands[player.id] = room.deck.splice(0, 8); // Her oyuncuya 8 kart verilir
        });
      
        const gameData = room.players.map((player) => ({
          playerId: player.id,
          username: player.username,
          hand: room.hands[player.id], // Kendi kartları
          otherPlayerCardCounts: room.players
            .filter((p) => p.id !== player.id)
            .map((p) => ({ playerId: p.id, cardCount: room.hands[p.id].length })),
        }));
      
        room.currentTurn = room.players[0].id; // İlk oyuncunun sırası
      
        io.to(roomId).emit("gameStarted", gameData, room.currentTurn);
        console.log(`Game started in room ${roomId}`);
        callback({ status: "success" });
    });
  
    // Diğer oyunla ilgili işlemler buraya eklenebilir...
  };
  