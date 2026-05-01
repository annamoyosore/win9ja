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

    const tone = (f, d) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.frequency.value = f;
      g.gain.value = 0.08;
      o.start();
      setTimeout(() => o.stop(), d);
    };

    if (type === "win") [400, 600, 900].forEach((f, i) =>
      setTimeout(() => tone(f, 120), i * 120)
    );
    if (type === "lose") [500, 300, 150].forEach((f, i) =>
      setTimeout(() => tone(f, 150), i * 150)
    );
  };

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

    if (!stake) {
      setError("⚠️ Select a stake first");
      setTimeout(() => setError(""), 1500);
      return;
    }

    setSpinning(true);
    setResult("");

    const index = getIndex();
    const landed = segments[index].label;

    // ✅ CORRECT CENTER ALIGNMENT
    const stopAngle =
      360 - (index * segmentAngle + segmentAngle / 2);

    const spinBase = 1440; // fixed spins for consistency
    const finalRotation = spinBase + stopAngle;

    setRotation(finalRotation);

    setTimeout(() => {
      let win = 0;

      if (landed.includes("x")) {
        const mult = parseInt(landed.replace("x", ""));
        win = stake * mult;
        setTotal((t) => t + win);
        playSound("win");
      } else if (landed === "❌ Lose") {
        setTotal((t) => t - stake);
        playSound("lose");
      }

      setResult(`${landed} ${win ? `(+₦${win})` : ""}`);
      setSpinning(false);

      // 🔄 AUTO REFRESH AFTER RESULT
      setTimeout(() => {
        window.location.reload();
      }, 2500);

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

        .error {
          color: red;
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
        <p>🏆 Total Won: ₦{total}</p>

        {error && <p className="error">{error}</p>}

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

        <button className="spin" onClick={spin}>
          🎡 Spin
        </button>

        <p>{result}</p>
      </div>
    </>
  );
}