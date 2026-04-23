import { useEffect, useRef, useState } from "react";

const SHAPES = ["circle", "triangle", "square", "star", "cross"];

/* =========================================================
   🔊 SOUND ENGINE
========================================================= */
function playSound(type) {
  const s = {
    play: "https://actions.google.com/sounds/v1/cartoon/pop.ogg",
    draw: "https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg",
    alert: "https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg"
  };
  new Audio(s[type]).play().catch(() => {});
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
   🎮 WHOT PLATFORM v2
========================================================= */
export default function WhotGame() {

  const [game, setGame] = useState(null);
  const [log, setLog] = useState([]);
  const [round, setRound] = useState(1);
  const [winner, setWinner] = useState(null);

  /* 🪙 BETTING SYSTEM */
  const [coins, setCoins] = useState({ player: 10, bot: 10 });
  const [pot, setPot] = useState(2);

  const [turn, setTurn] = useState("player");

  const gameRef = useRef(null);
  const turnRef = useRef("player");

  useEffect(() => { gameRef.current = game; }, [game]);
  useEffect(() => { turnRef.current = turn; }, [turn]);

  /* =========================================================
     📜 HISTORY
  ========================================================= */
  function addLog(msg, who = "player") {
    const icon = who === "bot" ? "🤖" : "🧑";
    setLog(p => [...p, `${icon} ${msg}`].slice(-30));
  }

  /* =========================================================
     🧠 RULE ENGINE (WHOT v2)
  ========================================================= */
  function applyRules(card, copy, isPlayer) {

    const opponent = isPlayer ? 1 : 0;

    // 1 HOLD ON
    if (card.number === 1) {
      addLog("Hold On", isPlayer ? "player" : "bot");
      return { extraTurn: true };
    }

    // 2 PICK TWO
    if (card.number === 2) {
      copy.players[opponent].hand.push(copy.deck.pop());
      copy.players[opponent].hand.push(copy.deck.pop());
      addLog("Pick 2", isPlayer ? "player" : "bot");
    }

    // 8 SUSPENSION
    if (card.number === 8) {
      copy.skipNext = opponent;
      addLog("Suspension", isPlayer ? "player" : "bot");
      playSound("alert");
    }

    // 14 GENERAL MARKET
    if (card.number === 14) {
      copy.players.forEach((p, i) => {
        if (i !== opponent) p.hand.push(copy.deck.pop());
      });
      addLog("General Market", isPlayer ? "player" : "bot");
      return { extraTurn: true };
    }

    return { extraTurn: false };
  }

  /* =========================================================
     🏆 MATCH START (BETTING LOBBY)
  ========================================================= */
  function startMatch() {

    setPot(2);
    setCoins({ player: 10, bot: 10 });

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

    setWinner(null);
    setLog([]);
    setTurn("player");
  }

  const top = game?.discard?.at(-1);

  /* =========================================================
     🧑 PLAYER MOVE
  ========================================================= */
  function playCard(i) {

    if (!gameRef.current || turnRef.current !== "player") return;

    const copy = JSON.parse(JSON.stringify(gameRef.current));

    const card = copy.players[0].hand[i];

    if (!isValidMove(card, top)) {
      addLog("Invalid move", "player");
      return;
    }

    copy.players[0].hand.splice(i, 1);
    copy.discard.push(card);

    addLog(`Played ${card.number}`, "player");

    const res = applyRules(card, copy, true);

    if (copy.players[0].hand.length === 0) {
      endRound("player");
      return;
    }

    setGame(copy);

    if (res.extraTurn) return;

    setTurn("bot");
    setTimeout(botPlay, 700);
  }

  /* =========================================================
     🤖 BOT
  ========================================================= */
  function botPlay() {

    const copy = JSON.parse(JSON.stringify(gameRef.current));
    const bot = copy.players[1];

    const move = bot.hand.findIndex(c =>
      !top || c.number === top.number || c.shape === top.shape
    );

    if (move === -1) {
      bot.hand.push(copy.deck.pop());
      addLog("Bot drew", "bot");
      setGame(copy);
      setTurn("player");
      return;
    }

    const card = bot.hand.splice(move, 1)[0];
    copy.discard.push(card);

    addLog(`Played ${card.number}`, "bot");

    const res = applyRules(card, copy, false);

    if (bot.hand.length === 0) {
      endRound("bot");
      return;
    }

    setGame(copy);

    if (res.extraTurn) {
      setTimeout(botPlay, 700);
      return;
    }

    setTurn("player");
  }

  /* =========================================================
     🏁 ROUND END + POT SYSTEM
  ========================================================= */
  function endRound(who) {

    playSound("alert");

    setCoins(p => {
      if (who === "player") {
        return {
          player: p.player + pot,
          bot: p.bot - pot
        };
      }
      return {
        player: p.player - pot,
        bot: p.bot + pot
      };
    });

    setTimeout(() => {

      if (round >= 3) {
        setWinner(who === "player" ? "YOU WIN MATCH 🏆" : "BOT WINS 🤖");
        return;
      }

      setRound(r => r + 1);

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

    }, 2000);
  }

  /* =========================================================
     🚪 WITHDRAW
  ========================================================= */
  function withdraw() {
    setWinner("WITHDRAWN ❌");
    setGame(null);
  }

  /* =========================================================
     UI
  ========================================================= */
  if (!game) {
    return (
      <div style={{ background: "green", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <button onClick={startMatch}>START MATCH (BETTING LOBBY)</button>
      </div>
    );
  }

  return (
    <div style={{ background: "green", minHeight: "100vh", color: "#fff", padding: 10 }}>

      <h2>WHOT PLATFORM v2</h2>

      <div>
        🪙 You: {coins.player} | 🤖 Bot: {coins.bot} | 💰 Pot: {pot}
      </div>

      <div>ROUND {round} / 3</div>

      <button onClick={withdraw} style={{ background: "red", color: "#fff" }}>
        Withdraw
      </button>

      <div style={{ display: "flex", gap: 10 }}>
        {top && <img src={drawCard(top)} width={60} />}
      </div>

      <div>
        {game.players[0].hand.map((c, i) => (
          <img key={i} src={drawCard(c)} width={60} onClick={() => playCard(i)} />
        ))}
      </div>

      <div style={{ marginTop: 10, background: "#111", padding: 10 }}>
        {log.map((l, i) => <div key={i}>{l}</div>)}
      </div>

    </div>
  );
}