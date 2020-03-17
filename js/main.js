/**
 * Snake v0.0.1
 */


const config = {
    initialLength: 5,
    stepDuration: 500,
    foodScore: 25,
    fieldWidth: 20,
    fieldHeight: 20,
    cellSize: 15,
};

let snake = [];
let snakeDirection = "right"; // "up" | "right" | "down" | "left"
let snakeChunksDirections = [];
let tickId = null;
let currentStepDuration = config.stepDuration;


// элементы DOM-дерева
const gameEl = document.getElementById("game");
const scoreEl = document.getElementById("score");
const speedEl = document.getElementById("speed");

// создание поля игры
function initField() {
    const fieldEl = document.createElement("div");
    fieldEl.classList.add("field");
    fieldEl.setAttribute("style", `width: ${config.cellSize*config.fieldWidth}px; height: ${config.cellSize*config.fieldHeight}px;`);

    for (i = 0; i < config.fieldWidth; i++) {
        for (j = 0; j < config.fieldHeight; j++) {
            const cellEl = document.createElement("div");
            cellEl.classList.add("cell");
            cellEl.setAttribute("id", `${i}.${j}`);
            cellEl.setAttribute("style", `width: ${config.cellSize}px; height: ${config.cellSize}px;`);
            fieldEl.append(cellEl);
        }
    }

    gameEl.append(fieldEl);
}

// инициализация змейки
function initSnake() {
    const newSnake = snake.slice();
    const newSnakeChunksDirections = snakeChunksDirections.slice();

    const initialX = Math.floor( config.fieldHeight / 2 );
    const initialY = 0;

    for (i = 0; i < config.initialLength; i++) {
        newSnake.push([initialX, initialY+i]);
        newSnakeChunksDirections.push("right");
    }

    newSnakeChunksDirections[config.initialLength]="up";

    snake = newSnake.slice().reverse();
    snakeChunksDirections = newSnakeChunksDirections.slice().reverse();
}

// стирание змейки
function clearSnake() {
    const snakeCellEls = document.querySelectorAll(".snake");
    for (chunk of snakeCellEls ) {
        chunk.classList.remove("snake");
    }
}

// рендеринг змейки
function drawSnake() {
    const drawingSnake = snake.slice();

    for (i=0; i < drawingSnake.length; i++ ) {
        const x = drawingSnake[i][0];
        const y = drawingSnake[i][1];
        const snakeCellEl = document.getElementById(`${x}.${y}`);
        snakeCellEl.classList.add("snake");
    }
}

// смена направлений кусков змеи
function snakeChangeChunksDirections() {

    const movedSnakeChunksDirections = snakeChunksDirections.slice();
    for (i=0; i < movedSnakeChunksDirections.length - 1; i++) {
        const index = movedSnakeChunksDirections.length - 1 - i;
        movedSnakeChunksDirections[index] = movedSnakeChunksDirections[index - 1];
    }

    snakeChunksDirections = movedSnakeChunksDirections.slice();
}

// tick
function tick() {
    if ( tickId ) {
        clearInterval(tickId);
        tickId = null;
    }
    tickId = setInterval( function(){

    }, currentStepDuration);
}

// Main function
const main = function() {
    initField();
    initSnake();
    drawSnake();
};

window.onload = main();
