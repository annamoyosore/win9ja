import { useState, useRef } from "react";

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

  const shooting = useRef(false);

  const positions = [70, 160, 250];

  const shoot = (dir) => {
    if (shooting.current) return;

    if (wallet < stake) {
      setMessage("❌ Not enough wallet balance");
      return;
    }

    shooting.current = true;
    setWallet((w) => w - stake);

    let targetX = 160;
    if (dir === "left") targetX = 70;
    if (dir === "right") targetX = 250;

    const keeperMove =
      positions[Math.floor(Math.random() * positions.length)];

    // Move keeper (IMAGE)
    if (keeperRef.current) {
      keeperRef.current.style.left = keeperMove + "px";
    }

    // Move player (IMAGE)
    if (playerRef.current) {
      playerRef.current.style.left = targetX - 20 + "px";
    }

    // Ball animation
    if (ballRef.current) {
      ballRef.current.style.transition = "0.7s ease-out";
      ballRef.current.style.left = targetX + "px";
      ballRef.current.style.bottom = "320px";
    }

    setTimeout(() => {
      const diff = Math.abs(targetX - keeperMove);
      const luckyGoal = Math.random() < 0.4;

      // SAVE
      if (diff < 55 || !luckyGoal) {
        if (ballRef.current) {
          ballRef.current.style.transition = "0.2s";
          ballRef.current.style.left = keeperMove + "px";
          ballRef.current.style.bottom = "240px";
        }

        setMisses((m) => m + 1);
        setMessage("🧤 SAVED!");
      } 
      
      // GOAL
      else {
        const reward = stake * 2;

        if (ballRef.current) {
          ballRef.current.style.transition = "0.25s";
          ballRef.current.style.bottom = "390px";
        }

        setGoals((g) => g + 1);
        setPot((p) => p + reward);
        setMessage(`⚽ GOAL! +${reward}`);
      }

      setTimeout(() => {
        resetBall();
        shooting.current = false;
      }, 600);
    }, 700);
  };

  const collectPot = () => {
    if (pot <= 0) {
      setMessage("No winnings to collect");
      return;
    }

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

    if (keeperRef.current) {
      keeperRef.current.style.left = "160px";
    }
  };

  return (
    <div style={styles.page}>
      <h1>⚽ Penalty Shootout Game</h1>

      <div style={styles.topBar}>
        <div>Wallet: ${wallet}</div>
        <div>Stake: ${stake}</div>
        <div>Pot: ${pot}</div>
        <div>Goals: {goals}</div>
        <div>Misses: {misses}</div>
      </div>

      <div style={styles.stakeBox}>
        <label>Stake:</label>
        <input
          type="number"
          value={stake}
          onChange={(e) => setStake(Number(e.target.value))}
          style={styles.input}
        />
      </div>

      <div style={styles.game}>
        <div style={styles.goal}></div>

        {/* Keeper Image */}
        <img
          ref={keeperRef}
          src="https://cdn-icons-png.flaticon.com/512/1998/1998627.png"
          alt="keeper"
          style={styles.keeper}
        />

        {/* Ball */}
        <div ref={ballRef} style={styles.ball}></div>

        {/* Player Image */}
        <img
          ref={playerRef}
          src="https://cdn-icons-png.flaticon.com/512/921/921124.png"
          alt="player"
          style={styles.player}
        />
      </div>

      <div style={styles.controls}>
        <button onClick={() => shoot("left")}>Shoot Left</button>
        <button onClick={() => shoot("center")}>Shoot Center</button>
        <button onClick={() => shoot("right")}>Shoot Right</button>
        <button onClick={collectPot}>Collect Pot</button>
      </div>

      <h2>{message}</h2>
    </div>
  );
}

const styles = {
  page: {
    textAlign: "center",
    fontFamily: "Arial",
    background: "#0b6623",
    minHeight: "100vh",
    color: "white",
    paddingTop: 20,
  },

  topBar: {
    display: "flex",
    justifyContent: "center",
    gap: 15,
    fontWeight: "bold",
    marginBottom: 10,
    flexWrap: "wrap",
  },

  stakeBox: {
    marginBottom: 10,
  },

  input: {
    marginLeft: 10,
    padding: 5,
    width: 80,
  },

  game: {
    position: "relative",
    width: 360,
    height: 500,
    margin: "0 auto",
    background: "#1f8f3a",
    border: "3px solid white",
    overflow: "hidden",
  },

  goal: {
    position: "absolute",
    top: 20,
    width: "100%",
    height: 120,
    borderBottom: "4px solid white",
  },

  keeper: {
    position: "absolute",
    top: 70,
    left: 160,
    width: 60,
    height: 60,
    transition: "0.4s",
  },

  player: {
    position: "absolute",
    bottom: 10,
    left: 135,
    width: 70,
    height: 70,
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
    marginTop: 15,
    display: "flex",
    justifyContent: "center",
    gap: 10,
    flexWrap: "wrap",
  },
};