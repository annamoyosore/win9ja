import React from "react";

export default function FreeFire() {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🔥 FREE FIRE LOBBY</h1>
        <p style={styles.subtitle}>Welcome Survivor</p>
      </div>

      <div style={styles.card}>
        <h2>🎮 Match Options</h2>

        <button style={styles.button}>Start Solo Match</button>
        <button style={styles.button}>Start Duo Match</button>
        <button style={styles.button}>Start Squad Match</button>
      </div>

      <div style={styles.card}>
        <h2>📶 Connection Status</h2>
        <p style={styles.text}>Server: Africa-West</p>
        <p style={styles.text}>Ping: 42ms (Good)</p>
      </div>

      <div style={styles.footer}>
        <p>⚡ Tip: Low graphics mode recommended for weak internet</p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "Arial",
    background: "linear-gradient(#111, #1c1c1c)",
    color: "white",
    height: "100vh",
    padding: "20px",
    textAlign: "center",
  },
  header: {
    marginBottom: "20px",
  },
  title: {
    color: "#ff3d00",
    fontSize: "28px",
  },
  subtitle: {
    color: "#ccc",
  },
  card: {
    background: "#222",
    padding: "15px",
    margin: "10px auto",
    borderRadius: "10px",
    width: "90%",
    maxWidth: "400px",
  },
  button: {
    display: "block",
    width: "100%",
    padding: "10px",
    margin: "8px 0",
    background: "#ff3d00",
    border: "none",
    color: "white",
    borderRadius: "6px",
    cursor: "pointer",
  },
  text: {
    margin: "5px 0",
  },
  footer: {
    marginTop: "20px",
    fontSize: "12px",
    color: "#aaa",
  },
};