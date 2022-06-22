
/* ======================= MAIN ALGORITHMS ======================= */

/**
 * Check if two polygons collide with each other by using the Separated
 * Axis Theorem. For each edge of either polygon, project all points onto
 * the normal of that edge and see if the points overlap.
 * Credit: https://youtu.be/7Ik2vowGcU0
 * @param {Array} p1 Array of coordinates for all points of the first polygon.
 * @param {Array} p2 Array of coordinates for all points of the second polygon.
 * @returns {Boolean} True if they collide, false if they don't.
 */
function collision_SAT(p1, p2) {
    let poly1 = p1.getPoints();
    let poly2 = p2.getPoints();
    let overlap;

    // Test all sides of p1, then all sides of p2
    for (let shape = 0; shape < 2; shape++) {
        if (shape == 1) {
            let tmp = poly1;
            poly1 = poly2;
            poly2 = tmp;
        }
        for (let a = 0; a < poly1.length; a++) {    // For all edges, see if they overlap along that axis
            let b = (a+1) % poly1.length;
            let axisProj = [                        // Normal vector to the edge from point a to point b
                -(poly1[b][1] - poly1[a][1]),       // Negation of y-difference
                poly1[b][0] - poly1[a][0]           // x-difference
            ];

            // Project all points of the first polygon to the projection axis, save min and max (boundaries)
            let minmax1 = boundaries(poly1, axisProj);
            let min1 = minmax1[0];
            let max1 = minmax1[1];
            let minmax2 = boundaries(poly2, axisProj);
            let min2 = minmax2[0];
            let max2 = minmax2[1];

            let currentOverlap = Math.min(max1, max2) - Math.max(min1, min2);
            if (isNaN(overlap)) {
                overlap = currentOverlap;
            } else {
                overlap = Math.min(currentOverlap, overlap);
            }

            // If overlap, continue, otherwise, they are separated
            if (max2 < min1 || max1 < min2) return false;
        }
    }
    console.log(overlap);
    console.log(p1.x + " " + p1.y);
    let d = [p2.x-p1.x, p2.y-p1.y];
    let s = Math.sqrt(d[0]*d[0]+d[1]*d[1]);
    p1.x -= overlap * d[0] / s;
    p1.y -= overlap * d[1] / s;
    console.log((overlap * d[0] / s) + " " + (overlap * d[1] / s));
    console.log(p1.x + " " + p1.y);
    return true;
}

/**
 * Compute the minimum and maximum values of all points of a polygon projected 
 * onto a specific axis.
 * @param {Array} poly Array of coordinates for all the points of a polygon.
 * @param {Array} axis The projection axis, vector in R2.
 * @returns {Array} The minimum value as first element and maximum value as second element.
 */
function boundaries(poly, axis) {
    let q = dot2D(poly[0], axis);
    let min = q;
    let max = q;
    for (let p = 1; p < poly.length; p++) {
        let q = dot2D(poly[p], axis);
        min = Math.min(min, q);
        max = Math.max(max, q);
    }
    return [min, max];
}

/**
 * Calculate the dot product between two vectors in R2.
 * @param {Array} v1 First vector (in R2, x- and y-values).
 * @param {Array} v2 Second vector (in R2, x- and y-values).
 * @returns {Number} The dot product of the vectors if both are in R2.
 */
function dot2D(v1, v2) {
    if (v1.length == 2 && v2.length == 2) return v1[0]*v2[0] + v1[1]*v2[1];
}

/**
 * 
 * @param {Polygon} p1 The currently selected polygon.
 * @param {Polygon} p2 The polygon to check and resolve collisions with.
 */
function resolve_collision(p1, p2) {
    let flag = false;
    let points1 = p1.getPoints();
    let points2 = p2.getPoints();
    let poly1 = p1;

    // Test all sides of p1, then all sides of p2
    for (let shape = 0; shape < 2; shape++) {
        if (shape == 1) {
            poly1 = p2;
            let tmp = points1;
            points1 = points2;
            points2 = tmp;
        }
        
        // Check diagonals of polygon...
        for (let p = 0; p < points1.length; p++) {
            let line_r1s = [spawnX + poly1.x, spawnY + poly1.y];
            let line_r1e = points1[p];
            let displacement = [0, 0];
            // ...against edges of the other
            for (let q = 0; q < points2.length; q++) {
                let line_r2e = points2[q];
                let line_r2s = points2[(q+1) % points2.length];
                // Line segment intersection
                let h = (line_r2e[0]-line_r2s[0])*(line_r1s[1]-line_r1e[1]) - (line_r1s[0]-line_r1e[0])*(line_r2e[1]-line_r2s[1]);
                let t1 = ((line_r2s[1]-line_r2e[1])*(line_r1s[0]-line_r2s[0]) + (line_r2e[0]-line_r2s[0])*(line_r1s[1]-line_r2s[1])) / h;
                let t2 = ((line_r1s[1]-line_r1e[1])*(line_r1s[0]-line_r2s[0]) + (line_r1e[0]-line_r1s[0])*(line_r1s[1]-line_r2s[1])) / h;
                if (t1 >= 0 && t1 < 1 && t2 >= 0 && t2 < 1) { // Line segments crossing
                    displacement[0] += (1-t1) * (line_r1e[0]-line_r1s[0]);
                    displacement[1] += (1-t1) * (line_r1e[1]-line_r1s[1]);
                    flag = true;
                }
            }
            p1.x += displacement[0] * (shape == 0 ? -1 : +1);
            p1.y += displacement[1] * (shape == 0 ? -1 : +1);
        }
    }
    return flag;
}



function resolve_collisions() {
    for (let i = 0; i < polys.length; i++) {
        for (let j = i+1; j < polys.length; j++) {
            resolve_collision(polys[i], polys[j]);
        }
    }
}



/* ======================= SUPPORTING CODE ======================= */

if (!window.requestAnimationFrame) {
    window.requestAnimationFrame =
        window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame;
}

window.onload = function() {
    canv = document.getElementById("gc");
    ctx = canv.getContext("2d");
    
    document.addEventListener("keydown", keyDown);
    document.addEventListener("keyup", keyUp);
    canv.addEventListener('click', mouseClick);

    // Set global variables
    rotationSpeedDefault = 0.03;
    moveSpeedDefault = 1.3;
    loaded = false;

    rotation = 0;
    right = false;
    left = false;
    forward = false;
    backward = false;
    polys = [];
    spawnHeight = 130

    updateSize();

    polys[0] = new Polygon(5, true, "#A0A0A0");
    selected = 0;

    draw();
}

// Global variables
var w;
var h;
var canv;
var ctx;
var rotation;
var right;
var left;
var forward;
var backward;
var rotationSpeedDefault;
var moveSpeedDefault;
var rotationSpeed;
var moveSpeed;

var polys;
var selected;
var spawnHeight;

var spawnX;
var spawnY;
var loaded;

/**
 * Draw a frame of the current state on the canvas and update state. 
 * @param {Number} now Time since starting the window (ms).
 */
function draw(now) {
    window.requestAnimationFrame(draw);

    updateValues(now);
    updateSize();

    drawSpawn();
    if (loaded) updatePolygon();

    // Draw all polygons, with selected polygon on top
    polys.forEach((element, index) => {
        if (index != selected) element.draw(false);
    });
    polys[selected].draw(true);

    resolve_collisions();
}

var prevTime
/**
 * Update the moveSpeed and rotationSpeed variables depending on
 * time elapsed since last frame in order to base movement off of
 * time and not frames. Incorrect at times but doesn't seem to
 * impact the user experience too much.
 * @param {Number} now Time since starting the window (ms).
 */
function updateValues(now) {
    let frameTime = now - prevTime;
    prevTime = now;
    let fps = 1000/frameTime;
    let ratio = 144/fps;
    rotationSpeed = rotationSpeedDefault*ratio;
    moveSpeed = moveSpeedDefault*ratio;
    if (!isNaN(fps)) loaded = true;    // Flush first 2 cycles, is undefined
}

/**
 * Update the canvas' dimensions to reflect window size and set
 * origin (spawn).
 */
function updateSize() {
    h = window.innerHeight;
    w = window.innerWidth;
    ctx.canvas.width = w;
    ctx.canvas.height = h;
    spawnX = w/2;
    spawnY = h*0.9-240 + spawnHeight/2;
}

/**
 * Draw the spawn area.
 */
function drawSpawn() {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.05;
    let imageWidth = document.getElementById("spawn").width;
    let imageHeight = document.getElementById("spawn").height;
    ctx.drawImage(document.getElementById("spawn"), 
        0, 0, imageWidth, imageHeight, 
        spawnX-(spawnHeight*imageWidth/imageHeight)/2, spawnY-spawnHeight/2, 
        spawnHeight*340/270, spawnHeight);
    ctx.restore();
}

/**
 * Update the selected polygon with respect to user action.
 */
function updatePolygon() {
    if (!(right && left)) {
        if (right) polys[selected].turnRight();
        if (left) polys[selected].turnLeft();
    }
    if (!(forward && backward)) {
        if (forward) polys[selected].moveForwards();
        if (backward) polys[selected].moveBackwards();
    }
}

/**
 * Attempt to add a polygon with the user's inputs. Highlight any 
 * problems which may prevent the polygon from being created
 * (input is not allowed or existing polygons blocking it).
 */
function addPolygon() {
    let sides = document.getElementById("sides").value;
    if (sides > 40 || sides < 3) {
        // Show error on sides input field

        return;
    }
    let pushable = document.getElementById("pushable").checked;
    let color = document.getElementById("color").value;
    let newPlace = polys.length;
    polys[newPlace] = new Polygon(sides, pushable, color);
    // Check if new polygon collides with other polygons and if so, highlight them and delete the created polygon
    selected = newPlace;
}

/**
 * Check what key was pressed down and update current state.
 * @param {KeyboardEvent} evt The type of event containing keyCode.
 */
function keyDown(evt) {
    evt = evt || window.event;
    let charCode = evt.keyCode || evt.which;
    let charStr = String.fromCharCode(charCode);
    
    switch (charStr) {
        case "W":
            forward = true;
            break;
        case "A":
            left = true;
            break;
        case "S":
            backward = true;
            break;
        case "D":
            right = true;
            break;
    }
}

/**
 * Check what key stopped being pressed down and update current state.
 * @param {KeyboardEvent} evt The type of event containing keyCode.
 */
function keyUp(evt) {
    evt = evt || window.event;
    let charCode = evt.keyCode || evt.which;
    let charStr = String.fromCharCode(charCode);

    switch (charStr) {
        case "W":
            forward = false;
            break;
        case "A":
            left = false;
            break;
        case "S":
            backward = false;
            break;
        case "D":
            right = false;
            break;
    }
}

/**
 * Change the selected polygon to the polygon which the user clicked
 * on, if any.
 * @param {PointerEvent} evt The event containing click location.
 */
function mouseClick(evt) {
    let coords = [evt.pageX, evt.pageY];
    for (let i = 0; i < polys.length; i++) {
        if (inside(coords, polys[i].getPoints())) {
            selected = i;
            break;
        }
    }
}

/**
 * Class representing a polygon.
 */
class Polygon {
    x;
    y;
    r;
    rot;
    c;
    sides;
    pushable;

    constructor(sides, pushable, color) {
        this.x = 0;
        this.y = 0;
        this.r = 50;
        this.rot = 0;
        this.c = color;
        this.sides = sides;
        this.pushable = pushable;
        
        // Get polygon height to center properly, inefficient but reusing code
        if (sides % 2 == 1) {
            const arr = this.getPoints();
            let height = arr[Math.round(arr.length/2)][1] - arr[0][1];
            this.y += (this.r-height/2);
        }
    }

    /**
     * Draw the polygon and make it brighter as well as draw a pointer if the
     * polygon is currently selected.
     * @param {Boolean} selected If this polygon is currently selected.
     */
    draw(selected) {
        ctx.fillStyle = selected ? LightenColor(this.c, 10) : this.c;
        ctx.beginPath();
        
        const points = this.getPoints();
        ctx.moveTo(points[0][0], points[0][1]);
        for (let i = 1; i < this.sides; i++) {
            ctx.lineTo(points[i][0], points[i][1]);
        }

        ctx.closePath();
        ctx.fill();

        if (selected) { // Draw pointer
            ctx.arc(spawnX+this.x+(this.r+8)*Math.cos(Math.PI/2-this.rot), spawnY+this.y-(this.r+8)*Math.sin(Math.PI/2-this.rot), 3, 0, 2 * Math.PI);
            ctx.fill();
        }
    }

    /**
     * Get the coordinates for every point of the polygon at its current position.
     * @returns {Array} An array containing all the points (x and y) of the polygon.
     */
    getPoints() {
        const arr = [];
        let offset = this.sides % 2 == 0 ? Math.PI/this.sides : 0;
        arr[0] = [spawnX+this.x+this.r*Math.cos(Math.PI/2-this.rot+offset), spawnY+this.y-this.r*Math.sin(Math.PI/2-this.rot+offset)];

        for (let i = 1; i < this.sides; i++) {
            arr[i] = [spawnX+this.x+this.r*Math.cos(Math.PI/2-this.rot+i*2*Math.PI/this.sides+offset), spawnY+this.y-this.r*Math.sin(Math.PI/2-this.rot+i*2*Math.PI/this.sides+offset)];
        }
        return arr;
    }

    /**
     * Turn the polygon to the right.
     */
    turnRight() {
        this.rot += rotationSpeed;
    }

    /**
     * Turn the polygon to the left.
     */
    turnLeft() {
        this.rot -= rotationSpeed;
    }

    /**
     * Move the polygon forwards.
     */
    moveForwards() {
        this.x += moveSpeed*Math.cos(Math.PI/2-this.rot);
        this.y -= moveSpeed*Math.sin(Math.PI/2-this.rot);
    }

    /**
     * Move the polygon backwards.
     */
    moveBackwards() {
        this.x -= moveSpeed*Math.cos(Math.PI/2-this.rot);
        this.y += moveSpeed*Math.sin(Math.PI/2-this.rot);
    }
}



/* ======================= CONTRIBUTIONS ======================= */

/**
 * Lighten or darken the input color given by the percent value.
 * Credit: https://gist.github.com/renancouto/4675192
 * @param {String} color Hexadecimal representation of the color.
 * @param {Number} percent Percentage to change (positive or negative) the brightness by.
 * @returns {String} New color with the change applied.
 */
function LightenColor(color, percent) {
    let num = parseInt(color.replace("#",""), 16);
    let amt = Math.round(2.55 * percent);
    let R = (num >> 16) + amt;
    let B = (num >> 8 & 0x00FF) + amt;
    let G = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (B<255?B<1?0:B:255)*0x100 + (G<255?G<1?0:G:255)).toString(16).slice(1);
};

/**
 * Check if a point is inside a polygon using ray-casting algorithm.
 * Credit: https://stackoverflow.com/a/29915728
 * @param {Array} point Array containing x- and y-coordinates for the point.
 * @param {Array} vs Array containing all points for the polygon.
 * @returns {Boolean} True if point is inside the polygon, false if not.
 */
function inside(point, vs) {
    var x = point[0], y = point[1];
    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i][0], yi = vs[i][1];
        var xj = vs[j][0], yj = vs[j][1];
        
        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
};