function load_image(path) {
  const img = new Image();
  img.src = path;
  return img;
}

const ENTITY_SIZE = 48;
const GAME_MAX_COL = 10;
const GAME_MAX_ROW = 12;
const GAME_WIDTH  = ENTITY_SIZE * GAME_MAX_COL;
const GAME_HEIGHT = ENTITY_SIZE * GAME_MAX_ROW;

const BULLET_WIDTH = 6;
const BULLET_HEIGHT = 12;
const DEFAULT_BULLET_VEL = 4;

const ENEMY_MOVE_INTERVAL = 20;

const PLAYER_BULLET_COOLDOWN = 40;


// (row, col, id)
const enemy_initial_pos = [
  [1, 2, 2], [2, 2, 1], [3, 2, 0],
  [1, 3, 2], [2, 3, 1], [3, 3, 0],
  [1, 4, 2], [2, 4, 1], [3, 4, 0],
  [1, 5, 2], [2, 5, 1], [3, 5, 0],
];



const player_image = load_image("./images/player.png");
const enemy_images = [
  load_image("./images/basic_alien_1.png"), // id = 0
  load_image("./images/basic_alien_2.png"), // id = 1
  load_image("./images/basic_alien_3.png"), // id = 2
]

const keys = {
  left: false,
  right: false,
  space: false,
};

function new_player(x, y) {
  return {
    x: x,
    y: y,
    vel: 2,
    life: 3,
    cooldown: 0,
  };
}

function new_enemy(id, row, col) {
  return {
    id: id,
    row: row,
    col: col,
    vel: 3,
  }
}

function new_game() {
  const default_px = GAME_WIDTH/2 - ENTITY_SIZE/2;
  const default_py = GAME_HEIGHT - ENTITY_SIZE - 30;

  // 敵をoffsetされた位置に生成する
  const enemies = [];
  for (let i=0; i<enemy_initial_pos.length; i++) {
    const enemy = enemy_initial_pos[i];
    enemies.push(new_enemy(enemy[2], enemy[0], enemy[1]));
  }

  return {
    player: new_player(default_px, default_py),
    player_bullets: [],
    enemies: enemies,
    enemy_context: {
      is_going_right: false,
      is_going_left:  true,
      moving_counter: 0,
    },
    enemy_bullets: [],
    is_over: false,
    is_complete: false,
  };
}

function draw_background(ctx) {
  ctx.fillStyle = "#343d55";
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
}

function draw_player(ctx, player) {
  ctx.drawImage(player_image, player.x, player.y, ENTITY_SIZE, ENTITY_SIZE);
}

function draw_enemies(ctx, enemies) {
  for (let i=0; i<enemies.length; i++) {
    let enemy = enemies[i];
    ctx.drawImage(enemy_images[enemy.id], enemy.col * ENTITY_SIZE, enemy.row * ENTITY_SIZE, ENTITY_SIZE, ENTITY_SIZE);
  }
}

function draw_bullets(ctx, bullets) {
  for (let i=0; i<bullets.length; i++) {
    let bullet = bullets[i];
    ctx.fillStyle = "#44e";
    ctx.fillRect(bullet.x, bullet.y, BULLET_WIDTH, BULLET_HEIGHT)
  }
}

function draw(ctx, game) {
  draw_background(ctx);
  draw_player(ctx, game.player);
  draw_bullets(ctx, game.player_bullets);
  draw_enemies(ctx, game.enemies);
}

function draw_gameover(ctx, game) {
  ctx.fillStyle = "#FFF";
  ctx.font = "50px serif";
  ctx.textAlign = "center";
  const x = GAME_WIDTH / 2;
  ctx.fillText("GAME OVER", x, 300);
}

function draw_gameclear(ctx, game) {
  ctx.fillStyle = "#FFF";
  ctx.font = "50px serif";
  ctx.textAlign = "center";
  const x = GAME_WIDTH / 2;
  ctx.fillText("GAME CLEAR", x, 300);
}

function handle_keys(game) {
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
  } else if (keys["space"]) {
    if (game.player.cooldown < 0) {
      game.player.cooldown = PLAYER_BULLET_COOLDOWN;

      let offset = (ENTITY_SIZE/2 - BULLET_WIDTH/2)
      game.player_bullets.push(
        {
          x: game.player.x + offset,
          y: game.player.y - 10,
          vel: DEFAULT_BULLET_VEL,
        }
      )
    }
  }
}

function is_right_edge(enemies) {
  for (let i=0; i<enemies.length; i++) {
    const enemy = enemies[i];
    if (enemy.col === GAME_MAX_COL-1) {
      return true;
    }
  }
  return false;
}

function is_left_edge(enemies) {
  for (let i=0; i<enemies.length; i++) {
    const enemy = enemies[i];
    if (enemy.col === 0) {
      return true;
    }
  }
  return false;
}

function move_enemies_down(enemies) {
  for (let i=0; i<enemies.length; i++) {
    enemies[i].row += 1;
  }
}

function move_enemies(game) {
  const right_edge = is_right_edge(game.enemies);
  if (right_edge && game.enemy_context.is_going_right) {
    game.enemy_context.is_going_right = false;
    game.enemy_context.is_going_left = true;
    move_enemies_down(game.enemies);
    return;
  }

  const left_edge = is_left_edge(game.enemies);
  if (left_edge && game.enemy_context.is_going_left) {
    game.enemy_context.is_going_right = true;
    game.enemy_context.is_going_left = false;
    move_enemies_down(game.enemies);
    return;
  }

  for (let i=0; i<game.enemies.length; i++) {
    const enemy = game.enemies[i];
    if (game.enemy_context.is_going_left) {
      enemy.col -= 1;
    } else if (game.enemy_context.is_going_right) {
      enemy.col += 1;
    }
  }
}

function move_player_bullets(game) {
  let new_bullets = game.player_bullets.slice()
  for (let i=0; i<game.player_bullets.length; i++) {
    let bullet = game.player_bullets[i];
    bullet.y -= bullet.vel;

    if (bullet.y < 0) {
      new_bullets.splice(i, 1);
    }
  }

  game.player_bullets = new_bullets;
}

function check_collision(game) {
  for (let i=0; i<game.enemies.length; i++) {
    const enemy = game.enemies[i];
    const ex = enemy.col * ENTITY_SIZE;
    const ey = enemy.row * ENTITY_SIZE;

    // 衝突判定
    if (game.player.x <= ex + ENTITY_SIZE && ex <= game.player.x + ENTITY_SIZE && game.player.y <= ey + ENTITY_SIZE && ey <= game.player.y + ENTITY_SIZE) {
      game.player.life -= 1
    }
  }

  for (let i = game.player_bullets.length - 1; i >= 0; i--) {
    for (let j = game.enemies.length - 1; j >= 0; j--) {
      const bullet = game.player_bullets[i];
      const enemy = game.enemies[j];
      const ex = enemy.col * ENTITY_SIZE;
      const ey = enemy.row * ENTITY_SIZE;

      if (bullet.x <= ex + ENTITY_SIZE && ex <= bullet.x + BULLET_WIDTH &&
          bullet.y <= ey + ENTITY_SIZE && ey <= bullet.y + BULLET_HEIGHT) {
        game.enemies.splice(j, 1);
        game.player_bullets.splice(i, 1);
        break;
      }
    }
  }
}

function update(game) {
  handle_keys(game);

  move_player_bullets(game);

  if (game.enemy_context.moving_counter > ENEMY_MOVE_INTERVAL) {
    game.enemy_context.moving_counter = 0;
    move_enemies(game);
  }

  if (game.enemies.length === 0) {
    game.is_over = true;
  }

  for (let i=0; i<game.enemies.length; i++) {
    if (game.enemies[i].row >= GAME_MAX_ROW) {
      game.is_clear = true;
    }
  }

  check_collision(game);
}

function game_loop(ctx, game) {
  if (game.is_over) {
    draw_background(ctx);
    draw_gameover(ctx, game);
  } else if (game.is_clear) {
    draw_background(ctx);
    draw_gameclear(ctx, game);
  } else {
    draw(ctx, game);
    update(game);

    game.player.cooldown -= 1;
    game.enemy_context.moving_counter += 1;
  }
}

// Initialize
window.addEventListener("load", () => {
  // ゲームを動かすために必要な設定
  window.addEventListener("keyup", (event) => {
    switch (event.key) {
      case "ArrowLeft":
        keys["left"] = false;
        break;
      case "ArrowRight":
        keys["right"] = false;
        break;
      case " ":
        keys["space"] = false;
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
      case " ":
        keys["space"] = true;
        break;
    }
  });

  // ゲーム本体の初期化
  const canvas = document.createElement("canvas");
  const container = document.getElementById("container");
  container.appendChild(canvas);

  canvas.width = GAME_WIDTH;
  canvas.height = GAME_HEIGHT;

  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  let game = new_game();

  function loop() {
    game_loop(ctx, game);
    requestAnimationFrame(loop);
  }

  // リトライボタン
  const retry_button = document.getElementById("retry-button");
  retry_button.addEventListener("click", () => { game = new_game(); })
  
  requestAnimationFrame(loop);
});



// TODO: Collision
