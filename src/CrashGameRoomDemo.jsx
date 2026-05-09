import { useEffect, useRef, useState } from "react";

export default function CrashGameRoomDemo({ onBack }) {
  const [status, setStatus] = useState("BETTING");
  const [countdown, setCountdown] = useState(5);
  const [multiplier, setMultiplier] = useState(1.0);

  const [rocketPos, setRocketPos] = useState({
    x: 0,
    y: 0
  });

  const [flightPoints, setFlightPoints] = useState([]);

  const statusRef = useRef("BETTING");
  const intervalRef = useRef(null);
  const crashPointRef = useRef(2.0);

  const [player, setPlayer] = useState({
    bet: 1000,
    cashedOut: false,
    cashoutMultiplier: null,
    profit: 0
  });

  // 🚀 START BETTING PHASE
  function startBettingPhase() {
    clearInterval(intervalRef.current);

    setStatus("BETTING");
    statusRef.current = "BETTING";

    setCountdown(5);
    setMultiplier(1.0);

    setRocketPos({
      x: 0,
      y: 0
    });

    setFlightPoints([]);

    setPlayer({
      bet: 1000,
      cashedOut: false,
      cashoutMultiplier: null,
      profit: 0
    });

    let timer = 5;

    intervalRef.current = setInterval(() => {
      timer--;

      setCountdown(timer);

      if (timer <= 0) {
        clearInterval(intervalRef.current);
        startFlight();
      }
    }, 1000);
  }

  // ✈️ START FLIGHT
  function startFlight() {
    setStatus("RUNNING");
    statusRef.current = "RUNNING";

    crashPointRef.current = +(1.5 + Math.random() * 4).toFixed(2);

    let currentMultiplier = 1;

    let x = 0;
    let y = 0;

    intervalRef.current = setInterval(() => {
      if (statusRef.current !== "RUNNING") return;

      // 📈 MULTIPLIER GROWTH
      const growth = 0.015 + currentMultiplier * 0.018;

      currentMultiplier += growth;

      currentMultiplier = +currentMultiplier.toFixed(2);

      setMultiplier(currentMultiplier);

      // ✈️ LIVE FLIGHT MOVEMENT
      x += 2 + currentMultiplier * 0.45;
      y += 1 + currentMultiplier * 0.55;

      setRocketPos({
        x,
        y
      });

      // 📈 LIVE GRAPH
      setFlightPoints((prev) => [
        ...prev,
        {
          x,
          y
        }
      ]);

      // 💰 LIVE PAYOUT
      if (!player.cashedOut) {
        const liveProfit = +(
          player.bet * currentMultiplier - player.bet
        ).toFixed(2);

        setPlayer((prev) => ({
          ...prev,
          profit: liveProfit
        }));
      }

      // 💥 CRASH
      if (currentMultiplier >= crashPointRef.current) {
        clearInterval(intervalRef.current);

        setStatus("CRASHED");
        statusRef.current = "CRASHED";

        setTimeout(() => {
          startBettingPhase();
        }, 4000);
      }
    }, 40);
  }

  // 💰 CASHOUT
  function cashout() {
    if (statusRef.current !== "RUNNING") return;

    setPlayer((prev) => {
      if (prev.cashedOut) return prev;

      return {
        ...prev,
        cashedOut: true,
        cashoutMultiplier: multiplier,
        profit: +(prev.bet * multiplier - prev.bet).toFixed(2)
      };
    });
  }

  useEffect(() => {
    startBettingPhase();

    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>
        ✈️ AVIATION CRASH
      </h1>

      {/* STATUS */}
      <div style={styles.status}>
        {status === "BETTING" && (
          <span>
            Next Flight In {countdown}s
          </span>
        )}

        {status === "RUNNING" && (
          <span style={{ color: "#22c55e" }}>
            Flight Is Live ✈️
          </span>
        )}

        {status === "CRASHED" && (
          <span style={{ color: "red" }}>
            💥 Flew Away @{" "}
            {multiplier.toFixed(2)}x
          </span>
        )}
      </div>

      {/* MULTIPLIER */}
      <div style={styles.multiplier}>
        {multiplier.toFixed(2)}x
      </div>

      {/* GAME AREA */}
      <div style={styles.gameArea}>

        {/* SKY GLOW */}
        <div style={styles.skyGlow} />

        {/* CLOUDS */}
        <div
          style={{
            ...styles.cloud1,
            left: `${(multiplier * 35) % 120}%`
          }}
        >
          ☁️
        </div>

        <div
          style={{
            ...styles.cloud2,
            left: `${(multiplier * 22) % 100}%`
          }}
        >
          ☁️
        </div>

        {/* GRAPH */}
        <svg style={styles.svg}>
          <polyline
            fill="none"
            stroke="#22c55e"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={flightPoints
              .map(
                (p) =>
                  `${p.x},${250 - p.y}`
              )
              .join(" ")}
          />
        </svg>

        {/* ENGINE FIRE */}
        <div
          style={{
            ...styles.fire,
            opacity:
              status === "RUNNING" ? 1 : 0,
            transform: `
              translate(
                ${rocketPos.x - 12}px,
                -${rocketPos.y - 8}px
              )
            `
          }}
        >
          🔥
        </div>

        {/* LIVE AIRPLANE */}
        <div
          style={{
            ...styles.airplane,
            transform: `
              translate(
                ${rocketPos.x}px,
                -${rocketPos.y}px
              )
              rotate(${Math.min(
                multiplier * 10,
                40
              )}deg)
            `
          }}
        >
          ✈️
        </div>
      </div>

      {/* PLAYER CARD */}
      <div style={styles.card}>
        <div style={{ marginBottom: 10 }}>
          Bet Amount: ₦{player.bet}
        </div>

        {!player.cashedOut &&
          status === "RUNNING" && (
            <>
              <div style={styles.liveMoney}>
                ₦
                {(
                  player.bet +
                  player.profit
                ).toFixed(2)}
              </div>

              <div style={styles.liveProfit}>
                Live Profit: +₦
                {player.profit.toFixed(2)}
              </div>
            </>
          )}

        {player.cashedOut && (
          <div style={{ color: "gold" }}>
            <div>
              Cashed Out @{" "}
              {player.cashoutMultiplier?.toFixed(
                2
              )}
              x
            </div>

            <div style={{ marginTop: 6 }}>
              Won ₦
              {(
                player.bet +
                player.profit
              ).toFixed(2)}
            </div>
          </div>
        )}

        {status === "CRASHED" &&
          !player.cashedOut && (
            <div style={styles.loss}>
              Lost ₦{player.bet}
            </div>
          )}
      </div>

      {/* CASHOUT BUTTON */}
      <button
        onClick={cashout}
        disabled={
          status !== "RUNNING" ||
          player.cashedOut
        }
        style={{
          ...styles.cashoutButton,
          opacity:
            status !== "RUNNING" ||
            player.cashedOut
              ? 0.5
              : 1
        }}
      >
        {player.cashedOut
          ? "CASHED OUT"
          : `CASH OUT @ ${multiplier.toFixed(
              2
            )}x`}
      </button>

      {/* BACK */}
      <button
        onClick={onBack}
        style={styles.backButton}
      >
        ← Back
      </button>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#020617",
    color: "white",
    padding: 20,
    textAlign: "center",
    overflow: "hidden"
  },

  title: {
    marginBottom: 10
  },

  status: {
    marginBottom: 15,
    opacity: 0.8
  },

  multiplier: {
    fontSize: 56,
    fontWeight: "bold",
    color: "#22c55e",
    marginBottom: 20
  },

  gameArea: {
    position: "relative",
    height: 300,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 20,
    border: "1px solid #1e293b",
    background:
      "linear-gradient(to top, #111827, #0f172a)"
  },

  skyGlow: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(circle at bottom left, rgba(34,197,94,0.15), transparent 60%)",
    zIndex: 0
  },

  cloud1: {
    position: "absolute",
    top: 40,
    fontSize: 34,
    opacity: 0.25,
    transition: "left 0.04s linear",
    zIndex: 1
  },

  cloud2: {
    position: "absolute",
    top: 100,
    fontSize: 26,
    opacity: 0.2,
    transition: "left 0.04s linear",
    zIndex: 1
  },

  svg: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    zIndex: 2
  },

  airplane: {
    position: "absolute",
    bottom: 20,
    left: 20,
    fontSize: 46,
    zIndex: 10,
    transition: "transform 0.04s linear",
    filter:
      "drop-shadow(0 0 12px #22c55e)"
  },

  fire: {
    position: "absolute",
    bottom: 20,
    left: 20,
    fontSize: 20,
    zIndex: 9,
    transition: "transform