function Init() {
	gameArea.start();
	rectangle = new physObject(20, 20, "#ff0000", 50, 50, 0.2, 0.9);
	bottom = new physObject(gameArea.canvas.width, 100, "#000000", 0, gameArea.canvas.height - 20, 0, 0);
}

var gameArea = {
	canvas: document.createElement("canvas"),

	start: function () {
		this.canvas.width = 512;
		this.canvas.height = 800;
		this.context = this.canvas.getContext("2d");

		document.body.insertBefore(this.canvas, document.body.childNodes[0]);

		this.interval = setInterval(updateGameArea, 20);
	},

	clear: function () {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}
}

function physObject(width, height, color, x, y, gravMod, bounceMod){
	this.width = width;
	this.height = height;
	this.color = color;

	this.x = x;
	this.y = y;
	this.xSpeed = 0;
	this.ySpeed = 0;

	this.gravMod = gravMod;
	this.bounceMod = bounceMod;

	this.update = function () {
		this.move();

		ctx = gameArea.context;
		ctx.fillStyle = color;
		ctx.fillRect(this.x, this.y, this.width, this.height);
	}

	this.move = function () {
		this.applyGravity();

		this.x += this.xSpeed;
		this.y += this.ySpeed;

		console.log(this.ySpeed);
	}

	this.applyGravity = function () {
		this.ySpeed += this.gravMod;
	}

	this.checkCollision = function (object) {
		if (this.x + this.width > object.x &&
			this.y + this.height > object.y &&
			this.x < object.x + object.width &&
			this.y < object.y + object.height) {
			this.ySpeed *= -this.bounceMod;
		}
	}
}

function updateGameArea() {
	gameArea.clear();

	rectangle.update();
	bottom.update();
}