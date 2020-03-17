/**
 * Snake v0.0.1
 */

const config = {
    initialLength: 10,
    stepDuration: 300,
    speedMult: 0.8,
    foodScore: 25,
    speedUpScoreN: 100,
    fieldWidth: 20,
    fieldHeight: 20,
    cellSize: 15
};

let score = 0;
let speed = 1;
let currentSpeedDuration = config.stepDuration;
let food = [];
let snake = [];
let snakeDirection = "right"; // "up" | "right" | "down" | "left"
let snakeChunksDirections = [];
let tickId = null;
let currentStepDuration = config.stepDuration;

// елементы DOM-дерева
const gameEl = document.getElementById("game");
const scoreEl = document.getElementById("score");
const speedEl = document.getElementById("speed");

const newGameEl = document.getElementById("new");

// создание поля игры
function initField() {
    const fieldEl = document.createElement("div");
    fieldEl.classList.add("field");
    fieldEl.setAttribute(
        "style",
        `width: ${config.cellSize * config.fieldWidth}px; height: ${config.cellSize *
        config.fieldHeight}px;`
    );

    for (i = 0; i < config.fieldWidth; i++) {
        for (j = 0; j < config.fieldHeight; j++) {
            const cellEl = document.createElement("div");
            cellEl.classList.add("cell");
            cellEl.setAttribute("id", `${i}.${j}`);
            cellEl.setAttribute(
                "style",
                `width: ${config.cellSize}px; height: ${config.cellSize}px;`
            );
            fieldEl.append(cellEl);
        }
    }

    gameEl.innerHTML = "";
    gameEl.append(fieldEl);
}

// инициализация змейки
function initSnake() {
    const newSnake = snake.slice();
    const newSnakeChunksDirections = snakeChunksDirections.slice();

    const initialY = Math.floor(config.fieldHeight / 2);
    const initialX = 0;

    for (i = 0; i < config.initialLength; i++) {
        newSnake.push([initialX + i, initialY]);
        newSnakeChunksDirections.push("right");
    }

    snake = newSnake.slice().reverse();
    snakeChunksDirections = newSnakeChunksDirections.slice().reverse();
}

// проверка координат на совпадение со змейкой
const checkIfOnSnake = (coords) => {
    for (i=0; i < snake.length; i++) {
        const chunk = snake[i];
        if (coords[0] === chunk[0] && coords[1] === chunk[1] ) {
            return true;
        }
    }
}

// создаем еду
function createFood() {
    let x;
    let y;
    let notOnSnake = true;
    while(notOnSnake) {
        x = Math.ceil(Math.random()*config.fieldWidth);
        y = Math.ceil(Math.random()*config.fieldHeight);
        notOnSnake = checkIfOnSnake([x, y]);
    }
    if (food[0]) {
        clearFood();
    }
    food = [x, y];
    drawFood();
}

// удаление еды
function clearFood() {
    const foodCellEls = document.querySelectorAll(".food");
    console.log(foodCellEls);
    for (chunk of foodCellEls) {
        console.log(chunk);
        if (chunk)  {
            chunk.classList.remove("food");
        }
    }
}

// рисование еды
function drawFood() {
    clearFood();
    const cellFoodEl = document.getElementById(`${food[1]}.${food[0]}`);
    if (cellFoodEl){
        cellFoodEl.classList.add('food');
    }
}

// стирание змейки
function clearSnake() {
    const snakeCellEls = document.querySelectorAll(".snake");
    for (chunk of snakeCellEls) {
        if (chunk)  {
            chunk.classList.remove("snake");
        }
    }
}

// рендеринг змейки
function drawSnake() {
    const drawingSnake = snake.slice();
    if (drawingSnake[0][0] > config.fieldWidth ||
        drawingSnake[0][1] > config.fieldHeight) {
        return false;
    }
    clearSnake();

    for (i = 0; i < drawingSnake.length; i++) {
        const x = drawingSnake[i][0];
        const y = drawingSnake[i][1];
        const snakeCellEl = document.getElementById(`${y}.${x}`);
        if (snakeCellEl) {
            snakeCellEl.classList.add("snake");
        }
    }
}

// смена направлений кусков змеи
function snakeChangeChunksDirections() {
    let movedSnakeChunksDirections = snakeChunksDirections.slice();
    for (i = 0; i < movedSnakeChunksDirections.length - 1; i++) {
        const index = movedSnakeChunksDirections.length - 1 - i;
        movedSnakeChunksDirections[index] = movedSnakeChunksDirections[index - 1];
    }

    snakeChunksDirections = movedSnakeChunksDirections.slice();
}

// сдвиг змейки
function moveSnake() {
    let movedSnake = snake.slice();
    const currentSnakeChunksDirections = snakeChunksDirections.slice();
    for (i = 0; i < movedSnake.length; i++) {
        const direction = currentSnakeChunksDirections[i];
        let chunk = movedSnake[i];
        if (direction == "up") {
            chunk = [chunk[0], chunk[1] - 1];
        }
        if (direction == "down") {
            chunk = [chunk[0], chunk[1] + 1];
        }
        if (direction == "left") {
            chunk = [chunk[0] - 1, chunk[1]];
        }
        if (direction == "right") {
            chunk = [chunk[0] + 1, chunk[1]];
        }
        movedSnake[i] = chunk;
    }
    snake = movedSnake.slice();
}

// поедание еды
function eatFood() {
    score = score + config.foodScore;
    food = [];
    createFood();
    scoreEl.innerHTML = score;

    if (score > 0 && score % config.speedUpScoreN === 0 ) {
        speed++;
        speedEl.innerHTML = speed;
        clearInterval(tickId);
        currentStepDuration = currentStepDuration*config.speedMult;
        tick();
    }

}

// проверка на коллизию
function ifCollision() {
    const snakeHead = snake.slice(0, 1)[0];
    let nextStepSnakeHead = [];
    const direction = snakeChunksDirections.slice(0, 1);

    const checkIfFood = (coords) => {
        if (coords[0]===food[0] && coords[1]===food[1]) {
            eatFood();
        }
    }

    if (direction == "up") {
        nextStepSnakeHead = [ snakeHead[0], snakeHead[1] - 1];
        if (nextStepSnakeHead[1] < 0) {
            return true;
        }
        if (checkIfOnSnake(nextStepSnakeHead)) {
            return true;
        }
        checkIfFood(nextStepSnakeHead);
    }

    if (direction == "down") {
        nextStepSnakeHead = [ snakeHead[0], snakeHead[1] + 1];
        if (nextStepSnakeHead[1] > config.fieldHeight) {
            return true;
        }
        if (checkIfOnSnake(nextStepSnakeHead)) {
            return true;
        }
        checkIfFood(nextStepSnakeHead);
    }

    if (direction == "left") {
        nextStepSnakeHead = [ snakeHead[0] - 1, snakeHead[1]];
        if (nextStepSnakeHead[0] < 0) {
            return true;
        }
        if (checkIfOnSnake(nextStepSnakeHead)) {
            return true;
        }
        checkIfFood(nextStepSnakeHead);
    }

    if (direction == "right") {
        nextStepSnakeHead = [snakeHead[0] + 1, snakeHead[1]];
        if (nextStepSnakeHead[0] > config.fieldWidth) {
            return true;
        }
        if (checkIfOnSnake(nextStepSnakeHead)) {
            return true;
        }
        checkIfFood(nextStepSnakeHead);
    }


    return false;
}

// очистка tick
function stopTick() {
    if (tickId) {
        clearInterval(tickId);
        tickId = null;
    }
}

// tick
function tick() {
    if (!tickId) {
        tickId = setInterval(() => {
            if (ifCollision()) {
                stopTick();
                alert("Collision");
            } else {
                moveSnake();
                snakeChangeChunksDirections();
                drawSnake();
            }
        }, currentStepDuration);
    }
}

// события клавиатуры
function setListeners() {
    newGameEl.addEventListener('click', (event)=>{
        setDefaults();
        startGame();
    })

    document.addEventListener('keydown', (event)=> {
        const keyCode = event.keyCode;
        const directions = {
            38: "up",
            87: "up",
            39: "right",
            68: "right",
            40: "down",
            83: "down",
            37: "left",
            65: "left"
        };

        if (directions[keyCode]) {
            event.preventDefault();
            if (canTurn(directions[keyCode])) {
                snakeDirection = directions[keyCode];
                snakeChunksDirections[0] = snakeDirection;
            }
        }
    })
}

// можно ли повернуть
function canTurn(direction) {

    if (snakeDirection === direction) {
        return false;
    }

    if (snakeDirection === "right") {
        if (direction === "left") {
            return false;
        }
    }

    if (snakeDirection === "left") {
        if (direction === "right") {
            return false;
        }
    }

    if (snakeDirection === "up") {
        if (direction === "down") {
            return false;
        }
    }

    if (snakeDirection === "down") {
        if (direction === "up") {
            return false;
        }
    }

    return true;
}

function setDefaults() {
    snake = [];
    snakeDirection = "right";
    snakeChunksDirections = [];
    tickId = null;
    currentStepDuration = config.stepDuration;
}

function startGame() {
    initField();
    initSnake();
    drawSnake();
    createFood();
}

// Main function
const main = function() {
    startGame();
    setListeners();
};

window.onload = main();
