import { useState, useRef } from "react";

export default function FreeSpinWheel() {
  const segments = [
    { label: "❌ Lose", weight: 0.35 },
    { label: "🔁 Try Again", weight: 0.2 },
    { label: "✖️ x2", weight: 0.2 },
    { label: "✖️ x3", weight: 0.15 },
    { label: "✖️ x10", weight: 0.05 },
    { label: "🎁 Free Spin", weight: 0.05 }
  ];

  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [freeSpins, setFreeSpins] = useState(1);

  const audioCtxRef = useRef(null);

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
    setTimeout(() => osc.stop(), 120);
  };

  // 🎯 Weighted random
  const getWeightedIndex = () => {
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

    playSound("spin");

    const index = getWeightedIndex();
    const landed = segments[index].label;

    const stopAngle =
      360 - index * segmentAngle - segmentAngle / 2;

    const spinBase = Math.floor(Math.random() * 720) + 1440;
    const finalRotation = rotation + spinBase + stopAngle;

    setRotation(finalRotation);

    const tick = setInterval(() => playSound("tick"), 120);

    setTimeout(() => {
      clearInterval(tick);

      // 🎯 RESULT ACTIONS
      if (landed === "🎁 Free Spin" || landed === "🔁 Try Again") {
        setFreeSpins((f) => f + 1);
      }

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
          color: white;
          font-family: Arial;
          background: radial-gradient(circle, #1f1c2c, #928dab);
        }

        .wheel {
          width: 260px;
          height: 260px;
          border-radius: 50%;
          border: 5px solid white;
          margin: 20px;
          transition: transform 3s cubic-bezier(0.25,1,0.5,1);
        }

        button {
          padding: 12px 25px;
          border-radius: 25px;
          border: none;
          cursor: pointer;
        }

        .result {
          margin-top: 15px;
          font-size: 20px;
        }
      `}</style>

      <div className="container">
        <h2>🎡 Free Spin Wheel</h2>

        <p>🎟 Free Spins: {freeSpins}</p>

        <div
          className="wheel"
          style={{ transform: `rotate(${rotation}deg)` }}
        />

        <button onClick={spin} disabled={spinning || freeSpins <= 0}>
          {spinning ? "Spinning..." : "Spin"}
        </button>

        <div className="result">{result}</div>
      </div>
    </>
  );
}