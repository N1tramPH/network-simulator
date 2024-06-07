import DataUnit from "../../DataUnit";
import { tcpSegmentStruct } from "../../../../utils/dataStructures";
import { hasFlags, setFlags as getBitmap } from "../../../../utils/utils";

const FLAGS_COUNT = 6;
const flagStartIndex = 106;

export default class TcpSegment extends DataUnit {
  constructor(data) {
    super(data, tcpSegmentStruct);
    this.optional = null;
    this.headerLength = 5;
  }

  toString() {
    return "TCP segment";
  }

  /**
   * Sets a a given flag
   * @param {*} flag
   */
  setFlags(...flags) {
    this.header.setBits(getBitmap(0, ...flags), flagStartIndex, FLAGS_COUNT);
  }

  /**
   *
   * @param {*} decimal Indicates if the result is to be returned as a ByteArray or a decimal number
   * @returns ByteArray or a decimal number representing TCP flags
   */
  getFlags(decimal = true) {
    return decimal
      ? this.header.getBits(flagStartIndex, 6).decimal
      : this.header.getBits(flagStartIndex, 6);
  }

  /**
   * Returns if all passed flags are set
   * @param {Boolean} strict If the set flags must match strictly
   * @param {*} flags Flags to be checked
   */
  hasFlags(strict = true, ...flags) {
    return hasFlags(this.getFlags(), strict, flags);
  }
}
