
window.onload = function() {
    canv = document.getElementById("gc");
    ctx = canv.getContext("2d");
    document.addEventListener("keydown", keyDown);
    document.addEventListener("keyup", keyUp);
    setInterval(draw, 1000/60);
    rotation = 0;
    right = false;
    left = false;
    forward = false;
    backward = false;
    rotationSpeed = 0.05;
    moveSpeed = 2;
    polys = [];
    polys[0] = new Polygon(5);
    polys[1] = new Polygon(4);
    polys[2] = new Polygon(3);
    selected = 0;
}

// Origin at w/2, h/2
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

function draw() {
    h = window.innerHeight;
    w = window.innerWidth;
    ctx.canvas.width = w;
    ctx.canvas.height = h;
    ctx.fillStyle = "#181818";
    ctx.fillRect(0, 0, w, h);
    document.getElementById("debug").innerHTML = "rotation: " + rotation + ", " + "sides: " + document.getElementById("sides").value + document.getElementById("pushable").checked + document.getElementById("color").value;
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

    constructor(sides) {
        this.x = 0;
        this.y = 0;
        this.r = 50;
        this.rot = 0;
        this.c = "#A0A0A0";
        this.sides = sides;
    }

    draw(ctx, selected) {
        ctx.fillStyle = selected ? "#E0E0E0" : this.c;
        ctx.beginPath();
        
        const points = this.getPoints();
        ctx.moveTo(points[0][0], points[0][1]);
        for (let i = 1; i < this.sides; i++) {
            ctx.lineTo(points[i][0], points[i][1]);
        }

        ctx.closePath();
        ctx.fill();

        if (selected) {
            ctx.arc(w/2+this.x+(this.r+8)*Math.cos(Math.PI/2-this.rot), h/2-this.y-(this.r+8)*Math.sin(Math.PI/2-this.rot), 3, 0, 2 * Math.PI);
            ctx.fill();
        }
    }

    getPoints() {
        const arr = [];
        let offset = this.sides % 2 == 0 ? Math.PI/this.sides : 0;
        arr[0] = [w/2+this.x+this.r*Math.cos(Math.PI/2-this.rot+offset), h/2-this.y-this.r*Math.sin(Math.PI/2-this.rot+offset)];

        for (let i = 1; i < this.sides; i++) {
            arr[i] = [w/2+this.x+this.r*Math.cos(Math.PI/2-this.rot+i*2*Math.PI/this.sides+offset), h/2-this.y-this.r*Math.sin(Math.PI/2-this.rot+i*2*Math.PI/this.sides+offset)];
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