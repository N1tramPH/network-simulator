import { comparePorts, parsePort } from "../../../utils/utils";
import IpAddress from "../ipLayer/IpAddress";

/**
 * Represents the IP address and port of a socket
 */
export default class SocketAddress {
  /**
   * Creates a new instance of a SocketAddress
   * @constructor
   * @param {String|IpAddress} ip The IP address of the socket
   * @param {Number|String} port The port of the socket
   */
  constructor(ip, port) {
    this._ip = new IpAddress(ip);
    this._port = parsePort(port);
  }

  /**
   * Creates a new instance of a SocketAddress from a string
   * in format ip:port (eg. 192.168.1.1:420)
   * @param {String} str A string in format ip:port
   * @returns {SocketAddress|null} A new instance of a SocketAddress or null if the string is invalid
   */
  static fromString(str) {
    try {
      return new SocketAddress(...str.split(":"));
    } catch (e) {
      return null;
    }
  }

  /**
   * Gets the IP address of the socket
   * @returns {IpAddress} The IP address of the socket
   */
  get ip() {
    return this._ip;
  }

  /**
   * Sets the IP address of the socket
   * @param {String|IpAddress} value The new IP address of the socket
   */
  set ip(value) {
    this._ip = new IpAddress(value);
  }

  /**
   * Gets the port of the socket
   * @returns {Number|String} The port of the socket
   */
  get port() {
    return this._port;
  }

  /**
   * Sets the port of the socket
   * @param {Number|String} value The new port of the socket
   */
  set port(value) {
    this._port = parsePort(value);
  }

  /**
   * Returns a string representation of the socket address
   * @returns {String} A string in format ip:port
   */
  toString() {
    return `${this.ip.toString(false)}:${this.port}`;
  }

  /**
   * Compares this socket address with another socket address
   * @param {SocketAddress} other The socket address to compare with
   * @returns {Boolean} Whether the socket addresses are equal
   */
  compare(other) {
    return this.ip.compare(other.ip) && comparePorts(this.port, other.port);
  }
}
