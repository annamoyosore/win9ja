import { useEffect, useState } from "react";

// ========================= // WHOT GAME ENGINE // Player vs Bot (Market + Advanced Rules + Styled UI) // =========================

const SHAPES = ["circle", "triangle", "square", "star", "cross"]; const NUMBERS = [1,2,3,4,5,6,7,8,9,10,11,12,13,14];

function createDeck() { const deck = []; for (const shape of SHAPES) { for (const number of NUMBERS) { deck.push({ shape, number }); } } return shuffle(deck); }

function shuffle(array) { for (let i = array.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [array[i], array[j]] = [array[j], array[i]]; } return array; }

function isValidMove(card, top, requestedShape, pendingPick, pickType) { if (requestedShape) { return card.shape === requestedShape || card.number === 14; }

if (pendingPick > 0) { return (pickType === 2 && card.number === 2) || (pickType === 5 && card.number === 5); }

return ( card.shape === top.shape || card.number === top.number || card.number === 14 ); }

function getBotMove(bot, game) { const top = game.discard.at(-1);

for (let i = 0; i < bot.hand.length; i++) { if (isValidMove(bot.hand[i], top, game.requestedShape, game.pendingPick, game.pickType)) { return i; } } return -1; }

export default function WhotGame() { const [game, setGame] = useState(null); const [log, setLog] = useState([]);

const addLog = (msg) => setLog((l) => [...l, msg]);

useEffect(() => { startGame(); }, []);

function startGame() { const deck = createDeck();

const player = { id: "player", hand: deck.splice(0, 6) };
const bot = { id: "bot", hand: deck.splice(0, 6) };

const newGame = {
  players: [player, bot],
  deck,
  discard: [deck.pop()],
  currentTurn: "player",
  pendingPick: 0,
  pickType: null,
  requestedShape: null,
  status: "active",
  winner: null
};

setGame(newGame);
addLog("Game started (Player vs Bot)");

}

function applyEffect(card, g) { if (card.number === 2) { g.pendingPick += 2; g.pickType = 2; addLog("Pick 2 activated"); }

if (card.number === 5) {
  g.pendingPick += 3;
  g.pickType = 5;
  addLog("Pick 3 activated");
}

if (card.number === 14) {
  g.requestedShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  addLog("GENERAL MARKET / WHOT played");
}

}

function nextTurn(g) { g.currentTurn = g.currentTurn === "player" ? "bot" : "player"; }

function drawFromMarket(playerIndex) { if (!game || game.deck.length === 0) return;

const g = structuredClone(game);
g.players[playerIndex].hand.push(g.deck.pop());

addLog(playerIndex === 0 ? "You drew from market" : "Bot drew from market");
setGame(g);

}

function playCard(index) { if (!game || game.currentTurn !== "player") return;

const g = structuredClone(game);
const player = g.players[0];
const top = g.discard.at(-1);
const card = player.hand[index];

if (!isValidMove(card, top, g.requestedShape, g.pendingPick, g.pickType)) {
  addLog("Invalid move");
  return;
}

player.hand.splice(index, 1);
g.discard.push(card);

applyEffect(card, g);

if (player.hand.length === 0) {
  g.status = "finished";
  g.winner = "player";
  setGame(g);
  return;
}

nextTurn(g);
setGame(g);

setTimeout(() => botPlay(g), 800);

}

function botPlay(currentGame) { const g = structuredClone(currentGame);

const bot = g.players[1];
const top = g.discard.at(-1);

const move = getBotMove(bot, g);

if (move === -1) {
  bot.hand.push(g.deck.pop());
  nextTurn(g);
  setGame(g);
  return;
}

const card = bot.hand[move];
bot.hand.splice(move, 1);
g.discard.push(card);

applyEffect(card, g);

if (bot.hand.length === 0) {
  g.status = "finished";
  g.winner = "bot";
  setGame(g);
  return;
}

nextTurn(g);
setGame(g);

}

const topCard = game?.discard?.at(-1);

return ( <div style={styles.bg}> <div style={styles.container}>

<div style={styles.gameBox}>
      <h2 style={styles.title}>♣ WHOT GAME</h2>

      {game && (
        <>
          <div style={styles.status}>Turn: {game.currentTurn}</div>

          <div style={styles.market}>
            <button style={styles.button} onClick={() => drawFromMarket(0)}>
              Draw Market
            </button>
            <div>Deck: {game.deck.length}</div>
          </div>

          <div style={styles.topCard}>
            Top Card: {topCard?.shape} {topCard?.number}
          </div>

          <h3>Your Cards</h3>
          <div style={styles.hand}>
            {game.players[0].hand.map((c, i) => (
              <button key={i} style={styles.card} onClick={() => playCard(i)}>
                {c.shape} {c.number}
              </button>
            ))}
          </div>
        </>
      )}
    </div>

    <div style={styles.logBox}>
      <h3>Game Log</h3>
      {log.map((l, i) => (
        <p key={i}>• {l}</p>
      ))}
    </div>

  </div>
</div>

); }

// ========================= // GREEN WHOT STYLE BACKGROUND // =========================

const styles = { bg: { minHeight: "100vh", background: "radial-gradient(circle at top, #22c55e, #065f46, #022c22)", display: "flex", justifyContent: "center", alignItems: "center", color: "white" }, container: { display: "flex", width: "95%", maxWidth: 1200, gap: 20 }, gameBox: { flex: 1, background: "rgba(0,0,0,0.35)", padding: 20, borderRadius: 16, backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.1)" }, logBox: { width: 300, background: "rgba(0,0,0,0.5)", padding: 15, borderRadius: 16 }, title: { color: "#34d399" }, status: { marginBottom: 10 }, market: { display: "flex", justifyContent: "space-between", marginBottom: 10 }, topCard: { padding: 10, background: "#064e3b", borderRadius: 10, marginBottom: 10 }, hand: { display: "flex", flexWrap: "wrap", gap: 10 }, card: { padding: 10, background: "linear-gradient(135deg,#10b981,#059669)", border: "none", borderRadius: 10, color: "white", fontWeight: "bold" }, button: { padding: 10, background: "#10b981", border: "none", borderRadius: 10, color: "white" } };