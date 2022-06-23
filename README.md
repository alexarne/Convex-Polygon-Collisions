# Convex Polygon Collisions

Simple web-based demonstration of the Separating Axis Theorem and an alternative algorithm named "Diagonals" for checking if two convex polygons have collided as well as a resolution, as inspired by [javidx9](https://youtu.be/7Ik2vowGcU0). The algorithms are only concerned with convex polygons, which are polygons where all interior angles are less than or equal to 180&deg;. For simplicity, the polygons in this demonstration are limited to regular polygons with a configurable amount of sides (3-40), although the polygons do not have to be regular. 

## Demonstration

link, todo

## Instructions

The following information can be accessed by clicking on the "Help" button in the top-right corner:

* The user can choose which algorithm to use by clicking on the alternatives in the top-left corner:

    * Separating Axis Theorem, Static (SAT/STATIC)

    * Diagonals, Static (DIAG/STATIC)

* The user can control the selected polygon by pressing buttons W, A, S, and D for moving forwards, rotating to its left, moving backwards, and rotating to its right, respectively

* The user can spawn new polygons by choosing the amount of sides, whether it can be pushed by other polygons, and its color

* The user can select another polygon by clicking on it

## TODOs

* Style the input section (bottom center)

* Add functionality to the help-button (top-right) in the form of creating a modal with instructions

* Finalize README by linking to website and code section of algorithm

## Algorithm Implementations

[The implementation of Separating Axis Theorem](link)

[The implementation of "Diagonals"](link)

## Intuitive Understanding

> Two convex objects do not overlap if there exists a line (called axis) onto which the two objects' projections do not overlap.

* **Separating Axis Theorem**

    The algorithm works by projecting all points of the two polygons onto one axis which forms their "shadows" from that perspective. The goal is to look at the polygons from every possible 1-dimensional perspective and observing if they overlap or not. Much like a physical ball can be completely hidden behind another ball from a certain perspective, we can not be certain that the two balls are **not** colliding by only looking at them from one point of view. We do not capture depth and as a result, neither do we capture their distances from the point of reference. Only after looking at it from every possible angle can we deduce whether or not they collide by asking if we found a perspective from which they did not collide. With regards to the polygons, we do not have to check an infinite amount of angles and can instead reduce it to the total amount of edges for both polygons.

* **Diagonals**

    todo
