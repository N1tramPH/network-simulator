import { arpMessageStruct } from "../../../../utils/dataStructures";
import { FrameType } from "../../../../utils/constants";

import MacAddress from "../MacAddress";
import DataUnit from "../../DataUnit";
import LinkFrame from "../LinkFrame";

const ARP_REQUEST = 0;
const ARP_REPLY = 1;

export default class ArpMessage extends DataUnit {
  constructor() {
    super(null, arpMessageStruct);

    // Defaults
    this.macType = 6;
    this.ipType = 4;
    this.macLength = 6;
    this.ipLength = 4;
  }

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

  toString() {
    return this.operation == ARP_REQUEST ? "ARP request" : "ARP reply";
  }

  isRequest() {
    return this.operation.decimal == ARP_REQUEST;
  }

  isReply() {
    return this.operation.decimal == ARP_REPLY;
  }
}
