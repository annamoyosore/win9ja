import { useEffect, useRef, useState } from "react";

const SHAPES = ["circle", "triangle", "square", "star", "cross"];

// =========================
// AUDIO
// =========================
const playSound = (type) => {
  const sounds = {
    play: "https://actions.google.com/sounds/v1/cartoon/pop.ogg",
    draw: "https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg",
    win: "https://actions.google.com/sounds/v1/cartoon/concussive_drum_hit.ogg"
  };

  const audio = new Audio(sounds[type]);
  audio.volume = 0.6;
  audio.play();
};

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
// FLOWERS / CONFETTI
// =========================
function Confetti() {
  return (
    <div style={styles.confetti}>
      {"🎊🎉🌸🌺🌼✨".repeat(30)}
    </div>
  );
}

// =========================
// GAME
// =========================
export default function WhotGame() {
  const [game, setGame] = useState(null);
  const [started, setStarted] = useState(false);
  const [log, setLog] = useState([]);
  const [requestedShape, setRequestedShape] = useState(null);
  const [awaitingShape, setAwaitingShape] = useState(false);
  const [winner, setWinner] = useState(null);

  const gameRef = useRef(null);
  useEffect(() => { gameRef.current = game; }, [game]);

  function addLog(msg) {
    setLog((p) => [...p, msg].slice(-2));
  }

  // =========================
  // WIN CHECK
  // =========================
  function checkWin(state, playerIndex) {
    if (state.players[playerIndex].hand.length === 0) {
      setWinner(playerIndex);
      playSound("win");
      return true;
    }
    return false;
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
      turn: "player"
    });

    setStarted(true);
    setWinner(null);
    setLog([]);
  }

  // =========================
  // PLAYER
  // =========================
  function playCard(i) {
    const g = gameRef.current;
    if (!g || g.turn !== "player") return;

    const copy = JSON.parse(JSON.stringify(g));
    const player = copy.players[0];
    const top = copy.discard.at(-1);
    const card = player.hand[i];

    if (!isValidMove(card, top, requestedShape)) return;

    player.hand.splice(i, 1);
    copy.discard.push(card);

    playSound("play");

    if (player.hand.length === 0) {
      setGame(copy);
      checkWin(copy, 0);
      return;
    }

    copy.turn = "bot";
    setGame(copy);

    setTimeout(botPlay, 500);
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

    copy.turn = "bot";
    setGame(copy);

    setTimeout(botPlay, 500);
  }

  // =========================
  // BOT
  // =========================
  function botPlay() {
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

    const card = bot.hand.splice(move, 1)[0];
    copy.discard.push(card);

    playSound("play");

    if (bot.hand.length === 0) {
      setGame(copy);
      checkWin(copy, 1);
      return;
    }

    copy.turn = "player";
    setGame(copy);
  }

  const top = game?.discard?.at(-1);

  return (
    <div style={styles.bg}>
      {winner !== null && (
        <>
          <Confetti />
          <div style={styles.win}>
            🏆 Player {winner === 0 ? "You" : "Bot"} Wins!
          </div>
        </>
      )}

      <div style={styles.box}>
        <h2>WHOT GAME</h2>

        {!started && (
          <button onClick={startMatch}>Start</button>
        )}

        {started && game && (
          <>
            <button onClick={drawMarket}>Market</button>

            <div>
              {top && <img src={drawCard(top)} style={{ width: 70 }} />}
            </div>

            <div style={styles.hand}>
              {game.players[0].hand.map((c, i) => (
                <img
                  key={i}
                  src={drawCard(c)}
                  style={{ width: 70 }}
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

// =========================
// STYLES
// =========================
const styles = {
  bg: {
    minHeight: "100vh",
    background: "green",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative"
  },
  box: {
    padding: 20,
    background: "#00000066",
    color: "#fff"
  },
  hand: {
    display: "flex",
    gap: 10
  },
  win: {
    position: "absolute",
    top: "30%",
    fontSize: 40,
    color: "gold",
    fontWeight: "bold"
  },
  confetti: {
    position: "absolute",
    fontSize: 30,
    animation: "fall 2s linear infinite"
  }
};