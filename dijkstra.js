var canvas = document.getElementById("canvas");
/** @type {CanvasRenderingContext2D} */
var ctx = canvas.getContext("2d");
const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const SQUARE_SIZE = 20;
const WIDTH_SQUARE = Math.floor(WIDTH/SQUARE_SIZE);
const HEIGHT_SQUARE = Math.floor(HEIGHT/SQUARE_SIZE);
const RANDOM_RATE = 0.15;
var mode = "default";
var originPosition;
var targetPosition;

canvas.focus();
gridDrawer();
var map = createMap(WIDTH_SQUARE, HEIGHT_SQUARE);

canvas.addEventListener('keydown', function (event) {
    const keys = event.key;
    switchMode(keys);
     if (keys === "c") {
        clearMap(map, WIDTH_SQUARE, HEIGHT_SQUARE);
        clearCanvas();
        gridDrawer();
     } else if (keys === "r") {
        clearCanvas();
        clearVisitedSquares(map, WIDTH_SQUARE, HEIGHT_SQUARE);
        difuse(map, originPosition);
        drawMap(map);
        gridDrawer();
     } else if (keys === "g") {
        clearCanvas();
        clearVisitedSquares(map, WIDTH_SQUARE, HEIGHT_SQUARE);
        randomObstacle(map);
        drawMap(map);
        gridDrawer();
     }
});

function gridDrawer() {
    for (var i = 0; i < HEIGHT_SQUARE; i++) {
        drawLineHorizontal(i);
    }
    for (var i = 0; i < WIDTH_SQUARE; i++) {
        drawLineVertical(i);
    }
}

function drawLineVertical(x) {
    ctx.beginPath();
    ctx.moveTo((x * SQUARE_SIZE), 0);
    ctx.lineTo((x * SQUARE_SIZE), HEIGHT);
    ctx.stroke();
}

function drawLineHorizontal(y) {
    ctx.beginPath();
    ctx.moveTo(0, (y * SQUARE_SIZE));
    ctx.lineTo(WIDTH, (y * SQUARE_SIZE));
    ctx.stroke();
}

function clearCanvas() {
    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.stroke();
}

function drawMap(map) {
    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[i].length; j++) {
            ctx.fillStyle = map[i][j].color;
            ctx.fillRect(map[i][j].x * SQUARE_SIZE, map[i][j].y * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);
        }
    }
}

function drawOnClick(evt) {
    clearCanvas();
    if (mode === "target") {
        placeTarget(evt);
        if (originPosition !== undefined) {
            difuse(map, originPosition);
        }
    } else if (mode === "origin") {
        placeOrigin(evt);
        difuse(map, originPosition);
    } else if (mode === "default") {
        placeObstacle(evt);
    } else if (mode === "erase") {
        erase(evt);
    }
    drawMap(map);
    gridDrawer();
}

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect(), // abs. size of element
        scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for X
        scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y

    return {
        x: Math.floor((evt.clientX - rect.left) * scaleX),   // scale mouse coordinates after they have
        y: Math.floor((evt.clientY - rect.top) * scaleY)     // been adjusted to be relative to element
    }
}

function difuse(map, origin) {
    var colorVariance = 0;
    var found = false;
    var target = {x: 0, y: 0, type: "N", color: "rgb(255, 255, 255)", distance: 0};
    var color = `rgb(${20 + colorVariance}, ${200 + Math.floor(colorVariance / 4)}, ${245 + Math.floor(colorVariance / 10)})`;
    var actualDistance = 0;
    var queue = [];
    queue.push(map[origin.x][origin.y]);
    var q = queue.shift();
    while (found === false) {
        colorVariance = (actualDistance + 1) * 8;
        color = `rgb(${20 + colorVariance}, ${200 + Math.floor(colorVariance / 4)}, ${245 + Math.floor(colorVariance / 10)})`;
        if (q.x + 1 < WIDTH_SQUARE) {
            if (map[q.x + 1][q.y].type === "N") {
                map[q.x + 1][q.y].type = "S";
                map[q.x + 1][q.y].color = color;
                map[q.x + 1][q.y].distance = actualDistance + 1;
                map[q.x + 1][q.y].visited = true;
                queue.push(map[q.x + 1][q.y]);
            } else if (map[q.x + 1][q.y].type === "T") {
                map[q.x + 1][q.y].distance = actualDistance + 1;
                target = map[q.x + 1][q.y];
                found = true;
            }
        }
        if (q.x - 1 >= 0) {
            if (map[q.x - 1][q.y].type === "N") {
                map[q.x - 1][q.y].type = "S";
                map[q.x - 1][q.y].color = color;
                map[q.x - 1][q.y].distance = actualDistance + 1;
                map[q.x - 1][q.y].visited = true;
                queue.push(map[q.x - 1][q.y]);
            } else if (map[q.x - 1][q.y].type === "T") {
                map[q.x - 1][q.y].distance = actualDistance + 1;
                target = map[q.x - 1][q.y];
                found = true;
            }
        }
        if (q.y + 1 < HEIGHT_SQUARE) {
            if (map[q.x][q.y + 1].type === "N") {
                map[q.x][q.y + 1].type = "S";
                map[q.x][q.y + 1].color = color;
                map[q.x][q.y + 1].distance = actualDistance + 1;
                map[q.x][q.y + 1].visited = true;
                queue.push(map[q.x][q.y + 1]);
            } else if (map[q.x][q.y + 1].type === "T") {
                map[q.x][q.y + 1].distance = actualDistance + 1;
                target = map[q.x][q.y + 1];
                found = true;
            }
        }
        if (q.y - 1 >= 0) {
            if (map[q.x][q.y - 1].type === "N") {
                map[q.x][q.y - 1].type = "S";
                map[q.x][q.y - 1].color = color;
                map[q.x][q.y - 1].distance = actualDistance + 1;
                map[q.x][q.y - 1].visited = true;
                queue.push(map[q.x][q.y - 1]);
            } else if (map[q.x][q.y - 1].type === "T") {
                map[q.x][q.y - 1].distance = actualDistance + 1;
                target = map[q.x][q.y - 1];
                found = true;
            }
        }
        if (queue.length === 0) {
            break;
        } else {
            q = queue.shift();
            actualDistance = q.distance;
        }
    }
    if (found) {
        target.visited = true;
        foundOrigin(map, target);
    }
}

function createMap(w, h) {
    var map = [];
    for (var i = 0; i < w; i++) {
        map.push([]);
        for (var j = 0; j < h; j++) {
            map[i].push([]);
            map[i][j] = {x: i, y: j, type: "N", color: "rgb(255, 255, 255)", distance: 0, visited: false};
        }
    }
    return map;
}

function clearMap(map, w, h) {
    for (var i = 0; i < w; i++) {
        for (var j = 0; j < h; j++) {
            map[i][j] = {x: i, y: j, type: "N", color: "rgb(255, 255, 255)", distance: 0, visited: false};
        }
    }
    originPosition = undefined;
    targetPosition = undefined;
}


function clearVisitedSquares(map, w, h) {
    for (var i = 0; i < w; i++) {
        for (var j = 0; j < h; j++) {
            if (map[i][j].visited === true && map[i][j].type === "S") {
                map[i][j] = {x: i, y: j, type: "N", color: "rgb(255, 255, 255)", distance: 0, visited: false};
            }
        }
    }
}

function clearSquare(position) {
    if (map[position.x][position.y].visited === true) {
        map[position.x][position.y] = {x: position.x, y: position.y, type: "N", color: "rgb(255, 255, 255)", distance: 0, visited: false};        
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function placeTarget(evt) {
    if (targetPosition === undefined) {
        clearVisitedSquares(map, WIDTH_SQUARE, HEIGHT_SQUARE);
        Object.assign(map[Math.floor(getMousePos(canvas, evt).x / SQUARE_SIZE)][Math.floor(getMousePos(canvas, evt).y / SQUARE_SIZE)], {type: "T", color: "red", visited: true});
        targetPosition = {x: Math.floor(getMousePos(canvas, evt).x / SQUARE_SIZE), y: Math.floor(getMousePos(canvas, evt).y / SQUARE_SIZE)}
    } else {
        clearVisitedSquares(map, WIDTH_SQUARE, HEIGHT_SQUARE);
        clearSquare(targetPosition);
        Object.assign(map[Math.floor(getMousePos(canvas, evt).x / SQUARE_SIZE)][Math.floor(getMousePos(canvas, evt).y / SQUARE_SIZE)], {type: "T", color: "red", visited: true});
        targetPosition = {x: Math.floor(getMousePos(canvas, evt).x / SQUARE_SIZE), y: Math.floor(getMousePos(canvas, evt).y / SQUARE_SIZE)}
    }
}

function placeOrigin(evt) {
    if (originPosition === undefined) {
        Object.assign(map[Math.floor(getMousePos(canvas, evt).x / SQUARE_SIZE)][Math.floor(getMousePos(canvas, evt).y / SQUARE_SIZE)], {type: "O", color: "blue", distance: 0, visited: true});
        originPosition = {x: Math.floor(getMousePos(canvas, evt).x / SQUARE_SIZE), y: Math.floor(getMousePos(canvas, evt).y / SQUARE_SIZE)}
    } else {
        clearVisitedSquares(map, WIDTH_SQUARE, HEIGHT_SQUARE);
        clearSquare(originPosition);
        Object.assign(map[Math.floor(getMousePos(canvas, evt).x / SQUARE_SIZE)][Math.floor(getMousePos(canvas, evt).y / SQUARE_SIZE)], {type: "O", color: "blue", distance: 0, visited: true});
        originPosition = {x: Math.floor(getMousePos(canvas, evt).x / SQUARE_SIZE), y: Math.floor(getMousePos(canvas, evt).y / SQUARE_SIZE)}
    }
}

function placeObstacle(evt) {
    Object.assign(map[Math.floor(getMousePos(canvas, evt).x / SQUARE_SIZE)][Math.floor(getMousePos(canvas, evt).y / SQUARE_SIZE)], {type: "W", color: "grey", distance: 0, visited: false});
}

function placeObstaclePosition(x, y) {
    Object.assign(map[x][y], {type: "W", color: "grey", distance: 0, visited: false});
}
function erase(evt) {
    if (map[Math.floor(getMousePos(canvas, evt).x / SQUARE_SIZE)][Math.floor(getMousePos(canvas, evt).y / SQUARE_SIZE)].type === "T") {
        clearVisitedSquares(map, WIDTH_SQUARE, HEIGHT_SQUARE);
        clearSquare(targetPosition);
        targetPosition = undefined;
    } else if (map[Math.floor(getMousePos(canvas, evt).x / SQUARE_SIZE)][Math.floor(getMousePos(canvas, evt).y / SQUARE_SIZE)].type === "O") {
        clearVisitedSquares(map, WIDTH_SQUARE, HEIGHT_SQUARE);
        clearSquare(originPosition);
        originPosition = undefined;
    } else {
        Object.assign(map[Math.floor(getMousePos(canvas, evt).x / SQUARE_SIZE)][Math.floor(getMousePos(canvas, evt).y / SQUARE_SIZE)], {type: "N", color: "rgb(255, 255, 255)", distance: 0, visited: false});
    }
}

function switchMode(key) {
    if (key === "t" || key === "z") {
        mode = "target";
    } else if (key === "o" || key === "a") {
        mode = "origin";
    } else if (key === "e" || key === "d") {
        mode = "erase";
    } else {
        mode = "default";
    }
}

function foundOrigin(map, target) {
    var foundOrigin = false;
    var actual = {x: target.x, y: target.y, color: "red", distance: target.distance};
    while (!foundOrigin) {
        var shortestDistance;
        if (actual.x + 1 < map.length) {
            if (map[actual.x + 1][actual.y].distance < actual.distance && map[actual.x + 1][actual.y].visited === true) {
                actual.distance = map[actual.x + 1][actual.y].distance;
                shortestDistance = map[actual.x + 1][actual.y];
            }
        }
        if (actual.x - 1 >= 0) {
            if (map[actual.x - 1][actual.y].distance < actual.distance && map[actual.x - 1][actual.y].visited === true) {
                actual.distance = map[actual.x - 1][actual.y].distance;
                shortestDistance = map[actual.x - 1][actual.y];
            }
        }
        if (actual.y + 1 < map[0].length) {
            if (map[actual.x][actual.y + 1].distance < actual.distance && map[actual.x][actual.y + 1].visited === true) {
                actual.distance = map[actual.x][actual.y + 1].distance;
                shortestDistance = map[actual.x][actual.y + 1];
            }
        }
        if (actual.y - 1 >= 0) {
            if (map[actual.x][actual.y - 1].distance < actual.distance && map[actual.x][actual.y - 1].visited === true) {
                actual.distance = map[actual.x][actual.y - 1].distance;
                shortestDistance = map[actual.x][actual.y - 1];
            }
        }
        actual = shortestDistance;
        if (actual.distance === 0) {
            break;
        }
        map[actual.x][actual.y].color = "orange";
    }
}

function randomObstacle(map) {
    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[i].length; j++) {
            if (Math.random() < RANDOM_RATE) {
                placeObstaclePosition(i, j);
            }
        }
    }
}