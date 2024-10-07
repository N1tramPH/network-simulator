import { Layer as l } from "../../utils/constants.js";
import Device from "./Device.js";

/**
 * Represents a network switch.
 * A switch is a device that connects multiple network segments.
 * In this simulation, it is a layer 2 device.
 */
export default class Switch extends Device {
  /**
   * The name of the Switch.
   * @type {String}
   */
  static name = "Switch";

  /**
   * The number of ports on each adapter of the Switch.
   * @type {Number}
   */
  static adapterPortCount = 6;

  /**
   * Initializes a new instance of the Switch class.
   * @param {String} name - The name of the Switch.
   */
  constructor(name) {
    super(name, l.L2);
  }

  /**
   * Returns the type of the device.
   * @returns {String} The type of the device.
   */
  get type() {
    return "Switch";
  }

  /**
   * Initializes a new network adapter with minimal configuration.
   * --> Initializes a CAM table of a Switch.
   * @param {String} name - The name of the adapter.
   * @returns {NetworkAdapter} The initialized adapter.
   */
  initAdapter(name) {
    const adapter = super.initAdapter(name);

    // Configure the adapter specifically for a Switch
    adapter.promiscuousMode = true;
    this.initCAM();

    return adapter;
  }
}
