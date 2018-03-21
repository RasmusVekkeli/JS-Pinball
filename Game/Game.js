var ball;

function setup() {
    createCanvas(600, 600);

    matter.init();

    ball = matter.makeBall(random(0, width), 0, 40);
}

function draw() {
    background(255);

    fill(0);
    noStroke();
    ball.show();
}
