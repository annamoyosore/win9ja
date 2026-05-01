import { useState, useRef } from "react";

export default function FreeSpinWheelAdvanced() {
  const segments = [
    { label: "❌ Lose", weight: 0.35 },
    { label: "🔁 Try", weight: 0.2 },
    { label: "x2", weight: 0.2 },
    { label: "x3", weight: 0.15 },
    { label: "x10", weight: 0.05 },
    { label: "🎁 Spin", weight: 0.05 }
  ];

  const stakes = [50, 100, 200, 500];

  const [stake, setStake] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState("");
  const [total, setTotal] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [freeSpins, setFreeSpins] = useState(1);
  const [flowers, setFlowers] = useState(false);
  const [error, setError] = useState("");

  const audioCtxRef = useRef(null);
  const segmentAngle = 360 / segments.length;

  // 🔊 SOUND
  const playSound = (type) => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();
    }

    const ctx = audioCtxRef.current;

    const tone = (f, d, v = 0.08) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.frequency.value = f;
      g.gain.value = v;
      o.start();
      setTimeout(() => o.stop(), d);
    };

    if (type === "tick") tone(800 + Math.random() * 200, 40);
    if (type === "win") [400, 600, 900].forEach((f, i) => setTimeout(() => tone(f, 120), i * 120));
    if (type === "lose") [500, 300, 150].forEach((f, i) => setTimeout(() => tone(f, 150), i * 150));
  };

  // 🎯 weighted pick
  const getIndex = () => {
    let r = Math.random(), sum = 0;
    for (let i = 0; i < segments.length; i++) {
      sum += segments[i].weight;
      if (r <= sum) return i;
    }
    return 0;
  };

  const spin = () => {
    if (spinning) return;

    // 🚫 block if no stake
    if (!stake) {
      setError("⚠️ Select a stake before spinning");
      setTimeout(() => setError(""), 1500);
      return;
    }

    if (freeSpins <= 0) return;

    setError("");
    setSpinning(true);
    setFreeSpins((f) => f - 1);
    setResult("");

    const index = getIndex();
    const landed = segments[index].label;

    const stopAngle = 360 - index * segmentAngle - segmentAngle / 2;
    const spinBase = Math.floor(Math.random() * 720) + 1440;

    setRotation((r) => r + spinBase + stopAngle);

    // 🎡 tick loop
    let tickSpeed = 50;
    const tickLoop = () => {
      if (!spinning) return;
      playSound("tick");
      tickSpeed += 12;
      if (tickSpeed < 220) setTimeout(tickLoop, tickSpeed);
    };
    tickLoop();

    setTimeout(() => {
      let win = 0;

      if (landed.includes("x")) {
        const mult = parseInt(landed.replace("x", ""));
        win = stake * mult;
        setTotal((t) => t + win);
        setFlowers(true);
        playSound("win");
      } else if (landed === "❌ Lose") {
        setTotal((t) => t - stake);
        playSound("lose");
      } else {
        setFreeSpins((f) => f + 1);
        playSound("win");
      }

      setResult(`${landed} ${win ? `(+₦${win})` : ""}`);

      setTimeout(() => setFlowers(false), 1500);
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
          color: white;
          background: radial-gradient(circle, #1f1c2c, #928dab);
        }

        .stake {
          display: flex;
          gap: 10px;
          margin-bottom: 10px;
        }

        .stake button {
          padding: 10px 15px;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          background: #444;
          color: white;
          transition: 0.2s;
        }

        .stake button.active {
          background: #ff9800;
          transform: scale(1.1);
          box-shadow: 0 0 10px #ff9800;
        }

        .stake button:disabled {
          opacity: 0.4;
        }

        .wheel-container {
          position: relative;
          width: 240px;
          height: 240px;
          margin: 20px;
        }

        .pointer {
          position: absolute;
          top: -18px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 26px;
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
          font-size: 11px;
        }

        button.spin {
          padding: 12px 25px;
          border-radius: 25px;
          border: none;
          cursor: pointer;
          background: #ff9800;
          color: white;
          margin-top: 10px;
        }

        button.spin.disabled {
          background: #555;
        }

        .error {
          color: #ff5252;
          animation: shake 0.3s;
        }

        @keyframes shake {
          0% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          50% { transform: translateX(5px); }
          75% { transform: translateX(-5px); }
          100% { transform: translateX(0); }
        }

        .flowers {
          position: absolute;
          animation: float 1.5s ease forwards;
        }

        @keyframes float {
          from { transform: translateY(0); opacity: 1; }
          to { transform: translateY(-120px); opacity: 0; }
        }
      `}</style>

      <div className="container">
        <h2>🎡 Spin Game</h2>

        {/* stake */}
        <div className="stake">
          {stakes.map((s) => (
            <button
              key={s}
              className={stake === s ? "active" : ""}
              disabled={spinning}
              onClick={() => setStake(s)}
            >
              ₦{s}
            </button>
          ))}
        </div>

        <p>💰 Selected: {stake ? `₦${stake}` : "None"}</p>
        <p>🎟 Spins: {freeSpins}</p>
        <p>📊 Total: ₦{total}</p>

        {/* error */}
        {error && <p className="error">{error}</p>}

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
                  background: `hsl(${i * 60},70%,50%)`
                }}
              >
                <div style={{ transform: `skewY(-${90 - segmentAngle}deg)` }}>
                  {seg.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* spin */}
        <button
          className={`spin ${!stake ? "disabled" : ""}`}
          onClick={spin}
        >
          {!stake ? "⚠️ Select Stake" : spinning ? "Spinning..." : "🎡 Spin"}
        </button>

        <p>{result}</p>

        {/* flowers */}
        {flowers && (
          <>
            <div className="flowers">🌸</div>
            <div className="flowers" style={{ left: "40%" }}>🌺</div>
            <div className="flowers" style={{ left: "60%" }}>🌼</div>
          </>
        )}
      </div>
    </>
  );
}