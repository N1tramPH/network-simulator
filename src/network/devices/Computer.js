import { Layer as l } from "../../utils/constants.js";
import Device from "./Device.js";

/**
 * Represents a computer device.
 * This class extends the Device class and is a layer 7 device.
 */
export default class Computer extends Device {
  /**
   * The name of the device.
   * @type {string}
   * @static
   * @readonly
   */
  static name = "Computer";

  /**
   * Constructs a new instance of the Computer class.
   * @param {string} name - The name of the computer.
   */
  constructor(name) {
    super(name, l.L7);
  }

  /**
   * Returns the type of the device.
   * @returns {string} The type of the device.
   */
  get type() {
    return "Computer";
  }

  /**
   * Initializes a new network adapter with minimal configuration for a Computer.
   * @param {string} name - The name of the adapter.
   * @returns {NetworkAdapter} The initialized adapter.
   */
  initAdapter(name) {
    const adapter = super.initAdapter(name);

    // Configure the adapter specifically for a Computer
    // ...

    return adapter;
  }
}
