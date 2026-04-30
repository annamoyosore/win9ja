import { useState, useRef } from "react";

export default function BottleGame() {
  const [playerChoice, setPlayerChoice] = useState(null);
  const [botChoice, setBotChoice] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState("");
  const [phase, setPhase] = useState("idle");

  const audioCtxRef = useRef(null);

  // 🔊 SOUND
  const playSound = (type) => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();
    }

    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "spin") {
      osc.frequency.value = 300;
      gain.gain.value = 0.05;
    }

    if (type === "land") {
      osc.frequency.value = 120;
      gain.gain.value = 0.1;
    }

    osc.start();
    setTimeout(() => osc.stop(), type === "spin" ? 300 : 150);
  };

  // 🎯 3-LOGIC ENGINE (weighted)
  const getServerResult = (playerChoice) => {
    const botChoice = playerChoice === "HEAD" ? "BOTTOM" : "HEAD";

    const outcomes = [
      { type: "HEAD", weight: 0.4 },
      { type: "BOTTOM", weight: 0.4 },
      { type: "MISS", weight: 0.2 }
    ];

    let rand = Math.random();
    let cumulative = 0;
    let outcome = "MISS";

    for (let o of outcomes) {
      cumulative += o.weight;
      if (rand <= cumulative) {
        outcome = o.type;
        break;
      }
    }

    let winner;
    if (outcome === playerChoice) winner = "USER";
    else if (outcome === "MISS") winner = "ADMIN";
    else winner = "BOT";

    return { outcome, winner, botChoice };
  };

  const choose = (choice) => {
    if (spinning) return;
    setPlayerChoice(choice);
    setResult("");
  };

  const spin = () => {
    if (!playerChoice || spinning) return;

    setSpinning(true);
    setPhase("spinning");
    setResult("");

    playSound("spin");

    // 🔐 LOCK RESULT FIRST
    const { outcome, winner, botChoice } = getServerResult(playerChoice);
    setBotChoice(botChoice);

    // 🎯 TRUE ANGLE ZONES
    let targetAngle;

    switch (outcome) {
      case "HEAD":
        targetAngle = Math.random() * 120 + 10;   // 0°–130°
        break;
      case "BOTTOM":
        targetAngle = Math.random() * 120 + 140;  // 140°–260°
        break;
      case "MISS":
        targetAngle = Math.random() * 80 + 280;   // 280°–360°
        break;
      default:
        targetAngle = 0;
    }

    const spinBase = Math.floor(Math.random() * 720) + 1080;
    const finalRotation = spinBase + targetAngle;

    setRotation(finalRotation);

    // ⏳ suspense
    setTimeout(() => {
      setPhase("slowing");
    }, 1400);

    // 🎉 result
    setTimeout(() => {
      playSound("land");

      if (winner === "USER") {
        setResult("🎉 You Win!");
      } else if (winner === "ADMIN") {
        setResult("🏦 Admin takes the pot!");
      } else {
        setResult("🤖 Bot Wins!");
      }

      setPhase("result");
      setSpinning(false);
    }, 2200);
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
          font-family: Arial;
          color: white;
          background: linear-gradient(-45deg, #0f2027, #203a43, #2c5364);
          background-size: 400% 400%;
          animation: bg 10s ease infinite;
        }

        @keyframes bg {
          0% {background-position: 0% 50%;}
          50% {background-position: 100% 50%;}
          100% {background-position: 0% 50%;}
        }

        .controls button {
          margin: 5px;
          padding: 10px 18px;
          border: none;
          border-radius: 20px;
          cursor: pointer;
          font-weight: bold;
        }

        .head { background: #4caf50; }
        .bottom { background: #2196f3; }
        .spin { background: #ff5722; margin-top: 10px; }

        .bottle-area {
          position: relative;
          margin: 40px 0;
        }

        .pointer {
          position: absolute;
          top: -25px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 30px;
        }

        .labels {
          position: absolute;
          top: -55px;
          width: 280px;
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          opacity: 0.8;
        }

        .bottle {
          font-size: 120px;
          transition: transform 2.2s cubic-bezier(0.25, 1, 0.5, 1);
        }

        .bounce {
          animation: bounce 0.4s ease;
        }

        @keyframes bounce {
          0% { transform: scale(1) rotate(var(--rot)); }
          50% { transform: scale(1.25) rotate(var(--rot)); }
          100% { transform: scale(1) rotate(var(--rot)); }
        }

        .status {
          font-size: 14px;
          opacity: 0.8;
        }

        .result {
          margin-top: 20px;
          font-size: 22px;
          animation: fadeIn 0.5s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="container">
        <h2>Bottle Flip (3 Logic)</h2>

        {/* Choice */}
        <div className="controls">
          <button className="head" onClick={() => choose("HEAD")}>
            Head
          </button>
          <button className="bottom" onClick={() => choose("BOTTOM")}>
            Bottom
          </button>
        </div>

        {/* Bottle */}
        <div className="bottle-area">
          <div className="pointer">🔻</div>

          <div className="labels">
            <span>HEAD</span>
            <span>BOTTOM</span>
            <span>MISS</span>
          </div>

          <div
            className={`bottle ${phase === "result" ? "bounce" : ""}`}
            style={{
              transform: `rotate(${rotation}deg)`,
              "--rot": `${rotation}deg`
            }}
          >
            🍾
          </div>
        </div>

        {/* Spin */}
        <button className="spin" onClick={spin}>
          {spinning ? "Spinning..." : "Flip Bottle"}
        </button>

        {/* Status */}
        {phase === "spinning" && <p className="status">🌀 Spinning...</p>}
        {phase === "slowing" && <p className="status">⏳ Almost there...</p>}

        {playerChoice && (
          <p className="status">
            🧑 You: {playerChoice} | 🤖 Bot: {botChoice || "..."}
          </p>
        )}

        {/* Result */}
        {result && <div className="result">{result}</div>}
      </div>
    </>
  );
}