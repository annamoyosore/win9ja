import { useEffect, useRef, useState } from "react";

const SHAPES = ["circle", "triangle", "square", "star", "cross"];

// =========================
// SOUND (UNCHANGED)
// =========================
function playSound(type) {
  const sounds = {
    play: "https://actions.google.com/sounds/v1/cartoon/pop.ogg",
    draw: "https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg",
    alert: "https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg"
  };
  new Audio(sounds[type]).play().catch(() => {});
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
// CARD RENDER (UNCHANGED)
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

  if (card.shape === "circle") ctx.arc(cx, cy, 16, 0, Math.PI * 2), ctx.fill();
  if (card.shape === "square") ctx.fillRect(cx - 14, cy - 14, 28, 28);
  if (card.shape === "triangle") {
    ctx.beginPath();
    ctx.moveTo(cx, cy - 16);
    ctx.lineTo(cx - 16, cy + 16);
    ctx.lineTo(cx + 16, cy + 16);
    ctx.fill();
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
  useEffect(() => { gameRef.current = game; }, [game]);

  function addLog(msg) {
    setLog(p => [...p, msg]);
  }

  function pushAlert(msg) {
    setAlerts(p => [...p.slice(-3), msg]);
    playSound("alert");
    setTimeout(() => setAlerts(p => p.slice(1)), 2500);
  }

  // =========================
  // RULE ENGINE FEEDBACK
  // =========================
  function triggerRules(card, isPlayer) {
    if (card.number === 1) pushAlert("🟡 HOLD ON - repeat turn");
    if (card.number === 2) pushAlert("🔴 PICK 2 - opponent draws 2");
    if (card.number === 8) pushAlert("🔵 SUSPENSION - opponent skips turn");
    if (card.number === 14) pushAlert("🟢 REQUEST SHAPE - opponent must match");
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
      turn: "player"
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
    triggerRules(card, true);

    addLog(`You played ${card.number}`);

    copy.turn = "bot";
    setGame(copy);

    setTimeout(botPlay, 400);
  }

  // =========================
  // MARKET
  // =========================
  function drawMarket() {
    const g = gameRef.current;
    const copy = JSON.parse(JSON.stringify(g));

    copy.players[0].hand.push(copy.deck.pop());
    playSound("draw");

    addLog("Drew card");
    copy.turn = "bot";

    setGame(copy);
    setTimeout(botPlay, 400);
  }

  // =========================
  // BOT
  // =========================
  function botPlay() {
    const g = gameRef.current;
    const copy = JSON.parse(JSON.stringify(g));

    const bot = copy.players[1];
    const top = copy.discard.at(-1);

    let move = bot.hand.findIndex(c =>
      isValidMove(c, top, requestedShape)
    );

    if (move === -1) {
      bot.hand.push(copy.deck.pop());
      pushAlert("🤖 Bot drew card");
      copy.turn = "player";
      return setGame(copy);
    }

    const card = bot.hand.splice(move, 1)[0];
    copy.discard.push(card);

    playSound("play");
    triggerRules(card, false);

    addLog(`Bot played ${card.number}`);

    copy.turn = "player";
    setGame(copy);
  }

  const top = game?.discard?.at(-1);

  return (
    <div style={styles.bg}>

      {/* ALERT SYSTEM */}
      <div style={styles.alertBox}>
        {alerts.map((a, i) => <div key={i}>{a}</div>)}
      </div>

      <div style={styles.box}>

        {/* HUD FIXED */}
        {started && game && (
          <div style={styles.hud}>
            🤖 Bot: {game.players[1].hand.length} |
            🃏 Deck: {game.deck.length}
          </div>
        )}

        {!started && (
          <button onClick={startMatch}>Start</button>
        )}

        {started && game && (
          <>
            <button onClick={drawMarket}>Market</button>

            {/* BOARD FIX (SMALLER + CENTERED) */}
            <div style={styles.board}>
              {top && <img src={drawCard(top)} style={styles.card} />}
            </div>

            {/* PLAYER HAND */}
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

        {/* HISTORY FIX */}
        <div style={styles.history}>
          <h4>Moves</h4>
          {log.map((l, i) => <div key={i}>• {l}</div>)}
        </div>

      </div>
    </div>
  );
}

// =========================
// STYLES FIX (SMALL BOARD + MOBILE)
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
    width: "95%",
    maxWidth: 420,
    padding: 10,
    background: "#00000066",
    color: "#fff",
    borderRadius: 10
  },
  hud: {
    padding: 6,
    background: "#00000088",
    marginBottom: 6
  },
  board: {
    display: "flex",
    justifyContent: "center",
    margin: 10,
    transform: "scale(0.9)"
  },
  hand: {
    display: "flex",
    gap: 6,
    flexWrap: "wrap",
    justifyContent: "center"
  },
  card: {
    width: 55
  },
  alertBox: {
    position: "absolute",
    top: 10,
    background: "#000000aa",
    padding: 10,
    color: "yellow"
  },
  history: {
    marginTop: 10,
    fontSize: 12,
    maxHeight: 80,
    overflowY: "auto"
  }
};