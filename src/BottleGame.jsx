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

    if (keeperRef.current) {
      keeperRef.current.style.left = keeperMove + "px";
    }

    if (playerRef.current) {
      playerRef.current.style.left = targetX - 20 + "px";
    }

    if (ballRef.current) {
      ballRef.current.style.transition = "0.7s ease-out";
      ballRef.current.style.left = targetX + "px";
      ballRef.current.style.bottom = "320px";
    }

    setTimeout(() => {
      const diff = Math.abs(targetX - keeperMove);
      const luckyGoal = Math.random() < 0.4;

      if (diff < 55 || !luckyGoal) {
        // SAVE
        if (ballRef.current) {
          ballRef.current.style.transition = "0.2s";
          ballRef.current.style.left = keeperMove + "px";
          ballRef.current.style.bottom = "240px";
        }

        setMisses((m) => m + 1);
        setMessage("🧤 SAVED!");
      } else {
        // GOAL
        const reward = stake * 2;

        if (ballRef.current) {
          ballRef.current.style.transition = "0.25s";
          ballRef.current.style.bottom = "390px";
        }

        setGoals((g) => g + 1);
        setPot((p) => p + reward);
        setMessage(`⚽ GOAL! +${reward} to pot`);
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
    setMessage("💰 Pot collected to wallet!");
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
      <h1>⚽ Penalty Shootout Game</h1>

      <div style={styles.topBar}>
        <div>Wallet: ${wallet}</div>
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

        <div ref={keeperRef} style={styles.keeper}></div>

        <div ref={ballRef} style={styles.ball}></div>

        <div ref={playerRef} style={styles.player}></div>
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
    gap: 20,
    fontWeight: "bold",
    marginBottom: 10,
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
    width: 40,
    height: 40,
    background: "yellow",
    borderRadius: "50%",
    transition: "0.4s",
  },

  player: {
    position: "absolute",
    bottom: 10,
    left: 135,
    width: 50,
    height: 50,
    background: "blue",
    borderRadius: "50%",
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
  },

  controls: {
    marginTop: 15,
    display: "flex",
    justifyContent: "center",
    gap: 10,
    flexWrap: "wrap",
  },
};