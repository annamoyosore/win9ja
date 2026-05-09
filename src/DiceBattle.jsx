import { useEffect, useState } from "react";
import boardImg from "./board.png";

const SIZE = 100;

// 🐍 Snakes
const snakes = {
  16: 6,
  47: 26,
  49: 11,
  56: 53,
  62: 19,
  64: 60,
  87: 24,
  93: 73,
  95: 75,
  98: 78,
};

// 🪜 Ladders
const ladders = {
  1: 38,
  4: 14,
  9: 31,
  21: 42,
  28: 84,
  36: 44,
  51: 67,
  71: 91,
  80: 100,
};

// 🎯 Convert board position into screen position
function getCoords(pos) {
  const index = pos - 1;

  const row = Math.floor(index / 10);

  let col = index % 10;

  // zig-zag board
  if (row % 2 === 1) {
    col = 9 - col;
  }

  const left = col * 10 + 5;
  const top = (9 - row) * 10 + 5;

  return {
    left: `${left}%`,
    top: `${top}%`,
  };
}

function rollDice() {
  return Math.floor(Math.random() * 6) + 1;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export default function SnakeAndLadder() {
  const [player, setPlayer] = useState(1);
  const [bot, setBot] = useState(1);

  const [turn, setTurn] = useState("player");

  const [dice, setDice] = useState(1);

  const [winner, setWinner] = useState("");

  const [moving, setMoving] = useState(false);

  const [message, setMessage] = useState("Your turn 🎲");

  // 🎯 Apply snake or ladder
  function applyEffects(position, isPlayer) {
    let newPos = position;

    if (snakes[newPos]) {
      setMessage(
        `${isPlayer ? "🐍 You hit a snake!" : "🤖 Bot hit a snake!"}`
      );
      newPos = snakes[newPos];
    }

    if (ladders[newPos]) {
      setMessage(
        `${isPlayer ? "🪜 You climbed a ladder!" : "🤖 Bot climbed a ladder!"}`
      );
      newPos = ladders[newPos];
    }

    return newPos;
  }

  // 🚀 Smooth movement animation
  async function movePiece(start, steps, setter, isPlayer) {
    let current = start;

    for (let i = 0; i < steps; i++) {
      await sleep(250);

      current += 1;

      if (current > SIZE) {
        current = SIZE;
      }

      setter(current);
    }

    await sleep(300);

    const finalPos = applyEffects(current, isPlayer);

    setter(finalPos);

    if (finalPos >= SIZE) {
      setWinner(isPlayer ? "PLAYER" : "BOT");
    }

    return finalPos;
  }

  // 👤 PLAYER TURN
  async function playPlayer() {
    if (turn !== "player") return;

    if (winner) return;

    if (moving) return;

    setMoving(true);

    const d = rollDice();

    setDice(d);

    setMessage(`🎲 You rolled ${d}`);

    await movePiece(player, d, setPlayer, true);

    if (!winner) {
      setTurn("bot");
    }

    setMoving(false);
  }

  // 🤖 BOT TURN
  useEffect(() => {
    async function botPlay() {
      if (turn !== "bot") return;

      if (winner) return;

      await sleep(1200);

      setMoving(true);

      const d = rollDice();

      setDice(d);

      setMessage(`🤖 Bot rolled ${d}`);

      await movePiece(bot, d, setBot, false);

      if (!winner) {
        setTurn("player");
      }

      setMoving(false);
    }

    botPlay();
  }, [turn]);

  // 🔄 RESET
  function resetGame() {
    setPlayer(1);
    setBot(1);
    setDice(1);
    setTurn("player");
    setWinner("");
    setMoving(false);
    setMessage("Game Reset 🎮");
  }

  const playerPos = getCoords(player);
  const botPos = getCoords(bot);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🐍 Snake & Ladder</h1>

      <div style={styles.statusBox}>
        <div>🎲 Dice: {dice}</div>

        <div>
          Turn:{" "}
          <span style={{ color: turn === "player" ? "#22c55e" : "#38bdf8" }}>
            {turn.toUpperCase()}
          </span>
        </div>

        {winner && (
          <div style={styles.winner}>
            🏆 Winner: {winner}
          </div>
        )}
      </div>

      <div style={styles.boardWrapper}>
        <img src={boardImg} alt="board" style={styles.board} />

        {/* 🔴 PLAYER */}
        <div
          style={{
            ...styles.token,
            ...playerPos,
            background: "#ef4444",
          }}
        >
          P
        </div>

        {/* 🔵 BOT */}
        <div
          style={{
            ...styles.token,
            ...botPos,
            background: "#3b82f6",
          }}
        >
          B
        </div>
      </div>

      <div style={styles.message}>
        {message}
      </div>

      <div style={styles.buttons}>
        <button
          style={styles.rollBtn}
          onClick={playPlayer}
          disabled={turn !== "player" || moving || winner}
        >
          🎲 Roll Dice
        </button>

        <button style={styles.resetBtn} onClick={resetGame}>
          🔄 Reset
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#0f172a",
    color: "white",
    padding: 15,
    textAlign: "center",
    fontFamily: "Arial",
  },

  title: {
    marginBottom: 10,
  },

  boardWrapper: {
    position: "relative",
    width: 360,
    height: 360,
    margin: "20px auto",
    borderRadius: 20,
    overflow: "hidden",
    boxShadow: "0 0 20px rgba(0,0,0,0.5)",
  },

  board: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  token: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: "50%",
    transform: "translate(-50%, -50%)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: "bold",
    color: "white",
    border: "2px solid white",
    transition: "all 0.25s linear",
    zIndex: 10,
  },

  statusBox: {
    background: "#1e293b",
    padding: 12,
    borderRadius: 12,
    width: 280,
    margin: "0 auto",
    lineHeight: 1.8,
  },

  winner: {
    color: "#facc15",
    fontWeight: "bold",
    fontSize: 18,
  },

  message: {
    marginTop: 10,
    fontSize: 16,
    minHeight: 24,
  },

  buttons: {
    marginTop: 20,
    display: "flex",
    justifyContent: "center",
    gap: 10,
  },

  rollBtn: {
    padding: "12px 20px",
    borderRadius: 10,
    border: "none",
    background: "#22c55e",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: 16,
  },

  resetBtn: {
    padding: "12px 20px",
    borderRadius: 10,
    border: "none",
    background: "#ef4444",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: 16,
  },
};