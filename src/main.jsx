import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import WhotGame from "./WhotGame";
import BottleGame from "./BottleGame";

function App() {
  const [currentGame, setCurrentGame] = useState("whot");

  return (
    <React.StrictMode>
      <div style={{ textAlign: "center" }}>
        
        {/* 🔥 Game Selector */}
        <div style={{ marginBottom: "20px" }}>
          <button onClick={() => setCurrentGame("whot")}>
            Play Whot
          </button>

          <button
            onClick={() => setCurrentGame("bottle")}
            style={{ marginLeft: "10px" }}
          >
            Play Bottle Flip
          </button>
        </div>

        {/* 🎮 Game Renderer */}
        {currentGame === "whot" && <WhotGame />}
        {currentGame === "bottle" && <BottleGame />}
      </div>
    </React.StrictMode>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);