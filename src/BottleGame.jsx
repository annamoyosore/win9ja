import { useState, useRef, useEffect } from "react";

export default function PenaltyShootout() {
  const [wallet, setWallet] = useState(1000);
  const [stake, setStake] = useState(50);
  const [pot, setPot] = useState(0);

  const [goals, setGoals] = useState(0);
  const [misses, setMisses] = useState(0);
  const [message, setMessage] = useState("Choose direction!");

  const ballRef = useRef(null);
  const keeperRef = useRef(null);
  const playerRef = useRef(null);

  const shootSound = useRef(null);
  const saveSound = useRef(null);
  const goalSound = useRef(null);

  const shooting = useRef(false);

  const positions = [70, 160, 250];

  useEffect(() => {
    shootSound.current = new Audio(
      "https://assets.mixkit.co/sfx/preview/mixkit-football-kick-2058.mp3"
    );
    saveSound.current = new Audio(
      "https://assets.mixkit.co/sfx/preview/mixkit-soccer-goalkeeper-save-2339.mp3"
    );
    goalSound.current = new Audio(
      "https://assets.mixkit.co/sfx/preview/mixkit-football-crowd-cheer-431.mp3"
    );
  }, []);

  const shoot = (dir) => {
    if (shooting.current) return;

    if (wallet < stake) {
      setMessage("❌ Not enough wallet balance");
      return;
    }

    shooting.current = true;
    setWallet((w) => w - stake);

    shootSound.current?.play();

    let targetX = dir === "left" ? 70 : dir === "right" ? 250 : 160;

    const keeperMove =
      positions[Math.floor(Math.random() * positions.length)];

    // 🧤 FASTER keeper reaction
    if (keeperRef.current) {
      keeperRef.current.style.transition = "0.25s";
      keeperRef.current.style.left = keeperMove + "px";
    }

    if (playerRef.current) {
      playerRef.current.style.left = targetX - 20 + "px";
    }

    if (ballRef.current) {
      ballRef.current.style.transition = "0.6s ease-out";
      ballRef.current.style.left = targetX + "px";
      ballRef.current.style.bottom = "330px";
    }

    setTimeout(() => {
      const diff = Math.abs(targetX - keeperMove);

      // 🔥 HIGHER SAVE RATE (harder scoring)
      const luckyGoal = Math.random() < 0.3;

      if (diff < 70 || !luckyGoal) {
        // SAVE
        saveSound.current?.play();

        if (ballRef.current) {
          ballRef.current.style.transition = "0.2s";
          ballRef.current.style.left = keeperMove + "px";
          ballRef.current.style.bottom = "250px";
        }

        setMisses((m) => m + 1);
        setMessage("🧤 SAVED!");
      } else {
        // GOAL
        goalSound.current?.play();

        const reward = stake * 2;

        if (ballRef.current) {
          ballRef.current.style.transition = "0.25s";
          ballRef.current.style.bottom = "410px";
        }

        setGoals((g) => g + 1);
        setPot((p) => p + reward);
        setMessage(`⚽ GOAL! +${reward}`);
      }

      setTimeout(() => {
        resetBall();
        shooting.current = false;
      }, 700);
    }, 650);
  };

  const collectPot = () => {
    if (pot <= 0) return setMessage("No winnings to collect");

    setWallet((w) => w + pot);
    setPot(0);
    setMessage("💰 Collected to wallet!");
  };

  const resetBall = () => {
    if (ballRef.current) {
      ballRef.current.style.transition = "none";
      ballRef.current.style.left = "160px";
      ballRef.current.style.bottom = "40px";
    }

    if (playerRef.current) {
      playerRef.current.style.left = "135px";
    }
  };

  return (
    <div style={styles.page}>
      <h1>⚽ Penalty Shootout</h1>

      {/* SCOREBOARD */}
      <div style={styles.topBar}>
        <div>Wallet: ${wallet}</div>
        <div>Stake: ${stake}</div>
        <div>Pot: ${pot}</div>
        <div>Goals: {goals}</div>
        <div>Misses: {misses}</div>
      </div>

      <input
        type="number"
        value={stake}
        onChange={(e) => setStake(Number(e.target.value))}
        style={styles.input}
      />

      {/* STADIUM */}
      <div style={styles.game}>
        {/* CROWD ANIMATION */}
        <div style={styles.crowd}></div>

        {/* GOAL POST IMAGE */}
        <img
          src="https://cdn-icons-png.flaticon.com/512/883/883407.png"
          style={styles.goalPost}
        />

        {/* GOALKEEPER */}
        <img
          ref={keeperRef}
          src="https://cdn-icons-png.flaticon.com/512/1998/1998627.png"
          style={styles.keeper}
        />

        {/* BALL */}
        <div ref={ballRef} style={styles.ball}></div>

        {/* PLAYER */}
        <img
          ref={playerRef}
          src="https://cdn-icons-png.flaticon.com/512/921/921124.png"
          style={styles.player}
        />
      </div>

      {/* CONTROLS */}
      <div style={styles.controls}>
        <button onClick={() => shoot("left")}>Left</button>
        <button onClick={() => shoot("center")}>Center</button>
        <button onClick={() => shoot("right")}>Right</button>
        <button onClick={collectPot}>Collect Pot</button>
      </div>

      <h2>{message}</h2>
    </div>
  );
}

const styles = {
  page: {
    textAlign: "center",
    background: "#0b6623",
    color: "white",
    minHeight: "100vh",
    fontFamily: "Arial",
    paddingTop: 20,
  },

  topBar: {
    display: "flex",
    justifyContent: "center",
    gap: 15,
    flexWrap: "wrap",
    fontWeight: "bold",
  },

  input: {
    marginTop: 10,
    padding: 5,
    width: 90,
  },

  game: {
    position: "relative",
    width: 360,
    height: 500,
    margin: "20px auto",
    background: "linear-gradient(#1f8f3a, #0c5f2a)",
    border: "4px solid white",
    overflow: "hidden",
    borderRadius: 12,
  },

  crowd: {
    position: "absolute",
    top: 0,
    width: "100%",
    height: 60,
    background:
      "repeating-radial-gradient(circle, white 0 2px, transparent 3px 10px)",
    animation: "crowdMove 1s infinite linear",
    opacity: 0.5,
  },

  goalPost: {
    position: "absolute",
    top: 15,
    left: 80,
    width: 200,
    opacity: 0.9,
  },

  keeper: {
    position: "absolute",
    top: 90,
    left: 160,
    width: 60,
    transition: "0.25s",
  },

  player: {
    position: "absolute",
    bottom: 10,
    left: 135,
    width: 70,
    transition: "0.3s",
  },

  ball: {
    position: "absolute",
    bottom: 40,
    left: 160,
    width: 20,
    height: 20,
    background: "white",
    borderRadius: "50%",
    border: "2px solid black",
  },

  controls: {
    display: "flex",
    justifyContent: "center",
    gap: 10,
    marginTop: 15,
    flexWrap: "wrap",
  },
};