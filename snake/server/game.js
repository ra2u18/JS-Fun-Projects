const { GRID_SIZE, PLAYER_TWO_WINS, PLAYER_ONE_WINS, NO_WINNER } = require('./contants');

module.exports = {
  initGame,
  gameLoop,
  getUpdatedVelocity,
};

function initGame() {
  const state = createGameState();
  randomFood(state);
  return state;
}

function createGameState() {
  return {
    players: [
      {
        pos: { x: 3, y: 10 },
        vel: { x: 0, y: 0 },
        // Snake body segments coordinates
        snake: [
          { x: 1, y: 10 },
          { x: 2, y: 10 },
          { x: 3, y: 10 },
        ],
      },
      {
        pos: { x: 18, y: 10 },
        vel: { x: 0, y: 0 },
        // Snake body segments coordinates
        snake: [
          { x: 20, y: 10 },
          { x: 19, y: 10 },
          { x: 18, y: 10 },
        ],
      },
    ],
    // food position
    food: {},
    // game world coordinate system
    gridsize: GRID_SIZE,
  };
}

function gameLoop(state) {
  if (!state) return;

  const playerOne = state.players[0];
  const playerTwo = state.players[1];

  const food = state.food;

  // Move the player according to how keys were pressed
  movePlayerByVelocity(playerOne);
  movePlayerByVelocity(playerTwo);

  // Check whether player went out of bounds and return the winner
  if (isOutOfBounds(playerOne)) {
    return PLAYER_TWO_WINS;
  }
  if (isOutOfBounds(playerTwo)) {
    return PLAYER_ONE_WINS;
  }

  // Check whether player intersected with food and grow the snake
  // and also generate a new random piece of food
  if (isEatingFood(playerOne, food)) {
    growSnake(playerOne);
    randomFood(state);
  }

  if (isEatingFood(playerTwo, food)) {
    growSnake(playerTwo);
    randomFood(state);
  }

  // Check whether player bumped into itself
  if (isBodyOverlapping(playerOne)) {
    return PLAYER_TWO_WINS;
  }
  if (isBodyOverlapping(playerTwo)) {
    return PLAYER_ONE_WINS;
  }

  // Move the snakes forward
  playerOne.snake.push({ ...playerOne.pos }); // push the current pos
  playerOne.snake.shift(); // remove the first pos

  // Move the snakes forward
  playerTwo.snake.push({ ...playerTwo.pos }); // push the current pos
  playerTwo.snake.shift(); // remove the first pos

  return NO_WINNER;
}

function movePlayerByVelocity(player) {
  player.pos.x += player.vel.x;
  player.pos.y += player.vel.y;
}

function isOutOfBounds(player) {
  if (player.pos.x < 0 || player.pos.x > GRID_SIZE || player.pos.y < 0 || player.pos.y > GRID_SIZE) return true;
  return false;
}

function isEatingFood(player, food) {
  if (player.pos.x === food.x && player.pos.y === food.y) return true;
  return false;
}

function growSnake(player) {
  player.snake.push({ ...player.pos });
  movePlayerByVelocity(player);
}

function isBodyOverlapping(player) {
  if (player.vel.x || player.vel.y) {
    for (let cell of player.snake) {
      if (cell.x === player.pos.x && cell.y === player.pos.y) {
        return true;
      }
    }
  }
  return false;
}

function randomFood(state) {
  food = {
    x: Math.floor(Math.random() * GRID_SIZE),
    y: Math.floor(Math.random() * GRID_SIZE),
  };

  // Cross-out the possibility that the food might end up on a snake
  for (let cell of state.players[0].snake) {
    if (cell.x === food.x && cell.y === food.y) {
      randomFood(state);
    }
  }

  for (let cell of state.players[1].snake) {
    if (cell.x === food.x && cell.y === food.y) {
      randomFood(state);
    }
  }

  state.food = food;
}

function getUpdatedVelocity(keyCode) {
  switch (keyCode) {
    case 37: {
      // left
      return { x: -1, y: 0 };
    }
    case 38: {
      // down
      return { x: 0, y: -1 };
    }
    case 39: {
      // right
      return { x: 1, y: 0 };
    }
    case 40: {
      // up
      return { x: 0, y: 1 };
    }
  }
}
