import { comparePorts, parsePort } from "../../../utils/utils";
import IpAddress from "../ipLayer/IpAddress";

export default class SocketAddress {
  constructor(ip, port) {
    this._ip = new IpAddress(ip);
    this._port = parsePort(port);
  }

  /**
   * Creates a new instance of a SocketAddress from a string
   * in format ip:port (eg. 192.168.1.1:420)
   * @param {String} str
   */
  static fromString(str) {
    try {
      return new SocketAddress(...str.split(":"));
    } catch (e) {
      return null;
    }
  }

  get ip() {
    return this._ip;
  }

  set ip(value) {
    this._ip = new IpAddress(value);
  }

  get port() {
    return this._port;
  }

  set port(value) {
    this._port = parsePort(value);
  }

  toString() {
    return `${this.ip.toString(false)}:${this.port}`;
  }

  compare(other) {
    return this.ip.compare(other.ip) && comparePorts(this.port, other.port);
  }
}
