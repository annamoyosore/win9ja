import React, { useState, useEffect } from "react";

const SIZE = 10; // 10x10 board
const BASE_MINES = 10;

function createBoard(minesCount) {
  const totalCells = SIZE * SIZE;
  const minePositions = new Set();

  while (minePositions.size < minesCount) {
    minePositions.add(Math.floor(Math.random() * totalCells));
  }

  return Array.from({ length: totalCells }, (_, i) => ({
    isMine: minePositions.has(i),
    revealed: false,
    flagged: false,
  }));
}

export default function MineGame() {
  const [multiplier, setMultiplier] = useState(1);
  const [board, setBoard] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  const minesCount = Math.min(BASE_MINES * multiplier, SIZE * SIZE - 1);

  useEffect(() => {
    resetGame();
  }, [multiplier]);

  const resetGame = () => {
    setBoard(createBoard(minesCount));
    setGameOver(false);
    setWon(false);
  };

  const revealCell = (index) => {
    if (gameOver || won) return;

    const newBoard = [...board];
    const cell = newBoard[index];

    if (cell.revealed) return;

    cell.revealed = true;

    if (cell.isMine) {
      setGameOver(true);
      revealAllMines(newBoard);
    } else {
      checkWin(newBoard);
    }

    setBoard(newBoard);
  };

  const revealAllMines = (b) => {
    b.forEach((cell) => {
      if (cell.isMine) cell.revealed = true;
    });
  };

  const checkWin = (b) => {
    const safeCells = b.filter((c) => !c.isMine);
    const revealedSafe = safeCells.filter((c) => c.revealed);

    if (revealedSafe.length === safeCells.length) {
      setWon(true);
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h2>💣 Mine Game</h2>

      <div style={{ marginBottom: 10 }}>
        Difficulty (1x - 4x):
        <input
          type="range"
          min="1"
          max="4"
          step="1"
          value={multiplier}
          onChange={(e) => setMultiplier(Number(e.target.value))}
        />
        <b> {multiplier}x</b>
      </div>

      <div style={{ marginBottom: 10 }}>
        Mines: <b>{minesCount}</b>
      </div>

      <button onClick={resetGame}>Restart Game</button>

      {gameOver && <h3 style={{ color: "red" }}>💥 Game Over!</h3>}
      {won && <h3 style={{ color: "green" }}>🎉 You Win!</h3>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${SIZE}, 30px)`,
          marginTop: 20,
          gap: 2,
        }}
      >
        {board.map((cell, i) => (
          <div
            key={i}
            onClick={() => revealCell(i)}
            style={{
              width: 30,
              height: 30,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              background: cell.revealed
                ? cell.isMine
                  ? "red"
                  : "#ccc"
                : "#444",
              color: "black",
              fontWeight: "bold",
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            {cell.revealed ? (cell.isMine ? "💣" : "") : ""}
          </div>
        ))}
      </div>
    </div>
  );
}