import { useEffect, useRef, useState } from "react";

const SHAPES = ["circle", "triangle", "square", "star", "cross"];

/* =========================================================
   🔊 SOUND ENGINE
========================================================= */
function playSound(type) {
  const s = {
    play: "https://actions.google.com/sounds/v1/cartoon/pop.ogg",
    draw: "https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg",
    alert: "https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg"
  };
  new Audio(s[type]).play().catch(() => {});
}

/* =========================================================
   🧠 RULE ENGINE
========================================================= */
function ruleEngine(copy, pushAlert, addLog) {
  if (copy.skipNext !== null && copy.skipNext !== undefined) {
    if (copy.skipNext === 0) {
      pushAlert("⛔ YOU SKIPPED");
      addLog("You were skipped");
      copy.skipNext = null;
      copy.turn = "bot";
      return true;
    }

    if (copy.skipNext === 1) {
      pushAlert("🤖 BOT SKIPPED");
      addLog("Bot was skipped");
      copy.skipNext = null;
      copy.turn = "player";
      return true;
    }
  }
  return false;
}

/* =========================================================
   🃏 DECK
========================================================= */
function createDeck() {
  const deck = [];

  for (const shape of SHAPES) {
    for (let i = 1; i <= 13; i++) {
      if (i === 6 || i === 9) continue;
      deck.push({ shape, number: i });
    }
    deck.push({ shape, number: 14 });
  }

  return deck.sort(() => Math.random() - 0.5);
}

/* =========================================================
   🎯 VALID MOVE
========================================================= */
function isValidMove(card, top) {
  if (!top) return true;
  return card.number === top.number || card.shape === top.shape;
}

/* =========================================================
   🎨 CARD RENDER (UNCHANGED)
========================================================= */
const cache = new Map();

function drawCard(card) {
  const key = `${card.shape}_${card.number}`;
  if (cache.has(key)) return cache.get(key);

  const c = document.createElement("canvas");
  c.width = 90;
  c.height = 130;
  const ctx = c.getContext("2d");

  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, 90, 130);

  ctx.strokeStyle = "#e11d48";
  ctx.lineWidth = 3;
  ctx.strokeRect(2, 2, 86, 126);

  ctx.fillStyle = "#e11d48";
  ctx.font = "bold 14px Arial";
  ctx.fillText(card.number, 8, 18);

  const cx = 45, cy = 65;

  if (card.shape === "circle") {
    ctx.beginPath();
    ctx.arc(cx, cy, 16, 0, Math.PI * 2);
    ctx.fill();
  }

  if (card.shape === "square") ctx.fillRect(cx - 14, cy - 14, 28, 28);

  if (card.shape === "triangle") {
    ctx.beginPath();
    ctx.moveTo(cx, cy - 16);
    ctx.lineTo(cx - 16, cy + 16);
    ctx.lineTo(cx + 16, cy + 16);
    ctx.closePath();
    ctx.fill();
  }

  if (card.shape === "star") ctx.fillText("★", cx - 8, cy + 6);

  if (card.shape === "cross") {
    ctx.fillRect(cx - 3, cy - 16, 6, 32);
    ctx.fillRect(cx - 16, cy - 3, 32, 6);
  }

  const img = c.toDataURL();
  cache.set(key, img);
  return img;
}

/* =========================================================
   🎮 GAME
========================================================= */
export default function WhotGame() {

  const [game, setGame] = useState(null);
  const [log, setLog] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [winner, setWinner] = useState(null);

  const [coins, setCoins] = useState({ player: 3, bot: 3 });

  // ✅ FIX ADDED
  const [round, setRound] = useState(1);
  const maxRounds = 3;

  const gameRef = useRef(null);

  useEffect(() => {
    gameRef.current = game;
  }, [game]);

  function addLog(msg) {
    setLog(p => [...p, msg].slice(-10));
  }

  function pushAlert(msg) {
    setAlerts(p => [...p.slice(-3), msg]);
    setTimeout(() => setAlerts(p => p.slice(1)), 2500);
  }

  // ✅ FIX ADDED
  function withdrawGame() {
    const confirm = window.confirm("Withdraw? coins go to opponent");
    if (!confirm) return;

    setCoins(p => ({
      player: 0,
      bot: p.bot + p.player
    }));

    setWinner("🚪 WITHDRAWN");
  }

  /* =========================================================
     WIN SYSTEM
  ========================================================= */
  function handleWin(winnerId) {
    if (winnerId === "player") {
      setCoins(p => ({ player: p.player + 3, bot: p.bot - 3 }));
      setWinner("YOU WIN 🏆");
    } else {
      setCoins(p => ({ player: p.player - 3, bot: p.bot + 3 }));
      setWinner("BOT WINS 🤖🏆");
    }
    playSound("alert");
  }

  /* =========================================================
     RULES FIXED
  ========================================================= */
  function applyRules(card, copy, isPlayer, pushAlert, addLog) {
    const opponent = isPlayer ? 1 : 0;

    if (card.number === 1) {
      pushAlert("🟡 HOLD ON - PLAY AGAIN");
      addLog("Rule 1 active");
    }

    if (card.number === 2) {
      copy.players[opponent].hand.push(copy.deck.pop());
      copy.players[opponent].hand.push(copy.deck.pop());
      copy.skipNext = opponent;
      pushAlert("🔴 PICK TWO");
    }

    if (card.number === 8) {
      copy.skipNext = opponent;
      pushAlert("🔵 SUSPENSION");
    }

    if (card.number === 14) {
      copy.players.forEach((p, idx) => {
        if (idx !== opponent) p.hand.push(copy.deck.pop());
      });
      pushAlert("🟢 GENERAL MARKET");
    }
  }

  /* =========================================================
     INIT GAME
  ========================================================= */
  function createGame() {
    const deck = createDeck();

    setGame({
      players: [
        { hand: deck.splice(0, 6) },
        { hand: deck.splice(0, 6) }
      ],
      deck,
      discard: [deck.pop()],
      skipNext: null
    });

    setWinner(null);
  }

  const top = game?.discard?.at?.(-1);

  /* =========================================================
     PLAYER MOVE FIXED CALL
  ========================================================= */
  function playCard(i) {
    const g = gameRef.current;
    if (!g || winner) return;

    const copy = JSON.parse(JSON.stringify(g));

    if (ruleEngine(copy, pushAlert, addLog)) {
      setGame(copy);
      return;
    }

    const card = copy.players[0].hand[i];

    if (!isValidMove(card, top)) {
      pushAlert("Invalid move");
      return;
    }

    copy.players[0].hand.splice(i, 1);
    copy.discard.push(card);

    playSound("play");

    // ✅ FIXED
    applyRules(card, copy, true, pushAlert, addLog);

    if (copy.players[0].hand.length === 0) {
      handleWin("player");
      return;
    }

    setGame(copy);
    setTimeout(botPlay, 1200);
  }

  /* =========================================================
     MARKET (UNCHANGED)
  ========================================================= */
  function drawMarket() {
    const g = gameRef.current;
    if (!g || winner) return;

    const copy = JSON.parse(JSON.stringify(g));

    copy.players[0].hand.push(copy.deck.pop());

    playSound("draw");
    addLog("Market draw");

    setGame(copy);
    setTimeout(botPlay, 1200);
  }

  /* =========================================================
     BOT FIXED CALL
  ========================================================= */
  function botPlay() {
    const g = gameRef.current;
    if (!g || winner) return;

    const copy = JSON.parse(JSON.stringify(g));

    if (ruleEngine(copy, pushAlert, addLog)) {
      setGame(copy);
      return;
    }

    const bot = copy.players[1];

    const move = bot.hand.findIndex(c =>
      c.number === top.number || c.shape === top.shape
    );

    if (move === -1) {
      bot.hand.push(copy.deck.pop());
      return setGame(copy);
    }

    const card = bot.hand.splice(move, 1)[0];
    copy.discard.push(card);

    playSound("play");

    // ✅ FIXED
    applyRules(card, copy, false, pushAlert, addLog);

    if (bot.hand.length === 0) {
      handleWin("bot");
      return;
    }

    setGame(copy);
  }

  /* =========================================================
     UI (UNCHANGED STRUCTURE)
  ========================================================= */
  if (!game) {
    return (
      <div style={styles.bg}>
        <button onClick={createGame} style={styles.startBtn}>
          START GAME
        </button>
      </div>
    );
  }

  return (
    <div style={styles.bg}>
      <div style={styles.box}>

        <h2>WHOT GAME</h2>

        {/* ROUND + WITHDRAW SAFE */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ fontSize: 28, color: "gold" }}>
            ROUND {round} / {maxRounds}
          </div>

          {!winner && (
            <button onClick={withdrawGame} style={{ background: "red" }}>
              Withdraw
            </button>
          )}
        </div>

        <div>
          🧑 You: {coins.player} 🪙 | 🤖 Bot: {coins.bot} 🪙
        </div>

        <div>🤖 Bot Cards: {game.players[1].hand.length}</div>

        <div style={styles.center}>
          {top && <img src={drawCard(top)} style={{ width: 60 }} />}
          <button onClick={drawMarket} style={styles.marketBtn}>
            🃏 MARKET ({game.deck.length})
          </button>
        </div>

        <div>
          {game.players[0].hand.map((c, i) => (
            <img key={i} src={drawCard(c)} style={{ width: 60 }} onClick={() => playCard(i)} />
          ))}
        </div>

        <div style={styles.history}>
          {log.map((l, i) => <div key={i}>• {l}</div>)}
        </div>

      </div>
    </div>
  );
}

/* =========================================================
   STYLES (UNCHANGED)
========================================================= */
const styles = {
  bg: { minHeight: "100vh", background: "green", display: "flex", justifyContent: "center", alignItems: "center" },
  box: { width: 420, padding: 10, background: "#00000066", color: "#fff" },
  center: { display: "flex", justifyContent: "center", margin: "10px 0" },
  history: { fontSize: 12, marginTop: 10 },
  startBtn: { padding: 15, background: "green", color: "#fff", borderRadius: 10 },
  marketBtn: { background: "gold", border: "none", padding: 10, borderRadius: 8 }
};