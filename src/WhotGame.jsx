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
// 🧠 UPDATED MATCH RULE (YOUR REQUEST)
// =========================
function isValidMove(card, top, requestedShape) {
  if (!top) return true;

  // WHOT (14) always valid
  if (card.number === 14) return true;

  // shape request mode (after 14)
  if (requestedShape) {
    return card.shape === requestedShape;
  }

  // =========================
  // 🔥 FLEX MATCH SYSTEM (UPDATED)
  // =========================
  const sameShape = card.shape === top.shape;
  const sameNumber = card.number === top.number;

  // allows same number across ANY shape (your request)
  const flexibleNumberMatch = card.number === top.number;

  return sameShape || sameNumber || flexibleNumberMatch;
}

// =========================
// CANVAS CARD CACHE
// =========================
const cache = new Map();

function drawCard(card) {
  const key = `${card.shape}_${card.number}`;
  if (cache.has(key)) return cache.get(key);

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

  if (card.shape === "star") {
    ctx.font = "18px Arial";
    ctx.fillText("★", cx - 8, cy + 6);
  }

  if (card.shape === "cross") {
    ctx.fillRect(cx - 3, cy - 16, 6, 32);
    ctx.fillRect(cx - 16, cy - 3, 32, 6);
  }

  // WHOT special
  if (card.number === 14) {
    ctx.strokeStyle = "#facc15";
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, c.width - 8, c.height - 8);
    ctx.fillStyle = "#facc15";
    ctx.fillText("WHOT", 20, 70);
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

  const gameRef = useRef(null);

  useEffect(() => {
    gameRef.current = game;
  }, [game]);

  function addLog(msg) {
    setLog((p) => [...p, msg]);
  }

  // =========================
  // START MATCH
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
      pickType: null
    };

    setGame(newGame);
    setStarted(true);
    addLog("Match started");
  }

  // =========================
  // SPECIAL EFFECTS
  // =========================
  function applyEffects(card, g) {
    if (card.number === 2) {
      g.pendingPick = (g.pendingPick || 0) + 2;
      g.pickType = 2;
    }

    if (card.number === 5) {
      g.pendingPick = (g.pendingPick || 0) + 3;
      g.pickType = 5;
    }

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

    applyEffects(card, copy);

    copy.turn = "bot";
    setGame(copy);

    setTimeout(botPlay, 500);
  }

  // =========================
  // MARKET (RESTORED)
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
  // BOT
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
      copy.turn = "player";
      return setGame(copy);
    }

    const card = bot.hand.splice(move, 1)[0];
    copy.discard.push(card);

    applyEffects(card, copy);

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
            <button style={styles.btn} onClick={startMatch}>
              ▶ Start Match
            </button>
          )}

          {started && game && (
            <>
              <button style={styles.btn} onClick={drawMarket}>
                🃏 Draw Market
              </button>

              <div style={styles.table}>
                Table:
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
    background: "green",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "white"
  },
  container: { display: "flex", gap: 20 },
  box: { padding: 20, background: "#00000055", borderRadius: 12 },
  hand: { display: "flex", gap: 10, flexWrap: "wrap" },
  card: { width: 70, height: 100, cursor: "pointer" },
  table: { marginBottom: 10 },
  log: { width: 200 },
  btn: { padding: 10, background: "#10b981", color: "#fff", border: 0 }
};