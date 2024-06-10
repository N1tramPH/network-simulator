import { areBytes, countLeadingOnes } from "../../../utils/utils";

import ByteArray from "../../../utils/structures/ByteArray";
import Address from "../Address";

/**
 * Returns an array of IP address bytes and netmask length
 * - netmask length defaults to 32, if no CIDR is given
 * @param {*} string
 */
function parseString(string) {
  // Check for the CIDR mask mask
  const maskSplit = string.split("/");
  const address = maskSplit[0].split(/[.]/).map((e) => parseInt(e));
  let netmaskLength = 32;

  // Process a netmask length if there's any
  if (maskSplit.length > 1) {
    // If the mask is invalid, keep the default mask length of 32
    const length = parseInt(maskSplit[1]);

    if (!(length >= 0 && length <= 32)) {
      throw new EvalError("Netmask length must range between 0-32!");
    }

    netmaskLength = length;
  }

  if (address.length != 4) {
    throw new EvalError("An IP address must consist of 4 bytes!");
  }

  if (!areBytes(address)) {
    throw new EvalError("Bytes must range in 0-255!");
  }

  return [address, netmaskLength];
}

export default class IpAddress extends Address {
  /**
   * Defines an object for an IP address.
   * @param {*} address An iterable of 4 bytes or
   * a string in a standard format as '192.168.1.1'
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
   * @returns An IP broadcast address
   */
  static getBroadcastAddress() {
    return new IpAddress("255.255.255.255");
  }

  static validate(ipAddress) {
    try {
      const str = parseString(ipAddress);
      return str;
    } catch (e) {
      return false;
    }
  }

  set netmaskLength(value) {
    if (value instanceof IpAddress) {
      this._netmaskLength = countLeadingOnes(value);
    } else {
      const length = parseInt(value);

      if (length >= 0 || length <= 32) {
        this._netmaskLength = length;
      } else {
        throw new Error();
      }
    }
  }

  get netmaskLength() {
    return this._netmaskLength;
  }

  /**
   * Returns a netmask as a ByteArray
   */
  get netmask() {
    return new ByteArray(4).setOnes(32 - this._netmaskLength, 32, true);
  }

  /**
   * Returns an network address (having a netmask applied on)
   */
  get netAddress() {
    const netAddress = new IpAddress(this.applyMask(this.netmask));
    netAddress.netmaskLength = this.netmaskLength;
    return netAddress;
  }

  /**
   * @returns If the IP address is "0.0.0.0/0"
   */
  isUnspecified() {
    return this.every((byte) => byte == 0) && this.netmaskLength == 0;
  }

  /**
   * @param {Number} length Length of a subnet mask
   * @returns an instance of an IP address
   * that represents a subnet mask
   */
  applyMask(mask) {
    return this.map((byte, i) => byte & mask[i]);
  }

  /**
   * Overriden compare method, allowing to compare
   * IP addresses with their network mask applied on (netAddress)
   * @param {IpAddress} other Other IP address
   * @param {Boolean} applyMask Boolean indicating whether to apply mask or not, defaults to false
   * @returns whether IP addresses with their netmask applied match
   */
  compare(other, mask = null) {
    other = new IpAddress(other); // Ensure the other is of the same instance

    if (mask) {
      // Compare the addresses with mask applied on
      const masked1 = this.applyMask(mask);
      const masked2 = other.applyMask(mask);

      return masked1.every((byte, i) => {
        return byte == masked2[i];
      });
    }

    return super.compare(other);
  }

  /**
   *
   * @param {Number} cidr Whether to return a string in CIDR or not
   * @returns
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
