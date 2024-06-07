import { Layer as l } from "../../utils/constants.js";
import Device from "./Device.js";

export default class Router extends Device {
  static name = "Router";
  static adapterPortCount = 1;

  constructor(name) {
    super(name, l.L3);
    this.networkStack.ipLayer.forwarding = true;
  }

  get type() {
    return "Router";
  }

  initAdapter(name) {
    const adapter = super.initAdapter(name);

    // Configure the adapter specifically for a Router
    // ...

    return adapter;
  }
}
