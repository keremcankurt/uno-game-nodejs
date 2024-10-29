// rooms.js
let rooms = {};

const getAllRooms = () => {
    return Object.values(rooms).map((room) => ({
      id: room.id,
      players: room.players.length,
      isStarted: room.isStarted,
    }));
  };

  module.exports = {
    rooms,
    getAllRooms,
  };
