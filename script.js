
/* ======================= MAIN ALGORITHMS ======================= */

// Use margin to account for rounding errors (extra pixels)
var margin = 0.5;

/**
 * Check if two polygons collide with each other by using the Separated
 * Axis Theorem. For each edge of either polygon, project all points onto
 * the normal of that edge and see if the points overlap.
 * Credit: https://youtu.be/7Ik2vowGcU0
 * @param {Polygon} p1 The polygon to check from.
 * @param {Polygon} p2 The polygon to displace if there is a collision.
 * @returns {Boolean} True if the two polygons previously collided.
 */
function collision_SAT(p1, p2) {
    let poly1 = p2.getPoints();
    let poly2 = p1.getPoints();
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
            let d = Math.sqrt(axisProj[0]*axisProj[0]+axisProj[1]*axisProj[1]);
            axisProj[0] /= d;
            axisProj[1] /= d;

            // Project all points of the first polygon to the projection axis, save min and max (boundaries)
            let minmax1 = boundaries(poly1, axisProj);
            let min1 = minmax1[0];
            let max1 = minmax1[1];
            let minmax2 = boundaries(poly2, axisProj);
            let min2 = minmax2[0];
            let max2 = minmax2[1];

            // If overlap, continue, otherwise, they are separated
            if (max2 < min1 || max1 < min2) return false;
            
            let currentOverlap = Math.min(max1, max2) - Math.max(min1, min2);
            overlap = isNaN(overlap) ? currentOverlap : overlap = Math.min(currentOverlap, overlap);
        }
    }
    let d = [p1.x-p2.x, p1.y-p2.y];
    let s = Math.sqrt(d[0]*d[0]+d[1]*d[1]);
    if (p2.pushable) {
        p2.x -= (overlap + margin) * d[0] / s;
        p2.y -= (overlap + margin) * d[1] / s;
    } else {
        p1.x += (overlap + margin) * d[0] / s;
        p1.y += (overlap + margin) * d[1] / s;
    }
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
 * Check for collision between two polygons by seeing if the line from its
 * center to one if its vertices intersects with an edge of the other polygon.
 * Credit: https://youtu.be/7Ik2vowGcU0
 * @param {Polygon} p1 The polygon to check from.
 * @param {Polygon} p2 The polygon to displace if there is a collision.
 * @returns {Boolean} True if the two polygons previously collided.
 */
function collision_DIAG(p1, p2) {
    let collided = false;
    let points1 = p1.getPoints();
    let points2 = p2.getPoints();
    let poly1 = p1;
    
    // Edge case if the points are exactly identical (two identical polygons spawned in a row)
    if (samePoints(points1, points2)) return true;
    
    // Test all diagonals of p1, then all diagonals of p2
    for (let shape = 0; shape < 2; shape++) {
        if (shape == 1) {
            poly1 = p2;
            points1 = p2.getPoints();
            points2 = p1.getPoints();
        }
        
        let displacement = [0, 0];
        let intersections = 0;
        // Check diagonals of polygon...
        for (let p = 0; p < points1.length; p++) {
            let line_r1s = [spawnX + poly1.x, spawnY + poly1.y];
            let line_r1e = points1[p];
            // ...against edges of the other
            for (let q = 0; q < points2.length; q++) {
                let line_r2s = points2[q];
                let line_r2e = points2[(q+1) % points2.length];
                // Line segment intersection
                let h = (line_r2e[0]-line_r2s[0])*(line_r1s[1]-line_r1e[1]) - (line_r1s[0]-line_r1e[0])*(line_r2e[1]-line_r2s[1]);
                let t1 = ((line_r2s[1]-line_r2e[1])*(line_r1s[0]-line_r2s[0]) + (line_r2e[0]-line_r2s[0])*(line_r1s[1]-line_r2s[1])) / h;
                let t2 = ((line_r1s[1]-line_r1e[1])*(line_r1s[0]-line_r2s[0]) + (line_r1e[0]-line_r1s[0])*(line_r1s[1]-line_r2s[1])) / h;
                if (t1 >= 0 && t1 < 1 && t2 >= 0 && t2 < 1) { // Line segments crossing
                    displacement[0] += (1-t1) * (line_r1e[0]-line_r1s[0]);
                    displacement[1] += (1-t1) * (line_r1e[1]-line_r1s[1]);
                    intersections++;
                    collided = true;
                }
            }
        }
        // Update polygon last
        if (intersections != 0) {
            let d = Math.sqrt(displacement[0]*displacement[0]+displacement[1]*displacement[1]);
            let unitVec = [displacement[0]/d, displacement[1]/d];
            displacement[0] /= intersections;
            displacement[1] /= intersections;
            if (p2.pushable) {
                p2.x += (displacement[0]+unitVec[0]*margin) * (shape == 0 ? +1 : -1);
                p2.y += (displacement[1]+unitVec[1]*margin) * (shape == 0 ? +1 : -1);
            } else {
                p1.x += (displacement[0]+unitVec[0]*margin) * (shape == 0 ? -1 : +1);
                p1.y += (displacement[1]+unitVec[1]*margin) * (shape == 0 ? -1 : +1);
            }
        }
    }
    return collided;
}

/**
 * Compare if two arrays contain the same points (unordered).
 * @param {Array} points1 The first set of points.
 * @param {Array} points2 The second set of points.
 * @returns {Boolean} True if all points in points1 exist in points2, 
 * and vice versa, false otherwise.
 */
function samePoints(points1, points2) {
    if (points1.length != points2.length) return false;
    if (points1.length == 0) return true;

    // Sort to check points in increasing y-direction, use shallow copy
    let sorted1 = [...points1].sort((a, b) => {return a[1] - b[1]});
    let sorted2 = [...points2].sort((a, b) => {return a[1] - b[1]});
    // Sort to check points in increasing x-direction
    sorted1 = sorted1.sort((a, b) => {return a[0] - b[0]});
    sorted2 = sorted2.sort((a, b) => {return a[0] - b[0]});

    let tolerance = 1e0;
    for (let i = 0; i < sorted1.length; i++) {
        for (let j = 0; j < 2; j++) {
            if (Math.abs(sorted1[i][j] - sorted2[i][j]) > tolerance) return false;
        }
    }
    return true;
}

/* ======================= ALGORITHM SELECTOR ======================= */

/**
 * Resolves the collision serially, check for new collisions if another is displaced.
 * @param {Number} poly Index of the polygon to check from.
 */
function resolve_collisions(poly) {
    if (checks++ > polys.length*10) {
        console.log("STACK OVERFLOW; ACTION REVERTED");
        polys = copyPolys(prevPolys);     // Revert
        return;
    }
    for (let i = 0; i < polys.length; i++) {
        if (i == poly) continue;
        if (collision(poly, i)) { 
            // We know that if the other is not pushable, the first must've been moved
            resolve_collisions(polys[i].pushable ? i : poly);
        }
    }
}

var algo;
/**
 * Updates the algorithm which ought to be used for collisions.
 * @param {Number} id Index for the new algorithm.
 */
function updateAlgo(id) {
    algo = id;
    let text = "Algorithm:<br>";
    switch (algo) {
        case 0:
            text += "Separating Axis Theorem";
            break;
        case 1: 
            text += "Diagonals";
            break;
    }
    document.getElementById("algoText-algo").innerHTML = text;
}

/**
 * Use the selected algorithm to resolve a collision.
 * @param {Number} poly Index of the first polygon.
 * @param {Number} i Index of the second polygon.
 * @returns {Boolean} True if the polygons previously collided.
 */
function collision(poly, i) {
    let p1 = polys[poly];
    let p2 = polys[i];

    // Use bounding circles to determine if they are too far apart
    if (Math.sqrt((p1.x-p2.x)*(p1.x-p2.x)+(p1.y-p2.y)*(p1.y-p2.y)) > p1.r+p2.r) return false;

    switch (algo) {
        case 0:
            return collision_SAT(p1, p2);
        case 1:
            return collision_DIAG(p1, p2);
    }
}

/* ======================= SUPPORTING CODE ======================= */

// Modals; Tutorial and Settings
const openModalButtons = document.querySelectorAll("[data-modal-target]");
const closeModalButtons = document.querySelectorAll("[data-close-button]");
const overlay = document.getElementById("modal-overlay")
openModalButtons.forEach(button => {
    button.addEventListener("click", () => {
        const modal = document.querySelector(button.dataset.modalTarget)
        openModal(modal)
    })
})
overlay.addEventListener("click", () => {
    const modals = document.querySelectorAll(".modal.active")
    modals.forEach(modal => {
        closeModal(modal)
    })
})
closeModalButtons.forEach(button => {
    button.addEventListener("click", () => {
        const modal = button.closest(".modal")
        closeModal(modal)
    })
})
function openModal(modal) {
    if (modal == null) return
    modal.classList.add("active")
    overlay.classList.add("active")
}
function closeModal(modal) {
    if (modal == null) return
    localStorage.setItem("firstVisit", "false")
    modal.classList.remove("active")
    overlay.classList.remove("active")
}

/**
 * Display the value of a slider on the label.
 * @param {String} sliderID ID of the slider.
 * @param {String} labelID ID of the label.
 */
function displayValue(sliderID, labelID) {
    const slider = document.getElementById(sliderID)
    const label = document.getElementById(labelID)
    label.innerHTML = slider.value
    slider.oninput = function() {
        label.innerHTML = this.value;
    }
}

/**
 * Updates the settings values to match those stored in localStorage or default.
 * Values concerned are; Algorithm, Movement Speed, and Rotation Speed.
 */
function initSettings() {
    let moveSpeed = parseInt(localStorage.getItem("moveSpeed"))
    let rotSpeed = parseInt(localStorage.getItem("rotSpeed"))
    let algorithm = parseInt(localStorage.getItem("algorithm"))
    if (isNaN(moveSpeed)) moveSpeed = 200      // Pixels per second
    if (isNaN(rotSpeed)) rotSpeed = 260        // Degrees per second
    if (isNaN(algorithm)) algorithm = 0
    moveSpeedDefault = moveSpeed
    rotationSpeedDefault = rotSpeed
    updateAlgo(algorithm)
}

/**
 * Update the algorithm and movement values with respect to user's input.
 * Also updates the values in localStorage.
 */
function saveSettings() {
    const modal = document.getElementById("modal-settings")
    let algorithm = 0;
    if (document.getElementById("select-sat").checked) algorithm = 0
    if (document.getElementById("select-diag").checked) algorithm = 1
    updateAlgo(algorithm)
    moveSpeedDefault = document.getElementById("select-moveSpeed").value
    rotationSpeedDefault = document.getElementById("select-rotSpeed").value
    closeModal(modal)
    localStorage.setItem("moveSpeed", moveSpeedDefault)
    localStorage.setItem("rotSpeed", rotationSpeedDefault)
    localStorage.setItem("algorithm", algorithm)
}

/**
 * Reset the settings displayed in the modal so they represent current state 
 * (instead of previous, unsaved inputs), fired when opening settings.
 */
function resetSettings() {
    switch (algo) {
        case 0:
            document.getElementById("select-sat").checked = true;
            break;
        case 1:
            document.getElementById("select-diag").checked = true;
            break;
    }
    document.getElementById("select-moveSpeed").value = moveSpeedDefault
    document.getElementById("select-rotSpeed").value = rotationSpeedDefault
    displayValue("select-moveSpeed", "moveSpeedValue")
    displayValue("select-rotSpeed", "rotSpeedValue")
}

function defaultSettings() {
    document.getElementById("select-sat").checked = true;
    document.getElementById("select-moveSpeed").value = 200
    document.getElementById("select-rotSpeed").value = 260
    displayValue("select-moveSpeed", "moveSpeedValue")
    displayValue("select-rotSpeed", "rotSpeedValue")
}

var page = 1;
var previousPage = 1;
var numPages = document.getElementById("modal-body-tutorial").children.length;
/**
 * Increment the tutorial page and update accordingly.
 */
function nextPage() {
    previousPage = page
    if (page < numPages) {
        page++
        displayPage()
    } else {
        let tutorialModal = document.getElementById("nextButton").closest(".modal")
        if (tutorialModal.classList.contains("active")) 
            closeModal(document.getElementById("nextButton").closest(".modal"))
    }
}

/**
 * Decrement the tutorial page and update accordingly.
 */
function prevPage() {
    if (page > 1) {
        previousPage = page;
        page--
    }
    displayPage();
}

/**
 * Update the tutorial page to display the current page.
 */
function displayPage() {
    document.getElementById("tutorial-page"+previousPage).style.display = "none"
    document.getElementById("tutorial-page"+page).style.display = "contents"
    if (page == 1) {
        document.getElementById("prevButton").classList.add("buttonDisabled")
    } else {
        document.getElementById("prevButton").classList.remove("buttonDisabled")
        if (page == numPages) {
            document.getElementById("nextButton").classList.add("buttonHighlighted")
        } else {
            document.getElementById("nextButton").classList.remove("buttonHighlighted")
        }
    }
}

/**
 * Reset the tutorial page back to page 1.
 */
function resetPage() {
    previousPage = page;
    page = 1;
    document.getElementById("prevButton").classList.add("buttonDisabled")
    document.getElementById("nextButton").classList.remove("buttonHighlighted")
    displayPage();
}



if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame;
}

window.onload = function() {
    canv = document.getElementById("gc");
    ctx = canv.getContext("2d");
    
    document.addEventListener("keydown", keyDown);
    document.addEventListener("keyup", keyUp);

    document.getElementById("sides-next").addEventListener("click", incrSides);
    document.getElementById("sides-prev").addEventListener("click", decrSides);
    document.getElementById("changeInput").addEventListener("click", toggleInput);

    // Clickable controls
    document.getElementById("inputSection-page2-btnUp").onpointerdown = () => {forward_alt = true;};
    document.getElementById("inputSection-page2-btnUp").onpointerup = () => {forward_alt = false;};
    document.getElementById("inputSection-page2-btnUp").onpointerout = () => {forward_alt = false;};
    document.getElementById("inputSection-page2-btnDown").onpointerdown = () => {backward_alt = true;};
    document.getElementById("inputSection-page2-btnDown").onpointerup = () => {backward_alt = false;};
    document.getElementById("inputSection-page2-btnDown").onpointerout = () => {backward_alt = false;};
    document.getElementById("inputSection-page2-btnLeft").onpointerdown = () => {left_alt = true;};
    document.getElementById("inputSection-page2-btnLeft").onpointerup = () => {left_alt = false;};
    document.getElementById("inputSection-page2-btnLeft").onpointerout = () => {left_alt = false;};
    document.getElementById("inputSection-page2-btnRight").onpointerdown = () => {right_alt = true;};
    document.getElementById("inputSection-page2-btnRight").onpointerup = () => {right_alt = false;};
    document.getElementById("inputSection-page2-btnRight").onpointerout = () => {right_alt = false;};
    
    canv.addEventListener("click", mouseClick);

    // Set global variables
    initSettings();
    loaded = false;

    rotation = 0;
    right = false;
    left = false;
    forward = false;
    backward = false;
    right_alt = false;
    left_alt = false;
    forward_alt = false;
    backward_alt = false;
    polys = [];
    spawnHeight = 130

    updateSize();

    polys[0] = new Polygon(5, true);
    selected = 0;

    draw();

    // Show tutorial on first visit, disable transitions on all elements
    if (localStorage.getItem("firstVisit") != "false") {
        // // More logical, only touch conerned elements, doesnt always work (?)
        // document.getElementById("modal-tutorial").classList.add("notransition")
        // overlay.classList.add("notransition")
        // openModal(document.getElementById("modal-tutorial"))
        // document.getElementById("modal-tutorial").offsetHeight
        // overlay.offsetHeight
        // document.getElementById("modal-tutorial").classList.remove("notransition")
        // overlay.classList.remove("notransition")

        // Less logical, touch all elements, works more often for some reason (?)
        let elements = document.querySelectorAll("*")
        elements.forEach((e) => {e.classList.add("notransition")})
        openModal(document.getElementById("modal-tutorial"))
        elements.forEach((e) => {e.offsetHeight; e.classList.remove("notransition");})
    }
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
var elapsedTime;

var polys;
var selected;
var spawnHeight;

var spawnX;
var spawnY;
var loaded;

var checks;

// Clickable controls
var forward_alt;
var backward_alt;
var right_alt;
var left_alt;

var hasMoved;
var prevPolys;

/**
 * Draw a frame of the current state on the canvas and update state. 
 * @param {Number} now Time since starting the window (ms).
 */
function draw(now) {
    window.requestAnimationFrame(draw);
    updateSize();
    drawSpawn();
    
    updateMovementValues(now);
    hasMoved = false
    prevPolys = copyPolys(polys);
    if (loaded) updatePolygon();

    if (hasMoved) {
        // Treat selected polygon as pushable
        checks = 0;
        let pBefore = polys[selected].pushable;
        polys[selected].pushable = true;
        resolve_collisions(selected);
        polys[selected].pushable = pBefore;
    }

    // Draw all polygons, with selected polygon on top
    polys.forEach((element, index) => {
        if (index != selected) element.draw(false);
    });
    polys[selected].draw(true);
}

/**
 * Create a copy of an array of polygons.
 * @param {Array} ref Array of polygons to copy.
 * @returns A true copy of the polygon array.
 */
function copyPolys(ref) {
    let res = []
    for (let i = 0; i < ref.length; i++) {
        res[i] = ref[i].copy();
    }
    return res
}

var prevTime
/**
 * Update the moveSpeed and rotationSpeed variables depending on
 * time elapsed since last frame in order to base movement off of
 * time and not frames. Incorrect at times but doesn't seem to
 * impact the user experience too much.
 * @param {Number} now Time since starting the window (ms).
 */
function updateMovementValues(now) {
    elapsedTime = (now - prevTime)/1000;
    prevTime = now;
    //console.log("fps: " + 1/elapsedTime);
    rotationSpeed = rotationSpeedDefault*(Math.PI/180)*elapsedTime; // Convert to radians
    moveSpeed = moveSpeedDefault*elapsedTime;
    if (!isNaN(elapsedTime)) loaded = true;    // Flush first 2 cycles, is undefined
}

/**
 * Update the canvas' dimensions to reflect window size, set
 * origin (spawn), and resize input section.
 */
function updateSize() {
    h = window.innerHeight;
    w = window.innerWidth;
    ctx.canvas.width = w;
    ctx.canvas.height = h;
    spawnX = w/2;
    spawnY = h*0.8-240 + spawnHeight/2;
    document.getElementById("inputSection").style.transform = "translate(-50%, 0) scale(" + Math.min(1, w/280) + ")";
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
    let r = right | right_alt;
    let l = left | left_alt;
    let f = forward | forward_alt;
    let b = backward | backward_alt;
    if (!(r && l)) {
        if (r) polys[selected].turnRight();
        if (l) polys[selected].turnLeft();
    }
    if (!(f && b)) {
        if (f) polys[selected].moveForwards();
        if (b) polys[selected].moveBackwards();
    }
}

// Maximum and minimum number of sides
var max = 10;
var min = 3;

/**
 * Increment the user input value for the amount of sides of the new polygon.
 */
function incrSides() {
    let value = parseInt(document.getElementById("sides-value").innerHTML);
    if (value < max) {
        document.getElementById("sides-value").innerHTML = value + 1;
    } else {
        document.getElementById("sides-value").innerHTML = min;
    }
}

/**
 * Decrement the user input value for the amount of sides of the new polygon.
 */
function decrSides() {
    let value = parseInt(document.getElementById("sides-value").innerHTML)
    if (value > min) {
        document.getElementById("sides-value").innerHTML = value - 1;
    } else {
        document.getElementById("sides-value").innerHTML = max;
    }
}

/**
 * Attempt to add a polygon with the user's inputs. Correct/highlight
 * any problems which may prevent the polygon from being created
 * (input is not allowed or existing polygons blocking it).
 */
function addPolygon() {
    let sides = parseInt(document.getElementById("sides-value").innerHTML);
    if (sides > max) {
        document.getElementById("sides-value").innerHTML = max;
        sides = max;
    }
    if (sides < min) {
        document.getElementById("sides-value").innerHTML = min;
        sides = min;
    }
    let newPlace = polys.length;
    polys[newPlace] = new Polygon(sides, true);

    // Check if new polygon collides with other polygons and if so, highlight them and delete the created polygon
    let collided = false;
    for (let i = 0; i < newPlace; i++) {
        if (collision(i, newPlace)) {   // Push only the new polygon so the rest remain unchanged
            polys[i].blink();
            collided = true;
            polys[newPlace] = new Polygon(sides, true);     // Tacky solution; respawn since it could've been moved
        }
    }
    if (!collided) {
        let pushable = document.getElementById("pushable").checked;
        polys[newPlace] = new Polygon(sides, pushable);
        selected = newPlace;
    } else {
        polys.pop();
    }
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
        case "P":
            polys[selected].pushable = !polys[selected].pushable;
            break;
        case String.fromCharCode(13):   // ENTER
            evt.preventDefault();       // Block previous button from being pressed
            if (document.getElementById("modal-settings").classList.contains("active")) saveSettings();
            break;
        case String.fromCharCode(27):   // ESC
            document.querySelectorAll(".modal.active").forEach((e) => {closeModal(e)})
            break;
        case String.fromCharCode(37):   // Left arrow
            prevPage();
            break;
        case String.fromCharCode(39):   // Right arrow
            nextPage();
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
 * Change the page displayed in the input section (between creating polygons
 * and movement controls).
 */
function toggleInput() {
    let page1_visible = !document.getElementById("inputSection-page1").classList.contains("hidden");
    let visible = "inputSection-page" + (page1_visible ? "2" : "1");
    let hidden = "inputSection-page" + (page1_visible ? "1" : "2");
    document.getElementById(visible).classList.remove("hidden");
    document.getElementById(hidden).classList.add("hidden");
}

/**
 * Class representing a polygon.
 */
class Polygon {
    x;
    y;
    r;
    rot;
    sides;
    pushable;

    blinkOn;
    blinkOff;
    blinks;
    cycle
    blinkTimer;

    constructor(sides, pushable) {
        this.x = 0;
        this.y = 0;
        this.r = 50;
        this.rot = 0;
        this.sides = sides;
        this.pushable = pushable;
        
        // Durations in seconds
        this.blinkOn = 0.5;
        this.blinkOff = 0.3;
        this.blinks = 3;
        this.cycle = this.blinkOn+this.blinkOff;
        this.blinkTimer = 0;
        
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
        let color = this.pushable ? "#A0A0A0" : "#505050";
        if (this.blinkTimer > 0) {
            this.blinkTimer -= elapsedTime;
            if (this.blinkTimer % this.cycle <= this.blinkOn) {
                color = "#8d3939";
            }
        }
        ctx.fillStyle = selected ? LightenColor(color, 10) : color;
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
     * Initialize the blinkTimer to make the polygon blink.
     */
    blink() {
        // blinkTimer will become NaN if elapsedTime is NaN, and the blinking will be ignored
        this.blinkTimer = this.blinks*this.cycle - this.blinkOff;
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
        hasMoved = true;
    }

    /**
     * Turn the polygon to the left.
     */
    turnLeft() {
        this.rot -= rotationSpeed;
        hasMoved = true;
    }

    /**
     * Move the polygon forwards.
     */
    moveForwards() {
        this.x += moveSpeed*Math.cos(Math.PI/2-this.rot);
        this.y -= moveSpeed*Math.sin(Math.PI/2-this.rot);
        hasMoved = true;
    }

    /**
     * Move the polygon backwards.
     */
    moveBackwards() {
        this.x -= moveSpeed*Math.cos(Math.PI/2-this.rot);
        this.y += moveSpeed*Math.sin(Math.PI/2-this.rot);
        hasMoved = true;
    }

    /**
     * Create a copy of the polygon.
     * @returns A new polygon with the same values.
     */
    copy() {
        let res = new Polygon(this.sides, this.pushable)
        res.x = this.x;
        res.y = this.y;
        res.r = this.r;
        res.rot = this.rot;
        res.blinkOn = this.blinkOn;
        res.blinkOff = this.blinkOff;
        res.blinks = this.blinks;
        res.cycle = this.cycle;
        res.blinkTimer = this.blinkTimer;
        return res
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