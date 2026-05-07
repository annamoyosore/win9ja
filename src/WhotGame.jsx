import { useEffect, useState } from "react";

const fakePlayers = [
  { id: 1, name: "Emeka", stake: 500 },
  { id: 2, name: "Chioma", stake: 1000 },
  { id: 3, name: "Tunde", stake: 250 },
  { id: 4, name: "Mary", stake: 750 }
];

export default function CrashWaitingRoomDemo() {
  const [countdown, setCountdown] = useState(10);
  const [players, setPlayers] = useState(fakePlayers);
  const [joined, setJoined] = useState(false);

  // countdown animation
  useEffect(() => {
    if (countdown <= 0) return;

    const t = setInterval(() => {
      setCountdown((c) => c - 1);
    }, 1000);

    return () => clearInterval(t);
  }, [countdown]);

  // fake "join"
  function joinGame() {
    if (joined) return;

    setPlayers((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: "You",
        stake: 500
      }
    ]);

    setJoined(true);
  }

  return (
    <div style={styles.container}>

      {/* TITLE */}
      <h1 style={styles.title}>🚀 Crash Game Lobby (Demo)</h1>

      {/* STATUS */}
      <div style={styles.card}>
        <h3>🟡 Status: WAITING PLAYERS</h3>
        <h2 style={{ color: "gold" }}>
          ⏳ Starts in: {countdown}s
        </h2>
      </div>

      {/* JOIN BUTTON */}
      <button
        onClick={joinGame}
        style={{
          ...styles.button,
          background: joined ? "gray" : "gold"
        }}
      >
        {joined ? "JOINED" : "JOIN GAME"}
      </button>

      {/* PLAYERS LIST */}
      <div style={styles.list}>
        <h3>👥 Players in Room</h3>

        {players.map((p) => (
          <div key={p.id} style={styles.player}>
            👤 {p.name} — ₦{p.stake}
          </div>
        ))}
      </div>

      {/* FAKE LIVE ANIMATION */}
      <div style={styles.footer}>
        🔥 Game will start soon... get ready to cash out!
      </div>

    </div>
  );
}

// =========================
// STYLES
// =========================
const styles = {
  container: {
    padding: 20,
    textAlign: "center",
    background: "#020617",
    minHeight: "100vh",
    color: "#fff"
  },
  title: {
    fontSize: 26,
    marginBottom: 20
  },
  card: {
    background: "#111827",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20
  },
  button: {
    padding: "12px 20px",
    fontSize: 18,
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
    marginBottom: 20
  },
  list: {
    marginTop: 20,
    textAlign: "left",
    background: "#0f172a",
    padding: 15,
    borderRadius: 10
  },
  player: {
    padding: 8,
    borderBottom: "1px solid #1f2937"
  },
  footer: {
    marginTop: 20,
    color: "gold",
    fontWeight: "bold"
  }
};