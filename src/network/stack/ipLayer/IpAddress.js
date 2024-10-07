import { areBytes, countLeadingOnes } from "../../../utils/utils";

import ByteArray from "../../../utils/structures/ByteArray";
import Address from "../Address";

/**
 * Parses an IP address string and returns the address and netmask length.
 *
 * @param {string} string - The IP address string in the format '192.168.1.1/24'.
 * @returns {Array<Array<number>, number>} - The address as an array of bytes and the netmask length.
 * @throws {EvalError} - If the netmask length is invalid.
 * @throws {EvalError} - If the IP address has an invalid number of bytes.
 * @throws {EvalError} - If the bytes are not in the range 0-255.
 */
function parseString(string) {
  // Check for the CIDR mask mask
  const [addressStr, netmaskLengthStr] = string.split("/");
  const address = addressStr.split(/[.]/).map((e) => parseInt(e));
  let netmaskLength = 32;

  // Process a netmask length if there's any
  if (netmaskLengthStr) {
    // If the mask is invalid, keep the default mask length of 32
    const length = parseInt(netmaskLengthStr);

    if (!(length >= 0 && length <= 32)) {
      throw new EvalError("Netmask length must range between 0-32!");
    }

    netmaskLength = length;
  }

  if (address.length !== 4) {
    throw new EvalError("An IP address must consist of 4 bytes!");
  }

  if (!areBytes(address)) {
    throw new EvalError("Bytes must range in 0-255!");
  }

  return [address, netmaskLength];
}

/**
 * Represents an IP address.
 */
export default class IpAddress extends Address {
  /**
   * Creates an IP address object.
   *
   * @param {string|Array<number>|IpAddress|null} input - The IP address string,
   * an array of bytes, or another IpAddress object. If null or undefined, a wildcard IP address is created.
   */
  constructor(input = null) {
    let address;
    let netmaskLength = 32;

    // Parsing an address from a string
    if (!input) {
      // When invalid input is given
      // a wildcard IP address is created (0.0.0.0/0)
      address = new Array(4).fill(0);
      netmaskLength = 0;
    } else if (typeof input === "string") {
      [address, netmaskLength] = parseString(input);
    } else if (input instanceof IpAddress) {
      address = input;
      netmaskLength = input.netmaskLength;
    } else {
      address = input;
    }

    super(address, false);
    this._netmaskLength = netmaskLength;
  }

  /**
   * Returns the broadcast IP address.
   *
   * @returns {IpAddress} - The broadcast IP address.
   */
  static getBroadcastAddress() {
    return new IpAddress("255.255.255.255");
  }

  /**
   * Validates an IP address string.
   *
   * @param {string} ipAddress - The IP address string.
   * @returns {Array<Array<number>, number>|false} - The parsed address and netmask length, or false if invalid.
   */
  static validate(ipAddress) {
    try {
      return parseString(ipAddress);
    } catch (e) {
      return false;
    }
  }

  /**
   * Sets the netmask length.
   *
   * @param {number|IpAddress} value - The netmask length or an IpAddress object.
   * @throws {Error} - If the netmask length is invalid.
   */
  set netmaskLength(value) {
    if (value instanceof IpAddress) {
      this._netmaskLength = countLeadingOnes(value);
    } else {
      const length = parseInt(value);

      if (length < 0 || length > 32) {
        throw new Error("Netmask length must range between 0-32!");
      }

      this._netmaskLength = length;
    }
  }

  /**
   * Gets the netmask length.
   *
   * @returns {number} - The netmask length.
   */
  get netmaskLength() {
    return this._netmaskLength;
  }

  /**
   * Returns the netmask as a ByteArray.
   *
   * @returns {ByteArray} - The netmask as a ByteArray.
   */
  get netmask() {
    return new ByteArray(4).setOnes(32 - this._netmaskLength, 32, true);
  }

  /**
   * Returns the network address with the netmask applied.
   *
   * @returns {IpAddress} - The network address with the netmask applied.
   */
  get netAddress() {
    const netAddress = new IpAddress(this.applyMask(this.netmask));
    netAddress.netmaskLength = this.netmaskLength;
    return netAddress;
  }

  /**
   * Checks if the IP address is the wildcard address.
   *
   * @returns {boolean} - True if the IP address is the wildcard address.
   */
  isUnspecified() {
    return this.every((byte) => byte === 0) && this.netmaskLength === 0;
  }

  /**
   * Applies the netmask to the IP address.
   *
   * @param {ByteArray} mask - The netmask as a ByteArray.
   * @returns {Array<number>} - The IP address with the netmask applied.
   */
  applyMask(mask) {
    return this.map((byte, i) => byte & mask[i]);
  }

  /**
   * Compares the IP addresses with their network mask applied.
   *
   * @param {IpAddress} other - The other IP address to compare with.
   * @param {IpAddress} [mask=null] - A mask to be applied. Defaults to null.
   * @returns {boolean} - True if the IP addresses with the netmask applied match.
   */
  compare(other, mask = null) {
    other = new IpAddress(other); // Ensure the other is of the same instance

    if (mask) {
      // Compare the addresses with mask applied on
      const masked1 = this.applyMask(mask);
      const masked2 = other.applyMask(mask);

      return masked1.every((byte, i) => byte === masked2[i]);
    }

    return super.compare(other);
  }

  /**
   * Returns the IP address as a string.
   *
   * @param {boolean} [cidr=true] - Whether to include the CIDR notation or not. Defaults to true.
   * @returns {string} - The IP address as a string.
   */
  toString(cidr = true) {
    const addr = super.toString(10, ".", 0);

    return cidr ? addr + "/" + this._netmaskLength : addr;
  }
}

// A special address used in:
// - generic socket IP address
//  -> any dst IP is will match
// - generic routing IP address if no matches, this one will apply
export const WILDCARD_IP = new IpAddress("0.0.0.0/0");
