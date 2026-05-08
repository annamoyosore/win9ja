import { useEffect, useRef, useState } from "react";

export default function CrashGameRoomDemo({ players = [], onBack }) {
  const [multiplier, setMultiplier] = useState(1.0);
  const [crashed, setCrashed] = useState(false);
  const [cashedOut, setCashedOut] = useState(false);

  const [cashoutValue, setCashoutValue] = useState(null);
  const [rocketY, setRocketY] = useState(0);

  // 💵 BET SYSTEM
  const [bet, setBet] = useState(1000); // default ₦1000
  const [profit, setProfit] = useState(0);

  const intervalRef = useRef(null);
  const crashPointRef = useRef(null);

  // 🎯 START ROUND
  function startRound() {
    setMultiplier(1.0);
    setCrashed(false);
    setCashedOut(false);
    setCashoutValue(null);
    setRocketY(0);
    setProfit(0);

    crashPointRef.current = +(3.5 + Math.random() * 3).toFixed(2);

    intervalRef.current = setInterval(() => {
      setMultiplier((m) => {
        const next = +(m + 0.05).toFixed(2);

        setRocketY((y) => y + 4);

        // 📈 LIVE PROFIT CALCULATION
        const liveProfit = (bet * next) - bet;
        setProfit(liveProfit > 0 ? liveProfit : 0);

        // 💥 CRASH
        if (next >= crashPointRef.current) {
          clearInterval(intervalRef.current);
          setCrashed(true);
        }

        return next;
      });
    }, 120);
  }

  // 🚀 INIT
  useEffect(() => {
    startRound();
    return () => clearInterval(intervalRef.current);
  }, []);

  // 💰 CASHOUT
  function cashout() {
    if (crashed || cashedOut) return;

    setCashedOut(true);
    setCashoutValue(multiplier);

    const finalProfit = (bet * multiplier) - bet;
    setProfit(finalProfit);
  }

  // 🔁 RESTART AFTER CRASH
  useEffect(() => {
    if (!crashed) return;

    const t = setTimeout(() => startRound(), 2500);
    return () => clearTimeout(t);
  }, [crashed]);

  return (
    <div style={styles.container}>

      <h2>🚀 CRASH GAME ROOM</h2>

      {/* 💵 BET INPUT */}
      <div style={{ marginBottom: 10 }}>
        <input
          type="number"
          value={bet}
          onChange={(e) => setBet(Number(e.target.value))}
          style={styles.input}
          min={100}
        />
        <div style={{ fontSize: 12, opacity: 0.7 }}>
          Bet Amount (₦)
        </div>
      </div>

      {/* MULTIPLIER */}
      <div style={styles.multiplier}>
        {crashed ? (
          <span style={{ color: "red" }}>
            💥 CRASHED @ {multiplier.toFixed(2)}x
          </span>
        ) : (
          <span style={{ color: "lime" }}>
            {multiplier.toFixed(2)}x
          </span>
        )}
      </div>

      {/* 🚀 ROCKET */}
      <div
        style={{
          ...styles.rocket,
          transform: `translateY(-${rocketY}px)`
        }}
      >
        🚀
      </div>

      {/* 📈 LIVE PROFIT */}
      <div style={styles.profitBox}>
        <div>Bet: ₦{bet}</div>
        <div style={{ color: profit >= 0 ? "lime" : "red" }}>
          Live Profit: ₦{profit.toFixed(2)}
        </div>
      </div>

      {/* PLAYERS */}
      <div style={styles.panel}>
        <h3>👥 Players</h3>
        {players.map((p) => (
          <div key={p.id}>
            {p.name} — ₦{p.stake}
          </div>
        ))}
      </div>

      {/* CASHOUT */}
      <button
        onClick={cashout}
        disabled={crashed || cashedOut}
        style={styles.button}
      >
        {cashedOut
          ? `CASHED OUT @ ${cashoutValue}x (+₦${profit.toFixed(0)})`
          : "CASH OUT"}
      </button>

      {/* RESULT */}
      {crashed && !cashedOut && (
        <div style={{ color: "red", marginTop: 10 }}>
          You lost ₦{bet} 💔
        </div>
      )}

      {cashedOut && (
        <div style={{ color: "gold", marginTop: 10 }}>
          🎉 Won ₦{profit.toFixed(2)}
        </div>
      )}

      <button onClick={onBack} style={{ marginTop: 20 }}>
        ← Back to Lobby
      </button>
    </div>
  );
}