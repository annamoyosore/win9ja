import { useEffect, useRef, useState } from "react";

export default function CrashGameDemo() {

  const [multiplier, setMultiplier] = useState(1);
  const [running, setRunning] = useState(false);
  const [crashed, setCrashed] = useState(false);
  const [cashout, setCashout] = useState(false);
  const [stake, setStake] = useState("");
  const [result, setResult] = useState("");

  const [jetY, setJetY] = useState(0);

  const intervalRef = useRef(null);
  const crashPointRef = useRef(0);

  // 🔊 SIMPLE SOUND ENGINE (no files needed)
  const beep = (freq = 200, time = 120) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.frequency.value = freq;
      osc.type = "sine";
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      setTimeout(() => osc.stop(), time);
    } catch {}
  };

  function generateCrashPoint() {
    return (Math.random() * 10 + 1.5).toFixed(2);
  }

  const startGame = () => {

    if (running) return;

    const bet = Number(stake);
    if (!bet || bet < 1) return;

    setRunning(true);
    setCrashed(false);
    setCashout(false);
    setMultiplier(1);
    setJetY(0);
    setResult("");

    crashPointRef.current = parseFloat(generateCrashPoint());

    beep(300); // start sound

    intervalRef.current = setInterval(() => {

      setMultiplier(prev => {

        const next = +(prev + 0.05).toFixed(2);

        // ✈️ move jet upward
        setJetY(jet => jet - 6);

        if (next >= crashPointRef.current) {
          crashGame();
        }

        return next;
      });

    }, 120);
  };

  const crashGame = () => {

    clearInterval(intervalRef.current);
    setRunning(false);
    setCrashed(true);

    beep(120, 300); // crash sound

    if (!cashout) {
      setResult("💥 CRASHED — LOST");
    }
  };

  const cashOut = () => {

    if (!running || cashout) return;

    setCashout(true);

    const bet = Number(stake);
    const win = Math.floor(bet * multiplier);

    setResult(`🎉 CASHOUT x${multiplier} → ₦${win}`);

    beep(600); // win sound

    clearInterval(intervalRef.current);
    setRunning(false);
  };

  return (
    <div style={{
      textAlign: "center",
      paddingTop: 60,
      background: "#050816",
      height: "100vh",
      color: "white",
      overflow: "hidden"
    }}>

      <h2>💥 CRASH GAME DEMO</h2>

      {/* MULTIPLIER */}
      <h1 style={{
        fontSize: 60,
        transition: "0.2s"
      }}>
        x{multiplier.toFixed(2)}
      </h1>

      {/* CRASH TEXT */}
      {crashed && !cashout && (
        <h2 style={{ color: "red", animation: "shake 0.3s" }}>
          💥 CRASHED
        </h2>
      )}

      {/* ✈️ JET ANIMATION */}
      <div style={{
        position: "relative",
        height: 200,
        marginTop: 20
      }}>
        <div
          style={{
            position: "absolute",
            left: "50%",
            transform: `translate(-50%, ${jetY}px)`,
            fontSize: 60,
            transition: "transform 0.1s linear"
          }}
        >
          ✈️
        </div>
      </div>

      {/* INPUT */}
      <input
        type="number"
        placeholder="Stake"
        value={stake}
        onChange={e => setStake(e.target.value)}
        style={{
          padding: 10,
          fontSize: 16,
          borderRadius: 6
        }}
      />

      <div style={{ marginTop: 20 }}>

        {!running ? (
          <button onClick={startGame}>
            START 🚀
          </button>
        ) : (
          <button onClick={cashOut}>
            CASH OUT 💰
          </button>
        )}

      </div>

      <h3 style={{ marginTop: 20 }}>{result}</h3>

      {/* CSS SHAKE */}
      <style>
        {`
          @keyframes shake {
            0% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            50% { transform: translateX(5px); }
            75% { transform: translateX(-5px); }
            100% { transform: translateX(0); }
          }
        `}
      </style>

    </div>
  );
}