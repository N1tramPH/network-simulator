import { nanoid } from "nanoid";
import IpAddress from "../../ipLayer/IpAddress";
import MacAddress from "../MacAddress";

// Indicates the index of an IP and MAC in table pairs
const IP = 0;
const MAC = 1;

/**
 * ARP table to store mappings between IP addresses and MAC addresses
 */
export default class ArpTable {
  /**
   * Constructs a new ARP table
   */
  constructor() {
    // An array of { id, ipAddress, macAddress, type }
    this.data = [];
  }

  /**
   * Returns a string representation of the ARP table
   * @returns {string} String representation of the ARP table
   */
  toString() {
    return this.data.map((record) => `${record[IP]} - ${record[MAC]}\n`).join();
  }

  /**
   * Adds a new entry to the ARP table
   * @param {string} ipAddress IP address of the node
   * @param {string} macAddress MAC address of the node
   * @param {string} type Type of the entry (static or dynamic)
   * @throws {Error} If the type is not either 'static' or 'dynamic'
   */
  add(ipAddress, macAddress, type = "static") {
    if (!(type === "static" || type === "dynamic")) {
      throw new Error('Type must be either "static" or "dynamic"!');
    }

    this.data.push({
      id: nanoid(5),
      ipAddress: new IpAddress(ipAddress),
      macAddress: new MacAddress(macAddress),
      type: type,
    });
  }

  /**
   * Removes an entry from the ARP table
   * @param {string} id ID of the entry to be removed
   */
  remove(id) {
    this.data = this.data.filter((row) => row.id !== id);
  }

  /**
   * Updates an entry in the ARP table
   * @param {string} id ID of the entry to be updated
   * @param {Object} updated Updated data for the entry
   * @throws {Error} If an error occurs while updating the entry
   */
  update(id, updated) {
    const u = updated;

    try {
      this.add(u.ipAddress, u.macAddress);
      this.remove(id);
    } catch (e) {
      throw new Error(`An error ocurred on updating row:\n${e.message}`);
    }
  }

  /**
   * Finds the MAC address that is mapped with a given IP address
   * @param {IpAddress} ipAddress IP address of node whose MAC address is looked for
   * @returns {MacAddress|null} MAC address mapped to a given IP address or null
   */
  query(ipAddress) {
    const res = this.data.find((row) => ipAddress.compare(row.ipAddress));
    return res ? res.macAddress : null;
  }

  /**
   * Exports the ARP table data
   * @returns {Array} Array of objects containing IP address, MAC address, and type of each entry
   */
  exportData() {
    return this.data.map((row) => {
      return {
        ipAddress: row.ipAddress.toString(),
        macAddress: row.macAddress.toString(),
        type: row.type,
      };
    });
  }

  /**
   * Imports data into the ARP table
   * @param {Array} data Array of objects containing IP address, MAC address, and type of each entry
   * @throws {Error} If an unexpected error occurs during import
   */
  importData(data) {
    try {
      if (!data) return;
      this.data = data.map((row) => {
        return {
          id: nanoid(5),
          ipAddress: new IpAddress(row.ipAddress),
          macAddress: new MacAddress(row.macAddress),
          type: row.type,
        };
      });
    } catch (e) {
      throw new Error("An unexpected error ocurred: ", e);
    }
  }
}
