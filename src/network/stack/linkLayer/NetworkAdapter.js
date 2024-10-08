import { Layer as l } from "../../../utils/constants.js";
import Device from "../../devices/Device.js";
import LinkFrame from "./LinkFrame.js";
import Packet from "../../Packet.js";

import IpAddress from "../ipLayer/IpAddress.js";
import MacAddress from "./MacAddress.js";
import PhysicalPort from "../physicalLayer/PhysicalPort.js";
import CAMTable from "./CAMTable.js";

/**
 * Creates an array of 'count' physical ports set to given network interface.
 * @param {NetworkAdapter} adapter Adapter whose ports are to be initialized
 * @param {Number} count Number of ports
 * @returns an array of 'count' physical ports set to given network interface
 */
function _initPorts(adapter, count) {
  const ports = new Map();

  for (let i = 0; i < count; i++) {
    const port = new PhysicalPort(adapter);
    ports.set(port.id, port);
  }

  return ports;
}

export default class NetworkAdapter {
  /**
   * Represents a hardware component that facilitates a physical connection of devices in the network.
   * Each Adapter is uniquely identified by its:
   *  - MAC address (physical)
   *  - IP address (logical) - (only IPv4, unique within a local network)
   *    - (unique within a local network)
   * @param {String} name A unique string adapter identifier
   * @param {String|Iterable} macAddress A String in a standard format or an iterable consisting of 4 bytes
   * @param {String|Iterable} ipAddress A String in a standard format or an iterable consisting of 6 bytes
   */
  constructor(name = "enp0s1", portCount, mountOn = null) {
    this._name = name;

    // A bitmap indicating at which layer an adapter works
    // The Device sets the defaults but it can altered to change behavior
    // For example, a router might want to implement an interface acting like a switch at L2
    this._mode = l.L3;

    /**
     * The device the adapter is installed on
     * @type {Device}
     */
    this._mountOn = mountOn;

    // Defining addresses is delegated to a Device

    /**
     * @type {MacAddress}
     */
    this._macAddress = null;

    /**
     * @type {MacAddress}
     */
    this._ipAddress = null;

    // Whether accept all frames or not, regardless of the receiver
    this._promiscuousMode = false;

    // Buffer for incoming LinkFrames, TO BE IMPLEMENTED
    this.acceptBuffer = [];
    this.acceptBufferSize = 1024;

    /**
     * Maps the the port id and the physical port instance
     * @type {Map}
     */
    this.ports = _initPorts(this, portCount);

    /**
     * Content Address Memory - be initialized by a L2 device
     * @type {CAMTable}
     */
    this.cam = null;
  }

  get name() {
    return this._name;
  }

  set name(value) {
    if (!this.mountOn.isAdapterNameUnique(value)) {
      throw new Error(
        "An interface name must be unique amongst interfaces on a device!"
      );
    }

    this._name = value;
  }

  get mountOn() {
    return this._mountOn;
  }

  set mountOn(device) {
    if (!(device instanceof Device)) {
      throw new Error(
        "A network adapter can only be mounted on network Device!"
      );
    }

    this._mountOn = device;
  }

  /**
   * Defines a mode the network adapter will operate on
   * L1 - Hub
   * L2 - Switch
   * higher - Router, Computer...
   *  */
  get mode() {
    return this._mode;
  }

  set mode(value) {
    this._mode = value;
  }

  get promiscuousMode() {
    return this._promiscuousMode;
  }

  set promiscuousMode(value) {
    if (!(typeof value === "boolean")) {
      throw new Error("A promiscuous mode has to be boolean!");
    }

    this._promiscuousMode = value;
  }

  get macAddress() {
    return this._macAddress;
  }

  set macAddress(value) {
    this._macAddress = new MacAddress(value);
  }

  // IP getter/setter will ignore if device layer type < L3
  get ipAddress() {
    return this._ipAddress;
  }

  set ipAddress(value) {
    if (this.mode < l.L3) {
      throw new Error("This device does not operate on L3!");
    }

    this._ipAddress = new IpAddress(value);
  }

  get linkLayer() {
    return this.mountOn.networkStack.linkLayer;
  }

  /**
   * Checks if the frame's destination MAC address matches the adapter's MAC address.
   * If the adapter is in promiscuous mode, it accepts all frames.
   *
   * @param {LinkFrame} frame - The frame to check.
   * @return {boolean} Whether the frame is a recipient of the adapter.
   */
  _isRecipient(frame) {
    return this.promiscuousMode || this.macAddress.compare(frame.dstMacAddress);
  }

  /**
   * Finds a first available physical port on an interface.
   *
   * @returns {PhysicalPort} The first available physical port on an interface.
   *         Returns undefined if no free port is found.
   */
  _findFreePort() {
    return this.ports.find((p) => p.isFree());
  }

  /**
   * Returns the CAM table of the device this adapter is mounted on.
   *
   * @returns {CAMTable} The CAM table of the device.
   */
  _getCAMTable() {
    /**
     * Returns the CAM table of the device this adapter is mounted on.
     *
     * @returns {CAMTable} The CAM table of the device.
     */
    return this.mountOn.camTable;
  }

  toString() {
    return `${this.mountOn.name} (${this.name} - ${this.ipAddress})`;
  }

  /**
   * Connects this NetworkAdapter with another NetworkAdapter
   * by creating a physical link between two physical ports of each adapter.
   *
   * @param {NetworkAdapter} other - The other NetworkAdapter to connect to
   * @param {String} [thisPortName] - The identifier of the physical port on this adapter.
   * If not provided, the first free port is used.
   * @param {String} [otherPortName] - The identifier of the physical port on the other adapter.
   * If not provided, the first free port is used.
   * @returns {PhysicalLink} - The physical link connecting the two network adapters.
   * @throws {Error} If the given ports are invalid or not free.
   */
  connectAdapter(other, thisPort = null, otherPort = null) {
    // Find the physical ports to use for the connection.
    thisPort = thisPort ? thisPort : this._findFreePort();
    otherPort = otherPort ? otherPort : other._findFreePort();

    // Check if the given ports are valid and free.
    if (!thisPort || !otherPort) {
      throw new Error("Given ports are invalid!");
    }
    if (!thisPort.isFree() || !otherPort.isFree()) {
      throw new Error("Both ports must be free!");
    }

    // Create a physical link between the two physical ports and return it.
    return thisPort.connect(otherPort);
  }

  /**
   * Sends a link frame through all physical ports
   * and returns a buffer of potential responses.
   *
   * @param {Packet} packet - The packet to be broadcasted.
   * @param {String[]} [omitPorts=[]] - An array of physical port IDs that are to be omitted from
   * sending through. Defaults to an empty array.
   */
  broadcast(packet, omitPorts = []) {
    packet.report("Broadcasting...");

    // Set the output interface of the packet
    packet.outIface = this;

    // Get the link frame from the packet and compute its checksum
    const frame = packet.data;
    frame.checksum = frame.computeCRC();

    // Set the interface's MAC address when not in switching mode
    if (this.mode > l.L2) {
      frame.srcMacAddress = this.macAddress;
    }

    // Iterate over each physical port and send the packet if the port is not omitted and is not free
    this.ports.forEach((port) => {
      if (!omitPorts.includes(port.id) && !port.isFree()) {
        const copy = packet.copy().commit();
        port.sendData(copy);
      }
    });
  }

  /**
   * Sends a packet through the network adapter.
   *
   * @param {Packet} packet - The packet to be sent.
   * @param {String[]} omitPorts - An array of physical port IDs to be omitted from sending through.
   * or undefined if the packet cannot be sent.
   */
  send(packet, omitPorts = []) {
    // Get the link frame from the packet and compute its checksum
    const frame = packet.data;
    frame.checksum = frame.computeCRC();
    packet.outIface = this;

    // Hub mode: Send the packet through all ports, except from the incoming one
    if (this.mode === l.L1) {
      return this.broadcast(packet, omitPorts);
    }

    // Switch mode: Send the packet through the port associated with the destination MAC address,
    // or broadcast the packet if no port is associated with the destination MAC address
    if (this.mode === l.L2) {
      const port = this._getCAMTable().get(frame.dstMacAddress);
      if (port) {
        packet.report("Switching...");
        const copy = packet.copy().commit();
        return port.sendData(copy);
      }

      return this.broadcast(packet, omitPorts);
    }

    // Non switch/hub device mode: Send the packet through the first port if it is not free
    const port = this.ports.entries().next().value[1];
    if (port && !port.isFree()) {
      return port.sendData(packet.commit()); // No copy has to be made
    }
  }

  /**
   * Accepts and filters a received frame at the adapter based on:
   * - promiscuous mode
   * - MAC address
   *
   * @param {LinkFrame} frame Received frame
   */
  receive(packet, srcPort) {
    const frame = packet.data;

    // Validate the frame
    if (!frame.validateCRC()) {
      return packet.report("Frame dropped");
    }

    // Set the adapter the packet is received on
    packet.inIface = this;

    // Update the CAM if the adapter is in L2 mode (switch)
    const CAMTable = this._getCAMTable();
    CAMTable ? CAMTable.set(frame.srcMacAddress, srcPort) : 1;

    // Switch the packet
    if (this.mode < l.L3) {
      return this.send(packet, [srcPort.id]);
    }

    // Router or Computer - check for the MAC address
    if (!this._isRecipient(frame)) {
      return packet.report("Frame dropped");
    }

    // Add the frame to the accept buffer
    this.acceptBuffer.push(frame);

    // Pass the frame up to the link layer
    this.linkLayer.acceptFromLower(packet);
  }

  /**
   * Exports the data of the network adapter.
   *
   * @return {Object} An object containing the network adapter's name, IP address, MAC address, and
   *                  an array of ports. Each port object has an id and a linkId property.
   */
  exportData() {
    // Create an array of ports
    const ports = [];
    this.ports.forEach((port, id) => {
      // Add a port object to the array, with id and linkId properties
      ports.push({
        id: id,
        linkId: port.physicalLink ? port.physicalLink.id : null,
      });
    });

    // Return an object with the network adapter's name, IP address, MAC address, and ports array
    return {
      name: this.name,
      ipAddress: this.ipAddress ? this.ipAddress.toString() : "",
      macAddress: this.macAddress.toString(),
      ports: ports,
    };
  }
}
