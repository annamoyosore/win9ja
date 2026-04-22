import { useEffect, useRef, useState } from "react";

const SHAPES = ["circle", "triangle", "square", "star", "cross"];

// =========================
// SOUND (RESTORED + ACTIVE)
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
// LAST CARD WARNING
// =========================
function checkLastCardWarning(playerIndex, copy, pushAlert, addLog) {
  const player = copy.players[playerIndex];

  if (player.hand.length === 1) {
    pushAlert(`⚠️ ${playerIndex === 0 ? "YOU" : "BOT"}: LAST CARD!`);
    addLog(`${playerIndex === 0 ? "You" : "Bot"} is on LAST CARD!`);
    playSound("alert");
  }
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
  const [log, setLog] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [winner, setWinner] = useState(null);

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

  function createGame() {
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

    setWinner(null);
  }

  const top = game?.discard?.at(-1);

  // =========================
  // PLAYER MOVE
  // =========================
  function playCard(i) {
    const g = gameRef.current;
    if (!g || winner) return;

    const copy = JSON.parse(JSON.stringify(g));
    const card = copy.players[0].hand[i];

    copy.players[0].hand.splice(i, 1);
    copy.discard.push(card);

    playSound("play");
    addLog(`You played ${card.number}`);

    checkLastCardWarning(0, copy, pushAlert, addLog);

    setGame(copy);

    setTimeout(botPlay, 1200);
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

    setGame(copy);

    setTimeout(botPlay, 1200);
  }

  // =========================
  // BOT
  // =========================
  function botPlay() {
    const g = gameRef.current;
    if (!g || winner) return;

    const copy = JSON.parse(JSON.stringify(g));
    const bot = copy.players[1];

    const move = bot.hand.findIndex(c =>
      c.number === top.number || c.shape === top.shape
    );

    if (move === -1) {
      bot.hand.push(copy.deck.pop());
      playSound("draw");
      addLog("Bot drew");
      return setGame(copy);
    }

    const card = bot.hand.splice(move, 1)[0];
    copy.discard.push(card);

    playSound("play");
    addLog(`Bot played ${card.number}`);

    checkLastCardWarning(1, copy, pushAlert, addLog);

    setGame(copy);
  }

  // =========================
  // UI
  // =========================
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

        {/* ✅ FIXED: BOT CARD COUNT RESTORED */}
        <div>🤖 Bot Cards: {game.players[1].hand.length}</div>

        <div style={styles.center}>
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

        <div style={styles.history}>
          {log.map((l, i) => <div key={i}>• {l}</div>)}
        </div>
      </div>
    </div>
  );
}

// =========================
// STYLES (UNCHANGED)
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
    margin: "10px 0"
  },
  history: {
    fontSize: 12,
    marginTop: 10
  },
  startBtn: {
    padding: 15,
    background: "green",
    color: "#fff",
    borderRadius: 10
  }
};