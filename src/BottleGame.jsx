import { useState, useRef } from "react";

export default function WheelBattleTest() {
  const segments = ["💰 Win", "❌ Lose", "🎁 Bonus", "⭐ Lucky", "🔥 Jackpot"];

  const [playerChoice, setPlayerChoice] = useState(null);
  const [botChoice, setBotChoice] = useState(null);

  const [status, setStatus] = useState("choosing"); 
  // choosing | waiting | ready | spinning | finished

  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState("");
  const [spinning, setSpinning] = useState(false);

  const audioCtxRef = useRef(null);

  const segmentAngle = 360 / segments.length;

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

    if (type === "spin") osc.frequency.value = 300;
    if (type === "tick") osc.frequency.value = 800;
    if (type === "win") osc.frequency.value = 600;
    if (type === "lose") osc.frequency.value = 150;

    gain.gain.value = 0.08;
    osc.start();
    setTimeout(() => osc.stop(), 120);
  };

  // 🎯 PLAYER PICKS
  const choose = (seg) => {
    if (status !== "choosing") return;

    setPlayerChoice(seg);
    setResult("");
    setStatus("waiting");

    // 🤖 simulate opponent thinking
    setTimeout(() => {
      const botPick =
        segments[Math.floor(Math.random() * segments.length)];
      setBotChoice(botPick);
      setStatus("ready"); // 👈 now wait for player to press spin
    }, 1200);
  };

  // 🎡 SPIN
  const spin = () => {
    if (status !== "ready") return;

    setSpinning(true);
    setStatus("spinning");

    playSound("spin");

    const winningIndex = Math.floor(Math.random() * segments.length);
    const landed = segments[winningIndex];

    const stopAngle =
      360 - winningIndex * segmentAngle - segmentAngle / 2;

    const spinBase = Math.floor(Math.random() * 720) + 1440;
    const finalRotation = rotation + spinBase + stopAngle;

    setRotation(finalRotation);

    const tick = setInterval(() => playSound("tick"), 120);

    setTimeout(() => {
      clearInterval(tick);

      if (landed === playerChoice) {
        setResult("🎉 You Win!");
        playSound("win");
      } else if (landed === botChoice) {
        setResult("🤖 Bot Wins!");
        playSound("lose");
      } else {
        setResult(`⚖️ Landed on ${landed}`);
      }

      setStatus("finished");
      setSpinning(false);
    }, 3000);
  };

  const reset = () => {
    setPlayerChoice(null);
    setBotChoice(null);
    setStatus("choosing");
    setResult("");
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
          background: radial-gradient(circle, #1f1c2c, #928dab);
        }

        .status {
          margin-bottom: 10px;
          font-size: 14px;
          opacity: 0.8;
        }

        .choices {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .choice {
          padding: 10px 14px;
          border-radius: 20px;
          background: rgba(255,255,255,0.1);
          cursor: pointer;
        }

        .disabled {
          opacity: 0.4;
          pointer-events: none;
        }

        .active {
          background: #ff9800;
          transform: scale(1.1);
        }

        .wheel-container {
          position: relative;
          width: 260px;
          height: 260px;
          margin: 20px;
        }

        .pointer {
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 30px;
        }

        .wheel {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 5px solid white;
          overflow: hidden;
          transition: transform 3s cubic-bezier(0.25,1,0.5,1);
        }

        .segment {
          position: absolute;
          width: 50%;
          height: 50%;
          top: 50%;
          left: 50%;
          transform-origin: 0% 0%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
        }

        button {
          padding: 12px 25px;
          border-radius: 25px;
          border: none;
          cursor: pointer;
        }

        .result {
          margin-top: 15px;
          font-size: 20px;
        }
      `}</style>

      <div className="container">
        <h2>🎡 Wheel Battle (Test Mode)</h2>

        <div className="status">
          {status === "choosing" && "Pick your segment"}
          {status === "waiting" && "⏳ Waiting for opponent..."}
          {status === "ready" && "✅ Ready! Press Spin"}
          {status === "spinning" && "🎡 Spinning..."}
          {status === "finished" && "Result ready"}
        </div>

        {/* choices */}
        <div className={`choices ${status !== "choosing" ? "disabled" : ""}`}>
          {segments.map((seg, i) => (
            <div
              key={i}
              className={`choice ${playerChoice === seg ? "active" : ""}`}
              onClick={() => choose(seg)}
            >
              {seg}
            </div>
          ))}
        </div>

        {/* info */}
        {playerChoice && (
          <p>
            🧑 You: {playerChoice} | 🤖 Bot: {botChoice || "..."}
          </p>
        )}

        {/* wheel */}
        <div className="wheel-container">
          <div className="pointer">🔻</div>

          <div
            className="wheel"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            {segments.map((seg, i) => (
              <div
                key={i}
                className="segment"
                style={{
                  transform: `rotate(${i * segmentAngle}deg) skewY(${90 - segmentAngle}deg)`,
                  background: `hsl(${i * 70}, 70%, 50%)`
                }}
              >
                <div style={{ transform: `skewY(-${90 - segmentAngle}deg)` }}>
                  {seg}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ✅ SPIN BUTTON */}
        {status === "ready" && (
          <button onClick={spin} disabled={spinning}>
            🎡 Spin
          </button>
        )}

        {status === "finished" && (
          <button onClick={reset}>🔄 Play Again</button>
        )}

        <div className="result">{result}</div>
      </div>
    </>
  );
}