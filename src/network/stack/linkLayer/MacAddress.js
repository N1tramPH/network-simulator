import ByteArray from "../../../utils/structures/ByteArray";
import { getRandomBytes } from "../../../utils/utils";
import Address from "../Address";

// The number of bytes in a MAC address
const BYTES_LENGTH = 6;

/**
 * Parses a string MAC address of 6 bytes in hex
 * separated by either ':' or '-'
 * @param {string} string - The string MAC address
 * @returns An array of bytes representing a valid parsed string MAC address, otherwise null
 */
function parseString(string) {
  try {
    // Split the string into an array of bytes
    const address = string.split(/[:-]/).map((byte) => parseInt(byte, 16));

    // Ensure the resulting array has 6 bytes, pads by 0s if address.length < BYTES_LENGTH
    if (address.length < BYTES_LENGTH) {
      for (let i = 0; i < BYTES_LENGTH - address.length; i++) {
        address.push(0);
      }
    }

    // Return the address if it is valid, otherwise null
    return address && address.length == BYTES_LENGTH ? address : null;
  } catch (e) {
    return null;
  }
}

/**
 * Checks if a given MAC address is a broadcast address
 * @param {Array<number>} address - The MAC address to check
 * @returns True if the MAC address is a broadcast address, false otherwise
 */
export function isBroadcast(address) {
  return address.every((byte) => byte == 255);
}

/**
 * An extension of ByteArray specifying additional methods, properties for MAC addresses
 */
export default class MacAddress extends Address {
  /**
   * Creates an instance of MAC address
   * When null is accepted, a random MAC is generated
   * otherwise takes:
   *  - iterable of 6 bytes
   *  - string of bytes separated by ':' or '-'
   * @param {Array|ByteArray|string} address - The MAC address to create
   * @throws {EvalError} - If the MAC address format is invalid
   */
  constructor(address = null) {
    if (!address) {
      throw new EvalError("Invalid MAC address format!");
    }

    if (typeof address === "string") {
      address = parseString(address);

      if (!address) {
        throw new EvalError("Invalid MAC address format!");
      }
    }
    super(address);
  }

  /**
   * @returns A MAC broadcast address
   */
  static broadcast() {
    return new MacAddress("ff:ff:ff:ff:ff:ff");
  }

  /**
   * Generates a random MAC address
   * @returns A random MAC address
   */
  static random() {
    const macBytes = [255, 255, 255]; // Set the first 3 bytes statically
    macBytes.push(...getRandomBytes(3));
    const mac = new MacAddress(macBytes);

    return mac;
  }

  /**
   * Compares this MAC address with another MAC address
   * @param {MacAddress} other - The MAC address to compare with
   * @returns True if this MAC address is a broadcast address or if the other MAC address is a broadcast address,
   * or if the two MAC addresses are equal, false otherwise
   */
  compare(other) {
    return isBroadcast(other) || isBroadcast(this) || super.compare(other);
  }

  /**
   * @param {*} delim - The separator between each byte
   * @returns A readable string of this MAC address in a generic format such as 00:1b:63:84:45:e6
   */
  toString(delim = ":") {
    return super.toString(16, delim, 2, "0");
  }
}
