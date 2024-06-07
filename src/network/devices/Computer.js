import { Layer as l } from "../../utils/constants.js";
import Device from "./Device.js";

const layerType = l.L7;

export default class Computer extends Device {
  static name = "Computer";

  constructor(name) {
    super(name, layerType);
  }

  get type() {
    return "Computer";
  }

  initAdapter(name) {
    const adapter = super.initAdapter(name);

    // Configure the adapter specifically for a Computer
    // ...

    return adapter;
  }
}
