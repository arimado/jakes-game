var canvasBg = document.getElementById('canvasBg'),
    ctxBg = canvasBg.getContext("2d"),
    canvasEntities = document.getElementById('canvasEntities'),
    ctxEntities = canvasEntities.getContext("2d"),
    canvasWidth = canvasBg.width,
    canvasHeight = canvasBg.height,
    player1 = new Player(), //this object is connected to update(); 
    //enemies = [],
    //numEnemies = 5,
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
}

function draw() {
    player1.draw();
}

function loop() {
    if(isPlaying) {
        console.log('looping');
        update();
        draw();
        requestAnimFrame(loop);
    }
}

function clearCtx(ctx) {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
}

function randomRange (min, max) {
    // INCOMPLETE FUCNITON *************
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
    //this.isShooting = false;
    var numBullets = 10;
    // INCOMPLETE FUNCTION **********
    //for (var i = 0; i < numBullets; i++) {
        //this.bullets[this.bullets.length] = new Bullet(); //adds new bullet to the bullet list
    //}
}

Player.prototype.update = function () {  //prototype is adding a
    this.centerX = this.drawX + (this.width / 2); //this just recalculates collision center
    this.centerY = this.drawY + (this.height / 2);
    //INCOMPLETE functions ***********
};


Player.prototype.draw = function () {
    //INCOMPLETE 
    ctxEntities.drawImage(imgSprite, this.srcX, this.srcY, this.width, this.height, this.drawX, this.drawY, this.width, this.height); 
}

Player.prototype.checkDirection = function () {
    var newDrawX = this.drawX, 
        newDrawY = this.drawY,
        obstacleCollision = false;
    if (this.isUpKey) {
        newDrawY -= this.speed;
        this.srcX = 35; //facing north (changes the player image.)
        console.log('true');
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

Player.prototype.checkObstacleCollide = function (newDrawX, newDrawY) {
    var obstacleCounter = 0, 
        newCenterX = newDrawX + (this.width / 2),
        newCenterY = newDrawY + (this.width / 2);
        for (var i; i < obstacles.length; i++) {
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
        bushHeight = 28, 

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


function checkKey(e, value) {
    var keyID = e.keyCode || e.which;
    if (keyID === 38) { // up
        player1.isUpKey = value;
        e.preventDefault(); 
        console.log('hi');
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






















