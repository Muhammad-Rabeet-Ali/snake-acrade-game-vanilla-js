const board = document.querySelector(".board");
const startBtn = document.querySelector(".start-btn");
const modal = document.querySelector(".modal");
const restartBtn = document.querySelector(".restart-btn");
const startGameModal = document.querySelector(".start-game");
const restartGameModal = document.querySelector(".restart-game");
const highScoreElement = document.querySelector("#high-score");
const h3 = document.querySelector("#gb");
const scoreElement = document.querySelector("#score");
const timeElement = document.querySelector("#time");

const rows = 15;
const cols = 15;

board.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
board.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

let highScore = parseInt(localStorage.getItem("highScore")) || 0;
highScoreElement.textContent = highScore;
let score = 0;
let time = "00-00";
let food = { x: 0, y: 0 };

const blocks = [];
let snake = [
    {
        x: 5, y: 4,
    }
];

let direction = "right";
let nextDirection = "right";
let intervalID = null;
let timeIntervalID = null;

for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
        const block = document.createElement("div");
        block.classList.add("blocks");
        board.appendChild(block);
        blocks[`${row}-${col}`] = block;
    }
}

function generateFood() {
    let newFood;
    let onSnake = true;
    while (onSnake) {
        newFood = {
            x: Math.floor(Math.random() * rows),
            y: Math.floor(Math.random() * cols)
        };
        onSnake = snake.some(piece => piece.x === newFood.x && piece.y === newFood.y);
    }
    food = newFood;
    if (blocks[`${food.x}-${food.y}`]) {
        blocks[`${food.x}-${food.y}`].classList.add("food");
    }
}

generateFood();

function render() {
    direction = nextDirection;
    
    let head = null;
    if (direction === "left") {
        head = { x: snake[0].x, y: snake[0].y - 1 };
    } else if (direction === "right") {
        head = { x: snake[0].x, y: snake[0].y + 1 };
    } else if (direction === "up") {
        head = { x: snake[0].x - 1, y: snake[0].y };
    } else if (direction === "down") {
        head = { x: snake[0].x + 1, y: snake[0].y };
    }

    if (head.x < 0 || head.x >= rows || head.y < 0 || head.y >= cols) {
        endGame();
        return;
    }

    const hitSelf = snake.some(piece => piece.x === head.x && piece.y === head.y);
    if (hitSelf) {
        if (h3) h3.textContent = "Oh! You hit Yourself.";
        endGame();
        return;
    }

    snake.forEach(piece => {
        if (blocks[`${piece.x}-${piece.y}`]) {
            blocks[`${piece.x}-${piece.y}`].classList.remove("fill-color");
        }
    });

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        if (blocks[`${food.x}-${food.y}`]) {
            blocks[`${food.x}-${food.y}`].classList.remove("food");
        }
        generateFood();
        score += 10;
        scoreElement.textContent = score;

        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem("highScore", highScore.toString());
        }
    } else {
        snake.pop();
    }

    snake.forEach(piece => {
        if (blocks[`${piece.x}-${piece.y}`]) {
            blocks[`${piece.x}-${piece.y}`].classList.add("fill-color");
        }
    });
}

function endGame() {
    clearInterval(intervalID);
    clearInterval(timeIntervalID);
    modal.style.display = "flex";
    startGameModal.style.display = "none";
    restartGameModal.style.display = "flex";
}

function startTimer() {
    clearInterval(timeIntervalID);
    timeIntervalID = setInterval(() => {
        let [min, sec] = time.split("-").map(Number);

        if (sec === 59) {
            min += 1;
            sec = 0;
        } else {
            sec += 1;
        }
        
        const formattedMin = String(min).padStart(2, '0');
        const formattedSec = String(sec).padStart(2, '0');
        
        time = `${formattedMin}-${formattedSec}`;
        timeElement.textContent = time;
    }, 1000);
}

startBtn.addEventListener("click", () => {
    modal.style.display = "none";
    intervalID = setInterval(render, 300);
    startTimer();
});

restartBtn.addEventListener("click", restartGame)

function restartGame() {
    clearInterval(intervalID);
    clearInterval(timeIntervalID);

    snake.forEach(piece => {
        if (blocks[`${piece.x}-${piece.y}`]) {
            blocks[`${piece.x}-${piece.y}`].classList.remove('fill-color');
        }
    });
    if (blocks[`${food.x}-${food.y}`]) {
        blocks[`${food.x}-${food.y}`].classList.remove("food");
    }
    
    score = 0;
    scoreElement.textContent = score;
    time = "00-00";
    timeElement.textContent = time;
    
    if (h3) h3.textContent = "Game Over";
    highScoreElement.textContent = highScore;
    modal.style.display = "none";
    
    snake = [
        {
            x: 5, y: 4,
        }
    ];
    direction = "right"; 
    nextDirection = "right";
    generateFood();
    
    intervalID = setInterval(render, 300);
    startTimer();
}

addEventListener("keydown", (e) => {
    handleDirectionChange(e.key);
});

document.querySelectorAll(".control-btn").forEach(btn => {
    const triggerDir = (e) => {
        e.preventDefault();
        const dir = btn.getAttribute("data-dir");
        if (dir === "up") handleDirectionChange("ArrowUp");
        if (dir === "down") handleDirectionChange("ArrowDown");
        if (dir === "left") handleDirectionChange("ArrowLeft");
        if (dir === "right") handleDirectionChange("ArrowRight");
    };
    
    btn.addEventListener("touchstart", triggerDir, { passive: false });
    btn.addEventListener("click", triggerDir);
});

function handleDirectionChange(key) {
    if (key === "ArrowUp" && direction !== "down") {
        nextDirection = "up";
    } else if (key === "ArrowDown" && direction !== "up") {
        nextDirection = "down";
    } else if (key === "ArrowRight" && direction !== "left") {
        nextDirection = "right";
    } else if (key === "ArrowLeft" && direction !== "right") {
        nextDirection = "left";
    }
}