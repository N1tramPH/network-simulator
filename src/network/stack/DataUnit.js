import ByteArray from "../../utils/structures/ByteArray";

/**
 * An "abstract" class for data units like IP packets, TCP, UDP datagrams, link frames.
 * A DataUnit is defined by data, header, and its structure (defined in dataStructure.js).
 * A header is a ByteArray of given size and structure (meanings)
 */
export default class DataUnit {
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
          get() {
            return this.header.getBits(prop.bitStart, prop.bitCount);
          },
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
   *
   * @returns A new instance with a shallow copy of header (data and the rest is kept)
   */
  copy() {
    const copy = new this.constructor(this.data);
    copy.header = this.header.slice(); // Make a copy the header
    return copy;
  }

  toString() {
    return "DataUnit";
  }
}
