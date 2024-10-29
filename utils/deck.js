// utils/deck.js
function generateDeck() {
    const colors = ["red", "yellow", "green", "blue"];
    const numbers = Array.from({ length: 10 }, (_, i) => i);
    let deck = [];
  
    colors.forEach((color) => {
      numbers.forEach((num) => {
        deck.push({ color, type: "number", value: num });
        if (num !== 0) deck.push({ color, type: "number", value: num });
      });
  
      for (let i = 0; i < 2; i++) {
        deck.push({ color, type: "+2" });
        deck.push({ color, type: "reverse" });
        deck.push({ color, type: "skip" });
      }
    });
  
    for (let i = 0; i < 4; i++) {
      deck.push({ type: "+4" });
    }
  
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
  
    return deck;
  }
  
  module.exports = { generateDeck };
  