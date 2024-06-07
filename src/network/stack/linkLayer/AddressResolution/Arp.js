import { reprIp } from "../../../../utils/utils";
import { PacketType, IcmpType } from "../../../../utils/constants";

import ArpMessage from "./ArpMessage";
import ArpTable from "./ArpTable";
import Packet from "../../../Packet";
import IpPacket from "../../ipLayer/IpPacket";
import NetworkAdapter from "../NetworkAdapter";

export default class Arp {
  constructor(stack, networkAdapters) {
    this._stack = stack;
    this._networkAdapters = networkAdapters;

    this.table = new ArpTable();
  }

  /**
   * Checks if any of the interfaces on a device has
   * a matching IP address to one in ARP reply
   * @param {ArpMessage} arpMessage A received ARP message
   * @param {NetworkAdapter} inIface An ingoing interface
   * @returns Whether a device is a recipient an ARP message
   */
  _isRecipient(arpMessage, inIface) {
    return arpMessage.dstIpAddress.compare(inIface.ipAddress);
  }

  /**
   * Processes an ARP message
   * @param {ArpMessage} arpMessage  A received ARP message
   * @param {Packet} packet  A received Packet
   */
  resolveMessage(arpMessage, packet) {
    const inIface = packet.inIface;
    if (!this._isRecipient(arpMessage, inIface)) {
      return packet.report("ARP dropped");
    }

    if (arpMessage.isRequest()) {
      const reply = ArpMessage.createReply(arpMessage, inIface);
      packet = packet.response(reply, "ARP reply");
      packet.type = PacketType.ARP;

      return inIface.send(packet);
    }

    if (arpMessage.isReply()) {
      this.table.add(
        arpMessage.srcIpAddress,
        arpMessage.srcMacAddress,
        "dynamic"
      );
      return packet.report("ARP resolved!");
    }

    packet.report("ARP failed!");
  }

  /**
   * Resolves a corresponding MAC address to a given IP address
   * Checks an ARP cache, if there's no record, sends an ARP request.
   * @param {IpAddress} ipAddress An IP to be translated into MAC
   * @param {Packet} packet An outgoing Packet
   */
  resolve(ipAddress, packet) {
    // Check in the cache for the ipAddress mapping
    let cached = this.table.query(ipAddress);
    if (cached) return cached;

    // Who hast die IP address?
    const iface = packet.outIface;
    const body = ArpMessage.createRequest(ipAddress, iface);
    const arpPacket = packet.createPreceding(body, "ARP request");

    arpPacket.report("ARP resolving...");
    arpPacket.report(`Who has an IP\n${reprIp(ipAddress)}?`, 1.7);
    arpPacket.type = PacketType.ARP;

    // Broadcast ARP request in a local network
    iface.send(arpPacket);
    packet.setPreceding(arpPacket); // Change an order of packet sequence accordingly

    // Check the cache after a resolution
    cached = this.table.query(ipAddress);

    if (!cached) {
      packet.report("Destination\nunreachable!");
      this._stack.icmp.resolve(packet, IcmpType.dstUnreachable);
    }

    return cached;
  }
}
