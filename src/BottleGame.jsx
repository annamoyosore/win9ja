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

    // Goalkeeper random movement
    const keeperPositions = [70, 160, 250];
    const keeperMove =
      keeperPositions[
        Math.floor(Math.random() * keeperPositions.length)
      ];

    // Move keeper
    if (keeperRef.current) {
      keeperRef.current.style.left = keeperMove + "px";
    }

    // Move player
    if (playerRef.current) {
      playerRef.current.style.left = targetX - 20 + "px";
    }

    // Move ball
    if (ballRef.current) {
      ballRef.current.style.transition = "0.7s ease-out";
      ballRef.current.style.bottom = "360px";
      ballRef.current.style.left = targetX + "px";
    }

    setTimeout(() => {
      const diff = Math.abs(targetX - keeperMove);

      // Lower scoring probability
      const luckyGoal = Math.random() < 0.45;

      if (diff < 55 || !luckyGoal) {
        setMisses((m) => m + 1);
        setMessage("🧤 SAVED!");
      } else {
        setGoals((g) => g + 1);
        setMessage("⚽ GOOOOAL!");
      }

      resetBall();
      shooting.current = false;
    }, 800);
  };

  const resetBall = () => {
    if (ballRef.current) {
      ballRef.current.style.transition = "none";
      ballRef.current.style.bottom = "40px";
      ballRef.current.style.left = "160px";
    }

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
        {/* Goal */}
        <div style={styles.goal}></div>

        {/* Net */}
        <div style={styles.net}></div>

        {/* Goalkeeper */}
        <img
          ref={keeperRef}
          src="https://cdn-icons-png.flaticon.com/512/1998/1998627.png"
          alt="keeper"
          style={styles.keeper}
        />

        {/* Ball */}
        <div ref={ballRef} style={styles.ball}></div>

        {/* Player */}
        <img
          ref={playerRef}
          src="https://cdn-icons-png.flaticon.com/512/921/921124.png"
          alt="player"
          style={styles.player}
        />
      </div>

      <div style={styles.controls}>
        <button onClick={() => shoot("left")}>
          Shoot Left
        </button>

        <button onClick={() => shoot("center")}>
          Shoot Center
        </button>

        <button onClick={() => shoot("right")}>
          Shoot Right
        </button>

        <button onClick={resetGame}>
          Reset
        </button>
      </div>

      <h2>{message}</h2>

      <p>
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
    background: "linear-gradient(#1f8f3a, #16752f)",
    border: "4px solid white",
    overflow: "hidden",
    borderRadius: 12,
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
  },

  controls: {
    marginTop: 20,
    display: "flex",
    justifyContent: "center",
    gap: 10,
    flexWrap: "wrap",
  },
};
