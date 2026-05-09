import { useEffect, useState } from "react";

const SIZE = 100;

// 🐍 Snakes const snakes = { 16: 6, 47: 26, 49: 11, 56: 53, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 98: 78 };

// 🪜 Ladders const ladders = { 1: 38, 4: 14, 9: 31, 21: 42, 28: 84, 36: 44, 51: 67, 71: 91, 80: 100 };

// 🕳️ Special tiles const potholes = { 13: -3, 33: -5, 77: -10 };

const missTurns = { 22: 2, 66: 2 };

const dryBack = { 44: 1, 88: 10 };

function rollDice() { return Math.floor(Math.random() * 6) + 1; }

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

export default function SnakeAndLadder() { const [player, setPlayer] = useState(1); const [bot, setBot] = useState(1); const [dice, setDice] = useState(1); const [turn, setTurn] = useState("player"); const [winner, setWinner] = useState(null); const [moving, setMoving] = useState(false); const [message, setMessage] = useState(""); const [skipPlayer, setSkipPlayer] = useState(0); const [skipBot, setSkipBot] = useState(0);

function applyTileEffects(pos, isPlayer) { let newPos = pos;

if (snakes[newPos]) {
  setMessage("🐍 Snake bite!");
  newPos = snakes[newPos];
}

if (ladders[newPos]) {
  setMessage("🪜 Ladder up!");
  newPos = ladders[newPos];
}

if (potholes[newPos]) {
  setMessage("🕳️ Pot hole! Move back");
  newPos = Math.max(1, newPos + potholes[newPos]);
}

if (missTurns[newPos]) {
  setMessage("⏳ Miss turns activated!");
  if (isPlayer) setSkipPlayer(missTurns[newPos]);
  else setSkipBot(missTurns[newPos]);
}

if (dryBack[newPos]) {
  setMessage("🌪️ Dry back storm!");
  newPos = dryBack[newPos];
}

return newPos;

}

async function animateMove(start, steps, setter, isPlayer) { let pos = start;

for (let i = 0; i < steps; i++) {
  await sleep(120);
  pos += 1;
  setter(pos);
}

await sleep(200);
const finalPos = applyTileEffects(pos, isPlayer);
setter(finalPos);

if (finalPos === SIZE) {
  setWinner(isPlayer ? "player" : "bot");
}

return finalPos;

}

async function playPlayer() { if (turn !== "player" || winner || moving || skipPlayer > 0) { if (skipPlayer > 0) setSkipPlayer(skipPlayer - 1); setTurn("bot"); return; }

setMoving(true);

const value = rollDice();
setDice(value);
setMessage(`🎲 You rolled ${value}`);

await animateMove(player, value, setPlayer, true);

setTurn("bot");
setMoving(false);

}

useEffect(() => { async function botPlay() { if (turn !== "bot" || winner || moving) return;

if (skipBot > 0) {
    setSkipBot(skipBot - 1);
    setTurn("player");
    return;
  }

  setMoving(true);

  const value = rollDice();
  setDice(value);
  setMessage(`🤖 Bot rolled ${value}`);

  await animateMove(bot, value, setBot, false);

  setTurn("player");
  setMoving(false);
}

botPlay();

}, [turn]);

function reset() { setPlayer(1); setBot(1); setDice(1); setTurn("player"); setWinner(null); setMoving(false); setMessage(""); setSkipPlayer(0); setSkipBot(0); }

function getIcon(num) { if (snakes[num]) return "🐍"; if (ladders[num]) return "🪜"; if (potholes[num]) return "🕳️"; if (missTurns[num]) return "⏳"; if (dryBack[num]) return "🌪️"; return ""; }

return ( <div style={styles.container}> <h2>🐍 Snake & Ladder (Enhanced Board)</h2>

<p style={{ color: "#facc15" }}>{message}</p>

  <div style={styles.board}>
    {Array.from({ length: SIZE }, (_, i) => i + 1).map((num) => (
      <div key={num} style={styles.cell}>
        <span style={{ fontSize: 8 }}>{num}</span>
        <span>{getIcon(num)}</span>
        {player === num && "🔴"}
        {bot === num && "🤖"}
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
    🧠 Includes snakes, ladders, potholes, miss-turns & dry-back zones
  </p>
</div>

); }

const styles = { container: { background: "#0f172a", color: "white", minHeight: "100vh", textAlign: "center", padding: 20, fontFamily: "Arial" }, board: { display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 2, marginTop: 20 }, cell: { background: "#1f2937", height: 35, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", fontSize: 10, borderRadius: 4 }, info: { marginTop: 15 }, buttons: { marginTop: 15 }, btn: { padding: "10px 15px", background: "#16a34a", color: "white", border: "none", borderRadius: 8, marginRight: 10 }, reset: { padding: "10px 15px", background: "#ef4444", color: "white", border: "none", borderRadius: 8 }, note: { marginTop: 10, fontSize: 12, opacity: 0.7 } };