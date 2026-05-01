import { useState, useRef } from "react";

export default function FreeSpinWheelAdvanced() {
  const segments = [
    { label: "❌ Lose", weight: 0.25 },
    { label: "➖ -50%", weight: 0.2 },
    { label: "🔁 Try", weight: 0.15 },
    { label: "x2", weight: 0.2 },
    { label: "x3", weight: 0.1 },
    { label: "x10", weight: 0.05 },
    { label: "🎁 Spin", weight: 0.05 }
  ];

  const stakes = [50, 100, 200, 500];

  const [stake, setStake] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState("");
  const [total, setTotal] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [error, setError] = useState("");
  const [flowers, setFlowers] = useState([]);
  const [showOverlay, setShowOverlay] = useState(false);
  const [winState, setWinState] = useState(null); // "win" | "lose" | "partial"

  const audioCtxRef = useRef(null);
  const segmentAngle = 360 / segments.length;

  // 🔊 SOUND
  const playSound = (type) => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();
    }

    const ctx = audioCtxRef.current;

    const tone = (f, d, v = 0.1) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.frequency.value = f;
      g.gain.value = v;
      o.start();
      setTimeout(() => o.stop(), d);
    };

    if (type === "win") {
      [400, 700, 1000].forEach((f, i) =>
        setTimeout(() => tone(f, 200), i * 150)
      );
    }

    if (type === "lose") {
      [500, 300, 120].forEach((f, i) =>
        setTimeout(() => tone(f, 200), i * 180)
      );
    }
  };

  const getIndex = () => {
    let r = Math.random(), sum = 0;
    for (let i = 0; i < segments.length; i++) {
      sum += segments[i].weight;
      if (r <= sum) return i;
    }
    return 0;
  };

  const spawnFlowers = () => {
    const arr = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100
    }));
    setFlowers(arr);
    setTimeout(() => setFlowers([]), 2500);
  };

  const spin = () => {
    if (spinning) return;

    if (!stake) {
      setError("⚠️ Select a stake first");
      setTimeout(() => setError(""), 1500);
      return;
    }

    setSpinning(true);
    setResult("");
    setShowOverlay(false);

    const index = getIndex();
    const landed = segments[index].label;

    const stopAngle =
      360 - (index * segmentAngle + segmentAngle / 2);

    const finalRotation = 1440 + stopAngle;
    setRotation(finalRotation);

    setTimeout(() => {
      let win = 0;

      if (landed.includes("x")) {
        const mult = parseInt(landed.replace("x", ""));
        win = stake * mult;
        setTotal((t) => t + win);
        spawnFlowers();
        playSound("win");
        setWinState("win");

      } else if (landed === "➖ -50%") {
        const loss = stake / 2;
        setTotal((t) => t - loss);
        playSound("lose");
        setWinState("partial");

      } else if (landed === "❌ Lose") {
        setTotal((t) => t - stake);
        playSound("lose");
        setWinState("lose");

      } else {
        playSound("win");
        setWinState("win");
      }

      setResult(`${landed} ${win ? `(+₦${win})` : ""}`);
      setSpinning(false);
      setShowOverlay(true);

      // auto hide overlay
      setTimeout(() => {
        setShowOverlay(false);
      }, 3000);

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
          background: radial-gradient(circle, #1f1c2c, #928dab);
          color: white;
        }

        .stake {
          display: flex;
          gap: 10px;
        }

        .stake button {
          padding: 8px 14px;
          border-radius: 10px;
          border: none;
          background: #444;
          color: white;
        }

        .active {
          background: orange;
          transform: scale(1.1);
        }

        .wheel-container {
          position: relative;
          width: 250px;
          height: 250px;
          margin: 20px;
        }

        .pointer {
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 28px;
        }

        .wheel {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 5px solid white;
          overflow: hidden;
          transition: transform 3s ease-out;
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

        .spin {
          padding: 10px 20px;
          background: orange;
          border: none;
          border-radius: 20px;
          cursor: pointer;
        }

        .overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0,0,0,0.7);
          z-index: 999;
          flex-direction: column;
          animation: fadeIn 0.3s ease;
        }

        .win {
          font-size: 50px;
          color: gold;
          animation: pop 0.5s ease;
        }

        .lose {
          font-size: 50px;
          color: #ff5252;
        }

        @keyframes pop {
          0% { transform: scale(0.5); }
          100% { transform: scale(1); }
        }

        .flower {
          position: absolute;
          top: -20px;
          animation: fall 2.5s linear forwards;
          font-size: 20px;
        }

        @keyframes fall {
          to {
            transform: translateY(120vh);
            opacity: 0;
          }
        }
      `}</style>

      <div className="container">
        <h2>🎡 Spin Game</h2>

        <div className="stake">
          {stakes.map((s) => (
            <button
              key={s}
              className={stake === s ? "active" : ""}
              onClick={() => setStake(s)}
            >
              ₦{s}
            </button>
          ))}
        </div>

        <p>💰 Stake: {stake || "None"}</p>
        <p>🏆 Total: ₦{total}</p>

        {error && <p style={{ color: "red" }}>{error}</p>}

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
                  transform: `rotate(${i * segmentAngle - 90}deg) skewY(${90 - segmentAngle}deg)`,
                  background: `hsl(${i * 50},70%,50%)`
                }}
              >
                <div style={{ transform: `skewY(-${90 - segmentAngle}deg)` }}>
                  {seg.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <button className="spin" onClick={spin}>
          🎡 Spin
        </button>

        <p>{result}</p>

        {/* 🌸 flowers */}
        {flowers.map((f) => (
          <div key={f.id} className="flower" style={{ left: `${f.left}%` }}>
            🌸
          </div>
        ))}

        {/* 🎉 RESULT OVERLAY */}
        {showOverlay && (
          <div className="overlay">
            {winState === "win" && (
              <div className="win">🏆 YOU WIN 🎉</div>
            )}

            {winState === "lose" && (
              <div className="lose">😢 You Lost</div>
            )}

            {winState === "partial" && (
              <div className="lose">😬 Half Lost</div>
            )}
          </div>
        )}
      </div>
    </>
  );
}