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
    "💎 JACKPOT ×30"
  ];

  const segmentAngle = 360 / segments.length;
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
  const [flowers, setFlowers] = useState([]);

  const audioCtxRef = useRef(null);

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

  const spawnFlowers = () => {
    const items = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100
    }));
    setFlowers(items);
    setTimeout(() => setFlowers([]), 2500);
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

    const map = {
      LOSE: 0,
      X2: 1,
      FREE: 2,
      X3: 3,
      HALF: 4,
      X1: 5,
      X10: 6
    };

    const index = map[outcome];

    const stopAngle = 360 - (index * segmentAngle + segmentAngle / 2);
    const finalRotation = rotation + 1440 + stopAngle;

    setRotation(finalRotation);

    setTimeout(() => {
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
        setTotal((t) => t + win);
        setWon(win);
        playSound("win");
        spawnFlowers();
        setOverlay("win");
        text = `🎉 Won ₦${win}`;
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
          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content:center;
          background: radial-gradient(circle,#1a1a2e,#000);
          color:white;
        }

        .stake button {
          margin:5px;
          padding:8px 14px;
          border:none;
          border-radius:10px;
          background:#333;
          color:white;
        }

        .active {
          background: purple;
          box-shadow:0 0 10px purple;
        }

        .wheel-container {
          width:200px;
          height:200px;
          position:relative;
          margin:15px;
        }

        .pointer {
          position:absolute;
          top:-14px;
          left:50%;
          transform:translateX(-50%);
          font-size:22px;
        }

        .wheel {
          width:100%;
          height:100%;
          border-radius:50%;
          border:5px solid gold;
          position:relative;
          overflow:hidden;
          transition:transform 3s cubic-bezier(0.25,1,0.5,1);
        }

        .segment {
          position:absolute;
          width:50%;
          height:50%;
          top:50%;
          left:50%;
          transform-origin:0% 0%;
          display:flex;
          align-items:center;
          justify-content:flex-end;
          padding-right:10px;
          clip-path: polygon(0% 0%, 100% 50%, 0% 100%);
        }

        .label {
          font-size:13px;
          font-weight:bold;
          color:white;
          text-shadow:0 0 5px black;
        }

        .jackpot {
          color:gold;
          font-weight:900;
          text-shadow:0 0 10px gold,0 0 20px gold;
        }

        .confetti {
          position:fixed;
          top:-20px;
          font-size:18px;
          animation:fall 2.5s linear forwards;
        }

        @keyframes fall {
          to {
            transform:translateY(110vh);
            opacity:0;
          }
        }
      `}</style>

      <div className="container">
        <h3>🎡 Casino Wheel</h3>

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

          <div
            className="wheel"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            {segments.map((seg, i) => (
              <div
                key={i}
                className="segment"
                style={{
                  transform: `rotate(${i * segmentAngle}deg)`,
                  background: `hsl(${i * 45},80%,50%)`
                }}
              >
                <span className={`label ${seg.includes("JACKPOT") ? "jackpot" : ""}`}>
                  {seg}
                </span>
              </div>
            ))}
          </div>
        </div>

        <button onClick={spin}>
          {spinning ? "Spinning..." : "🎡 Spin"}
        </button>

        <div>
          💰 Total: ₦{total} | 🏆 Won: ₦{won}
        </div>

        <p>{result}</p>

        {countdown && <p>Resetting in {countdown}s...</p>}

        {overlay && (
          <div style={{
            position:"fixed",
            top:0,left:0,width:"100%",height:"100%",
            display:"flex",alignItems:"center",justifyContent:"center",
            background:"rgba(0,0,0,0.7)",
            fontSize:"32px"
          }}>
            {overlay === "win" ? "🏆 WIN!" : "😢 LOST"}
          </div>
        )}

        {flowers.map(f => (
          <div key={f.id} className="confetti" style={{ left:`${f.left}%` }}>
            🌸
          </div>
        ))}
      </div>
    </>
  );
}