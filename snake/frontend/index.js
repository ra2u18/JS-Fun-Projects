const socket = io('http://localhost:3000');

socket.on('init', handleInit);
socket.on('gameState', handleGameState);
socket.on('gameOver', handleGameOver);
socket.on('gameCode', handleGameCode);
socket.on('unknownGame', handleUnknownGame);
socket.on('gameLocked', handleGameLocked);

// Contants
const BG_COLOR = '#231f20';
const SNAKE_COLOR = '#c2c2c2';
const FOOD_COLOR = '#e66916';

// DOM variables
const gameScreen = document.getElementById('gameScreen');
const initialScreen = document.getElementById('initialScreen');
const newGameBtn = document.getElementById('newGameButton');
const joinGameBtn = document.getElementById('joinGameButton');
const gameCodeInput = document.getElementById('gameCodeInput');
const gameCodeDisplay = document.getElementById('gameCodeDisplay');

// Listeners
const newGame = function () {
  socket.emit('newGame');
  init();
};

const joinGame = function () {
  // Get the game code from the input dom
  const gameCode = gameCodeInput.value;
  socket.emit('joinGame', gameCode);
  init();
};

newGameBtn.addEventListener('click', newGame);
joinGameBtn.addEventListener('click', joinGame);

// Variable declaration
let canvas, ctx;
let playerName;
let gameActive = false;

function init() {
  // Hide initial screen and display the game screen
  initialScreen.style.display = 'none';
  gameScreen.style.display = 'block';

  // Get canvas and context
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');

  // Fill canvas with proper dimensionality and color
  canvas.width = canvas.height = 600;
  redrawCanvas();

  document.addEventListener('keydown', function (e) {
    socket.emit('keydown', e.keyCode);
  });

  gameActive = true;
}

function paintGame(state) {
  ctx.fillStyle = BG_COLOR;
  redrawCanvas();

  // Extract state features
  const gridsize = state.gridsize;
  // Compute the pixels per square size
  const size = canvas.width / gridsize;

  paintFood(state.food, size, FOOD_COLOR);

  paintPlayer(state.players[0], size, SNAKE_COLOR);
  paintPlayer(state.players[1], size, 'red');
}

function paintPlayer(playerState, size, color) {
  const snake = playerState.snake;
  ctx.fillStyle = color;
  for (let cell of snake) {
    ctx.fillRect(cell.x * size, cell.y * size, size, size);
  }
}

function paintFood(foodState, size, color) {
  ctx.fillStyle = color;
  ctx.fillRect(foodState.x * size, foodState.y * size, size, size);
}

function redrawCanvas() {
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Socket fn. Callbacks and Events
function handleInit(number) {
  playerNumber = number;
}

function handleGameState(gameState) {
  if (!gameActive) return;

  gameState = JSON.parse(gameState);
  requestAnimationFrame(() => paintGame(gameState));
}

function handleGameCode(gameCode) {
  gameCodeDisplay.innerText = gameCode;
}

function handleUnknownGame() {
  reset();
  alert('UnknownGameCode');
}

function handleGameLocked() {
  reset();
  alert('This game is already in progress');
}

function handleGameOver(data) {
  if (!gameActive) return;

  data = JSON.parse(data);
  if (data.winner === playerNumber) {
    alert('you win!');
  } else {
    alert('you lose');
  }
  gameActive = false;

  // Reset the game
  reset();
}

function reset() {
  playerNumber = null;
  gameCodeInput.value = '';
  gameCodeDisplay.innerText = '';
  initialScreen.style.display = 'block';
  gameScreen.style.display = 'none';
}
