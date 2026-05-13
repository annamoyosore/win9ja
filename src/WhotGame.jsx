import React, { useRef, useState, useEffect } from "react";

export default function Horse() {
  const horses = [
    { id: 1, name: "Thunder", color: "#facc15" },
    { id: 2, name: "Blaze", color: "#ef4444" },
    { id: 3, name: "Storm", color: "#3b82f6" },
    { id: 4, name: "Rocket", color: "#22c55e" },
  ];

  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const raceRef = useRef(null);
  const countdownRef = useRef(null);

  const [positions, setPositions] = useState({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
  });

  const [selectedHorse, setSelectedHorse] = useState(null);
  const [raceStarted, setRaceStarted] = useState(false);
  const [winner, setWinner] = useState(null);
  const [countdown, setCountdown] = useState(5);
  const [balance, setBalance] = useState(1000);
  const [betAmount, setBetAmount] = useState(100);
  const [message, setMessage] = useState(
    "Pick a horse and start the race."
  );

  // 🎨 DRAW CANVAS HORSES
  const draw = (ctx, pos) => {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    ctx.clearRect(0, 0, width, height);

    // track lines
    ctx.fillStyle = "#064e3b";
    ctx.fillRect(0, 0, width, height);

    horses.forEach((h, index) => {
      const y = 60 + index * 80;

      // lane
      ctx.fillStyle = "rgba(255,255,255,0.1)";
      ctx.fillRect(0, y - 30, width, 60);

      // horse body (circle)
      ctx.beginPath();
      ctx.fillStyle = h.color;
      ctx.arc(pos[h.id], y, 18, 0, Math.PI * 2);
      ctx.fill();

      // name
      ctx.fillStyle = "white";
      ctx.font = "14px Arial";
      ctx.fillText(h.name, pos[h.id] - 20, y - 25);

      // finish line
      ctx.fillStyle = "white";
      ctx.fillRect(width - 10, 0, 5, height);
    });
  };

  // 🎬 ANIMATION LOOP
  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    draw(ctx, positions);

    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    animate();
    return () => cancelAnimationFrame(animationRef.current);
  }, [positions]);

  const resetRace = () => {
    clearInterval(raceRef.current);
    clearInterval(countdownRef.current);

    setPositions({
      1: 0,
      2: 0,
      3: 0,
      4: 0,
    });

    setWinner(null);
    setRaceStarted(false);
    setCountdown(5);
    setMessage("Pick a horse and start the race.");
  };

  const startRace = () => {
    if (!selectedHorse) return alert("Select a horse first");
    if (betAmount > balance) return alert("Insufficient balance");

    setBalance((p) => p - betAmount);

    let c = 5;
    setCountdown(c);

    countdownRef.current = setInterval(() => {
      c -= 1;
      setCountdown(c);

      if (c <= 0) {
        clearInterval(countdownRef.current);
        beginRace();
      }
    }, 1000);
  };

  const beginRace = () => {
    setRaceStarted(true);
    setMessage("🏇 Race in progress...");

    raceRef.current = setInterval(() => {
      setPositions((prev) => {
        const updated = { ...prev };

        horses.forEach((h) => {
          updated[h.id] += Math.random() * 3;
        });

        const win = horses.find((h) => updated[h.id] >= 100);

        if (win) {
          clearInterval(raceRef.current);
          setWinner(win);
          setRaceStarted(false);

          if (selectedHorse === win.id) {
            const payout = betAmount * 3;
            setBalance((p) => p + payout);
            setMessage(`🎉 You won ₦${payout}`);
          } else {
            setMessage(`😢 ${win.name} won the race`);
          }
        }

        return updated;
      });
    }, 50);
  };

  return (
    <div className="min-h-screen bg-green-900 text-white p-4">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-4xl font-bold text-center mb-5">
          🏇 Canvas Horse Racing
        </h1>

        {/* CONTROL */}
        <div className="bg-black/30 p-4 rounded-3xl flex justify-between items-center flex-wrap gap-4">
          <div>
            <p>Balance</p>
            <h2 className="text-3xl font-bold">₦{balance}</h2>
          </div>

          <input
            type="number"
            value={betAmount}
            onChange={(e) =>
              setBetAmount(Number(e.target.value))
            }
            className="bg-gray-800 px-4 py-3 rounded-2xl w-40"
          />

          <button
            onClick={resetRace}
            className="bg-red-500 px-5 py-3 rounded-2xl font-bold"
          >
            Reset
          </button>
        </div>

        {/* SELECT */}
        {!raceStarted && !winner && (
          <div className="bg-black/30 p-5 rounded-3xl mt-6">
            <h2 className="mb-4">Select Horse</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {horses.map((h) => (
                <button
                  key={h.id}
                  onClick={() => setSelectedHorse(h.id)}
                  className={`p-4 rounded-2xl ${
                    selectedHorse === h.id
                      ? "bg-yellow-500 text-black"
                      : "bg-gray-800"
                  }`}
                >
                  {h.name}
                </button>
              ))}
            </div>

            <button
              onClick={startRace}
              className="mt-5 w-full bg-blue-500 py-4 rounded-2xl font-bold"
            >
              Start Race
            </button>
          </div>
        )}

        {/* COUNTDOWN */}
        {countdown > 0 &&
          !raceStarted &&
          !winner &&
          countdown !== 5 && (
            <div className="text-center text-7xl font-bold">
              {countdown}
            </div>
          )}

        {/* CANVAS TRACK */}
        <div className="mt-6 bg-black/30 p-4 rounded-3xl">
          <canvas
            ref={canvasRef}
            width={800}
            height={400}
            style={{
              width: "100%",
              height: "400px",
              borderRadius: "20px",
            }}
          />
        </div>

        {/* STATUS */}
        <div className="mt-6 text-center">
          <p className="text-2xl font-bold">{message}</p>

          {winner && (
            <h2 className="text-4xl text-yellow-400 mt-4">
              🏆 {winner.name} Wins!
            </h2>
          )}
        </div>
      </div>
    </div>
  );
}