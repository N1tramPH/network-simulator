import PhysicalPort from "../physicalLayer/PhysicalPort";
import MacAddress from "./MacAddress";

/**
 * Creates an empty cam table represented
 * by a map of macAddress:port
 * @param {PhysicalPort[]} ports
 */
export default class CAMTable {
  constructor(ifaces) {
    this.ifaces = ifaces;
    this.map = new Map();
    this.inverseMap = new Map();
  }

  get data() {
    const camData = [];

    this.ifaces.forEach((iface) => {
      let i = 1;
      iface.ports.forEach((port) => {
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
   * @returns a MAC address of a connected adapter on a given port
   */
  _getPortMacAddress(port) {
    return port.adapter.macAddress;
  }

  /**
   * @param {*} macAddress
   * @returns A PhysicalPort mapped with a given host MAC address
   */
  get(macAddress) {
    return this.map.get(macAddress.toString(16, ":", 2, "0"));
  }

  /**
   * Sets the mapping of a MAC address with a given PhysicalPort
   * @param {*} macAddress
   * @param {PhysicalPort} port
   */
  set(macAddress, port) {
    // Whenever a port that's been mapped is encountered, delete the old mapping first
    if (!port.isFree) {
      const oldMacAddress = this._getPortMacAddress(port);
      this.map.delete(oldMacAddress.toString(16, ":", 2, "0"));
    }

    this.inverseMap.set(port.id, macAddress.toString(16, ":", 2, "0"));
    return this.map.set(macAddress.toString(16, ":", 2, "0"), port);
  }

  clear(portId) {
    const mac = this.inverseMap.get(portId);
    if (mac) this.map.delete(mac.toString());

    this.inverseMap.delete(portId);
  }

  update(portId, updated) {
    const u = updated;
    const macAddress = new MacAddress(u.macAddress);

    // Retrieve a MAC that previously mapped to this port
    const oldMacAddress = this.inverseMap.get(portId);

    // Find the reference to the actual port that MAC is being mapped to
    const port = this._findPort(portId);
    if (!port) return;

    this.inverseMap.set(portId, macAddress);
    this.map.set(macAddress.toString(), port);

    // Also remove the old MAC mapping if there was any
    this.map.delete(oldMacAddress.toString());
  }
}
