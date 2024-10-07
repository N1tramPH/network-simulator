import { useSimulationStore } from "../../../../stores/SimulationStore";
import { useTransmitStore } from "../../../../stores/TransmitStore";
import { IcmpType } from "../../../../utils/constants";

import RoutingTable from "./RoutingTable";
import Packet from "../../../Packet";
import IpPacket from "../IpPacket";
import NetworkStack from "../../NetworkStack";

const getTTL = () => parseInt(useSimulationStore().timeToLive);

/**
 * Class that represents a routing protocol.
 * Responsible for forwarding packets based on routing table.
 */
export default class RoutingProtocol {
  /**
   * @param {NetworkStack} stack - The network stack the protocol is associated with.
   */
  constructor(stack) {
    /**
     * The network stack the protocol is associated with.
     * @type {NetworkStack}
     */
    this.stack = stack;

    /**
     * The routing table used by the protocol.
     * @type {RoutingTable}
     */
    this.routingTable = new RoutingTable(stack.networkAdapters);
  }

  /**
   * Forwards an IP packet based on the routing table.
   * @param {Packet} packet - The packet being forwarded.
   * @param {IpPacket} ipPacket - The IP packet being forwarded.
   */
  forward(packet, ipPacket) {
    packet.report("Forwarding...");

    const dstIpAddress = ipPacket.dstIpAddress;
    const route = this.routingTable.query(dstIpAddress);

    if (!route) {
      packet.report("Route\nnot found!");
      packet.report("IP packet\ndropped");
      packet.commit(); // Commit a packet to make sure the reports is shown
      return this.stack.icmp.resolveWithType(packet, IcmpType.dstUnreachable);
    }

    const outIface = route.iface;

    // Prevent from forwarding to the incoming interface
    if (outIface.macAddress.compare(packet.inIface.macAddress)) {
      return packet.report("IP packet dropped\n→loop prevention");
    }

    // Create a copy of the IP packet, so the original isn't overriden
    ipPacket = ipPacket.copy();
    ipPacket.decrementTTL();

    if (!ipPacket.timeToLive.decimal) {
      packet.report("TTL exceeded!");
      return this.stack.icmp.resolveWithType(packet, IcmpType.timeExceeded);
    }

    ipPacket.computeCRC(); // Recompute checksum

    const forwarded = packet.copy().commit();

    forwarded.data = ipPacket;
    forwarded.outIface = outIface;
    forwarded.route = route;

    this.stack.ipLayer.sendToLower(forwarded);
    return forwarded;
  }

  /**
   * Resolves the next hop for an IP packet.
   * @param {Packet} packet - The packet being resolved.
   * @param {IpPacket} ipPacket - The IP packet being resolved.
   * @returns {Object|null} - The next route or null if no route is found.
   */
  resolve(packet, ipPacket) {
    // Resolving the next hop (IP address)

    // Find an interface to send the packet through
    const route = this.routingTable.query(ipPacket.dstIpAddress);

    if (!route) {
      packet.commit(); // Commit a packet to make sure the reports is shown
      return packet.report("Destination unreachable!");
    }

    const outIface = route.iface;
    packet.route = route;
    packet.outIface = outIface;
    ipPacket.srcIpAddress = outIface.ipAddress;

    // Source IP might not be set on root node
    // when packet is coming from upper layer
    if (packet.isRoot) {
      useTransmitStore().setSrcIpAddress(outIface.ipAddress);
    }

    ipPacket.timeToLive = getTTL();
    ipPacket.computeCRC();

    return route;
  }
}
