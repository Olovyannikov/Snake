/**
 * Snake v0.1.0
 */

/**
 * кнопки поделиться
 */
const shareBtns = function() {
    const currentPageLink = location.href;
    const vkEl = document.getElementById("vk");
    vkEl.setAttribute("href", `https://vk.com/share.php?url=${currentPageLink}`);

    const fbEl = document.getElementById("fb");
    fbEl.setAttribute(
        "href",
        `https://www.facebook.com/sharer/sharer.php?u=${currentPageLink}`
    );

    const twEl = document.getElementById("tw");
    twEl.setAttribute(
        "href",
        `http://twitter.com/share?text=WebSnake!&url=${currentPageLink}`
    );
};

const config = {
    /** Длина змеи */
    initialLength: 5,
    /** скорость змеи */
    stepDuration: 300,
    /** ускорение */
    speedMult: 0.8,
    /** вес еды */
    foodScore: 25,
    /** увеличение веса еды в зависимости от скорости? */
    speedUpScoreN: 50,
    /** ширина поля */
    fieldWidth: 20,
    /** высота поля */
    fieldHeight: 20,
    /** размер клетки в пикселях */
    cellSize: 15
};

let gameStatus = "new"; // "new" | "play" | "stopped"
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
const playGameEl = document.getElementById("play");


/**
 *  создание поля игры
 */
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

/**
 *  инициализация змейки
 */
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

/**
 *  проверка координат на совпадение со змейкой
 */
const checkIfOnSnake = coords => {
    for (i = 0; i < snake.length; i++) {
        const chunk = snake[i];
        if (coords[0] === chunk[0] && coords[1] === chunk[1]) {
            return true;
        }
    }
};

/**
 *  создаем еду
 */
function createFood() {
    let x;
    let y;
    let notOnSnake = true;
    while (notOnSnake) {
        x = Math.floor(Math.random() * config.fieldWidth);
        y = Math.floor(Math.random() * config.fieldHeight);
        notOnSnake = checkIfOnSnake([x, y]);
    }
    if (food[0]) {
        clearFood();
    }
    food = [x, y];
    drawFood();
}

/**
 * удаление еды
 */
function clearFood() {
    const foodCellEls = document.querySelectorAll(".food");
    for (element of foodCellEls) {
        if (element) {
            element.classList.remove("food");
        }
    }
}

/**
 *  рисование еды
 */
function drawFood() {
    clearFood();
    const cellFoodEl = document.getElementById(`${food[1]}.${food[0]}`);
    if (cellFoodEl) {
        cellFoodEl.classList.add("food");
    }
}

/**
 * стирание змейки
 */
function clearSnake() {
    const snakeCellEls = document.querySelectorAll(".snake");
    for (chunk of snakeCellEls) {
        if (chunk) {
            chunk.classList.remove("snake");
            chunk.classList.remove("head");

        }
    }
}

/**
 * рендеринг змейки
 */
function drawSnake() {
    const drawingSnake = snake.slice();
    if (
        drawingSnake[0][0] > config.fieldWidth ||
        drawingSnake[0][1] > config.fieldHeight
    ) {
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
    document.getElementById(`${drawingSnake[0][1]}.${drawingSnake[0][0]}`).classList.add("head");


}

/**
 * смена направлений кусков змеи
 */
function snakeChangeChunksDirections() {
    let movedSnakeChunksDirections = snakeChunksDirections.slice();
    for (i = 0; i < movedSnakeChunksDirections.length - 1; i++) {
        const index = movedSnakeChunksDirections.length - 1 - i;
        movedSnakeChunksDirections[index] = movedSnakeChunksDirections[index - 1];
    }
    snakeChunksDirections = movedSnakeChunksDirections.slice();
}

/**
 * сдвиг змейки
 */
function moveSnake() {
    let movedSnake = snake.slice();
    const currentSnakeChunksDirections = snakeChunksDirections.slice();
    const currentFood = food;
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

/**
 * поедание еды
 */
function eatFood() {
    score = score + config.foodScore;
    food = [];
    createFood();
    scoreEl.innerHTML = score;
    if (score > 0 && score % config.speedUpScoreN === 0) {
        speed++;
        speedEl.innerHTML = speed;
        clearInterval(tickId);
        tickId = null;
        currentStepDuration = currentStepDuration * config.speedMult;
        tick();
    }

}

/**
 * проверка на коллизию
 */
function ifCollision() {
    const snakeHead = snake.slice(0, 1)[0];
    const snakeAss = snake.slice(-1)[0];
    let nextStepSnakeHead = [];
    const direction = snakeChunksDirections.slice(0, 1);
    const checkIfFood = coords => {
        if (coords[0] === food[0] && coords[1] === food[1]) {
            snakeChunksDirections.push(snakeChunksDirections.slice(0))
            snake.push(snakeAss)
            eatFood();
        }
    };

    if (direction == "up") {
        nextStepSnakeHead = [snakeHead[0], snakeHead[1] - 1];
        if (nextStepSnakeHead[1] < 0) {
            return true;
        }
        if (checkIfOnSnake(nextStepSnakeHead)) {
            return true;
        }
        checkIfFood(nextStepSnakeHead);
    }

    if (direction == "down") {
        nextStepSnakeHead = [snakeHead[0], snakeHead[1] + 1];
        if (nextStepSnakeHead[1] >= config.fieldHeight) {
            return true;
        }
        if (checkIfOnSnake(nextStepSnakeHead)) {
            return true;
        }
        checkIfFood(nextStepSnakeHead);
    }

    if (direction == "left") {
        nextStepSnakeHead = [snakeHead[0] - 1, snakeHead[1]];
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
        if (nextStepSnakeHead[0] >= config.fieldWidth) {
            return true;
        }
        if (checkIfOnSnake(nextStepSnakeHead)) {
            return true;
        }
        checkIfFood(nextStepSnakeHead);
    }

    return false;
}

/**
 *  очистка tick
 */
function stopTick() {
    if (tickId) {
        clearInterval(tickId);
        tickId = null;
    }
}

/**
 *  tick
 */
function tick() {
    if (!tickId) {
        tickId = setInterval(() => {
            if (ifCollision()) {
                stopTick();
                alert("Collision");
                newGameEl.setAttribute("style", "display: block");
            } else {
                moveSnake();
                snakeChangeChunksDirections();
                drawSnake();
            }
        }, currentStepDuration);
    }
}

/**
 *  события клавиатуры
 */
function setListeners() {
    newGameEl.addEventListener("click", event => {
        setDefaults();
        initField();
        initSnake();
        drawSnake();

        newGameEl.setAttribute("style", "display: none");
        playGameEl.setAttribute("style", "display: block");
    });

    playGameEl.addEventListener("click", event => {
        startGame();
        tick();
        playGameEl.setAttribute("style", "display: none");
    });

    document.addEventListener("keydown", event => {
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
    });
}

/**
 *  можно ли повернуть
 */
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

/**
 * стартовые значения
 */
function setDefaults() {
    score = 0;
    speed = 1;
    currentSpeedDuration = config.stepDuration;
    food = [];
    snake = [];
    snakeDirection = "right";
    snakeChunksDirections = [];
    tickId = null;
    currentStepDuration = config.stepDuration;
    scoreEl.innerHTML = score;
    speedEl.innerHTML = speed;
}

function startGame() {
    setDefaults();
    initField();
    initSnake();
    drawSnake();
    createFood();
}

// Main function
const main = function() {
    shareBtns();

    initField();
    setListeners();
};

window.onload = main();
