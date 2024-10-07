import Layer from "../Layer.js";
import { IpProtocol as p } from "../../../utils/constants.js";

import IpPacket from "./IpPacket.js";
import IpAddress from "./IpAddress.js";
import Icmp from "./icmp/Icmp.js";
import RoutingProtocol from "./routing/RoutingProtocol.js";
import NetworkStack from "../NetworkStack.js";
import Packet from "../../Packet.js";
import DataUnit from "../DataUnit.js";

/**
 * Represents the Internet Protocol (IP) layer.
 */
export default class IpLayer extends Layer {
  /**
   * Creates an instance of the IP layer.
   * @param {NetworkStack} stack - The network stack that created the IP layer.
   */
  constructor(stack) {
    super(stack);
    this.forwarding = false;

    /**
     * The data unit of the IP layer.
     * @type {DataUnit}
     */
    this.dataUnit = IpPacket;

    /**
     * The routing protocol of the IP layer.
     * @type {RoutingProtocol}
     */
    this.route = new RoutingProtocol(stack);

    /**
     * The Internet Control Message Protocol (ICMP) of the IP layer.
     * @type {Icmp}
     */
    this.icmp = new Icmp(stack);
  }

  /**
   * Checks if any of the network adapters matches the destination IP address of the IP packet.
   * @param {IpPacket} ipPacket - The IP packet to check.
   * @returns {NetworkAdapter|undefined} - The network adapter with a matching IP address, or undefined if not found.
   */
  _isRecipient(ipPacket) {
    const networkAdapters = this.stack.networkAdapters;
    const dstIpAddress = ipPacket.dstIpAddress;

    return networkAdapters.find((adapter) =>
      adapter.ipAddress.compare(dstIpAddress)
    );
  }

  /**
   * Resolves the IP packet based on its set protocol item.
   * @param {Packet} packet - The packet encapsulating an IP packet to resolve.
   * @param {IpPacket} ipPacket - The IP packet to resolve.
   */
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

  /**
   * Returns a string representation of the IP layer.
   * @returns {string} - The string representation of the IP layer.
   */
  toString() {
    return "IP layer";
  }

  /**
   * Accepts a packet from the upper layer and encapsulates it into an IP packet.
   * The IP packet is then sent to the lower layer.
   *
   * @param {Packet} packet - The packet received from the upper layer.
   */
  acceptFromUpper(packet) {
    // Encapsulate the packet data into an IP packet
    const ipPacket = this.encapsulate(packet);

    // Set the protocol of the IP packet to the protocol specified by the upper layer
    ipPacket.protocol = packet.ipProtocol;

    // Set the source IP address of the IP packet specified by the upper layer
    ipPacket.srcIpAddress = packet.srcIpAddress;

    // Set the destination IP address of the IP packet based on the socket of the upper layer packet or the destination IP address of the upper layer packet
    ipPacket.dstIpAddress = packet.socket
      ? packet.socket.dstIpAddress
      : packet.dstIpAddress;

    // Resolve the route of the IP packet
    const route = this.route.resolve(packet, ipPacket);

    // Check if the device is sending the packet to itself
    if (this._isRecipient(ipPacket)) {
      // Ensure the endPoint is set
      packet.endPoint = this.stack.getHost();
      // Resolve the the packet based on the protocol
      return this._resolveProtocol(packet, ipPacket);
    }

    // Compute the total length of the IP packet
    ipPacket.computeTotalLength();

    // Send the IP packet to the lower layer if a route is resolved
    if (route) this.sendToLower(packet);
  }

  /**
   * Accepts a packet from the lower layer and decapsulates it into an IP packet.
   * The packet is then resolved based on the protocol.
   *
   * @param {Packet} packet - The packet received from the lower layer.
   */
  acceptFromLower(packet) {
    // Decapsulate the packet data into an IP packet
    let ipPacket = this.decapsulate(packet);

    // If the IP header is corrupted, drop the packet
    if (!ipPacket.checkCRC()) {
      return packet.report("IP packet\ndropped");
    }

    // If the IP packet is not directed to this device and forwarding is enabled,
    // forward the packet to the next hop
    if (!this._isRecipient(ipPacket) && this.forwarding) {
      return this.route.forward(packet, ipPacket);
    }

    // Resolve the the packet based on the protocol
    this._resolveProtocol(packet, ipPacket);
  }

  /**
   * Sends a packet to the lower layer.
   * @param {Packet} packet - The packet to send.
   */
  sendToLower(packet) {
    this.lower.acceptFromUpper(packet);
  }
}
