//canvas
var COL_WIDTH = 101;
var ROW_HEIGHT = 83;
//obstacles
var rockImages = 'images/Rock.png';
var treeImages = 'images/Tree.png';
//initialize variable
var currentLevel = 0;
var playerSprite = "";
var difficulty = "";
var gameOver = false;
var winLevel = false;
var winGame = false;
var score = 0;
//player's start position
var START_X = 0;
var START_Y = 510;
//Arrival
var ARRIVAL_X = 590;
var ARRIVAL_Y = -5;
//Ennemies starting position and mouvement
var ENEMY_STARTX = -200;
var ENEMY_WIDTH = 101;
var MOVE = 600;
var MIN_SPEED = 200;
var MAX_SPEED = 300;
// playerLifes
var playerLifes = 3;
//sounds
var sndCrash = new Audio("sounds/crash.wav");
var sndWinLevel = new Audio("sounds/petitbruit.wav");
var sndWin = new Audio("sounds/personcheering.wav");
var sndSplash = new Audio("sounds/Splash.wav");
var sndCollect = new Audio("sounds/Blop.wav");
var sndEat = new Audio("sounds/bite.wav");

//store value of the variables on click events
//select the LEVEL
document.getElementById("easy").addEventListener("click", function() {
    difficulty = "easy";
    selectedImg("easy", "normal", "difficult", "", "chosen");
});
document.getElementById("normal").addEventListener("click", function() {
    difficulty = "normal";
    selectedImg("normal", "easy", "difficult", "", "chosen");
});
document.getElementById("difficult").addEventListener("click", function() {
    difficulty = "difficult";
    selectedImg("difficult", "easy", "normal", "", "chosen");
});
//To select the player image
document.getElementById("boy").addEventListener("click", function() {
    playerSprite = "images/char-boy.png";
    selectedImg("boy", "cat-girl", "horn-girl", "princess", "selected");
});
document.getElementById("cat-girl").addEventListener("click", function() {
    playerSprite = "images/char-cat-girl.png";
    selectedImg("cat-girl", "boy", "horn-girl", "princess", "selected");
});
document.getElementById("horn-girl").addEventListener("click", function() {
    playerSprite = "images/char-horn-girl.png";
    selectedImg("horn-girl", "cat-girl", "boy", "princess", "selected");
});
document.getElementById("princess").addEventListener("click", function() {
    playerSprite = "images/char-princess-girl.png";
    selectedImg("princess", "horn-girl", "cat-girl", "boy", "selected");
});
//the start button launch the game
document.getElementById("play").addEventListener("click", function() {
    if (playerSprite === "") {
        alert("You have to choose a hero!");
    }
    else{
        switch (difficulty) {
            case "easy":
                currentLevel = 1;
                break;
            case "normal":
                currentLevel = 2;
                break;
            case "difficult":
                currentLevel = 3;
                break;
            default:
                currentLevel = 0;
                break;
        }

        if (currentLevel === 0) {
            alert("You have to choose a difficulty level!");
        }
    }

});
//the OK button on the game over screen
document.getElementById("stay").addEventListener("click", function() {
    resetAll();

});
//The Play again button on the WIN Screen
document.getElementById("again").addEventListener("click", function() {
    resetAll();

});
//ENEMIES
// Enemies our player must avoid
var Enemy = function(x, y, sprite) {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started
    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = "images/enemy-bug.png";
    this.x = x;
    this.y = y;
    this.speed = Speed(MIN_SPEED, MAX_SPEED);
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    if (currentLevel === 3) {
        this.speed = 200;
    }
    if (this.x > ARRIVAL_X + ENEMY_WIDTH) {
        var index = findIndex(allEnemies, this.x);
        initEnemy(index);
    }
    this.x += this.speed * dt;
    if (checkCollisions(this.x, this.y, allStars, 50, hideStars)) {
        sndEat.play();
    }
    if (currentLevel !== 1) {
        if (checkCollisions(this.x, this.y, allObstacles, 85)) {
            var aleas = Math.floor(random(-1, 1));
            while (aleas === 0) {
                aleas = Math.floor(random(-1, 1));
            }
            var newY = (MOVE * dt) * aleas;
            if ((this.y += newY) < 0) {
                this.y = 20;
            } else {
                this.y += newY;
            }
        }
    }
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};
//PLAYER
// Write player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function() {
    // Variables applied to each of our instances go here
    this.sprite = playerSprite;
    this.x = START_X;
    this.y = START_Y;
};
// Draw the player on the screen, required method for game
Player.prototype.render = function() {
    ctx.drawImage(Resources.get(playerSprite), this.x, this.y);
    if (playerLifes > 0 && this.x >= ARRIVAL_X && this.y <= ARRIVAL_Y) {
        if (currentLevel != 3) {
            winLevel = true;
            score += 100;
            addScore();
            initStars();
            sndWinLevel.play();
            initPlayer();
        } else {
            winLevel = true;
            winGame = true;
            score += 100;
            addScore();
            initStars();
            sndWin.play();
            initPlayer();
        }
    }
    if (playerLifes < 1) {
        winGame = false;
        winLevel = false;
        initStars();
        gameOver = true;
        score = 0;
        addScore();
    }
};

Player.prototype.update = function() {
    if (checkCollisions(this.x, this.y, allEnemies, 50, removeLife)) {
        sndCrash.play();
    }
    if (checkCollisions(this.x, this.y, allStars, 50, hideStars)) {
        sndCollect.play();
        score += 20;
        addScore();
    }

};

Player.prototype.handleInput = function(key) {
    var oldX = player.x;
    var oldY = player.y;
    switch (key) {
        case "left": // x cannot be smaller than 0
            if (this.x > START_X) {
                this.x -= 20;
            }
            break;
        case "right": // x cannot be bigger than 590
            if (this.x <= ARRIVAL_X) {
                this.x += 20;
            }
            break;
        case "up": // y cannot be smaller than -5
            if (this.y > ARRIVAL_Y) {
                if (this.y < 30 && this.x < ARRIVAL_X) {
                    sndSplash.play();
                    setTimeout(removeLife, 500);
                }
                this.y -= 20;
            }
            break;
        case "down": // y cannot be bigger than 510
            if (this.y <= START_Y) {
                this.y += 20;
            }
            break;
        default:
            console.log("wrong key for moving player");
    }
    if (currentLevel !== 1) {
        if (checkCollisions(player.x, player.y, allObstacles, 50)) {
            player.x = oldX;
            player.y = oldY;
        }
    }
};
//STARS
var Star = function() {
    this.sprite = "images/Star.png";
    this.x = COL_WIDTH * Math.floor(random(0, 7));
    this.y = ROW_HEIGHT * Math.floor(random(1, 4));
};

Star.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Star.prototype.update = function() {
    if (currentLevel !== 1) {
        if (checkCollisions(this.x, this.y, allObstacles, 80)) {
            var index = findIndex(allStars, this.x);
            replaceStar(index);
        }
    }
};
//OBSTACLES
var Obstacle = function(sprite, x, y) {
    this.sprite = sprite;
    this.x = x;
    this.y = y;
};

Obstacle.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};


//FUNCTIONS
var random = function(low, high) {
    var range = high - low + 1;
    return (Math.random() * range) + low;
};

var selectedImg = function(toadd, toremove1, toremove2, toremove3, classname) {
    document.getElementById(toadd).classList.add(classname);
    document.getElementById(toremove1).classList.remove(classname);
    if (toremove2 !== "") {
        document.getElementById(toremove2).classList.remove(classname);
    }
    if (toremove3 !== "") {
        document.getElementById(toremove3).classList.remove(classname);
    }
};

var Speed = function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1));
};

var findIndex = function(array, value) {
    var len = array.length;
    for (var i = 0; i < len; i++) {
        if (array[i].x == value) {
            return i;
        }
    }
};
var resetAll = function() {
    currentLevel = 0;
    playerLifes = 3;
    gameOver = false;
    winLevel = false;
    winGame = false;
    difficulty = "";
    score = 0;
    addScore();
    initPlayer();
    document.getElementById("life1").hidden = false;
    document.getElementById("life2").hidden = false;
    document.getElementById("life3").hidden = false;
    document.getElementById("level").innerHTML = "Level: Easy";
};
var addScore = function() {
    if (winGame) {
        document.getElementById("finalscore").innerHTML = "Your final score is: " + score;
    }
    document.getElementById("score").innerHTML = "My score: " + score;
};
var removeLife = function() {
    initPlayer();
    if (playerLifes > 0) {
        playerLifes -= 1;
        if (playerLifes === 3) {
            document.getElementById("life1").hidden = false;
            document.getElementById("life2").hidden = false;
            document.getElementById("life3").hidden = false;
        }
        if (playerLifes === 2) {
            document.getElementById("life3").hidden = true;
            document.getElementById("life2").hidden = false;
            document.getElementById("life1").hidden = false;
        }
        if (playerLifes === 1) {
            document.getElementById("life3").hidden = true;
            document.getElementById("life2").hidden = true;
            document.getElementById("life1").hidden = false;
        }
    }

};

var initStars = function() {
    var len = allStars.length;
    for (var i = 0; i < len; i++) {
        allStars[i].x = COL_WIDTH * Math.floor(random(0, 7));
        allStars[i].y = ROW_HEIGHT * Math.floor(random(1, 4));
    }
};
var replaceStar = function(i) {
    allStars[i].x = COL_WIDTH * Math.floor(random(0, 7));
    allStars[i].y = ROW_HEIGHT * Math.floor(random(1, 4));
};
var initPlayer = function() {
    player.x = START_X;
    player.y = START_Y;
};

var initEnemy = function(i) {
    allEnemies[i].x = ENEMY_STARTX;
    allEnemies[i].y = random(55, 320);
    if (currentLevel !== 3) {
        allEnemies[i].speed = Speed(MIN_SPEED, MAX_SPEED);
    }
};
var hideStars = function(j, array) {
    array[j].x = -400;
};

var checkCollisions = function(firstx, firsty, array2, mindistance, mytest) {
    var len= array2.length;
    for (var j = 0; j < len; j++) {
        var distance = Math.sqrt((Math.pow(firstx - array2[j].x, 2)) + (Math.pow(firsty - array2[j].y, 2)));
        if (distance < mindistance) {
            if (mytest !== undefined) {
                mytest(j, array2);
            }
            return true;
        }
    }
};
// Now instantiate your objects.
//Create Ennemies object
var MAX_ENEMIES = 3;
// Place all enemy objects in an array called allEnemies
var allEnemies = [];
for (var i = 0; i < MAX_ENEMIES; i++) {
    allEnemies[i] = new Enemy(ENEMY_STARTX, random(55, 320));
}
//Create myPlayer object
var myPlayer = new Player();
// Place the player object in a variable called player
var player = myPlayer;

//Create Stars object
var MAX_STARS = 10;
var allStars = [];
for (var i = 0; i < MAX_STARS; i++) {
    allStars[i] = new Star();
}

//Obstacles
var obstacle1 = new Obstacle(rockImages, 0, 135);
var obstacle2 = new Obstacle(treeImages, 101, 305);
var obstacle3 = new Obstacle(treeImages, 404, 135);
var obstacle4 = new Obstacle(rockImages, 606, 215);
var obstacle5 = new Obstacle(rockImages, 303, 305);
var allObstacles = [obstacle1, obstacle2, obstacle3, obstacle4, obstacle5];
// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener("keydown", function(e) {
    var allowedKeys = {
        37: "left",
        38: "up",
        39: "right",
        40: "down"
    };

    player.handleInput(allowedKeys[e.keyCode]);

});
