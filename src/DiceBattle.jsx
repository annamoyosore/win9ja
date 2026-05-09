import { useEffect, useState } from "react";

const SIZE = 100;

const snakes = { 16: 6, 47: 26, 49: 11, 56: 53, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 98: 78 };

const ladders = { 1: 38, 4: 14, 9: 31, 21: 42, 28: 84, 36: 44, 51: 67, 71: 91, 80: 100 };

function rollDice() { return Math.floor(Math.random() * 6) + 1; }

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

export default function SnakeAndLadder() { const [player, setPlayer] = useState(1); const [bot, setBot] = useState(1); const [dice, setDice] = useState(1); const [turn, setTurn] = useState("player"); const [winner, setWinner] = useState(null); const [moving, setMoving] = useState(false);

function applySpecial(pos) { if (snakes[pos]) return snakes[pos]; if (ladders[pos]) return ladders[pos]; return pos; }

async function animateMove(start, steps, setter, isPlayer) { let pos = start;

for (let i = 0; i < steps; i++) {
  await sleep(150);
  pos += 1;
  setter(pos);
}

await sleep(200);
const finalPos = applySpecial(pos);
setter(finalPos);

if (finalPos === SIZE) {
  setWinner(isPlayer ? "player" : "bot");
}

return finalPos;

}

async function playPlayer() { if (turn !== "player" || winner || moving) return;

setMoving(true);

const value = rollDice();
setDice(value);

const newPos = await animateMove(player, value, setPlayer, true);

setTurn("bot");
setMoving(false);

}

useEffect(() => { async function botPlay() { if (turn !== "bot" || winner || moving) return;

setMoving(true);

  const value = rollDice();
  setDice(value);

  const newPos = await animateMove(bot, value, setBot, false);

  setTurn("player");
  setMoving(false);
}

botPlay();

}, [turn]);

function reset() { setPlayer(1); setBot(1); setDice(1); setTurn("player"); setWinner(null); setMoving(false); }

return ( <div style={styles.container}> <h2>🐍 Snake & Ladder (Player vs Bot)</h2>

<div style={styles.board}>
    {Array.from({ length: SIZE }, (_, i) => i + 1).map((num) => (
      <div key={num} style={styles.cell}>
        {player === num && "🔴"}
        {bot === num && "🤖"}
        <span style={{ fontSize: 8 }}>{num}</span>
      </div>
    ))}
  </div>

  <div style={styles.info}>
    <p>🎲 Dice: {dice}</p>
    <p>Turn: {turn}</p>
    {winner && <h3>🏆 {winner === "player" ? "You Win!" : "Bot Wins!"}</h3>}
  </div>

  <div style={styles.buttons}>
    <button onClick={playPlayer} style={styles.btn} disabled={turn !== "player" || moving || winner}>
      Roll Dice 🎲
    </button>

    <button onClick={reset} style={styles.reset}>
      Reset
    </button>
  </div>

  <p style={styles.note}>
    Dice controls step-by-step movement (realistic snake & ladder logic)
  </p>
</div>

); }

const styles = { container: { background: "#0f172a", color: "white", minHeight: "100vh", textAlign: "center", padding: 20, fontFamily: "Arial" }, board: { display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 2, marginTop: 20 }, cell: { background: "#1f2937", height: 35, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", fontSize: 10, borderRadius: 4 }, info: { marginTop: 15 }, buttons: { marginTop: 15 }, btn: { padding: "10px 15px", background: "#16a34a", color: "white", border: "none", borderRadius: 8, marginRight: 10 }, reset: { padding: "10px 15px", background: "#ef4444", color: "white", border: "none", borderRadius: 8 }, note: { marginTop: 10, fontSize: 12, opacity: 0.7 } };