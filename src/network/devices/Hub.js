import { Layer as l } from "../../utils/constants.js";
import Device from "./Device.js";

const layerType = l.L1;

export default class Hub extends Device {
  static name = "Hub";
  static adapterPortCount = 6;

  constructor(name) {
    super(name, layerType);
  }

  get type() {
    return "Hub";
  }

  initAdapter(name) {
    const adapter = super.initAdapter(name);

    // Configure the adapter specifically for a Switch

    return adapter;
  }
}
