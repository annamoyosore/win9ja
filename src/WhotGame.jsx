import { useEffect, useState } from "react";

const BOARD_SIZE = 15;

function getInitialState() { return { player: { pos: 0 }, bot: { pos: 0 }, dice: 1, turn: "player", winner: null, rolling: false }; }

export default function LudoVsBot() { const [state, setState] = useState(getInitialState());

function rollDice(isBot = false) { if (state.winner || state.rolling) return;

const dice = Math.floor(Math.random() * 6) + 1;

setState((prev) => {
  const current = isBot ? "bot" : "player";
  const newPos = prev[current].pos + dice;

  let winner = null;
  if (newPos >= BOARD_SIZE) {
    winner = current;
  }

  return {
    ...prev,
    dice,
    rolling: false,
    [current]: {
      pos: Math.min(newPos, BOARD_SIZE)
    },
    turn: isBot ? "player" : "bot",
    winner
  };
});

}

function playerMove() { if (state.turn !== "player" || state.winner) return;

setState((prev) => ({ ...prev, rolling: true }));

setTimeout(() => {
  rollDice(false);
}, 500);

}

useEffect(() => { if (state.turn === "bot" && !state.winner) { const timer = setTimeout(() => { setState((prev) => ({ ...prev, rolling: true }));

setTimeout(() => {
      rollDice(true);
    }, 600);
  }, 800);

  return () => clearTimeout(timer);
}

}, [state.turn, state.winner]);

function resetGame() { setState(getInitialState()); }

return ( <div style={styles.container}> <h2>🎲 Ludo: Player vs Bot</h2>

<div style={styles.board}>
    {Array.from({ length: BOARD_SIZE }).map((_, i) => (
      <div key={i} style={styles.cell}>
        {state.player.pos === i && <span>🔴</span>}
        {state.bot.pos === i && <span>🤖</span>}
      </div>
    ))}
  </div>

  <div style={styles.info}>
    <p>Dice: <b>{state.dice}</b></p>
    <p>Turn: <b>{state.turn === "player" ? "You" : "Bot"}</b></p>

    {state.winner && (
      <h3>
        🏆 {state.winner === "player" ? "You Win!" : "Bot Wins!"}
      </h3>
    )}
  </div>

  <div style={styles.buttons}>
    <button
      style={styles.btn}
      onClick={playerMove}
      disabled={state.turn !== "player" || state.rolling}
    >
      Roll Dice 🎲
    </button>

    <button style={styles.reset} onClick={resetGame}>
      Reset
    </button>
  </div>

  <p style={styles.note}>
    (Frontend only — Player vs AI bot, no backend)
  </p>
</div>

); }

const styles = { container: { fontFamily: "Arial", textAlign: "center", padding: 20, color: "#fff", background: "#0f172a", minHeight: "100vh" }, board: { display: "grid", gridTemplateColumns: "repeat(15, 20px)", justifyContent: "center", margin: "20px 0", gap: 2 }, cell: { width: 20, height: 20, background: "#1f2937", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }, info: { marginTop: 10 }, buttons: { marginTop: 15, display: "flex", gap: 10, justifyContent: "center" }, btn: { padding: "10px 15px", background: "#16a34a", color: "white", border: "none", borderRadius: 8, cursor: "pointer" }, reset: { padding: "10px 15px", background: "#ef4444", color: "white", border: "none", borderRadius: 8, cursor: "pointer" }, note: { marginTop: 10, fontSize: 12, opacity: 0.7 } };