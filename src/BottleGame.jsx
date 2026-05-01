import { useState, useRef } from "react";

export default function SpinWheelFinal() {
  const segments = [
    "❌ Lose",
    "x2",
    "❌ Lose",
    "x3",
    "➖ -50%",
    "x1",
    "🔥 x10",
    "💎 x30"
  ];

  const stakes = [50, 100, 200, 500];

  const [stake, setStake] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState("");
  const [total, setTotal] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [overlay, setOverlay] = useState(null);
  const [countdown, setCountdown] = useState(null);

  const audioCtxRef = useRef(null);
  const segmentAngle = 360 / segments.length;

  // 🎯 RESULT POOL
  const pool = [
    { type: "LOSE", weight: 0.58 },
    { type: "HALF", weight: 0.10 },
    { type: "X1", weight: 0.10 },
    { type: "X2", weight: 0.14 },
    { type: "X3", weight: 0.06 },
    { type: "X10", weight: 0.01 }
  ];

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
      g.gain.value = 0.1;
      o.start();
      setTimeout(() => o.stop(), d);
    };

    if (type === "win") [400, 700, 1000].forEach((f, i) =>
      setTimeout(() => tone(f, 200), i * 120)
    );

    if (type === "lose") [500, 300, 120].forEach((f, i) =>
      setTimeout(() => tone(f, 200), i * 150)
    );
  };

  const getResult = () => {
    let r = Math.random(), sum = 0;
    for (let p of pool) {
      sum += p.weight;
      if (r <= sum) return p.type;
    }
  };

  const resetGame = () => {
    setRotation(0);
    setResult("");
    setOverlay(null);
    setSpinning(false);
    setCountdown(null);
  };

  const startResetCountdown = () => {
    let time = 5;
    setCountdown(time);

    const interval = setInterval(() => {
      time--;
      setCountdown(time);

      if (time <= 0) {
        clearInterval(interval);
        resetGame();
      }
    }, 1000);
  };

  const spin = () => {
    if (spinning) return;

    if (!stake) {
      setResult("⚠️ Select stake first");
      return;
    }

    setSpinning(true);
    setResult("");
    setOverlay(null);

    const outcome = getResult();

    let indexMap = {
      LOSE: [0, 2],
      X2: [1],
      X3: [3],
      HALF: [4],
      X1: [5],
      X10: [6]
    };

    const indexes = indexMap[outcome];
    const index = indexes[Math.floor(Math.random() * indexes.length)];

    const stopAngle =
      360 - (index * segmentAngle + segmentAngle / 2);

    const finalRotation = 1440 + stopAngle;
    setRotation(finalRotation);

    setTimeout(() => {
      let text = "";

      if (outcome === "LOSE") {
        setTotal((t) => t - stake);
        playSound("lose");
        setOverlay("lose");
        text = "❌ You Lost";

      } else if (outcome === "HALF") {
        setTotal((t) => t - stake / 2);
        playSound("lose");
        setOverlay("lose");
        text = "➖ Lost Half";

      } else if (outcome === "X1") {
        playSound("win");
        setOverlay("draw");
        text = "⚖️ No Gain";

      } else {
        const mult = parseInt(outcome.replace("X", ""));
        const win = stake * mult;
        setTotal((t) => t + win);
        playSound("win");
        setOverlay("win");
        text = `🎉 ${outcome} (+₦${win})`;
      }

      setResult(text);
      setSpinning(false);

      startResetCountdown();

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
          cursor: pointer;
        }

        .active {
          background: purple;
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
          font-size: 28px;
        }

        .wheel {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 6px solid white;
          transition: transform 3s cubic-bezier(0.25,1,0.5,1);

          background: conic-gradient(
            #ff3b3b 0deg 45deg,
            #ffd93b 45deg 90deg,
            #ff3b3b 90deg 135deg,
            #3bff57 135deg 180deg,
            #3bd1ff 180deg 225deg,
            #00c853 225deg 270deg,
            #ff9800 270deg 315deg,
            gold 315deg 360deg
          );
        }

        .label {
          position: absolute;
          top: 50%;
          left: 50%;
          transform-origin: center;
          font-size: 13px;
          font-weight: bold;
        }

        .gold {
          color: gold;
          text-shadow: 0 0 10px gold;
          animation: glow 1s infinite alternate;
        }

        @keyframes glow {
          from { text-shadow: 0 0 5px gold; }
          to { text-shadow: 0 0 20px gold; }
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
          font-size: 40px;
          z-index: 999;
        }

        .win { color: gold; }
        .lose { color: red; }

        .countdown {
          margin-top: 10px;
          font-size: 18px;
          color: #ccc;
        }
      `}</style>

      <div className="container">
        <h2>🎡 Spin & Win</h2>

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

        <p>💰 Total: ₦{total}</p>

        <div className="wheel-container">
          <div className="pointer">🔻</div>

          <div
            className="wheel"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            {segments.map((seg, i) => {
              const angle = i * segmentAngle;
              return (
                <div
                  key={i}
                  className={`label ${seg.includes("x30") ? "gold" : ""}`}
                  style={{
                    transform: `rotate(${angle}deg) translateY(-105px)`
                  }}
                >
                  <span style={{ transform: `rotate(-${angle}deg)` }}>
                    {seg}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <button onClick={spin}>
          {spinning ? "Spinning..." : "🎡 Spin"}
        </button>

        <p>{result}</p>

        {countdown !== null && (
          <p className="countdown">🔄 Resetting in {countdown}s...</p>
        )}

        {overlay && (
          <div className={`overlay ${overlay}`}>
            {overlay === "win" && "🏆 YOU WIN!"}
            {overlay === "lose" && "😢 YOU LOST"}
            {overlay === "draw" && "⚖️ DRAW"}
          </div>
        )}
      </div>
    </>
  );
}