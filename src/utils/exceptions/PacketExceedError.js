import Packet from "../../network/Packet";

export default class PacketExceedError extends Error {
  /**
   * An exception to throw when the root packets has unexpectedly too many children.
   * @param {String} message A message to throw along with
   * @param {Packet} packet A packet associated with the Error
   */
  constructor(message = null, packet = null) {
    super(message);
    this.name = this.constructor.name;
    this.message = message
      ? message
      : "The packet count has exceeded.\nLikely due to the cyclic network topology.";
    this.packet = packet;

    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(message).stack;
    }
  }
}
