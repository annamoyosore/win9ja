import React, { useState } from "react";
import ReactDOM from "react-dom/client";

import WhotGame from "./WhotGame";
import BottleGame from "./BottleGame";
import DiceBattle from "./DiceBattle";

function App() {
  const [currentGame, setCurrentGame] = useState(null);

  const renderGame = () => {
    switch (currentGame) {
      case "whot":
        return <WhotGame />;
      case "bottle":
        return <BottleGame />;
      case "dice":
        return <DiceBattle />;
      default:
        return null;
    }
  };

  return (
    <React.StrictMode>
      <div style={{ textAlign: "center", padding: "20px" }}>
        
        {/* 🎮 LOBBY */}
        {!currentGame && (
          <div>
            <h1>🎮 Game Lobby</h1>
            <p>Select a game to play</p>

            <div style={{ marginTop: "20px" }}>
              <button onClick={() => setCurrentGame("whot")}>
                🃏 Play Whot
              </button>

              <button
                onClick={() => setCurrentGame("bottle")}
                style={{ marginLeft: "10px" }}
              >
                🍾 Bottle Flip
              </button>

              <button
                onClick={() => setCurrentGame("dice")}
                style={{ marginLeft: "10px" }}
              >
                🎲 Dice Battle
              </button>
            </div>
          </div>
        )}

        {/* 🔙 BACK BUTTON */}
        {currentGame && (
          <div style={{ marginBottom: "10px" }}>
            <button onClick={() => setCurrentGame(null)}>
              ⬅ Back to Lobby
            </button>
          </div>
        )}

        {/* 🎯 GAME RENDER */}
        {renderGame()}
      </div>
    </React.StrictMode>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);