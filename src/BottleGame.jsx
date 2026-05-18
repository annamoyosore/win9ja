import { useState, useRef } from "react";

export default function PenaltyGame() {
  const [goals, setGoals] = useState(0);
  const [misses, setMisses] = useState(0);
  const [message, setMessage] = useState("Choose Direction!");

  const ballRef = useRef(null);
  const keeperRef = useRef(null);
  const playerRef = useRef(null);

  const shooting = useRef(false);

  const shoot = (direction) => {
    if (shooting.current) return;

    shooting.current = true;

    let targetX = 160;

    if (direction === "left") targetX = 70;
    if (direction === "right") targetX = 250;

    // Keeper random movement
    const keeperPositions = [70, 160, 250];

    const keeperMove =
      keeperPositions[
        Math.floor(Math.random() * keeperPositions.length)
      ];

    // Move goalkeeper
    if (keeperRef.current) {
      keeperRef.current.style.left = keeperMove + "px";
    }

    // Move player
    if (playerRef.current) {
      playerRef.current.style.left = targetX - 20 + "px";
    }

    // Initial ball animation
    if (ballRef.current) {
      ballRef.current.style.transition = "0.7s ease-out";
      ballRef.current.style.bottom = "300px";
      ballRef.current.style.left = targetX + "px";
    }

    setTimeout(() => {
      const diff = Math.abs(targetX - keeperMove);

      // Lower scoring chance
      const luckyGoal = Math.random() < 0.45;

      // SAVE
      if (diff < 55 || !luckyGoal) {

        // Ball moves toward keeper
        if (ballRef.current) {
          ballRef.current.style.transition = "0.2s";
          ballRef.current.style.left = keeperMove + 12 + "px";
          ballRef.current.style.bottom = "230px";
        }

        setMisses((m) => m + 1);
        setMessage("🧤 SAVED!");

      } else {

        // Ball enters goal
        if (ballRef.current) {
          ballRef.current.style.transition = "0.25s";
          ballRef.current.style.bottom = "390px";
        }

        setGoals((g) => g + 1);
        setMessage("⚽ GOOOOAL!");
      }

      setTimeout(() => {
        resetBall();
        shooting.current = false;
      }, 650);

    }, 700);
  };

  const resetBall = () => {

    // Reset ball
    if (ballRef.current) {
      ballRef.current.style.transition = "none";
      ballRef.current.style.bottom = "40px";
      ballRef.current.style.left = "160px";
    }

    // Reset player
    if (playerRef.current) {
      playerRef.current.style.left = "135px";
    }
  };

  const resetGame = () => {
    setGoals(0);
    setMisses(0);
    setMessage("Choose Direction!");

    if (keeperRef.current) {
      keeperRef.current.style.left = "160px";
    }

    resetBall();
  };

  return (
    <div style={styles.page}>
      <h1>⚽ Penalty Shootout</h1>

      <div style={styles.game}>

        {/* Goal Post */}
        <div style={styles.goal}></div>

        {/* Goal Net */}
        <div style={styles.net}></div>

        {/* Goalkeeper */}
        <img
          ref={keeperRef}
          src="https://cdn-icons-png.flaticon.com/512/1998/1998627.png"
          alt="keeper"
          style={styles.keeper}
        />

        {/* Ball */}
        <div
          ref={ballRef}
          style={styles.ball}
        ></div>

        {/* Player */}
        <img
          ref={playerRef}
          src="https://cdn-icons-png.flaticon.com/512/921/921124.png"
          alt="player"
          style={styles.player}
        />
      </div>

      {/* Buttons */}
      <div style={styles.controls}>
        <button
          style={styles.button}
          onClick={() => shoot("left")}
        >
          Shoot Left
        </button>

        <button
          style={styles.button}
          onClick={() => shoot("center")}
        >
          Shoot Center
        </button>

        <button
          style={styles.button}
          onClick={() => shoot("right")}
        >
          Shoot Right
        </button>

        <button
          style={styles.resetBtn}
          onClick={resetGame}
        >
          Reset
        </button>
      </div>

      <h2>{message}</h2>

      <p style={styles.score}>
        Goals: {goals} | Misses: {misses}
      </p>
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

  game: {
    position: "relative",
    width: 360,
    height: 500,
    margin: "0 auto",
    background:
      "linear-gradient(#1f8f3a, #16752f)",
    border: "4px solid white",
    overflow: "hidden",
    borderRadius: 12,
    boxShadow: "0 0 20px rgba(0,0,0,0.4)",
  },

  goal: {
    position: "absolute",
    top: 20,
    left: 40,
    width: 280,
    height: 120,
    border: "6px solid white",
  },

  net: {
    position: "absolute",
    top: 20,
    left: 40,
    width: 280,
    height: 120,
    backgroundImage:
      "linear-gradient(to right, transparent 95%, white 95%), linear-gradient(to bottom, transparent 95%, white 95%)",
    backgroundSize: "20px 20px",
    opacity: 0.25,
  },

  keeper: {
    position: "absolute",
    top: 80,
    left: 160,
    width: 60,
    height: 60,
    transition: "0.4s",
    zIndex: 5,
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
    width: 25,
    height: 25,
    background: "white",
    borderRadius: "50%",
    border: "2px solid black",
    zIndex: 4,
  },

  controls: {
    marginTop: 20,
    display: "flex",
    justifyContent: "center",
    gap: 10,
    flexWrap: "wrap",
  },

  button: {
    padding: "12px 18px",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
    background: "#1565c0",
    color: "white",
  },

  resetBtn: {
    padding: "12px 18px",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
    background: "#c62828",
    color: "white",
  },

  score: {
    fontSize: 20,
    fontWeight: "bold",
  },
};