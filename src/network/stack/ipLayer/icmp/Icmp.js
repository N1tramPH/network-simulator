import {
  IpProtocol,
  PacketType,
  IcmpType as t,
} from "../../../../utils/constants";
import { reprIp } from "../../../../utils/utils";

import Packet from "../../../Packet";
import NetworkStack from "../../NetworkStack";
import IpPacket from "../IpPacket";
import IcmpMessage from "./IcmpMessage";

const reportMap = new Map([
  [t.echoReply, "Reply received"],
  [t.dstUnreachable, "Destination unreachable"],
  [t.timeExceeded, "Time exceeded"],
]);

export default class Icmp {
  /**
   * Instantiates an Internet Control Message Protocol stack
   * @param {NetworkStack} stack A network stack associated with
   */
  constructor(stack) {
    this._stack = stack;

    /**
     * Stores sent ICMP messages for latter potential response identification.
     * (Mapping based on ICMP message id)
     * @type {Map}
     */
    this.buffer = new Map();
  }

  _getHost() {
    return this._stack.getHost();
  }

  /**
   * Interface to an IP layer
   * @param {Packet} packet A packet passed to the IP layer
   */
  _sendToIpLayer(packet) {
    this._stack.ipLayer.acceptFromUpper(packet);
  }

  /**
   * Creates an ICMP message informing sender of a certain event
   * such as Echo reply, Destination unreachable, Time exceeded
   * @param {IpPacket} ipPacket An IP packet of a sender
   * @param {*} icmpType A response ICMP type
   * @param {Packet} packet A Packet from a sender (encapsulating IP packet)
   * @returns {Packet} A response Packet with an ICMP response
   */
  _createMessage(ipPacket, icmpType, packet) {
    let replyPacket;
    let icmpResponse = null;

    switch (icmpType) {
      case t.echoRequest:
        icmpResponse = IcmpMessage.echoReply();
        replyPacket = packet.response(null, "ICMP", "Echo reply");
        break;
      case t.dstUnreachable:
        icmpResponse = IcmpMessage.dstUnreachable();
        replyPacket = packet.response(null, "ICMP", "Destination unreachable");
        break;
      case t.timeExceeded:
        icmpResponse = IcmpMessage.timeExceeded();
        replyPacket = packet.response(null, "ICMP", "Time exceeded");
        break;
    }

    if (!replyPacket) return null;

    icmpResponse.computeCRC();
    replyPacket.startPoint = this._stack.getHost();
    replyPacket.data = icmpResponse;
    replyPacket.dstIpAddress = ipPacket.srcIpAddress;
    replyPacket.ipProtocol = IpProtocol.ICMP;
    replyPacket.type = PacketType.ICMP;

    return replyPacket;
  }

  /**
   * Pings a device with a given IP address (Sends an echo request).
   * @param {IpAddress} dstIpAddress An IP address of the remote device
   */
  ping(dstIpAddress) {
    const icmpRequest = IcmpMessage.echoRequest();
    icmpRequest.computeCRC();

    const packet = new Packet(null, "ICMP", "Echo request");
    packet.startPoint = this._getHost();
    packet.data = icmpRequest;
    packet.ipProtocol = IpProtocol.ICMP;
    packet.dstIpAddress = dstIpAddress;
    packet.type = PacketType.ICMP;

    packet.report(`Pinging ${reprIp(packet.dstIpAddress)}...`);
    this._sendToIpLayer(packet);

    const response = this.buffer.get(icmpRequest.id);
    if (response) {
      const type = response.type.decimal;
      if (type === t.echoReply) packet.success = true;

      this.buffer.delete(response.id); // Remove a reply after processing
      packet.msg = reportMap.get(type); // Set the message report based on received ICMP message

      return packet;
    } else {
      packet.msg = "Request timed out";
    }

    // Add the ICMP report after transmission ends
    packet.report(`${packet.msg}!`, 2, true);
    return packet;
  }

  /**
   * Creates a new ICMP event specified by icmpType
   * @param {Packet} packet A Packet the caused a certain event
   * @param {*} icmpType
   * @returns
   */
  resolveWithType(packet, icmpType) {
    const ipPacket = packet.getUnit(IpPacket);
    if (!ipPacket) return;

    const response = this._createMessage(ipPacket, icmpType, packet).commit();
    if (ipPacket.protocol.decimal === IpProtocol.ICMP)
      response.data.id = ipPacket.data.id; // assign ICMP response an id of a received ICMP message so a recipient can map a response

    return this._sendToIpLayer(response);
  }

  /**
   * Deals with an incoming ICMP IP packet, responds if necessary
   * @param {IcmpMessage} icmpMessage A received ICMP message
   * @param {IpPacket} ipPacket An IP packet that contains an ICMP message
   * @param {Packet} packet
   */
  resolveMessage(packet, icmpMessage, ipPacket) {
    const type = icmpMessage.type.decimal;

    if (type === t.echoRequest) {
      packet.report("Responding...");

      const icmpResponse = IcmpMessage.echoReply(packet);
      icmpResponse.id = icmpMessage.id;

      // A packet should be committed in case it's sent to itself
      const replyPacket = packet
        .response(icmpResponse, "ICMP", "Echo reply")
        .commit();
      replyPacket.startPoint = this._stack.getHost();
      replyPacket.dstIpAddress = ipPacket.srcIpAddress;
      replyPacket.ipProtocol = IpProtocol.ICMP;
      replyPacket.type = PacketType.ICMP;

      return this._sendToIpLayer(replyPacket);
    }

    packet.report(reportMap.get(type));
    this.buffer.set(icmpMessage.id, icmpMessage); // Else store received ICMP messages

    return icmpMessage;
  }
}
