const io = require('socket.io')();
const { initGame, gameLoop, getUpdatedVelocity } = require('./game');
const { FRAME_RATE } = require('./contants');
const { makeID } = require('./utils');

// State that holds the entire room states
const state = {};
// Lookup table: room name of a particular user id
// client.id -> roomName/GameCode
const clientRooms = {};

io.on('connection', (client) => {
  // const state = createGameState();

  // Listen for incoming events from client
  client.on('keydown', handleKeyDown);
  client.on('newGame', handleNewGame);
  client.on('joinGame', handleJoinGame);

  function handleJoinGame(gameCode) {
    const room = io.sockets.adapter.rooms[gameCode];
    let allUsers;
    if (room) {
      // client.id -> client itself
      allUsers = room.sockets;
    }

    let numClients = 0;
    if (allUsers) {
      numClients = Object.keys(allUsers).length;
    }

    if (numClients === 0) {
      // No one started this room, so it doesn't exist
      client.emit('unknownGame');
      return;
    } else if (numClients > 1) {
      // Too many players
      client.emit('gameLocked');
      return;
    }

    clientRooms[client.id] = gameCode;

    client.join(gameCode);
    client.number = 2;
    client.emit('init', 2);

    startGameInterval(gameCode);
  }

  function handleNewGame() {
    let roomName = makeID(5); // args: length of the room id
    clientRooms[client.id] = roomName;

    // send back to the user the room name they've generated
    client.emit('gameCode', roomName);

    state[roomName] = initGame();

    // Join the initiator of the game to the room generated
    client.join(roomName);
    // 1 = Player number
    client.number = 1;
    client.emit('init', 1);
  }

  function handleKeyDown(keyCode) {
    const roomName = clientRooms[client.id];
    if (!roomName) return;

    try {
      keyCode = parseInt(keyCode);
    } catch (err) {
      console.log('[ERROR]: handleKeyDown parsing error');
      return;
    }

    const vel = getUpdatedVelocity(keyCode);
    if (vel) {
      state[roomName].players[client.number - 1].vel = vel;
    }
  }
});

function startGameInterval(roomName) {
  const msBetweenEachRefresh = 1000 / FRAME_RATE;
  // Game mechanics for each looped interval
  const intervalID = setInterval(() => {
    // winner -> 0 (game continues), 1(player 1 wins), 2(player 2 wins)
    const winner = gameLoop(state[roomName]);

    if (!winner) {
      // Emit game state to whole room
      emitGameState(roomName, state[roomName]);
      // client.emit('gameState', JSON.stringify(state));
    } else {
      // Emit the game winner to whole room
      emitGameOver(roomName, winner);
      // Reset state of the room
      state[roomName] = null;
      // client.emit('gameOver');
      clearInterval(intervalID);
    }
  }, msBetweenEachRefresh);
}

function emitGameState(roomName, state) {
  // Emit to ALL clients in room name
  io.sockets.in(roomName).emit('gameState', JSON.stringify(state));
}

function emitGameOver(roomName, winner) {
  // Emit to ALL clients in room name
  io.sockets.in(roomName).emit('gameOver', JSON.stringify({ winner }));
}

io.listen(3000);
