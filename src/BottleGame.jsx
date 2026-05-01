import { useState, useRef } from "react";

export default function BottleGame() {
  const [playerChoice, setPlayerChoice] = useState(null);
  const [botChoice, setBotChoice] = useState(null);

  const [playerScore, setPlayerScore] = useState(0);
  const [botScore, setBotScore] = useState(0);
  const [round, setRound] = useState(1);

  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState("");
  const [gameOver, setGameOver] = useState(false);

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

    if (type === "spin") osc.frequency.value = 300;
    if (type === "win") osc.frequency.value = 600;
    if (type === "lose") osc.frequency.value = 150;

    gain.gain.value = 0.08;
    osc.start();
    setTimeout(() => osc.stop(), 150);
  };

  // 🎯 RESULT
  const getOutcome = () => (Math.random() < 0.5 ? "HEAD" : "BOTTOM");

  const choose = (choice) => {
    if (spinning || gameOver) return;
    setPlayerChoice(choice);
    setResult("");
  };

  const spin = () => {
    if (spinning || gameOver) return;

    if (!playerChoice) {
      setResult("⚠️ Choose Head or Bottom first");
      return;
    }

    setSpinning(true);
    setResult("");

    playSound("spin");

    // 🔐 lock outcomes
    const outcome = getOutcome();
    const botPick = Math.random() < 0.5 ? "HEAD" : "BOTTOM";
    setBotChoice(botPick);

    let targetAngle =
      outcome === "HEAD"
        ? Math.random() * 150 + 10
        : Math.random() * 150 + 180;

    const finalRotation =
      Math.floor(Math.random() * 720) + 1080 + targetAngle;

    setRotation(finalRotation);

    setTimeout(() => {
      let newPlayerScore = playerScore;
      let newBotScore = botScore;

      if (outcome === playerChoice) {
        newPlayerScore++;
        setPlayerScore(newPlayerScore);
        setResult("🎉 You scored!");
        playSound("win");
      } else if (outcome === botPick) {
        newBotScore++;
        setBotScore(newBotScore);
        setResult("🤖 Bot scored!");
        playSound("lose");
      } else {
        setResult("⚖️ No point this round");
      }

      setSpinning(false);

      // 🔄 Next round or end
      setTimeout(() => {
        if (round === 3) {
          if (newPlayerScore > newBotScore) {
            setResult("🏆 You Win The Game!");
          } else if (newBotScore > newPlayerScore) {
            setResult("💀 Bot Wins The Game!");
          } else {
            setResult("🤝 Draw Game!");
          }
          setGameOver(true);
        } else {
          setRound((r) => r + 1);
          setPlayerChoice(null);
        }
      }, 800);
    }, 2000);
  };

  const resetGame = () => {
    setPlayerScore(0);
    setBotScore(0);
    setRound(1);
    setGameOver(false);
    setResult("");
    setPlayerChoice(null);
    setBotChoice(null);
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
          background: linear-gradient(-45deg, #141e30, #243b55);
          background-size: 400% 400%;
          animation: bg 10s ease infinite;
        }

        @keyframes bg {
          0% {background-position: 0% 50%;}
          50% {background-position: 100% 50%;}
          100% {background-position: 0% 50%;}
        }

        .controls button {
          margin: 8px;
          padding: 12px 22px;
          border-radius: 25px;
          border: none;
          cursor: pointer;
        }

        .active {
          transform: scale(1.1);
          box-shadow: 0 0 10px white;
        }

        .bottle {
          font-size: 120px;
          transition: transform 2s ease;
        }

        .result {
          margin-top: 15px;
          font-size: 22px;
        }
      `}</style>

      <div className="container">
        <h2>Bottle Flip (3 Rounds)</h2>

        <div>
          Round {round}/3 | 🧑 {playerScore} - {botScore} 🤖
        </div>

        <div className="controls">
          <button
            className={playerChoice === "HEAD" ? "active" : ""}
            onClick={() => choose("HEAD")}
          >
            Head
          </button>

          <button
            className={playerChoice === "BOTTOM" ? "active" : ""}
            onClick={() => choose("BOTTOM")}
          >
            Bottom
          </button>
        </div>

        <div
          className="bottle"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          🍾
        </div>

        <button onClick={spin} disabled={spinning}>
          {spinning ? "Flipping..." : "Flip"}
        </button>

        <div className="result">{result}</div>

        {gameOver && (
          <button onClick={resetGame}>🔄 Play Again</button>
        )}
      </div>
    </>
  );
}