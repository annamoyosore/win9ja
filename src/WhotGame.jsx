import { useEffect, useRef, useState } from "react";

const SHAPES = ["circle", "triangle", "square", "star", "cross"];

// =========================
// SOUND (UNCHANGED)
// =========================
function playSound(type) {
  const s = {
    play: "https://actions.google.com/sounds/v1/cartoon/pop.ogg",
    draw: "https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg",
    alert: "https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg"
  };
  new Audio(s[type]).play().catch(() => {});
}

// =========================
// DECK (UNCHANGED)
// =========================
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

// =========================
// FIXED RULE ENGINE (IMPORTANT)
// =========================
function isValidMove(card, top, requestedShape) {
  if (!top) return true;

  // 🟢 REQUESTED SHAPE OVERRIDE
  if (requestedShape) {
    return card.shape === requestedShape || card.number === top.number;
  }

  // 🔥 CORE FIX:
  // SAME NUMBER ACROSS SHAPES MUST ALWAYS MATCH
  return card.number === top.number || card.shape === top.shape;
}

// =========================
// CARD RENDER (RESTORED YOUR ORIGINAL STYLE)
// =========================
const cache = new Map();

function drawCard(card) {
  const key = `${card.shape}_${card.number}`;
  if (cache.has(key)) return cache.get(key);

  const c = document.createElement("canvas");
  c.width = 90;
  c.height = 130;
  const ctx = c.getContext("2d");

  // original style preserved
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

  if (card.shape === "square") {
    ctx.fillRect(cx - 14, cy - 14, 28, 28);
  }

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

// =========================
// GAME
// =========================
export default function WhotGame() {
  const [game, setGame] = useState(null);
  const [started, setStarted] = useState(false);
  const [log, setLog] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [requestedShape, setRequestedShape] = useState(null);

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

  // =========================
  // RULES (UNCHANGED LOGIC, FIXED ONLY BEHAVIOR)
  // =========================
  function applyRules(card, copy, isPlayer) {
    const opponent = isPlayer ? 1 : 0;

    if (card.number === 1) {
      copy.hold = opponent;
      pushAlert("🟡 HOLD");
    }

    if (card.number === 2) {
      copy.players[opponent].hand.push(copy.deck.pop());
      copy.players[opponent].hand.push(copy.deck.pop());
      pushAlert("🔴 PICK 2");
    }

    if (card.number === 8) {
      copy.skipNext = opponent;
      pushAlert("🔵 SUSPEND");
    }

    if (card.number === 14) {
      const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      setRequestedShape(shape);
      copy.requestedShape = shape;
      pushAlert("🟢 REQUEST " + shape);
    }
  }

  // =========================
  // START (UNCHANGED UI)
  // =========================
  function startMatch() {
    const deck = createDeck();

    setGame({
      players: [
        { hand: deck.splice(0, 6) },
        { hand: deck.splice(0, 6) }
      ],
      deck,
      discard: [deck.pop()],
      turn: "player",
      skipNext: null,
      hold: null,
      requestedShape: null
    });

    setStarted(true);
    setLog([]);
    setAlerts([]);
    setRequestedShape(null);
  }

  const top = game?.discard?.at(-1);

  // =========================
  // PLAYER MOVE
  // =========================
  function playCard(i) {
    const g = gameRef.current;
    if (!g || g.turn !== "player") return;

    const copy = JSON.parse(JSON.stringify(g));
    const player = copy.players[0];
    const card = player.hand[i];

    if (!isValidMove(card, top, requestedShape)) {
      pushAlert("❌ Invalid move");
      return;
    }

    player.hand.splice(i, 1);
    copy.discard.push(card);

    playSound("play");
    applyRules(card, copy, true);

    addLog(`You played ${card.number} (${card.shape})`);

    copy.turn = "bot";
    setGame(copy);

    setTimeout(botPlay, 400);
  }

  // =========================
  // MARKET (UNCHANGED FLOW)
  // =========================
  function drawMarket() {
    const g = gameRef.current;
    if (!g) return;

    const copy = JSON.parse(JSON.stringify(g));
    copy.players[0].hand.push(copy.deck.pop());

    playSound("draw");
    addLog("Market draw");

    copy.turn = "bot";
    setGame(copy);

    setTimeout(botPlay, 400);
  }

  // =========================
  // BOT
  // =========================
  function botPlay() {
    const g = gameRef.current;
    if (!g) return;

    const copy = JSON.parse(JSON.stringify(g));
    const bot = copy.players[1];

    const move = bot.hand.findIndex(c =>
      isValidMove(c, top, requestedShape)
    );

    if (move === -1) {
      bot.hand.push(copy.deck.pop());
      addLog("Bot drew");
      copy.turn = "player";
      return setGame(copy);
    }

    const card = bot.hand.splice(move, 1)[0];
    copy.discard.push(card);

    playSound("play");
    applyRules(card, copy, false);

    addLog(`Bot played ${card.number} (${card.shape})`);

    copy.turn = "player";
    setGame(copy);
  }

  if (!game) {
    return (
      <div style={{ padding: 20 }}>
        <button onClick={startMatch}>Start Game</button>
      </div>
    );
  }

  return (
    <div style={styles.bg}>
      <div style={styles.box}>
        <h2>WHOT GAME</h2>

        <div style={styles.history}>
          {log.map((l, i) => <div key={i}>• {l}</div>)}
        </div>

        <div style={styles.alertBox}>
          {alerts.map((a, i) => <div key={i}>{a}</div>)}
        </div>

        <div>
          🤖 Bot Cards: {game.players[1].hand.length}
        </div>

        <div>
          {top && <img src={drawCard(top)} style={{ width: 60 }} />}
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

        <button onClick={drawMarket}>Market ({game.deck.length})</button>
      </div>
    </div>
  );
}

// =========================
// ORIGINAL STYLE PRESERVED
// =========================
const styles = {
  bg: {
    minHeight: "100vh",
    background: "green",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  box: {
    width: 420,
    padding: 10,
    background: "#00000066",
    color: "#fff"
  },
  history: { fontSize: 12, marginBottom: 10 },
  alertBox: { background: "#000000aa", color: "yellow", padding: 6 }
};