import { Layer as l } from "../../utils/constants.js";
import Device from "./Device.js";

export default class Switch extends Device {
  static name = "Switch";
  static adapterPortCount = 6;

  constructor(name) {
    super(name, l.L2);
  }

  get type() {
    return "Switch";
  }

  initAdapter(name) {
    const adapter = super.initAdapter(name);

    // Configure the adapter specifically for a Switch
    adapter.promiscuousMode = true;
    this.initCAM();

    return adapter;
  }
}
