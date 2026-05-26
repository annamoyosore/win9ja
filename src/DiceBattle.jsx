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
  return 1 + step * (0.2 * difficulty);
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

  // 💣 Increased mines
  // x1 = 4 mines
  // x2 = 8 mines
  // x3 = 12 mines
  // x4 = 16 mines

  const mineMap = {
    1: 4,
    2: 8,
    3: 12,
    4: 16,
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

    // 💣 hit mine
    if (cell.isMine) {
      setGameOver(true);
      revealAllTiles(newBoard);
      setCashout(0);
      return;
    }

    // ✅ safe tile
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
        💣 Mines: <b>{minesCount}</b>
        <br />
        📈 Multiplier: <b>{multi.toFixed(2)}x</b>
        <br />
        💰 Cashout: <b>${cashout.toFixed(2)}</b>
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
          💥 You hit a mine!
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
              borderRadius: 10,
              background: cell.revealed
                ? cell.isMine
                  ? "#ff2b2b"
                  : "#2d2d2d"
                : "#555",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              cursor: "pointer",
              transition: "0.2s",
            }}
          >
            {cell.revealed ? (cell.isMine ? "💣" : "💎") : "?"}
          </div>
        ))}
      </div>
    </div>
  );
}