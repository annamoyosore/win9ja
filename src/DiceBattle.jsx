import { useEffect, useState } from "react";

const SIZE = 100;

const snakes = {
  16: 6,
  47: 26,
  49: 11,
  56: 53,
  62: 19,
  64: 60,
  87: 24,
  93: 73,
  95: 75,
  98: 78,
};

const ladders = {
  1: 38,
  4: 14,
  9: 31,
  21: 42,
  28: 84,
  36: 44,
  51: 67,
  71: 91,
  80: 100,
};

const potholes = {
  13: -3,
  33: -5,
  77: -10,
};

const missTurns = {
  22: 2,
  66: 2,
};

const dryBack = {
  44: 1,
  88: 10,
};

function rollDice() {
  return Math.floor(Math.random() * 6) + 1;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// 🎯 Convert board position to X,Y coordinates
function getPosition(pos) {
  const row = Math.floor((pos - 1) / 10);
  let col = (pos - 1) % 10;

  // Zig-zag layout
  if (row % 2 === 1) {
    col = 9 - col;
  }

  return {
    left: `${col * 10}%`,
    top: `${90 - row * 10}%`,
  };
}

export default function SnakeAndLadder() {
  const [player, setPlayer] = useState(1);
  const [bot, setBot] = useState(1);
  const [dice, setDice] = useState(1);
  const [turn, setTurn] = useState("player");
  const [winner, setWinner] = useState(null);
  const [moving, setMoving] = useState(false);
  const [msg, setMsg] = useState("");
  const [skipP, setSkipP] = useState(0);
  const [skipB, setSkipB] = useState(0);

  function applyEffects(pos, isPlayer) {
    let p = pos;

    if (snakes[p]) {
      setMsg("🐍 Snake! Move Down");
      p = snakes[p];
    }

    else if (ladders[p]) {
      setMsg("🪜 Ladder! Climb Up");
      p = ladders[p];
    }

    else if (potholes[p]) {
      setMsg("🕳️ Pothole! Go Back");
      p = Math.max(1, p + potholes[p]);
    }

    else if (missTurns[p]) {
      setMsg("⏳ Miss Turns");

      if (isPlayer) {
        setSkipP(missTurns[p]);
      } else {
        setSkipB(missTurns[p]);
      }
    }

    else if (dryBack[p]) {
      setMsg("🌪️ Reset Zone!");
      p = dryBack[p];
    }

    return p;
  }

  async function move(start, steps, setter, isPlayer) {
    let p = start;

    for (let i = 0; i < steps; i++) {
      await sleep(250);

      if (p < SIZE) {
        p += 1;
        setter(p);
      }
    }

    const final = applyEffects(p, isPlayer);

    await sleep(500);

    setter(final);

    if (final === SIZE) {
      setWinner(isPlayer ? "PLAYER" : "BOT");
    }

    return final;
  }

  async function playPlayer() {
    if (turn !== "player" || winner || moving) return;

    if (skipP > 0) {
      setMsg(`⏳ Player skips turn (${skipP} left)`);
      setSkipP(skipP - 1);
      setTurn("bot");
      return;
    }

    setMoving(true);

    const d = rollDice();
    setDice(d);
    setMsg(`🎲 Player rolled ${d}`);

    await move(player, d, setPlayer, true);

    setTurn("bot");
    setMoving(false);
  }

  useEffect(() => {
    async function botPlay() {
      if (turn !== "bot" || winner || moving) return;

      if (skipB > 0) {
        setMsg(`⏳ Bot skips turn (${skipB} left)`);
        setSkipB(skipB - 1);
        setTurn("player");
        return;
      }

      setMoving(true);

      await sleep(1000);

      const d = rollDice();

      setDice(d);
      setMsg(`🤖 Bot rolled ${d}`);

      await move(bot, d, setBot, false);

      setTurn("player");
      setMoving(false);
    }

    botPlay();
  }, [turn]);

  function reset() {
    setPlayer(1);
    setBot(1);
    setDice(1);
    setTurn("player");
    setWinner(null);
    setMoving(false);
    setMsg("");
    setSkipP(0);
    setSkipB(0);
  }

  const playerStyle = getPosition(player);
  const botStyle = getPosition(bot);

  return (
    <div style={styles.container}>
      <h1>🐍 Snake & Ladder</h1>

      <p style={styles.msg}>{msg}</p>

      {/* 🎨 BOARD */}
      <div style={styles.boardWrap}>
        <img
          src="/board.png"
          alt="board"
          style={styles.boardImg}
        />

        {/* PLAYER TOKEN */}
        <div
          style={{
            ...styles.token,
            ...playerStyle,
            background: "red",
          }}
        >
          P
        </div>

        {/* BOT TOKEN */}
        <div
          style={{
            ...styles.token,
            ...botStyle,
            background: "blue",
          }}
        >
          B
        </div>
      </div>

      {/* GAME INFO */}
      <div style={styles.info}>
        <h2>🎲 Dice: {dice}</h2>

        <h3>🧑 Player: {player}</h3>

        <h3>🤖 Bot: {bot}</h3>

        <h3>Turn: {turn.toUpperCase()}</h3>

        {winner && (
          <h1 style={{ color: "yellow" }}>
            🏆 {winner} WINS!
          </h1>
        )}
      </div>

      {/* BUTTONS */}
      <div style={styles.btns}>
        <button
          onClick={playPlayer}
          disabled={turn !== "player" || moving || winner}
          style={styles.button}
        >
          🎲 Roll Dice
        </button>

        <button
          onClick={reset}
          style={styles.resetBtn}
        >
          🔄 Reset
        </button>
      </div>

      <p style={styles.note}>
        Add board image as:
        <br />
        <b>board.png</b>
      </p>
    </div>
  );
}

const styles = {
  container: {
    background: "#0f172a",
    color: "white",
    minHeight: "100vh",
    textAlign: "center",
    padding: 20,
    fontFamily: "Arial",
  },

  boardWrap: {
    position: "relative",
    width: 500,
    height: 500,
    margin: "20px auto",
  },

  boardImg: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    objectFit: "cover",
    border: "4px solid white",
  },

  token: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontWeight: "bold",
    transition: "all 0.25s linear",
    transform: "translate(10%, 10%)",
    zIndex: 5,
  },

  info: {
    marginTop: 10,
  },

  btns: {
    display: "flex",
    justifyContent: "center",
    gap: 15,
    marginTop: 20,
  },

  button: {
    padding: "12px 20px",
    border: "none",
    borderRadius: 8,
    background: "#22c55e",
    color: "white",
    fontSize: 16,
    cursor: "pointer",
  },

  resetBtn: {
    padding: "12px 20px",
    border: "none",
    borderRadius: 8,
    background: "#ef4444",
    color: "white",
    fontSize: 16,
    cursor: "pointer",
  },

  msg: {
    fontSize: 18,
    marginTop: 10,
    color: "#facc15",
  },

  note: {
    marginTop: 20,
    opacity: 0.7,
    fontSize: 12,
  },
};
