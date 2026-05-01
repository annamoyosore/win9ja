import { useState, useRef } from "react";

export default function CasinoWheel() {
  const segments = [
    "❌ Lose",
    "x2",
    "🎁 Free",
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
  const [won, setWon] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [overlay, setOverlay] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [freeSpins, setFreeSpins] = useState(0);

  const audioCtxRef = useRef(null);
  const segmentAngle = 360 / segments.length;

  // 🎯 PROBABILITY
  const pool = [
    { type: "LOSE", weight: 0.39 },
    { type: "HALF", weight: 0.12 },
    { type: "X1", weight: 0.12 },
    { type: "FREE", weight: 0.08 },
    { type: "X2", weight: 0.20 },
    { type: "X3", weight: 0.08 },
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

  const startResetCountdown = () => {
    let time = 5;
    setCountdown(time);

    const interval = setInterval(() => {
      time--;
      setCountdown(time);
      if (time <= 0) {
        clearInterval(interval);
        setRotation(0);
        setResult("");
        setOverlay(null);
        setCountdown(null);
      }
    }, 1000);
  };

  const spin = () => {
    if (spinning) return;

    if (!stake && freeSpins <= 0) {
      setResult("⚠️ Select stake first");
      return;
    }

    setSpinning(true);
    setResult("");
    setOverlay(null);
    setWon(0);

    const outcome = getResult();

    const indexMap = {
      LOSE: [0],
      X2: [1],
      FREE: [2],
      X3: [3],
      HALF: [4],
      X1: [5],
      X10: [6]
    };

    const index =
      indexMap[outcome][Math.floor(Math.random() * indexMap[outcome].length)];

    const stopAngle = 360 - (index * segmentAngle + segmentAngle / 2);
    const finalRotation = 1440 + stopAngle;

    setRotation(finalRotation);

    setTimeout(() => {
      let text = "";
      let win = 0;

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
        text = "⚖️ No Gain";

      } else if (outcome === "FREE") {
        setFreeSpins((f) => f + 1);
        playSound("win");
        text = "🎁 Free Spin!";

      } else {
        const mult = parseInt(outcome.replace("X", ""));
        win = stake * mult;
        setTotal((t) => t + win);
        setWon(win);
        playSound("win");
        setOverlay("win");
        text = `🎉 ${outcome}`;
      }

      setResult(text);
      setSpinning(false);

      if (freeSpins > 0 && outcome !== "FREE") {
        setFreeSpins((f) => f - 1);
      }

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
          background: radial-gradient(circle at top, #1a1a2e, #000);
          color: white;
          font-family: Arial;
        }

        h2 {
          color: gold;
          text-shadow: 0 0 10px gold;
        }

        .stake {
          display: flex;
          gap: 10px;
        }

        .stake button {
          padding: 10px 16px;
          border-radius: 12px;
          border: none;
          background: #333;
          color: white;
          font-weight: bold;
        }

        .active {
          background: purple;
          transform: scale(1.1);
          box-shadow: 0 0 10px purple;
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
          border: 6px solid gold;
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

        .box {
          margin-top: 10px;
          padding: 10px;
          border: 2px solid gold;
          border-radius: 10px;
          background: rgba(255,215,0,0.1);
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
        }

        .countdown {
          margin-top: 10px;
          color: #aaa;
        }
      `}</style>

      <div className="container">
        <h2>🎡 Casino Wheel</h2>

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

        <p>🎟 Free Spins: {freeSpins}</p>

        <div className="wheel-container">
          <div className="pointer">🔻</div>
          <div className="wheel" style={{ transform: `rotate(${rotation}deg)` }} />
        </div>

        <button onClick={spin}>
          {spinning ? "Spinning..." : "🎡 Spin"}
        </button>

        <div className="box">
          💰 Total: ₦{total} <br />
          🏆 Won: ₦{won}
        </div>

        <p>{result}</p>

        {countdown && (
          <p className="countdown">Resetting in {countdown}s...</p>
        )}

        {overlay && (
          <div className="overlay">
            {overlay === "win" ? "🏆 WIN!" : "😢 LOSE"}
          </div>
        )}
      </div>
    </>
  );
}