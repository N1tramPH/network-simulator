import Layer from "../Layer.js";

export default class ApplicationLayer extends Layer {
  constructor(stack) {
    super(stack);
  }

  toString() {
    return "Application layer";
  }

  // Unlike lower layer, application defines how the data will look like
  // For simplicity, we'll keep data as they are

  ping(dstMacAddress) {}
}
