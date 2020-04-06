var canvas = document.getElementById("canvas");
/** @type {CanvasRenderingContext2D} */
var ctx = canvas.getContext("2d");
const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const SQUARE_SIZE = 20;
const WIDTH_SQUARE = Math.floor(WIDTH/SQUARE_SIZE);
const HEIGHT_SQUARE = Math.floor(HEIGHT/SQUARE_SIZE);
var surfaces = [];
var mode = "default";
var originPosition;
var targetPosition;

canvas.focus();
gridDrawer();
var map = createMap(WIDTH_SQUARE, HEIGHT_SQUARE);

canvas.addEventListener('keydown', function (event) {
    const keys = event.key;
    switchMode(keys);
    console.log(keys);
     if (keys === "c") {
        clearMap(map, WIDTH_SQUARE, HEIGHT_SQUARE);
        clearCanvas();
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
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.stroke();
}

function drawSurfaces() {
    for (let i = 0; i < surfaces.length; i++) {
        ctx.fillStyle = surfaces[i].color;
        //console.log(surfaces[i]);
        ctx.fillRect(surfaces[i].X, surfaces[i].Y, SQUARE_SIZE, SQUARE_SIZE);
    }
}

function drawSurfacesMap(map) {
    console.log(map);
    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[i].length; j++) {
            ctx.fillStyle = map[i][j].color;
            ctx.fillRect(map[i][j].x * SQUARE_SIZE, map[i][j].y * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);
        }
    }
}

async function drawSurfacesDistance() {
    for (let i = 0; i < surfaces.length; i++) {
        ctx.fillStyle = surfaces[i].color;
        //console.log(surfaces[i]);
        await sleep(20);
        ctx.fillRect(surfaces[i].X, surfaces[i].Y, SQUARE_SIZE, SQUARE_SIZE);
        gridDrawer();
    }
    gridDrawer();
}

function drawOnClick(evt) {
    clearCanvas();
    if (mode === "target") {
        placeTarget(evt);
    //    drawSurfaces();
  //      gridDrawer();
    } else if (mode === "origin") {
        console.log(originPosition);
        placeOrigin(evt);
        console.log(originPosition);
        difuse(map, originPosition, 3);
//        drawSurfacesDistance();
        //gridDrawer();
    } else if (mode === "default") {
        //colorSurfacesOnClick(evt);
        placeObstacle(evt);
      //  drawSurfaces();
       // gridDrawer();
    } else if (mode === "clear") {
        clearMap(map, WIDTH_SQUARE, HEIGHT_SQUARE);
        // clearCanvas();
    } else if (mode === "erase") {
        erase(evt);
    }
//    console.log(surfaces);
    drawSurfacesMap(map);
    gridDrawer();
}

var co = 0;

function colorSurfacesOnClick(evt) {
    ctx.fillStyle = `rgb(${20 + co}, ${200 + Math.floor(co / 4)}, ${245 + Math.floor(co / 10)})`;
    //    co += 20;
    var x = Math.floor(getMousePos(canvas, evt).x / SQUARE_SIZE) * SQUARE_SIZE;
    var y = Math.floor(getMousePos(canvas, evt).y / SQUARE_SIZE) * SQUARE_SIZE;
    surfaces.push({ X: x, Y: y, color: ctx.fillStyle });
}

function colorSurfaces(x, y, c) {
    surfaces.push({ X: x, Y: y, color: c });
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

function difuse(map, origin, depth) {
    var colorVariance = 0;
    var found = false;
    var target = {x: 0, y: 0, type: "N", color: "rgb(255, 255, 255)", distance: 0};
    var color = `rgb(${20 + colorVariance}, ${200 + Math.floor(colorVariance / 4)}, ${245 + Math.floor(colorVariance / 10)})`;
    var actualDistance = 0;
    var queue = [];
    console.log(color);
    colorSurfaces(origin.x * SQUARE_SIZE, origin.y * SQUARE_SIZE, "blue")
    queue.push(map[origin.x][origin.y]);
    var q = queue.shift();
//    for (let i = 0; i < depth; i++) {
    while (found === false) {
   //     console.log("actualDistance: " + actualDistance);
//        var q = queue.shift();
        colorVariance = (actualDistance + 1) * 8;
        color = `rgb(${20 + colorVariance}, ${200 + Math.floor(colorVariance / 4)}, ${245 + Math.floor(colorVariance / 10)})`;
        if (q.x + 1 < WIDTH_SQUARE) {
            if (map[q.x + 1][q.y].type === "N") {
                map[q.x + 1][q.y].type = "S";
                map[q.x + 1][q.y].color = color;
                map[q.x + 1][q.y].distance = actualDistance + 1;
                map[q.x + 1][q.y].visited = true;
                colorSurfaces((q.x + 1) * SQUARE_SIZE, q.y * SQUARE_SIZE, color);
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
                colorSurfaces((q.x - 1) * SQUARE_SIZE, q.y * SQUARE_SIZE, color);
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
                colorSurfaces(q.x * SQUARE_SIZE, (q.y + 1) * SQUARE_SIZE, color);
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
                colorSurfaces(q.x * SQUARE_SIZE, (q.y - 1) * SQUARE_SIZE, color);
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
//    console.log(map);
//    console.log(target);
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


function clearVisited(map, w, h) {
    for (var i = 0; i < w; i++) {
        for (var j = 0; j < h; j++) {
            if (map[i][j].visited === true) {
                map[i][j] = {x: i, y: j, type: "N", color: "rgb(255, 255, 255)", distance: 0, visited: false};
            }
        }
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function placeTarget(evt) {
    if (targetPosition === undefined) {
        Object.assign(map[Math.floor(getMousePos(canvas, evt).x / SQUARE_SIZE)][Math.floor(getMousePos(canvas, evt).y / SQUARE_SIZE)], {type: "T", color: "red"});
        targetPosition = {x: Math.floor(getMousePos(canvas, evt).x / SQUARE_SIZE), y: Math.floor(getMousePos(canvas, evt).y / SQUARE_SIZE)}
    } else {
        console.log(map);
        clearVisited(map, 20, 10);
        Object.assign(map[Math.floor(getMousePos(canvas, evt).x / SQUARE_SIZE)][Math.floor(getMousePos(canvas, evt).y / SQUARE_SIZE)], {type: "T", color: "red"});
        targetPosition = {x: Math.floor(getMousePos(canvas, evt).x / SQUARE_SIZE), y: Math.floor(getMousePos(canvas, evt).y / SQUARE_SIZE)}
    }
}

function placeOrigin(evt) {
    if (originPosition === undefined) {
        Object.assign(map[Math.floor(getMousePos(canvas, evt).x / SQUARE_SIZE)][Math.floor(getMousePos(canvas, evt).y / SQUARE_SIZE)], {type: "O", color: "blue", distance: 0, visited: true});
        originPosition = {x: Math.floor(getMousePos(canvas, evt).x / SQUARE_SIZE), y: Math.floor(getMousePos(canvas, evt).y / SQUARE_SIZE)}
    }
}

function placeObstacle(evt) {
    Object.assign(map[Math.floor(getMousePos(canvas, evt).x / SQUARE_SIZE)][Math.floor(getMousePos(canvas, evt).y / SQUARE_SIZE)], {type: "W", color: "grey"});
}

function erase(evt) {
    if (map[Math.floor(getMousePos(canvas, evt).x / SQUARE_SIZE)][Math.floor(getMousePos(canvas, evt).y / SQUARE_SIZE)].type = "T") {
        targetPosition = undefined;
    } else if (map[Math.floor(getMousePos(canvas, evt).x / SQUARE_SIZE)][Math.floor(getMousePos(canvas, evt).y / SQUARE_SIZE)].type = "O") {
        originPosition = undefined;
    }
    Object.assign(map[Math.floor(getMousePos(canvas, evt).x / SQUARE_SIZE)][Math.floor(getMousePos(canvas, evt).y / SQUARE_SIZE)], {type: "N", color: "white", distance: 0, visited: false});
}

function switchMode(key) {
    if (key === "t" || key === "a") {
        mode = "target";
    } else if (key === "o" || key === "z") {
        mode = "origin";
    } else if (key === "w") {
        mode = "wall";
    } else if (key === "e") {
        mode = "erase";
    } else {
        mode = "default";
    }
}

function foundOrigin(map, target) {
    var foundOrigin = false;
    var actual = {x: target.x, y: target.y, color: "red", distance: target.distance};
    console.log("actual");
    console.log(actual);
    var safe = 0;
    while (!foundOrigin /*&& safe <100*/) {
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
            console.log("c");
            if (map[actual.x][actual.y + 1].distance < actual.distance && map[actual.x][actual.y + 1].visited === true) {
                actual.distance = map[actual.x][actual.y + 1].distance;
                shortestDistance = map[actual.x][actual.y + 1];
            }
        }
        if (actual.y - 1 >= 0) {
            console.log("d");
            if (map[actual.x][actual.y - 1].distance < actual.distance && map[actual.x][actual.y - 1].visited === true) {
                actual.distance = map[actual.x][actual.y - 1].distance;
                shortestDistance = map[actual.x][actual.y - 1];
            }
        }
        console.log(shortestDistance);
        actual = shortestDistance;
        if (actual.distance === 0) {
            break;
        }
        map[actual.x][actual.y].color = "orange";
        colorSurfaces(actual.x * SQUARE_SIZE, actual.y * SQUARE_SIZE, "orange");
        //safe++;
    }
}