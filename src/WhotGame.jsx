import { useEffect, useState } from "react";

const fakePlayers = [
  { id: 1, name: "Emeka", stake: 500 },
  { id: 2, name: "Chioma", stake: 1000 },
  { id: 3, name: "Tunde", stake: 250 },
  { id: 4, name: "Mary", stake: 750 }
];

export default function CrashGameDemo() {
  const [screen, setScreen] = useState("lobby");
  const [countdown, setCountdown] = useState(10);
  const [players, setPlayers] = useState(fakePlayers);
  const [joined, setJoined] = useState(false);

  // countdown
  useEffect(() => {
    if (screen !== "lobby") return;
    if (countdown <= 0) {
      setScreen("live"); // 🚀 AUTO MOVE TO NEXT ROOM
      return;
    }

    const t = setInterval(() => {
      setCountdown((c) => c - 1);
    }, 1000);

    return () => clearInterval(t);
  }, [countdown, screen]);

  // JOIN
  function joinGame() {
    if (joined) return;

    setPlayers((prev) => [
      ...prev,
      { id: Date.now(), name: "You", stake: 500 }
    ]);

    setJoined(true);
  }

  // =========================
  // LOBBY SCREEN
  // =========================
  if (screen === "lobby") {
    return (
      <div style={styles.container}>
        <h1>🚀 Crash Lobby</h1>

        <div style={styles.card}>
          <h3>🟡 Waiting for players</h3>
          <h2>⏳ Starts in: {countdown}s</h2>
        </div>

        <button
          onClick={joinGame}
          style={{
            ...styles.button,
            background: joined ? "gray" : "gold"
          }}
        >
          {joined ? "JOINED" : "JOIN GAME"}
        </button>

        <div style={styles.list}>
          {players.map((p) => (
            <div key={p.id}>
              👤 {p.name} — ₦{p.stake}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // =========================
  // LIVE ROOM SCREEN
  // =========================
  return (
    <div style={styles.container}>
      <h1>🚀 GAME STARTED</h1>

      <h2 style={{ color: "lime" }}>
        💹 Multiplier Running...
      </h2>

      <p>Players: {players.length}</p>

      <div style={styles.card}>
        🎮 CASHOUT PHASE WILL GO HERE NEXT
      </div>
    </div>
  );
}

// =========================
const styles = {
  container: {
    padding: 20,
    textAlign: "center",
    background: "#020617",
    minHeight: "100vh",
    color: "#fff"
  },
  card: {
    background: "#111827",
    padding: 15,
    borderRadius: 10,
    margin: 20
  },
  button: {
    padding: "12px 20px",
    fontSize: 18,
    borderRadius: 10,
    border: "none",
    margin: 10
  },
  list: {
    marginTop: 20,
    background: "#0f172a",
    padding: 15,
    borderRadius: 10,
    textAlign: "left"
  }
};