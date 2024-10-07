import { nanoid } from "nanoid";
import PhysicalLink from "./PhysicalLink";
import Packet from "../../Packet";
import NetworkAdapter from "../linkLayer/NetworkAdapter";

/**
 * Represents a physical port of a network interface.
 */
export default class PhysicalPort {
  /**
   * Creates a physical port of a network interface.
   * @param {NetworkAdapter} adapter - The network adapter the port is associated with.
   */
  constructor(adapter) {
    /**
     * @type {NetworkAdapter}
     */
    this.adapter = adapter; // The network adapter the port is associated with

    // An index within the ports of the interface - for easier links importing
    this.id = nanoid(8);

    // A plugged in physical link
    /**
     * @type {PhysicalLink|null}
     */
    this.physicalLink = null;

    // Indication for a free port must be a prop due to reactivity reasons
    /**
     * @type {Boolean}
     */
    this.free = true;
  }

  /**
   * Returns the other physical port connected to this port via a physical link.
   * Returns null if no physical link is connected.
   * @returns {PhysicalPort|null} The other physical port connected to this port via a physical link.
   */
  get otherPort() {
    if (this.physicalLink) {
      if (
        // Should be rethought
        this.physicalLink.end1.adapter.mountOn.name !==
        this.adapter.mountOn.name
      ) {
        return this.physicalLink.end1;
      }
      return this.physicalLink.end2;
    }
    return null;
  }

  /**
   * Creates a physical connection between this and other physical port.
   * @param {PhysicalPort} otherPort - The other physical port to be connected to.
   * @returns {PhysicalLink} The created physical link.
   */
  connect(otherPort) {
    return new PhysicalLink(this, otherPort);
  }

  /**
   * Plugs a physical link into the port.
   * @param {PhysicalLink} physicalLink - The physical link to be plugged into the port.
   */
  plug(physicalLink) {
    if (!(physicalLink instanceof PhysicalLink)) {
      throw new Error("Only a physical link can be plugged into a port!");
    }

    this.physicalLink = physicalLink;
    this.free = false;
  }

  /**
   * Unplugs the physical link from the port.
   * Deprecated.
   */
  unplug() {
    this.physicalLink = null;
    this.free = true;
  }

  /**
   * Checks if the port is available (unused).
   * @returns {boolean} True if the port is available, false otherwise.
   */
  isFree() {
    return this.free;
  }

  /**
   * Sends data through a physical link.
   * @param {Packet} packet - The packet to be sent.
   */
  sendData(packet) {
    if (!this.physicalLink || !this.physicalLink.isTransferable()) {
      packet.startPoint = this.adapter.mountOn;
      return packet.report("Physical link\nunavailable!");
    }

    packet.setEndPoints(this);
    this.physicalLink.transferData(this, packet);
  }

  /**
   * Receives a data from a link and passes it up to the network adapter along with a port instance for CAM table updating.
   * @param {Packet} packet - The received packet.
   */
  receiveData(packet) {
    this.adapter.receive(packet, this);
  }
}
