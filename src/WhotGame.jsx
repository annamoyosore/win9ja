import { useEffect, useRef, useState } from "react";

const SHAPES = ["circle", "triangle", "square", "star", "cross"];

/* =========================================================
   🔊 SOUND ENGINE (STABLE)
========================================================= */
function playSound(type) {
  try {
    const s = {
      play: "https://actions.google.com/sounds/v1/cartoon/pop.ogg",
      draw: "https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg",
      alert: "https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg"
    };

    const audio = new Audio(s[type]);
    audio.volume = 0.7;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  } catch (e) {}
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

  const [round, setRound] = useState(1);
  const maxRounds = 3;

  const [turn, setTurn] = useState("player");

  const gameRef = useRef(null);
  const turnRef = useRef("player");
  const extraTurnRef = useRef(false); // ✅ RULE 1 CONTROL

  useEffect(() => {
    gameRef.current = game;
  }, [game]);

  useEffect(() => {
    turnRef.current = turn;
  }, [turn]);

  /* =========================================================
     LOG SYSTEM
  ========================================================= */
  function addLog(msg, who = "player") {
    setLog(p => [...p, `${who === "bot" ? "🤖" : "🧑"} ${msg}`].slice(-15));
  }

  function pushAlert(msg) {
    setAlerts(p => [...p.slice(-3), msg]);
    setTimeout(() => setAlerts(p => p.slice(1)), 2500);
  }

  /* =========================================================
     ROUND ENGINE (UNCHANGED)
  ========================================================= */
  function nextRound(who) {
    if (round < maxRounds) {
      setRound(r => r + 1);

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

      setTurn("player");
      turnRef.current = "player";
      return;
    }

    setWinner(who === "player" ? "YOU WIN MATCH 🏆" : "BOT WINS 🤖🏆");
  }

  /* =========================================================
     WIN SYSTEM (UNCHANGED)
  ========================================================= */
  function handleWin(who) {
    setCoins(p => {
      if (who === "player") {
        return { player: p.player + 3, bot: p.bot - 3 };
      }
      return { player: p.player - 3, bot: p.bot + 3 };
    });

    playSound("alert");
    nextRound(who);
  }

  /* =========================================================
     WITHDRAW (UNCHANGED)
  ========================================================= */
  function withdrawGame() {
    const ok = window.confirm("Withdraw? You lose 1 coin");
    if (!ok) return;

    setCoins(p => ({
      player: p.player - 1,
      bot: p.bot + 1
    }));

    setWinner("WITHDRAWN ❌");
    setGame(null);
    setRound(1);
  }

  /* =========================================================
     RULE ENGINE (FIXED CONTROL LOGIC)
  ========================================================= */
  function applyRules(card, copy, isPlayer) {
    const opponent = isPlayer ? 1 : 0;

    extraTurnRef.current = false;

    // 🔢 1 HOLD ON (EXTRA TURN)
    if (card.number === 1) {
      pushAlert("🟡 HOLD ON (EXTRA TURN)");
      addLog("Hold On activated", isPlayer ? "player" : "bot");
      extraTurnRef.current = true;
    }

    // 🔢 2 PICK TWO
    if (card.number === 2) {
      copy.players[opponent].hand.push(copy.deck.pop());
      copy.players[opponent].hand.push(copy.deck.pop());
      copy.skipNext = opponent;

      pushAlert("🔴 PICK 2");
      addLog("Pick 2 activated", isPlayer ? "player" : "bot");
    }

    // 🔢 8 SUSPENSION
    if (card.number === 8) {
      copy.skipNext = opponent;

      pushAlert("🔵 SUSPENSION");
      addLog("Suspension activated", isPlayer ? "player" : "bot");
    }

    // 🔢 14 GENERAL MARKET
    if (card.number === 14) {
      copy.players.forEach((p, i) => {
        if (i !== opponent) p.hand.push(copy.deck.pop());
      });

      pushAlert("🟢 GENERAL MARKET");
      addLog("General Market activated", isPlayer ? "player" : "bot");
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

    setLog([]);
    setWinner(null);
    setTurn("player");
    setRound(1);
    turnRef.current = "player";
    extraTurnRef.current = false;
  }

  const top = game?.discard?.at(-1);

  /* =========================================================
     PLAYER MOVE
  ========================================================= */
  function playCard(i) {
    const g = gameRef.current;
    if (!g || winner) return;

    if (turnRef.current !== "player") return;

    const copy = JSON.parse(JSON.stringify(g));
    const card = copy.players[0].hand[i];

    if (!isValidMove(card, top)) {
      pushAlert("❌ Invalid move");
      return;
    }

    copy.players[0].hand.splice(i, 1);
    copy.discard.push(card);

    addLog(`Played ${card.number}`, "player");
    applyRules(card, copy, true);

    if (copy.players[0].hand.length === 0) {
      handleWin("player");
      return;
    }

    setGame(copy);

    if (extraTurnRef.current) {
      setTurn("player");
      turnRef.current = "player";
      return;
    }

    setTurn("bot");
    turnRef.current = "bot";
    setTimeout(botPlay, 800);
  }

  /* =========================================================
     MARKET
  ========================================================= */
  function drawMarket() {
    const g = gameRef.current;
    if (!g || winner) return;

    if (turnRef.current !== "player") return;

    const copy = JSON.parse(JSON.stringify(g));

    copy.players[0].hand.push(copy.deck.pop());

    addLog("Market draw", "player");
    playSound("draw");

    setGame(copy);

    setTurn("bot");
    turnRef.current = "bot";

    setTimeout(botPlay, 800);
  }

  /* =========================================================
     BOT
  ========================================================= */
  function botPlay() {
    const g = gameRef.current;
    if (!g || winner) return;

    if (turnRef.current !== "bot") return;

    const copy = JSON.parse(JSON.stringify(g));
    const bot = copy.players[1];

    const move = bot.hand.findIndex(c => {
      if (!top) return true;
      return c.number === top.number || c.shape === top.shape;
    });

    if (move === -1) {
      bot.hand.push(copy.deck.pop());
      addLog("Drew", "bot");

      setGame(copy);

      setTurn("player");
      turnRef.current = "player";
      return;
    }

    const card = bot.hand.splice(move, 1)[0];
    copy.discard.push(card);

    addLog(`Played ${card.number}`, "bot");
    applyRules(card, copy, false);

    if (bot.hand.length === 0) {
      handleWin("bot");
      return;
    }

    setGame(copy);

    if (extraTurnRef.current) {
      setTurn("bot");
      turnRef.current = "bot";
      return;
    }

    setTurn("player");
    turnRef.current = "player";
  }

  /* =========================================================
     UI
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

        <div>
          🧑 You: {coins.player} 🪙 | 🤖 Bot: {coins.bot} 🪙
        </div>

        <div>ROUND {round} / {maxRounds}</div>

        <button onClick={withdrawGame} style={{ background: "red", color: "#fff" }}>
          Withdraw
        </button>

        <div>🤖 Bot Cards: {game.players[1].hand.length}</div>

        <div style={styles.center}>
          {top && <img src={drawCard(top)} style={{ width: 60 }} />}
          <button onClick={drawMarket} style={styles.marketBtn}>
            🃏 MARKET ({game.deck.length})
          </button>
        </div>

        <div>
          {game.players[0].hand.map((c, i) => (
            <img
              key={i}
              src={drawCard(c)}
              style={{ width: 60 }}
              onClick={() => playCard(i)}
            />
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
   🎨 STYLES
========================================================= */
const styles = {
  bg: { minHeight: "100vh", background: "green", display: "flex", justifyContent: "center", alignItems: "center" },
  box: { width: 420, padding: 10, background: "#00000066", color: "#fff" },
  center: { display: "flex", justifyContent: "center", margin: "10px 0" },
  history: { fontSize: 12, marginTop: 10 },
  startBtn: { padding: 15, background: "green", color: "#fff", borderRadius: 10 },
  marketBtn: { background: "gold", border: "none", padding: 10, borderRadius: 8 }
};