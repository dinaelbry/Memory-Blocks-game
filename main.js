// ====================
// Game State & Timer
// ====================
// idle
let gameState = "idle";
// when game started
let startTime = 0;
// when click on paused
let pausedTime = 0;
// total timer
let totalPaused = 0;

// ====================
// Buttons & Elements
// ====================
// let gameStarted = false;
// resrart game button
const restartBtn = document.getElementById("restartGame");

restartBtn.addEventListener("click", restartGame);

// pause icon
const pauseBtn = document.getElementById("pauseBtn");
const pauseIcon = pauseBtn.querySelector("i");
// pause overlay
const pauseOverlay = document.getElementById("pauseOverlay");
const resumeBtn = document.getElementById("resumeBtn");
// winscreen
const winScreen = document.getElementById("winScreen");
const winStats = document.getElementById("winStats");
// try again
const tryAgainBtn = document.getElementById("tryAgainBtn");

// select blocks container
const blocksContainer = document.querySelector(".memory-game-blocks");
const triesElement = document.querySelector(".tries span");
// create array from game blocks
let blocks = Array.from(blocksContainer.children);

//loading Sounds
const successSound = document.getElementById("success");
const failSound = document.getElementById("fail");

// leaderboard
const leaderboardOverlay = document.getElementById("leaderboardOverlay");
const lastPlayerDiv = document.getElementById("lastPlayer");
const topPlayersDiv = document.getElementById("topPlayers");

// playing sound
async function playSound(sound) {
  try {
    // reset sound
    sound.currentTime = 0;
    // using awsait to ensure sound actually play
    await sound.play();
  } catch (err) {
    // if browser Prevent operation
    setTimeout(() => {
      sound.currentTime = 0;
      sound.play().catch(() => {});
    }, 500);
  }
}

// Dark Mode
document.getElementById("darkMode").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const icon = document.querySelector("#darkMode i");
  // Change mode when the button is pressed
  icon.classList.toggle("fa-moon");
  icon.classList.toggle("fa-sun");
});

// ================
// Shuffle Function
// ================
function shuffle(array) {
  // setting vars
  let current = array.length,
    temp,
    random;
  while (current > 0) {
    // get random number
    random = Math.floor(Math.random() * current);
    // decrease length by one
    current--;
    // save current eleement in stash
    temp = array[current];
    // current element=random element
    array[current] = array[random];
    // random element = get eleement in stash
    array[random] = temp;
  }
  return array;
}

/*
1. save current element in stash
2. current element=random element
3. random element = get eleement in stash
*/

// ================
// Stop Clicking
// ================
function stopClicking() {
  blocksContainer.classList.add("no-clicking");
}

// ====================
// User Name Flow
// ====================
// when click start game appear name box
const nameBox = document.getElementById("nameBox");
document.getElementById("startGameBtn").onclick = () => {
  document.querySelector(".control-btn").style.display = "none"; // hide btn
  nameBox.style.display = "flex"; // appear name box
};

// when enter name => start game
document.getElementById("startBtn").onclick = () => {
  const name = document.getElementById("playerName").value.trim();
  document.querySelector(".name span").textContent = name
    ? `Hello ${name}`
    : "Unknown";
  nameBox.style.display = "none"; //hide name box

  // active btns
  restartBtn.disabled = false;
  restartBtn.title = "Restart Game";

  // active sounds
  // playSound(successSound);
  // playSound(failSound);
  startGameLogic();
};

// ====================
// Timer Calculation
// ====================
// calc actual time
function getElapsedTime() {
  // calc from start time
  const now =
    gameState === "finished" || gameState === "paused"
      ? pausedTime
      : Date.now();
  // prevent minus
  return Math.max(0, now - startTime - totalPaused);
}

// ====================
// Pause & Resume
// ====================
pauseBtn.addEventListener("click", () => {
  if (gameState === "playing") pauseGame();
  else if (gameState === "paused") resumeGame();
});

// btn pause
function pauseGame() {
  if (gameState !== "playing") return;
  gameState = "paused";
  pausedTime = Date.now();
  stopClicking();
  pauseOverlay.style.display = "flex";
  pauseIcon.classList.replace("fa-pause", "fa-play");
  pauseBtn.title = "Resume Game";
}

// resum
function resumeGame() {
  if (gameState !== "paused") return;
  gameState = "playing";
  totalPaused += Date.now() - pausedTime;
  blocksContainer.classList.remove("no-clicking");
  pauseOverlay.style.display = "none";
  pauseIcon.classList.replace("fa-play", "fa-pause");
  pauseBtn.title = "Pause Game";
}

resumeBtn.onclick = resumeGame;

// ====================
// Start Game Logic
// ====================
// Main Game Start Logic
function startGameLogic() {
  // gameState = "idle";
  totalPaused = 0;
  // resert tries
  triesElement.textContent = "0";

  // create range of keys
  let orderRange = Array.from(Array(blocks.length).keys());
  // let orderRange = [...Array(blocks.length).keys()]; // create array empty
  shuffle(orderRange);

  // add order css property to game blocks
  blocks.forEach((block, index) => {
    block.style.order = orderRange[index];
    block.classList.remove("has-match", "is-flipped", "wrong", "win-effect");
  });

  // All cards are revealed for 3 seconds
  stopClicking();
  blocks.forEach((block) => block.classList.add("is-flipped"));

  setTimeout(() => {
    blocks.forEach((block) => block.classList.remove("is-flipped"));
    blocksContainer.classList.remove("no-clicking");
    // start timer game
    startTime = Date.now();
    gameState = "playing";
  }, 5000);
}

// =======================
// Flip Block
// =======================
function flipBlock(selectedBlock) {
  // stopping any play if state not playing
  if (gameState !== "playing") return;
  // If the card is already matched, leave it.
  if (
    selectedBlock.classList.contains("is-flipped") ||
    selectedBlock.classList.contains("has-match") ||
    blocksContainer.classList.contains("no-clicking")
  )
    return;

  // add class is-fliped
  selectedBlock.classList.add("is-flipped");

  // collect all fliped cards
  let flippedBlocks = blocks.filter(
    (b) =>
      b.classList.contains("is-flipped") && !b.classList.contains("has-match")
  );

  // if there is two selected blocks
  if (flippedBlocks.length === 2) {
    // stop clicking
    stopClicking();
    //  check matching block function
    checkMatchedBlock(flippedBlocks[0], flippedBlocks[1]);
  }
}

// =======================
// check matched block
// =======================
function checkMatchedBlock(firstBlock, secondBlock) {
  //treis
  if (firstBlock.dataset.tech === secondBlock.dataset.tech) {
    playSound(successSound);
    // when 2 cards is matched
    firstBlock.classList.add("has-match");
    secondBlock.classList.add("has-match");

    // fliped cards
    setTimeout(() => {
      firstBlock.classList.remove("is-flipped");
      secondBlock.classList.remove("is-flipped");
      // allow click after matched
      blocksContainer.classList.remove("no-clicking");
      checkIfWin();
    }, 900);
  } else {
    // increase counter element or tries
    triesElement.textContent = parseInt(triesElement.textContent) + 1;
    // play fail sound immediately
    playSound(failSound);

    //when mismatched adding class wrong
    firstBlock.classList.add("wrong");
    secondBlock.classList.add("wrong");

    // wating vibration
    const resetCards = () => {
      // remove vibration and flipped
      firstBlock.classList.remove("wrong", "is-flipped");
      secondBlock.classList.remove("wrong", "is-flipped");
      // allow clicking after finished
      blocksContainer.classList.remove("no-clicking");
      checkIfWin();
    };

    // remove listener
    firstBlock.addEventListener("animationend", resetCards, { once: true });
  }
}

// =======================
// Check Win
// =======================
function checkIfWin() {
  // check if game finished
  if (!blocks.every((b) => b.classList.contains("has-match"))) return;

  // finish game
  gameState = "finished";
  pausedTime = Date.now();

  // calc timer
  const elapsed = Math.floor(getElapsedTime() / 1000);
  // wrong tries
  const errors = parseInt(triesElement.textContent);
  const playerName =
    document
      .querySelector(".name span")
      .textContent.replace("Hello ", "")
      .trim() || "Unknown";

  // calc score
  const score = Math.max(0, 1000 - elapsed * 5 - errors * 20);

  // save in leaderboard
  saveToLeaderboard(playerName, score, elapsed, errors);

  winStats.innerHTML = `
    <strong>Bravo ${playerName}!</strong><br><br>
    Time: ${elapsed} seconds<br>
    Wrong Tries: ${errors}<br>
    Your Score: <strong>${score}</strong> points
  `;
  winScreen.style.display = "flex";

  // btn try again
  tryAgainBtn.onclick = () => {
    winScreen.style.display = "none";
    restartGame();
  };
}

// =======================
// restart game
// =======================
function restartGame() {
  winScreen.style.display = "none";
  pauseOverlay.style.display = "none";

  if (pauseIcon.classList.contains("fa-play")) {
    pauseIcon.classList.replace("fa-play", "fa-pause");
    pauseBtn.title = "Pause Game";
  }

  gameState = "idle";
  totalPaused = 0;
  triesElement.textContent = "0";

  // reset range of keys
  let orderRange = Array.from(Array(blocks.length).keys());
  shuffle(orderRange);

  blocks.forEach((block, index) => {
    block.style.order = orderRange[index];
    block.classList.remove("has-match", "is-flipped", "wrong", "win-effect");
  });

  stopClicking();
  blocks.forEach((block) => block.classList.add("is-flipped"));

  setTimeout(() => {
    blocks.forEach((block) => block.classList.remove("is-flipped"));
    blocksContainer.classList.remove("no-clicking");
    startTime = Date.now();
    gameState = "playing";
  }, 5000);
}

// ====================
// Card Events
// ====================
blocks.forEach((block) => {
  block.addEventListener("click", () => flipBlock(block));
  // mobile
  block.addEventListener("touchstart", (e) => {
    e.preventDefault();
    flipBlock(block);
  });
});

// ====================
// Leaderboard
// ====================
function saveToLeaderboard(name, score, time, errors) {
  let leaderboard = JSON.parse(
    localStorage.getItem("memoryLeaderboard") || "[]"
  );

  leaderboard.push({
    name,
    score,
    time,
    errors,
    date: Date.now(),
  });

  localStorage.setItem("memoryLeaderboard", JSON.stringify(leaderboard));
}

// ====================
// show Leader board
// ====================
function showLeaderboard() {
  if (!leaderboardOverlay) return;
  const leaderboard = JSON.parse(
    localStorage.getItem("memoryLeaderboard") || "[]"
  );
  if (leaderboard.length === 0) {
    lastPlayerDiv.innerHTML = "<p>No players yet!</p>";
    topPlayersDiv.innerHTML = "<p>No ranking yrt!</p>";
  } else {
    // Last Player
    const last = leaderboard[leaderboard.length - 1];
    lastPlayerDiv.innerHTML = `
      <p><strong>${last.name}</strong></p>
      <p>Score: <span >${last.score}</span></p>
      <p>Time: ${last.time}s</p>
      <p>Errors: ${last.errors}</p>
    `;

    // top 5
    let html = "";
    const sorted = [...leaderboard]
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    sorted.forEach((player, index) => {
      html += `
        <p>
          <strong>${index + 1}. ${player.name}</strong><br>
          Score: <span>${player.score}</span> | 
          Time: ${player.time}s | Errors: ${player.errors}
        </p>
      `;
    });
    topPlayersDiv.innerHTML = html;
  }

  leaderboardOverlay.style.display = "flex";
}
// Open Leaderboard Button
document.getElementById("leaderboardBtn").onclick = showLeaderboard;

// Close Leaderboard
document.getElementById("closeLeaderboard").onclick = () => {
  leaderboardOverlay.style.display = "none";
};
