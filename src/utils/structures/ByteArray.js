import { byteArrayToDecimal } from "../utils";
import { isEqual } from "lodash-es";

const BYTE_SIZE = 8;

function numToByteArray(number) {
  // Work with a number as unsigned
  const res = [];

  while (number) {
    res.unshift(0x00 | number);

    number = number >>> 8; // Unsigned shift
  }
  return new ByteArray(res);
}

function byteOffset(bitIndex) {
  return Math.floor(bitIndex / BYTE_SIZE);
}

function bitOffset(bitIndex) {
  return bitIndex % BYTE_SIZE;
}

export default class ByteArray extends Uint8Array {
  /**
   * Defines an extended class over Uint8Array with additional
   * methods for manipulating specific bits in the byte sequence.
   * Individual bytes are stored in the little-endian order.
   * @param {Number, Iterable} numOrIterable An unsigned Number or Iterable object of Number.
   * @param {Boolean} numAsBytes To indicate if the first parameter is to be interpreted as number of bytes or byte sequence.
   */
  constructor(numOrIterable, numAsBytes = false) {
    super(numAsBytes ? numToByteArray(numOrIterable) : numOrIterable);
  }

  get decimal() {
    return byteArrayToDecimal(this);
  }

  toString(radix = 2, delim = " ", padCount = BYTE_SIZE, padChar = "0") {
    return [...this]
      .map((byte) => byte.toString(radix).padStart(padCount, padChar))
      .join(delim);
  }

  /**
   *
   * @param {ByteArray} other
   * @returns
   */
  compare(other) {
    if (typeof other === "number") {
      return other == byteArrayToDecimal(this);
    }
    return isEqual(this, other);
  }

  /**
   * Sets a bit on given index to 0
   * @param {Number} bitIndex
   */
  removeBit(bitIndex) {
    const mask = ~(1 << bitOffset(bitIndex));
    const byteIndex = this.byteLength - byteOffset(bitIndex) - 1;
    this[byteIndex] &= mask;
  }

  /**
   * Sets a bit on given index to 1
   * @param {Number} bitIndex
   */
  addBit(bitIndex) {
    const mask = 1 << bitOffset(bitIndex);
    const byteIndex = this.byteLength - byteOffset(bitIndex) - 1;
    this[byteIndex] |= mask;
  }

  /**
   * Sets a bit on given index to 1 if value is truthy, else 0
   * @param {Number} bitIndex
   * @param {Number} bitValue
   */
  setBit(bitIndex, bitValue) {
    if (bitIndex > this.size * BYTE_SIZE) {
      throw new RangeError("The bit set is out of ByteArray's range!");
    }

    // If the value is not falsy, add a bit on given index
    if (bitValue) {
      this.addBit(bitIndex);
    } else {
      this.removeBit(bitIndex);
    }

    return this;
  }

  /**
   * @param {Number} bitIndex
   * @returns A bit in on given index
   */
  getBit(bitIndex) {
    if (bitIndex > this.byteLength * BYTE_SIZE || bitIndex < 0) {
      return 0;
    }

    const mask = 1 << bitOffset(bitIndex);
    const byte = this[this.byteLength - byteOffset(bitIndex) - 1];
    return (byte & mask) != 0 ? 1 : 0;
  }

  /**
   * Sets given bits into a given range of bits in the ByteArray
   * Bits can be a Number, Array[Number] as they get converted to ByteArray
   * internally
   * @param {Number | ByteArray | Array[Number] | Uint8Array} bits
   * @param {Number} bitStart starting index from which bits are to be set
   * @param {Number} bitIndex ending index to which bits are to be set
   */
  setBits(bits, bitStart, bitCount) {
    // Convert an array of number or a number itself to a ByteArray
    // So we can work with it the same way
    if (typeof bits === "number") {
      bits = new ByteArray(bits, true);
    } else if (!(bits instanceof ByteArray)) {
      bits = new ByteArray(bits);
    }

    for (let i = 0; i < bitCount; i++) {
      this.setBit(bitStart + i, bits.getBit(i));
    }

    return this;
  }

  setOnes(bitStart, bitCount) {
    for (let i = 0; i < bitCount; i++) {
      this.setBit(bitStart + i, 1);
    }

    return this;
  }

  setZeros(bitStart, bitCount) {
    for (let i = 0; i < bitCount; i++) {
      this.setBit(bitStart + i, 0);
    }

    return this;
  }

  /**
   * @param {Number} bitStart Starting bit index (inclusive)
   * @param {Number} bitCount Ending bit index (exclusive)
   * @returns A new ByteArray with corresponding bit sequence
   */
  getBits(bitStart, bitCount) {
    const arr = [];
    let temp = 0;
    let counter = 0;

    // Iterating from higher bits to get the array in the same order
    // (pushing lower bits to the right)
    for (let i = bitStart; i < bitStart + bitCount; i++) {
      temp |= this.getBit(i) << counter;
      counter++;

      if (counter == BYTE_SIZE) {
        arr.unshift(temp);
        counter = 0;
        temp = 0;
      }
    }

    // Set the remaining byte
    if (counter != 0) {
      arr.push(temp);
    }
    // If the whole sequence was 0, set 0
    if (arr.length == 0) {
      arr.push(0);
    }

    return new this.constructor(arr);
  }

  setByte(byteIndex, value) {
    this[this.byteLength - 1 - byteIndex] = value;

    return this;
  }

  /**
   * Sets the source bytes on given range of byte indices
   * if the source has less bytes than the range,
   * the remaining bytes is set to 0's
   * @param {Number | ByteArray | Array[Number] | Uint8Array} bytes
   * @param {Number} byteStart
   * @param {Number} byteEnd
   */
  setByteRange(bytes, byteStart, byteEnd = null) {
    if (typeof bytes === "number") {
      bytes = new ByteArray(bytes, true);
    } else if (!(bytes instanceof ByteArray)) {
      bytes = new ByteArray(bytes);
    }

    if (!byteEnd) {
      byteEnd = this.byteLength;
    }

    for (let i = 0; i < byteEnd - byteStart; i++) {
      if (bytes.length < i) {
        this[byteStart + i] = 0;
      } else {
        this[byteStart + i] = bytes[i];
      }
    }

    return this;
  }

  /**
   * @param {*} byteIndex index of a byte to be returned
   * @returns {Number} a byte on given index
   */
  getByte(byteIndex) {
    if (byteIndex > this.byteSize) {
      throw new RangeError("ByteIndex cannot exceed byteSize!");
    }

    return this[this.byteLength - 1 - byteIndex];
  }

  hasBits(...bits) {
    return bits.every((bit) => {
      return this.getBit(bit);
    });
  }

  /**
   * Returns an array of bytes on given range of indexes
   * @param {*} startByteIndex
   * @param {*} endByteIndex
   * @returns
   */
  toArray(startByteIndex = null, endByteIndex = null) {
    if (!startByteIndex) {
      startByteIndex = 0;
    }
    if (!endByteIndex) {
      endByteIndex = this.byteSize;
    }

    if (startByteIndex > endByteIndex) {
      throw new RangeError("startByteIndex must be < endByteIndex");
    }

    return [...this.slice(startByteIndex, endByteIndex)];
  }
}
