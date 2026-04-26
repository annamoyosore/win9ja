import { useEffect, useRef, useState } from "react";
import { playSound } from "../utils/sound";

// =========================
// PLAYER DATA
// =========================
const PLAYER_ID = localStorage.getItem("userId");
const OPPONENT_ID = localStorage.getItem("opp");
const STAKE = Number(localStorage.getItem("stake") || 0);

// =========================
// CONSTANTS
// =========================
const SHAPES = ["circle", "triangle", "square", "star", "cross"];

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
function isValidMove(card, top) {
  if (!top) return true;
  return card.number === top.number || card.shape === top.shape;
}

// =========================
// CARD DRAW (CANVAS)
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
// GAME COMPONENT
// =========================
export default function WhotGame() {
  const [game, setGame] = useState(null);
  const [log, setLog] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [winner, setWinner] = useState(null);

  const [round, setRound] = useState(1);
  const [score, setScore] = useState({ p1: 0, p2: 0 });

  const [showWin, setShowWin] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);

  const gameRef = useRef(null);

  useEffect(() => {
    gameRef.current = game;
  }, [game]);

  // =========================
  // HELPERS
  // =========================
  function addLog(msg) {
    setLog(p => [...p, msg].slice(-10));
  }

  function pushAlert(msg) {
    setAlerts(p => [...p.slice(-3), msg]);
    setTimeout(() => setAlerts(p => p.slice(1)), 2500);
  }

  // =========================
  // START MATCH
  // =========================
  function startMatch() {
    const deck = createDeck();

    setGame({
      players: [
        { id: PLAYER_ID, hand: deck.splice(0, 6) },
        { id: OPPONENT_ID, hand: deck.splice(0, 6) }
      ],
      deck,
      discard: [deck.pop()],
      turn: PLAYER_ID
    });

    setLog([]);
    setAlerts([]);
  }

  const top = game?.discard?.at(-1);

  // =========================
  // PLAY CARD
  // =========================
  function playCard(i) {
    const g = gameRef.current;
    if (!g || winner || g.turn !== PLAYER_ID) return;

    const copy = JSON.parse(JSON.stringify(g));
    const player = copy.players.find(p => p.id === PLAYER_ID);
    const card = player.hand[i];

    if (!isValidMove(card, top)) {
      pushAlert("❌ Invalid move");
      return;
    }

    player.hand.splice(i, 1);
    copy.discard.push(card);

    playSound("play");
    addLog(`You played ${card.number}`);

    if (player.hand.length === 0) {
      handleRoundWin(PLAYER_ID);
      return;
    }

    copy.turn = OPPONENT_ID;
    setGame(copy);

    // 🔴 TODO: save to Appwrite
  }

  // =========================
  // DRAW CARD
  // =========================
  function drawMarket() {
    const g = gameRef.current;
    if (!g || winner || g.turn !== PLAYER_ID) return;

    const copy = JSON.parse(JSON.stringify(g));
    const player = copy.players.find(p => p.id === PLAYER_ID);

    player.hand.push(copy.deck.pop());

    playSound("draw");
    addLog("Market draw");

    copy.turn = OPPONENT_ID;
    setGame(copy);

    // 🔴 TODO: save to Appwrite
  }

  // =========================
  // ROUND WIN
  // =========================
  function handleRoundWin(winnerId) {
    setScore(prev => {
      const updated = { ...prev };

      if (winnerId === PLAYER_ID) updated.p1++;
      else updated.p2++;

      if (updated.p1 === 2 || updated.p2 === 2) {
        setWinner(winnerId === PLAYER_ID ? "YOU WIN 🏆" : "YOU LOST ❌");
        setShowWin(true);

        playSound("win");

        // 🔴 TODO: payout here

        setTimeout(() => {
          window.location.href = "/pages/lobby.html";
        }, 30000);

      } else {
        setRound(r => r + 1);
        startMatch();
      }

      return updated;
    });
  }

  // =========================
  // UI
  // =========================
  if (!game) {
    return (
      <div style={styles.bg}>
        <button onClick={startMatch} style={styles.startBtn}>
          START GAME
        </button>
      </div>
    );
  }

  return (
    <div style={styles.bg}>
      <div style={styles.box}>
        <h2>WHOT GAME</h2>

        {/* 💰 STAKE DISPLAY */}
        <h3>💰 Stake: ₦{STAKE}</h3>

        <p>Round: {round}</p>
        <p>Score: {score.p1} - {score.p2}</p>

        {/* 🎉 WIN ANIMATION */}
        {showWin && (
          <div style={styles.winOverlay}>
            <div style={styles.winBox}>
              <h1>{winner}</h1>
              <div style={styles.flowers}>🌸🌺🌸🌺🌸🌺</div>

              <button onClick={() => setConfirmExit(true)} style={styles.rematchBtn}>
                🔁 REMATCH
              </button>

              <button onClick={() => setConfirmExit(true)} style={{ ...styles.rematchBtn, marginTop: 10 }}>
                🏠 HOME
              </button>
            </div>

            {confirmExit && (
              <div style={styles.confirmBox}>
                <p>Choose action:</p>

                <button onClick={startMatch} style={styles.rematchBtn}>
                  REMATCH
                </button>

                <button
                  onClick={() => window.location.href = "/pages/lobby.html"}
                  style={{ ...styles.rematchBtn, marginTop: 10 }}
                >
                  HOME
                </button>

                <button
                  onClick={() => setConfirmExit(false)}
                  style={{ ...styles.rematchBtn, marginTop: 10, background: "gray" }}
                >
                  CANCEL
                </button>
              </div>
            )}
          </div>
        )}

        {/* ALERTS */}
        <div style={styles.alertBox}>
          {alerts.map((a, i) => <div key={i}>{a}</div>)}
        </div>

        {/* OPPONENT */}
        <div>
          👤 Opponent Cards: {game.players[1].hand.length}
        </div>

        {/* CENTER */}
        <div style={styles.center}>
          {top && <img src={drawCard(top)} style={{ width: 60 }} />}
          <button onClick={drawMarket} style={styles.marketBtn}>
            🃏 MARKET ({game.deck.length})
          </button>
        </div>

        {/* PLAYER CARDS */}
        <div>
          {game.players[0].hand.map((c, i) => (
            <img key={i} src={drawCard(c)} style={{ width: 60 }} onClick={() => playCard(i)} />
          ))}
        </div>

        {/* LOG */}
        <div style={styles.history}>
          {log.map((l, i) => <div key={i}>• {l}</div>)}
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
  box: {
    width: 420,
    padding: 10,
    background: "#00000066",
    color: "#fff"
  },
  center: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    margin: "10px 0"
  },
  marketBtn: {
    background: "gold",
    border: "none",
    padding: 10,
    borderRadius: 8
  },
  alertBox: {
    background: "#000000aa",
    color: "yellow",
    padding: 6
  },
  history: {
    fontSize: 12,
    marginTop: 10
  },
  startBtn: {
    padding: 15,
    background: "green",
    color: "#fff",
    border: "none",
    borderRadius: 10
  },
  winOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.85)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  winBox: {
    textAlign: "center",
    color: "gold"
  },
  flowers: {
    fontSize: 40,
    margin: "20px 0"
  },
  rematchBtn: {
    padding: 12,
    background: "gold",
    border: "none",
    borderRadius: 10
  },
  confirmBox: {
    position: "absolute",
    bottom: 40,
    background: "#000",
    padding: 20,
    borderRadius: 10,
    textAlign: "center"
  }
};