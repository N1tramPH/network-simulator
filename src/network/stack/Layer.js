import DataUnit from "./DataUnit";

/**
 * Abstract class for network layers. Each network layer should extend this class.
 */
export default class Layer {
  /**
   * Creates a new layer instance.
   * @param {NetworkStack} stack - The network stack instance.
   */
  constructor(stack) {
    this.stack = stack;
    this.dataUnit = DataUnit;
  }

  /**
   * Returns the lower layer instance.
   * @return {Layer} The lower layer instance.
   */
  get lower() {
    return this.stack.lowerLayer(this);
  }

  /**
   * Returns the upper layer instance.
   * @return {Layer} The upper layer instance.
   */
  get upper() {
    return this.stack.upperLayer(this);
  }

  /**
   * Returns a string representation of the layer.
   * @return {string} The string representation of the layer.
   */
  toString() {
    return this.constructor.name;
  }

  /**
   * Returns a dataUnit of a given network layer.
   * Does not modify the original packet structure,
   * only traverses and returns a matching DataUnit.
   *
   * @param {Packet} packet - The packet to extract the data unit from.
   * @return {DataUnit|null} The data unit of the given network layer,
   * or null if no matching data unit is found.
   */
  decapsulate(packet) {
    return packet.getUnit(this.dataUnit);
  }

  /**
   * Encapsulates the data of a packet into a new DataUnit instance (modifies the data property of the packet).
   * This method should be overridden in each network layer class.
   * It will typically perform any necessary modifications to the packet's data.
   * For example, it may add headers, perform error checking, or perform other operations specific to the layer.
   * The returned DataUnit is used by the network layer to represent the packet's data.
   *
   * @param {Packet} packet - The packet to encapsulate.
   *   The packet's data will be modified by creating a new DataUnit instance.
   * @return {DataUnit} A new DataUnit instance wrapping the packet's data.
   */
  encapsulate(packet) {
    // Create a new DataUnit instance with the packet's data.
    // The DataUnit instance will be specific to the network layer.
    packet.data = new this.dataUnit(packet.data);

    // Return the newly created DataUnit.
    return packet.data;
  }

  /**
   * Processes the data from the upper layer and encapsulates it before
   * passing it down to the lower layer.
   *
   * @param {Packet} packet - The packet received from the upper layer.
   */
  acceptFromUpper(packet) {
    // Encapsulate the packet data before passing it down.
    // This involves creating a new DataUnit instance with the packet's data.
    this.encapsulate(packet);

    // Pass the packet down to the lower layer.
    this.sendToLower(packet);
  }

  /**
   * Processes the data from the lower layer accordingly and passes to upper layer
   *
   * @param {Packet} packet - The packet received from the lower layer.
   */
  acceptFromLower(packet) {
    // Forward the packet to the upper layer.
    this.sendToUpper(packet);
  }

  /**
   * An interface for passing a Packet to a lower layer.
   * @param {Packet} packet - The packet to be passed to the lower layer.
   */
  sendToLower(packet) {
    // Pass the packet to the lower layer.
    this.lower.acceptFromUpper(packet);
  }

  /**
   * An interface for passing a Packet to an upper layer.
   *
   * @param {Packet} packet - The packet to be passed to the upper layer.
   */
  sendToUpper(packet) {
    // Pass the packet to the upper layer.
    this.upper.acceptFromLower(packet);
  }
}
