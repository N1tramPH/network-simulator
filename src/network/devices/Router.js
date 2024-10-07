import { Layer as l } from "../../utils/constants.js";
import Device from "./Device.js";

/**
 * Represents a network router.
 * Router is a layer 3 device.
 */
export default class Router extends Device {
  /**
   * The number of adapter ports a router has.
   * @type {number}
   */
  static adapterPortCount = 1;

  /**
   * The name of the router.
   * @type {string}
   */
  static name = "Router";

  /**
   * Initializes a new Router instance.
   * @param {string} name - The name of the router.
   */
  constructor(name) {
    super(name, l.L3);
    // Enable IP layer forwarding
    this.networkStack.ipLayer.forwarding = true;
  }

  /**
   * Returns the type of the device.
   * @returns {string} The type of the device.
   */
  get type() {
    return "Router";
  }

  /**
   * Initializes a new network adapter with minimal configuration specific to Router.
   * @param {string} name - The name of the adapter
   * @returns {NetworkAdapter} The initialized adapter
   */
  initAdapter(name) {
    const adapter = super.initAdapter(name);

    // Configure the adapter specifically for a Router
    // ...

    return adapter;
  }
}
