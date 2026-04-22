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
// RULE CHECK
// =========================
function isValidMove(card, top, requestedShape) {
  if (!top) return true;
  if (requestedShape) return card.shape === requestedShape;
  return card.number === top.number || card.shape === top.shape;
}

// =========================
// CARD DRAW
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
  const [requestedShape, setRequestedShape] = useState(null);
  const [holdOpponent, setHoldOpponent] = useState(false);

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
  // RULE ENGINE (FIXED)
  // =========================
  function applyRules(card, copy, isPlayer) {
    const opponent = isPlayer ? 1 : 0;

    // 🟡 CARD 1 → HOLD (FIXED PROPERLY)
    if (card.number === 1) {
      copy.holdOpponent = opponent;
      setHoldOpponent(true);
      pushAlert("🟡 HOLD ACTIVE");
    }

    // 🔴 PICK 2
    if (card.number === 2) {
      copy.players[opponent].hand.push(copy.deck.pop());
      copy.players[opponent].hand.push(copy.deck.pop());
      pushAlert("🔴 PICK 2");
    }

    // 🔵 SUSPEND
    if (card.number === 8) {
      copy.skipNext = opponent;
      pushAlert("🔵 SUSPEND");
    }

    // 🟢 CARD 14 → PLAYER CHOOSES SHAPE (FIXED)
    if (card.number === 14 && isPlayer) {
      pushAlert("🟢 SELECT SHAPE FOR OPPONENT");
    }
  }

  // =========================
  // START GAME
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
      holdOpponent: null
    });

    setStarted(true);
    setLog([]);
    setAlerts([]);
    setRequestedShape(null);
    setHoldOpponent(false);
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

    // 🟡 HOLD EFFECT FIX
    if (card.number === 1) {
      copy.turn = "player";
      setGame(copy);
      return;
    }

    setGame(copy);
    copy.turn = "bot";

    setTimeout(botPlay, 400);
  }

  // =========================
  // MARKET (TURN PASS FIXED)
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
  // BOT (RESPECT HOLD)
  // =========================
  function botPlay() {
    const g = gameRef.current;
    if (!g) return;

    const copy = JSON.parse(JSON.stringify(g));

    // 🟡 HOLD CHECK (FIXED)
    if (copy.holdOpponent === 1) {
      copy.holdOpponent = null;
      pushAlert("🤖 BOT HELD");
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

    copy.turn = "player";
    setGame(copy);
  }

  // =========================
  // SHAPE SELECT (FOR 14 FIX)
  // =========================
  function chooseShape(shape) {
    setRequestedShape(shape);
    pushAlert("🟢 SHAPE: " + shape);

    const copy = JSON.parse(JSON.stringify(game));
    copy.turn = "bot";
    setGame(copy);

    setTimeout(botPlay, 400);
  }

  // =========================
  // START SCREEN
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

        {/* ALERTS */}
        <div style={styles.alertBox}>
          {alerts.map((a, i) => <div key={i}>{a}</div>)}
        </div>

        {/* BOT INFO */}
        <div>🤖 Bot Cards: {game.players[1].hand.length}</div>

        {/* CENTER BOARD + MARKET (FIXED POSITION) */}
        <div style={styles.center}>
          <div>
            {top && <img src={drawCard(top)} style={{ width: 60 }} />}
          </div>

          <button onClick={drawMarket} style={styles.marketBtn}>
            MARKET ({game.deck.length})
          </button>
        </div>

        {/* SHAPE SELECT FOR 14 */}
        <div>
          {requestedShape && SHAPES.map(s => (
            <button key={s} onClick={() => chooseShape(s)}>
              {s}
            </button>
          ))}
        </div>

        {/* PLAYER HAND */}
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
      </div>
    </div>
  );
}

// =========================
// STYLE (UNCHANGED CORE)
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
  center: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    margin: "10px 0"
  },
  marketBtn: {
    background: "gold",
    border: "none",
    padding: "10px",
    fontWeight: "bold",
    borderRadius: 8
  },
  alertBox: {
    background: "#000000aa",
    color: "yellow",
    padding: 6,
    marginBottom: 5
  },
  startBtn: {
    padding: 15,
    background: "green",
    color: "#fff",
    border: "none",
    borderRadius: 10
  }
};