/*
 *  TODO: [X] walls
 *        [ ] make the ball's physics more realistic
 *        [ ] level
 *		  [ ] flippers (player controlled)
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
var flipperMovementSpeed = 0.30;

// Initialize
function setup() {
    createCanvas(500, 900);
    matter.init();

    ballOptions = {
        frictionAir: 0.0,
        friction: 0.0,
		density: 10,
		restitution: 0.8
    }

	ball = matter.makeBall(random(0, width), 300, 40, ballOptions);
	ground = matter.makeBarrier(width / 2, 900, 1000, 15, { isStatic: true });

    leftFlipper = matter.makeBarrier(width / 2 - 50, 300, 75, 10);
    rightFlipper = matter.makeBarrier(width / 2 + 50, 300, 75, 10);
    leftFlipper.setAngle(-0.05);
    rightFlipper.setAngle(0.05);

    textOptions = {
        isStatic: true,
        isSensor: true
    }
    helloText = matter.makeSign("Hello!", width / 2, 150, textOptions);

    walls.push(matter.makeBarrier(0, 0, 10, height * 2));       // Left wall
    walls.push(matter.makeBarrier(width, 0, 10, height * 2));   // Right wall
    walls.push(matter.makeBarrier(0, height, width * 2, 10));   // Bottom wall
	walls.push(matter.makeBarrier(0, 0, width * 2, 10));        // Top wall

    // See if multiple keys are pressed
    window.addEventListener("keydown", function (e) {
        keys = (keys || []);
        keys[e.keyCode] = true;
    });

    window.addEventListener("keyup", function (e) {
        keys[e.keyCode] = false;
    });
}

// Moving the ground
function moveGround() {
	// Move the platform up
	if (keys && keys[38]) {
		ground.setVelocityY(-5);
		ground.setPositionY(ground.getPositionY() - 5);
	}
	else {
		ground.setVelocityY(0);
	}
    if (keys && keys[40]) { ground.setPositionY(ground.getPositionY() + 5); }   // Move the platform down
    if (keys && keys[37]) { ground.setAngle(ground.getAngle() - 0.05); }        // Rotate the platform to left
	if (keys && keys[39]) { ground.setAngle(ground.getAngle() + 0.05); }        // Rotate the platform to right
	if (keys && keys[32]) { plunge(); }											// Activate plunger
}

function moveFlippers() {
    if (keys && keys[37]) {
        if (leftFlipper.getAngle() > -0.5) {
            leftFlipper.setAngle(leftFlipper.getAngle() - flipperMovementSpeed);
        }
    } else {
        if (leftFlipper.getAngle() < 0.5) {
            leftFlipper.setAngle(leftFlipper.getAngle() + flipperMovementSpeed);
        }
    }

    if (keys && keys[39]) {
        if (rightFlipper.getAngle() < 0.5) {
            rightFlipper.setAngle(rightFlipper.getAngle() + flipperMovementSpeed);
        }
    } else {
        if (rightFlipper.getAngle() > -0.5) {
            rightFlipper.setAngle(rightFlipper.getAngle() - flipperMovementSpeed);
        }
    }
}

//Resets the ball's position if off canvas
function checkBall() {
    if (ball.isOffCanvas()) {
        ball.setPositionX(random(0, width));
        ball.setPositionY(300);
        console.log("reee");
    }
}

function draw() {
    background(255);

    // Give the text a random color and draw it
    fill(random(0, 255), random(0, 255), random(0, 255));
    helloText.show();

    // Change the drawing color to back, move the ground and draw it
    fill(0);
    moveGround();
    ground.show();

    // Draw the ball
    checkBall();
	fill(70);
    ball.show();

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
}

function plunge() { //Launches the ball if it's in the plungerArea when called
	var plungerArea = {
		x: width - 60,
		y: height - 60,
		w: 60,
		h: 60
	}

	if (ball.getPositionX() + ball.getWidth() > plungerArea.x &&
		ball.getPositionY() + ball.getHeight() > plungerArea.y &&
		ball.getPositionX() < plungerArea.x + plungerArea.w &&
		ball.getPositionY() < plungerArea.y + plungerArea.h) {

		ball.setVelocityY(-30);
	}
}