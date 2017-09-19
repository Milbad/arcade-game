//canvas
var colWidth = 101;
var rowHeight = 83;
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
var startX = 0;
var startY = 510;
//Arrival
var arrivalX = 590;
var arrivalY = -5;
//Ennemies starting position and mouvement
var enemyStartX = -200;
var enemyWidth = 101;
var move = 600;
var minSpeed = 200;
var maxSpeed = 300;
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
    this.speed = Speed(minSpeed, maxSpeed);
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
    if (this.x > arrivalX + enemyWidth) {
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
            var newY = (move * dt) * aleas;
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
// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function() {
    // Variables applied to each of our instances go here
    this.sprite = playerSprite;
    this.x = startX;
    this.y = startY;
};
// Draw the player on the screen, required method for game
Player.prototype.render = function() {
    ctx.drawImage(Resources.get(playerSprite), this.x, this.y);
    if (playerLifes > 0 && this.x >= arrivalX && this.y <= arrivalY) {
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
            if (this.x > startX) {
                this.x -= 20;
            }
            break;
        case "right": // x cannot be bigger than 590
            if (this.x <= arrivalX) {
                this.x += 20;
            }
            break;
        case "up": // y cannot be smaller than -5
            if (this.y > arrivalY) {
                if (this.y < 30 && this.x < arrivalX) {
                    sndSplash.play();
                    setTimeout(removeLife, 500);
                }
                this.y -= 20;
            }
            break;
        case "down": // y cannot be bigger than 510
            if (this.y <= startY) {
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
    this.x = colWidth * Math.floor(random(0, 7));
    this.y = rowHeight * Math.floor(random(1, 4));
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
    for (var i = 0; i < array.length; i++) {
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
    for (var i = 0; i < allStars.length; i++) {
        allStars[i].x = colWidth * Math.floor(random(0, 7));
        allStars[i].y = rowHeight * Math.floor(random(1, 4));
    }
};
var replaceStar = function(i) {
    allStars[i].x = colWidth * Math.floor(random(0, 7));
    allStars[i].y = rowHeight * Math.floor(random(1, 4));
};
var initPlayer = function() {
    player.x = startX;
    player.y = startY;
};

var initEnemy = function(i) {
    allEnemies[i].x = enemyStartX;
    allEnemies[i].y = random(55, 320);
    if (currentLevel !== 3) {
        allEnemies[i].speed = Speed(minSpeed, maxSpeed);
    }
};
var hideStars = function(j, array) {
    array[j].x = -400;
};

var checkCollisions = function(firstx, firsty, array2, mindistance, mytest) {
    for (var j = 0; j < array2.length; j++) {
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
var maxEnemies = 3;
// Place all enemy objects in an array called allEnemies
var allEnemies = [];
for (var i = 0; i < maxEnemies; i++) {
    allEnemies[i] = new Enemy(enemyStartX, random(55, 320));
}
//Create myPlayer object
var myPlayer = new Player();
// Place the player object in a variable called player
var player = myPlayer;

//Create Stars object
var maxStars = 10;
var allStars = [];
for (var i = 0; i < maxStars; i++) {
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