import ByteArray from "../../utils/structures/ByteArray";

/**
 * An "abstract" class for data units like IP packets, TCP, UDP datagrams, link frames.
 * A DataUnit is defined by data, header, and its structure (defined in dataStructure.js).
 * A header is a ByteArray of given size and structure (meanings).
 */
export default class DataUnit {
  /**
   * @param {Object} data - The data payload
   * @param {Object} structure - The structure of the data unit
   */
  constructor(data = null, structure = {}) {
    this.data = data;
    this.header = new ByteArray(structure.headerByteLength);
    this.struct = structure;

    // Set the properties's setters, getters based on
    // a structure defined externally
    structure.items.forEach((prop) => {
      // If the prop item isn't of special types (upper data, optionals)
      if (!prop.special) {
        Object.defineProperty(this, prop.propName, {
          /**
           * Getter for the property
           * @returns {number} - The value of the property
           */
          get() {
            return this.header.getBits(prop.bitStart, prop.bitCount);
          },
          /**
           * Setter for the property
           * @param {number} bits - The value to set
           */
          set(bits) {
            this.header.setBits(bits, prop.bitStart, prop.bitCount);
          },
          configurable: true,
          // Needed during copy to be picked up
          // in Object.keys()
          enumerable: true,
        });
      }
    });
  }

  /**
   * Returns a size in bytes computed from a header size with a recursively computed size of the data (which may contain other DataUnits)
   * @returns {number} - The size of the data unit in bytes
   */
  get dataBytes() {
    let total = 0;
    const data = this.data;
    if (data) {
      if (data instanceof DataUnit) {
        total += data.dataBytes + data.struct.headerByteLength;
      } else if (typeof this.data === "number") {
        total += this.data;
      }
    }

    return total;
  }

  /**
   * Returns a shallow copy of the data unit with a new header
   * @returns {DataUnit} - The copied data unit
   */
  copy() {
    const copy = new this.constructor(this.data);
    copy.header = this.header.slice(); // Make a copy of the header
    return copy;
  }

  /**
   * Returns a string representation of the data unit
   * @returns {string} - The string representation
   */
  toString() {
    return "DataUnit";
  }
}
