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
// RULE ENGINE (FIX CORE)
// =========================
function applyCardEffect(card, state) {
  const s = { ...state };

  // 1 = HOLD ON
  if (card.number === 1) {
    s.skipTurn = false;
    s.repeatTurn = true;
  }

  // 2 = PICK 2
  if (card.number === 2) {
    s.pendingPick = (s.pendingPick || 0) + 2;
  }

  // 8 = SUSPENSION
  if (card.number === 8) {
    s.skipTurn = true;
  }

  // 14 = REQUEST SHAPE
  if (card.number === 14) {
    s.awaitingShape = true;
  }

  return s;
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
      turn: "player",
      pendingPick: 0,
      skipTurn: false,
      repeatTurn: false,
      awaitingShape: false
    };

    setGame(g);
    setStarted(true);
    setRequestedShape(null);
    setLog([]);
  }

  // =========================
  // PLAYER MOVE
  // =========================
  function playCard(i) {
    const g = gameRef.current;
    if (!g || g.turn !== "player") return;

    const state = JSON.parse(JSON.stringify(g));
    const player = state.players[0];
    const top = state.discard.at(-1);
    const card = player.hand[i];

    if (!isValidMove(card, top, requestedShape)) {
      addLog("❌ Invalid move");
      return;
    }

    player.hand.splice(i, 1);
    state.discard.push(card);

    addLog(`🟢 You played ${card.number}`);

    // APPLY EFFECT (FIXED CORE)
    const newState = applyCardEffect(card, state);

    // HANDLE 14 SHAPE SELECTION
    if (card.number === 14) {
      setGame(newState);
      return;
    }

    // PICK 2
    if (newState.pendingPick > 0) {
      setGame(newState);
      setTimeout(botPlay, 400);
      return;
    }

    // TURN LOGIC
    if (card.number === 1) {
      newState.turn = "player";
    } else if (card.number === 8) {
      newState.turn = "player";
    } else {
      newState.turn = "bot";
    }

    setGame(newState);

    setTimeout(botPlay, 400);
  }

  // =========================
  // MARKET
  // =========================
  function drawMarket() {
    const g = gameRef.current;
    if (!g) return;

    const state = JSON.parse(JSON.stringify(g));
    state.players[0].hand.push(state.deck.pop());

    addLog("🃏 Drew card");

    state.turn = "bot";
    setGame(state);

    setTimeout(botPlay, 400);
  }

  // =========================
  // SHAPE SELECT (14)
  // =========================
  function chooseShape(shape) {
    const g = gameRef.current;
    if (!g) return;

    setRequestedShape(shape);
    addLog(`🎯 Shape: ${shape}`);

    const state = { ...g, turn: "bot", awaitingShape: false };
    setGame(state);

    setTimeout(botPlay, 400);
  }

  // =========================
  // BOT
  // =========================
  function botPlay() {
    const g = gameRef.current;
    if (!g) return;

    const state = JSON.parse(JSON.stringify(g));
    const bot = state.players[1];
    const top = state.discard.at(-1);

    let move = bot.hand.findIndex(c =>
      isValidMove(c, top, requestedShape)
    );

    if (move === -1) {
      bot.hand.push(state.deck.pop());
      addLog("🤖 Bot drew");
      state.turn = "player";
      setGame(state);
      return;
    }

    const card = bot.hand.splice(move, 1)[0];
    state.discard.push(card);

    addLog(`🤖 Bot played ${card.number}`);

    const newState = applyCardEffect(card, state);

    if (card.number === 14) {
      const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      setRequestedShape(shape);
    }

    state.turn = "player";
    setGame(newState);
  }

  const top = game?.discard?.at(-1);

  return (
    <div style={styles.bg}>
      <div style={styles.box}>
        <h2>WHOT GAME</h2>

        {!started && (
          <button onClick={startMatch} style={styles.btn}>
            Start
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

            {game.awaitingShape && (
              <div>
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
  hand: { display: "flex", gap: 10, flexWrap: "wrap" },
  card: { width: 70 },
  btn: { padding: 10, margin: 5 }
};