// Constants
const BG_COLOR = '#231f20';

// Other Global Variables
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');

let projectileOptions = ['friendly', 15, 'red'];

let projectiles = [];
let enemies = [];

canvas.width = innerWidth;
canvas.height = innerHeight;

class Entity {
  constructor(name, radius, color, position) {
    this.name = name;
    this.radius = radius;
    this.color = color;
    this.position = position;
  }

  // Abstract methods
  update() {}

  #draw() {}
}

class Player extends Entity {
  constructor(name, radius, color, x, y) {
    super(name, radius, color, { x, y });
    // Create a window listener
    window.addEventListener('click', (ev) => this.#spawnProjectile(ev));
  }

  update() {
    this.#draw();
  }

  // Private methods
  #draw() {
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  #spawnProjectile(event) {
    const projTargetPos = getMouseCoordinates(event);
    const angle = Math.atan2(projTargetPos.y - canvas.height / 2, projTargetPos.x - canvas.width / 2);
    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle),
    };

    projectiles.push(new Projectile('friendly', 15, 'red', this.position.x, this.position.y, velocity));
  }
}

class Projectile extends Entity {
  constructor(name, radius, color, x, y, velocity) {
    super(name, radius, color, { x, y });
    this.velocity = velocity;
  }

  update() {
    this.#draw();
    this.#updatePosition();

    // Check if projectile is out of bounds
    if (this.#isOutOfBounds()) {
      console.log('out');
      this.#despawnProjectile();
    }
  }

  // Internal functionality
  #draw() {
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  #updatePosition() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }

  #isOutOfBounds() {
    if (
      this.position.x < 0 ||
      this.position.x > canvas.width ||
      this.position.y < 0 ||
      this.position.y > canvas.height
    ) {
      return true;
    }
    return false;
  }

  #despawnProjectile() {
    projectiles.splice(projectiles.indexOf(this), 1);
  }
}

class Enemy extends Entity {
  constructor(name, radius, color, x, y, velocity) {
    super(name, radius, color, { x, y });
    this.velocity = velocity;
  }

  update() {
    this.#draw();
    this.#updatePosition();

    // Check if projectile is out of bounds
    if (this.#collision()) {
      this.#despawnEnemy();
    }
  }

  #draw() {
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  #updatePosition() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }

  #collision() {}

  #despawnEnemy() {
    enemies.splice(enemies.indexOf(this), 1);
  }

  #isOutOfBounds() {
    if (
      this.position.x < rect.left ||
      this.position.x > rect.right ||
      this.position.y < rect.top ||
      this.position.y > rect.bottom
    ) {
      return true;
    }
    return false;
  }
}

// TODO:  Modify this shabby animate function
function animate() {
  requestAnimationFrame(animate);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Modify the state of the game
  // For now just check if projectiles exit the screen

  redrawCanvas();
}

function redrawCanvas() {
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  player.update();

  projectiles.forEach((proj) => {
    proj.update();
  });

  enemies.forEach((enemy) => {
    enemy.update();

    projectiles.forEach((proj) => {
      let dist = Math.hypot(proj.position.x - enemy.position.x, proj.position.y - enemy.position.y);
      dist = dist - proj.radius - enemy.radius;
      if (dist < 1) {
        enemies.splice(enemies.indexOf(enemy), 1);
        projectiles.splice(projectiles.indexOf(proj), 1);
      }
    });
  });
}

function getMouseCoordinates(event) {
  let rect = canvas.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}

function spawnEnemies() {
  setInterval(() => {
    const name = 'enemy';
    const color = 'blue';
    const radius = Math.random() * (30 - 10) + 10;

    let x, y;
    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
      y = Math.random() * canvas.height;
    } else {
      x = Math.random() * canvas.width;
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
    }

    const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);

    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle),
    };

    enemies.push(new Enemy(name, radius, color, x, y, velocity));
  }, 1000);
}

const player = new Player('john', 30, 'green', canvas.width / 2, canvas.height / 2);
animate();
spawnEnemies();
