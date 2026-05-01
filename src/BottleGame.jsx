import { useState, useRef } from "react";

export default function FreeSpinWheelAdvanced() {
  const segments = [
    { label: "❌ Lose", weight: 0.35 },
    { label: "🔁 Try Again", weight: 0.2 },
    { label: "x2", weight: 0.2 },
    { label: "x3", weight: 0.15 },
    { label: "x10", weight: 0.05 },
    { label: "🎁 Free Spin", weight: 0.05 }
  ];

  const stakes = [50, 100, 200, 500];

  const [stake, setStake] = useState(100);
  const [lossPercent, setLossPercent] = useState(100);

  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState("");
  const [totalWon, setTotalWon] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [freeSpins, setFreeSpins] = useState(1);
  const [showFlowers, setShowFlowers] = useState(false);

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

    if (type === "win") [400, 600, 800, 1000].forEach((f, i) => setTimeout(() => tone(f, 120, 0.12), i * 120));
    if (type === "lose") [500, 300, 150].forEach((f, i) => setTimeout(() => tone(f, 150), i * 150));
    if (type === "tick") tone(800 + Math.random() * 200, 40, 0.05);
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
    if (spinning || freeSpins <= 0) return;

    setSpinning(true);
    setResult("");
    setFreeSpins((f) => f - 1);

    const index = getIndex();
    const landed = segments[index].label;

    const stopAngle = 360 - index * segmentAngle - segmentAngle / 2;
    const spinBase = Math.floor(Math.random() * 720) + 1440;

    setRotation((r) => r + spinBase + stopAngle);

    let tickSpeed = 50;
    const tickLoop = () => {
      if (!spinning) return;
      playSound("tick");
      tickSpeed += 12;
      if (tickSpeed < 220) setTimeout(tickLoop, tickSpeed);
    };
    tickLoop();

    setTimeout(() => {
      let winAmount = 0;

      if (landed.includes("x")) {
        const mult = parseInt(landed.replace("x", ""));
        winAmount = stake * mult;
        setTotalWon((t) => t + winAmount);
        setShowFlowers(true);
        playSound("win");
      } else if (landed === "❌ Lose") {
        const loss = stake * (lossPercent / 100);
        setTotalWon((t) => t - loss);
        playSound("lose");
      } else if (landed === "🎁 Free Spin" || landed === "🔁 Try Again") {
        setFreeSpins((f) => f + 1);
        playSound("win");
      }

      setResult(`${landed} ${winAmount ? `(+${winAmount})` : ""}`);

      setTimeout(() => setShowFlowers(false), 1500);
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
          font-family: Arial;
        }

        .wheel {
          width: 260px;
          height: 260px;
          border-radius: 50%;
          border: 6px solid white;
          margin: 20px;
          transition: transform 3s cubic-bezier(0.25,1,0.5,1);
        }

        .stake-buttons span {
          margin: 5px;
          padding: 8px 12px;
          background: #444;
          border-radius: 10px;
          cursor: pointer;
        }

        .active {
          background: #ff9800;
        }

        button {
          padding: 10px 20px;
          border-radius: 20px;
          border: none;
          background: #ff9800;
          color: white;
          cursor: pointer;
        }

        .flowers {
          position: absolute;
          font-size: 24px;
          animation: float 1.5s ease forwards;
        }

        @keyframes float {
          from { transform: translateY(0); opacity: 1; }
          to { transform: translateY(-150px); opacity: 0; }
        }
      `}</style>

      <div className="container">
        <h2>🎡 Advanced Spin</h2>

        <div className="stake-buttons">
          {stakes.map((s) => (
            <span
              key={s}
              className={stake === s ? "active" : ""}
              onClick={() => setStake(s)}
            >
              ₦{s}
            </span>
          ))}
        </div>

        <p>Loss %: 
          <input
            type="range"
            min="0"
            max="100"
            value={lossPercent}
            onChange={(e) => setLossPercent(Number(e.target.value))}
          /> {lossPercent}%
        </p>

        <p>🎟 Spins: {freeSpins}</p>
        <p>💰 Total: ₦{totalWon}</p>

        <div
          className="wheel"
          style={{ transform: `rotate(${rotation}deg)` }}
        />

        <button onClick={spin} disabled={spinning || freeSpins <= 0}>
          Spin
        </button>

        <p>{result}</p>

        {showFlowers && (
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