import { useState } from "react";

export default function BottleGame() {
  const [playerChoice, setPlayerChoice] = useState(null);
  const [botChoice, setBotChoice] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState("");

  const choose = (choice) => {
    if (spinning) return;

    const bot = choice === "HEAD" ? "BOTTOM" : "HEAD";

    setPlayerChoice(choice);
    setBotChoice(bot);
    setResult("");
  };

  const spin = () => {
    if (!playerChoice || spinning) return;

    setSpinning(true);

    // Random spin
    const spinDeg = Math.floor(Math.random() * 720) + 1080;
    setRotation(spinDeg);

    setTimeout(() => {
      // Determine result based on final angle
      const finalDeg = spinDeg % 360;

      let outcome;
      if (finalDeg < 180) {
        outcome = "HEAD";
      } else {
        outcome = "BOTTOM";
      }

      if (outcome === playerChoice) {
        setResult("🎉 You Win!");
      } else {
        setResult("🤖 Bot Wins!");
      }

      setSpinning(false);
    }, 2000);
  };

  return (
    <>
      <style>{`
        .container {
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          font-family: Arial;
          position: relative;
          background: linear-gradient(-45deg, #0f2027, #203a43, #2c5364);
          background-size: 400% 400%;
          animation: bg 10s ease infinite;
        }

        @keyframes bg {
          0% {background-position: 0% 50%;}
          50% {background-position: 100% 50%;}
          100% {background-position: 0% 50%;}
        }

        .wheel-area {
          position: relative;
          margin: 30px 0;
        }

        .wheel {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          border: 6px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          transition: transform 2s ease-out;
          background: linear-gradient(to bottom, #ff9800 50%, #2196f3 50%);
        }

        .pointer {
          position: absolute;
          top: -15px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 20px;
        }

        button {
          margin: 5px;
          padding: 10px 20px;
          border: none;
          border-radius: 20px;
          cursor: pointer;
        }

        .choice {
          background: #4caf50;
          color: white;
        }

        .spin {
          background: #ff5722;
          color: white;
          margin-top: 10px;
        }

        .result {
          margin-top: 20px;
          font-size: 20px;
        }
      `}</style>

      <div className="container">
        <h2>Head or Bottom</h2>

        {/* Choices */}
        <div>
          <button className="choice" onClick={() => choose("HEAD")}>
            Head
          </button>
          <button className="choice" onClick={() => choose("BOTTOM")}>
            Bottom
          </button>
        </div>

        {/* Wheel */}
        <div className="wheel-area">
          <div className="pointer">🔻</div>
          <div
            className="wheel"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            HEAD / BOTTOM
          </div>
        </div>

        {/* Spin */}
        <button className="spin" onClick={spin}>
          {spinning ? "Spinning..." : "Spin"}
        </button>

        {/* Info */}
        {playerChoice && (
          <p>🧑 You: {playerChoice} | 🤖 Bot: {botChoice}</p>
        )}

        {result && <div className="result">{result}</div>}
      </div>
    </>
  );
}