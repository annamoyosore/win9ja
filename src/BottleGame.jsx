import { useState, useRef } from "react";

export default function BottleGame() {
  const [playerChoice, setPlayerChoice] = useState(null);
  const [botChoice, setBotChoice] = useState(null);

  const [turn, setTurn] = useState("PLAYER"); // PLAYER | BOT
  const [countdown, setCountdown] = useState(null);

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

    if (type === "tick") osc.frequency.value = 800;
    if (type === "spin") osc.frequency.value = 300;
    if (type === "win") osc.frequency.value = 600;
    if (type === "lose") osc.frequency.value = 150;

    gain.gain.value = 0.08;
    osc.start();
    setTimeout(() => osc.stop(), 120);
  };

  // 🎯 RESULT
  const getResult = (choice) => {
    const outcome = Math.random() < 0.5 ? "HEAD" : "BOTTOM";
    const winner = outcome === choice ? "PLAYER" : "BOT";
    return { outcome, winner };
  };

  // 🧑 PLAYER CHOOSES → start countdown
  const choose = (choice) => {
    if (spinning || turn !== "PLAYER") return;

    setPlayerChoice(choice);
    setResult("");

    startCountdown(() => {
      spin("PLAYER", choice);
    });
  };

  // ⏳ COUNTDOWN
  const startCountdown = (callback) => {
    let count = 3;
    setCountdown(count);

    const interval = setInterval(() => {
      playSound("tick");
      count--;

      if (count === 0) {
        clearInterval(interval);
        setCountdown(null);
        callback();
      } else {
        setCountdown(count);
      }
    }, 700);
  };

  // 🎯 SPIN LOGIC
  const spin = (who, choice) => {
    setSpinning(true);
    setPhase("spinning");
    playSound("spin");

    const { outcome, winner } = getResult(choice);

    let targetAngle =
      outcome === "HEAD"
        ? Math.random() * 150 + 10
        : Math.random() * 150 + 180;

    const spinBase = Math.floor(Math.random() * 720) + 1080;
    const finalRotation = spinBase + targetAngle;

    setRotation(finalRotation);

    setTimeout(() => setPhase("slowing"), 1200);

    setTimeout(() => {
      if (winner === "PLAYER") {
        setPlayerScore((p) => p + 1);
        setResult("🎉 You Win Round!");
        playSound("win");
      } else {
        setBotScore((b) => b + 1);
        setResult("🤖 Bot Wins Round!");
        playSound("lose");
      }

      setSpinning(false);
      setPhase("result");

      // 🔄 Switch turn
      setTimeout(() => {
        if (playerScore + (winner === "PLAYER" ? 1 : 0) === 2) {
          setResult("🏆 You Won Match!");
        } else if (botScore + (winner === "BOT" ? 1 : 0) === 2) {
          setResult("💀 Bot Won Match!");
        } else {
          setRound((r) => r + 1);
          setTurn("BOT");
          botTurn();
        }
      }, 600);
    }, 2000);
  };

  // 🤖 BOT TURN
  const botTurn = () => {
    setBotChoice(Math.random() < 0.5 ? "HEAD" : "BOTTOM");

    startCountdown(() => {
      spin("BOT", botChoice || "HEAD");
      setTurn("PLAYER");
    });
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
          background: linear-gradient(-45deg, #0f2027, #203a43, #2c5364);
          background-size: 400% 400%;
          animation: bg 12s ease infinite;
        }

        @keyframes bg {
          0% {background-position: 0% 50%;}
          50% {background-position: 100% 50%;}
          100% {background-position: 0% 50%;}
        }

        .turn {
          margin-bottom: 10px;
          font-size: 14px;
          opacity: 0.8;
        }

        .controls button {
          margin: 8px;
          padding: 12px 22px;
          border-radius: 25px;
          border: none;
          cursor: pointer;
        }

        .disabled {
          opacity: 0.4;
          pointer-events: none;
        }

        .bottle {
          font-size: 120px;
          transition: transform 2s cubic-bezier(0.25,1,0.5,1);
        }

        .countdown {
          font-size: 40px;
          margin: 10px;
        }

        .result {
          margin-top: 15px;
          font-size: 22px;
        }
      `}</style>

      <div className="container">
        <h2>Bottle Flip (Turn System)</h2>

        <div className="turn">
          {turn === "PLAYER" ? "🧑 Your Turn" : "🤖 Bot Turn (wait...)"}
        </div>

        <div className="controls">
          <button
            className={turn !== "PLAYER" ? "disabled" : ""}
            onClick={() => choose("HEAD")}
          >
            Head
          </button>

          <button
            className={turn !== "PLAYER" ? "disabled" : ""}
            onClick={() => choose("BOTTOM")}
          >
            Bottom
          </button>
        </div>

        {countdown && <div className="countdown">{countdown}</div>}

        <div
          className="bottle"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          🍾
        </div>

        <div className="result">{result}</div>

        <div>
          Round {round} | 🧑 {playerScore} - {botScore} 🤖
        </div>
      </div>
    </>
  );
}