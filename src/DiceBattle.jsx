import React, { useState, useEffect } from "react";

const SIZE = 5; // 5x5 = 25 tiles (small board)
const BASE_MINES = 2;

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
  return 1 + step * (0.15 * difficulty);
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

  // up to 20 mines max
  const minesCount = Math.min(BASE_MINES * difficulty * 2, 20);

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

  // reveal every tile
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

    // 💣 MINE HIT
    if (cell.isMine) {
      setGameOver(true);

      // reveal all tiles
      revealAllTiles(newBoard);

      setCashout(0);
      return;
    }

    // SAFE TILE
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

    // reveal all after cashout
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
      <h2>💣 Mini Mine Game</h2>

      {/* stake */}
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

      {/* difficulty */}
      <div style={{ marginBottom: 15 }}>
        Difficulty:
        <input
          type="range"
          min="1"
          max="4"
          value={difficulty}
          onChange={(e) => setDifficulty(Number(e.target.value))}
        />
        <b> {difficulty}x</b>
      </div>

      {/* info */}
      <div style={{ marginBottom: 15 }}>
        💣 Mines: <b>{minesCount}</b>
        <br />
        📈 Multiplier: <b>{multi.toFixed(2)}x</b>
        <br />
        💰 Cashout: <b>${cashout.toFixed(2)}</b>
      </div>

      {/* buttons */}
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

      {/* status */}
      {gameOver && (
        <h3 style={{ color: "red" }}>
          💥 Mine Hit! All tiles revealed
        </h3>
      )}

      {won && (
        <h3 style={{ color: "lime" }}>
          🎉 Cashed Out: ${cashout.toFixed(2)}
        </h3>
      )}

      {/* board */}
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