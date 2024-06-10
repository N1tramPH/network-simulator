import Layer from "../Layer.js";
import { IpProtocol as p } from "../../../utils/constants.js";

import IpPacket from "./IpPacket.js";
import IpAddress from "./IpAddress.js";
import Icmp from "./icmp/Icmp.js";
import RoutingProtocol from "./routing/RoutingProtocol.js";
import NetworkStack from "../NetworkStack.js";
import Packet from "../../Packet.js";

export default class IpLayer extends Layer {
  /**
   * Creates and returns an an IP stack
   * @param {NetworkStack} stack A creator network stack of this IP stack
   */
  constructor(stack) {
    super(stack);
    this.dataUnit = IpPacket;

    this.forwarding = false;

    this.route = new RoutingProtocol(stack, this);
    this.icmp = new Icmp(stack);
  }

  /**
   * Checks if an of the interfaces (network adapters) match
   * a received destination IP address.
   * @param {IpPacket} ipPacket
   * @returns An interface (network adapter) with matching an IP of destination packet
   */
  _isRecipient(ipPacket) {
    const networkAdapters = this.stack.networkAdapters;
    const dstIpAddress = ipPacket.dstIpAddress;

    return networkAdapters.find((adapter) =>
      adapter.ipAddress.compare(dstIpAddress)
    );
  }

  _resolveProtocol(packet, ipPacket) {
    const ipProtocol = ipPacket.protocol.decimal;
    switch (ipProtocol) {
      case p.ICMP:
        this.icmp.resolveMessage(packet, ipPacket.data, ipPacket);
        break;
      case p.UDP:
      case p.TCP:
        this.sendToUpper(packet);
        break;
    }
  }

  toString() {
    return "IP layer";
  }

  /**
   *
   * @param {Packet} packet
   */
  acceptFromUpper(packet) {
    // Encapsulate the packet data into IP packet
    const ipPacket = this.encapsulate(packet);
    ipPacket.protocol = packet.ipProtocol; // TCP/UDP
    ipPacket.srcIpAddress = packet.srcIpAddress; // A source IP should specified by the upper layer

    ipPacket.dstIpAddress = packet.socket
      ? packet.socket.dstIpAddress
      : packet.dstIpAddress;

    const route = this.route.resolve(packet, ipPacket);

    // Also check if the device is sending packet to itself
    if (this._isRecipient(ipPacket)) {
      packet.endPoint = this.stack.getHost(); // Ensure the endPoint is set
      return this._resolveProtocol(packet, ipPacket);
    }

    ipPacket.computeTotalLength();

    if (route) this.sendToLower(packet);
  }

  /**
   *
   * @param {Packet} packet
   * @returns
   */
  acceptFromLower(packet) {
    let ipPacket = this.decapsulate(packet);

    // Corrupted IP header, drop
    if (!ipPacket.checkCRC()) return packet.report("IP packet\ndropped");

    // IP doesn't match, try forwarding
    if (!this._isRecipient(ipPacket) && this.forwarding) {
      return this.route.forward(packet, ipPacket);
    }

    this._resolveProtocol(packet, ipPacket);
  }

  /**
   *
   * @param {Packet} packet
   * @returns
   */
  sendToLower(packet) {
    this.lower.acceptFromUpper(packet);
  }
}
