/**
 * Defines common properties used for dragging, manipulating the object on visualization
 */
export default class Node {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  move(dx, dy) {
    this.x += dx;
    this.y += dy;

    return this;
  }

  setxy(x, y) {
    this.x = x;
    this.y = y;

    return this;
  }
}
