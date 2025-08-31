function loadImage(path) {
  const img = new Image();
  img.src = path;
  return img;
}

const ENTITY_SIZE = 48;
const GAME_WIDTH  = ENTITY_SIZE * 8;
const GAME_HEIGHT = ENTITY_SIZE * 12;


// (x, y)
const walls_inital_pos = [
  [ENTITY_SIZE * 1, ENTITY_SIZE * 8], [ENTITY_SIZE * 2, ENTITY_SIZE * 8],
  [ENTITY_SIZE * 1, ENTITY_SIZE * 9], [ENTITY_SIZE * 2, ENTITY_SIZE * 9],

  [ENTITY_SIZE * 5, ENTITY_SIZE * 8], [ENTITY_SIZE * 6, ENTITY_SIZE * 8],
  [ENTITY_SIZE * 5, ENTITY_SIZE * 9], [ENTITY_SIZE * 6, ENTITY_SIZE * 9],
];

const playerImg = loadImage("./images/player.png");

const keys = {
  left: false,
  right: false,
};

function newPlayer(x, y) {
  return {
    x: x,
    y: y,
    vel: 2,
  };
}

function newGame() {
  const default_px = GAME_WIDTH/2 - ENTITY_SIZE/2;
  const default_py = GAME_HEIGHT - ENTITY_SIZE - 30;
  return {
    player: newPlayer(default_px, default_py),
    walls: walls_inital_pos.slice(),
  };
}

function draw_background(ctx) {
  ctx.fillStyle = "#343d55";
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
}

function draw_player(ctx, player) {
  ctx.drawImage(playerImg, player.x, player.y, ENTITY_SIZE, ENTITY_SIZE);
}

function draw_walls(ctx, walls) {
  ctx.fillStyle = "#ec5";
  for (let i=0; i<walls.length; i++) {
    let p = walls[i];
    ctx.fillRect(p[0]+4, p[1]+4, ENTITY_SIZE-4, ENTITY_SIZE-4);
  }
}

function draw(ctx, game) {
  draw_background(ctx);
  draw_player(ctx, game.player);
  draw_walls(ctx, game.walls);
}

function update(game) {
  if (keys["left"]) {
    game.player.x -= game.player.vel;
    // check boundary
    if (game.player.x < 0) {
      game.player.x = 0
    }
  } else if (keys["right"]) {
    game.player.x += game.player.vel;
    // check boundary 
    if (game.player.x > GAME_WIDTH-ENTITY_SIZE) {
      game.player.x = GAME_WIDTH-ENTITY_SIZE;
    }
  }
}

function game_loop(ctx, game) {
  draw(ctx, game);
  update(game);

  requestAnimationFrame(() => game_loop(ctx, game));
}

// Initialize
window.addEventListener("load", () => {
  const ctx = document.getElementById("invader").getContext("2d");
  ctx.imageSmoothingEnabled = false;

  const game = newGame();
  
  // start game loop
  requestAnimationFrame(() => game_loop(ctx, game));
});

window.addEventListener("keyup", (event) => {
  switch (event.key) {
    case "ArrowLeft":
      keys["left"] = false;
      break;
    case "ArrowRight":
      keys["right"] = false;
      break;
  }
});

window.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "ArrowLeft":
      keys["left"] = true;
      break;
    case "ArrowRight":
      keys["right"] = true;
      break;
    default:
  }
});

