import { useEffect, useRef, useState } from "react";

const SHAPES = ["circle", "triangle", "square", "star", "cross"];

/* =========================================================
   🌸 FLOWER ANIMATION
========================================================= */
function FlowerRain({ show }) {
  if (!show) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      pointerEvents: "none",
      overflow: "hidden",
      zIndex: 999
    }}>
      {Array.from({ length: 25 }).map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          top: "-20px",
          left: Math.random() * 100 + "%",
          fontSize: 18 + Math.random() * 20,
          animation: `fall ${2 + Math.random() * 3}s linear infinite`
        }}>🌸</div>
      ))}

      <style>{`
        @keyframes fall {
          to { transform: translateY(110vh) rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

/* =========================================================
   🔊 SOUND ENGINE
========================================================= */
function playSound(type) {
  const sounds = {
    play: "https://actions.google.com/sounds/v1/cartoon/pop.ogg",
    draw: "https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg",
    alert: "https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg"
  };

  try {
    const a = new Audio(sounds[type]);
    a.volume = 0.7;
    a.play().catch(() => {});
  } catch {}
}

/* =========================================================
   🃏 DECK
========================================================= */
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

/* =========================================================
   🎯 VALID MOVE
========================================================= */
function isValidMove(card, top) {
  if (!top) return true;
  return card.number === top.number || card.shape === top.shape;
}

/* =========================================================
   🎨 CARD RENDER
========================================================= */
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

/* =========================================================
   🎮 GAME
========================================================= */
export default function WhotGame() {

  const [game, setGame] = useState(null);
  const [log, setLog] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [winner, setWinner] = useState(null);

  const [coins, setCoins] = useState({ player: 3, bot: 3 });

  const [round, setRound] = useState(1);
  const maxRounds = 3;

  const [turn, setTurn] = useState("player");

  const [showFlowers, setShowFlowers] = useState(false);
  const [showRematch, setShowRematch] = useState(false);

  const gameRef = useRef(null);
  const turnRef = useRef("player");

  useEffect(() => { gameRef.current = game; }, [game]);
  useEffect(() => { turnRef.current = turn; }, [turn]);

  /* ================= LOG ================= */
  function addLog(msg, who="player") {
    setLog(p => [...p, `${who==="bot"?"🤖":"🧑"} ${msg}`].slice(-15));
  }

  function pushAlert(msg) {
    setAlerts(p => [...p.slice(-3), msg]);
    setTimeout(() => setAlerts(p => p.slice(1)), 2500);
  }

  /* ================= RULE ENGINE ================= */
  function applyRules(card, copy, isPlayer) {
    const current = isPlayer ? 0 : 1;
    const opponent = isPlayer ? 1 : 0;

    // 1 HOLD ON
    if (card.number === 1) {
      pushAlert("🟡 HOLD ON - Play again");
      return { extraTurn: true };
    }

    // 2 PICK TWO
    if (card.number === 2) {
      copy.players[opponent].hand.push(copy.deck.pop());
      copy.players[opponent].hand.push(copy.deck.pop());
      copy.skipNext = opponent;
      pushAlert("🔴 PICK TWO");
    }

    // 8 SUSPENSION (FIXED)
    if (card.number === 8) {
      copy.skipNext = opponent;
      pushAlert("🔵 SUSPENSION - Opponent skipped");
    }

    // 14 GENERAL MARKET
    if (card.number === 14) {
      copy.players.forEach((p, i) => {
        if (i !== current) p.hand.push(copy.deck.pop());
      });
      pushAlert("🟢 GENERAL MARKET");
      return { extraTurn: true };
    }

    return { extraTurn: false };
  }

  function handleSkip(copy, currentTurn) {
    if (copy.skipNext === 0 && currentTurn === "player") {
      pushAlert("⛔ You were skipped");
      copy.skipNext = null;
      return "bot";
    }

    if (copy.skipNext === 1 && currentTurn === "bot") {
      pushAlert("🤖 Bot was skipped");
      copy.skipNext = null;
      return "player";
    }

    return currentTurn;
  }

  /* ================= GAME FLOW ================= */
  function createGame() {
    const deck = createDeck();
    setGame({
      players: [
        { hand: deck.splice(0, 6) },
        { hand: deck.splice(0, 6) }
      ],
      deck,
      discard: [deck.pop()],
      skipNext: null
    });
    setTurn("player");
    setLog([]);
  }

  const top = game?.discard?.at(-1);

  function playCard(i) {
    if (!gameRef.current || turnRef.current !== "player") return;

    let copy = JSON.parse(JSON.stringify(gameRef.current));

    const newTurn = handleSkip(copy, "player");
    if (newTurn !== "player") {
      setGame(copy);
      setTurn(newTurn);
      setTimeout(botPlay, 800);
      return;
    }

    const card = copy.players[0].hand[i];

    if (!isValidMove(card, top)) {
      pushAlert("❌ Invalid: match number or shape");
      playSound("alert");
      return;
    }

    copy.players[0].hand.splice(i, 1);
    copy.discard.push(card);

    playSound("play");

    const result = applyRules(card, copy, true);

    if (copy.players[0].hand.length === 0) return handleWin("player");

    setGame(copy);

    if (result.extraTurn) return;

    setTurn("bot");
    setTimeout(botPlay, 800);
  }

  function drawMarket() {
    if (!gameRef.current || turnRef.current !== "player") return;

    const copy = JSON.parse(JSON.stringify(gameRef.current));
    copy.players[0].hand.push(copy.deck.pop());

    playSound("draw");

    setGame(copy);
    setTurn("bot");
    setTimeout(botPlay, 800);
  }

  function botPlay() {
    if (!gameRef.current || turnRef.current !== "bot") return;

    let copy = JSON.parse(JSON.stringify(gameRef.current));

    const newTurn = handleSkip(copy, "bot");
    if (newTurn !== "bot") {
      setGame(copy);
      setTurn("player");
      return;
    }

    const bot = copy.players[1];

    const move = bot.hand.findIndex(c =>
      !top || c.number === top.number || c.shape === top.shape
    );

    if (move === -1) {
      bot.hand.push(copy.deck.pop());
      playSound("draw");
      setGame(copy);
      setTurn("player");
      return;
    }

    const card = bot.hand.splice(move, 1)[0];
    copy.discard.push(card);

    playSound("play");

    const result = applyRules(card, copy, false);

    if (bot.hand.length === 0) return handleWin("bot");

    setGame(copy);

    if (result.extraTurn) {
      setTimeout(botPlay, 800);
      return;
    }

    setTurn("player");
  }

  function handleWin(who) {
    setShowFlowers(true);
    setTimeout(() => setShowFlowers(false), 4000);
    setShowRematch(true);
    playSound("alert");
  }

  function rematchGame() {
    setShowRematch(false);
    createGame();
  }

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
      <FlowerRain show={showFlowers} />

      <div style={styles.box}>
        <h2>WHOT GAME</h2>

        <div>🧑 {coins.player} 🪙 | 🤖 {coins.bot} 🪙</div>
        <div>ROUND {round} / {maxRounds}</div>

        <div>🤖 Cards: {game.players[1].hand.length}</div>

        <div style={styles.center}>
          {top && <img src={drawCard(top)} style={{ width: 60 }} />}
          <button onClick={drawMarket} style={styles.marketBtn}>
            🃏 {game.deck.length}
          </button>
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

        {showRematch && (
          <div style={{ marginTop: 10 }}>
            <button onClick={rematchGame}>🔁 Rematch</button>
            <button onClick={() => setGame(null)}>🏠 Exit</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   🎨 STYLES
========================================================= */
const styles = {
  bg: { minHeight: "100vh", background: "green", display: "flex", justifyContent: "center", alignItems: "center" },
  box: { width: 420, padding: 10, background: "#00000066", color: "#fff" },
  center: { display: "flex", justifyContent: "center", margin: "10px 0" },
  history: { fontSize: 12, marginTop: 10 },
  startBtn: { padding: 15, background: "green", color: "#fff", borderRadius: 10 },
  marketBtn: { background: "gold", border: "none", padding: 10, borderRadius: 8 }
};