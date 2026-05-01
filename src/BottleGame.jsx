import { useState, useRef } from "react";

export default function FreeWillBottleGame() {
  const [round, setRound] = useState(1);
  const [playerScore, setPlayerScore] = useState(0);
  const [botScore, setBotScore] = useState(0);

  const [playerResult, setPlayerResult] = useState(null);
  const [botResult, setBotResult] = useState(null);

  const [rotationPlayer, setRotationPlayer] = useState(0);
  const [rotationBot, setRotationBot] = useState(0);

  const [spinning, setSpinning] = useState(false);
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

  // 🎯 RANDOM OUTCOME
  const getOutcome = () => (Math.random() < 0.5 ? "HEAD" : "BOTTOM");

  const spin = () => {
    if (spinning || gameOver) return;

    setSpinning(true);
    setResult("");

    playSound("spin");

    const playerFlip = getOutcome();
    const botFlip = getOutcome();

    setPlayerResult(playerFlip);
    setBotResult(botFlip);

    // 🎯 rotation zones
    const getAngle = (outcome) =>
      outcome === "HEAD"
        ? Math.random() * 150 + 10
        : Math.random() * 150 + 180;

    setRotationPlayer(Math.floor(Math.random() * 720) + 1080 + getAngle(playerFlip));
    setRotationBot(Math.floor(Math.random() * 720) + 1080 + getAngle(botFlip));

    setTimeout(() => {
      let newPlayerScore = playerScore;
      let newBotScore = botScore;

      // 🧠 RULE: HEAD beats BOTTOM
      if (playerFlip === botFlip) {
        setResult("⚖️ Draw Round");
      } else if (playerFlip === "HEAD") {
        newPlayerScore++;
        setPlayerScore(newPlayerScore);
        setResult("🎉 You Win Round!");
        playSound("win");
      } else {
        newBotScore++;
        setBotScore(newBotScore);
        setResult("🤖 Bot Wins Round!");
        playSound("lose");
      }

      setSpinning(false);

      // 🔚 End after 3 rounds
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
        }
      }, 800);
    }, 2000);
  };

  const resetGame = () => {
    setRound(1);
    setPlayerScore(0);
    setBotScore(0);
    setGameOver(false);
    setResult("");
    setPlayerResult(null);
    setBotResult(null);
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
          color: white;
          font-family: Arial;
          background: linear-gradient(-45deg, #0f2027, #203a43, #2c5364);
          background-size: 400% 400%;
          animation: bg 10s ease infinite;
        }

        @keyframes bg {
          0% {background-position: 0% 50%;}
          50% {background-position: 100% 50%;}
          100% {background-position: 0% 50%;}
        }

        .arena {
          display: flex;
          gap: 60px;
          margin: 20px;
        }

        .bottle {
          font-size: 100px;
          transition: transform 2s ease;
        }

        .label {
          text-align: center;
          margin-top: 5px;
        }

        button {
          padding: 12px 25px;
          border-radius: 25px;
          border: none;
          cursor: pointer;
          margin-top: 10px;
        }

        .result {
          margin-top: 15px;
          font-size: 22px;
        }
      `}</style>

      <div className="container">
        <h2>Free Will Bottle (No Choice)</h2>

        <div>
          Round {round}/3 | 🧑 {playerScore} - {botScore} 🤖
        </div>

        <div className="arena">
          <div>
            <div
              className="bottle"
              style={{ transform: `rotate(${rotationPlayer}deg)` }}
            >
              🍾
            </div>
            <div className="label">You: {playerResult || "?"}</div>
          </div>

          <div>
            <div
              className="bottle"
              style={{ transform: `rotate(${rotationBot}deg)` }}
            >
              🍾
            </div>
            <div className="label">Bot: {botResult || "?"}</div>
          </div>
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