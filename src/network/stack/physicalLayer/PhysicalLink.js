import { nanoid } from "nanoid";

/**
 * Represents a physical link connecting to network interfaces/adapters
 */
export default class PhysicalLink {
  /**
   * Creates a physical link between 2 ports.
   * For simplicity, both ports must be defined on initiation
   * ==> plugging un unplugging is not taken into consideration
   * ==> If one of the ports is not defined => Exception
   * @param {PhysicalPort} port1 First port end of the link
   * @param {PhysicalPort} port2 Second port end of the link
   * @param {Number} speed A transmission speed (not used)
   * @throws {Error} When two ports aren't defined
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

    // A unique identifier used e.g for export/import link distinction
    this.id = `link-${nanoid(5)}`;

    // Represent the ports the link is plugged in
    this.end1 = port1;
    this.end2 = port2;

    // Register the link on ports
    port1.plug(this);
    port2.plug(this);

    // In Mb/s, not used yet
    this.speed = speed;
  }

  // Not the best practice, but eases the access to a endpoint devices
  get adapter1() {
    return this.end1.adapter;
  }

  get adapter2() {
    return this.end2.adapter;
  }

  toString() {
    return `${this.adapter1} <--> ${this.adapter2}`;
  }

  /**
   * Determines if data can be send through a link based on whether
   * the two endpoints are connected to a device or not.
   * @returns Whether data can be transfered through a link.
   */
  isTransferable() {
    try {
      return this.adapter1.mountOn.powerOn && this.adapter2.mountOn.powerOn;
    } catch (e) {
      return false;
    }
  }

  /**
   * Unplugs both ends cancelling a physical connection
   * => making PhysicalLink eligible for GC
   */
  destroy() {
    // Unplug a link from both the ports, must access directly due to reactivity
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
   * Sends the Packet to the other end of the link
   * @param {PhysicalPort} srcPort
   * @param {Packet} packet
   */
  transferData(srcPort, packet) {
    packet.transmitted = true;
    packet.commit();

    srcPort != this.end1
      ? this.end1.receiveData(packet)
      : this.end2.receiveData(packet);
  }
}
