import { udpSegmentStruct } from "../../../../utils/dataStructures";
import DataUnit from "../../DataUnit";

export default class UdpDatagram extends DataUnit {
  constructor(data) {
    super(data, udpSegmentStruct);
    this.optional = null;
  }

  toString() {
    return "UDP datagram";
  }
}
