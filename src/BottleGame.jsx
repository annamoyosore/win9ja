<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Penalty Shootout Game</title>

<style>
  body {
    margin: 0;
    font-family: Arial, sans-serif;
    background: #0b6623;
    display: flex;
    flex-direction: column;
    align-items: center;
    color: white;
  }

  h1 {
    margin: 10px;
  }

  #game {
    position: relative;
    width: 360px;
    height: 500px;
    background: #1f8f3a;
    border: 3px solid white;
    overflow: hidden;
  }

  .goal {
    position: absolute;
    top: 20px;
    width: 100%;
    height: 120px;
    border-bottom: 4px solid white;
  }

  .keeper {
    position: absolute;
    top: 60px;
    left: 160px;
    width: 40px;
    height: 40px;
    background: yellow;
    border-radius: 50%;
    transition: 0.4s;
  }

  .ball {
    position: absolute;
    bottom: 60px;
    left: 160px;
    width: 25px;
    height: 25px;
    background: white;
    border-radius: 50%;
  }

  #controls {
    margin-top: 10px;
  }

  button {
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
  }

  #score {
    margin-top: 10px;
  }
</style>
</head>

<body>

<h1>⚽ Penalty Shootout</h1>

<div id="game">
  <div class="goal"></div>
  <div class="keeper" id="keeper"></div>
  <div class="ball" id="ball"></div>
</div>

<div id="controls">
  <button onclick="shoot()">Shoot</button>
  <button onclick="resetGame()">Reset</button>
</div>

<div id="score">
  Goals: <span id="goals">0</span> |
  Misses: <span id="misses">0</span>
</div>

<script>
let goals = 0;
let misses = 0;
let shooting = false;

const ball = document.getElementById("ball");
const keeper = document.getElementById("keeper");

function shoot() {
  if (shooting) return;
  shooting = true;

  // random shot direction
  const targetX = Math.floor(Math.random() * 300);

  // goalkeeper dive
  const keeperMove = Math.floor(Math.random() * 300);
  keeper.style.left = keeperMove + "px";

  // animate ball
  ball.style.transition = "0.6s";
  ball.style.bottom = "380px";
  ball.style.left = targetX + "px";

  setTimeout(() => {
    const difference = Math.abs(targetX - keeperMove);

    if (difference < 40) {
      misses++;
      alert("❌ Saved by goalkeeper!");
    } else {
      goals++;
      alert("⚽ GOAL!");
    }

    updateScore();
    resetBall();
    shooting = false;
  }, 700);
}

function resetBall() {
  ball.style.transition = "none";
  ball.style.bottom = "60px";
  ball.style.left = "160px";
}

function updateScore() {
  document.getElementById("goals").textContent = goals;
  document.getElementById("misses").textContent = misses;
}

function resetGame() {
  goals = 0;
  misses = 0;
  updateScore();
  resetBall();
  keeper.style.left = "160px";
}
</script>

</body>
</html>
  
