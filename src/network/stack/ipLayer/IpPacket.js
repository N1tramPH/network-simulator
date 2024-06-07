import DataUnit from "../DataUnit";
import { ipPacketStruct } from "../../../utils/dataStructures";

const DEFAULT_TTL = 64;

/**
 * IPv4 packet structure
 */
export default class IpPacket extends DataUnit {
  constructor(data) {
    super(data, ipPacketStruct);
    this.optional = null;

    // IP version is fixed in init
    this.header.setBits(4, 0, 4);

    this.timeToLive = DEFAULT_TTL;
    this.headerLength = 5;
  }

  toString() {
    return "IP packet";
  }

  decrementTTL(count = 1) {
    this.timeToLive = this.timeToLive.decimal - count;
  }

  getCRC() {
    const header = this.header.slice();

    // Clear out of any previous value
    this.headerChecksum = 0;

    const view = new DataView(this.header.buffer, 0);
    let count = header.byteLength;
    let sum = 0;
    let i = 0;

    while (count > 1) {
      sum += view.getUint16(i);
      count -= 2;
      i++;
    }

    // Add a remaning byte is any (only if optional data is present)
    if (count > 0) {
      sum += view.getUint16(i);
    }

    // Deal with an overflown
    while (sum >>> 16) {
      sum = (sum & 0xffff) + (sum >> 16);
    }

    this.header = header; // Set the header data of before computatation
    return ~sum & 0xffff; // Limit the inverted crc size to 16 bits
  }

  /**
   * https://datatracker.ietf.org/doc/html/rfc1071
   * @returns A computed CRC of an IP header
   */
  computeCRC() {
    this.headerChecksum = this.getCRC();
  }

  checkCRC() {
    return this.getCRC() === this.headerChecksum.decimal;
  }

  /**
   * Computes and sets a total length of the IP packet (IP header + data)
   */
  computeTotalLength() {
    this.totalLength = this.dataBytes + this.header.byteLength;
  }
}
