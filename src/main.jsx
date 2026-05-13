import React, { useState } from "react";
import ReactDOM from "react-dom/client";

import WhotGame from "./WhotGame";
import BottleGame from "./BottleGame";
import DiceBattle from "./DiceBattle";
import CrashGameRoomDemo from "./CrashGameRoomDemo";
import Horse from "./pages/Horse"; // ✅ HORSE GAME

function App() {
  const [currentGame, setCurrentGame] = useState(null);

  // 👇 crash stage control
  const [crashPlayers, setCrashPlayers] = useState([]);

  const renderGame = () => {
    switch (currentGame) {

      case "whot":
        return (
          <WhotGame
            onStartCrash={(players) => {
              setCrashPlayers(players || []);
              setCurrentGame("crash");
            }}
          />
        );

      case "bottle":
        return <BottleGame />;

      case "dice":
        return <DiceBattle />;

      case "horse":
        return <Horse />;

      case "crash":
        return (
          <CrashGameRoomDemo
            players={crashPlayers}
            onBack={() => setCurrentGame(null)}
          />
        );

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

              <button
                onClick={() => setCurrentGame("horse")}
                style={{ marginLeft: "10px" }}
              >
                🏇 Horse Racing
              </button>

            </div>
          </div>
        )}

        {/* 🔙 BACK BUTTON */}
        {currentGame && currentGame !== "crash" && (
          <div style={{ marginBottom: "10px" }}>
            <button onClick={() => setCurrentGame(null)}>
              ⬅ Back to Lobby
            </button>
          </div>
        )}

        {/* 🎯 GAME */}
        {renderGame()}
      </div>
    </React.StrictMode>
  );
}

ReactDOM.createRoot(
  document.getElementById("root")
).render(<App />);