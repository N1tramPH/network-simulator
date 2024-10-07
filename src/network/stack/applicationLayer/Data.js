import { random } from "lodash";

/**
 * Simulates the data from the application layer
 */
export default class Data {
  /**
   * @param {number} [size=10000] Size in bytes
   */
  constructor(size = 10000) {
    /**
     * Current size of the data
     * @type {number}
     */
    this.size = size;

    /**
     * Minimum size of a chunk in bytes
     * @type {number}
     */
    this.minChunkSize = 100;

    /**
     * Maximum size of a chunk in bytes
     * @type {number}
     */
    this.maxChunkSize = 1500;
  }

  /**
   * Returns a random size of a chunk in bytes
   * @returns {number}
   * @private
   */
  _randomChunk() {
    return random(this.minChunkSize, this.maxChunkSize);
  }

  /**
   * Sets the size of the data
   * @param {number} size
   */
  set(size) {
    this.size = size;
  }

  /**
   * Removes and returns a specified number of "bytes" (chunk) from data
   * When chunkSize is not specified, a random number of bytes is returned
   * until data is empty
   * @param {number} [chunkSize=null]
   * @returns {number}
   */
  pop(chunkSize = null) {
    chunkSize = !chunkSize ? this._randomChunk() : chunkSize;
    if (chunkSize > this.size) {
      chunkSize = this.size;
      this.size = 0;
    } else {
      this.size -= chunkSize;
    }

    return chunkSize;
  }

  /**
   * Adds a specified number of "bytes" (chunk) to the data
   * @param {number} chunkSize
   */
  push(chunkSize) {
    this.size += chunkSize;
  }
}
