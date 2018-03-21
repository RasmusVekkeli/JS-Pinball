function Init() {
	gameArea.start();
	rectangle = new physObject(20, 20, "#ff0000", 50, 50, 0.2, 0.9, true);
	bottom = new physObject(gameArea.canvas.width, 100, "#000000", 0, gameArea.canvas.height - 20, 0, 0, false);
}

var gameArea = { //Game area
	canvas: document.createElement("canvas"), //Create canvas element

	start: function () { //Initialise canvas and set its properties
		this.canvas.width = 512;
		this.canvas.height = 800;
		this.context = this.canvas.getContext("2d");

		document.body.insertBefore(this.canvas, document.body.childNodes[0]);

		this.interval = setInterval(updateGameArea, 1000 / 60);
	},

	clear: function () { //Clear canvas
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}
}

function physObject(width, height, color, x, y, gravMod, bounceMod, physics){ //Simple physics object
	this.width = width;
	this.height = height;
	this.color = color;

	this.x = x;
	this.y = y;
	this.xSpeed = 0;
	this.ySpeed = 0;

	this.gravMod = gravMod;
	this.bounceMod = bounceMod;

	this.physics = physics;

	this.update = function () { //Perform drawing of the object
		this.move();

		ctx = gameArea.context;
		ctx.fillStyle = color;
		ctx.fillRect(this.x, this.y, this.width, this.height);
	}

	this.move = function () { //Apply movement calculations
		

		this.x += this.xSpeed;
		this.y += this.ySpeed;

		if (physics) {
			if (!this.checkCollision(bottom)) { //Check if collided with the bottom object
				this.applyGravity(); //Apply gravity 
			} else {
				this.y = bottom.y - this.height;
				this.ySpeed *= -this.bounceMod;

				console.log(this.ySpeed);
			}
		}
		//console.log(this.ySpeed);
	}

	this.applyGravity = function () { //Simply adds gravity modifier to the speed every frame
		this.ySpeed += this.gravMod;
	}

	this.checkCollision = function (object) {  //Checks collision with an object, returns true if object collided with specified object
		if (this.x + this.width > object.x &&
			this.y + this.height > object.y &&
			this.x < object.x + object.width &&
			this.y < object.y + object.height) {

			return true;
		} else {
			return false;
		}
	}
}

function updateGameArea() {
	gameArea.clear();

	bottom.update();
	rectangle.update();
}