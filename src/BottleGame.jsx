import { useState, useRef } from "react";

export default function PenaltyGame() {
  const [goals, setGoals] = useState(0);
  const [misses, setMisses] = useState(0);
  const [message, setMessage] = useState("Click Shoot!");

  const ballRef = useRef(null);
  const keeperRef = useRef(null);
  const shooting = useRef(false);

  const shoot = () => {
    if (shooting.current) return;
    shooting.current = true;

    const targetX = Math.floor(Math.random() * 260);
    const keeperMove = Math.floor(Math.random() * 260);

    // Move keeper
    if (keeperRef.current) {
      keeperRef.current.style.left = keeperMove + "px";
    }

    // Move ball
    if (ballRef.current) {
      ballRef.current.style.transition = "0.6s ease-out";
      ballRef.current.style.bottom = "360px";
      ballRef.current.style.left = targetX + "px";
    }

    setTimeout(() => {
      const diff = Math.abs(targetX - keeperMove);

      if (diff < 45) {
        setMisses((m) => m + 1);
        setMessage("❌ SAVED!");
      } else {
        setGoals((g) => g + 1);
        setMessage("⚽ GOAL!");
      }

      resetBall();
      shooting.current = false;
    }, 700);
  };

  const resetBall = () => {
    if (ballRef.current) {
      ballRef.current.style.transition = "none";
      ballRef.current.style.bottom = "40px";
      ballRef.current.style.left = "160px";
    }
  };

  const resetGame = () => {
    setGoals(0);
    setMisses(0);
    setMessage("Click Shoot!");

    if (keeperRef.current) keeperRef.current.style.left = "160px";
    resetBall();
  };

  return (
    <div style={styles.page}>
      <h1>⚽ Penalty Shootout Game</h1>

      <div style={styles.game}>
        <div style={styles.goal}></div>

        <div ref={keeperRef} style={styles.keeper}></div>

        <div ref={ballRef} style={styles.ball}></div>
      </div>

      <div style={styles.controls}>
        <button onClick={shoot}>Shoot</button>
        <button onClick={resetGame}>Reset</button>
      </div>

      <h3>{message}</h3>

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

  ball: {
    position: "absolute",
    bottom: 40,
    left: 160,
    width: 25,
    height: 25,
    background: "white",
    borderRadius: "50%",
  },

  controls: {
    marginTop: 15,
    display: "flex",
    justifyContent: "center",
    gap: 10,
  },
};
