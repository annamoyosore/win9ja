import { useEffect, useState } from "react";

// =========================
// WHOT GAME ENGINE
// Player vs Bot
// =========================

const SHAPES = ["circle", "triangle", "square", "star", "cross"];
const NUMBERS = [1,2,3,4,5,6,7,8,9,10,11,12,13,14];

// Create deck
function createDeck() {
  const deck = [];
  for (const shape of SHAPES) {
    for (const number of NUMBERS) {
      deck.push({ shape, number });
    }
  }
  return shuffle(deck);
}

// Shuffle deck
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Validate move
function isValidMove(card, top, requestedShape, pendingPick, pickType) {
  if (requestedShape) {
    return card.shape === requestedShape || card.number === 14;
  }

  if (pendingPick > 0) {
    return (pickType === 2 && card.number === 2) || (pickType === 5 && card.number === 5);
  }

  return (
    card.shape === top.shape ||
    card.number === top.number ||
    card.number === 14
  );
}

// Bot AI
function getBotMove(bot, game) {
  const top = game.discard.at(-1);

  for (let i = 0; i < bot.hand.length; i++) {
    if (isValidMove(bot.hand[i], top, game.requestedShape, game.pendingPick, game.pickType)) {
      return i;
    }
  }
  return -1;
}

export default function WhotGame() {
  const [game, setGame] = useState(null);
  const [log, setLog] = useState([]);

  const addLog = (msg) => setLog((l) => [...l, msg]);

  // INIT GAME
  useEffect(() => {
    startGame();
  }, []);

  function startGame() {
    const deck = createDeck();

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

  function applyEffect(card, g) {
    if (card.number === 2) {
      g.pendingPick += 2;
      g.pickType = 2;
    }

    if (card.number === 5) {
      g.pendingPick += 3;
      g.pickType = 5;
    }

    if (card.number === 14) {
      g.requestedShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      addLog("WHOT played! Shape changed");
    }
  }

  function nextTurn(g) {
    g.currentTurn = g.currentTurn === "player" ? "bot" : "player";
  }

  function playCard(index) {
    if (!game || game.currentTurn !== "player") return;

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
      addLog("You Win 🎉");
      setGame(g);
      return;
    }

    nextTurn(g);
    setGame(g);

    setTimeout(() => botPlay(g), 700);
  }

  function botPlay(currentGame) {
    const g = structuredClone(currentGame);

    const bot = g.players[1];
    const top = g.discard.at(-1);

    const move = getBotMove(bot, g);

    if (move === -1) {
      bot.hand.push(g.deck.pop());
      addLog("Bot picked a card");
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
      addLog("Bot Wins 💀");
      setGame(g);
      return;
    }

    nextTurn(g);
    setGame(g);
  }

  const topCard = game?.discard?.at(-1);

  return (
    <div style={{ display: "flex", padding: 20 }}>

      {/* GAME */}
      <div style={{ flex: 1 }}>
        <h2>Whot Game (Player vs Bot)</h2>

        {game && (
          <>
            <p>Status: {game.status}</p>
            <p>Turn: {game.currentTurn}</p>

            <div style={{ padding: 10, border: "1px solid gray" }}>
              <b>Top Card:</b> {topCard?.shape} {topCard?.number}
            </div>

            <h3>Your Hand</h3>

            <div style={{ display: "flex", gap: 10 }}>
              {game.players[0].hand.map((c, i) => (
                <button key={i} onClick={() => playCard(i)}>
                  {c.shape} {c.number}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* LOG */}
      <div style={{ width: 300, marginLeft: 20 }}>
        <h3>Game Log</h3>
        {log.map((l, i) => (
          <p key={i}>• {l}</p>
        ))}
      </div>

    </div>
  );
}
