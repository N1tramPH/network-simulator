import Node from "../Node.js";

import PhysicalPort from "../stack/physicalLayer/PhysicalPort.js";
import NetworkAdapter from "../stack/linkLayer/NetworkAdapter.js";
import NetworkStack from "../stack/NetworkStack.js";

import { Layer as l } from "../../utils/constants.js";
import { nanoid } from "nanoid";
import MacAddress from "../stack/linkLayer/MacAddress.js";
import IpAddress from "../stack/ipLayer/IpAddress.js";

/**
 * Represents a device in the network.
 * A device is a node that can have multiple network adapters attached to it.
 * Each adapter is represented by a NetworkAdapter instance.
 * Each device has a network stack which is responsible for managing network-related functionality.
 */
export default class Device extends Node {
  static maxAdapterCount = 1;
  static adapterPortCount = 1;

  constructor(name, layerType = 0) {
    // Default position on creation
    super(0, 0);
    this.name = name;
    this.id = `dev-${nanoid(5)}`;

    // A bitmap indicating the L1...L7 device
    this.layerType = layerType;

    // Array of of NICs
    this.networkAdapters = [];

    // TCP/IP network stack
    this.networkStack = new NetworkStack(this, layerType);

    this._powerOn = true;
  }

  /**
   * Creates a new instance of Device from an export
   * @param {Object} data Device export data
   * @returns A new Device instance
   */
  static fromExport(data) {
    const device = new this(data.name);
    device.move(data.x, data.y);

    // Import interfaces first as the rest might be dependent on them
    data.adapters.forEach((a) => {
      const adapter = device.addAdapter(a.name, a.macAddress, a.ipAddress);

      // To preserve to port state, must be manually set
      adapter.ports = new Map(
        a.ports.map((p) => {
          const port = new PhysicalPort(adapter);
          port.id = p.id;
          return [port.id, port];
        })
      );
    });

    if (device.socketsTable) {
      device.socketsTable.importData(data.network.socketsTable); // TO BE IMPLEMENTED
    }

    if (device.arpTable) {
      device.arpTable.importData(data.network.arpTable);
    }

    if (device.routingTable) {
      device.routingTable.importData(data.network.routingTable);
    }

    if (device.socketsTable) {
      device.socketsTable.importData(data.network.socketsTable);
    }

    return device;
  }

  get type() {
    return "Device";
  }

  get powerOn() {
    return this._powerOn;
  }

  set powerOn(value) {
    this._powerOn = value;
  }

  get activeSocket() {
    return this.networkStack.activeSocket;
  }

  // A currently used socket
  set activeSocket(socket) {
    this.networkStack.activeSocket = socket;
  }

  get camTable() {
    return this.layerType === l.L2 ? this.networkStack.camTable : null;
  }

  get arpTable() {
    return this.layerType >= l.L3 ? this.networkStack.arpTable : null;
  }

  get routingTable() {
    return this.layerType >= l.L3 ? this.networkStack.routingTable : null;
  }

  get socketsTable() {
    return this.layerType >= l.L4 ? this.networkStack.socketsTable : null;
  }

  toString() {
    return `${this.type} (${this.name})`;
  }

  /**
   * Initializes the content address memory table.
   * This is used by layer 2 devices.
   */
  initCAM() {
    this.networkStack.initCAM();
  }

  /**
   * Finds a socket by source port and remote address.
   * This is used by layer 4 devices.
   * @param {PhysicalPort} srcPort The source port of the socket
   * @param {IpAddress} remoteAddress The remote address of the socket
   * @returns The socket or null if not found
   */
  findSocket(srcPort, remoteAddress) {
    return this.networkStack.findSocket(srcPort, remoteAddress);
  }

  /**
   * Turns on the device.
   */
  turnOn() {
    this._powerOn = true;
  }

  /**
   * Turns off the device.
   */
  turnOff() {
    this._powerOn = false;
  }

  /**
   * Toggles the power state of the device.
   */
  togglePower() {
    this._powerOn = !this._powerOn;
  }

  /**
   * Pings a destination IP address.
   * This is used by layer 3 devices.
   * @param {IpAddress} dstIpAddress The destination IP address to ping
   * @returns {Boolean} True if the ping was successful, false otherwise
   */
  ping(dstIpAddress) {
    if (this.layerType >= l.L3) {
      return this.networkStack.ping(dstIpAddress);
    }
  }

  /******* Sockets ********/
  /**
   * Initializes a socket.
   * This is used by layer 4 devices.
   * @param {String} type The type of the socket
   * @param {String} ipVersion The IP version of the socket
   * @param {String} protocol The protocol of the socket
   * @returns The initialized socket
   */
  initSocket(type = "client", ipVersion = "IPV4", protocol = "TCP") {
    if (this.layerType > l.L3) {
      return this.networkStack.initSocket(type, ipVersion, protocol);
    }
  }

  /**
   * Opens a socket.
   * This is used by layer 4 devices.
   * @param {Object} socket The socket to open
   * @returns The open socket
   */
  openSocket(socket) {
    if (this.layerType > l.L3) {
      return this.networkStack.openSocket(socket);
    }
  }

  /******* Adapters ********/

  /**
   * Checks if an adapter name is unique.
   * @param {String} name The name of the adapter to check
   * @returns {Boolean} True if the name is unique, false otherwise
   */
  isAdapterNameUnique(name) {
    return !this.networkAdapters.find((a) => a.name === name);
  }

  /**
   * Initializes a new network adapter with minimal configuration.
   * ==> no IP or MAC addresses.
   * Specific configuration is delegated to subclasses.
   * @param {String} name The name of the adapter
   * @returns The initialized adapter
   */
  initAdapter(name = "") {
    if (!this.isAdapterNameUnique(name)) {
      throw new Error(
        "The name must be unique among existing ones on a device!"
      );
    }

    const portCount = this.constructor.adapterPortCount;
    // Setting the common properties of all Device types
    const adapter = new NetworkAdapter(name, portCount, this);

    adapter.mode = this.layerType;
    adapter.mountOn = this;
    return adapter;
  }

  /**
   * Adds a new network adapter.
   * @param {String} name The name of the adapter
   * @param {MacAddress} macAddress The MAC address of the adapter, auto-generated if null
   * @param {IpAddress} ipAddress The IP address of the adapter, defaults to "0.0.0.0/0"
   * @returns The newly created adapter
   */
  addAdapter(name = "enp0s", macAddress = null, ipAddress = null) {
    const adapter = this.initAdapter(name);

    adapter.macAddress = macAddress ? macAddress : MacAddress.random();

    if (this.layerType >= l.L3) {
      adapter.ipAddress = ipAddress;
    }

    this.networkAdapters.push(adapter);
    return adapter;
  }

  /**
   * Removes an adapter of given index.
   * @param {Number} index An index of an adapter within the adapters array
   */
  removeAdapter(index) {
    try {
      this.networkAdapters.splice(index, 1);
    } catch (e) {
      throw new Error("Failed to remove an adapter!");
    }
  }

  /**
   * Exports the data of the current object as a plain JavaScript object.
   *
   * @return {Object} An object containing the name, type, x and y coordinates,
   *                  an array of exported network adapters, and an object
   *                  containing exported socket table, routing table, and ARP table.
   */
  exportData() {
    return {
      name: this.name,
      type: this.type,
      x: this.x,
      y: this.y,
      adapters: this.networkAdapters.map((a) => a.exportData()),
      network: {
        socketsTable: this.socketsTable ? this.socketsTable.exportData() : [],
        routingTable: this.routingTable ? this.routingTable.exportData() : [],
        arpTable: this.arpTable ? this.arpTable.exportData() : [],
      },
    };
  }
}
