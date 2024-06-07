import DataUnit from "./DataUnit";

export default class Layer {
  constructor(stack) {
    this.stack = stack;
    this.dataUnit = DataUnit;
  }

  get lower() {
    return this.stack.lowerLayer(this);
  }

  get upper() {
    return this.stack.upperLayer(this);
  }

  toString() {
    return this.constructor.name;
  }

  /**
   * Returns a dataUnit of a given network layer.
   * Does not modify the original packet structure,
   * only traverses and returns a matching DataUnit.
   * @param {DataUnit} data
   */
  decapsulate(packet) {
    return packet.getUnit(this.dataUnit);
  }

  /**
   * Encapsulates a packet's data into a given DataUnit instance.
   * Modifies a provided packet.
   * @param {Packet} packet A Packet structure
   * @returns {DataUnit} A DataUnit of a given network layer wrapping packet's data
   */
  encapsulate(packet) {
    packet.data = new this.dataUnit(packet.data);

    // To be defined in each layer separately
    return packet.data;
  }

  /**
   * Processes the data from the upper layer accordingly and passes to lower layer
   * @param {Packet} packet
   */
  acceptFromUpper(packet) {
    this.encapsulate(packet);
    this.sendToLower(packet);
  }

  /**
   * Processes the data from the lower layer accordingly and passes to upper layer
   * @param {Packet} packet
   */
  acceptFromLower(packet) {
    return this.sendToUpper(packet);
  }

  /**
   * An interface for passing Packet to a lower layer
   * @param {Packet} data
   */
  sendToLower(packet) {
    return this.lower.acceptFromUpper(packet);
  }

  /**
   * An interface for passing Packet to an upper layer
   * @param {Packet} packet
   */
  sendToUpper(packet) {
    this.upper.acceptFromLower(packet);
  }
}
