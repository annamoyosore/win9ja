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
    "💎 JACKPOT"
  ];

  const stakes = [50, 100, 200, 500];

  const [stake, setStake] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState("");
  const [won, setWon] = useState(0);
  const [total, setTotal] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [overlay, setOverlay] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [freeSpins, setFreeSpins] = useState(0);
  const [particles, setParticles] = useState([]);
  const [glow, setGlow] = useState(false);

  const audioCtxRef = useRef(null);
  const segmentAngle = 360 / segments.length;

  const pool = [
    { type: "LOSE", weight: 0.39 },
    { type: "HALF", weight: 0.12 },
    { type: "X1", weight: 0.12 },
    { type: "FREE", weight: 0.08 },
    { type: "X2", weight: 0.20 },
    { type: "X3", weight: 0.08 },
    { type: "X10", weight: 0.01 }
  ];

  const getResult = () => {
    let r = Math.random(), sum = 0;
    for (let p of pool) {
      sum += p.weight;
      if (r <= sum) return p.type;
    }
  };

  const spawnConfetti = () => {
    const items = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5
    }));
    setParticles(items);
    setTimeout(() => setParticles([]), 2500);
  };

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

  const startReset = () => {
    let t = 5;
    setCountdown(t);
    const i = setInterval(() => {
      t--;
      setCountdown(t);
      if (t <= 0) {
        clearInterval(i);
        setRotation(0);
        setResult("");
        setOverlay(null);
        setCountdown(null);
        setGlow(false);
      }
    }, 1000);
  };

  const spin = () => {
    if (spinning) return;

    if (!stake && freeSpins <= 0) {
      setResult("⚠️ Select stake");
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

    let index =
      indexMap[outcome][Math.floor(Math.random() * indexMap[outcome].length)];

    // 🎡 Near jackpot effect
    const jackpotIndex = 7;
    if (Math.random() < 0.4 && outcome !== "X10") {
      index = jackpotIndex - 1;
    }

    const stopAngle = 360 - (index * segmentAngle + segmentAngle / 2);
    const finalRotation = rotation + 1440 + stopAngle;

    setRotation(finalRotation);

    setTimeout(() => {
      setGlow(true); // ✨ pointer glow

      let text = "";
      let win = 0;

      if (outcome === "LOSE") {
        setTotal((t) => t - stake);
        playSound("lose");
        setOverlay("lose");
        text = `❌ Lost ₦${stake}`;

      } else if (outcome === "HALF") {
        const loss = stake / 2;
        setTotal((t) => t - loss);
        playSound("lose");
        setOverlay("lose");
        text = `➖ Lost ₦${loss}`;

      } else if (outcome === "X1") {
        text = "⚖️ No Gain";
        playSound("win");

      } else if (outcome === "FREE") {
        setFreeSpins((f) => f + 1);
        text = "🎁 Free Spin!";
        playSound("win");

      } else {
        const mult = parseInt(outcome.replace("X", ""));
        win = stake * mult;
        setWon(win);
        setTotal((t) => t + win);
        playSound("win");
        spawnConfetti();
        setOverlay("win");
        text = `🎉 Won ₦${win}`;
      }

      setResult(text);
      setSpinning(false);

      startReset();
    }, 3000);
  };

  return (
    <>
      <style>{`
        .container {
          height:100vh;
          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content:center;
          background: radial-gradient(circle,#0f2027,#000);
          color:white;
        }

        .stake button {
          margin:5px;
          padding:10px;
          border:none;
          border-radius:10px;
          background:#333;
          color:white;
        }

        .active {
          background:purple;
          box-shadow:0 0 10px purple;
        }

        .wheel-container {
          position:relative;
          width:260px;
          height:260px;
        }

        .pointer {
          position:absolute;
          top:-20px;
          left:50%;
          transform:translateX(-50%);
          font-size:24px;
          transition:0.3s;
        }

        .glow {
          text-shadow:0 0 15px gold,0 0 25px gold;
          transform:translateX(-50%) scale(1.2);
        }

        .wheel {
          width:100%;
          height:100%;
          border-radius:50%;
          border:5px solid gold;
          position:relative;
          transition:transform 3s cubic-bezier(0.25,1,0.5,1);
        }

        .seg {
          position:absolute;
          width:50%;
          height:50%;
          top:50%;
          left:50%;
          transform-origin:0% 0%;
          display:flex;
          justify-content:center;
          align-items:center;
          font-size:12px;
        }

        .jackpot {
          color:gold;
          text-shadow:0 0 10px gold;
        }

        .confetti {
          position:fixed;
          top:-20px;
          font-size:20px;
          animation:fall 2.5s linear forwards;
        }

        @keyframes fall {
          to {
            transform:translateY(110vh) rotate(360deg);
            opacity:0;
          }
        }

        .overlay {
          position:fixed;
          top:0;
          left:0;
          width:100%;
          height:100%;
          display:flex;
          align-items:center;
          justify-content:center;
          background:rgba(0,0,0,0.7);
          font-size:40px;
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

        <div className="wheel-container">
          <div className={`pointer ${glow ? "glow" : ""}`}>🔻</div>

          <div
            className="wheel"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            {segments.map((seg, i) => (
              <div
                key={i}
                className={`seg ${seg.includes("JACKPOT") ? "jackpot" : ""}`}
                style={{
                  transform: `rotate(${i * segmentAngle}deg) skewY(${90 - segmentAngle}deg)`
                }}
              >
                <span style={{ transform: `skewY(-${90 - segmentAngle}deg)` }}>
                  {seg}
                </span>
              </div>
            ))}
          </div>
        </div>

        <button onClick={spin}>
          {spinning ? "Spinning..." : "🎡 Spin"}
        </button>

        <p>💰 Total: ₦{total}</p>
        <p>🏆 Won: ₦{won}</p>
        <p>{result}</p>

        {countdown && <p>Resetting in {countdown}s...</p>}

        {overlay && (
          <div className="overlay">
            {overlay === "win" ? "🏆 WIN!" : "😢 LOST"}
          </div>
        )}

        {particles.map(p => (
          <div
            key={p.id}
            className="confetti"
            style={{ left: `${p.left}%`, animationDelay: `${p.delay}s` }}
          >
            🌸
          </div>
        ))}
      </div>
    </>
  );
}