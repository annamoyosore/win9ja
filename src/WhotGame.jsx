import { useEffect, useRef, useState } from "react";

const SHAPES = ["circle", "triangle", "square", "star", "cross"];

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
    new Audio(sounds[type]).play().catch(() => {});
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

/* =========================================================
   🎮 GAME
========================================================= */
export default function WhotGame() {

  const [game, setGame] = useState(null);
  const [log, setLog] = useState([]);
  const [winner, setWinner] = useState(null);

  const [round, setRound] = useState(1);
  const maxRounds = 3;

  const [turn, setTurn] = useState("player");

  const [roundPopup, setRoundPopup] = useState(null);
  const [countdown, setCountdown] = useState(3);

  const gameRef = useRef(null);
  const turnRef = useRef("player");

  useEffect(() => { gameRef.current = game; }, [game]);
  useEffect(() => { turnRef.current = turn; }, [turn]);

  /* =========================================================
     📜 FIXED MOVE HISTORY
  ========================================================= */
  function addLog(msg, who = "player") {
    const prefix = who === "bot" ? "🤖" : "🧑";

    setLog(p => [...p, `${prefix} ${msg}`].slice(-20));
  }

  function pushAlert(msg) {
    setLog(p => [...p, `⚠️ ${msg}`].slice(-20));
  }

  /* =========================================================
     SKIP ENGINE (FIXED)
  ========================================================= */
  function handleSkip(copy, currentTurn) {

    if (copy.skipNext === 0 && currentTurn === "player") {
      addLog("You were skipped", "player");
      copy.skipNext = null;
      return "bot";
    }

    if (copy.skipNext === 1 && currentTurn === "bot") {
      addLog("Bot was skipped", "bot");
      copy.skipNext = null;
      return "player";
    }

    return currentTurn;
  }

  /* =========================================================
     RULES
  ========================================================= */
  function applyRules(card, copy, isPlayer) {
    const opponent = isPlayer ? 1 : 0;
    const current = isPlayer ? 0 : 1;

    if (card.number === 1) {
      addLog("Hold On activated", isPlayer ? "player" : "bot");
      return { extraTurn: true };
    }

    if (card.number === 2) {
      copy.players[opponent].hand.push(copy.deck.pop());
      copy.players[opponent].hand.push(copy.deck.pop());
      copy.skipNext = opponent;
      addLog("Pick 2 activated", isPlayer ? "player" : "bot");
    }

    /* 🔵 FIXED 8 */
    if (card.number === 8) {
      copy.skipNext = opponent;
      addLog("Suspension (Opponent skipped)", isPlayer ? "player" : "bot");
      playSound("alert");
    }

    if (card.number === 14) {
      copy.players.forEach((p, i) => {
        if (i !== current) p.hand.push(copy.deck.pop());
      });
      addLog("General Market activated", isPlayer ? "player" : "bot");
      return { extraTurn: true };
    }

    return { extraTurn: false };
  }

  /* =========================================================
     ROUND SYSTEM (FIXED)
  ========================================================= */
  function nextRound(who) {

    setRoundPopup(`${who === "player" ? "You" : "Bot"} won the round`);

    let c = 3;
    setCountdown(3);

    const timer = setInterval(() => {
      c--;
      setCountdown(c);

      if (c === 0) {
        clearInterval(timer);
        setRoundPopup(null);

        if (round < maxRounds) {
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

          setRound(r => r + 1);
          setTurn("player");
        } else {
          setWinner(who === "player" ? "YOU WIN 🏆" : "BOT WINS 🤖");
        }
      }
    }, 1000);
  }

  function handleWin(who) {
    playSound("alert");
    nextRound(who);
  }

  /* =========================================================
     INIT GAME
  ========================================================= */
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

    setRound(1);
    setWinner(null);
    setLog([]);
    setTurn("player");
  }

  const top = game?.discard?.at(-1);

  /* =========================================================
     PLAYER MOVE
  ========================================================= */
  function playCard(i) {
    if (!gameRef.current || turnRef.current !== "player") return;

    let copy = JSON.parse(JSON.stringify(gameRef.current));

    const card = copy.players[0].hand[i];

    if (!isValidMove(card, top)) {
      addLog("Invalid move", "player");
      return;
    }

    copy.players[0].hand.splice(i, 1);
    copy.discard.push(card);

    addLog(`Played ${card.number}`, "player");

    const result = applyRules(card, copy, true);

    if (copy.players[0].hand.length === 0) return handleWin("player");

    setGame(copy);

    if (result.extraTurn) return;

    setTurn("bot");
    setTimeout(botPlay, 700);
  }

  /* =========================================================
     MARKET
  ========================================================= */
  function drawMarket() {
    if (!gameRef.current || turnRef.current !== "player") return;

    let copy = JSON.parse(JSON.stringify(gameRef.current));
    copy.players[0].hand.push(copy.deck.pop());

    addLog("Market draw", "player");

    setGame(copy);
    setTurn("bot");
    setTimeout(botPlay, 700);
  }

  /* =========================================================
     BOT
  ========================================================= */
  function botPlay() {
    if (!gameRef.current || turnRef.current !== "bot") return;

    let copy = JSON.parse(JSON.stringify(gameRef.current));

    const bot = copy.players[1];

    const move = bot.hand.findIndex(c =>
      !top || c.number === top.number || c.shape === top.shape
    );

    if (move === -1) {
      bot.hand.push(copy.deck.pop());
      addLog("Drew card", "bot");
      setGame(copy);
      setTurn("player");
      return;
    }

    const card = bot.hand.splice(move, 1)[0];
    copy.discard.push(card);

    addLog(`Played ${card.number}`, "bot");

    const result = applyRules(card, copy, false);

    if (bot.hand.length === 0) return handleWin("bot");

    setGame(copy);

    if (result.extraTurn) {
      setTimeout(botPlay, 700);
      return;
    }

    setTurn("player");
  }

  /* =========================================================
     UI
  ========================================================= */
  if (!game) {
    return (
      <div style={{ background: "green", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <button onClick={createGame}>START GAME</button>
      </div>
    );
  }

  return (
    <div style={{ background: "green", minHeight: "100vh", padding: 10, color: "#fff" }}>

      <h2>WHOT GAME</h2>

      {/* ROUND POPUP */}
      {roundPopup && (
        <div style={{ background: "#000", padding: 10 }}>
          <h3>{roundPopup}</h3>
          <p>Next round in {countdown}</p>
        </div>
      )}

      <div>ROUND {round} / {maxRounds}</div>

      <div>🤖 Bot Cards: {game.players[1].hand.length}</div>

      <div style={{ display: "flex", gap: 10 }}>
        {top && <img src={drawCard(top)} width={60} />}
        <button onClick={drawMarket}>🃏 MARKET</button>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {game.players[0].hand.map((c, i) => (
          <img key={i} src={drawCard(c)} width={60} onClick={() => playCard(i)} />
        ))}
      </div>

      {/* 🧾 FIXED MOVE HISTORY */}
      <div style={{ marginTop: 10, background: "#111", padding: 10 }}>
        {log.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>

    </div>
  );
}