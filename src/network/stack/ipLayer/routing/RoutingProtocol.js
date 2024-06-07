import { useSimulationStore } from "../../../../stores/SimulationStore";
import { useTransmitStore } from "../../../../stores/TransmitStore";
import { IcmpType } from "../../../../utils/constants";

import RoutingTable from "./RoutingTable";
import Packet from "../../../Packet";
import IpPacket from "../IpPacket";

const getTTL = () => parseInt(useSimulationStore().timeToLive);

export default class RoutingProtocol {
  constructor(stack, ipLayer) {
    this.stack = stack;
    this.ipLayer = ipLayer;

    this.routingTable = new RoutingTable(stack.networkAdapters);
  }

  /**
   *
   * @param {IpPacket} ipPacket
   */
  forward(packet, ipPacket) {
    packet.report("Forwarding...");

    const dstIpAddress = ipPacket.dstIpAddress;
    const route = this.routingTable.query(dstIpAddress);
    if (!route) {
      packet.report("Route\nnot found!");
      packet.report("IP packet\ndropped");
      packet.commit(); // Commit a packet to make sure the reports is shown
      return this.stack.icmp.resolve(packet, IcmpType.dstUnreachable);
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
      return this.stack.icmp.resolve(packet, IcmpType.timeExceeded);
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
   * Finds and returns a next for an IP packet at the sender endPoint.
   * Also sets the packet route, outIface accordingly for a link layer.
   * Sets the src IP of the socket and IP packet based on found route, outIface.
   * If route is not found, null is returned.
   * @param {Packet} packet
   * @param {IpPacket} ipPacket
   * @returns A next route
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
