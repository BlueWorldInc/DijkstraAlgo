var c = document.getElementById("CanvasAS");
var ctx = c.getContext("2d");

var squares = {
    lastSquare: {
        x: 0,
        y: 0
    }, currentSquare: {
        x: 0,
        y: 0
    }
}

var directions = {
    directLineDirection: {
        x: 0,
        y: 0
    }, diagonalDirection: {
        d0: -1,
        d1: 1
    }
}

// var surfaces = [[0, 0, "normal"], [0, 2, "water"]];
var surfaces = [[]];

var surfaceType = "normal";

gridDrawer();
getDistanceX();


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

async function gridDrawer() {
    for (var i = 0; i < 20; i++) {
        drawLineVertical(i);
        drawLineHorizontal(i);
    }
}

function colorSquare(x, y, color) {
    ctx.fillStyle = colorOfSurface();
    ctx.fillRect((x * 20), (y * 20), 20, 20);
    ctx.stroke();
}

async function drawSurface() {
    for (var i = 0; i < surfaces.length; i++) {
        if (surfaces[i][2] != "intermediary") {
            ctx.fillStyle = colorOfSurfaces(surfaces[i][2]);
            ctx.fillRect((surfaces[i][0] * 20), (surfaces[i][1] * 20), 20, 20);
        }
    }
    ctx.stroke();
    for (var i = 0; i < surfaces.length; i++) {
        if (surfaces[i][2] == "intermediary") {
            await sleep(50);
            ctx.fillStyle = colorOfSurfaces(surfaces[i][2]);
            ctx.fillRect((surfaces[i][0] * 20), (surfaces[i][1] * 20), 20, 20);
        }
    }
}

function clearCanvas() {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, 400, 200);
    clearSurface();
    gridDrawer();
    ctx.stroke();
}

function clearSurface() {
    for (var i = 0; i < surfaces.length; i++) {
        if (surfaces[i][2] == "normal" || surfaces[i][2] == "intermediary") {
            surfaces.splice(i, 1);
            i--;
        }
    }
}

function clearSquare(x, y) {
    for (var i = 0; i < surfaces.length; i++) {
        if (surfaces[i][0] == x && surfaces[i][1] == y) {
            surfaces.splice(i, 1);
            i--;
        }
    }
}

function colorSelectedSquareOnClick() {
    var rect = c.getBoundingClientRect();
    var x = event.clientX - Math.round(rect.left);
    var y = event.clientY - Math.round(rect.top);
    if (x >= 400) { x = 399; }
    if (y >= 200) { y = 199; }
    //clear canvas
    clearCanvas();
    //redraw canvas
    if (this.surfaceType == "normal") {
        surfaces.push([Math.floor(x / 20), Math.floor(y / 20), "normal"]);
        // colorSquare(Math.floor(x / 20), Math.floor(y / 20), "black");
        updateSquares(Math.floor(x / 20), Math.floor(y / 20));
        getDistanceX();
        surfaces.push([squares.lastSquare.x, squares.lastSquare.y, "normal"]);
        // colorSquare(squares.lastSquare.x, squares.lastSquare.y, "black");
        // //console.log(surfaces);
        //console.log("***********************************************************");
        // //console.log("Distance to the start " + getDistanceToStart(surfaces[0]));
        // //console.log("Distance to the end " + getDistanceToEnd(surfaces[0]));
        //colorIntermediary();
        colorPath();
        findPath();
    } else if (this.surfaceType == "clear") {
        clearSquare(Math.floor(x / 20), Math.floor(y / 20));
    } else {
        surfaces.push([Math.floor(x / 20), Math.floor(y / 20), this.surfaceType]);
    }
    drawSurface();
}

function updateSquares(x, y) {
    squares.lastSquare.x = squares.currentSquare.x;
    squares.lastSquare.y = squares.currentSquare.y;
    squares.currentSquare.x = x;
    squares.currentSquare.y = y;
    document.getElementById("lastPoint").innerHTML = " X=" + squares.lastSquare.x + " Y=" + squares.lastSquare.y;
    document.getElementById("currentPoint").innerHTML = " X=" + squares.currentSquare.x + " Y=" + squares.currentSquare.y;
}

async function colorIntermediary() {
    //Intermediary Square
    var IS = {
        x: 0,
        y: 0
    }
    var sl = squares.lastSquare;
    var sc = squares.currentSquare;
    var dld = directions.directLineDirection;
    var dd = directions.diagonalDirection;
    xOffset = sl.x - sc.x;
    yOffset = sl.y - sc.y;
    if (sl.x !== sc.x && sl.y === sc.y) {
        diff = sl.x - sc.x;
        for (var i = 1; i < Math.abs(diff); i++) {
            // await sleep(50);
            surfaces.push([(sl.x - (Math.sign(diff) * i)), sl.y, "intermediary"]);
            // colorSquare((sl.x - (Math.sign(diff) * i)), sl.y, "red");
        }
    } else if (sl.x === sc.x && sl.y !== sc.y) {
        diff = sl.y - sc.y;
        for (var i = 1; i < Math.abs(diff); i++) {
            // await sleep(50);
            surfaces.push([sl.x, sl.y - (Math.sign(diff) * i), "intermediary"]);
            // colorSquare(sl.x, sl.y - (Math.sign(diff) * i), "red");
        }
    } else
        if (sl.x !== sc.x && sl.y !== sc.y) {

            diagonalNumber = Math.min(Math.abs(xOffset), Math.abs(yOffset));
            directLineNumber = Math.abs(Math.abs(xOffset) - Math.abs(yOffset));

            if (xOffset > 0 && yOffset < 0) {
                dd.d0 = -1;
                dd.d1 = 1;
            }
            if (xOffset < 0 && yOffset < 0) {
                dd.d0 = -1;
                dd.d1 = -1;
            }
            if (xOffset > 0 && yOffset > 0) {
                dd.d0 = 1;
                dd.d1 = 1;
            }
            if (xOffset < 0 && yOffset > 0) {
                dd.d0 = 1;
                dd.d1 = -1;
            }

            if (directLineNumber > 0) {
                if (xOffset < 0 && yOffset > 0) {
                    if (xOffset + yOffset > 0) {
                        dld.y = -1;
                        dld.x = 0;
                    } else {
                        dld.x = 1;
                        dld.y = 0;
                    }
                }

                if (xOffset < 0 && yOffset < 0) {
                    if (xOffset - yOffset > 0) {
                        dld.y = 1;
                        dld.x = 0;
                    } else {
                        dld.x = 1;
                        dld.y = 0;
                    }
                }

                if (xOffset > 0 && yOffset > 0) {
                    if (xOffset - yOffset < 0) {
                        dld.y = -1;
                        dld.x = 0;
                    } else {
                        dld.x = -1;
                        dld.y = 0;
                    }
                }

                if (xOffset > 0 && yOffset < 0) {
                    if (xOffset + yOffset < 0) {
                        dld.y = 1;
                        dld.x = 0;
                    } else {
                        dld.x = -1;
                        dld.y = 0;
                    }
                }
            }

            IS.x = sl.x;
            IS.y = sl.y;


            for (var i = 1; i <= diagonalNumber; i++) {
                if (i == diagonalNumber && directLineNumber == 0) {
                    break;
                }
                // await sleep(50);
                IS.x -= dd.d1;
                IS.y -= dd.d0;
                surfaces.push([IS.x, IS.y, "intermediary"]);
                // colorSquare(IS.x, IS.y, "red");
            }

            for (var i = 1; i < directLineNumber; i++) {
                // await sleep(50);
                IS.x += dld.x;
                IS.y += dld.y;
                surfaces.push([IS.x, IS.y, "intermediary"]);
                // colorSquare(IS.x, IS.y, "red");
            }
        }
}

function colorPath() {
    for (var i = 0; i < surfaces.length; i++) {
        if (surfaces[i][2] == "intermediary") {
            colorSquare(surfaces[i][0], surfaces[i][1]);
            // //console.log(i);
            // //console.log("Distance to the start " + getDistanceToStart(surfaces[i]));
            // //console.log("Distance to the end " + getDistanceToEnd(surfaces[i]));
            // //console.log("Distance Total " + getDistanceTotal(surfaces[i]));
        }
    }
}

function findPath() {
    // coord, distance and type: 6
    var sc = squares.lastSquare;
    var actualSquare = {
        x: squares.lastSquare.x,
        y: squares.lastSquare.y
    }
    var squareList = getNeighbord(sc);
    var visitedSquareList = [[x = squares.lastSquare.x,
    y = squares.lastSquare.y]];
    // var distanceList = [];
    t = 0;
    while ((actualSquare.x != squares.currentSquare.x
        || actualSquare.y != squares.currentSquare.y)
        && t < 200) {
        //console.log("Actual square:");
        //console.log(actualSquare);
        //console.log("Squares Current square:");
        //console.log(squares.currentSquare);
        //console.log(actualSquare == squares.currentSquare);

        console.log("****************Touring*****************" + t + "**************");
        // for (var i = 0; i < squareList.length; i++) {
        //     // distanceList.push(getDistanceTotal(squareList[i]));
        //     distanceList.push(getDistanceToEnd(squareList[i]));
        // }
        // //console.log(getMinIndex(distanceList));
        // //console.log(squareList[getMinIndex(distanceList)][0]);
        if (t != 0) {
            surfaces.push([actualSquare.x, actualSquare.y, "intermediary"]);
        }
        //console.log(getMinIndex(squareList));
        actualSquare.x = squareList[getMinIndex(squareList)][0];
        actualSquare.y = squareList[getMinIndex(squareList)][1];
        visitedSquareList.push([actualSquare.x, actualSquare.y]);
        console.log("visited square:");
        console.log(visitedSquareList);
        
        //console.log("sqaurelist");
        //console.log(squareList);
        //console.log("actual square");
        //console.log(actualSquare);
        //console.log(squareList);
        //console.log("splice");
        squareList.splice(getMinIndex(squareList), 1);
        if (squares.currentSquare.x === actualSquare.x &&
            squares.currentSquare.y === actualSquare.y) {
            //console.log("yaayayaay c'est bon");
            break;
        }
        // //console.log(distanceList);
        //console.log(squareList);
        // //console.log(actualSquare);
        // //console.log(squares.currentSquare);
        // var distanceList = [];
        // //console.log(updateSquareList(squareList, getNeighbord(actualSquare)));
        squareList = updateSquareList(squareList, getNeighbord(actualSquare), visitedSquareList);
        // squareList = getNeighbord(actualSquare);
        t++;
    }

    // for (var i = 0; i < squareList.length; i++) {
    //     //console.log("Square " + squareList[i]);
    //     //console.log("Distance Total " + getDistanceTotal(squareList[i]));
    //     distanceList.push(getDistanceTotal(squareList[i]));
    // }
    // //console.log("min : " + getMin(distanceList));
    // //console.log("index : " + getMinIndex(distanceList));

}


//calculate all v of first
//go to the lowest
//calculate all v of this
//go to the lowest

function getNeighbord(s) {
    var squareList = [];
    if (isInsideTheGrid(s.x - 1, s.y - 1)) {
        if (!isSurfaceAnObstacle(s.x - 1, s.y - 1)) {
            squareList.push([s.x - 1, s.y - 1]);
        }
    }
    if (isInsideTheGrid(s.x, s.y - 1)) {
        if (!isSurfaceAnObstacle(s.x, s.y - 1)) {
            squareList.push([s.x, s.y - 1]);
        }
    }
    if (isInsideTheGrid(s.x + 1, s.y - 1)) {
        if (!isSurfaceAnObstacle(s.x + 1, s.y - 1)) {
            squareList.push([s.x + 1, s.y - 1]);
        }
    }
    if (isInsideTheGrid(s.x - 1, s.y)) {
        if (!isSurfaceAnObstacle(s.x - 1, s.y)) {
            squareList.push([s.x - 1, s.y]);
        }
    }
    if (isInsideTheGrid(s.x + 1, s.y)) {
        if (!isSurfaceAnObstacle(s.x + 1, s.y)) {
            squareList.push([s.x + 1, s.y]);
        }
    }
    if (isInsideTheGrid(s.x - 1, s.y + 1)) {
        if (!isSurfaceAnObstacle(s.x - 1, s.y + 1)) {
            squareList.push([s.x - 1, s.y + 1]);
        }
    }
    if (isInsideTheGrid(s.x, s.y + 1)) {
        if (!isSurfaceAnObstacle(s.x, s.y + 1)) {
            squareList.push([s.x, s.y + 1]);
        }
    }
    if (isInsideTheGrid(s.x + 1, s.y + 1)) {
        if (!isSurfaceAnObstacle(s.x + 1, s.y + 1)) {
            squareList.push([s.x + 1, s.y + 1]);
        }
    }
    getAllInfo(squareList);
    return (squareList);
}

function updateSquareList(squareList, listToMerge, visitedSquareList) {
    // //console.log("+++++++++++++++");
    // //console.log(squareList);
    // //console.log(listToMerge);
    for (let index = 0; index < listToMerge.length; index++) {
        for (let k = 0; k < visitedSquareList.length; k++) {
            if (listToMerge[index][0] == visitedSquareList[k][0] && listToMerge[index][1] == visitedSquareList[k][1]) {
                console.log("foundddd in visited");
                //console.log(listToMerge);
                //console.log(visitedSquareList);

                foundInVisited = 1;
                break;
            }
        }
        if (foundInVisited == 0) {
            for (let j = 0; j < squareList.length; j++) {
                if (listToMerge[index][0] == squareList[j][0] && listToMerge[index][1] == squareList[j][1]) {
                    // //console.log("//////////");
                    break;
                    // squareList.push(listToMerge[index]);
                }
                if (j == (squareList.length - 1)) {
                    // //console.log("------------------");
                    squareList.push(listToMerge[index]);
                }
            }
        }
        foundInVisited = 0;
    }
    // //console.log("++++++***+++++++++");
    // //console.log(squareList);
    return squareList;
}

function getAllInfo(squareList) {
    for (var i = 0; i < squareList.length; i++) {
        squareList[i].push(getDistanceToStart(squareList[i]));
        squareList[i].push(getDistanceToEnd(squareList[i]));
        squareList[i].push(getDistanceTotal(squareList[i]));
    }
}

function isSurfaceAnObstacle(x, y) {
    for (var i = 0; i < surfaces.length; i++) {
        if (surfaces[i][2] === "obstacle") {
            if (surfaces[i][0] === x && surfaces[i][1] === y) {
                return true;
            }
        }
    }
    return false;
}

function isInsideTheGrid(x, y) {
    if ((x >= 0 && x <= 19) && (y >= 0 && y <= 9)) {
        return true;
    }
    return false;
}

function getMinIndex(arrayToCheck) {
    var minValue = arrayToCheck[0][3];
    var minValueIndex = 0;
    if (arrayToCheck.length > 1) {
        for (var i = 1; i < arrayToCheck.length; i++) {
            if (arrayToCheck[i][3] < minValue) {
                minValue = arrayToCheck[i][3];
                minValueIndex = i;
            }
        }
    }
    return minValueIndex;
}

function getMin(arrayToCheck) {
    var minValue = arrayToCheck[0];
    for (var i = 1; i < arrayToCheck.length; i++) {
        if (arrayToCheck[i] < minValue) {
            minValue = arrayToCheck[i];
        }
    }
    return minValue;
}


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getDistanceX() {
    var d = 0;
    var sl = squares.lastSquare;
    var sc = squares.currentSquare;
    if (sl.x === sc.x && sl.y === sc.y) {
        d = 0;
    } else if (sl.x !== sc.x && sl.y === sc.y) {
        d = Math.abs(sl.x - sc.x) * 10;
    } else if (sl.x === sc.x && sl.y !== sc.y) {
        d = Math.abs(sl.y - sc.y) * 10;
    } else if (sl.x !== sc.x && sl.y !== sc.y) {
        xOffset = Math.abs(sl.x - sc.x);
        yOffset = Math.abs(sl.y - sc.y);
        min = Math.min(xOffset, yOffset);
        diff = Math.abs(xOffset - yOffset);
        d = min * 14 + diff * 10;
    }
    document.getElementById("dist").innerHTML = d;
}

function getDistanceToStart(intermediarySquare) {
    var d = 0;
    var sl = squares.lastSquare;
    var sc = {
        x: intermediarySquare[0],
        y: intermediarySquare[1]
    };
    if (sl.x === sc.x && sl.y === sc.y) {
        d = 0;
    } else if (sl.x !== sc.x && sl.y === sc.y) {
        d = Math.abs(sl.x - sc.x) * 10;
    } else if (sl.x === sc.x && sl.y !== sc.y) {
        d = Math.abs(sl.y - sc.y) * 10;
    } else if (sl.x !== sc.x && sl.y !== sc.y) {
        xOffset = Math.abs(sl.x - sc.x);
        yOffset = Math.abs(sl.y - sc.y);
        min = Math.min(xOffset, yOffset);
        diff = Math.abs(xOffset - yOffset);
        d = min * 14 + diff * 10;
    }
    return (d);
}

function getDistanceToEnd(intermediarySquare) {
    var d = 0;
    var sl = squares.currentSquare;
    var sc = {
        x: intermediarySquare[0],
        y: intermediarySquare[1]
    };
    if (sl.x === sc.x && sl.y === sc.y) {
        d = 0;
    } else if (sl.x !== sc.x && sl.y === sc.y) {
        d = Math.abs(sl.x - sc.x) * 10;
    } else if (sl.x === sc.x && sl.y !== sc.y) {
        d = Math.abs(sl.y - sc.y) * 10;
    } else if (sl.x !== sc.x && sl.y !== sc.y) {
        xOffset = Math.abs(sl.x - sc.x);
        yOffset = Math.abs(sl.y - sc.y);
        min = Math.min(xOffset, yOffset);
        diff = Math.abs(xOffset - yOffset);
        d = min * 14 + diff * 10;
    }
    return (d);
}

function getDistanceTotal(intermediarySquare) {
    return (getDistanceToStart(intermediarySquare) +
        getDistanceToEnd(intermediarySquare));
}

function changeSurface(surfaceType) {
    this.surfaceType = surfaceType;
}

function colorOfSurface() {
    if (this.surfaceType == "normal") {
        return "black";
    } else if (this.surfaceType == "intermediary") {
        return "red";
    } else if (this.surfaceType == "water") {
        return "blue";
    } else if (this.surfaceType == "obstacle") {
        return "grey";
    }
}

function colorOfSurfaces(s) {
    if (s == "normal") {
        return "black";
    } else if (s == "intermediary") {
        return "red";
    } else if (s == "water") {
        return "blue";
    } else if (s == "obstacle") {
        return "grey";
    }
}

