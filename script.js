const board = document.querySelector(".board");
let scoreElement = document.querySelector("#score");
let highScoreElement = document.querySelector("#high-score");
let timeElement = document.querySelector("#time");
const startButton = document.querySelector(".btn-start");
const restartButton = document.querySelector(".btn-restart");
const modal = document.querySelector(".modal");
const startGameModal = document.querySelector(".start-game");
const gameOverModal = document.querySelector(".game-over");

const blockHeight = 20;
const blockWidth = 20;

// game state (names preserved)
let score = 0;
let highScore = Number(localStorage.getItem("highScore")) || 0;
highScoreElement.textContent = highScore;
let time = `00:00`;
let timerInterval = null;
const cols = Math.floor(board.clientWidth / blockWidth);
const rows = Math.floor(board.clientHeight / blockHeight);
let food = {
  x: Math.floor(Math.random() * rows),
  y: Math.floor(Math.random() * cols),
};

let intv = null;
let blocks = [];
let snake = [{ x: 3, y: 5 }];
let direction = "down";

/* -------------------------
   Initialization & DOM
   -------------------------*/
initBoard();
attachEventListeners();

/* -------------------------
   Functions
   -------------------------*/

function initBoard() {
  // create grid blocks and populate blocks map
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const block = document.createElement("div");
      block.classList.add("block");
      board.appendChild(block);
      blocks[`${row} ${col}`] = block;
    }
  }
  // draw initial food and snake
  safeAddClass(blocks, `${food.x} ${food.y}`, "food");
  safeAddClass(blocks, `${snake[0].x} ${snake[0].y}`, "fill");
}

function attachEventListeners() {
  startButton.addEventListener("click", startGame);
  restartButton.addEventListener("click", restartGame);

  addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") direction = "down";
    else if (e.key === "ArrowUp") direction = "up";
    else if (e.key === "ArrowRight") direction = "right";
    else if (e.key === "ArrowLeft") direction = "left";
  });
}

function startGame() {
  if (intv) clearInterval(intv);
  intv = setInterval(renderSnake, 300);

  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(updateTimer, 1000);

  modal.style.display = "none";
}

function restartGame() {
  modal.style.display = "none";

  // remove old food safely
  safeRemoveClass(blocks, `${food.x} ${food.y}`, "food");
  placeRandomFood();

  // reset snake and re-start interval (names unchanged)
  snake = [{ x: 3, y: 5 }];
  // clear any previous fill classes
  clearAllSnakeFill();
  safeAddClass(blocks, `${snake[0].x} ${snake[0].y}`, "fill");

  if (intv) clearInterval(intv);
  intv = setInterval(renderSnake, 300);

  // reset score/time UI (keep behaviour consistent with original)
  score = 0;
  scoreElement.textContent = score;
  time = `00:00`;
  timeElement.textContent = time;
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(updateTimer, 1000);
}

/* main render function kept with same name and logic */
function renderSnake() {
  let head = null;

  // ensure food block exists before adding class
  safeAddClass(blocks, `${food.x} ${food.y}`, "food");

  if (direction === "right") head = { x: snake[0].x, y: snake[0].y + 1 };
  else if (direction === "left") head = { x: snake[0].x, y: snake[0].y - 1 };
  else if (direction === "up") head = { x: snake[0].x - 1, y: snake[0].y };
  else if (direction === "down") head = { x: snake[0].x + 1, y: snake[0].y };

  // eat food
  if (head.x == food.x && head.y == food.y) {
    safeRemoveClass(blocks, `${food.x} ${food.y}`, "food");

    placeRandomFood(); // safe random placement

    safeAddClass(blocks, `${food.x} ${food.y}`, "food");

    snake.unshift(head);
    score++;
    scoreElement.textContent = score;

    // high score update (keeps original comparison but ensures type correctness)
    if (score >= highScore) {
      highScore = score;
      localStorage.setItem("highScore", highScore.toString());
      highScoreElement.textContent = highScore;
    }
  }

  // out of bounds -> game over
  if (head.x < 0 || head.x >= rows || head.y < 0 || head.y >= cols) {
    modal.style.display = "flex";
    startGameModal.style.display = "none";
    gameOverModal.style.display = "flex";

    // reset UI state (mirrors your original behavior)
    score = 0;
    time = `00:00`;
    timeElement.textContent = time;
    scoreElement.textContent = score;
    highScoreElement.textContent = highScore;

    clearInterval(intv);

    // clear snake fill classes safely
    clearAllSnakeFill();

    // still add head then pop to keep original code flow (no logic change)
    snake.unshift(head);
    snake.pop();
    return;
  }

  // move snake: clear old fills, shift, then paint fills
  snake.forEach((block) => {
    safeRemoveClass(blocks, `${block.x} ${block.y}`, "fill");
  });

  snake.unshift(head);
  snake.pop();

  snake.forEach((block) => {
    safeAddClass(blocks, `${block.x} ${block.y}`, "fill");
  });
}

/* -------------------------
   Helper utilities
   -------------------------*/

function placeRandomFood() {
  // pick a random free cell (naive; could iterate to avoid snake)
  food = {
    x: Math.floor(Math.random() * rows),
    y: Math.floor(Math.random() * cols),
  };
}

function safeAddClass(map, key, className) {
  const el = map[key];
  if (el) el.classList.add(className);
}

function safeRemoveClass(map, key, className) {
  const el = map[key];
  if (el) el.classList.remove(className);
}

function clearAllSnakeFill() {
  snake.forEach((block) => {
    safeRemoveClass(blocks, `${block.x} ${block.y}`, "fill");
  });
}

function updateTimer() {
  // convert "mm:ss" -> numbers and increment seconds
  let [min, sec] = time.split(":").map(Number);
  if (isNaN(min)) min = 0;
  if (isNaN(sec)) sec = 0;

  sec += 1;
  if (sec >= 60) {
    min += 1;
    sec = 0;
  }
  // pad with zeros so UI looks like 01:05 etc.
  const mm = String(min).padStart(2, "0");
  const ss = String(sec).padStart(2, "0");
  time = `${mm}:${ss}`;
  timeElement.textContent = time;
}
