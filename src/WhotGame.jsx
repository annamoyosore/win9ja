import React, { useRef, useState, useEffect } from "react";

export default function Horse() {
  const horses = [
    { id: 1, name: "Thunder" },
    { id: 2, name: "Blaze" },
    { id: 3, name: "Storm" },
    { id: 4, name: "Rocket" },
  ];

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

  const raceRef = useRef(null);
  const countdownRef = useRef(null);

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
    if (!selectedHorse) {
      alert("Select a horse first");
      return;
    }

    if (betAmount > balance) {
      alert("Insufficient balance");
      return;
    }

    setBalance((prev) => prev - betAmount);

    let count = 5;
    setCountdown(count);

    countdownRef.current = setInterval(() => {
      count -= 1;
      setCountdown(count);

      if (count <= 0) {
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

        horses.forEach((horse) => {
          updated[horse.id] += Math.random() * 7;
        });

        const winningHorse = horses.find(
          (horse) => updated[horse.id] >= 90
        );

        if (winningHorse) {
          clearInterval(raceRef.current);

          setWinner(winningHorse);
          setRaceStarted(false);

          if (selectedHorse === winningHorse.id) {
            const payout = betAmount * 3;
            setBalance((prev) => prev + payout);
            setMessage(`🎉 You won ₦${payout}`);
          } else {
            setMessage(`😢 ${winningHorse.name} won the race`);
          }
        }

        return updated;
      });
    }, 120);
  };

  useEffect(() => {
    return () => {
      clearInterval(raceRef.current);
      clearInterval(countdownRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-green-900 text-white p-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-5">
          🏇 Horse Racing Demo
        </h1>

        <div className="bg-black/30 rounded-3xl p-4 mb-6 flex flex-wrap gap-4 justify-between items-center">
          <div>
            <p className="text-lg">Balance</p>
            <h2 className="text-3xl font-bold">₦{balance}</h2>
          </div>

          <div>
            <p className="mb-1">Bet Amount</p>
            <input
              type="number"
              value={betAmount}
              onChange={(e) =>
                setBetAmount(Number(e.target.value))
              }
              className="bg-gray-800 px-4 py-3 rounded-2xl text-white w-40"
            />
          </div>

          <button
            onClick={resetRace}
            className="bg-red-500 hover:bg-red-600 px-5 py-3 rounded-2xl font-bold"
          >
            Reset
          </button>
        </div>

        {!raceStarted && !winner && (
          <div className="bg-black/30 rounded-3xl p-5 mb-6">
            <h2 className="text-2xl font-bold mb-5">
              Select Your Horse
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {horses.map((horse) => (
                <button
                  key={horse.id}
                  onClick={() =>
                    setSelectedHorse(horse.id)
                  }
                  className={`p-4 rounded-3xl border-4 transition-all ${
                    selectedHorse === horse.id
                      ? "border-yellow-400 bg-yellow-500 text-black"
                      : "border-white bg-gray-800"
                  }`}
                >
                  <div className="text-6xl mb-2">🐎</div>
                  <p className="font-bold text-lg">
                    {horse.name}
                  </p>
                </button>
              ))}
            </div>

            <button
              onClick={startRace}
              className="mt-6 w-full bg-blue-500 hover:bg-blue-600 py-4 rounded-3xl text-2xl font-bold"
            >
              Start Race
            </button>
          </div>
        )}

        {countdown > 0 &&
          !raceStarted &&
          !winner &&
          countdown !== 5 && (
            <div className="text-center text-7xl font-bold mb-6 animate-pulse">
              {countdown}
            </div>
          )}

        <div className="bg-green-700 rounded-3xl border-4 border-white p-5">
          {horses.map((horse) => (
            <div key={horse.id} className="mb-6">
              <div className="flex justify-between mb-2 font-bold">
                <span>
                  {horse.name}
                  {winner?.id === horse.id && " 🏆"}
                </span>
                <span>
                  {Math.floor(positions[horse.id])}%
                </span>
              </div>

              <div className="relative bg-white rounded-full h-16 overflow-hidden">
                <div
                  className="absolute top-1/2 -translate-y-1/2 text-5xl transition-all duration-100"
                  style={{
                    left: `${positions[horse.id]}%`,
                  }}
                >
                  🐎
                </div>

                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-2xl">
                  🏁
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-black/30 rounded-3xl p-5 text-center">
          <p className="text-2xl font-bold">{message}</p>

          {winner && (
            <>
              <h2 className="text-5xl font-bold text-yellow-400 mt-4">
                🏆 {winner.name} Wins!
              </h2>

              <button
                onClick={resetRace}
                className="mt-5 bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-4 rounded-3xl font-bold text-xl"
              >
                Play Again
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}