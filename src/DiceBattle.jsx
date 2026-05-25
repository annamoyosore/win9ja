import React, { useState } from "react";

export default function FreeFireVsAI() {
  const [playerHP, setPlayerHP] = useState(100);
  const [aiHP, setAiHP] = useState(100);
  const [log, setLog] = useState([]);
  const [gameOver, setGameOver] = useState(false);

  // 🎯 Random damage generator
  const getDamage = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  // 🔫 Player attack
  const playerAttack = () => {
    if (gameOver) return;

    const damage = getDamage(10, 25);
    const newAiHP = Math.max(aiHP - damage, 0);

    setAiHP(newAiHP);
    addLog(`🧑 You hit AI for ${damage} damage`);

    if (newAiHP <= 0) {
      setGameOver(true);
      addLog("🏆 You Win!");
      return;
    }

    setTimeout(aiAttack, 700);
  };

  // 🤖 AI attack
  const aiAttack = () => {
    const damage = getDamage(8, 20);
    const newPlayerHP = Math.max(playerHP - damage, 0);

    setPlayerHP(newPlayerHP);
    addLog(`🤖 AI hit you for ${damage} damage`);

    if (newPlayerHP <= 0) {
      setGameOver(true);
      addLog("💀 AI Wins!");
    }
  };

  // 📝 Log helper
  const addLog = (text) => {
    setLog((prev) => [text, ...prev]);
  };

  // 🔄 Restart game
  const restart = () => {
    setPlayerHP(100);
    setAiHP(100);
    setLog([]);
    setGameOver(false);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🔥 Free Fire VS AI (Logic Demo)</h1>

      <div style={styles.stats}>
        <div>🧑 Player HP: {playerHP}</div>
        <div>🤖 AI HP: {aiHP}</div>
      </div>

      <div style={styles.buttons}>
        <button onClick={playerAttack} style={styles.button} disabled={gameOver}>
          🔫 Attack
        </button>

        <button onClick={restart} style={styles.buttonAlt}>
          🔄 Restart
        </button>
      </div>

      {gameOver && <h2 style={styles.gameOver}>Game Over</h2>}

      <div style={styles.logBox}>
        <h3>Battle Log</h3>
        {log.map((item, index) => (
          <p key={index} style={styles.logItem}>
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "Arial",
    textAlign: "center",
    background: "#111",
    color: "white",
    minHeight: "100vh",
    padding: "20px",
  },
  title: {
    color: "#ff3d00",
  },
  stats: {
    margin: "20px",
    fontSize: "18px",
  },
  buttons: {
    marginBottom: "20px",
  },
  button: {
    padding: "10px 20px",
    margin: "5px",
    background: "#ff3d00",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  buttonAlt: {
    padding: "10px 20px",
    margin: "5px",
    background: "#444",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  gameOver: {
    color: "yellow",
  },
  logBox: {
    marginTop: "20px",
    background: "#222",
    padding: "10px",
    borderRadius: "10px",
    maxWidth: "400px",
    marginLeft: "auto",
    marginRight: "auto",
  },
  logItem: {
    fontSize: "14px",
    textAlign: "left",
  },
};