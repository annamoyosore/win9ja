import { useEffect, useRef, useState } from "react";

const SHAPES = ["circle", "triangle", "square", "star", "cross"];

// =========================
// SOUND (UNCHANGED)
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
// DECK (UNCHANGED)
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
// VALID MOVE (UNCHANGED FIXED)
// =========================
function isValidMove(card, top, requestedShape) {
  if (!top) return true;
  if (requestedShape) return card.shape === requestedShape;
  return card.number === top.number || card.shape === top.shape;
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
  const [winner, setWinner] = useState(null);

  // ✅ ANIMATION STATE
  const [animId, setAnimId] = useState(null);

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

  function checkWin(copy) {
    if (copy.players[0].hand.length === 0) setWinner("YOU");
    if (copy.players[1].hand.length === 0) setWinner("BOT");
  }

  function applyRules(card, copy, isPlayer) {
    const opponent = isPlayer ? 1 : 0;

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
    setWinner(null);
  }

  // =========================
  // 🎞 ANIMATION TRIGGER
  // =========================
  function animate(id) {
    setAnimId(id);
    setTimeout(() => setAnimId(null), 300);
  }

  function playCard(i) {
    if (winner) return;

    const g = gameRef.current;
    if (!g || g.turn !== "player") return;

    const copy = JSON.parse(JSON.stringify(g));
    const player = copy.players[0];
    const top = copy.discard.at(-1);
    const card = player.hand[i];

    if (!isValidMove(card, top, requestedShape)) return;

    animate(`p-${i}`);

    player.hand.splice(i, 1);
    copy.discard.push(card);

    playSound("play");
    applyRules(card, copy, true);

    addLog(`You played ${card.number}`);

    copy.turn = "bot";
    setGame(copy);

    checkWin(copy);

    setTimeout(botPlay, 400);
  }

  function drawMarket() {
    if (winner) return;

    const g = gameRef.current;
    if (!g) return;

    const copy = JSON.parse(JSON.stringify(g));

    animate("market");

    copy.players[0].hand.push(copy.deck.pop());

    playSound("draw");
    addLog("Drew from market");

    copy.turn = "bot";
    setGame(copy);

    setTimeout(botPlay, 400);
  }

  function botPlay() {
    if (winner) return;

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
      copy.turn = "player";
      return setGame(copy);
    }

    animate("bot");

    const card = bot.hand.splice(move, 1)[0];
    copy.discard.push(card);

    playSound("play");
    applyRules(card, copy, false);

    addLog(`Bot played ${card.number}`);

    copy.turn = "player";
    setGame(copy);

    checkWin(copy);
  }

  const top = game?.discard?.at(-1);

  return (
    <div style={styles.bg}>
      <div style={styles.box}>
        <h2>WHOT GAME</h2>

        {started && game && (
          <div style={{ marginBottom: 10 }}>
            🤖 Bot Cards: {game.players[1].hand.length}
          </div>
        )}

        {!started && !winner && (
          <button onClick={startMatch}>Start</button>
        )}

        {started && game && !winner && (
          <>
            <div style={styles.centerRow}>
              <div style={styles.board}>
                {top && (
                  <img
                    src={drawCard(top)}
                    style={{
                      ...styles.card,
                      transform:
                        animId?.startsWith("bot") ? "translateY(-20px)" : "none",
                      transition: "0.25s ease"
                    }}
                  />
                )}
              </div>

              <button
                onClick={drawMarket}
                style={{
                  ...styles.marketBtn,
                  transform: animId === "market" ? "scale(0.9)" : "scale(1)",
                  transition: "0.2s ease"
                }}
              >
                MARKET ({game.deck.length})
              </button>
            </div>

            <div style={styles.hand}>
              {game.players[0].hand.map((c, i) => (
                <img
                  key={i}
                  src={drawCard(c)}
                  onClick={() => playCard(i)}
                  style={{
                    ...styles.card,
                    transform:
                      animId === `p-${i}` ? "translateY(-25px)" : "none",
                    transition: "0.25s ease"
                  }}
                />
              ))}
            </div>
          </>
        )}

        {winner && (
          <div style={styles.win}>
            🏆 {winner} WINS
            <button onClick={startMatch}>Rematch</button>
          </div>
        )}
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
  win: {
    textAlign: "center",
    background: "black",
    padding: 10,
    marginTop: 10
  }
};