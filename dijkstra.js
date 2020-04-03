var canvas = document.getElementById("canvas");
/** @type {CanvasRenderingContext2D} */
var ctx = canvas.getContext("2d");
var surfaces = [];
var mode = "wait";


gridDrawer();

var map = createMap(20, 10);
//console.log(map);
//difuse(map, {x: 5, y:5}, 3);

canvas.addEventListener('keydown', function (event) {
    const keys = event.key; // "a", "1", "Shift", etc.
    switchMode(keys);
});

function gridDrawer() {
    for (var i = 0; i < 20; i++) {
        drawLineVertical(i);
        drawLineHorizontal(i);
    }
}

function drawLineVertical(x) {
    ctx.beginPath();
    ctx.moveTo((x * 20), 0);
    ctx.lineTo((x * 20), 200);
    ctx.stroke();
}

function drawLineHorizontal(y) {
    ctx.beginPath();
    ctx.moveTo(0, (y * 20));
    ctx.lineTo(400, (y * 20));
    ctx.stroke();
}

function clearCanvas() {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, 400, 200);
    ctx.stroke();
}

function drawSurfaces() {
    for (let i = 0; i < surfaces.length; i++) {
        ctx.fillStyle = surfaces[i].color;
        //console.log(surfaces[i]);
        ctx.fillRect(surfaces[i].X, surfaces[i].Y, 20, 20);
    }
}

async function drawSurfacesDistance() {
    for (let i = 0; i < surfaces.length; i++) {
        ctx.fillStyle = surfaces[i].color;
        //console.log(surfaces[i]);
        await sleep(20);
        ctx.fillRect(surfaces[i].X, surfaces[i].Y, 20, 20);
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
        placeOrigin(evt);
        difuse(map, {x: Math.floor(getMousePos(canvas, evt).x / 20 ), y:Math.floor(getMousePos(canvas, evt).y / 20 )}, 3);
//        drawSurfacesDistance();
        //gridDrawer();
    } else if (mode === "wait") {
        //colorSurfacesOnClick(evt);
        placeObstacle(evt);
      //  drawSurfaces();
       // gridDrawer();
    }
//    console.log(surfaces);
    drawSurfaces();
    gridDrawer();
}

var co = 0;

function colorSurfacesOnClick(evt) {
    ctx.fillStyle = `rgb(${20 + co}, ${200 + Math.floor(co / 4)}, ${245 + Math.floor(co / 10)})`;
    //    co += 20;
    var x = Math.floor(getMousePos(canvas, evt).x / 20) * 20;
    var y = Math.floor(getMousePos(canvas, evt).y / 20) * 20;
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
    map[origin.x][origin.y].type = "S";
    map[origin.x][origin.y].distance = 0;
    var colorVariance = 0;
    var found = false;
    var target = {x: 0, y: 0, type: "N", color: "rgb(255, 255, 255)", distance: 0};
    var color = `rgb(${20 + colorVariance}, ${200 + Math.floor(colorVariance / 4)}, ${245 + Math.floor(colorVariance / 10)})`;
    var actualDistance = 0;
    var queue = [];
    console.log(color);
    colorSurfaces(origin.x * 20, origin.y * 20, "blue")
    queue.push(map[origin.x][origin.y]);
    var q = queue.shift();
//    for (let i = 0; i < depth; i++) {
    while (found === false) {
   //     console.log("actualDistance: " + actualDistance);
//        var q = queue.shift();
        colorVariance = (actualDistance + 1) * 15;
        color = `rgb(${20 + colorVariance}, ${200 + Math.floor(colorVariance / 4)}, ${245 + Math.floor(colorVariance / 10)})`;
        if (q.x + 1 < 20) {
            if (map[q.x + 1][q.y].type === "N") {
                map[q.x + 1][q.y].type = "S";
                map[q.x + 1][q.y].color = color;
                map[q.x + 1][q.y].distance = actualDistance + 1;
                colorSurfaces((q.x + 1) * 20, q.y * 20, color);
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
                colorSurfaces((q.x - 1) * 20, q.y * 20, color);
                queue.push(map[q.x - 1][q.y]);
            } else if (map[q.x - 1][q.y].type === "T") {
                map[q.x - 1][q.y].distance = actualDistance + 1;
                target = map[q.x - 1][q.y];
                found = true;
            }
        }
        if (q.y + 1 < 10) {
            if (map[q.x][q.y + 1].type === "N") {
                map[q.x][q.y + 1].type = "S";
                map[q.x][q.y + 1].color = color;
                map[q.x][q.y + 1].distance = actualDistance + 1;
                colorSurfaces(q.x * 20, (q.y + 1) * 20, color);
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
                colorSurfaces(q.x * 20, (q.y - 1) * 20, color);
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
        foundOrigin(map, target);
    }
}

function createMap(w, h) {
    var map = [];
    for (var i = 0; i < w; i++) {
        map.push([]);
        for (var j = 0; j < h; j++) {
            map[i].push([]);
            map[i][j] = {x: i, y: j, type: "N", color: "rgb(255, 255, 255)", distance: 100};
        }
    }
    return map;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function placeTarget(evt) {
    colorSurfaces(Math.floor(getMousePos(canvas, evt).x / 20 ) * 20, Math.floor(getMousePos(canvas, evt).y / 20) * 20, "red");
    map[Math.floor(getMousePos(canvas, evt).x / 20 )][Math.floor(getMousePos(canvas, evt).y / 20)].type = "T";
}

function placeOrigin(evt) {
    colorSurfaces(Math.floor(getMousePos(canvas, evt).x / 20 ) * 20, Math.floor(getMousePos(canvas, evt).y / 20) * 20, "blue");
}

function placeObstacle(evt) {
    colorSurfaces(Math.floor(getMousePos(canvas, evt).x / 20 ) * 20, Math.floor(getMousePos(canvas, evt).y / 20) * 20, "grey");
    map[Math.floor(getMousePos(canvas, evt).x / 20 )][Math.floor(getMousePos(canvas, evt).y / 20)].type = "W";
}

function switchMode(key) {
    if (key === "t") {
        mode = "target";
    } else if (key === "o") {
        mode = "origin";
    } else {
        mode = "wait";
    }
}

function foundOrigin(map, target) {
    var foundOrigin = false;
    var actual = {x: target.x, y: target.y, color: "red", distance: target.distance};
    console.log("actual");
    console.log(actual);
    var safe = 0;
    while (!foundOrigin && safe <100) {
        var shortestDistance;
        if (actual.x + 1 < map.length) {
            if (map[actual.x + 1][actual.y].distance < actual.distance) {
                actual.distance = map[actual.x + 1][actual.y].distance;
                shortestDistance = map[actual.x + 1][actual.y];
            }
        }
        if (actual.x - 1 >= 0) {
            if (map[actual.x - 1][actual.y].distance < actual.distance) {
                actual.distance = map[actual.x - 1][actual.y].distance;
                shortestDistance = map[actual.x - 1][actual.y];
            }
        }
        if (actual.y + 1 < map[0].length) {
            console.log("c");
            if (map[actual.x][actual.y + 1].distance < actual.distance) {
                actual.distance = map[actual.x][actual.y + 1].distance;
                shortestDistance = map[actual.x][actual.y + 1];
            }
        }
        if (actual.y - 1 >= 0) {
            console.log("d");
            if (map[actual.x][actual.y - 1].distance < actual.distance) {
                actual.distance = map[actual.x][actual.y - 1].distance;
                shortestDistance = map[actual.x][actual.y - 1];
            }
        }
        console.log(shortestDistance);
        actual = shortestDistance;
        if (actual.distance === 0) {
            break;
        }
        colorSurfaces(actual.x * 20, actual.y * 20, "orange");
        safe++;
    }
}