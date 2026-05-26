import React, { useState, useEffect } from "react";

const SIZE = 10;
const BASE_MINES = 10;

function createBoard(minesCount) {
  const total = SIZE * SIZE;
  const mineSet = new Set();

  while (mineSet.size < minesCount) {
    mineSet.add(Math.floor(Math.random() * total));
  }

  return Array.from({ length: total }, (_, i) => ({
    isMine: mineSet.has(i),
    revealed: false,
  }));
}

// multiplier grows per safe click
function calcMultiplier(step, difficulty) {
  return 1 + step * (0.08 * difficulty);
}

export default function MineGame() {
  const [multiplierLevel, setMultiplierLevel] = useState(1);
  const [stake, setStake] = useState(100);
  const [board, setBoard] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  const [step, setStep] = useState(0);
  const [currentMultiplier, setCurrentMultiplier] = useState(1);
  const [cashOutValue, setCashOutValue] = useState(0);

  const minesCount = Math.min(BASE_MINES * multiplierLevel, SIZE * SIZE - 1);

  useEffect(() => {
    resetGame();
  }, [multiplierLevel]);

  const resetGame = () => {
    setBoard(createBoard(minesCount));
    setGameOver(false);
    setWon(false);
    setStep(0);
    setCurrentMultiplier(1);
    setCashOutValue(0);
  };

  const revealCell = (index) => {
    if (gameOver || won) return;

    const newBoard = [...board];
    const cell = newBoard[index];

    if (cell.revealed) return;

    cell.revealed = true;

    if (cell.isMine) {
      setGameOver(true);
      setCashOutValue(0);
      return;
    }

    // SAFE TILE HIT → increase step
    const newStep = step + 1;
    setStep(newStep);

    const newMultiplier = calcMultiplier(newStep, multiplierLevel);
    setCurrentMultiplier(newMultiplier);

    setCashOutValue(stake * newMultiplier);

    setBoard(newBoard);
  };

  const cashOut = () => {
    if (gameOver || step === 0) return;
    setWon(true);
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial", color: "#fff", background: "#111", minHeight: "100vh" }}>
      <h2>💣 Mine Game (Stake & Multipliers)</h2>

      {/* STAKE INPUT */}
      <div>
        Stake:
        <input
          type="number"
          value={stake}
          onChange={(e) => setStake(Number(e.target.value))}
          style={{ marginLeft: 10 }}
        />
      </div>

      {/* DIFFICULTY */}
      <div style={{ marginTop: 10 }}>
        Difficulty:
        <input
          type="range"
          min="1"
          max="4"
          value={multiplierLevel}
          onChange={(e) => setMultiplierLevel(Number(e.target.value))}
        />
        <b> {multiplierLevel}x Mines</b>
      </div>

      {/* INFO PANEL */}
      <div style={{ marginTop: 10 }}>
        💰 Current Multiplier: <b>{currentMultiplier.toFixed(2)}x</b> <br />
        💵 Cashout Value: <b>${cashOutValue.toFixed(2)}</b>
      </div>

      {/* ACTIONS */}
      <div style={{ marginTop: 10 }}>
        <button onClick={resetGame}>Restart</button>
        <button onClick={cashOut} style={{ marginLeft: 10 }}>
          Cash Out
        </button>
      </div>

      {/* STATUS */}
      {gameOver && <h3 style={{ color: "red" }}>💥 You hit a mine! Lost stake</h3>}
      {won && <h3 style={{ color: "green" }}>🎉 Cashed out: ${cashOutValue.toFixed(2)}</h3>}

      {/* BOARD */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${SIZE}, 30px)`,
          gap: 2,
          marginTop: 20,
        }}
      >
        {board.map((cell, i) => (
          <div
            key={i}
            onClick={() => revealCell(i)}
            style={{
              width: 30,
              height: 30,
              background: cell.revealed
                ? cell.isMine
                  ? "red"
                  : "#3a3a3a"
                : "#555",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            {cell.revealed ? (cell.isMine ? "💣" : "") : ""}
          </div>
        ))}
      </div>
    </div>
  );
}