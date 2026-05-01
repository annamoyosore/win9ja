import { useState, useRef } from "react";

export default function BottleGame() {
  const [playerChoice, setPlayerChoice] = useState(null);
  const [botChoice, setBotChoice] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState("");
  const [phase, setPhase] = useState("idle");

  const [playerScore, setPlayerScore] = useState(0);
  const [botScore, setBotScore] = useState(0);
  const [round, setRound] = useState(1);

  const audioCtxRef = useRef(null);

  // 🔊 SOUND
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

    if (type === "spin") {
      osc.frequency.value = 350;
      gain.gain.value = 0.05;
    }

    if (type === "win") {
      osc.frequency.value = 600;
      gain.gain.value = 0.1;
    }

    if (type === "lose") {
      osc.frequency.value = 150;
      gain.gain.value = 0.1;
    }

    osc.start();
    setTimeout(() => osc.stop(), 200);
  };

  // 🎯 2-WAY RESULT
  const getResult = (playerChoice) => {
    const outcome = Math.random() < 0.5 ? "HEAD" : "BOTTOM";
    const botChoice = playerChoice === "HEAD" ? "BOTTOM" : "HEAD";

    let winner = outcome === playerChoice ? "USER" : "BOT";

    return { outcome, winner, botChoice };
  };

  const choose = (choice) => {
    if (spinning) return;
    setPlayerChoice(choice);
    setResult("");
  };

  const resetGame = () => {
    setPlayerScore(0);
    setBotScore(0);
    setRound(1);
    setResult("");
  };

  const spin = () => {
    if (spinning) return;

    if (!playerChoice) {
      setResult("⚠️ Choose Head or Bottom first");
      return;
    }

    setSpinning(true);
    setPhase("spinning");
    setResult("");

    playSound("spin");

    const { outcome, winner, botChoice } = getResult(playerChoice);
    setBotChoice(botChoice);

    let targetAngle =
      outcome === "HEAD"
        ? Math.random() * 150 + 10
        : Math.random() * 150 + 180;

    const spinBase = Math.floor(Math.random() * 720) + 1080;
    const finalRotation = spinBase + targetAngle;

    setRotation(finalRotation);

    setTimeout(() => setPhase("slowing"), 1400);

    setTimeout(() => {
      let newPlayerScore = playerScore;
      let newBotScore = botScore;

      if (winner === "USER") {
        newPlayerScore++;
        playSound("win");
        setResult("🎉 You Win Round!");
      } else {
        newBotScore++;
        playSound("lose");
        setResult("🤖 Bot Wins Round!");
      }

      setPlayerScore(newPlayerScore);
      setBotScore(newBotScore);

      // 🏆 Check final winner
      if (newPlayerScore === 2 || newBotScore === 2) {
        setTimeout(() => {
          if (newPlayerScore === 2) {
            setResult("🏆 You Won The Match!");
          } else {
            setResult("💀 Bot Won The Match!");
          }
        }, 300);
      } else {
        setRound((r) => r + 1);
      }

      setPhase("result");
      setSpinning(false);
    }, 2200);
  };

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
          position: relative;
          overflow: hidden;

          background: linear-gradient(-45deg, #0f2027, #203a43, #2c5364, #1e3c72);
          background-size: 400% 400%;
          animation: bg 12s ease infinite;
        }

        @keyframes bg {
          0% {background-position: 0% 50%;}
          50% {background-position: 100% 50%;}
          100% {background-position: 0% 50%;}
        }

        /* ✨ floating glow circles */
        .bg-glow {
          position: absolute;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,255,255,0.1), transparent);
          animation: float 10s infinite alternate;
        }

        .bg-glow:nth-child(1) { top: 10%; left: 10%; }
        .bg-glow:nth-child(2) { bottom: 10%; right: 10%; animation-duration: 14s; }

        @keyframes float {
          from { transform: translateY(0px); }
          to { transform: translateY(-40px); }
        }

        .score {
          position: absolute;
          top: 15px;
          font-size: 16px;
        }

        .controls button {
          margin: 8px;
          padding: 12px 22px;
          border-radius: 25px;
          border: none;
          font-weight: bold;
          cursor: pointer;
          opacity: 0.7;
        }

        .controls .active {
          opacity: 1;
          transform: scale(1.1);
          box-shadow: 0 0 10px white;
        }

        .head { background: #4caf50; }
        .bottom { background: #2196f3; }

        .spin {
          background: #ff5722;
          padding: 12px 28px;
          margin-top: 10px;
        }

        .bottle {
          font-size: 120px;
          transition: transform 2.2s cubic-bezier(0.25,1,0.5,1);
        }

        .bounce {
          animation: bounce 0.4s ease;
        }

        @keyframes bounce {
          0% { transform: scale(1) rotate(var(--rot)); }
          50% { transform: scale(1.3) rotate(var(--rot)); }
          100% { transform: scale(1) rotate(var(--rot)); }
        }

        .result {
          margin-top: 15px;
          font-size: 22px;
        }
      `}</style>

      <div className="container">
        <div className="bg-glow"></div>
        <div className="bg-glow"></div>

        <div className="score">
          Round {round} | 🧑 {playerScore} - {botScore} 🤖
        </div>

        <h2>Bottle Flip (Best of 3)</h2>

        <div className="controls">
          <button
            className={`head ${playerChoice === "HEAD" ? "active" : ""}`}
            onClick={() => choose("HEAD")}
          >
            Head
          </button>
          <button
            className={`bottom ${playerChoice === "BOTTOM" ? "active" : ""}`}
            onClick={() => choose("BOTTOM")}
          >
            Bottom
          </button>
        </div>

        <div
          className={`bottle ${phase === "result" ? "bounce" : ""}`}
          style={{ transform: `rotate(${rotation}deg)`, "--rot": `${rotation}deg` }}
        >
          🍾
        </div>

        <button className="spin" onClick={spin} disabled={spinning}>
          {spinning ? "Spinning..." : "Flip Bottle"}
        </button>

        {result && <div className="result">{result}</div>}

        {(playerScore === 2 || botScore === 2) && (
          <button onClick={resetGame} style={{ marginTop: "10px" }}>
            🔄 Play Again
          </button>
        )}
      </div>
    </>
  );
}