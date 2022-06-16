window.onload=function() {
    canv = document.getElementById("gc");
    setInterval(draw, 1000/60);
    document.addEventListener("keydown", keyPush);
}

flag = true;

function draw() {
    ctx = canv.getContext("2d");
    h = window.innerHeight;
    w = window.innerWidth;
    ctx.canvas.width  = w;
    ctx.canvas.height = h;
    ctx.fillStyle = "#000d14";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = flag ? "red" : "lime";
    ctx.fillRect(10, 10, w-20, h-20);
}

function keyPush(evt) {
    flag = !flag;
}