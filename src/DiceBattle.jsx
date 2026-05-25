import React, { useEffect, useState } from "react";

const MAP_SIZE = 10;

export default function FreeFireMapGame() {
  const [player, setPlayer] = useState({ x: 2, y: 2, hp: 100 });
  const [ai, setAi] = useState({ x: 7, y: 7, hp: 100 });
  const [log, setLog] = useState([]);
  const [gameOver, setGameOver] = useState(false);

  const rand = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  const addLog = (text) => {
    setLog((prev) => [text, ...prev.slice(0, 8)]);
  };

  // 📏 distance check
  const distance = (a, b) =>
    Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

  // 🧑 PLAYER MOVE
  const movePlayer = (dir) => {
    if (gameOver) return;

    setPlayer((p) => {
      let newPos = { ...p };

      if (dir === "up") newPos.y = Math.max(0, p.y - 1);
      if (dir === "down") newPos.y = Math.min(MAP_SIZE - 1, p.y + 1);
      if (dir === "left") newPos.x = Math.max(0, p.x - 1);
      if (dir === "right") newPos.x = Math.min(MAP_SIZE - 1, p.x + 1);

      return newPos;
    });

    setTimeout(aiTurn, 300);
  };

  // 🤖 AI SMART MOVE (CHASE + DEFEND)
  const aiTurn = () => {
    if (gameOver) return;

    setAi((a) => {
      let newAI = { ...a };

      const dx = player.x - a.x;
      const dy = player.y - a.y;

      // 🧠 AI chase logic (smarter movement)
      if (Math.abs(dx) > Math.abs(dy)) {
        newAI.x += dx > 0 ? 1 : -1;
      } else {
        newAI.y += dy > 0 ? 1 : -1;
      }

      newAI.x = Math.max(0, Math.min(MAP_SIZE - 1, newAI.x));
      newAI.y = Math.max(0, Math.min(MAP_SIZE - 1, newAI.y));

      return newAI;
    });

    setTimeout(combatCheck, 200);
  };

  // 🔫 COMBAT SYSTEM (when close)
  const combatCheck = () => {
    const dist = distance(player, ai);

    if (dist <= 1) {
      // 🧑 player attack
      const playerDamage = rand(10, 20);

      setAi((a) => {
        const newHp = a.hp - playerDamage;
        if (newHp <= 0) {
          setGameOver(true);
          addLog("🏆 You eliminated the AI!");
          return { ...a, hp: 0 };
        }
        return { ...a, hp: newHp };
      });

      addLog(`🧑 You hit AI for ${playerDamage}`);

      // 🤖 AI counterattack
      const aiDamage = rand(8, 18);

      setPlayer((p) => {
        const newHp = p.hp - aiDamage;
        if (newHp <= 0) {
          setGameOver(true);
          addLog("💀 AI eliminated you!");
          return { ...p, hp: 0 };
        }
        return { ...p, hp: newHp };
      });

      addLog(`🤖 AI hits you for ${aiDamage}`);
    }
  };

  // 🗺️ MAP RENDER
  const renderMap = () => {
    let grid = [];

    for (let y = 0; y < MAP_SIZE; y++) {
      let row = [];

      for (let x = 0; x < MAP_SIZE; x++) {
        let cell = "🟩";

        if (player.x === x && player.y === y) cell = "🧑";
        if (ai.x === x && ai.y === y) cell = "🤖";

        row.push(
          <span key={`${x}-${y}`} style={{ margin: 2 }}>
            {cell}
          </span>
        );
      }

      grid.push(
        <div key={y} style={{ lineHeight: "20px" }}>
          {row}
        </div>
      );
    }

    return grid;
  };

  const restart = () => {
    setPlayer({ x: 2, y: 2, hp: 100 });
    setAi({ x: 7, y: 7, hp: 100 });
    setLog([]);
    setGameOver(false);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🔥 Free Fire Map Battle (AI Chase System)</h1>

      <div style={styles.stats}>
        🧑 HP: {player.hp} | 🤖 HP: {ai.hp}
      </div>

      <div style={styles.map}>{renderMap()}</div>

      <div style={styles.controls}>
        <button onClick={() => movePlayer("up")}>⬆️</button>
        <div>
          <button onClick={() => movePlayer("left")}>⬅️</button>
          <button onClick={() => movePlayer("down")}>⬇️</button>
          <button onClick={() => movePlayer("right")}>➡️</button>
        </div>
      </div>

      <button onClick={restart} style={styles.restart}>
        🔄 Restart
      </button>

      {gameOver && <h2 style={styles.gameOver}>Game Over</h2>}

      <div style={styles.log}>
        {log.map((l, i) => (
          <p key={i}>{l}</p>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "Arial",
    background: "#111",
    color: "white",
    minHeight: "100vh",
    textAlign: "center",
    padding: "10px",
  },
  title: { color: "#ff3d00" },
  stats: { margin: "10px" },
  map: {
    display: "inline-block",
    background: "#222",
    padding: "10px",
    borderRadius: "10px",
  },
  controls: { margin: "15px" },
  restart: {
    padding: "8px 15px",
    marginTop: "10px",
    background: "#444",
    color: "white",
    border: "none",
    borderRadius: "6px",
  },
  gameOver: { color: "yellow" },
  log: {
    marginTop: "10px",
    fontSize: "12px",
    maxHeight: "120px",
    overflowY: "auto",
  },
};