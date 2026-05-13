import { useEffect, useRef, useState } from "react";

export default function CrashGameRoomDemo({ onBack }) {
const [status, setStatus] = useState("BETTING"); // BETTING | RUNNING | CRASHED
const [countdown, setCountdown] = useState(5);
const [multiplier, setMultiplier] = useState(1.0);
const [rocketPos, setRocketPos] = useState({ x: 0, y: 0 });
const [flightPoints, setFlightPoints] = useState([]);

const statusRef = useRef("BETTING");
const intervalRef = useRef(null);
const crashPointRef = useRef(2.0);

const [player, setPlayer] = useState({
bet: 1000,
cashedOut: false,
cashoutMultiplier: null,
profit: 0
});

// 🚀 START BETTING PHASE
function startBettingPhase() {
clearInterval(intervalRef.current);

setStatus("BETTING");  
statusRef.current = "BETTING";  

setCountdown(5);  
setMultiplier(1.0);  
setRocketPos({ x: 0, y: 0 });  
setFlightPoints([]);  

setPlayer({  
  bet: 1000,  
  cashedOut: false,  
  cashoutMultiplier: null,  
  profit: 0  
});  

let timer = 5;  

intervalRef.current = setInterval(() => {  
  timer -= 1;  
  setCountdown(timer);  

  if (timer <= 0) {  
    clearInterval(intervalRef.current);  
    startFlight();  
  }  
}, 1000);

}

// ✈️ START FLIGHT
function startFlight() {
setStatus("RUNNING");
statusRef.current = "RUNNING";

crashPointRef.current = +(1.5 + Math.random() * 4).toFixed(2);  

let currentMultiplier = 1;  
let x = 0;  
let y = 0;  

intervalRef.current = setInterval(() => {  
  if (statusRef.current !== "RUNNING") return;  

  const growth = 0.015 + currentMultiplier * 0.018;  
  currentMultiplier += growth;  
  currentMultiplier = +currentMultiplier.toFixed(2);  

  setMultiplier(currentMultiplier);  

  // ✈️ Real aviation floating movement  
  x += 5 + currentMultiplier * 0.8;  
  y += 1.5 + currentMultiplier * 0.9;  

  setRocketPos({ x, y });  

  // 📈 Flight path  
  setFlightPoints((prev) => [  
    ...prev,  
    {  
      x,  
      y  
    }  
  ]);  

  // 💰 Live payout updates  
  if (!player.cashedOut) {  
    const liveProfit = +(  
      player.bet * currentMultiplier - player.bet  
    ).toFixed(2);  

    setPlayer((prev) => ({  
      ...prev,  
      profit: liveProfit  
    }));  
  }  

  // 💥 Crash  
  if (currentMultiplier >= crashPointRef.current) {  
    clearInterval(intervalRef.current);  

    setStatus("CRASHED");  
    statusRef.current = "CRASHED";  

    // 🔁 Auto restart  
    setTimeout(() => {  
      startBettingPhase();  
    }, 4000);  
  }  
}, 40);

}

// 💰 CASHOUT
function cashout() {
if (statusRef.current !== "RUNNING") return;

setPlayer((prev) => {  
  if (prev.cashedOut) return prev;  

  return {  
    ...prev,  
    cashedOut: true,  
    cashoutMultiplier: multiplier,  
    profit: +(prev.bet * multiplier - prev.bet).toFixed(2)  
  };  
});

}

useEffect(() => {
startBettingPhase();

return () => clearInterval(intervalRef.current);

}, []);

return (
<div style={styles.container}>
<h1 style={{ marginBottom: 5 }}>✈️ AVIATION CRASH</h1>

{/* STATUS */}  
  <div style={{ marginBottom: 15, opacity: 0.8 }}>  
    {status === "BETTING" && (  
      <span>Next flight in {countdown}s</span>  
    )}  

    {status === "RUNNING" && (  
      <span style={{ color: "lime" }}>  
        Flight is live ✈️  
      </span>  
    )}  

    {status === "CRASHED" && (  
      <span style={{ color: "red" }}>  
        💥 Flew away @ {multiplier.toFixed(2)}x  
      </span>  
    )}  
  </div>  

  {/* MULTIPLIER */}  
  <div style={{ marginBottom: 8, opacity: 0.7 }}>  
    Flight Taking Off...  
  </div>  

  <div  
    style={{  
      ...styles.multiplier,  
      color: status === "CRASHED" ? "red" : "#22c55e"  
    }}  
  >  
    {multiplier.toFixed(2)}x  
  </div>  

  {/* GAME SCREEN */}  
  <div style={styles.gameArea}>  
    {/* GRAPH LINE */}  
    <svg style={styles.svg}>  
      <polyline  
        fill="none"  
        stroke="#22c55e"  
        strokeWidth="4"  
        points={flightPoints  
          .map((p) => `${p.x},${250 - p.y}`)  
          .join(" ")}  
      />  
    </svg>  

    {/* AIRPLANE */}  
    <div  
      style={{  
        ...styles.rocket,  
        left: rocketPos.x,  
        bottom: rocketPos.y,  
        transform: `rotate(${Math.min(multiplier * 8, 45)}deg)`  
      }}  
    >  
      ✈️  
    </div>  
  </div>  

  {/* PLAYER CARD */}  
  <div style={styles.card}>  
    <div style={{ marginBottom: 10 }}>  
      Bet Amount: ₦{player.bet}  
    </div>  

    {!player.cashedOut && status === "RUNNING" && (  
      <>  
        <div style={{ color: "#22c55e", fontSize: 22 }}>  
          ₦{(player.bet + player.profit).toFixed(2)}  
        </div>  

        <div style={{ opacity: 0.7, marginTop: 5 }}>  
          Live Profit: +₦{player.profit.toFixed(2)}  
        </div>  
      </>  
    )}  

    {player.cashedOut && (  
      <div style={{ color: "gold" }}>  
        <div>  
          Cashed Out @ {player.cashoutMultiplier?.toFixed(2)}x  
        </div>  

        <div style={{ marginTop: 5 }}>  
          Won ₦  
          {(player.bet + player.profit).toFixed(2)}  
        </div>  
      </div>  
    )}  

    {status === "CRASHED" && !player.cashedOut && (  
      <div style={{ color: "red", marginTop: 10 }}>  
        Lost ₦{player.bet}  
      </div>  
    )}  
  </div>  

  {/* CASHOUT BUTTON */}  
  <button  
    onClick={cashout}  
    disabled={status !== "RUNNING" || player.cashedOut}  
    style={{  
      ...styles.cashoutButton,  
      opacity:  
        status !== "RUNNING" || player.cashedOut ? 0.5 : 1  
    }}  
  >  
    {player.cashedOut  
      ? "CASHED OUT"  
      : `CASH OUT @ ${multiplier.toFixed(2)}x`}  
  </button>  

  {/* BACK BUTTON */}  
  <button onClick={onBack} style={styles.backButton}>  
    ← Back  
  </button>  
</div>

);
}

const styles = {
container: {
minHeight: "100vh",
background: "#020617",
color: "white",
padding: 20,
textAlign: "center",
overflow: "hidden"
},

multiplier: {
fontSize: 50,
fontWeight: "bold",
marginBottom: 15
},

gameArea: {
position: "relative",
height: 280,
background: "linear-gradient(to top, #111827, #0f172a)",
borderRadius: 20,
overflow: "hidden",
marginBottom: 20,
border: "1px solid #1e293b"
},

svg: {
position: "absolute",
inset: 0,
width: "100%",
height: "100%"
},

rocket: {
position: "absolute",
fontSize: 42,
filter: "drop-shadow(0 0 10px #22c55e)",
transition: "all 0.04s linear"
},

card: {
background: "#111827",
borderRadius: 16,
padding: 20,
marginBottom: 20,
border: "1px solid #1e293b"
},

cashoutButton: {
width: "100%",
padding: 16,
borderRadius: 14,
border: "none",
background: "#22c55e",
color: "white",
fontSize: 18,
fontWeight: "bold",
cursor: "pointer"
},

backButton: {
marginTop: 15,
padding: 12,
width: "100%",
borderRadius: 12,
border: "none",
background: "#1e293b",
color: "white",
cursor: "pointer"
}
};