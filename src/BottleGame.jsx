import { useState, useRef } from "react";

export default function WheelSpinGame() {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState("");

  const audioCtxRef = useRef(null);

  const segments = [
    "💰 Win",
    "❌ Lose",
    "🎁 Bonus",
    "💀 Penalty",
    "⭐ Lucky",
    "🔥 Jackpot"
  ];

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

    gain.gain.value = 0.08;
    osc.start();
    setTimeout(() => osc.stop(), 100);
  };

  const spinWheel = () => {
    if (spinning) return;

    setSpinning(true);
    setResult("");

    playSound("spin");

    const randomIndex = Math.floor(Math.random() * segments.length);

    // 🎯 Calculate stop angle
    const stopAngle =
      360 - randomIndex * segmentAngle - segmentAngle / 2;

    const spinBase = Math.floor(Math.random() * 720) + 1440;
    const finalRotation = rotation + spinBase + stopAngle;

    setRotation(finalRotation);

    // 🔔 ticking effect
    let tickInterval = setInterval(() => {
      playSound("tick");
    }, 120);

    setTimeout(() => {
      clearInterval(tickInterval);

      const landed = segments[randomIndex];
      setResult(`🎯 ${landed}`);

      playSound("win");
      setSpinning(false);
    }, 3000);
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
          background: radial-gradient(circle at top, #1f1c2c, #928dab);
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
          z-index: 5;
        }

        .wheel {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 6px solid white;
          position: relative;
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
          text-align: center;
        }

        button {
          padding: 12px 25px;
          border-radius: 25px;
          border: none;
          cursor: pointer;
          font-weight: bold;
        }

        .result {
          margin-top: 20px;
          font-size: 22px;
        }
      `}</style>

      <div className="container">
        <h2>🎡 Wheel Spin Game</h2>

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
                  transform: `rotate(${i * segmentAngle}deg) skewY(${
                    90 - segmentAngle
                  }deg)`,
                  background: `hsl(${i * 60}, 70%, 50%)`
                }}
              >
                <div style={{ transform: `skewY(-${90 - segmentAngle}deg)` }}>
                  {seg}
                </div>
              </div>
            ))}
          </div>
        </div>

        <button onClick={spinWheel} disabled={spinning}>
          {spinning ? "Spinning..." : "Spin Wheel"}
        </button>

        <div className="result">{result}</div>
      </div>
    </>
  );
}