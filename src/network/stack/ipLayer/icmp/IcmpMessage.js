import DataUnit from "../../DataUnit";
import { icmpMessageStruct } from "../../../../utils/dataStructures";
import { IcmpType } from "../../../../utils/constants";
import { nanoid } from "nanoid";

/**
 * IPv4 packet structure
 */
export default class IcmpMessage extends DataUnit {
  constructor(data) {
    super(data, icmpMessageStruct);
    // 4 bytes from upper (transport) layer on responses (16bits identifier + 16bits sequence number)
    // Instead of an identifier, it could be a timestamp of transmission
    this.data = data;
    this.optional = null;
    this.id = nanoid(5); // To identify packets on ping etc.
  }

  // Ping messages
  static echoRequest() {
    const message = new IcmpMessage();
    message.type = IcmpType.echoRequest;

    return message;
  }

  static echoReply() {
    const message = new IcmpMessage();
    message.type = IcmpType.echoReply;

    return message;
  }

  static timeExceeded() {
    const message = new IcmpMessage();
    message.type = IcmpType.timeExceeded;

    return message;
  }

  static dstUnreachable() {
    const message = new IcmpMessage();
    message.type = IcmpType.dstUnreachable;

    return message;
  }

  getCRC() {
    const header = this.header.slice();

    // Clear out of any previous value
    this.checksum = 0;

    const view = new DataView(this.header.buffer, 0);
    let count = header.byteLength;
    let sum = 0;
    let i = 0;

    while (count > 1) {
      sum += view.getUint16(i);
      count -= 2;
      i++;
    }

    // Add a remaining byte is any (only if optional data is present)
    if (count > 0) {
      sum += view.getUint16(i);
    }

    // Deal with an overflown
    while (sum >>> 16) {
      sum = (sum & 0xffff) + (sum >> 16);
    }

    this.header = header; // Set the header data of before computation
    return ~sum & 0xffff; // Limit the inverted crc size to 16 bits
  }

  computeCRC() {
    this.checksum = this.getCRC();
  }

  checkCRC() {
    return this.getCRC() === this.checksum.decimal;
  }

  toString() {
    return "ICMP message";
  }
}
