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
  return card.shape === top.shape || card.number === top.number;
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

  ctx.clearRect(0, 0, 90, 130);

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
  // RULE ENGINE
  // =========================
  function applyRules(card, copy, isPlayer) {
    const opponent = isPlayer ? 1 : 0;

    if (card.number === 1) {
      copy.repeatTurn = isPlayer ? 0 : 1;
      pushAlert("🟡 HOLD / REPEAT TURN");
    }

    if (card.number === 2) {
      copy.players[opponent].hand.push(copy.deck.pop());
      copy.players[opponent].hand.push(copy.deck.pop());
      pushAlert("🔴 PICK 2");
    }

    if (card.number === 8) {
      copy.skipNext = opponent;
      pushAlert("🔵 SUSPENSION");
    }

    if (card.number === 14) {
      const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      setRequestedShape(shape);
      pushAlert("🟢 REQUEST: " + shape);
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
      skipNext: null,
      repeatTurn: null
    });

    setStarted(true);
    setLog([]);
    setAlerts([]);
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

    if (!isValidMove(card, top, requestedShape)) return;

    player.hand.splice(i, 1);
    copy.discard.push(card);

    playSound("play");
    applyRules(card, copy, true);

    addLog(`You played ${card.number}`);

    // HOLD (CARD 1)
    if (card.number === 1) {
      copy.turn = "player";
      setGame(copy);
      return;
    }

    copy.turn = "bot";
    setGame(copy);

    setTimeout(botPlay, 400);
  }

  // =========================
  // MARKET
  // =========================
  function drawMarket() {
    const g = gameRef.current;
    if (!g) return;

    const copy = JSON.parse(JSON.stringify(g));
    copy.players[0].hand.push(copy.deck.pop());

    playSound("draw");
    addLog("Drew card");

    copy.turn = "bot";
    setGame(copy);

    setTimeout(botPlay, 400);
  }

  // =========================
  // BOT (FIXED RULE FLOW)
  // =========================
  function botPlay() {
    const g = gameRef.current;
    if (!g) return;

    const copy = JSON.parse(JSON.stringify(g));

    // SUSPENSION (8)
    if (copy.skipNext === 1) {
      pushAlert("🤖 Bot skipped");
      copy.skipNext = null;
      copy.turn = "player";
      return setGame(copy);
    }

    const bot = copy.players[1];
    const top = copy.discard.at(-1);

    let move = bot.hand.findIndex(c =>
      isValidMove(c, top, requestedShape)
    );

    // NO MOVE → DRAW → RETRY → PASS
    if (move === -1) {
      const drawn = copy.deck.pop();
      bot.hand.push(drawn);

      pushAlert("🤖 Bot drew");

      move = bot.hand.findIndex(c =>
        isValidMove(c, top, requestedShape)
      );

      if (move === -1) {
        copy.turn = "player";
        return setGame(copy);
      }
    }

    const card = bot.hand.splice(move, 1)[0];
    copy.discard.push(card);

    playSound("play");
    applyRules(card, copy, false);

    addLog(`Bot played ${card.number}`);

    // HOLD (1)
    if (card.number === 1) {
      copy.turn = "bot";
      setGame(copy);
      return setTimeout(botPlay, 400);
    }

    copy.turn = "player";
    setGame(copy);
  }

  const top = game?.discard?.at(-1);

  return (
    <div style={styles.bg}>

      <div style={styles.alertBox}>
        {alerts.map((a, i) => <div key={i}>{a}</div>)}
      </div>

      <div style={styles.box}>
        <h2>WHOT GAME</h2>

        {!started && (
          <button onClick={startMatch}>Start</button>
        )}

        {started && game && (
          <>
            <div style={styles.centerRow}>
              <div style={styles.board}>
                {top && <img src={drawCard(top)} style={styles.card} />}
              </div>

              <button onClick={drawMarket} style={styles.marketBtn}>
                🃏 MARKET ({game.deck.length})
              </button>
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

        <div style={styles.history}>
          {log.map((l, i) => <div key={i}>• {l}</div>)}
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
    alignItems: "center"
  },
  box: {
    width: 420,
    padding: 10,
    background: "#00000066",
    color: "#fff",
    borderRadius: 10
  },
  centerRow: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 10
  },
  board: { transform: "scale(0.9)" },
  marketBtn: {
    padding: 10,
    background: "gold",
    fontWeight: "bold",
    border: "none",
    borderRadius: 6
  },
  hand: {
    display: "flex",
    gap: 6,
    flexWrap: "wrap",
    justifyContent: "center"
  },
  card: { width: 55 },
  alertBox: {
    position: "absolute",
    top: 10,
    left: 10,
    background: "#000000aa",
    color: "yellow",
    padding: 8
  },
  history: {
    marginTop: 10,
    fontSize: 12
  }
};