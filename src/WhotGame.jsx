import { useEffect, useRef, useState } from "react";

export default function CrashGameDemo() {

  const [multiplier, setMultiplier] = useState(1);
  const [running, setRunning] = useState(false);
  const [crashed, setCrashed] = useState(false);
  const [cashout, setCashout] = useState(false);
  const [stake, setStake] = useState("");
  const [result, setResult] = useState("");

  const intervalRef = useRef(null);
  const crashPointRef = useRef(0);

  // 🎲 generate random crash point
  function generateCrashPoint() {
    return (Math.random() * 10 + 1.2).toFixed(2); // 1.2x - 11x
  }

  const startGame = () => {

    if (running) return;

    const bet = Number(stake);
    if (!bet || bet < 1) return;

    setRunning(true);
    setCrashed(false);
    setCashout(false);
    setMultiplier(1);
    setResult("");

    crashPointRef.current = parseFloat(generateCrashPoint());

    intervalRef.current = setInterval(() => {

      setMultiplier(prev => {

        const next = +(prev + 0.05).toFixed(2);

        if (next >= crashPointRef.current) {
          crashGame();
        }

        return next;
      });

    }, 100);
  };

  const crashGame = () => {

    clearInterval(intervalRef.current);
    setRunning(false);
    setCrashed(true);

    if (!cashout) {
      setResult("💥 CRASHED — YOU LOST");
    }
  };

  const cashOut = () => {

    if (!running || cashout) return;

    setCashout(true);

    const bet = Number(stake);
    const win = Math.floor(bet * multiplier);

    setResult(`🎉 CASHED OUT AT x${multiplier} → WIN ₦${win}`);

    clearInterval(intervalRef.current);
    setRunning(false);
  };

  return (
    <div style={{ textAlign: "center", paddingTop: 100 }}>

      <h2>💥 CRASH GAME (DEMO ONLY)</h2>

      <h1 style={{ fontSize: 60 }}>
        x{multiplier.toFixed(2)}
      </h1>

      {crashed && !cashout && (
        <h2 style={{ color: "red" }}>💥 CRASHED</h2>
      )}

      <input
        type="number"
        placeholder="Enter stake"
        value={stake}
        onChange={e => setStake(e.target.value)}
        style={{ padding: 10, fontSize: 16 }}
      />

      <div style={{ marginTop: 20 }}>

        {!running ? (
          <button onClick={startGame}>
            START GAME
          </button>
        ) : (
          <button onClick={cashOut}>
            CASH OUT
          </button>
        )}

      </div>

      <h3 style={{ marginTop: 20 }}>{result}</h3>

    </div>
  );
}