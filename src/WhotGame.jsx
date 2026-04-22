import { useEffect, useRef, useState } from "react";

const SHAPES = ["circle", "triangle", "square", "star", "cross"];
const NUMBERS = Array.from({ length: 14 }, (_, i) => i + 1);

// =========================
// DECK
// =========================
function createDeck() {
  const deck = [];
  for (const shape of SHAPES) {
    for (const number of NUMBERS) {
      deck.push({ shape, number });
    }
  }
  return shuffle(deck);
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// =========================
// VALID MOVE RULES
// =========================
function isValidMove(card, top, requestedShape) {
  if (!top) return true;

  if (requestedShape) {
    return card.shape === requestedShape || card.number === 14;
  }

  return (
    card.shape === top.shape ||
    card.number === top.number ||
    card.number === 14
  );
}

// =========================
// CANVAS CARD (CACHED)
// =========================
const cardCache = new Map();

function drawCard(card) {
  const key = `${card.shape}_${card.number}`;
  if (cardCache.has(key)) return cardCache.get(key);

  const c = document.createElement("canvas");
  c.width = 90;
  c.height = 130;
  const ctx = c.getContext("2d");

  // background
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, c.width, c.height);

  // border
  ctx.strokeStyle = "#e11d48";
  ctx.lineWidth = 3;
  ctx.strokeRect(2, 2, c.width - 4, c.height - 4);

  // numbers
  ctx.fillStyle = "#e11d48";
  ctx.font = "bold 14px Arial";
  ctx.fillText(card.number, 8, 18);
  ctx.fillText(card.number, 8, 125);

  const cx = c.width / 2;
  const cy = c.height / 2;

  ctx.fillStyle = "#e11d48";

  switch (card.shape) {
    case "circle":
      ctx.beginPath();
      ctx.arc(cx, cy, 16, 0, Math.PI * 2);
      ctx.fill();
      break;

    case "square":
      ctx.fillRect(cx - 14, cy - 14, 28, 28);
      break;

    case "triangle":
      ctx.beginPath();
      ctx.moveTo(cx, cy - 16);
      ctx.lineTo(cx - 16, cy + 16);
      ctx.lineTo(cx + 16, cy + 16);
      ctx.closePath();
      ctx.fill();
      break;

    case "star":
      ctx.font = "18px Arial";
      ctx.fillText("★", cx - 8, cy + 6);
      break;

    case "cross":
      ctx.fillRect(cx - 3, cy - 16, 6, 32);
      ctx.fillRect(cx - 16, cy - 3, 32, 6);
      break;
  }

  if (card.number === 14) {
    ctx.strokeStyle = "#facc15";
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, c.width - 8, c.height - 8);
    ctx.fillStyle = "#facc15";
    ctx.fillText("WHOT", 20, 70);
  }

  const img = c.toDataURL();
  cardCache.set(key, img);
  return img;
}

// =========================
// MAIN GAME
// =========================
export default function WhotGame() {
  const [game, setGame] = useState(null);
  const [started, setStarted] = useState(false);
  const [log, setLog] = useState([]);

  const gameRef = useRef(null);

  useEffect(() => {
    gameRef.current = game;
  }, [game]);

  function addLog(msg) {
    setLog((p) => [...p, msg]);
  }

  // =========================
  // START GAME
  // =========================
  function startMatch() {
    const deck = createDeck();

    const newGame = {
      players: [
        { hand: deck.splice(0, 6) },
        { hand: deck.splice(0, 6) }
      ],
      deck,
      discard: [deck.pop()],
      turn: "player",
      requestedShape: null,
      pendingPick: 0,
      pickType: null,
      status: "playing"
    };

    setGame(newGame);
    setStarted(true);
    addLog("Match started");
  }

  // =========================
  // SPECIAL EFFECTS (FIX)
  // =========================
  function applySpecialEffects(card, g) {
    // PICK 2
    if (card.number === 2) {
      g.pendingPick = (g.pendingPick || 0) + 2;
      g.pickType = 2;
    }

    // PICK 5
    if (card.number === 5) {
      g.pendingPick = (g.pendingPick || 0) + 3;
      g.pickType = 5;
    }

    // WHOT
    if (card.number === 14) {
      g.requestedShape =
        SHAPES[Math.floor(Math.random() * SHAPES.length)];
    }
  }

  // =========================
  // PLAYER MOVE
  // =========================
  function playCard(i) {
    const g = gameRef.current;
    if (!g || g.turn !== "player") return;

    const copy = JSON.parse(JSON.stringify(g));
    const player = copy.players[0];
    const top = copy.discard.at(-1);

    const card = player.hand[i];

    if (!isValidMove(card, top, copy.requestedShape)) {
      addLog("Invalid move");
      return;
    }

    player.hand.splice(i, 1);
    copy.discard.push(card);

    applySpecialEffects(card, copy);

    if (player.hand.length === 0) {
      copy.status = "player_won";
      setGame(copy);
      return;
    }

    copy.turn = "bot";
    setGame(copy);

    setTimeout(botPlay, 500);
  }

  // =========================
  // MARKET (FIX RESTORED)
  // =========================
  function drawMarket() {
    const g = gameRef.current;
    if (!g || g.deck.length === 0) return;

    const copy = JSON.parse(JSON.stringify(g));

    copy.players[0].hand.push(copy.deck.pop());
    addLog("Player drew from market");

    copy.turn = "bot";
    setGame(copy);

    setTimeout(botPlay, 500);
  }

  // =========================
  // BOT MOVE
  // =========================
  function botPlay() {
    const g = gameRef.current;
    if (!g) return;

    const copy = JSON.parse(JSON.stringify(g));
    const bot = copy.players[1];
    const top = copy.discard.at(-1);

    let move = bot.hand.findIndex((c) =>
      isValidMove(c, top, copy.requestedShape)
    );

    if (move === -1) {
      bot.hand.push(copy.deck.pop());
      addLog("Bot drew card");
      copy.turn = "player";
      return setGame(copy);
    }

    const card = bot.hand.splice(move, 1)[0];
    copy.discard.push(card);

    applySpecialEffects(card, copy);

    if (bot.hand.length === 0) {
      copy.status = "bot_won";
      setGame(copy);
      return;
    }

    copy.turn = "player";
    setGame(copy);
  }

  const top = game?.discard?.at(-1);

  return (
    <div style={styles.bg}>
      <div style={styles.container}>
        <div style={styles.box}>
          <h2>WHOT GAME</h2>

          {!started && (
            <div style={{ marginBottom: 15 }}>
              <button style={styles.btn} onClick={startMatch}>
                ▶ Start Match
              </button>
              <button style={styles.btn2}>
                🌐 Play Online (Later)
              </button>
            </div>
          )}

          {started && game && (
            <>
              <button style={styles.btn} onClick={drawMarket}>
                🃏 Draw Market
              </button>

              <div style={styles.table}>
                🃏 Table:
                {top && <img src={drawCard(top)} style={styles.card} />}
              </div>

              <div style={styles.hand}>
                {game.players[0].hand.map((c, i) => (
                  <img
                    key={i}
                    src={drawCard(c)}
                    style={styles.card}
                    onClick={() => playCard(i)}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div style={styles.log}>
          <h3>Log</h3>
          {log.map((l, i) => (
            <p key={i}>• {l}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

// =========================
// STYLES
// =========================
const styles = {
  bg: {
    minHeight: "100vh",
    background: "radial-gradient(circle, #22c55e, #064e3b)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "white"
  },
  container: { display: "flex", gap: 20 },
  box: { padding: 20, background: "#00000055", borderRadius: 12 },
  log: { width: 200 },
  hand: { display: "flex", flexWrap: "wrap", gap: 10 },
  card: { width: 70, height: 100, cursor: "pointer" },
  table: { marginTop: 10, marginBottom: 10 },
  btn: {
    padding: 10,
    background: "#10b981",
    border: 0,
    color: "white",
    marginRight: 10
  },
  btn2: {
    padding: 10,
    background: "#2563eb",
    border: 0,
    color: "white"
  }
};