import { IcmpType, IpProtocol } from "../../../utils/constants.js";

import Layer from "../Layer.js";
import TcpSegment from "./tcp/TcpSegment.js";
import UdpDatagram from "./udp/UdpDatagram.js";

import Udp from "./udp/Udp.js";
import Tcp from "./tcp/Tcp.js";
import Packet from "../../Packet.js";
import NetworkStack from "../NetworkStack.js";

export default class TransportLayer extends Layer {
  /**
   * @param {NetworkStack} stack
   */
  constructor(stack) {
    super(stack);

    /**
     * @type {Tcp}
     */
    this.tcp = new Tcp();

    /**
     * @type {Udp}
     */
    this.udp = new Udp();
  }

  toString() {
    return "Transport layer";
  }

  /**
   * Multiplexing of application data
   * - Encapsulates application data into DataUnit according to
   * a transport protocol of a source socket
   * @param {Packet} packet - The packet containing the application data
   * @returns {(UdpDatagram|TcpSegment)} - The encapsulated DataUnit
   */
  encapsulate(packet) {
    // Check if the packet has a source socket
    if (!packet.socket) return null;

    let datagram;
    // Determine the transport protocol of the source socket
    const protocol = packet.socket.protocol;

    // Encapsulate the packet into a UDP datagram if the protocol is UDP
    if (protocol === "UDP") {
      packet.ipProtocol = IpProtocol.UDP;
      datagram = this.udp.encapsulate(packet);
    }
    // Encapsulate the packet into a TCP segment if the protocol is TCP
    else {
      packet.ipProtocol = IpProtocol.TCP;
      datagram = this.tcp.encapsulate(packet);
    }

    return datagram;
  }

  /**
   * Decapsulates the tranport protocol DataUnit from a Packet
   * for further processing/demultiplexing
   * @param {Packet} packet
   * @returns
   */
  decapsulate(packet) {
    return packet.getUnit(TcpSegment, UdpDatagram);
  }

  acceptFromUpper(packet) {
    this.encapsulate(packet);
    this.sendToLower(packet);
  }

  /**
   * Accepts a packet from the lower layer and decapsulates the transport
   * protocol datagram. Then, it finds the corresponding socket using the
   * destined port and sender's address. If a socket is found, it handles
   * the packet accordingly (for TCP or UDP) and sends the response(if any) back to
   * the lower layer. If no socket is found, it sends an ICMP destination
   * unreachable packet.
   *
   * @param {Packet} packet - The packet received from the lower layer
   */
  acceptFromLower(packet) {
    // Decapsulate the transport protocol datagram from the packet
    const rcvDatagram = this.decapsulate(packet);

    // Extract the destined port and sender's address from the datagram
    const localPort = rcvDatagram.dstPort.decimal;
    const remoteAddress = packet.localAddress;

    // Find the corresponding socket using the destined port and sender's address
    const socket = this.stack.findSocket(localPort, remoteAddress);

    // If no socket is found, send an ICMP destination unreachable packet
    if (!socket) {
      packet.report(`No process listening\non port ${localPort}!`);
      return this.stack.icmp.resolveWithType(packet, IcmpType.dstUnreachable);
    }

    // Handle the packet accordingly (for TCP or UDP) and send the response back to the lower layer
    const response =
      rcvDatagram instanceof TcpSegment
        ? this.tcp.handle(packet, socket)
        : this.udp.handle(packet, socket);

    if (response) this.sendToLower(response);
  }
}
