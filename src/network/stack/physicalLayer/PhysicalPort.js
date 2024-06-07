import { nanoid } from "nanoid";
import PhysicalLink from "./PhysicalLink";
import Packet from "../../Packet";

export default class PhysicalPort {
  constructor(adapter) {
    this.adapter = adapter;

    // An index within the ports of the interface - for easier links importing
    this.id = nanoid(8);

    // A plugged in physical link
    this.physicalLink = null;

    // Indication for a free port must be a prop due to reactivity reasons
    this.free = true;
  }

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
   * Creates a physical connection between this and other physical port
   * @param {*} otherPort Other physical port to be connected to
   */
  connect(otherPort) {
    return new PhysicalLink(this, otherPort);
  }

  /**
   *
   * @param {PhysicalLink} physicalLink
   */
  plug(physicalLink) {
    if (!(physicalLink instanceof PhysicalLink)) {
      throw new Error("Only a physical link can be plugged into a port!");
    }

    this.physicalLink = physicalLink;
    this.free = false;
  }

  /**
   * Removes the references to the physical link3
   * Deprecated
   */
  unplug() {
    this.physicalLink = null;
    this.free = true;
  }

  /**
   * Checks for port availability
   * @returns If the port is used
   */
  isFree() {
    return this.free;
  }

  /**
   * Sends data through a physical link
   * @param {Packet} packet
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
   * Receives a data from a link a passes up the data
   * to a network adapter along with a port instance
   * for CAM table updating.
   * @param {Packet} packet
   */
  receiveData(packet) {
    this.adapter.receive(packet, this);
  }
}
