import { useState, useEffect } from "react";

export default function BottleGame() {
  const [flipping, setFlipping] = useState(false);
  const [result, setResult] = useState("");
  const [rotation, setRotation] = useState(0);

  const flipBottle = () => {
    if (flipping) return;

    setFlipping(true);
    setResult("");

    const spin = Math.floor(Math.random() * 720) + 720;
    setRotation(spin);

    setTimeout(() => {
      const success = Math.random() > 0.5;
      setResult(success ? "🎉 Perfect Landing!" : "💥 Failed Flip!");
      setFlipping(false);
    }, 1200);
  };

  return (
    <>
      {/* 🔥 Embedded Styles */}
      <style>{`
        .bottle-game-container {
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          font-family: Arial, sans-serif;
          color: white;
          position: relative;

          background: linear-gradient(-45deg, #1e3c72, #2a5298, #6a11cb, #2575fc);
          background-size: 400% 400%;
          animation: gradientBG 10s ease infinite;
        }

        @keyframes gradientBG {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .title {
          font-size: 2rem;
          margin-bottom: 20px;
          z-index: 1;
        }

        .bottle-area {
          height: 150px;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1;
        }

        .bottle {
          font-size: 60px;
          transition: transform 1.2s ease-in-out;
        }

        .flip-btn {
          margin-top: 20px;
          padding: 12px 24px;
          background: #ff9800;
          border: none;
          border-radius: 25px;
          color: white;
          font-size: 16px;
          cursor: pointer;
          transition: 0.3s;
          z-index: 1;
        }

        .flip-btn:hover {
          background: #ff5722;
        }

        .result {
          margin-top: 15px;
          font-size: 18px;
          z-index: 1;
        }

        /* Particles */
        .particles {
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
          z-index: 0;
        }

        .particles::before,
        .particles::after {
          content: "";
          position: absolute;
          width: 200%;
          height: 200%;
          background-image: radial-gradient(white 2px, transparent 2px);
          background-size: 50px 50px;
          animation: moveParticles 20s linear infinite;
          opacity: 0.2;
        }

        .particles::after {
          animation-duration: 30s;
        }

        @keyframes moveParticles {
          from { transform: translateY(0); }
          to { transform: translateY(-200px); }
        }
      `}</style>

      {/* 🎮 Game UI */}
      <div className="bottle-game-container">
        <div className="particles"></div>

        <h1 className="title">Bottle Flip Challenge</h1>

        <div className="bottle-area">
          <div
            className="bottle"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            🍾
          </div>
        </div>

        <button className="flip-btn" onClick={flipBottle}>
          {flipping ? "Flipping..." : "Flip Bottle"}
        </button>

        {result && <p className="result">{result}</p>}
      </div>
    </>
  );
}