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
  const [requestedShape, setRequestedShape] = useState(null);

  const gameRef = useRef(null);
  useEffect(() => { gameRef.current = game; }, [game]);

  function addLog(msg) {
    setLog(p => [...p, msg].slice(-10));
  }

  function pushAlert(msg) {
    setAlerts(p => [...p.slice(-3), msg]);
    setTimeout(() => setAlerts(p => p.slice(1)), 2500);
  }

  // =========================
  // WIN CHECK
  // =========================
  function checkWin(copy) {
    if (copy.players[0].hand.length === 0) {
      setWinner("YOU WIN 🏆");
      return true;
    }
    if (copy.players[1].hand.length === 0) {
      setWinner("BOT WINS 🤖🏆");
      return true;
    }
    return false;
  }

  // =========================
  // RULE ENGINE (FIXED HOLD)
  // =========================
  function applyRules(card, copy, isPlayer) {
    const opponent = isPlayer ? 1 : 0;

    // =========================
    // 1 = HOLD ON (OWNED LOCK)
    // =========================
    if (card.number === 1) {
      copy.holdOwner = isPlayer ? 0 : 1;
      copy.skipNext = opponent;
      pushAlert("🟡 HOLD ON → OPPONENT BLOCKED");
    }

    // =========================
    // 2 = PICK 2
    // =========================
    if (card.number === 2) {
      copy.players[opponent].hand.push(copy.deck.pop());
      copy.players[opponent].hand.push(copy.deck.pop());
      copy.skipNext = opponent;
      pushAlert("🔴 PICK 2");
    }

    // =========================
    // 8 = SUSPENSION
    // =========================
    if (card.number === 8) {
      copy.skipNext = opponent;
      pushAlert("🔵 SUSPENSION");
    }

    // =========================
    // 14 = GENERAL MARKET
    // =========================
    if (card.number === 14) {
      copy.players[opponent].hand.push(copy.deck.pop());
      copy.skipNext = opponent;

      const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      setRequestedShape(shape);

      pushAlert("🟢 GENERAL MARKET");
    }
  }

  // =========================
  // START GAME
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
      holdOwner: null
    });

    setLog([]);
    setAlerts([]);
    setWinner(null);
    setRequestedShape(null);
  }

  const top = game?.discard?.at(-1);

  // =========================
  // PLAYER MOVE
  // =========================
  function playCard(i) {
    const g = gameRef.current;
    if (!g || winner || g.turn !== "player") return;

    // BLOCK IF HELD BY OPPONENT
    if (g.holdOwner === 1) {
      pushAlert("🔒 YOU ARE BLOCKED BY HOLD");
      return;
    }

    const copy = JSON.parse(JSON.stringify(g));
    const player = copy.players[0];
    const card = player.hand[i];

    if (!isValidMove(card, top, requestedShape)) {
      pushAlert("❌ INVALID MOVE");
      return;
    }

    player.hand.splice(i, 1);
    copy.discard.push(card);

    playSound("play");
    applyRules(card, copy, true);

    // RELEASE HOLD IF OWNER PLAYS
    if (copy.holdOwner === 0) copy.holdOwner = null;

    addLog(`You played ${card.number}`);

    if (checkWin(copy)) return;

    copy.turn = "bot";
    setGame(copy);

    setTimeout(botPlay, 5000);
  }

  // =========================
  // MARKET
  // =========================
  function drawMarket() {
    const g = gameRef.current;
    if (!g || winner || g.turn !== "player") return;

    const copy = JSON.parse(JSON.stringify(g));
    copy.players[0].hand.push(copy.deck.pop());

    // RELEASE HOLD IF OWNER DRAWS
    if (copy.holdOwner === 0) copy.holdOwner = null;

    playSound("draw");
    addLog("Market draw");

    copy.turn = "bot";
    setGame(copy);

    setTimeout(botPlay, 5000);
  }

  // =========================
  // BOT
  // =========================
  function botPlay() {
    const g = gameRef.current;
    if (!g || winner) return;

    const copy = JSON.parse(JSON.stringify(g));

    if (copy.skipNext === 1) {
      copy.skipNext = null;
      pushAlert("🤖 BOT SKIPPED");
      copy.turn = "player";
      return setGame(copy);
    }

    if (copy.holdOwner === 0) {
      pushAlert("🔒 BOT BLOCKED BY HOLD");
      copy.turn = "player";
      return setGame(copy);
    }

    const bot = copy.players[1];

    let move = bot.hand.findIndex(c =>
      isValidMove(c, top, requestedShape)
    );

    if (move === -1) {
      bot.hand.push(copy.deck.pop());
      addLog("Bot drew");
      copy.turn = "player";
      return setGame(copy);
    }

    const card = bot.hand.splice(move, 1)[0];
    copy.discard.push(card);

    playSound("play");
    applyRules(card, copy, false);

    addLog(`Bot played ${card.number}`);

    if (checkWin(copy)) return;

    copy.turn = "player";
    setGame(copy);
  }

  // =========================
  // UI
  // =========================
  if (!game) {
    return (
      <div style={{ minHeight: "100vh", background: "green", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <button onClick={startMatch} style={{ padding: 15 }}>
          START GAME
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "green", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div style={{ width: 420, padding: 10, background: "#00000066", color: "#fff" }}>
        <h2>WHOT GAME</h2>

        <div>🤖 Bot Cards: {game.players[1].hand.length}</div>

        <div style={{ display: "flex", justifyContent: "center" }}>
          {top && <img src={drawCard(top)} style={{ width: 60 }} />}
        </div>

        <button onClick={drawMarket}>🃏 MARKET</button>

        <div>
          {game.players[0].hand.map((c, i) => (
            <img key={i} src={drawCard(c)} style={{ width: 60 }} onClick={() => playCard(i)} />
          ))}
        </div>

        <div style={{ fontSize: 12 }}>
          {log.map((l, i) => <div key={i}>• {l}</div>)}
        </div>

        {alerts.map((a, i) => <div key={i}>{a}</div>)}
      </div>
    </div>
  );
}