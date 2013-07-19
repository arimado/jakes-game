var canvasBg = document.getElementById('canvasBg'),
    ctxBg = canvasBg.getContext("2d"),
    canvasEntities = document.getElementById('canvasEntities'),
    ctxEntities = canvasEntities.getContext("2d"),
    canvasWidth = canvasBg.width,
    canvasHeight = canvasBg.height,
    player1 = new Player(), //this object is connected to update(); 
    enemies = [],
    numEnemies = 5, // number of enemies we spawn at the start
    obstacles = [],
    isPlaying = false,
    requestAnimFrame = window.requestAnimationFrame ||
                       window.webkitRequestAnimationFrame ||
                       window.mozRequestAnimationFrame ||
                       window.oRequestAnimationFrame ||
                       window.msRequestAnimationFrame ||
                       function(callback) {
                            window.setTimeout(callback, 1000 / 60);
                       },
imgSprite = new Image();
imgSprite.src = "images/sprite.png";
imgSprite.addEventListener('load', init, false); 

function init() {
    begin();
     document.addEventListener('keydown', function(e) {checkKey(e, true);}, false);
     document.addEventListener('keyup', function(e) {checkKey(e, false);}, false);
     defineObstacles();
     initEnemies();
}

function begin() {
    ctxBg.drawImage(imgSprite, 0, 0, canvasWidth, canvasHeight, 0, 0, canvasWidth, canvasHeight); //to draw something you have to choose a ctx
    isPlaying = true;
    requestAnimFrame(loop);
}

function update() {
    clearCtx(ctxEntities);
    player1.update();
    player1.checkDirection();
    updateAllEnemies();
}

function draw() {
    drawAllEnemies();
    player1.draw();
}

function loop() {
    if(isPlaying) {
        update();
        draw();
        requestAnimFrame(loop);
    }
}

function clearCtx(ctx) {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
}

function randomRange (min, max) {
    return Math.floor(Math.random() * (max + 1 - min)) + min;
}

function Player() {
    this.srcX = 0;
    this.srcY = 600;
    this.width = 35;
    this.height = 54;
    this.drawX = 400;
    this.drawY = 300;
    this.centerX = this.drawX + (this.width / 2); //collision detection
    this.centerY = this.drawY + (this.height / 2);
    this.speed = 2;
    this.isUpKey = false;
    this.isRightKey = false;
    this.isLeftKey = false;
    this.isSpacebar = false;
    this.isShooting = false;
    var numBullets = 10;
    this.bullets = [];
    this.currentBullet = 0;
    for (var i = 0; i < numBullets; i++) {
        this.bullets[this.bullets.length] = new Bullet(); //adds new bullet to the bullet list
    }
}

Player.prototype.update = function () {  //prototype is adding a
    this.centerX = this.drawX + (this.width / 2); //this just recalculates collision center
    this.centerY = this.drawY + (this.height / 2);
    this.checkShooting();
    this.updateAllBullets();
};


Player.prototype.draw = function () {
    this.drawAllBullets();
    ctxEntities.drawImage(imgSprite, this.srcX, this.srcY, this.width, this.height, this.drawX, this.drawY, this.width, this.height); 
};

Player.prototype.checkDirection = function () {
    var newDrawX = this.drawX, 
        newDrawY = this.drawY,
        obstacleCollision = false;
    if (this.isUpKey) {
        newDrawY -= this.speed;
        this.srcX = 35; 
    } else if (this.isDownKey) {
        newDrawY += this.speed;
        this.srcX = 0; 
    } else if (this.isRightKey) {
        newDrawX += this.speed;
        this.srcX = 105; 
    } else if (this.isLeftKey) {
        newDrawX -= this.speed;
        this.srcX = 70; 
    } 

    obstacleCollision = this.checkObstacleCollide(newDrawX, newDrawY);

    if (!obstacleCollision && !outOfBounds(this, newDrawX, newDrawY)) {
        this.drawX = newDrawX; 
        this.drawY = newDrawY;
    } 
}

Player.prototype.checkObstacleCollide = function (newDrawX, newDrawY) { // paramaters are the center of the character
    var obstacleCounter = 0, 
        newCenterX = newDrawX + (this.width / 2),
        newCenterY = newDrawY + (this.height / 2);
        for (var i = 0; i < obstacles.length; i++) {
            if (obstacles[i].leftX < newCenterX && newCenterX < obstacles[i].rightX && obstacles[i].topY - 20 < newCenterY && newCenterY < obstacles[i].bottomY - 20) {
                obstacleCounter = 0; 
            } else {
                obstacleCounter++;
            }
        }

        if (obstacleCounter === obstacles.length) { //if there are as much obstacle counter as length of obstacle than there hasnt been a collision. 
            return false; 
        } else {
            return true;
        }
}


Player.prototype.checkShooting = function () {
    if (this.isSpacebar && !this.isShooting) {
        this.isShooting = true;
        this.bullets[this.currentBullet].fire(this.centerX, this.centerY); //this allows for recycling - allows us to use the current bullet within the array or something. cant you feel it bro?
        this.currentBullet++;                                 //na soz i dont get it actually. we'll try again later. 
        if (this.currentBullet >= this.bullets.length) {
            this.currentBullet = 0; 
        }
    } else if (!this.isSpacebar) {
        this.isShooting = false; 
    }
};

Player.prototype.updateAllBullets = function () {
    for (var i = 0; i < this.bullets.length; i++) {
        if (this.bullets[i].isFlying) {
            this.bullets[i].update();
        }
    }
};

Player.prototype.drawAllBullets = function () {
    for (var i = 0; i < this.bullets.length; i++) {
        if (this.bullets[i].isFlying) {
            this.bullets[i].draw();
        }
    }
};



/*------------------------------ BULLET FUNCTIONS
*/

function Bullet() {
    this.radius = 2;
    this.width = this.radius * 2; //seems kind of useless but we do need them later on for collision
    this.height = this.radius *2; // testing
    this.drawX = 0; //we are refrencing an inbuilt drawn circle and this apparently
    this.drawY = 0; //refferences the center point. Not the top left.
    this.isFlying = false;
    this.xVel = 0;
    this.yVel = 0;
    this.speed = 6;
}

Bullet.prototype.update = function () { //this is how the bullet moves.
    this.drawX += this.xVel;
    this.drawY += this.yVel;
    this.checkHitEnemy();
    this.checkHitObstacle();
    this.checkOutOfBounds();
};

Bullet.prototype.draw = function () {
    ctxEntities.fillStyle = "white";
    ctxEntities.beginPath();
    ctxEntities.arc(this.drawX, this.drawY, this.radius, 0, Math.PI * 2, false);
    ctxEntities.closePath();
    ctxEntities.fill(); //this fills in the circle
};

Bullet.prototype.fire = function (startX, startY) {
    var soundEffect = new Audio('audio/shooting.wav');
    soundEffect.play();
    this.drawX = startX;
    this.drawY = startY;
    if (player1.srcX === 0) {
        this.xVel = 0;
        this.yVel = this.speed;
    } else if (player1.srcX === 35) {
        thisxVel = 0;
        this.yVel = -this.speed;
    } else if (player1.srcX === 70) {
        this.xVel = -this.speed;
        this.yVel = 0;
    } else if (player1.srcX === 105) {
        this.xVel = this.speed;
        this.yVel = 0;
    }

    this.isFlying = true;
};


Bullet.prototype.recycle = function () {
    this.isFlying = false; //this 

};

Bullet.prototype.checkHitEnemy = function () {
    for (var i = 0; i < enemies.length; i++) {
        if (collision(this, enemies[i]) && !enemies[i].isDead) {
            this.recycle();
            enemies[i].die();
        }
    }
};

Bullet.prototype.checkHitObstacle = function () {
      for (var i = 0; i < obstacles.length; i++) {
        if (collision(this, obstacles[i])) {
            this.recycle();
        }
    }
};

Bullet.prototype.checkOutOfBounds = function () {
    if (outOfBounds(this, this.drawX, this.drawY)) {
        this.recycle(); 
    }
};



/*-------------------------------- END OF BULLET FUNCTIONS
*/



function Obstacle(x, y, w, h) {
    this.drawX = x;
    this.drawY = y;
    this.width = w;
    this.height = h;
    this.leftX = this.drawX;
    this.rightX = this.drawX + this.width;
    this.topY = this.drawY;
    this.bottomY = this.drawY + this.height;
}

function defineObstacles() {
    var treeWidth = 65,
        treeHeight = 90,
        rockDimensions = 30, 
        bushHeight = 28; 

    obstacles = [ //like this --> new Obstacle(srcX on canvas, srcY on canvas, width on canvas, Height on canvas)
        new Obstacle(78, 360, treeWidth, treeHeight),   
        new Obstacle(390, 395, treeWidth, treeHeight),
        new Obstacle(415, 102, treeWidth, treeHeight),
        new Obstacle(619, 184, treeWidth, treeHeight),
        new Obstacle(97, 63, rockDimensions, rockDimensions),
        new Obstacle(296, 379, rockDimensions, rockDimensions),
        new Obstacle(295, 25, 150, bushHeight),
        new Obstacle(570, 138, 150, bushHeight),
        new Obstacle(605, 492, 90, bushHeight)
        ];
}



/*----------------------------- ENEMY FUNCTIONS 
--*/

function Enemy() {
    this.srcX = 140;
    this.srcY = 600;
    this.width = 45;
    this.height = 54;
    this.drawX = randomRange(0, canvasWidth - this.width);
    this.drawY = randomRange(0, canvasHeight - this.height);
    this.centerX = this.drawX + (this.width / 2);
    this.centerY = this.drawY + (this.height / 2);
    this.targetX = this.centerX; // these are the position or point that the enemy is going to move to randomly
    this.targetY = this.centerY; //
    this.randomMoveTime = randomRange(4000, 10000);
    var that = this;
    this.moveInterval = setInterval(function() {that.setTargetLocation();}, that.randomMoveTime); //apparently within an anonymous function (or maybe any other function im not sure, using 'this' wont correspond the way you want it. using that as a local variable to the object you would like to reference and inputting that isntead inside the anonmyous makes right.
    this.speed = 1;
    this.isDead = false;
}


Enemy.prototype.update = function () {
    this.centerX = this.drawX + (this.width / 2);
    this.centerY = this.drawY + (this.height / 2);
    this.checkDirection();
};

Enemy.prototype.draw = function () {
    ctxEntities.drawImage(imgSprite, this.srcX, this.srcY, this.width, this.height, this.drawX, this.drawY, this.width, this.height) //Might be wrong here 
};

function initEnemies() {
    for (var i = 0; i < numEnemies; i++) {
        enemies[enemies.length] = new Enemy();
    }
}

function updateAllEnemies() {
    for (var i = 0; i < enemies.length; i++) {
        enemies[i].update();
    }
}

function drawAllEnemies() {
    for (var i = 0; i < enemies.length; i++) {
        enemies[i].draw();
    }
}

Enemy.prototype.setTargetLocation = function () {
    this.randomMoveTime = randomRange(4000, 10000);
    var minX = this.centerX - 50,
        maxX = this.centerX + 50,
        minY = this.centerY - 50, 
        maxY = this.centerY + 50;

    if (minX < 0) {
        minX = 0;
    };
    if (maxX > canvasWidth) {
        minX = canvasWidth;
    };
    if (minY < 0) {
        minY = 0;
    };
    if (maxY > canvasHeight) {
        maxY = canvasHeight;
    };

    this.targetX = randomRange(minX, maxX);
    this.targetY = randomRange(minY, maxY);
};

Enemy.prototype.checkDirection = function () {
    if (this.centerX < this.targetX) {
        this.drawX += this.speed;
    } else if (this.centerX > this.targetX) {
        this.drawX -= this.speed;
    }
    if (this.centerY < this.targetY) {
        this.drawY += this.speed;
    } else if (this.centerY > this.targetY) {
        this.drawY -= this.speed; 
    }
};

Enemy.prototype.die = function () {
    var soundEffect = new Audio('audio/dying.wav'); // audio part of the javascript api?
    soundEffect.play();
    clearInterval(this.moveInterval); //stops the enemy from moving around. 
    this.srcX = 185;
    this.isDead = true;
};



/*------------------------------- END ENEMY FUNCTION
---*/


function checkKey(e, value) {
    var keyID = e.keyCode || e.which;
    if (keyID === 38) { // up
        player1.isUpKey = value;
        e.preventDefault(); 
    }
    if (keyID === 39) { // up
        player1.isRightKey = value;
        e.preventDefault(); 
    }
    if (keyID === 40) { // down
        player1.isDownKey = value;
        e.preventDefault(); 
    }
    if (keyID === 37) { // up
        player1.isLeftKey = value;
        e.preventDefault(); 
    }
    if (keyID === 32) { // Spacebar
        player1.isSpacebar = value;
        e.preventDefault(); 
    }

}

function outOfBounds(a, x, y) {
    var newBottomY = y + a.height,
        newTopY = y,
        newRightX = x + a.width,
        newLeftX = x,
        treeLineTop = 5,
        treeLineBottom = 570,
        treeLineRight = 750,
        treeLineLeft = 65;

        return newBottomY > treeLineBottom || 
            newTopY < treeLineTop || 
            newRightX > treeLineRight || 
            newLeftX < treeLineLeft;
}

function collision(a, b) {
    return a.drawX <= b.drawX + b.width &&
        a.drawX >= b.drawX  &&
        a.drawY <= b.drawY + b.height &&
        a.drawY >= b.drawY;
};




















