import { useEffect, useState, useMemo } from "react";

// ========================= // WHOT GAME ENGINE (CANVAS AUTO-GENERATED CARDS) // Player vs Bot // =========================

const SHAPES = ["circle", "triangle", "square", "star", "cross"]; const NUMBERS = [1,2,3,4,5,6,7,8,9,10,11,12,13,14];

function createDeck() { const deck = []; for (const shape of SHAPES) { for (const number of NUMBERS) { deck.push({ shape, number }); } } return shuffle(deck); }

function shuffle(array) { for (let i = array.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [array[i], array[j]] = [array[j], array[i]]; } return array; }

// ========================= // VALID MOVE RULES // ========================= function isValidMove(card, top, requestedShape, pendingPick, pickType) { if (requestedShape) return card.shape === requestedShape || card.number === 14; if (pendingPick > 0) return (pickType === 2 && card.number === 2) || (pickType === 5 && card.number === 5); return card.shape === top.shape || card.number === top.number || card.number === 14; }

function getBotMove(bot, game) { const top = game.discard.at(-1); for (let i = 0; i < bot.hand.length; i++) { if (isValidMove(bot.hand[i], top, game.requestedShape, game.pendingPick, game.pickType)) return i; } return -1; }

// ========================= // 🎨 CANVAS CARD GENERATOR (REAL WHOT STYLE) // White background + red shapes + red numbers // ========================= function drawCard(card) { const canvas = document.createElement("canvas"); canvas.width = 90; canvas.height = 130; const ctx = canvas.getContext("2d");

// background (white card) ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, canvas.width, canvas.height);

// border ctx.strokeStyle = "#e11d48"; ctx.lineWidth = 3; ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

// number (top) ctx.fillStyle = "#e11d48"; ctx.font = "bold 16px Arial"; ctx.fillText(card.number, 8, 18);

// number (bottom) ctx.fillText(card.number, 8, canvas.height - 6);

// shape (center) ctx.fillStyle = "#e11d48";

const cx = canvas.width / 2; const cy = canvas.height / 2;

switch (card.shape) { case "circle": ctx.beginPath(); ctx.arc(cx, cy, 18, 0, Math.PI * 2); ctx.fill(); break;

case "square":
  ctx.fillRect(cx - 15, cy - 15, 30, 30);
  break;

case "triangle":
  ctx.beginPath();
  ctx.moveTo(cx, cy - 18);
  ctx.lineTo(cx - 18, cy + 18);
  ctx.lineTo(cx + 18, cy + 18);
  ctx.closePath();
  ctx.fill();
  break;

case "star":
  ctx.font = "20px Arial";
  ctx.fillText("★", cx - 10, cy + 8);
  break;

case "cross":
  ctx.fillRect(cx - 3, cy - 18, 6, 36);
  ctx.fillRect(cx - 18, cy - 3, 36, 6);
  break;

}

// WHOT wild highlight if (card.number === 14) { ctx.strokeStyle = "#facc15"; ctx.lineWidth = 4; ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8); ctx.fillStyle = "#facc15"; ctx.font = "bold 12px Arial"; ctx.fillText("WHOT", 20, cy + 40); }

return canvas.toDataURL("image/png"); }

export default function WhotGame() { const [game, setGame] = useState(null); const [log, setLog] = useState([]);

const addLog = (m) => setLog((l) => [...l, m]);

useEffect(() => { startGame(); }, []);

function startGame() { const deck = createDeck(); const player = { id: "player", hand: deck.splice(0, 6) }; const bot = { id: "bot", hand: deck.splice(0, 6) };

setGame({
  players: [player, bot],
  deck,
  discard: [deck.pop()],
  currentTurn: "player",
  pendingPick: 0,
  pickType: null,
  requestedShape: null,
  status: "active",
  winner: null
});

addLog("Game started");

}

function applyEffect(card, g) { if (card.number === 2) g.pendingPick += 2, g.pickType = 2; if (card.number === 5) g.pendingPick += 3, g.pickType = 5; if (card.number === 14) g.requestedShape = SHAPES[Math.floor(Math.random() * SHAPES.length)]; }

function nextTurn(g) { g.currentTurn = g.currentTurn === "player" ? "bot" : "player"; }

function drawFromMarket(i) { const g = structuredClone(game); g.players[i].hand.push(g.deck.pop());

addLog(i === 0 ? "You drew from market" : "Bot drew from market");

if (i === 0) {
  g.currentTurn = "bot";
  setGame(g);
  setTimeout(() => botPlay(g), 500);
  return;
}

g.currentTurn = "player";
setGame(g);

}

function playCard(i) { if (!game || game.currentTurn !== "player") return;

const g = structuredClone(game);
const player = g.players[0];
const top = g.discard.at(-1);
const card = player.hand[i];

if (!isValidMove(card, top, g.requestedShape, g.pendingPick, g.pickType)) {
  addLog("Invalid move");
  return;
}

player.hand.splice(i, 1);
g.discard.push(card);
applyEffect(card, g);

if (player.hand.length === 0) {
  g.status = "finished";
  g.winner = "player";
  return setGame(g);
}

nextTurn(g);
setGame(g);
setTimeout(() => botPlay(g), 600);

}

function botPlay(state) { const g = structuredClone(state); const bot = g.players[1];

const move = getBotMove(bot, g);

if (move === -1) {
  bot.hand.push(g.deck.pop());
  nextTurn(g);
  return setGame(g);
}

const card = bot.hand.splice(move, 1)[0];
g.discard.push(card);
applyEffect(card, g);

if (bot.hand.length === 0) {
  g.status = "finished";
  g.winner = "bot";
  return setGame(g);
}

nextTurn(g);
setGame(g);

}

const top = game?.discard?.at(-1);

const styles = { bg: { minHeight: "100vh", background: "radial-gradient(circle at top, #22c55e, #064e3b, #022c22)", display: "flex", justifyContent: "center", alignItems: "center", color: "white" }, container: { display: "flex", width: "95%", gap: 20 }, gameBox: { flex: 1, background: "rgba(0,0,0,0.35)", padding: 20, borderRadius: 14 }, logBox: { width: 280, background: "rgba(0,0,0,0.5)", padding: 10, borderRadius: 14 }, hand: { display: "flex", flexWrap: "wrap", gap: 10 }, cardImg: { width: 70, height: 100, borderRadius: 8, cursor: "pointer" }, topCard: { display: "flex", alignItems: "center", gap: 10 } };

return ( <div style={styles.bg}> <div style={styles.container}> <div style={styles.gameBox}> <h2>WHOT GAME</h2>

{game && (
        <>
          <button onClick={() => drawFromMarket(0)}>Draw Market</button>
          <div>Deck: {game.deck.length}</div>

          <div style={styles.topCard}>
            Top Card:
            {top && <img src={drawCard(top)} style={styles.cardImg} />}
          </div>

          <h3>Your Hand</h3>
          <div style={styles.hand}>
            {game.players[0].hand.map((c, i) => (
              <img
                key={i}
                src={drawCard(c)}
                style={styles.cardImg}
                onClick={() => playCard(i)}
              />
            ))}
          </div>
        </>
      )}
    </div>

    <div style={styles.logBox}>
      <h3>Game Log</h3>
      {log.map((l, i) => <p key={i}>• {l}</p>)}
    </div>
  </div>
</div>

); }