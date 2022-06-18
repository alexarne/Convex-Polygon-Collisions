
window.onload = function() {
    canv = document.getElementById("gc");
    ctx = canv.getContext("2d");
    document.addEventListener("keydown", keyDown);
    document.addEventListener("keyup", keyUp);
    // setInterval(draw, 1000/60);

    rotation = 0;
    right = false;
    left = false;
    forward = false;
    backward = false;
    rotationSpeed = 0.03;
    moveSpeed = 1.3;
    polys = [];
    spawnHeight = 130

    h = window.innerHeight;
    w = window.innerWidth;
    originX = w/2;
    originY = h*0.9-240 + spawnHeight/2;
    polys[0] = new Polygon(5, true, "#A0A0A0", w/2, h/2);
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
var rotationSpeed;
var moveSpeed;

var polys;
var selected;
var spawnHeight;

var originX;
var originY;

function draw() {
    window.requestAnimationFrame(draw);
    // Refresh values
    h = window.innerHeight;
    w = window.innerWidth;
    ctx.canvas.width = w;
    ctx.canvas.height = h;
    originX = w/2;
    originY = h*0.9-240 + spawnHeight/2;

    ctx.fillStyle = "#181818";
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.05;
    ctx.drawImage(document.getElementById("spawn"), 0, 0, 340, 270, w/2-(spawnHeight*340/270)/2, originY - spawnHeight/2, spawnHeight*340/270, spawnHeight);    // image is 340x270
    ctx.restore();

    ctx.fillRect(w/2, h/2-400, 340, 270);
    
    if (right) polys[selected].rot += rotationSpeed;
    if (left) polys[selected].rot -= rotationSpeed;
    if (forward) polys[selected].forward();
    if (backward) polys[selected].backward();
    polys.forEach((element, index) => {
        if (index != selected) element.draw(ctx, false);
    });
    polys[selected].draw(ctx, true);
}

function addPolygon() {
    let sides = document.getElementById("sides").value;
    if (sides > 40 || sides < 3) return;
    let pushable = document.getElementById("pushable").checked;
    let color = document.getElementById("color").value;
    selected = polys.length;
    polys[selected] = new Polygon(sides, pushable, color, w/2, h/2);
}

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

class Polygon {
    x;
    y;
    r;
    rot;
    c;
    sides;
    pushable;

    constructor(sides, pushable, color, x, y) {
        this.x = 0;
        this.y = 0;
        this.r = 50;
        this.rot = 0;
        this.c = color;
        this.sides = sides;
        this.pushable = pushable;

        // Get polygon height to center properly, inefficient but reusing code
        if (sides % 2 == 1) {
            const arr1 = this.getPoints();
            let height = arr1[Math.round(arr1.length/2)][1] - arr1[0][1];
            this.y = - (this.r-height/2);
        }

    }

    draw(ctx, selected) {
        ctx.fillStyle = selected ? LightenColor(this.c, 10) : this.c;
        ctx.beginPath();
        
        const points = this.getPoints();
        ctx.moveTo(points[0][0], points[0][1]);
        for (let i = 1; i < this.sides; i++) {
            ctx.lineTo(points[i][0], points[i][1]);
        }

        ctx.closePath();
        ctx.fill();

        if (selected) {
            ctx.arc(originX+this.x+(this.r+8)*Math.cos(Math.PI/2-this.rot), originY-this.y-(this.r+8)*Math.sin(Math.PI/2-this.rot), 3, 0, 2 * Math.PI);
            ctx.fill();
        }
    }

    getPoints() {
        const arr = [];
        let offset = this.sides % 2 == 0 ? Math.PI/this.sides : 0;
        arr[0] = [originX+this.x+this.r*Math.cos(Math.PI/2-this.rot+offset), originY-this.y-this.r*Math.sin(Math.PI/2-this.rot+offset)];

        for (let i = 1; i < this.sides; i++) {
            arr[i] = [originX+this.x+this.r*Math.cos(Math.PI/2-this.rot+i*2*Math.PI/this.sides+offset), originY-this.y-this.r*Math.sin(Math.PI/2-this.rot+i*2*Math.PI/this.sides+offset)];
        }
        return arr;
    }

    forward() {
        this.x += moveSpeed*Math.cos(Math.PI/2-this.rot);
        this.y += moveSpeed*Math.sin(Math.PI/2-this.rot);
    }

    backward() {
        this.x -= moveSpeed*Math.cos(Math.PI/2-this.rot);
        this.y -= moveSpeed*Math.sin(Math.PI/2-this.rot);
    }
}

// Credit: https://gist.github.com/renancouto/4675192
function LightenColor(color, percent) {
    let num = parseInt(color.replace("#",""), 16);
    let amt = Math.round(2.55 * percent);
    let R = (num >> 16) + amt;
    let B = (num >> 8 & 0x00FF) + amt;
    let G = (num & 0x0000FF) + amt;

    return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (B<255?B<1?0:B:255)*0x100 + (G<255?G<1?0:G:255)).toString(16).slice(1);
};