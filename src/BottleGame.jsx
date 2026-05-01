import { useState, useRef } from "react";

export default function FreeSpinWheel() {
  const segments = [
    { label: "❌ Lose", weight: 0.35 },
    { label: "🔁 Try Again", weight: 0.2 },
    { label: "x2", weight: 0.2 },
    { label: "x3", weight: 0.15 },
    { label: "x10", weight: 0.05 },
    { label: "🎁 Free Spin", weight: 0.05 }
  ];

  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [freeSpins, setFreeSpins] = useState(1);

  const audioCtxRef = useRef(null);

  const segmentAngle = 360 / segments.length;

  // 🔊 SOUND SYSTEM
  const playSound = (type) => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();
    }

    const ctx = audioCtxRef.current;

    const tone = (freq, duration, volume = 0.1) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.value = freq;
      gain.gain.value = volume;

      osc.start();
      setTimeout(() => osc.stop(), duration);
    };

    // ⏳ suspense build
    if (type === "suspense") {
      let steps = [200, 230, 260, 300, 340, 380];
      steps.forEach((f, i) => {
        setTimeout(() => tone(f, 120, 0.05), i * 120);
      });
    }

    // 🎡 tick
    if (type === "tick") {
      tone(800 + Math.random() * 200, 40, 0.05);
    }

    // 🎉 win
    if (type === "win") {
      let notes = [400, 550, 700, 900, 1100];
      notes.forEach((f, i) => {
        setTimeout(() => tone(f, 140, 0.12), i * 140);
      });
    }

    // ❌ lose
    if (type === "lose") {
      let notes = [500, 350, 200];
      notes.forEach((f, i) => {
        setTimeout(() => tone(f, 180, 0.1), i * 180);
      });
    }
  };

  // 🎯 weighted result
  const getIndex = () => {
    let rand = Math.random();
    let sum = 0;

    for (let i = 0; i < segments.length; i++) {
      sum += segments[i].weight;
      if (rand <= sum) return i;
    }
    return 0;
  };

  const spin = () => {
    if (spinning || freeSpins <= 0) return;

    setSpinning(true);
    setResult("");
    setFreeSpins((f) => f - 1);

    playSound("suspense");

    const index = getIndex();
    const landed = segments[index].label;

    const stopAngle =
      360 - index * segmentAngle - segmentAngle / 2;

    const spinBase = Math.floor(Math.random() * 720) + 1440;
    const finalRotation = rotation + spinBase + stopAngle;

    setRotation(finalRotation);

    // 🎡 dynamic ticking
    let tickSpeed = 50;

    const tickLoop = () => {
      if (!spinning) return;

      playSound("tick");
      tickSpeed += 12;

      if (tickSpeed < 220) {
        setTimeout(tickLoop, tickSpeed);
      }
    };

    tickLoop();

    setTimeout(() => {
      if (landed === "🎁 Free Spin" || landed === "🔁 Try Again") {
        setFreeSpins((f) => f + 1);
      }

      setResult(`🎯 ${landed}`);

      setTimeout(() => {
        if (landed.includes("x") || landed.includes("Spin") || landed.includes("Try")) {
          playSound("win");
        } else {
          playSound("lose");
        }
      }, 300);

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
          font-family: Arial;
          background: radial-gradient(circle, #1f1c2c, #928dab);
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
          z-index: 5;
        }

        .wheel {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 6px solid white;
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
          color: white;
        }

        button {
          padding: 12px 25px;
          border-radius: 25px;
          border: none;
          cursor: pointer;
          background: #ff9800;
          color: white;
          font-weight: bold;
        }

        .result {
          margin-top: 15px;
          font-size: 20px;
        }
      `}</style>

      <div className="container">
        <h2>🎡 Free Spin Wheel</h2>

        <p>🎟 Spins: {freeSpins}</p>

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
                  background: `hsl(${i * 60}, 70%, 50%)`
                }}
              >
                <div style={{ transform: `skewY(-${90 - segmentAngle}deg)` }}>
                  {seg.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <button onClick={spin} disabled={spinning || freeSpins <= 0}>
          {spinning ? "Spinning..." : "Spin"}
        </button>

        <div className="result">{result}</div>
      </div>
    </>
  );
}