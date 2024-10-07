import Layer from "../Layer.js";

/**
 * Application layer of the network stack.
 * This layer is responsible for defining how the data will look like.
 */
export default class ApplicationLayer extends Layer {
  /**
   * Constructor for ApplicationLayer.
   * @param {NetworkStack} stack - The network stack to which this layer belongs.
   */
  constructor(stack) {
    super(stack);
  }

  /**
   * Returns a string representation of this layer.
   * @return {string} The string representation of this layer.
   */
  toString() {
    return "Application layer";
  }
}
