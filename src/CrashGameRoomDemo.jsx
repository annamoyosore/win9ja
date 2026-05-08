import { useEffect, useRef, useState } from "react";

export default function CrashGameRoomDemo({ players = [], onBack }) {
  const [multiplier, setMultiplier] = useState(1.0);
  const [status, setStatus] = useState("RUNNING"); // RUNNING | CRASHED

  const [rocketY, setRocketY] = useState(0);

  // 💰 PLAYER STATE (important fix)
  const [player, setPlayer] = useState({
    bet: 1000,
    cashedOut: false,
    cashoutMultiplier: null,
    profit: 0
  });

  const intervalRef = useRef(null);
  const crashPointRef = useRef(null);

  // 🚀 START GAME ENGINE (GLOBAL RUNNER)
  function startGame() {
    setMultiplier(1.0);
    setStatus("RUNNING");
    setRocketY(0);

    crashPointRef.current = +(3.2 + Math.random() * 3).toFixed(2);

    intervalRef.current = setInterval(() => {
      setMultiplier((m) => {
        if (status !== "RUNNING") return m;

        const growth = 0.02 + m * 0.02;
        const next = +(m + growth).toFixed(2);

        setRocketY((y) => y + 3 + m * 0.15);

        // 💥 GLOBAL CRASH
        if (next >= crashPointRef.current) {
          clearInterval(intervalRef.current);
          setStatus("CRASHED");
        }

        return next;
      });
    }, 100);
  }

  useEffect(() => {
    startGame();
    return () => clearInterval(intervalRef.current);
  }, []);

  // 💰 PLAYER CASHOUT (DOES NOT STOP GAME)
  function cashout() {
    if (status !== "RUNNING" || player.cashedOut) return;

    const payout = player.bet * multiplier;
    const profit = payout - player.bet;

    setPlayer({
      ...player,
      cashedOut: true,
      cashoutMultiplier: multiplier,
      profit
    });
  }

  return (
    <div style={styles.container}>

      <h2>🚀 CRASH LIVE ENGINE</h2>

      {/* 🚀 LIVE MULTIPLIER (ALWAYS RUNNING) */}
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

      {/* 🚀 ROCKET (ALWAYS MOVING UNTIL CRASH) */}
      <div
        style={{
          ...styles.rocket,
          transform: `translateY(-${rocketY}px)`
        }}
      >
        🚀
      </div>

      {/* 💰 PLAYER PANEL */}
      <div style={styles.panel}>
        <div>Bet: ₦{player.bet}</div>

        <div style={{ marginTop: 10 }}>
          {player.cashedOut ? (
            <span style={{ color: "gold" }}>
              Cashed out @ {player.cashoutMultiplier.toFixed(2)}x
              <br />
              Profit: ₦{player.profit.toFixed(2)}
            </span>
          ) : (
            <span>Not cashed out</span>
          )}
        </div>
      </div>

      {/* 💰 CASHOUT BUTTON */}
      <button
        onClick={cashout}
        disabled={status !== "RUNNING" || player.cashedOut}
        style={styles.button}
      >
        CASH OUT
      </button>

      {/* 💥 LOSS MESSAGE */}
      {status === "CRASHED" && !player.cashedOut && (
        <div style={{ color: "red", marginTop: 10 }}>
          You lost ₦{player.bet}
        </div>
      )}

      {/* 🔁 BACK */}
      <button onClick={onBack} style={{ marginTop: 20 }}>
        ← Back
      </button>

      {/* STATUS */}
      <div style={{ marginTop: 10, opacity: 0.7 }}>
        {status === "RUNNING" && "Flight is live ✈️ (others can still cash out)"}
        {status === "CRASHED" && "Round ended 💥"}
      </div>

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
    border: "none"
  }
};