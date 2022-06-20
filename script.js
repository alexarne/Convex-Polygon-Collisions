
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
    canv.addEventListener('click', mouseClick, false);

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
    h = window.innerHeight;
    w = window.innerWidth;
    spawnX = w/2;
    spawnY = h*0.9-240 + spawnHeight/2;

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

    // // Clear the canvas
    // ctx.fillStyle = "#181818";
    // ctx.fillRect(0, 0, w, h);
    drawSpawn();
    
    // Update selected polygon depending on user action
    if (loaded) {
        if (right) polys[selected].turnRight();
        if (left) polys[selected].turnLeft();
        if (forward) polys[selected].moveForwards();
        if (backward) polys[selected].moveBackwards();
    }

    // Draw all polygons, with selected polygon on top
    polys.forEach((element, index) => {
        if (index != selected) element.draw(false);
    });
    polys[selected].draw(true);
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
 * @param {Object} evt The type of event containing keyCode.
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
        case "L":
            selected++;
            selected %= polys.length;
            break;
    }
}

/**
 * Check what key stopped being pressed down and update current state.
 * @param {Object} evt The type of event containing keyCode.
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
 * @param {Object} evt The event containing click location.
 */
function mouseClick(evt) {
    let posX = evt.pageX;
    let posY = evt.pageY;
    
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