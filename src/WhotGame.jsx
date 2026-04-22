import { useEffect, useRef, useState } from "react";

const SHAPES = ["circle", "triangle", "square", "star", "cross"];

// =========================
// SOUND
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
// DECK
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
// VALID MOVE
// =========================
function isValidMove(card, top, requestedShape) {
  if (!top) return true;
  if (requestedShape) return card.shape === requestedShape;
  return card.number === top.number || card.shape === top.shape;
}

// =========================
// CARD RENDER
// =========================
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

// =========================
// GAME
// =========================
export default function WhotGame() {
  const [game, setGame] = useState(null);
  const [started, setStarted] = useState(false);
  const [log, setLog] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [winner, setWinner] = useState(null);
  const [requestedShape, setRequestedShape] = useState(null);

  // 🌸 NEW WIN STATE (ADDED ONLY)
  const [showWin, setShowWin] = useState(false);

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
  // WIN CHECK (UPDATED ONLY)
  // =========================
  function checkWin(copy) {
    if (copy.players[0].hand.length === 0) {
      setWinner("YOU WIN 🏆");
      setShowWin(true);
      return true;
    }
    if (copy.players[1].hand.length === 0) {
      setWinner("BOT WINS 🤖🏆");
      setShowWin(true);
      return true;
    }
    return false;
  }

  // =========================
  // RULES
  // =========================
  function applyRules(card, copy, isPlayer) {
    const opponent = isPlayer ? 1 : 0;

    if (card.number === 2) {
      copy.players[opponent].hand.push(copy.deck.pop());
      copy.players[opponent].hand.push(copy.deck.pop());
      copy.skipNext = opponent;
      pushAlert("🔴 PICK 2");
    }

    if (card.number === 8) {
      copy.skipNext = opponent;
      pushAlert("🔵 SUSPEND");
    }

    if (card.number === 14) {
      copy.players.forEach((p, idx) => {
        if (idx !== opponent) {
          p.hand.push(copy.deck.pop());
        }
      });

      copy.skipNext = opponent;
      pushAlert("🟢 GENERAL MARKET");
    }
  }

  // =========================
  // START
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
      skipNext: null
    });

    setStarted(true);
    setLog([]);
    setAlerts([]);
    setWinner(null);
    setShowWin(false);
    setRequestedShape(null);
  }

  const top = game?.discard?.at(-1);

  // =========================
  // PLAYER MOVE
  // =========================
  function playCard(i) {
    const g = gameRef.current;
    if (!g || winner) return;

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

    addLog(`You played ${card.number}`);

    if (checkWin(copy)) return;

    copy.turn = "bot";
    setGame(copy);

    setTimeout(botPlay, 5000);
  }

  // =========================
  // MARKET
  // =========================
  function drawMarket() {
    const g = gameRef.current;
    if (!g || winner) return;

    const copy = JSON.parse(JSON.stringify(g));
    copy.players[0].hand.push(copy.deck.pop());

    playSound("draw");
    addLog("Market draw");

    copy.turn = "bot";
    setGame(copy);

    setTimeout(botPlay, 5000);
  }

  // =========================
  // BOT
  // =========================
  function botPlay() {
    const g = gameRef.current;
    if (!g || winner) return;

    const copy = JSON.parse(JSON.stringify(g));

    if (copy.skipNext === 1) {
      copy.skipNext = null;
      pushAlert("🤖 BOT SKIPPED");
      copy.turn = "player";
      return setGame(copy);
    }

    const bot = copy.players[1];

    let move = bot.hand.findIndex(c =>
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

    addLog(`Bot played ${card.number}`);

    if (checkWin(copy)) return;

    copy.turn = "player";
    setGame(copy);
  }

  // =========================
  // UI
  // =========================
  if (!game) {
    return (
      <div style={styles.bg}>
        <button onClick={startMatch} style={styles.startBtn}>
          START GAME
        </button>
      </div>
    );
  }

  return (
    <div style={styles.bg}>
      <div style={styles.box}>
        <h2>WHOT GAME</h2>

        {/* 🌸 WIN OVERLAY ADDED ONLY */}
        {showWin && (
          <div style={styles.winOverlay}>
            <div style={styles.winBox}>
              <h1>{winner}</h1>
              <div style={styles.flowers}>🌸🌺🌸🌺🌸🌺</div>

              <button onClick={startMatch} style={styles.rematchBtn}>
                🔁 REMATCH
              </button>
            </div>
          </div>
        )}

        {winner && <div style={{ color: "gold" }}>{winner}</div>}

        <div style={styles.alertBox}>
          {alerts.map((a, i) => <div key={i}>{a}</div>)}
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

// =========================
// STYLES (ONLY ADDITIONS)
// =========================
const styles = {
  ...{},
  winOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.85)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999
  },
  winBox: {
    textAlign: "center",
    color: "gold"
  },
  flowers: {
    fontSize: 40,
    margin: "20px 0",
    animation: "float 1.5s infinite"
  },
  rematchBtn: {
    padding: 12,
    background: "gold",
    border: "none",
    borderRadius: 10,
    fontWeight: "bold",
    cursor: "pointer"
  }
};