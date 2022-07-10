# Convex Polygon Collisions

Simple web-based demonstration of the Separating Axis Theorem and an alternative algorithm named "Diagonals" for checking if two convex polygons have collided as well as a resolution, inspired by [javidx9](https://youtu.be/7Ik2vowGcU0). The resolution for either algorithm may be a bit unnatural in their own way but that is something which the demonstration seeks to showcase. The algorithms are only concerned with convex polygons, which are polygons where all interior angles are less than or equal to 180&deg;. For simplicity, the polygons in this demonstration are limited to regular polygons with a configurable amount of sides (3-10), although the polygons do not **have** to be regular for the algorithms to work. 

## Demonstration

https://alexarne.github.io/Convex-Polygon-Collisions/

## Instructions

The following information can also be accessed by clicking on the "Help" button in the top-right corner:

* The user can choose which algorithm to use by clicking on the alternatives in the top-left corner:

    * Separating Axis Theorem

    * Diagonals

* The user can control the selected polygon by pressing buttons W, A, S, and D for moving forwards, rotating to its left, moving backwards, and rotating to its right, respectively. Touch control is available by switching the view of the UI at the bottom

* The user can spawn new polygons by specifying the amount of sides and whether or not it can be pushed by other polygons

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

* **Crammed Spaces**

    Previously, if a polygon was pushed by a non-pushable polygon into two non-pushable polygons (i.e., trapping it), a stack overflow would occur and the polygon would be placed somewhat incorrectly. This happened since the pushing polygon created a space in which the pushed polygon was unable to fit. The key detail here is that the pushing polygon had to be non-pushable, which meant it would not be able to be pushed back by the pushed polygon, given the solution for chain collisions. The solution was then to treat the selected polygon as pushable, no matter its actual value, so that it is unable to push polygons into spaces where they cannot fit.

* **Multiple Collision Points**

    If there were multiple contact points in a collision, the "Diagonals" algorithm would not respect that and would instead introduce noise in the resolution, resulting in movement from side to side in a perfect edge-to-edge collision. To solve that, we now use the updated points after displacement within the algorithm instead of only using the points for the polygons at the time of starting the algorithm (therefore; respecting any displacements which occur within the algorithm, before finishing).

## Known Bugs

* The "Diagonals" algorithm displaces polygons by too much if there are multiple contact points (can be tested by creating at least 5 polygons with an even amount of sides on a perfect line by not rotating them, and then pushing the line from one end). This is believed to be caused by improper vector additions which increases the space it moves away from the polygon instead of only changing its direction.

## Final Words

