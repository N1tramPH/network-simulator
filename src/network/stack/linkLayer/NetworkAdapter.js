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
 * @param {*} adapter Adapter which ports are to be initialized
 * @param {*} count Number of ports
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
   * Represents a hardware component that facilitates
   * a physical connection of devices in the network.
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

    // The device the adapter is installed on
    this._mountOn = mountOn;

    // Defining addresses is delegated to a Device
    this._macAddress = null;
    this._ipAddress = null;

    // Whether accept all frames or not, regardless of the receiver
    this._promiscuousMode = false;

    // Buffer for incoming LinkFrames, TO BE IMPLEMENTED
    this.acceptBuffer = [];
    this.acceptBufferSize = 1024;

    this.ports = _initPorts(this, portCount);

    // To be initialized by a L2 device
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

  _isRecipient(frame) {
    return this.promiscuousMode || this.macAddress.compare(frame.dstMacAddress);
  }

  /**
   * Finds a first available physical port on an interface
   * @returns a first available physical port on an interface
   */
  _findFreePort() {
    return this.ports.find((p) => p.isFree());
  }

  /**
   * @returns {CAMTable}
   */
  _getCAMTable() {
    return this.mountOn.camTable;
  }

  toString() {
    return `${this.mountOn.name} (${this.name} - ${this.ipAddress})`;
  }

  /**
   * Connects this NetworkAdapter with other one
   * pushing each one's instance into ports array
   * @param {NetworkAdapter} other
   * @param {String} thisPortName Identifier of the physical port, if not given first free port is used
   * @param {String} otherPortName Same as above
   * @returns a physicalLink connected the two network adapters
   */
  connectAdapter(other, thisPort = null, otherPort = null) {
    thisPort = thisPort ? thisPort : this._findFreePort();
    otherPort = otherPort ? otherPort : other._findFreePort();

    if (!thisPort || !otherPort) throw new Error("Given ports are invalid!");
    if (!thisPort.isFree() || !otherPort.isFree())
      throw new Error("Both ports must be free!");

    return thisPort.connect(otherPort);
  }

  /**
   * Sends a link frame through all physical ports
   * and returns a buffer of potential responses
   * @param {Packet} packet A transmitted Packet
   * @param {String[]} omitPorts An array of physical port IDs that are to be omitted from sending through
   * @returns an array of responses
   */
  broadcast(packet, omitPorts = []) {
    packet.report("Broadcasting...");
    packet.outIface = this;

    const frame = packet.data;
    frame.checksum = frame.computeCRC();

    // Set the iface's MAC when not switching
    if (this.mode > l.L2) {
      frame.srcMacAddress = this.macAddress;
    }

    this.ports.forEach((port) => {
      if (!omitPorts.includes(port.id) && !port.isFree()) {
        const copy = packet.copy().commit();
        port.sendData(copy);
      }
    });
  }

  /**
   *
   * @param {Packet} packet A transmitted Packet
   * @param {String[]} omitPorts An array of physical port IDs that are to be omitted from sending through
   * @returns
   */
  send(packet, omitPorts = []) {
    const frame = packet.data;
    frame.checksum = frame.computeCRC();
    packet.outIface = this;

    // Hub mode
    if (this.mode === l.L1) {
      return this.broadcast(packet, omitPorts); // Send through all ports, except from the incoming one
    }

    // Switch mode
    if (this.mode === l.L2) {
      const port = this._getCAMTable().get(frame.dstMacAddress);
      if (port) {
        packet.report("Switching...");
        const copy = packet.copy().commit();
        return port.sendData(copy);
      }

      return this.broadcast(packet, omitPorts);
    }

    const port = this.ports.entries().next().value[1]; // Non switch/hub device only has 1 port
    if (port && !port.isFree()) {
      return port.sendData(packet.commit()); // No copy has to be made
    }
  }

  /**
   * Accepts and filters a received frame at the adapter based on:
   * - promiscuous mode
   * - MAC address
   * @param {LinkFrame} frame Received frame
   */
  receive(packet, srcPort) {
    const frame = packet.data;
    if (!frame.validateCRC()) return packet.report("Frame dropped");
    packet.inIface = this;

    // Update CAM it's present (Switch)
    const CAMTable = this._getCAMTable();
    CAMTable ? CAMTable.set(frame.srcMacAddress, srcPort) : 1;

    // Switch the packet
    if (this.mode < l.L3) return this.send(packet, [srcPort.id]);

    // Router or Computer - check for the MAC address
    if (!this._isRecipient(frame)) return packet.report("Frame dropped");

    this.acceptBuffer.push(frame);
    this.linkLayer.acceptFromLower(packet); // Pass up the frame
  }

  exportData() {
    const ports = [];
    this.ports.forEach((port, id) => {
      ports.push({
        id: id,
        linkId: port.physicalLink ? port.physicalLink.id : null,
      });
    });

    return {
      name: this.name,
      ipAddress: this.ipAddress ? this.ipAddress.toString() : "",
      macAddress: this.macAddress.toString(),
      ports: ports,
    };
  }
}
