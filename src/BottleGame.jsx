import { useState, useRef } from "react";

export default function PenaltyShootoutAI() {
  const [wallet, setWallet] = useState(1000);
  const [stake, setStake] = useState(50);
  const [pot, setPot] = useState(0);
  const [message, setMessage] = useState("Tap inside the goal!");

  const ballRef = useRef(null);
  const keeperRef = useRef(null);
  const playerRef = useRef(null);

  const shooting = useRef(false);

  const shoot = (e) => {
    if (shooting.current) return;

    if (wallet < stake) {
      setMessage("❌ Not enough balance");
      return;
    }

    shooting.current = true;
    setWallet((w) => w - stake);

    const rect = e.currentTarget.getBoundingClientRect();

    // 🎯 tap position inside goal
    const x = e.clientX - rect.left;

    const goalX = Math.max(40, Math.min(320, x)); // clamp inside goal

    const keeperMove = 40 + Math.random() * 240;

    // 🧤 keeper reacts slightly late (realistic)
    if (keeperRef.current) {
      keeperRef.current.style.transition = "0.25s";
      keeperRef.current.style.left = keeperMove + "px";
    }

    if (ballRef.current) {
      ballRef.current.style.transition = "0.7s ease-out";
      ballRef.current.style.left = goalX + "px";
      ballRef.current.style.bottom = "380px";
    }

    setTimeout(() => {
      const diff = Math.abs(goalX - keeperMove);

      const saved = diff < 60 && Math.random() < 0.75;

      if (saved) {
        setMessage("🧤 SAVED!");

        if (ballRef.current) {
          ballRef.current.style.transition = "0.2s";
          ballRef.current.style.left = keeperMove + "px";
          ballRef.current.style.bottom = "260px";
        }

        shooting.current = false;
        return;
      }

      const reward = stake * 2;

      if (ballRef.current) {
        ballRef.current.style.transition = "0.25s";
        ballRef.current.style.bottom = "420px";
      }

      setPot((p) => p + reward);
      setMessage(`⚽ GOAL! +${reward}`);

      setTimeout(() => {
        reset();
      }, 700);
    }, 650);
  };

  const collect = () => {
    setWallet((w) => w + pot);
    setPot(0);
    setMessage("💰 Collected!");
  };

  const reset = () => {
    if (ballRef.current) {
      ballRef.current.style.transition = "none";
      ballRef.current.style.left = "160px";
      ballRef.current.style.bottom = "40px";
    }

    if (playerRef.current) playerRef.current.style.left = "135px";
    if (keeperRef.current) keeperRef.current.style.left = "160px";

    shooting.current = false;
  };

  return (
    <div style={styles.page}>
      <h1>⚽ Tap-to-Shoot Penalty Game</h1>

      <div style={styles.top}>
        <div>Wallet: ${wallet}</div>
        <div>Stake: ${stake}</div>
        <div>Pot: ${pot}</div>
      </div>

      <input
        type="number"
        value={stake}
        onChange={(e) => setStake(Number(e.target.value))}
        style={styles.input}
      />

      <div style={styles.game}>
        {/* GOAL AREA (CLICKABLE) */}
        <div style={styles.goalArea} onClick={shoot}>
          <div style={styles.goalPost}></div>
          <div style={styles.goalText}>TAP TO SHOOT</div>
        </div>

        {/* KEEPER */}
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

      <div style={styles.controls}>
        <button onClick={collect}>Collect Pot</button>
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

  top: {
    display: "flex",
    justifyContent: "center",
    gap: 15,
    fontWeight: "bold",
  },

  input: {
    marginTop: 10,
    padding: 6,
    width: 90,
  },

  game: {
    position: "relative",
    width: 360,
    height: 500,
    margin: "20px auto",
    background: "#1f8f3a",
    border: "4px solid white",
    overflow: "hidden",
  },

  goalArea: {
    position: "absolute",
    top: 10,
    left: 20,
    width: 320,
    height: 180,
    cursor: "pointer",
  },

  goalPost: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    border: "4px solid white",
    boxSizing: "border-box",
  },

  goalText: {
    position: "absolute",
    top: 70,
    left: "50%",
    transform: "translateX(-50%)",
    fontWeight: "bold",
    opacity: 0.5,
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
  },

  controls: {
    marginTop: 15,
  },
};