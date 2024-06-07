import { nanoid } from "nanoid";
import IpAddress from "../../ipLayer/IpAddress";
import MacAddress from "../MacAddress";

// Indicates the index of an IP and MAC in table pairs
const IP = 0;
const MAC = 1;

export default class ArpTable {
  constructor() {
    // array of pairs
    this.data = [];
  }

  toString() {
    return this.data.map((record) => `${record[IP]} - ${record[MAC]}\n`).join();
  }

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

  remove(id) {
    this.data = this.data.filter((row) => row.id !== id);
  }

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
   * @returns A MAC address mapped to a given IP address or null
   */
  query(ipAddress) {
    const res = this.data.find((row) => ipAddress.compare(row.ipAddress));
    return res ? res.macAddress : null;
  }

  exportData() {
    return this.data.map((row) => {
      return {
        ipAddress: row.ipAddress.toString(),
        macAddress: row.macAddress.toString(),
        type: row.type,
      };
    });
  }

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
