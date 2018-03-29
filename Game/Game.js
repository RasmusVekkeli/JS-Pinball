/*
 *  TODO: [X] walls
 *        [X] make the ball's physics more realistic
 *        [X] level
 *		  [X] flippers (player controlled)
 *		  [X] bumpers (launches the ball when it hits these)
 *        [X] score
 *        [X] plunger
 *        [X] misc. game logic (game over, lost ball etc...)
 */

var ball;
var ground;
var keys;
var scoreObject;
var gameOverText;
var restartText;
var walls = [];
var wallWidth = 50;
var areaMiddle = 232.5;
var levelObjects = [];
var bumperBalls = [];
var blackener;
var flipperMovementSpeed = 0.625;
var speedCap = 30;

var foregroundImage;

var plungerWallImage;
var plungerWallClosedImage;

var ballImage;

var FF = 0.25 * Math.PI; //Alias for 45 degree angle

// Initialize
function setup() {
    createCanvas(500, 900);
    matter.init();

	foregroundImage = loadImage("https://i.imgur.com/ilxUfPe.png");
	plungerWallImage = loadImage("https://i.imgur.com/MvQqzQc.png");
	plungerWallClosedImage = loadImage("https://i.imgur.com/7DrGOkc.png");
	ballImage = loadImage("https://i.imgur.com/rgw1Zhi.png");

    game = new gamez();

    ballOptions = {
        frictionAir: 0.0,
        friction: 0.0,
		density: 15,
        restitution: 0.6
    }

	ball = matter.makeBall(490, 300, 20, ballOptions);

    leftFlipper = matter.makeBarrier(465 / 2 - 55, 848.5, 80, 13, { angle: -0.05 });
    rightFlipper = matter.makeBarrier(465 / 2 + 55, 848.5, 80, 13, { angle: 0.05 });
    
    textOptions = {
        isStatic: true,
        isSensor: true
    }
	scoreObject = matter.makeSign("Score: " + game.score, areaMiddle, 150, textOptions);
	gameOverText = matter.makeSign("GAME OVER!!", areaMiddle, 200, textOptions);
	restartText = matter.makeSign("Press 'Enter' to restart", areaMiddle, 600, textOptions);

    walls.push(matter.makeBarrier(-(wallWidth / 2), 0, wallWidth, height * 2));             // Left wall
    walls.push(matter.makeBarrier(width + wallWidth / 2 - 1, 0, wallWidth, height * 2));    // Right wall
    walls.push(matter.makeBarrier(483, 924, 35, wallWidth));                                // Bottom wall (plunger)
    walls.push(matter.makeBarrier(0, -(wallWidth / 2), width * 2, wallWidth));              // Top wall

	initialiseLevel();

	blackener = matter.makeBarrier(width / 2, height / 2, width, height, { isStatic: true, isSensor: true });

    plungerWall = matter.makeBarrier(470, 550, 10, 700); // Plunger wall

    // See if multiple keys are pressed
    window.addEventListener("keydown", function (e) {
        keys = (keys || []);
        keys[e.keyCode] = true;
    });

    window.addEventListener("keyup", function (e) {
        keys[e.keyCode] = false;
    });

    window.addEventListener("mousemove", function (e) {
        mouseMoveX = e.pageX;
        mouseMoveY = e.pageY;
    });

    game.startGame();
}

function moveFlippers() {
    /// LEFT FLIPPER ///
    if (keys && keys[37]) {
        if (leftFlipper.getAngle() > -0.5) {
            leftFlipper.setAngle(leftFlipper.getAngle() - flipperMovementSpeed);
            leftFlipper.setVelocityY(-10);
        } else {
            leftFlipper.setVelocityY(0);
        }
    } else {
        if (leftFlipper.getAngle() <= 0.5) {
            leftFlipper.setAngle(leftFlipper.getAngle() + flipperMovementSpeed);
        }
        leftFlipper.setVelocityY(0);
    }

    /// RIGHT FLIPPER ///
    if (keys && keys[39]) {
        if (rightFlipper.getAngle() < 0.5) {
            rightFlipper.setAngle(rightFlipper.getAngle() + flipperMovementSpeed);
            rightFlipper.setVelocityY(-10);
        } else {
            rightFlipper.setVelocityY(0);
        }
    } else {
        if (rightFlipper.getAngle() >= -0.5) {
            rightFlipper.setAngle(rightFlipper.getAngle() - flipperMovementSpeed);
        }
        rightFlipper.setVelocityY(0);
    }
}

function draw() {
	if (game.gameOver) {
		fill(0);
		blackener.show();

		fill(random(0, 255), random(0, 255), random(0, 255));
		matter.forget(scoreObject);
		scoreObject = matter.makeSign("Score: " + game.score, width / 2, 150, textOptions);
		scoreObject.show();

		matter.forget(gameOverText);
        gameOverText = matter.makeSign("GAME OVER!!", width / 2, 200, { isStatic: true, isSensor: true, width: 200 });
		gameOverText.show();

		matter.forget(restartText);
        restartText = matter.makeSign("Press 'Enter' to restart", width / 2, 600, textOptions);
		restartText.show();

		if (keys && keys[13]) {
			game.startGame();
		}
	}
	else {
		background(0);

		//Check if space bar is pressed
		if (keys && keys[32]) { plunge(); }

		// Give the text a random color and draw it
		fill(random(0, 255), random(0, 255), random(0, 255));
		matter.forget(scoreObject);
		scoreObject = matter.makeSign("Score: " + game.score, areaMiddle, 150, textOptions);
		scoreObject.show();

		// Draw the ball
		//checkBall();
		//fill(70);
		//ball.show();
		image(ballImage, ball.getPositionX() - 16, ball.getPositionY() - 16);

		// Draw the flippers
		fill(255, 0, 255);
		moveFlippers();
		leftFlipper.show();
		rightFlipper.show();

		// Draw the walls
		fill(140);
		for (var x = 0; x < walls.length; x++) {
			walls[x].show();
		}

		bumpers();

		game.checkInGame();
		game.checkLost();
		makePlungerWall();
		//plungerWall.show();

		drawPlungerWall();

		image(foregroundImage, 0, 0);

		if (ball.getVelocityX() > speedCap || ball.getVelocityX() < -speedCap) {
			if (ball.getVelocityX() > 0) {
				ball.setVelocityX(30);
			}
			else {
				ball.setVelocityX(-30);
			}
		}

		if (ball.getVelocityY() > speedCap || ball.getVelocityY() < -speedCap) {
			if (ball.getVelocityY() > 0) {
				ball.setVelocityY(30);
			} else {
				ball.setVelocityY(-30);
			}
		}
	}
}

function makePlungerWall() {
    // Are we in a game?
    if (game.isInGameArea) {
        // See if it's a small wall
        if (plungerWall.getWidth() < 12.5) {
            matter.forget(plungerWall); // Forget/"break" the object
			plungerWall = matter.makeBarrier(487, 550, 45, 700); // Make a new one with updated width & x-position

			//Changes another wall to fit
			matter.forget(levelObjects[4]); 
			levelObjects[4] = matter.makeBarrier(407, 797.2, 255, 51, { angle: -0.55 });
        }
    } else {
        if (plungerWall.getWidth() > 12.5) {
            matter.forget(plungerWall); // Forget/"break" the object
            plungerWall = matter.makeBarrier(470, 550, 10, 700); // Make a new one with updated width & x-position

            matter.forget(levelObjects[4]);
			levelObjects[4] = matter.makeBarrier(377, 815.5, 185, 51, { angle: -0.55 });
        }
    }
}

function drawPlungerWall() {
	if (game.isInGameArea) {
		image(plungerWallClosedImage, 0, 0);
	} else {
		image(plungerWallImage, 0, 0);
	}
}

function bumpers() {
    for (var i = 0; i < bumperBalls.length; i++) {
        if (ballIsInsideCircle(bumperBalls[i])) {
            fill(255, 0, 0);
            bumperBalls[i].show();
            ball.setVelocityX(ball.getPositionX() - bumperBalls[i].getPositionX());
            ball.setVelocityY(ball.getPositionY() - bumperBalls[i].getPositionY());
            game.addScore(50);
        } else {
            fill(0, 255, 255);
            bumperBalls[i].show();
        }
    }
}

function ballIsInsideCircle(object) {
    return ((Math.sqrt(Math.pow((object.getPositionX() - ball.getPositionX()), 2) + Math.pow((object.getPositionY() - ball.getPositionY()), 2)) - (object.getWidth() / 2)) < ball.getWidth() / 2);
}

function plunge() { //Launches the ball if it's in the plungerArea when called
	var plungerArea = {
		x: width - 60,
		y: height - 60,
		w: 60,
		h: 60
	}

	//I really hate this if-statement, why does it have to be this way?
	if (ball.getPositionX() + ball.getWidth() > plungerArea.x &&
		ball.getPositionY() + ball.getHeight() > plungerArea.y &&
		ball.getPositionX() < plungerArea.x + plungerArea.w &&
		ball.getPositionY() < plungerArea.y + plungerArea.h) {

        ball.setVelocityY(Math.random() * (-25 - -40) + -40);
	}
}

function initialiseLevel() { //Create and set positions of level objects

    /// NORMAL BLOCKS ///
	levelObjects.push(matter.makeBarrier(500, 30, 250, 50, { angle: 0.65 }));       // Top right block

    levelObjects.push(matter.makeBarrier(75, 47.5, 75, 20));                        // Top left block 1
    levelObjects.push(matter.makeBarrier(47.5, 75, 20, 75));                        // Top left block 2

    levelObjects.push(matter.makeBarrier(72, 806, 220, 51, { angle: 0.55 }));	    //Bottom left block
    levelObjects.push(matter.makeBarrier(377, 815.5, 185, 51, { angle: -0.55 }));	//Bottom right block

	//Right Choke
    levelObjects.push(matter.makeBarrier(areaMiddle + 165 - 7, 530 - 35, 70, 70)); //Choke center
    levelObjects.push(matter.makeBarrier(areaMiddle + 165.5 - 7, 494.5 - 35, 49.497, 49.497, { angle: FF })); //Choke top
    levelObjects.push(matter.makeBarrier(areaMiddle + 130.5 - 7, 529.5 - 35, 49.497, 49.497, { angle: FF })); //Choke right
    levelObjects.push(matter.makeBarrier(areaMiddle + 165.5 - 7, 565 - 35, 49.497, 49.497, { angle: FF })); //Choke bottom

	//Left Choke
    levelObjects.push(matter.makeBarrier(areaMiddle - 166 + 7, 530 - 35, 70, 70)); //Choke center
    levelObjects.push(matter.makeBarrier(areaMiddle - 165.5 + 7, 494.5 - 35, 49.497, 49.497, { angle: FF })); //Choke top
    levelObjects.push(matter.makeBarrier(areaMiddle - 130.5 + 7, 529.5 - 35, 49.497, 49.497, { angle: FF })); //Choke left
    levelObjects.push(matter.makeBarrier(areaMiddle - 165.5 + 7, 565 - 35, 49.497, 49.497, { angle: FF })); //Choke bottom

    // Left
    levelObjects.push(matter.makeBarrier((areaMiddle / 4) * 2 - 27, 728, 120, 5, { angle: 0.80 }));
    levelObjects.push(matter.makeBall((areaMiddle / 4) * 2 + 22, 757, 37, { isStatic: true }));
    levelObjects.push(matter.makeBall((areaMiddle / 4) - 4, 670, 37, { isStatic: true }));
    levelObjects.push(matter.makeBarrier((areaMiddle / 4) * 2 - 17, 710, 120, 30, { angle: 0.80 })); // Bumper area
    levelObjects[levelObjects.length - 1].setVelocityY(-10);

    // Right
    levelObjects.push(matter.makeBarrier((areaMiddle / 4) * 6 + 27, 728, 120, 5, { angle: -0.80 }));
    levelObjects.push(matter.makeBall((areaMiddle / 4) * 5 + 36, 757, 37, { isStatic: true }));
    levelObjects.push(matter.makeBall((areaMiddle / 4) * 7 + 3, 670, 37, { isStatic: true }));
    levelObjects.push(matter.makeBarrier((areaMiddle / 4) * 6 + 17, 710, 120, 30, { angle: -0.80 })); // Bumper area
    levelObjects[levelObjects.length - 1].setVelocityY(-10);
    
    /// BUMPER BALLS ///
    bumperBalls.push(matter.makeBall(areaMiddle - 150, 250, 40, { isSensor: true, isStatic: true }));
    bumperBalls.push(matter.makeBall(areaMiddle, 300, 40, { isSensor: true, isStatic: true }));
    bumperBalls.push(matter.makeBall(areaMiddle + 150, 250, 40, { isSensor: true, isStatic: true }));
    bumperBalls.push(matter.makeBall(10, 10, 20, { isSensor: true, isStatic: true }));
    bumperBalls.push(matter.makeBall(65, 65, 25, { isSensor: true, isStatic: true }));

    bumperBalls.push(matter.makeBall(areaMiddle - 165.5 + 7 + 35, 494.5 - 35, 30, { isSensor: true, isStatic: true }));
    bumperBalls.push(matter.makeBall(areaMiddle + 165.5 - 7 - 35, 494.5 - 35, 30, { isSensor: true, isStatic: true }));
    bumperBalls.push(matter.makeBall(areaMiddle + 165.5 - 7 - 35, 494.5 + 35, 30, { isSensor: true, isStatic: true }));
	bumperBalls.push(matter.makeBall(areaMiddle - 165.5 + 7 + 35, 494.5 + 35, 30, { isSensor: true, isStatic: true }));
}

function gamez() {
	this.score = 0;
	this.ballsLeft;
	this.isStarted;
	this.isInGameArea;
	this.gameOver;

	this.startGame = function () { //Initialises functions and starts the game
		this.score = 0;
		this.ballsLeft = 2;
		this.isStarted = true;
		this.isInGameArea = false;
		this.gameOver = false;

		this.resetBall(true);
	}

	this.resetBall = function (free) {
		if (!free) {
			this.ballsLeft--;
		}

		if (this.ballsLeft < 0) {
			this.stopGame();
		}
		else {
			ball.setPositionX(490);
			ball.setPositionY(300);
			ball.setVelocityX(0);
			ball.setVelocityY(0);
		}

		this.isInGameArea = false;
	}

	this.stopGame = function () {
		this.isStarted = false;
		this.gameOver = true;
	}

	this.addScore = function (value) {
		this.score += value;
	}

	this.checkInGame = function () {
        if (ball.getPositionX() + ball.getWidth() > 480 &&
            ball.getPositionY() + ball.getHeight() > 220 &&
            ball.getPositionX() < 480 + 25 &&
            ball.getPositionY() < 220 + 800) {
            this.isInGameArea = false;
        } else {
            this.isInGameArea = true;
        }
	}

	this.checkLost = function () {
		if (ball.isOffCanvas()) {
			this.resetBall(false);
		}
	}
}