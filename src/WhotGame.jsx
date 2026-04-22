import { useEffect, useRef, useState } from "react";

const SHAPES = ["circle", "triangle", "square", "star", "cross"];

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

  return shuffle(deck);
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// =========================
// VALID MOVE
// =========================
function isValidMove(card, top, requestedShape) {
  if (!top) return true;

  if (requestedShape) {
    return card.shape === requestedShape;
  }

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
  const [requestedShape, setRequestedShape] = useState(null);
  const [awaitingShape, setAwaitingShape] = useState(false);

  const gameRef = useRef(null);
  useEffect(() => { gameRef.current = game; }, [game]);

  function addLog(msg) {
    setLog((p) => [...p, msg].slice(-2));
  }

  // =========================
  // START
  // =========================
  function startMatch() {
    const deck = createDeck();

    const g = {
      players: [
        { hand: deck.splice(0, 6) },
        { hand: deck.splice(0, 6) }
      ],
      deck,
      discard: [deck.pop()],
      turn: "player"
    };

    setGame(g);
    setStarted(true);
    setRequestedShape(null);
    setAwaitingShape(false);
    setLog([]);
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

    if (!isValidMove(card, top, requestedShape)) {
      addLog("❌ Invalid move");
      return;
    }

    player.hand.splice(i, 1);
    copy.discard.push(card);

    addLog(`🟢 You played ${card.number}`);

    if (card.number === 14) {
      setAwaitingShape(true);
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

    addLog("🃏 Drew from market");
    copy.turn = "bot";

    setGame(copy);
    setTimeout(botPlay, 400);
  }

  // =========================
  // SHAPE SELECT
  // =========================
  function chooseShape(shape) {
    const g = gameRef.current;
    if (!g) return;

    setRequestedShape(shape);
    setAwaitingShape(false);

    addLog(`🎯 Shape: ${shape}`);

    setGame({ ...g, turn: "bot" });
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
    const top = copy.discard.at(-1);

    let move = bot.hand.findIndex(c =>
      isValidMove(c, top, requestedShape)
    );

    if (move === -1) {
      bot.hand.push(copy.deck.pop());
      addLog("🤖 Bot drew");
      copy.turn = "player";
      setGame(copy);
      return;
    }

    const card = bot.hand.splice(move, 1)[0];
    copy.discard.push(card);

    addLog(`🤖 Bot played ${card.number}`);

    copy.turn = "player";
    setGame(copy);
  }

  const top = game?.discard?.at(-1);

  return (
    <div style={styles.bg}>
      <div style={styles.box}>
        <h2>WHOT GAME</h2>

        {/* 🟡 HUD (NEW ADDITION) */}
        {started && game && (
          <div style={styles.hud}>
            🤖 Bot Cards: {game.players[1].hand.length} | 
            🃏 Market: {game.deck.length}
          </div>
        )}

        {!started && (
          <button onClick={startMatch} style={styles.btn}>
            Start Game
          </button>
        )}

        {started && game && (
          <>
            <button onClick={drawMarket} style={styles.btn}>
              Market
            </button>

            <div>
              {top && <img src={drawCard(top)} style={styles.card} />}
            </div>

            {awaitingShape && (
              <div>
                <p>Choose Shape:</p>
                {SHAPES.map(s => (
                  <button key={s} onClick={() => chooseShape(s)}>
                    {s}
                  </button>
                ))}
              </div>
            )}

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

        <div>
          {log.map((l, i) => <p key={i}>{l}</p>)}
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
    padding: 20,
    background: "#00000066",
    color: "#fff"
  },
  hand: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap"
  },
  card: {
    width: 70
  },
  btn: {
    padding: 10,
    margin: 5
  },
  hud: {
    marginBottom: 10,
    padding: 8,
    background: "#00000088",
    borderRadius: 6,
    fontWeight: "bold"
  }
};