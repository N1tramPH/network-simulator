import { nanoid } from "nanoid";
import PhysicalPort from "./PhysicalPort";

/**
 * Represents a physical link connecting to network interfaces/adapters.
 */
export default class PhysicalLink {
  /**
   * Creates a physical link between two ports.
   * Both ports must be defined on instantiation
   *
   * @param {PhysicalPort} port1 - The first port end of the link.
   * @param {PhysicalPort} port2 - The second port end of the link.
   * @param {number} [speed=100] - The transmission speed (not used).
   * @throws {Error} When two ports aren't defined.
   */
  constructor(port1, port2, speed = 100) {
    // Check for the presence and types of ports
    if (!port1 || !port2) {
      throw new Error("Both physical ports must be defined on instantiation!");
    }

    // Check if both ports are free
    if (!port1.isFree() || !port2.isFree()) {
      throw new Error("A physical port plugged-in must be free!");
    }

    // A unique identifier used for export/import link distinction
    this.id = `link-${nanoid(5)}`;

    // Represent the ports the link is plugged in

    /**
     * The first port end of the link.
     * @type {PhysicalPort}
     */
    this.end1 = port1;

    /**
     * The second port end of the link.
     * @type {PhysicalPort}
     */
    this.end2 = port2;

    // Register the link on ports
    port1.plug(this);
    port2.plug(this);
  }

  /**
   * Returns the adapter associated with the first port end of the link.
   * @returns {NetworkAdapter} The adapter associated with the first port end of the link.
   */
  get adapter1() {
    return this.end1.adapter;
  }

  /**
   * Returns the adapter associated with the second port end of the link.
   * @returns {NetworkAdapter} The adapter associated with the second port end of the link.
   */
  get adapter2() {
    return this.end2.adapter;
  }

  /**
   * Returns a string representation of the link.
   * @returns {string} A string representation of the link.
   */
  toString() {
    return `${this.adapter1} <--> ${this.adapter2}`;
  }

  /**
   * Determines if data can be sent through the link based on whether
   * the two endpoints are connected to a device or not.
   * @returns {boolean} Whether data can be transferred through the link.
   */
  isTransferable() {
    try {
      return this.adapter1.mountOn.powerOn && this.adapter2.mountOn.powerOn;
    } catch (e) {
      return false;
    }
  }

  /**
   * Unplugs both ends of the link cancelling a physical connection
   * making the PhysicalLink eligible for garbage collection.
   */
  destroy() {
    // Unplug the link from both the ports, must access directly due to reactivity
    if (this.end1) {
      this.end1.free = true;
    }

    if (this.end2) {
      this.end2.free = true;
    }

    // Remove the port references
    this.end1 = null;
    this.end2 = null;
  }

  /**
   * Sends the packet to the other end of the link.
   * @param {PhysicalPort} srcPort - The source port.
   * @param {Packet} packet - The packet to be sent.
   */
  transferData(srcPort, packet) {
    packet.transmitted = true;
    packet.commit();

    srcPort != this.end1
      ? this.end1.receiveData(packet)
      : this.end2.receiveData(packet);
  }
}
