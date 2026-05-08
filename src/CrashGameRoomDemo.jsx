import { useEffect, useState } from "react";

export default function CrashGameRoomDemo({ players = [], onBack }) {
  const [multiplier, setMultiplier] = useState(1.0);
  const [crashed, setCrashed] = useState(false);
  const [cashedOut, setCashedOut] = useState(false);
  const [rocketY, setRocketY] = useState(0);

  const [cashoutValue, setCashoutValue] = useState(null);

  // 🚀 GAME LOOP
  useEffect(() => {
    if (crashed) return;

    const interval = setInterval(() => {
      setMultiplier((m) => {
        const next = +(m + 0.05).toFixed(2);

        // rocket animation
        setRocketY((y) => y + 4);

        // crash point (random demo)
        if (next >= 3.5 + Math.random() * 2) {
          setCrashed(true);
          clearInterval(interval);
        }

        return next;
      });
    }, 120);

    return () => clearInterval(interval);
  }, [crashed]);

  // 💰 CASHOUT
  function cashout() {
    if (crashed || cashedOut) return;

    setCashedOut(true);
    setCashoutValue(multiplier);
  }

  return (
    <div style={styles.container}>

      {/* HEADER */}
      <h2>🚀 CRASH GAME ROOM</h2>

      {/* MULTIPLIER */}
      <div style={styles.multiplier}>
        {crashed ? (
          <span style={{ color: "red" }}>💥 CRASHED @ {multiplier.toFixed(2)}x</span>
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

      {/* PLAYERS */}
      <div style={styles.panel}>
        <h3>👥 Players</h3>
        {players.map((p) => (
          <div key={p.id}>
            {p.name} — ₦{p.stake}
          </div>
        ))}
      </div>

      {/* CASHOUT BUTTON */}
      <button
        onClick={cashout}
        disabled={crashed || cashedOut}
        style={styles.button}
      >
        {cashedOut
          ? `CASHED OUT @ ${cashoutValue}x`
          : "CASH OUT"}
      </button>

      {/* RESULT */}
      {crashed && !cashedOut && (
        <div style={{ color: "red", marginTop: 10 }}>
          You lost this round 💔
        </div>
      )}

      {cashedOut && (
        <div style={{ color: "gold", marginTop: 10 }}>
          🎉 You won at {cashoutValue}x
        </div>
      )}

      {/* BACK */}
      <button onClick={onBack} style={{ marginTop: 20 }}>
        ← Back to Lobby
      </button>

    </div>
  );
}

// =========================
// STYLES
// =========================
const styles = {
  container: {
    textAlign: "center",
    padding: 20,
    background: "#020617",
    color: "#fff",
    minHeight: "100vh"
  },
  multiplier: {
    fontSize: 40,
    fontWeight: "bold",
    margin: 20
  },
  rocket: {
    fontSize: 40,
    transition: "transform 0.1s linear"
  },
  panel: {
    background: "#111827",
    padding: 15,
    marginTop: 20,
    borderRadius: 10
  },
  button: {
    marginTop: 20,
    padding: 12,
    fontSize: 18,
    borderRadius: 10,
    background: "gold",
    border: "none",
    cursor: "pointer"
  }
};