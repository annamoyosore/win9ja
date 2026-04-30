import { useState, useRef } from "react";

export default function DiceBattle() {
  const [playerRoll, setPlayerRoll] = useState(null);
  const [botRoll, setBotRoll] = useState(null);
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState("");
  const [phase, setPhase] = useState("idle");

  const audioCtxRef = useRef(null);

  // 🔊 SOUND ENGINE
  const playSound = (type) => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();
    }

    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "roll") {
      osc.frequency.value = 400;
      gain.gain.value = 0.05;
    }

    if (type === "land") {
      osc.frequency.value = 150;
      gain.gain.value = 0.1;
    }

    osc.start();
    setTimeout(() => osc.stop(), type === "roll" ? 400 : 150);
  };

  // 🎯 PSEUDO SERVER RESULT
  const getServerResult = () => {
    const player = Math.floor(Math.random() * 6) + 1;
    const bot = Math.floor(Math.random() * 6) + 1;

    let winner;
    if (player > bot) winner = "PLAYER";
    else if (player < bot) winner = "BOT";
    else winner = "DRAW";

    return { player, bot, winner };
  };

  const rollDice = () => {
    if (rolling) return;

    setRolling(true);
    setPhase("rolling");
    setResult("");

    playSound("roll");

    // 🔐 lock result first
    const { player, bot, winner } = getServerResult();

    // 🎲 fake rolling animation numbers
    let interval = setInterval(() => {
      setPlayerRoll(Math.floor(Math.random() * 6) + 1);
      setBotRoll(Math.floor(Math.random() * 6) + 1);
    }, 100);

    // ⏳ suspense phase
    setTimeout(() => {
      setPhase("slowing");
    }, 1200);

    // 🎯 final result
    setTimeout(() => {
      clearInterval(interval);

      setPlayerRoll(player);
      setBotRoll(bot);

      playSound("land");

      if (winner === "PLAYER") {
        setResult("🎉 You Win!");
      } else if (winner === "BOT") {
        setResult("🤖 Bot Wins!");
      } else {
        setResult("⚖️ Draw!");
      }

      setPhase("result");
      setRolling(false);
    }, 2000);
  };

  // 🎲 Dice faces
  const diceFaces = ["⚀","⚁","⚂","⚃","⚄","⚅"];

  return (
    <>
      <style>{`
        .container {
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: Arial;
          color: white;
          background: linear-gradient(-45deg, #1f4037, #99f2c8);
          background-size: 400% 400%;
          animation: bg 10s ease infinite;
        }

        @keyframes bg {
          0% {background-position: 0% 50%;}
          50% {background-position: 100% 50%;}
          100% {background-position: 0% 50%;}
        }

        .dice-area {
          display: flex;
          gap: 40px;
          margin: 30px 0;
        }

        .dice {
          font-size: 100px;
          transition: transform 0.3s ease;
        }

        .rolling {
          animation: shake 0.3s infinite;
        }

        @keyframes shake {
          0% { transform: rotate(0deg); }
          25% { transform: rotate(10deg); }
          50% { transform: rotate(-10deg); }
          75% { transform: rotate(8deg); }
          100% { transform: rotate(0deg); }
        }

        button {
          padding: 12px 24px;
          border: none;
          border-radius: 25px;
          background: #ff5722;
          color: white;
          font-size: 16px;
          cursor: pointer;
        }

        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .status {
          margin-top: 10px;
          font-size: 14px;
          opacity: 0.8;
        }

        .result {
          margin-top: 20px;
          font-size: 24px;
          animation: fadeIn 0.5s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="container">
        <h2>Dice Battle</h2>

        <div className="dice-area">
          <div className={`dice ${rolling ? "rolling" : ""}`}>
            {playerRoll ? diceFaces[playerRoll - 1] : "🎲"}
          </div>

          <div className={`dice ${rolling ? "rolling" : ""}`}>
            {botRoll ? diceFaces[botRoll - 1] : "🎲"}
          </div>
        </div>

        <button onClick={rollDice} disabled={rolling}>
          {rolling ? "Rolling..." : "Roll Dice"}
        </button>

        {phase === "rolling" && <p className="status">🎲 Rolling...</p>}
        {phase === "slowing" && <p className="status">⏳ Almost there...</p>}

        {playerRoll && botRoll && !rolling && (
          <p className="status">
            🧑 You: {playerRoll} | 🤖 Bot: {botRoll}
          </p>
        )}

        {result && <div className="result">{result}</div>}
      </div>
    </>
  );
}