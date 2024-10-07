import { arpMessageStruct } from "../../../../utils/dataStructures";
import { FrameType } from "../../../../utils/constants";

import MacAddress from "../MacAddress";
import DataUnit from "../../DataUnit";
import LinkFrame from "../LinkFrame";

// Constants for ARP operation types
const ARP_REQUEST = 0; // Request for translation of IP to MAC address
const ARP_REPLY = 1; // Reply with the translated MAC address

/**
 * ARP (Address Resolution Protocol) message.
 * Represents an ARP packet.
 */
export default class ArpMessage extends DataUnit {
  /**
   * Creates an ARP message.
   * By default, initializes the message with the default values.
   */
  constructor() {
    super(null, arpMessageStruct);

    // Defaults
    this.macType = 6;
    this.ipType = 4;
    this.macLength = 6;
    this.ipLength = 4;
  }

  /**
   * Creates an ARP request for the given destination IP address received on the given interface.
   * @param {IpAddress} dstIpAddress - The destination IP address.
   * @param {NetworkAdapter} iface - The network interface that sends the ARP request.
   * @returns {LinkFrame} - The ARP request packet.
   */
  static createRequest(dstIpAddress, iface) {
    const body = new ArpMessage();
    body.operation = ARP_REQUEST;

    // Set my own addresses
    body.srcMacAddress = iface.macAddress;
    body.srcIpAddress = iface.ipAddress;

    // Requested IP address to be translated to MAC
    body.dstMacAddress = MacAddress.broadcast();
    body.dstIpAddress = dstIpAddress;

    const arpRequest = new LinkFrame(body);
    arpRequest.dstMacAddress = MacAddress.broadcast();
    arpRequest.srcMacAddress = iface.macAddress;
    arpRequest.type = FrameType.ARP;

    return arpRequest;
  }

  /**
   * Creates an ARP reply for the given ARP request received on the given interface.
   * @param {ArpMessage} arpRequest - The ARP request packet.
   * @param {NetworkAdapter} iface - The network interface that received an ARP request.
   * @returns {LinkFrame} - The ARP reply packet, or undefined if the request IP address is not the interface's IP address.
   */
  static createReply(arpRequest, iface) {
    // First check if the IP address of an iface an requested IP match
    if (!iface.ipAddress.compare(arpRequest.dstIpAddress)) {
      return;
    }

    const body = new ArpMessage();
    body.operation = ARP_REPLY;

    // Set the requester's addresses
    body.dstMacAddress = arpRequest.srcMacAddress;
    body.dstIpAddress = arpRequest.srcIpAddress;

    // Set own addresses
    body.srcMacAddress = iface.macAddress;
    body.srcIpAddress = iface.ipAddress;

    // Wrap the ARP body in a frame
    const arpReply = new LinkFrame(body);

    arpReply.dstMacAddress = arpRequest.srcMacAddress;
    arpReply.srcMacAddress = iface.macAddress;
    arpReply.type = FrameType.ARP;

    return arpReply;
  }

  /**
   * Returns a string representation of the ARP message.
   * @returns {string} - The string representation of the ARP message.
   */
  toString() {
    return this.operation.decimal == ARP_REQUEST ? "ARP request" : "ARP reply";
  }

  /**
   * Checks if the ARP message is an ARP request.
   * @returns {boolean} - True if the ARP message is an ARP request, false otherwise.
   */
  isRequest() {
    return this.operation.decimal == ARP_REQUEST;
  }

  /**
   * Checks if the ARP message is an ARP reply.
   * @returns {boolean} - True if the ARP message is an ARP reply, false otherwise.
   */
  isReply() {
    return this.operation.decimal == ARP_REPLY;
  }
}
