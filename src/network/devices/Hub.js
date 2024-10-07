import { Layer as l } from "../../utils/constants.js";
import Device from "./Device.js";

/**
 * Represents a network hub.
 * A hub is a device that connects multiple network segments.
 * In this simulation, it is a layer 1 device.
 */
export default class Hub extends Device {
  /**
   * The name of the device.
   * @type {string}
   */
  static name = "Hub";

  /**
   * The number of network adapter ports on the device.
   * @type {number}
   */
  static adapterPortCount = 6;

  /**
   * Creates a new instance of Hub.
   * @param {string} name - The name of the hub.
   */
  constructor(name) {
    super(name, l.L1);
  }

  /**
   * Returns the type of the device.
   * @returns {string} The type of the device.
   */
  get type() {
    return "Hub";
  }

  /**
   * Initializes a new network adapter with minimal configuration specific to Hub.
   * @param {string} name - The name of the adapter.
   * @returns {NetworkAdapter} The initialized adapter.
   */
  initAdapter(name) {
    const adapter = super.initAdapter(name);

    // Configure the adapter specifically for a Switch

    return adapter;
  }
}
