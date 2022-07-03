# Convex Polygon Collisions

Simple web-based demonstration of the Separating Axis Theorem and an alternative algorithm named "Diagonals" for checking if two convex polygons have collided as well as a resolution, inspired by [javidx9](https://youtu.be/7Ik2vowGcU0). The resolution for either algorithm may be a bit unnatural in their own way. The algorithms are only concerned with convex polygons, which are polygons where all interior angles are less than or equal to 180&deg;. For simplicity, the polygons in this demonstration are limited to regular polygons with a configurable amount of sides (3-40), although the polygons do not **have** to be regular for the algorithms to work. 

## Demonstration

https://alexarne.github.io/Convex-Polygon-Collisions/

## Instructions

The following information can also be accessed by clicking on the "Help" button in the top-right corner:

* The user can choose which algorithm to use by clicking on the alternatives in the top-left corner:

    * Separating Axis Theorem, Static (SAT/STATIC)

    * Diagonals, Static (DIAG/STATIC)

* The user can control the selected polygon by pressing buttons W, A, S, and D for moving forwards, rotating to its left, moving backwards, and rotating to its right, respectively

* The user can spawn new polygons by specifying the amount of sides, whether it can be pushed by other polygons, and its color

* The user can select another polygon by clicking on it

## TODOs

* Style the input section (bottom center)

* Add functionality to the help-button (top-right) in the form of creating a modal (pop-up) with instructions

* Add functionality to the settings-button (top-right) in the form of creating a modal (pop-up) with configurable settings (movement speed slider, algorithm selector) and a save button

* Finalize README by linking to code section of algorithm

## Algorithm Implementations

[The implementation of Separating Axis Theorem](link)

[The implementation of "Diagonals"](link)

## Intuitive Understanding

* **Separating Axis Theorem**

    > Two convex objects do not overlap if there exists a line (called axis) onto which the two objects' projections do not overlap.

    The algorithm works by projecting all points of the two polygons onto one axis which forms their "shadows" from that perspective. The goal is to look at the polygons from every possible 1-dimensional perspective and observing if they overlap or not. Much like a physical ball can be completely hidden behind another ball from a certain perspective, we can not be certain that the two balls are **not** colliding by only looking at them from one point of view. We do not capture depth and as a result, neither do we capture their distances from the point of reference. Only after looking at it from every possible angle can we deduce whether or not they collide by asking if we found a perspective from which they did not collide. With regards to the polygons, we do not have to check an infinite amount of angles and can instead reduce it to the total amount of edges for both polygons.

* **Diagonals**

    If any edge of one polygon intersects with any line from another polygon's center to one of its vertices, the two polygons overlap. This is because in order to overlap, part of one polygon must exist within the other, which is only possible if a vertex exists within it. Furthermore, the resolution for the algorithm then becomes the distance from the intersection to the point which overlaps the other polygon, which simplifies the process of obtaining a resolution.

## Difficulties Encountered

* **Chain Collisions**

    One polygon may be pushed into another, causing a chain reaction. The solution is then that we have to redo our collision checks if a polygon was moved, which can be simplified to checking only if the moved polygon collides with any polygons. The initial implementation resulted in occasional stack overflows due to checking polygons back and forth infinitely many times. This is believed to have been caused by floating point imprecisions where, although a collision was resolved, it may be found that it still overlaps the other polygon in another iteration. Therefore, we displace the polygon by a little more than what has been calculated. Of course, this is not a scientific solution and stack overflows may still occur, but that has not happened during my own testing.

* **Text**

    Text

## Known Bugs

* If a polygon is pushed by another polygon into two non-pushable polygons, a stack overflow will occur and the polygon will be placed incorrectly. This is caused by the inability for the collision resolution to "collaborate" between two polygons and, as a result, the polygon is only displaced so that it no longer collides with the first polygon, which will happen back and forth.

## Final Words

