import DataUnit from "../DataUnit";
import { ipPacketStruct } from "../../../utils/dataStructures";

const DEFAULT_TTL = 64;

/**
 * IPv4 packet structure
 */
export default class IpPacket extends DataUnit {
  /**
   * @param {ArrayBuffer} data The raw data of the IP packet
   */
  constructor(data) {
    super(data, ipPacketStruct);
    this.optional = null;

    // IP version is fixed in init
    this.header.setBits(4, 0, 4);

    this.timeToLive = DEFAULT_TTL;
    this.headerLength = 5;
  }

  /**
   * Returns a string representation of the IP packet
   * @returns {string} The string representation of the IP packet
   */
  toString() {
    return "IP packet";
  }

  /**
   * Decrements the Time To Live (TTL) value of the IP packet
   * @param {number} [count=1] The amount to decrement the TTL by
   */
  decrementTTL(count = 1) {
    this.timeToLive = this.timeToLive.decimal - count;
  }

  /**
   * Computes and returns the CRC (Cyclic Redundancy Check) of the IP packet header
   * @returns {number} The computed CRC of the IP packet header
   */
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

    // Add a remaining byte if any (only if optional data is present)
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

  /**
   * Computes and sets the CRC of the IP packet header
   */
  computeCRC() {
    this.headerChecksum = this.getCRC();
  }

  /**
   * Checks if the computed CRC of the IP packet header matches the stored CRC
   * @returns {boolean} Whether the computed CRC matches the stored CRC
   */
  checkCRC() {
    return this.getCRC() === this.headerChecksum.decimal;
  }

  /**
   * Computes and sets the total length of the IP packet (header + data)
   */
  computeTotalLength() {
    this.totalLength = this.dataBytes + this.header.byteLength;
  }
}
