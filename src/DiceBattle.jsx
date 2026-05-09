import { useEffect, useState } from "react";

const SIZE = 100;

const snakes = { 16: 6, 47: 26, 49: 11, 56: 53, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 98: 78 }; const ladders = { 1: 38, 4: 14, 9: 31, 21: 42, 28: 84, 36: 44, 51: 67, 71: 91, 80: 100 }; const potholes = { 13: -3, 33: -5, 77: -10 }; const missTurns = { 22: 2, 66: 2 }; const dryBack = { 44: 1, 88: 10 };

function rollDice() { return Math.floor(Math.random() * 6) + 1; }

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

export default function SnakeAndLadder() { const [player, setPlayer] = useState(1); const [bot, setBot] = useState(1); const [dice, setDice] = useState(1); const [turn, setTurn] = useState("player"); const [winner, setWinner] = useState(null); const [moving, setMoving] = useState(false); const [msg, setMsg] = useState(""); const [skipP, setSkipP] = useState(0); const [skipB, setSkipB] = useState(0);

function applyEffects(pos, isPlayer) { let p = pos;

if (snakes[p]) { setMsg("snake"); p = snakes[p]; }
if (ladders[p]) { setMsg("ladder"); p = ladders[p]; }
if (potholes[p]) { setMsg("hole"); p = Math.max(1, p + potholes[p]); }

if (missTurns[p]) {
  setMsg("skip");
  if (isPlayer) setSkipP(missTurns[p]);
  else setSkipB(missTurns[p]);
}

if (dryBack[p]) { setMsg("reset"); p = dryBack[p]; }

return p;

}

async function move(start, steps, setter, isPlayer) { let p = start;

for (let i = 0; i < steps; i++) {
  await sleep(80);
  p += 1;
  setter(p);
}

const final = applyEffects(p, isPlayer);
setter(final);

if (final === SIZE) setWinner(isPlayer ? "player" : "bot");

return final;

}

async function playPlayer() { if (turn !== "player" || winner || moving) return;

if (skipP > 0) {
  setSkipP(skipP - 1);
  setTurn("bot");
  return;
}

setMoving(true);
const d = rollDice();
setDice(d);

await move(player, d, setPlayer, true);

setTurn("bot");
setMoving(false);

}

useEffect(() => { async function botPlay() { if (turn !== "bot" || winner || moving) return;

if (skipB > 0) {
    setSkipB(skipB - 1);
    setTurn("player");
    return;
  }

  setMoving(true);
  const d = rollDice();
  setDice(d);

  await move(bot, d, setBot, false);

  setTurn("player");
  setMoving(false);
}

botPlay();

}, [turn]);

function reset() { setPlayer(1); setBot(1); setDice(1); setTurn("player"); setWinner(null); setMoving(false); setMsg(""); setSkipP(0); setSkipB(0); }

function icon(n) { if (snakes[n]) return "S"; if (ladders[n]) return "L"; if (potholes[n]) return "H"; if (missTurns[n]) return "M"; if (dryBack[n]) return "D"; return ""; }

return ( <div style={styles.container}> <h3>Snake & Ladder</h3>

<p style={styles.msg}>{msg}</p>

  <div style={styles.board}>
    {Array.from({ length: SIZE }, (_, i) => i + 1).map((n) => (
      <div key={n} style={styles.cell}>
        <span style={styles.num}>{n}</span>
        <span style={styles.icon}>{icon(n)}</span>
        {player === n && "P"}
        {bot === n && "B"}
      </div>
    ))}
  </div>

  <div style={styles.info}>
    Dice: {dice} | Turn: {turn}
    {winner && <div>Winner: {winner}</div>}
  </div>

  <div style={styles.btns}>
    <button onClick={playPlayer} disabled={turn !== "player" || moving}>
      Roll
    </button>
    <button onClick={reset}>Reset</button>
  </div>
</div>

); }

const styles = { container: { background: "#0f172a", color: "white", minHeight: "100vh", textAlign: "center", padding: 10, fontFamily: "Arial" }, board: { display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 1, marginTop: 10 }, cell: { background: "#1f2937", height: 22, fontSize: 8, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }, num: { fontSize: 7 }, icon: { fontSize: 8 }, info: { marginTop: 8, fontSize: 12 }, btns: { marginTop: 8, display: "flex", gap: 6, justifyContent: "center" }, msg: { fontSize: 11, opacity: 0.8 } };