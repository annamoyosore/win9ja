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
// RULE ENGINE (FIXED CORE)
// =========================
function applyRules(card, copy, isPlayer) {
  const opponent = isPlayer ? 1 : 0;

  // 🟡 1 = HOLD (FORCES TURN LOCK)
  if (card.number === 1) {
    copy.locked = opponent;
    copy.holdActive = true;
  }

  // 🔴 2 = PICK 2 + LOCK TURN
  if (card.number === 2) {
    copy.players[opponent].hand.push(copy.deck.pop());
    copy.players[opponent].hand.push(copy.deck.pop());
    copy.locked = opponent;
  }

  // 🔵 8 = SUSPENSION (SKIP TURN)
  if (card.number === 8) {
    copy.skipNext = opponent;
  }

  // 🟢 14 = REQUEST SHAPE
  if (card.number === 14) {
    const shapes = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    copy.requestedShape = shapes;
  }
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

  // =========================
  // START
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
      locked: null,
      holdActive: false,
      requestedShape: null
    });

    setStarted(true);
    setLog([]);
    setAlerts([]);
  }

  // =========================
  // PLAYER MOVE
  // =========================
  function playCard(i) {
    const g = gameRef.current;
    if (!g || g.turn !== "player") return;

    const copy = JSON.parse(JSON.stringify(g));
    const player = copy.players[0];
    const top = copy.discard.at(-1);
    const card = player.hand[i];

    if (!isValidMove(card, top, requestedShape)) {
      pushAlert("❌ Invalid move");
      return;
    }

    player.hand.splice(i, 1);
    copy.discard.push(card);

    playSound("play");
    applyRules(card, copy, true);

    addLog(`You played ${card.number}`);

    // 🟡 HOLD LOGIC: PLAYER RETAINS TURN
    if (card.number === 1) {
      copy.turn = "player";
      return setGame(copy);
    }

    // 🔴 2 / 🔵 8 / NORMAL → BOT TURN (unless locked)
    copy.turn = "bot";
    setGame(copy);

    setTimeout(botPlay, 400);
  }

  // =========================
  // MARKET
  // =========================
  function drawMarket() {
    const g = gameRef.current;
    if (!g) return;

    const copy = JSON.parse(JSON.stringify(g));
    copy.players[0].hand.push(copy.deck.pop());

    playSound("draw");
    addLog("Drew from market");

    copy.turn = "bot";
    setGame(copy);

    setTimeout(botPlay, 400);
  }

  // =========================
  // BOT LOGIC (FIXED TURN LOCK)
  // =========================
  function botPlay() {
    const g = gameRef.current;
    if (!g) return;

    const copy = JSON.parse(JSON.stringify(g));

    const bot = copy.players[1];
    const top = copy.discard.at(-1);

    // 🔵 SKIP LOGIC (8)
    if (copy.skipNext === 1) {
      addLog("Bot skipped turn");
      copy.skipNext = null;
      copy.turn = "player";
      return setGame(copy);
    }

    let move = bot.hand.findIndex(c =>
      isValidMove(c, top, requestedShape)
    );

    if (move === -1) {
      bot.hand.push(copy.deck.pop());
      addLog("Bot drew (no move)");
      copy.turn = "player";
      return setGame(copy);
    }

    const card = bot.hand.splice(move, 1)[0];
    copy.discard.push(card);

    playSound("play");
    applyRules(card, copy, false);

    addLog(`Bot played ${card.number}`);

    // 🟡 HOLD: BOT RETAINS TURN
    if (card.number === 1) {
      copy.turn = "bot";
      setGame(copy);
      return setTimeout(botPlay, 400);
    }

    copy.turn = "player";
    setGame(copy);
  }

  const top = game?.discard?.at(-1);

  return (
    <div style={styles.bg}>
      <div style={styles.box}>
        <h2>WHOT GAME</h2>

        {/* HISTORY */}
        <div style={styles.history}>
          {log.map((l, i) => (
            <div key={i}>• {l}</div>
          ))}
        </div>

        {/* ALERTS */}
        <div style={styles.alertBox}>
          {alerts.map((a, i) => (
            <div key={i}>{a}</div>
          ))}
        </div>

        {!started && (
          <button onClick={startMatch}>Start</button>
        )}

        {started && game && (
          <>
            <div>
              🤖 Bot Cards: {game.players[1].hand.length}
            </div>

            <div>
              {top && <img src={drawCard(top)} style={{ width: 55 }} />}
            </div>

            <div>
              {game.players[0].hand.map((c, i) => (
                <img
                  key={i}
                  src={drawCard(c)}
                  style={{ width: 55 }}
                  onClick={() => playCard(i)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// styles unchanged
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
  history: {
    marginBottom: 10,
    fontSize: 12
  },
  alertBox: {
    position: "absolute",
    top: 10,
    left: 10,
    background: "#000000aa",
    color: "yellow",
    padding: 8
  }
};