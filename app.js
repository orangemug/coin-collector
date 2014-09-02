function parseLevel(text) {
  var d, out = [];
  text.split("\n").forEach(function(line) {
    d = line.split("");
    if(d.length > 0) {
      out.push(d);
    }
  });
  return out;
}


var scoreText, gameOverText, enemies, enemy, coins, platforms, player, cursors;
var raw = document.getElementById("level").text
var level = parseLevel(raw);
var gameOver = false;


var game = new Phaser.Game(580, 480, Phaser.AUTO, '', {
  preload: preload,
  create:  create,
  update:  update
});
 
function preload() {
  // Load assets
  game.load.image('player', 'assets/player.png');
  game.load.image('ground', 'assets/platform.png');
  game.load.image('enemy',  'assets/enemy.png');
  game.load.image('coin',   'assets/coin.png');
}

var score = 0;
 
function create() {
  game.physics.startSystem(Phaser.Physics.ARCADE);

  platforms = game.add.group();
  enemies = game.add.group();

  platforms.enableBody = true;

  var isSet = false;
  level.forEach(function(row, y) {
    row.forEach(function(i, x) {
      if(isSet) return;
      if(i === "1") {
        var g = platforms.create(x*20, y*20, 'ground');
        g.body.immovable = true;
      }
    });
  });

  player = game.add.sprite((game.world.width/2)-20, game.world.height - 350, 'player');
 
  game.physics.arcade.enable(player);
 
  player.body.velocity.x = 100;
  player.body.gravity.y  = 300;

  cursors = game.input.keyboard.createCursorKeys();


  coins = game.add.group();
  coins.enableBody = true;

  scoreText = game.add.text(30, 30, score, {
    fill: '#fff',
  });

  gameOverText = game.add.text(game.world.width/2, 190, '', {
    align: "center",
    fill: '#fff'
  });

  gameOverText.anchor.set(0.5);
}


var coinPos = [
  {x: 3,  y: 3},
  {x: 26, y: 3},
  {x: 14, y: 9},
  {x: 3,  y: 20},
  {x: 26, y: 20}
]

var worldHasCoin = false;


function addCoin() {
  var r = Math.floor(Math.random() * coinPos.length);
  var cp = coinPos[r];

  worldHasCoin = true;

  //  Create a coin inside of the 'coins' group
  var coin = coins.create(cp.x*20, cp.y*20, 'coin');
}

var nextCreatePlayer = Date.now();
var initialVelo = 100;
var nextEnemyInterval = 1000*3;

 
function update() {
  game.physics.arcade.collide(player, platforms);
  game.physics.arcade.collide(coins, platforms);

  if(!worldHasCoin) {
    addCoin();
  }

  if(nextCreatePlayer < Date.now() && !gameOver) {
    nextCreatePlayer = Date.now() + nextEnemyInterval;
    nextEnemyInterval -= 100;
    createEnemy();
  }

  game.physics.arcade.overlap(player, coins, collectStar, null, this);
  game.physics.arcade.overlap(player, enemies, killPlayer, null, this);


  enemies.forEach(function(enemy) {
    game.physics.arcade.collide(enemy, platforms);

    if(enemy.body.touching.right) {
      enemy.body.velocity.x = -100;
    } else if(enemy.body.touching.left) {
      enemy.body.velocity.x = 100;
    }

    if(enemy.body.position.y > game.world.height) {
      enemy.kill();
    }
  })

  if(player.body.position.y > game.world.height) {
    killPlayer(player);
  }

  //  Reset the players velocity (movement)
  player.body.velocity.x = 0;


  if (cursors.left.isDown) {
    player.body.velocity.x = -150;
  } else if (cursors.right.isDown) {
    player.body.velocity.x = 150;
  }

  //  Allow the player to jump if they are touching the ground.
  if (
    (
      cursors.up.isDown
      || (game.input.keyboard._keys[32] && game.input.keyboard._keys[32].isDown) 
    )
    && player.body.touching.down
  ) {
    player.body.velocity.y = -350;
  }

}


function createEnemy() {
  var enemy = enemies.create(280, 00, 'enemy');
 
  //  We need to enable physics on the enemy
  game.physics.arcade.enable(enemy);
 
  enemy.body.gravity.y = 300;
  enemy.body.velocity.x = initialVelo;
  
  initialVelo = -initialVelo;
}


function collectStar(player, coin) {
  score++;
  scoreText.text = score;
  coin.kill();
  worldHasCoin = false;
}

function killPlayer(player) {
  player.kill();
  gameOverText.text = "GAME OVER\nENTER TO RESTART";
  score = 0;
  gameOver = true;
}


document.addEventListener("keydown", function(e) {
  if(e.keyCode === 13 && gameOver) {
    nextEnemyInterval = 1000*3;
    worldHasCoin = false;
    gameOverText.text = "";
    gameOver = false;
    game.state.start(game.state.current);
  }
})


