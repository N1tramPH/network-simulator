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
   * @param {Packet} packet
   * @returns
   */
  encapsulate(packet) {
    if (!packet.socket) return null;

    const protocol = packet.socket.protocol;
    let datagram;

    if (protocol === "UDP") {
      packet.ipProtocol = IpProtocol.UDP;
      datagram = this.udp.encapsulate(packet);
    } else {
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

  acceptFromLower(packet) {
    const rcvDatagram = this.decapsulate(packet);

    // Based on destined port and sender's address, find serving port
    const localPort = rcvDatagram.dstPort.decimal;
    const remoteAddress = packet.localAddress;

    const socket = this.stack.findSocket(localPort, remoteAddress);
    if (!socket) {
      packet.report(`No process listening\non port ${localPort}!`);
      return this.stack.icmp.resolveWithType(packet, IcmpType.dstUnreachable);
    }

    const response =
      rcvDatagram instanceof TcpSegment
        ? this.tcp.handle(packet, socket)
        : this.udp.handle(packet, socket);

    if (response) this.sendToLower(response);
  }
}
