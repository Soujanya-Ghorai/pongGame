const hitSound = new Audio('sounds/hit.mp3');
const wallSound = new Audio('sounds/wall.mp3');
const scoreSound = new Audio('sounds/userScore.mp3');
const canvas = document.getElementById("pongCanvas");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("startBtn");
const overlay = document.getElementById("overlay");
const playerScoreElement = document.getElementById("player-score");
const pcScoreElement = document.getElementById("pc-score");

// Canvas Dimensions
canvas.width = 800;
canvas.height = 500;

// Game Settings
const paddleWidth = 10, paddleHeight = 100;
let playerScore = 0, pcScore = 0;

// Ball Object
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 8,
    speed: 7,
    velocityX: 5,
    velocityY: 5,
    color: "#FFFFFF"
};

// Player Paddle (Left)
const player = {
    x: 0,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    color: "#00f2ff",
    score: 0
};

// PC Paddle (Right)
const pc = {
    x: canvas.width - paddleWidth,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    color: "#ff007b",
    score: 0
};

// Draw Functions
function drawRect(x, y, w, h, color, shadowColor) {
    ctx.shadowBlur = 15;
    ctx.shadowColor = shadowColor || color;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
    ctx.shadowBlur = 0; // Reset shadow for next drawing
}

function drawBall(x, y, r, color) {
    ctx.shadowBlur = 20;
    ctx.shadowColor = color;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
}

function drawNet() {
    for (let i = 0; i <= canvas.height; i += 40) {
        drawRect(canvas.width / 2 - 1, i, 2, 20, "rgba(255, 255, 255, 0.1)");
    }
}

// Control Player Paddle
window.addEventListener("mousemove", (e) => {
    let rect = canvas.getBoundingClientRect();
    player.y = e.clientY - rect.top - player.height / 2;
});

// Collision Detection
function collision(b, p) {
    p.top = p.y;
    p.bottom = p.y + p.height;
    p.left = p.x;
    p.right = p.x + p.width;

    b.top = b.y - b.radius;
    b.bottom = b.y + b.radius;
    b.left = b.x - b.radius;
    b.right = b.x + b.radius;

    return b.right > p.left && b.bottom > p.top && b.left < p.right && b.top < p.bottom;
}

// Reset Ball
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.velocityX = -ball.velocityX;
    ball.speed = 7;
}

// Update Game Logic
function update() {
    // Ball Movement
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    // AI Logic (PC Rod)
    // AI level: 0.1 means it's a bit slow and beatable
    pc.y += (ball.y - (pc.y + pc.height / 2)) * 0.1;

    // Wall Collision (Top/Bottom)
    if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
        ball.velocityY = -ball.velocityY;
    }

    // Check which paddle is being hit
    let playerTarget = (ball.x < canvas.width / 2) ? player : pc;

    if (collision(ball, playerTarget)) {
        // Ball bounce logic
        let collidePoint = (ball.y - (playerTarget.y + playerTarget.height / 2));
        collidePoint = collidePoint / (playerTarget.height / 2);
        
        let angleRad = (Math.PI / 4) * collidePoint;
        let direction = (ball.x < canvas.width / 2) ? 1 : -1;
        
        ball.velocityX = direction * ball.speed * Math.cos(angleRad);
        ball.velocityY = ball.speed * Math.sin(angleRad);
        
        // Increase speed slightly
        ball.speed += 0.2;
    }

    // Scoring
    if (ball.x - ball.radius < 0) {
        pcScore++;
        pcScoreElement.innerText = pcScore < 10 ? "0" + pcScore : pcScore;
        resetBall();
    } else if (ball.x + ball.radius > canvas.width) {
        playerScore++;
        playerScoreElement.innerText = playerScore < 10 ? "0" + playerScore : playerScore;
        resetBall();
    }
}

// Render Game
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawNet();
    drawRect(player.x, player.y, player.width, player.height, player.color, "#00f2ff");
    drawRect(pc.x, pc.y, pc.width, pc.height, pc.color, "#ff007b");
    drawBall(ball.x, ball.y, ball.radius, ball.color);
}

let gameRunning = false;
function gameLoop() {
    if (gameRunning) {
        update();
        render();
        requestAnimationFrame(gameLoop);
    }
}

// Start Button
startBtn.addEventListener("click", () => {
    overlay.classList.add("hidden");
    gameRunning = true;
    gameLoop();
});