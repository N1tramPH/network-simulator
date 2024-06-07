import { nanoid } from "nanoid";
import { orderBy } from "lodash-es";

import IpAddress, { WILDCARD_IP } from "../IpAddress";

const setIpAddress = (address) => {
  return address instanceof IpAddress ? address : new IpAddress(address);
};

export default class RoutingTable {
  /**
   * @param {NetworkAdapter} ifaces Gateway interfaces, also used to create dynamic on-link routes
   */
  constructor(ifaces) {
    /**
     * A table with static IP routes
     */
    this.staticRoutes = [];

    /**
     * Network interfaces that make up the dynamic IP routes
     */
    this.ifaces = ifaces;
  }

  get dynamicRoutes() {
    return this.ifaces.map((iface) => {
      return {
        id: nanoid(6),
        dstIpAddress: iface.ipAddress.netAddress,
        gateway: new IpAddress("0.0.0.0/0"),
        iface: iface,
        metric: 1,
        dynamic: true,
      };
    });
  }

  /**
   * Returns a routing table of statically set routes along with
   * dynamic ones defined by network interfaces.
   * Individual rows are sorted in the descending order of destination IP netmask length
   */
  get data() {
    const table = [...this.staticRoutes, ...this.dynamicRoutes];
    return orderBy(table, ["dstIpAddress.netmaskLength"], ["desc"]);
  }

  /**
   * Adds a new row to a routing table
   * @param {IpAddress} dstIpAddress A destination IP address
   * @param {ByteArray} networkMask A network mask of an IP address, set to null, if CIDR mask was given, otherwise defaults to mask of length 32
   * @param {IpAddress} gateway An IP address of a following node to pass the packet to
   * @param {NetworkAdapter} iface Name of an interface responsible for passing the packet (for easier import/export)
   * @param {Number} metric Price of the route
   */
  add(dstIpAddress, gateway, iface, metric = 1, id = null) {
    const record = {
      id: id ? id : nanoid(6),
      dstIpAddress: setIpAddress(dstIpAddress),
      gateway: setIpAddress(gateway),
      iface: iface,
      metric: metric ? parseInt(metric) : 1,
    };

    this.staticRoutes.push(record);
  }

  remove(id) {
    const beforeLength = this.staticRoutes.length;
    this.staticRoutes = this.staticRoutes.filter((r) => r.id !== id);

    if (beforeLength == this.staticRoutes.length) {
      throw new Error("A dynamic route cannot be deleted.");
    }
  }

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
   * @param {IpAddress} dstIpAddress
   * @returns a matching route
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
