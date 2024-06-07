import UdpDatagram from "./UdpDatagram";

/**
 * TO BE IMPLEMENTED
 */
export default class Udp {
  constructor() {}

  encapsulate(packet) {
    const socket = packet.socket;
    const data = packet.data;
    let datagram;

    datagram = new UdpDatagram(data);
    datagram.srcPort = socket.srcPort;
    datagram.dstPort = socket.dstPort;

    return datagram;
  }

  handle(packet, socket) {}
}
