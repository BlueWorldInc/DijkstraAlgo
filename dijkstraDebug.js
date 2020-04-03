//used for debugging, the visual studio code debugger is not working with html element inside a code.

var map = createMap(20, 10);
difuse(map, {x: 5, y:5}, 2);

function createMap(w, h) {
    var map = [];
    for (var i = 0; i < w; i++) {
        map.push([]);
        for (var j = 0; j < h; j++) {
            map[i].push([]);
            map[i][j] = ".";
        }
    }
    return map;
}

function difuse(map, origin, depth) {
    map[origin.x][origin.y] = "S";
    var colorVariance = 0;
    var queue = [];
    queue.push(map[0]);
    for (let i = 0; i < depth; i++) {
        var q = queue.shift();
        var color = `rgb(${20 + colorVariance}, ${200 + Math.floor(colorVariance / 4)}, ${245 + Math.floor(colorVariance / 10)})`;
        colorVariance += 20;
        if (origin.x + 1 < 20) {
            if (map[origin.x + 1][origin.y] === ".") {
                map[origin.x + 1][origin.y] = "S";
                console.log((origin.x + 1) * 20);
                colorSurfaces((origin.x + 1) * 20, origin.y * 20, color);
            }
        }
        if (origin.x - 1 >= 0) {
            if (map[origin.x - 1][origin.y] === ".") {
                map[origin.x - 1][origin.y] = "S";
                colorSurfaces(origin.x - 1, origin.y * 20, color);
            }
        }
        if (origin.y + 1 < 10) {
            if (map[origin.x][origin.y + 1] === ".") {
                map[origin.x][origin.y + 1] = "S";
                colorSurfaces(origin.x * 20, (origin.y + 1) * 20, color);
            }
        }
        if (origin.y - 1 >= 0) {
            if (map[origin.x][origin.y - 1] === ".") {
                map[origin.x][origin.y - 1] = "S";
                colorSurfaces(origin.x * 20, (origin.y - 1) * 20, color);
            }
        }
    }
}

function colorSurfaces(x, y, c) {
    surfaces.push({ X: parseInt(x), Y: parseInt(y), color: c });
}