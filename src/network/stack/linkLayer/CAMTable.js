import PhysicalPort from "../physicalLayer/PhysicalPort";
import MacAddress from "./MacAddress";

/**
 * CAMTable class represents a Content Address Memory table
 * which is used in L2 devices to store MAC -> Port mappings
 */
export default class CAMTable {
  /**
   * Initializes a new CAMTable instance
   * @param {PhysicalPort[]} ifaces Array of interfaces
   */
  constructor(ifaces) {
    /**
     * Array of interfaces
     * @type {PhysicalPort[]}
     */
    this.ifaces = ifaces;

    /**
     * Map of MAC addresses -> PhysicalPorts
     * @type {Map}
     */
    this.map = new Map();

    /**
     * Map of PhysicalPort ids -> MAC addresses
     * @type {Map}
     */
    this.inverseMap = new Map();
  }

  /**
   * Returns an array of CAMTable data
   * @returns {Array}
   */
  get data() {
    const camData = [];

    // Iterate over interfaces
    this.ifaces.forEach((iface) => {
      let i = 1;
      // Iterate over ports of each interface
      iface.ports.forEach((port) => {
        // Create a new object for each port
        camData.push({
          id: port.id,
          iface: iface.name,
          port: `port-${i}`,
          macAddress: this.inverseMap.get(port.id),
        });
        i++;
      });
    });

    return camData;
  }

  /**
   * Finds a port by its id
   * This method is used for updating a port mapping
   * @private
   * @param {string} portId
   * @returns {PhysicalPort|null}
   */
  _findPort(portId) {
    for (let i = 0; i < this.ifaces.length; i++) {
      const port = this.ifaces[i].ports.get(portId);
      if (port) return port;
    }
    return null;
  }

  /**
   * Retrieves a MAC address of a connected adapter on a given port
   * @param {PhysicalPort} port A port connected to a recipient with a wanted MAC address
   * @returns {string} A MAC address of a connected adapter on a given port
   */
  _getPortMacAddress(port) {
    return port.adapter.macAddress;
  }

  /**
   * Retrieves a PhysicalPort mapped with a given host MAC address
   * @param {MacAddress} macAddress
   * @returns {PhysicalPort|undefined}
   */
  get(macAddress) {
    return this.map.get(macAddress.toString(16, ":", 2, "0"));
  }

  /**
   * Sets the mapping of a MAC address with a given PhysicalPort
   * @param {MacAddress} macAddress
   * @param {PhysicalPort} port
   */
  set(macAddress, port) {
    // Whenever a port that's been mapped is encountered, delete the old mapping first
    if (!port.isFree) {
      const oldMacAddress = this._getPortMacAddress(port);
      this.map.delete(oldMacAddress.toString(16, ":", 2, "0"));
    }

    // The MAC address is set as a string
    this.inverseMap.set(port.id, macAddress.toString(16, ":", 2, "0"));
    return this.map.set(macAddress.toString(16, ":", 2, "0"), port);
  }

  /**
   * Clears a mapping of a MAC address with a given PhysicalPort
   * @param {string} portId
   */
  clear(portId) {
    const mac = this.inverseMap.get(portId);
    if (mac) this.map.delete(mac.toString());

    this.inverseMap.delete(portId);
  }

  /**
   * Updates a mapping of a MAC address with a given PhysicalPort.
   * This method is used to update an existing MAC address mapping
   * with a new one. It removes the old mapping and creates a new
   * one.
   *
   * @param {string} portId - The ID of the port.
   * @param {MacAddress} newMAC - An object containing the updated
   * properties of the port.
   */
  update(portId, newMAC) {
    // Ensure the input MAC is in the correct string format
    newMAC = new MacAddress(newMAC).toString();

    // Retrieve the MAC address that previously mapped to this port.
    const oldMAC = this.inverseMap.get(portId);

    // Find the reference to the actual port that MAC is being mapped to.
    const port = this._findPort(portId);

    // If the port is not found, return early.
    if (!port) return;

    this.inverseMap.set(portId, newMAC);
    this.map.set(newMAC, port);

    // Remove the old MAC mapping if there was any.
    this.map.delete(oldMAC);
  }
}
