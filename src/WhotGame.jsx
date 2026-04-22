import { useEffect, useRef, useState } from "react";

const SHAPES = ["circle", "triangle", "square", "star", "cross"];
const NUMBERS = Array.from({ length: 14 }, (_, i) => i + 1);

// =========================
// GAME LOGIC
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
  if (requestedShape) return card.shape === requestedShape || card.number === 14;

  return (
    card.shape === top.shape ||
    card.number === top.number ||
    card.number === 14
  );
}

// =========================
// CANVAS CARD CACHE (IMPORTANT FIX)
// =========================
const cardCache = new Map();

function drawCard(card) {
  const key = `${card.shape}_${card.number}`;
  if (cardCache.has(key)) return cardCache.get(key);

  const canvas = document.createElement("canvas");
  canvas.width = 90;
  canvas.height = 130;
  const ctx = canvas.getContext("2d");

  // background
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // border
  ctx.strokeStyle = "#e11d48";
  ctx.lineWidth = 3;
  ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

  // numbers
  ctx.fillStyle = "#e11d48";
  ctx.font = "bold 14px Arial";
  ctx.fillText(card.number, 8, 18);
  ctx.fillText(card.number, 8, 125);

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

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
      ctx.fillText("★", cx - 9, cy + 6);
      break;

    case "cross":
      ctx.fillRect(cx - 3, cy - 16, 6, 32);
      ctx.fillRect(cx - 16, cy - 3, 32, 6);
      break;
  }

  // WHOT card highlight
  if (card.number === 14) {
    ctx.strokeStyle = "#facc15";
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);
    ctx.fillStyle = "#facc15";
    ctx.fillText("WHOT", 22, 70);
  }

  const img = canvas.toDataURL();
  cardCache.set(key, img);
  return img;
}

// =========================
// MAIN COMPONENT
// =========================
export default function WhotGame() {
  const [game, setGame] = useState(null);
  const [log, setLog] = useState([]);
  const gameRef = useRef(null);

  const addLog = (msg) => setLog((p) => [...p, msg]);

  // keep latest state in ref (fix bot async bugs)
  useEffect(() => {
    gameRef.current = game;
  }, [game]);

  useEffect(() => {
    startGame();
  }, []);

  function startGame() {
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
      status: "playing"
    };

    setGame(newGame);
    addLog("Game started");
  }

  function nextTurn(current) {
    current.turn = current.turn === "player" ? "bot" : "player";
  }

  function playCard(index) {
    const current = gameRef.current;
    if (!current || current.turn !== "player") return;

    const newGame = JSON.parse(JSON.stringify(current));
    const player = newGame.players[0];
    const top = newGame.discard.at(-1);

    const card = player.hand[index];

    if (!isValidMove(card, top, newGame.requestedShape)) {
      addLog("Invalid move");
      return;
    }

    player.hand.splice(index, 1);
    newGame.discard.push(card);

    if (card.number === 14) {
      newGame.requestedShape =
        SHAPES[Math.floor(Math.random() * SHAPES.length)];
    }

    if (player.hand.length === 0) {
      newGame.status = "player_won";
      setGame(newGame);
      return;
    }

    nextTurn(newGame);
    setGame(newGame);

    setTimeout(botPlay, 500);
  }

  function drawMarket() {
    const current = gameRef.current;
    if (!current) return;

    const newGame = JSON.parse(JSON.stringify(current));

    newGame.players[0].hand.push(newGame.deck.pop());
    addLog("You drew from market");

    nextTurn(newGame);
    setGame(newGame);

    setTimeout(botPlay, 500);
  }

  function botPlay() {
    const current = gameRef.current;
    if (!current) return;

    const newGame = JSON.parse(JSON.stringify(current));
    const bot = newGame.players[1];
    const top = newGame.discard.at(-1);

    let moveIndex = bot.hand.findIndex((c) =>
      isValidMove(c, top, newGame.requestedShape)
    );

    if (moveIndex === -1) {
      bot.hand.push(newGame.deck.pop());
      addLog("Bot drew card");
      nextTurn(newGame);
      return setGame(newGame);
    }

    const card = bot.hand.splice(moveIndex, 1)[0];
    newGame.discard.push(card);

    if (card.number === 14) {
      newGame.requestedShape =
        SHAPES[Math.floor(Math.random() * SHAPES.length)];
    }

    if (bot.hand.length === 0) {
      newGame.status = "bot_won";
      setGame(newGame);
      return;
    }

    nextTurn(newGame);
    setGame(newGame);
  }

  const top = game?.discard?.at(-1);

  return (
    <div style={styles.bg}>
      <div style={styles.container}>
        <div style={styles.gameBox}>
          <h2>WHOT GAME</h2>

          {!game ? (
            <p>Loading...</p>
          ) : (
            <>
              <button onClick={drawMarket}>Draw Market</button>

              <div style={styles.top}>
                <img src={top ? drawCard(top) : ""} style={styles.card} />
              </div>

              <h3>Your Cards</h3>
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
  gameBox: { padding: 20, background: "#00000055", borderRadius: 12 },
  log: { width: 200 },
  hand: { display: "flex", flexWrap: "wrap", gap: 10 },
  card: { width: 70, height: 100, cursor: "pointer" },
  top: { marginBottom: 10 }
};