import { random } from "lodash";

/**
 * Simulates the data from the application layer
 */
export default class Data {
  /**
   * @param {*} size Size in bytes
   */
  constructor(size = 10000) {
    this.size = size;

    this.minChunkSize = 100;
    this.maxChunkSize = 1500;
  }

  _randomChunk() {
    return random(this.minChunkSize, this.maxChunkSize);
  }

  set(size) {
    this.size = size;
  }

  /**
   * Removes and returns a specified number of "bytes" (chunk) from data
   * When chunkSize is not specified, random number of bytes is returned
   * until data is empty
   * @returns
   *
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

  push(chunkSize) {
    this.size += chunkSize;
  }
}
