import React, { useState } from "react";
import ReactDOM from "react-dom/client";

import WhotGame from "./WhotGame";
import BottleGame from "./BottleGame";
import DiceBattle from "./DiceBattle";
import CrashGameRoomDemo from "./CrashGameRoomDemo";
import Horse from "./pages/Horse";

function App() {
  const [currentGame, setCurrentGame] = useState(null);

  // 🎯 Crash room players
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
      <div
        style={{
          minHeight: "100vh",
          padding: "20px",
          textAlign: "center",
          background:
            "linear-gradient(to bottom, #020617, #0f172a)",
          color: "white",
          fontFamily: "Poppins, sans-serif",
        }}
      >

        {/* 🎮 LOBBY */}
        {!currentGame && (
          <div
            style={{
              maxWidth: "900px",
              margin: "0 auto",
            }}
          >
            <h1
              style={{
                fontSize: "48px",
                marginBottom: "10px",
                fontWeight: "800",
              }}
            >
              🎮 Game Hub
            </h1>

            <p
              style={{
                color: "#94a3b8",
                marginBottom: "40px",
                fontSize: "18px",
              }}
            >
              Choose a game to play
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "20px",
              }}
            >

              {/* 🃏 WHOT */}
              <button
                onClick={() =>
                  setCurrentGame("whot")
                }
                style={cardStyle}
              >
                <div style={emojiStyle}>🃏</div>

                <h2 style={titleStyle}>
                  Whot Game
                </h2>

                <p style={descStyle}>
                  Multiplayer card battle
                </p>
              </button>

              {/* 🍾 BOTTLE */}
              <button
                onClick={() =>
                  setCurrentGame("bottle")
                }
                style={cardStyle}
              >
                <div style={emojiStyle}>🍾</div>

                <h2 style={titleStyle}>
                  Bottle Flip
                </h2>

                <p style={descStyle}>
                  Flip and score points
                </p>
              </button>

              {/* 🎲 DICE */}
              <button
                onClick={() =>
                  setCurrentGame("dice")
                }
                style={cardStyle}
              >
                <div style={emojiStyle}>🎲</div>

                <h2 style={titleStyle}>
                  Dice Battle
                </h2>

                <p style={descStyle}>
                  Roll and defeat opponents
                </p>
              </button>

              {/* 🏇 HORSE */}
              <button
                onClick={() =>
                  setCurrentGame("horse")
                }
                style={{
                  ...cardStyle,
                  background:
                    "linear-gradient(135deg, #f59e0b, #d97706)",
                }}
              >
                <div style={emojiStyle}>🏇</div>

                <h2 style={titleStyle}>
                  Horse Racing
                </h2>

                <p style={descStyle}>
                  Bet and race versus bots
                </p>
              </button>

            </div>
          </div>
        )}

        {/* 🔙 BACK BUTTON */}
        {currentGame &&
          currentGame !== "crash" && (
            <div
              style={{
                marginBottom: "20px",
              }}
            >
              <button
                onClick={() =>
                  setCurrentGame(null)
                }
                style={{
                  background: "#1e293b",
                  color: "white",
                  padding: "12px 22px",
                  borderRadius: "14px",
                  fontWeight: "bold",
                  border:
                    "1px solid rgba(255,255,255,0.1)",
                }}
              >
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

/* 🎨 STYLES */

const cardStyle = {
  background:
    "rgba(15, 23, 42, 0.9)",

  border:
    "1px solid rgba(255,255,255,0.08)",

  borderRadius: "24px",

  padding: "30px 20px",

  color: "white",

  transition: "0.2s",

  boxShadow:
    "0 10px 30px rgba(0,0,0,0.3)",
};

const emojiStyle = {
  fontSize: "70px",
  marginBottom: "15px",
};

const titleStyle = {
  fontSize: "24px",
  fontWeight: "700",
  marginBottom: "10px",
};

const descStyle = {
  color: "#cbd5e1",
  fontSize: "15px",
};

ReactDOM.createRoot(
  document.getElementById("root")
).render(<App />);