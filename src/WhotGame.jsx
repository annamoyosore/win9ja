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
// SOUND
// =========================
function playSound(type) {
  const sounds = {
    move: "https://actions.google.com/sounds/v1/cartoon/pop.ogg",
    win: "https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg"
  };
  new Audio(sounds[type]).play();
}

// =========================
// MATCH RULE
// =========================
function isValidMove(card, top, requestedShape) {
  if (!top) return true;
  if (card.number === 14) return true;

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
    ctx.beginPath(); ctx.arc(cx, cy, 16, 0, Math.PI * 2); ctx.fill();
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

  if (card.number === 14) {
    ctx.strokeStyle = "gold";
    ctx.strokeRect(4, 4, 82, 122);
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
  const [alert, setAlert] = useState("");
  const [winner, setWinner] = useState(null);

  const gameRef = useRef(null);
  useEffect(() => { gameRef.current = game; }, [game]);

  function addLog(msg) {
    setLog((prev) => {
      const updated = [...prev, msg];
      return updated.slice(-2); // keep last 2 only
    });
  }

  function updateAlert(g) {
    if (g.pendingPick > 0) {
      setAlert(`⚠️ PICK ${g.pendingPick}!`);
    } else if (g.requestedShape) {
      setAlert(`🎯 SHAPE: ${g.requestedShape}`);
    } else {
      setAlert("");
    }
  }

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
      requestedShape: null,
      pendingPick: 0,
      turnLocked: false
    };

    setGame(g);
    setStarted(true);
    setLog([]);
    setWinner(null);
    updateAlert(g);
  }

  function checkWinner(g) {
    if (g.players[0].hand.length === 0) {
      setWinner("player");
      playSound("win");
      return true;
    }
    if (g.players[1].hand.length === 0) {
      setWinner("bot");
      playSound("win");
      return true;
    }
    return false;
  }

  function playCard(i) {
    const g = gameRef.current;
    if (!g || g.turn !== "player" || g.turnLocked) return;

    // handle forced pick first
    if (g.pendingPick > 0) {
      const copy = JSON.parse(JSON.stringify(g));
      for (let k = 0; k < copy.pendingPick; k++) {
        copy.players[0].hand.push(copy.deck.pop());
      }
      addLog(`🃏 You picked ${copy.pendingPick}`);
      copy.pendingPick = 0;
      copy.turn = "bot";
      setGame(copy);
      updateAlert(copy);
      setTimeout(botPlay, 500);
      return;
    }

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

    addLog(`🟢 You played ${card.number} ${card.shape}`);
    playSound("move");

    // effects
    if (card.number === 2) copy.pendingPick += 2;
    if (card.number === 5) copy.pendingPick += 3;
    if (card.number === 14) {
      copy.requestedShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    } else {
      copy.requestedShape = null;
    }

    if (checkWinner(copy)) return;

    copy.turn = "bot";
    setGame(copy);
    updateAlert(copy);

    setTimeout(botPlay, 500);
  }

  function drawMarket() {
    const g = gameRef.current;
    if (!g) return;

    const copy = JSON.parse(JSON.stringify(g));
    copy.players[0].hand.push(copy.deck.pop());

    addLog("🃏 You drew (turn ended)");
    playSound("move");

    copy.turn = "bot";
    copy.turnLocked = true;

    setGame(copy);
    updateAlert(copy);

    setTimeout(botPlay, 500);
  }

  function botPlay() {
    const g = gameRef.current;
    if (!g) return;

    const copy = JSON.parse(JSON.stringify(g));
    const bot = copy.players[1];
    const top = copy.discard.at(-1);

    // forced pick
    if (copy.pendingPick > 0) {
      for (let i = 0; i < copy.pendingPick; i++) {
        bot.hand.push(copy.deck.pop());
      }
      addLog(`🤖 Bot picked ${copy.pendingPick}`);
      copy.pendingPick = 0;
      copy.turn = "player";
      copy.turnLocked = false;
      setGame(copy);
      updateAlert(copy);
      return;
    }

    let move = bot.hand.findIndex(c =>
      isValidMove(c, top, copy.requestedShape)
    );

    if (move === -1) {
      bot.hand.push(copy.deck.pop());
      addLog("🤖 Bot drew");
      copy.turn = "player";
      copy.turnLocked = false;
      setGame(copy);
      updateAlert(copy);
      return;
    }

    const card = bot.hand.splice(move, 1)[0];
    copy.discard.push(card);

    addLog(`🤖 Bot played ${card.number} ${card.shape}`);
    playSound("move");

    if (card.number === 2) copy.pendingPick += 2;
    if (card.number === 5) copy.pendingPick += 3;
    if (card.number === 14) {
      copy.requestedShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    } else {
      copy.requestedShape = null;
    }

    if (checkWinner(copy)) return;

    copy.turn = "player";
    copy.turnLocked = false;

    setGame(copy);
    updateAlert(copy);
  }

  const top = game?.discard?.at(-1);

  return (
    <div style={styles.bg}>
      {alert && <div style={styles.alert}>{alert}</div>}

      {winner && (
        <div style={styles.overlay}>
          <h1>{winner === "player" ? "🎉 YOU WIN" : "BOT WINS"}</h1>
          <button onClick={() => startMatch()} style={styles.btn}>
            Rematch
          </button>
        </div>
      )}

      <div style={styles.box}>
        {!started && (
          <button onClick={startMatch} style={styles.btn}>
            Start Game
          </button>
        )}

        {started && game && (
          <>
            <button onClick={drawMarket} style={styles.btn}>Market</button>

            <div>
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
  box: { padding: 20, background: "#00000066", color: "#fff" },
  hand: { display: "flex", gap: 10, flexWrap: "wrap" },
  card: { width: 70, cursor: "pointer" },
  btn: { padding: 10, margin: 5, background: "#10b981", border: 0 },
  alert: {
    position: "fixed",
    top: 10,
    background: "gold",
    padding: 10,
    fontWeight: "bold"
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "#000c",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    color: "#fff"
  }
};