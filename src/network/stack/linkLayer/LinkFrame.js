import { linkFrameStruct } from "../../../utils/dataStructures";
import DataUnit from "../DataUnit";

export default class LinkFrame extends DataUnit {
  // Ethernet II type is represented here
  constructor(data) {
    super(data, linkFrameStruct);
    // this.trailer = null; // For simplicity, CRC is within a header
  }

  toString() {
    return "Link Frame";
  }

  /**
   * Sets and returns a checksum value
   * based on the frame data
   */
  computeCRC() {
    // TO BE IMPLEMENTED
    return 5123;
  }

  /**
   * @returns Whether the checksum now computed
   * from the data match with previously set checksum value
   */
  validateCRC() {
    return this.computeCRC() == this.checksum.decimal;
  }
}
