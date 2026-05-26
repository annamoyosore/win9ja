import React, { useState, useEffect } from "react";

const SIZE = 5; // 5x5 board = 25 tiles

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

function calcMultiplier(step, difficulty) {
  return 1 + step * (0.25 * difficulty);
}

export default function MineGame() {
  const [difficulty, setDifficulty] = useState(1);
  const [stake, setStake] = useState(100);

  const [board, setBoard] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  const [step, setStep] = useState(0);
  const [multi, setMulti] = useState(1);
  const [cashout, setCashout] = useState(0);

  // 💣 NEW BOMB SETTINGS
  // x1 = 8 bombs
  // x2 = 12 bombs
  // x3 = 16 bombs
  // x4 = 20 bombs

  const mineMap = {
    1: 8,
    2: 12,
    3: 16,
    4: 20,
  };

  const minesCount = mineMap[difficulty];

  useEffect(() => {
    resetGame();
  }, [difficulty]);

  const resetGame = () => {
    setBoard(createBoard(minesCount));
    setGameOver(false);
    setWon(false);
    setStep(0);
    setMulti(1);
    setCashout(0);
  };

  // reveal all tiles
  const revealAllTiles = (newBoard) => {
    const updated = newBoard.map((cell) => ({
      ...cell,
      revealed: true,
    }));

    setBoard(updated);
  };

  const revealCell = (index) => {
    if (gameOver || won) return;

    const newBoard = [...board];
    const cell = newBoard[index];

    if (cell.revealed) return;

    cell.revealed = true;

    // 💥 Mine hit
    if (cell.isMine) {
      setGameOver(true);
      revealAllTiles(newBoard);
      setCashout(0);
      return;
    }

    // ✅ Safe tile
    const newStep = step + 1;
    const newMultiplier = calcMultiplier(newStep, difficulty);

    setStep(newStep);
    setMulti(newMultiplier);

    setCashout(stake * newMultiplier);

    setBoard(newBoard);
  };

  const cashOutNow = () => {
    if (gameOver || step === 0) return;

    setWon(true);
    revealAllTiles(board);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#111",
        color: "white",
        fontFamily: "Arial",
        padding: 20,
        textAlign: "center",
      }}
    >
      <h2>💣 Mine Betting Game</h2>

      {/* Stake */}
      <div style={{ marginBottom: 10 }}>
        Stake:
        <input
          type="number"
          value={stake}
          onChange={(e) => setStake(Number(e.target.value))}
          style={{
            marginLeft: 10,
            padding: 5,
            width: 100,
          }}
        />
      </div>

      {/* Difficulty */}
      <div style={{ marginBottom: 15 }}>
        Difficulty:
        <input
          type="range"
          min="1"
          max="4"
          value={difficulty}
          onChange={(e) => setDifficulty(Number(e.target.value))}
        />
        <b> x{difficulty}</b>
      </div>

      {/* Info */}
      <div style={{ marginBottom: 15 }}>
        💣 Bombs: <b>{minesCount}</b>
        <br />
        📈 Multiplier: <b>{multi.toFixed(2)}x</b>
        <br />
        💰 Cashout Value: <b>${cashout.toFixed(2)}</b>
      </div>

      {/* Buttons */}
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={resetGame}
          style={{
            padding: "8px 15px",
            marginRight: 10,
            cursor: "pointer",
          }}
        >
          Restart
        </button>

        <button
          onClick={cashOutNow}
          style={{
            padding: "8px 15px",
            cursor: "pointer",
          }}
        >
          Cash Out
        </button>
      </div>

      {/* Status */}
      {gameOver && (
        <h3 style={{ color: "red" }}>
          💥 BOOM! You lost your stake
        </h3>
      )}

      {won && (
        <h3 style={{ color: "lime" }}>
          🎉 Cashed Out: ${cashout.toFixed(2)}
        </h3>
      )}

      {/* Board */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${SIZE}, 55px)`,
          justifyContent: "center",
          gap: 6,
        }}
      >
        {board.map((cell, i) => (
          <div
            key={i}
            onClick={() => revealCell(i)}
            style={{
              width: 55,
              height: 55,
              borderRadius: 12,
              background: cell.revealed
                ? cell.isMine
                  ? "#ff2b2b"
                  : "#2d2d2d"
                : "#555",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              cursor: "pointer",
              transition: "0.2s",
              boxShadow: cell.revealed
                ? "0 0 5px rgba(255,255,255,0.2)"
                : "none",
            }}
          >
            {cell.revealed ? (cell.isMine ? "💣" : "💎") : "?"}
          </div>
        ))}
      </div>
    </div>
  );
}