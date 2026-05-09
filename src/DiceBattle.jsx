import { useEffect, useState } from "react";

const SIZE = 100;

const snakes = { 16: 6, 47: 26, 49: 11, 56: 53, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 98: 78 }; const ladders = { 1: 38, 4: 14, 9: 31, 21: 42, 28: 84, 36: 44, 51: 67, 71: 91, 80: 100 }; const potholes = { 13: -3, 33: -5, 77: -10 }; const missTurns = { 22: 2, 66: 2 }; const dryBack = { 44: 1, 88: 10 };

function rollDice() { return Math.floor(Math.random() * 6) + 1; }

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

export default function SnakeAndLadder() { const [player, setPlayer] = useState(1); const [bot, setBot] = useState(1); const [dice, setDice] = useState(1); const [turn, setTurn] = useState("player"); const [winner, setWinner] = useState(null); const [moving, setMoving] = useState(false); const [msg, setMsg] = useState(""); const [skipP, setSkipP] = useState(0); const [skipB, setSkipB] = useState(0);

function applyEffects(pos, isPlayer) { let p = pos;

if (snakes[p]) { setMsg("🐍 Snake! Down"); p = snakes[p]; }
if (ladders[p]) { setMsg("🪜 Ladder! Up"); p = ladders[p]; }
if (potholes[p]) { setMsg("🕳️ Hole! Back"); p = Math.max(1, p + potholes[p]); }

if (missTurns[p]) {
  setMsg("⏳ Miss turns");
  if (isPlayer) setSkipP(missTurns[p]);
  else setSkipB(missTurns[p]);
}

if (dryBack[p]) { setMsg("🌪️ Reset zone"); p = dryBack[p]; }

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

return ( <div style={styles.container}> <h3>🐍 Snake & Ladder</h3>

<p style={styles.msg}>{msg}</p>

  {/* 🎨 REAL BOARD IMAGE BACKGROUND */}
  <div style={styles.boardWrap}>
    <img
      src="/board.png"
      alt="snake ladder board"
      style={styles.boardImg}
    />

    {/* PLAYER TOKENS OVERLAY */}
    <div
      style={{
        ...styles.token,
        left: `${(player % 10) * 10}%`,
        top: `${Math.floor(player / 10) * 10}%",
        background: "red"
      }}
    >
      P
    </div>

    <div
      style={{
        ...styles.token,
        left: `${(bot % 10) * 10}%`,
        top: `${Math.floor(bot / 10) * 10}%",
        background: "blue"
      }}
    >
      B
    </div>
  </div>

  <div style={styles.info}>
    Dice: {dice} | Turn: {turn}
    {winner && <div>Winner: {winner}</div>}
  </div>

  <div style={styles.btns}>
    <button onClick={playPlayer} disabled={turn !== "player" || moving}>
      Roll 🎲
    </button>
    <button onClick={reset}>Reset</button>
  </div>

  <p style={styles.note}>
    🎨 Uses real board image (add /board.png in public folder)
  </p>
</div>

); }

const styles = { container: { background: "#0f172a", color: "white", minHeight: "100vh", textAlign: "center", padding: 10 }, boardWrap: { position: "relative", width: 300, height: 300, margin: "10px auto" }, boardImg: { width: "100%", height: "100%", objectFit: "cover", borderRadius: 10 }, token: { position: "absolute", width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "white", fontWeight: "bold" }, info: { marginTop: 10 }, btns: { marginTop: 10, display: "flex", gap: 10, justifyContent: "center" }, msg: { fontSize: 12, opacity: 0.8 }, note: { fontSize: 11, opacity: 0.7 } };