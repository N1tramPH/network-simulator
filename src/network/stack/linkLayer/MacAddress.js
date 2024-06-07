import { random } from "lodash-es";
import { getRandomBytes } from "../../../utils/utils";
import Address from "../Address";

const BYTES_LENGTH = 6;

/**
 * Converts a string MAC address of 6 bytes in hex
 * separated by either ':' or '-'
 * @param {String} stringMacAddress
 * @returns An array of bytes representing a valid parsed string MAC address, otherwise null
 */
function parseString(string) {
  try {
    const address = string.split(/[:-]/).map((byte) => parseInt(byte, 16));

    // Ensure the resulting array has 6 bytes, pads by 0s if address.length < BYTES_LENGTH
    if (address.length < BYTES_LENGTH) {
      for (let i = 0; i < BYTES_LENGTH - address.length; i++) {
        address.push(0);
      }
    }

    return address && address.length == BYTES_LENGTH ? address : null;
  } catch (e) {
    return null;
  }
}

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
   * @param {*} address
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
   * @returns A random macAddress
   */
  static random() {
    const macBytes = [255, 255, 255]; // Set the first 3 bytes statically
    macBytes.push(...getRandomBytes(3));
    const mac = new MacAddress(macBytes);

    return mac;
  }

  compare(other) {
    return isBroadcast(other) || isBroadcast(this) || super.compare(other);
  }

  /**
   * @param {*} delim separator between each each byte
   * @returns A readable string of an MAC address in
   * a generic format e.g 00:1b:63:84:45:e6
   */
  toString(delim = ":") {
    return super.toString(16, delim, 2, "0");
  }
}
