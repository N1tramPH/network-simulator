import { nanoid } from "nanoid";
import { orderBy } from "lodash-es";

import IpAddress, { WILDCARD_IP } from "../IpAddress";

/**
 * Converts an address to IpAddress instance
 * @param {IpAddress | string} address An address to convert
 * @returns {IpAddress} An IpAddress instance
 */
const setIpAddress = (address) => {
  return address instanceof IpAddress ? address : new IpAddress(address);
};

/**
 * A routing table with static and dynamic routes
 */
export default class RoutingTable {
  /**
   * @param {NetworkAdapter[]} ifaces Gateway interfaces, also used to create dynamic on-link routes
   */
  constructor(ifaces) {
    /**
     * A table with static IP routes
     * @type {Object[]}
     */
    this.staticRoutes = [];

    /**
     * Network interfaces that make up the dynamic IP routes
     * @type {NetworkAdapter[]}
     */
    this.ifaces = ifaces;
  }

  /**
   * Returns dynamic routes defined by network interfaces
   * @returns {Object[]} An array of dynamic routes
   */
  get dynamicRoutes() {
    return this.ifaces.map((iface) => {
      return {
        id: nanoid(6), // Generate a unique ID
        dstIpAddress: iface.ipAddress.netAddress, // Destination IP address
        gateway: new IpAddress("0.0.0.0/0"), // Gateway IP address
        iface: iface, // Network interface
        metric: 1, // Metric
        dynamic: true, // Flag indicating the route is dynamic
      };
    });
  }

  /**
   * Returns a routing table of statically set routes along with
   * dynamic ones defined by network interfaces
   * @returns {Object[]} A routing table
   */
  get data() {
    const table = [...this.staticRoutes, ...this.dynamicRoutes];
    return orderBy(table, ["dstIpAddress.netmaskLength"], ["desc"]);
  }

  /**
   * Adds a new row to a routing table
   * @param {IpAddress | string} dstIpAddress A destination IP address
   * @param {IpAddress | string} gateway An IP address of a following node to pass the packet to
   * @param {NetworkAdapter} iface Name of an interface responsible for passing the packet (for easier import/export)
   * @param {Number} metric Price of the route
   * @param {string} id A unique ID for the route (optional)
   */
  add(dstIpAddress, gateway, iface, metric = 1, id = null) {
    const record = {
      id: id ? id : nanoid(6), // Generate a unique ID if not provided
      dstIpAddress: setIpAddress(dstIpAddress),
      gateway: setIpAddress(gateway),
      iface: iface,
      metric: metric ? parseInt(metric) : 1,
    };

    this.staticRoutes.push(record);
  }

  /**
   * Removes a row from the routing table
   * @param {string} id The ID of the row to remove
   * @throws {Error} If the row does not exist or is a dynamic route
   */
  remove(id) {
    const beforeLength = this.staticRoutes.length;
    this.staticRoutes = this.staticRoutes.filter((r) => r.id !== id);

    if (beforeLength == this.staticRoutes.length) {
      throw new Error("A dynamic route cannot be deleted.");
    }
  }

  /**
   * Updates a row in the routing table
   * @param {string} id The ID of the row to update
   * @param {Object} updated The updated row data
   * @throws {Error} If an error occurs during the update process
   */
  update(id, updated) {
    const u = updated;
    const gateway = u.gateway === "On-link" ? WILDCARD_IP : u.gateway;

    try {
      this.add(u.dstIpAddress, gateway, u.iface, u.metric);
      this.remove(id);
    } catch (e) {
      throw new Error(`An error ocurred on updating row:\n${e.message}`);
    }
  }

  /**
   * Queries the routing table for a matching route
   * @param {IpAddress} dstIpAddress The destination IP address to query
   * @returns {Object | undefined} The matching route, or undefined if no match is found
   */
  query(dstIpAddress) {
    let route = this.data.find((row) =>
      row.dstIpAddress.compare(dstIpAddress, row.dstIpAddress.netmask)
    );

    if (route) {
      route = { ...route }; // Make a shallow copy

      // In case the gateway is unspecified (on link), set the gateway to the recipient's IP
      if (route.gateway.isUnspecified()) {
        route.gateway = dstIpAddress;
      }
    }

    return route;
  }

  /**
   * Exports the routing table data
   * @returns {Object[]} An array of route data
   */
  exportData() {
    return this.staticRoutes.map((row) => {
      return {
        dstIpAddress: row.dstIpAddress.toString(),
        gateway: row.gateway.toString(),
        iface: row.iface.name,
        metric: parseInt(row.metric),
      };
    });
  }

  /**
   * Imports routing table data
   * @param {Object[]} data An array of route data
   * @throws {Error} If importing fails
   */
  importData(data) {
    try {
      if (!data) return;
      this.staticRoutes = data.map((row) => {
        return {
          id: nanoid(6),
          dstIpAddress: new IpAddress(row.dstIpAddress),
          gateway: new IpAddress(row.gateway),
          iface: this.ifaces.find((i) => i.name === row.iface),
          metric: parseInt(row.metric),
        };
      });
    } catch (e) {
      throw new Error("Importing a routing table's failed!");
    }
  }
}
