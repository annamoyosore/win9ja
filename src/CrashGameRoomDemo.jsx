import { useEffect, useRef, useState } from "react";

export default function CrashGameRoomDemo({ players = [], onBack }) {
  const [multiplier, setMultiplier] = useState(1.0);
  const [status, setStatus] = useState("RUNNING"); // RUNNING | CRASHED | RESETTING
  const [cashedOut, setCashedOut] = useState(false);

  const [bet, setBet] = useState(1000);
  const [profit, setProfit] = useState(0);

  const [rocketY, setRocketY] = useState(0);

  const intervalRef = useRef(null);
  const crashPointRef = useRef(null);

  // 🎯 START ROUND
  function startRound() {
    setMultiplier(1.0);
    setStatus("RUNNING");
    setCashedOut(false);
    setProfit(0);
    setRocketY(0);

    crashPointRef.current = +(3.2 + Math.random() * 3).toFixed(2);

    intervalRef.current = setInterval(() => {
      setMultiplier((m) => {
        if (status !== "RUNNING") return m;

        // 📈 NON-LINEAR GROWTH (more realistic crash curve)
        const growth = 0.02 + m * 0.015;
        const next = +(m + growth).toFixed(2);

        setRocketY((y) => y + 3 + m * 0.2);

        // 💰 LIVE PROFIT
        setProfit(((bet * next) - bet).toFixed(2));

        // 💥 CRASH CHECK
        if (next >= crashPointRef.current) {
          clearInterval(intervalRef.current);
          setStatus("CRASHED");

          // start crash animation
          triggerCrashAnimation(next);
        }

        return next;
      });
    }, 100);
  }

  // 💥 CRASH ANIMATION (falling effect)
  function triggerCrashAnimation(finalValue) {
    let decay = finalValue;

    const crashInterval = setInterval(() => {
      decay -= 0.15;

      if (decay <= 1) {
        clearInterval(crashInterval);

        setTimeout(() => {
          setStatus("RESETTING");
          startRound();
        }, 1200);

        return;
      }

      setMultiplier(decay);
      setRocketY((y) => y - 4);
    }, 80);
  }

  useEffect(() => {
    startRound();
    return () => clearInterval(intervalRef.current);
  }, []);

  // 💰 CASHOUT
  function cashout() {
    if (status !== "RUNNING" || cashedOut) return;

    setCashedOut(true);

    const payout = bet * multiplier;
    const net = payout - bet;

    setProfit(net.toFixed(2));
  }

  return (
    <div style={styles.container}>

      <h2>🚀 CRASH GAME</h2>

      {/* BET */}
      <input
        type="number"
        value={bet}
        onChange={(e) => setBet(Number(e.target.value))}
        style={styles.input}
      />

      {/* MULTIPLIER */}
      <div style={styles.multiplier}>
        {status === "CRASHED" ? (
          <span style={{ color: "red" }}>
            💥 CRASHED @ {multiplier.toFixed(2)}x
          </span>
        ) : (
          <span style={{ color: "lime" }}>
            {multiplier.toFixed(2)}x
          </span>
        )}
      </div>

      {/* ROCKET */}
      <div
        style={{
          ...styles.rocket,
          transform: `translateY(-${rocketY}px)`
        }}
      >
        🚀
      </div>

      {/* LIVE PROFIT */}
      <div style={styles.profit}>
        Live Profit: ₦{profit}
      </div>

      {/* CASHOUT */}
      <button
        onClick={cashout}
        disabled={status !== "RUNNING" || cashedOut}
        style={styles.button}
      >
        CASH OUT
      </button>

      {/* STATUS */}
      <div style={{ marginTop: 10 }}>
        {status === "RUNNING" && "Game Running"}
        {status === "CRASHED" && "Crashed 💥"}
        {status === "RESETTING" && "Next round starting..."}
      </div>

      <button onClick={onBack} style={{ marginTop: 20 }}>
        ← Back
      </button>
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    padding: 20,
    background: "#020617",
    color: "#fff",
    minHeight: "100vh"
  },
  multiplier: {
    fontSize: 42,
    fontWeight: "bold",
    margin: 20
  },
  rocket: {
    fontSize: 40,
    transition: "transform 0.1s linear"
  },
  profit: {
    marginTop: 10,
    color: "gold"
  },
  button: {
    marginTop: 20,
    padding: 12,
    fontSize: 18,
    borderRadius: 10,
    background: "gold",
    border: "none"
  },
  input: {
    padding: 8,
    fontSize: 16,
    marginTop: 10
  }
};