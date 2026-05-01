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
      osc.frequency.value = 350;
      gain.gain.value = 0.05;
    }

    if (type === "land") {
      osc.frequency.value = 150;
      gain.gain.value = 0.12;
    }

    osc.start();
    setTimeout(() => osc.stop(), type === "spin" ? 300 : 200);
  };

  // 🎯 2-WAY RESULT (50/50)
  const getResult = (playerChoice) => {
    const outcome = Math.random() < 0.5 ? "HEAD" : "BOTTOM";
    const botChoice = playerChoice === "HEAD" ? "BOTTOM" : "HEAD";

    let winner = outcome === playerChoice ? "USER" : "BOT";

    return { outcome, winner, botChoice };
  };

  const choose = (choice) => {
    if (spinning) return;
    setPlayerChoice(choice);
    setResult("");
  };

  const spin = () => {
    if (spinning) return;

    if (!playerChoice) {
      setResult("⚠️ Choose Head or Bottom first");
      return;
    }

    setSpinning(true);
    setPhase("spinning");
    setResult("");

    playSound("spin");

    // 🔐 lock result
    const { outcome, winner, botChoice } = getResult(playerChoice);
    setBotChoice(botChoice);

    // 🎯 2 zones only
    let targetAngle =
      outcome === "HEAD"
        ? Math.random() * 150 + 10   // HEAD zone
        : Math.random() * 150 + 180; // BOTTOM zone

    const spinBase = Math.floor(Math.random() * 720) + 1080;
    const finalRotation = spinBase + targetAngle;

    setRotation(finalRotation);

    setTimeout(() => setPhase("slowing"), 1400);

    setTimeout(() => {
      playSound("land");

      setResult(
        winner === "USER" ? "🎉 You Win!" : "🤖 Bot Wins!"
      );

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
          background: linear-gradient(-45deg, #141e30, #243b55);
          background-size: 400% 400%;
          animation: bg 10s ease infinite;
        }

        @keyframes bg {
          0% {background-position: 0% 50%;}
          50% {background-position: 100% 50%;}
          100% {background-position: 0% 50%;}
        }

        .controls button {
          margin: 8px;
          padding: 12px 22px;
          border: none;
          border-radius: 25px;
          cursor: pointer;
          font-weight: bold;
          transition: 0.2s;
          opacity: 0.7;
        }

        .controls button.active {
          opacity: 1;
          transform: scale(1.1);
          box-shadow: 0 0 10px rgba(255,255,255,0.5);
        }

        .head { background: #4caf50; }
        .bottom { background: #2196f3; }

        .spin {
          background: #ff5722;
          margin-top: 10px;
          padding: 12px 28px;
          border-radius: 30px;
        }

        .bottle-area {
          position: relative;
          margin: 40px 0;
        }

        .pointer {
          position: absolute;
          top: -25px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 32px;
        }

        .labels {
          position: absolute;
          top: -55px;
          width: 260px;
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
          50% { transform: scale(1.3) rotate(var(--rot)); }
          100% { transform: scale(1) rotate(var(--rot)); }
        }

        .status {
          font-size: 14px;
          opacity: 0.8;
        }

        .result {
          margin-top: 20px;
          font-size: 24px;
          animation: fadeIn 0.4s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="container">
        <h2>Bottle Flip (Head vs Bottom)</h2>

        {/* Choice */}
        <div className="controls">
          <button
            className={`head ${playerChoice === "HEAD" ? "active" : ""}`}
            onClick={() => choose("HEAD")}
          >
            Head
          </button>

          <button
            className={`bottom ${playerChoice === "BOTTOM" ? "active" : ""}`}
            onClick={() => choose("BOTTOM")}
          >
            Bottom
          </button>
        </div>

        {/* Bottle */}
        <div className="bottle-area">
          <div className="pointer">🔻</div>

          <div className="labels">
            <span>HEAD</span>
            <span>BOTTOM</span>
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
        <button className="spin" onClick={spin} disabled={spinning}>
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