/*
 *  TODO: [X] walls
 *        [ ] make the ball's physics more realistic
 *        [ ] level
 *		  [X] flippers (player controlled)
 *		  [ ] bumpers (launches the ball when it hits these)
 *		  [ ] targets (gives points when hit by ball)
 *        [ ] score
 *        [/] plunger
 *        [ ] misc. game logic (game over, lost ball etc...)
 */

var ball;
var ground;
var keys;
var helloText;
var walls = [];
var wallWidth = 50;
var levelObjects = [];
var flipperMovementSpeed = 0.30;

var mouseMoveX;
var mouseMoveY;
var prevMouseMoveX;
var prevMouseMoveY;

// Initialize
function setup() {
    createCanvas(500, 900);
    matter.init();

    game = new game();

    ballOptions = {
        frictionAir: 0.0,
        friction: 0.0,
		density: 10,
		restitution: 0.8
    }

	ball = matter.makeBall(490, 300, 20, ballOptions);

    leftFlipper = matter.makeBarrier(465 / 2 - 55, 848.5, 80, 13, { angle: -0.05 });
    rightFlipper = matter.makeBarrier(465 / 2 + 55, 848.5, 80, 13, { angle: 0.05 });
    
    textOptions = {
        isStatic: true,
        isSensor: true
    }
    helloText = matter.makeSign("Hello!", width / 2, 150, textOptions);

    walls.push(matter.makeBarrier(-(wallWidth / 2), 0, wallWidth, height * 2));             // Left wall
    walls.push(matter.makeBarrier(width + wallWidth / 2 - 1, 0, wallWidth, height * 2));    // Right wall
    walls.push(matter.makeBarrier(483, 924, 35, wallWidth));                                // Bottom wall (plunger)
    walls.push(matter.makeBarrier(0, -(wallWidth / 2), width * 2, wallWidth));              // Top wall

    initialiseLevel();

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
        if (leftFlipper.getAngle() < 0.5) {
            leftFlipper.setAngle(leftFlipper.getAngle() + flipperMovementSpeed);
        }
        rightFlipper.setVelocityY(0);
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
        if (rightFlipper.getAngle() > -0.5) {
            rightFlipper.setAngle(rightFlipper.getAngle() - flipperMovementSpeed);
        }
        rightFlipper.setVelocityY(0);
    }
}

//Resets the ball's position if off canvas
function checkBall() {
    if (ball.isOffCanvas()) {
        ball.setPositionX(random(0, width));
        ball.setPositionY(300);
    }
}

function draw() {
    background(255);

    if (keys && keys[32]) { plunge(); }

    // Give the text a random color and draw it
    fill(random(0, 255), random(0, 255), random(0, 255));
    helloText.show();

    // Draw the ball
    checkBall();
	fill(70);
    ball.show();

    // Draw the flippers
    fill(255, 0, 255);
    moveFlippers();
    leftFlipper.show();
    rightFlipper.show();

    // Log the mouse coordinates
    if (prevMouseMoveX != mouseMoveX && prevMouseMoveY != mouseMoveY) {
        console.log("mouse X = " + mouseMoveX);
        console.log("mouse Y = " + mouseMoveY);
        console.log("====================");
    }
    prevMouseMoveX = mouseMoveX;
    prevMouseMoveY = mouseMoveY;

    // Draw the walls
    fill(140);
    for (var x = 0; x < walls.length; x++) {
        walls[x].show();
	}

    for (var i = 0; i < levelObjects.length - 3; i++) {
		levelObjects[i].show();
    }

    // Make the plunger wall bigger if the ball is in the play area
    //if (isInGame()) {
    //    matter.makeBarrier(470, 550, 10, 700); // Plunger wall
    //    plungerWall.show();
    //} else {
    //    levelObjects[0].width = 25;
    //}
    game.checkInGame();
    makePlungerWall();
    plungerWall.show();

    bumpers();
}

function makePlungerWall() {
    // Are we in a game?
    if (game.isInGameArea) {
        // See if it's a small wall
        if (plungerWall.getWidth() < 12.5) {
            matter.forget(plungerWall); // Forget/"break" the object
            plungerWall = matter.makeBarrier(487, 550, 45, 700); // Make a new one with updated width & x-position
            console.log("large plungerWall made!");
        }
    } else {
        if (plungerWall.getWidth() > 12.5) {
            matter.forget(plungerWall); // Forget/"break" the object
            plungerWall = matter.makeBarrier(470, 550, 10, 700); // Make a new one with updated width & x-position
            console.log("small plungerWall made!");
        }
    }
}

function bumpers() {
    for (var i = levelObjects.length - 3; i < levelObjects.length; i++) {
        if (ballIsInsideCircle(levelObjects[i])) {
            fill(255, 0, 0);
            levelObjects[i].show();
            levelObjects[i].radius = 50;
            ball.setVelocityX(ball.getPositionX() - levelObjects[i].getPositionX());
            ball.setVelocityY(ball.getPositionY() - levelObjects[i].getPositionY());
        } else {
            fill(0, 255, 0);
            levelObjects[i].radius = 40;
            levelObjects[i].show();
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

		ball.setVelocityY(-30);
	}
}

function initialiseLevel() { //Create and set positions of level objects

    /// NORMAL BLOCKS ///
	levelObjects.push(matter.makeBarrier(500, 30, 250, 50, { angle: 0.65 }));   // Top right block
	levelObjects.push(matter.makeBarrier(0, 30, 250, 50, { angle: -0.65 }));   // Top left block
	levelObjects.push(matter.makeBarrier(72, 806, 220, 51, { angle: 0.55 }));	//Bottom left block
	levelObjects.push(matter.makeBarrier(377, 815.5, 185, 51, { angle: -0.55 }));	//Bottom right block
	levelObjects.push(matter.makeBarrier(-5, 700, 20, 100, { angle: -0.30 }));  // left, small
	levelObjects.push(matter.makeBarrier(455, 710, 10, 100, { angle: 0.30 })); //right, small


    /// BUMPER BALLS ///
    levelObjects.push(matter.makeBall(200, 250, 40, { isSensor: true, isStatic: true }));
    levelObjects.push(matter.makeBall(250, 250, 40, { isSensor: true, isStatic: true }));
    levelObjects.push(matter.makeBall(300, 250, 40, { isSensor: true, isStatic: true }));
}

function game() {
	this.score;
	this.ballsLeft;
	this.isStarted;
	this.isInGameArea;

	this.startGame = function () { //Initialises functions and starts the game
		this.score = 0;
		this.ballsLeft = 2;
		this.isStarted = true;
		this.isInGameArea = false;

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
		}

		this.isInGameArea = false;
	}

	this.stopGame = function () {
		this.isStarted = false;
	}

	this.addScore = function (value) {
		this.score += value;
	}

	this.checkInGame = function () {
        if (ball.getPositionX() + ball.getWidth() > 475 &&
            ball.getPositionY() + ball.getHeight() > 200 &&
            ball.getPositionX() < 475 + 25 &&
            ball.getPositionY() < 200 + 800) {
            this.isInGameArea = true;
        } else {
            this.isInGameArea = false;
        }
	}
}