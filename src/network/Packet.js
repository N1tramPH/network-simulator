import { nanoid } from "nanoid";

import PacketExceedError from "../utils/exceptions/PacketExceedError";
import Queue from "../utils/structures/Queue";
import DataUnit from "./stack/DataUnit";
import IpPacket from "./stack/ipLayer/IpPacket";
import TcpSegment from "./stack/transportLayer/tcp/TcpSegment";
import UdpDatagram from "./stack/transportLayer/udp/UdpDatagram";
import LinkFrame from "./stack/linkLayer/LinkFrame";

import SocketAddress from "./stack/socket/SocketAddress";
import IpAddress from "./stack/ipLayer/IpAddress";
import PhysicalPort from "./stack/physicalLayer/PhysicalPort";
import Device from "./devices/Device";

/**
 * A structure defining a reported message along
 * with a time for how long it is to be display
 */
export class Report {
  constructor(msg, duration = 0.7) {
    this.msg = msg;
    this.duration = duration;
  }
}

/**
 * Flattens a packet structure in depth-first order.
 *
 * @param {Packet} packet - The packet to flatten.
 * @return {Packet[]} An array of flattened packets.
 */
export function flattenDepth(packet) {
  const flattened = [];

  const internal = (packet) => {
    // Flatten preceding packets
    packet.preceding.forEach((pred) => internal(pred));

    // Add current packet to flattened array
    flattened.push(packet);

    // Flatten children packets
    packet.children.forEach((c) => internal(c));
  };

  // Start flattening from the given packet
  internal(packet);

  // Return the flattened array
  return flattened;
}

/**
 * Flattens a packet structure in breadth-first order.
 *
 * @param {Packet} packet - The packet to flatten.
 * @return {Packet[]} An array of flattened packets.
 */
function flattenBreadth(packet) {
  // Result array
  const flattened = [];

  // Queue for BFS
  const q = new Queue();

  // Enqueue the starting packet
  q.enqueue(packet);

  // Loop until queue is empty
  while (!q.isEmpty()) {
    // Dequeue a packet from the front of the queue
    packet = q.dequeue();

    // Flatten preceding packets
    packet.preceding.forEach((pred) => {
      // Recursively flatten each preceding packet
      flattenBreadth(pred)
        // Append each flattened packet to the result array
        .forEach((flatPred) => flattened.push(flatPred));
    });

    // Enqueue children packets to the back of the queue
    packet.children.forEach((child) => q.enqueue(child));

    // Add current packet to the result array
    flattened.push(packet);
  }

  // Return the flattened array
  return flattened;
}

/**
 * A data structure storing every information about data
 * transmission between TWO NODES including all the events starting
 * from packet creation, processing, transmission
 */
export default class Packet {
  constructor(data, title = "", subtitle = "") {
    // Uniquely identifies each packet used for animation
    this.id = `p-${nanoid(11)}`;

    // Wrapped DataUnits from individual TCP layers
    // this.data = data;

    // Pairs of DataUnit.type:Dataunit.instance
    this.data = data;

    this.title = title;
    this.subtitle = subtitle;

    this.order = 0;
    this.childCount = 0;

    // A root packet inducing a cascade of child packets important
    // for correct structuring of a timeline - children have a
    // label of `${this.root.id}-${this.order}`
    this.root = null;
    this.parent = null; // Redundant
    this.children = [];
    this.preceding = [];
    this.committed = false;

    this.success = false;

    // The two nodes a packet is transmitted between
    this._startPoint = null;
    this._endPoint = null;

    // A source socket
    this.socket = null;
    this.route = null;

    this.outIface = null;
    this.inIface = null;

    // Events should be stored chronologically so they can be animated correctly
    this.transmitted = false;
    this.eventsBefore = [];
    this.eventsAfter = [];

    // Events that will take place on a startDevice when whole transmission ends
    this.endEvents = [];
  }

  get startPoint() {
    return this._startPoint;
  }

  set startPoint(value) {
    if (!(value instanceof Device)) {
      throw new Error("A Packet's endpoint must be an instance of Device!");
    }

    this._startPoint = value;
  }

  get endPoint() {
    return this._endPoint;
  }

  set endPoint(value) {
    if (!(value instanceof Device)) {
      throw new Error("A Packet's endpoint must be an instance of Device!");
    }

    this._endPoint = value;
  }

  /**
   * Returns a timeline label consisting of root.id + this.order
   */
  get label() {
    return `${this.root ? this.root.id : this.id}-${this.order}`;
  }

  get isRoot() {
    return !this.root; // A root has no root
  }

  /**
   * Returns a depth of a packet sequence
   * To BE OPTIMIZED
   */
  get depth() {
    const packets = this.flatten();
    let max = 0;

    packets.forEach((packet) => {
      if (packet.order > max) max = packet.order;
    });

    return max;
  }

  get dstMacAddress() {
    const frame = this.getUnit(LinkFrame);
    return frame ? frame.dstMacAddress : null;
  }

  get srcMacAddress() {
    const frame = this.getUnit(LinkFrame);
    return frame ? frame.srcMacAddress : null;
  }

  get dstIpAddress() {
    if (this._dstIpAddress) return this._dstIpAddress;

    const ipPacket = this.getUnit(IpPacket);
    return ipPacket ? ipPacket.dstIpAddress : null;
  }

  set dstIpAddress(ipAddress) {
    this._dstIpAddress = new IpAddress(ipAddress);
  }

  get srcIpAddress() {
    if (this._srcIpAddress) return this._srcIpAddress;

    const ipPacket = this.getUnit(IpPacket);
    return ipPacket ? ipPacket.srcIpAddress : null;
  }

  set srcIpAddress(ipAddress) {
    this._srcIpAddress = new IpAddress(ipAddress);
  }

  get dstPort() {
    const datagram = this.getUnit(TcpSegment, UdpDatagram);
    return datagram.dstPort.decimal;
  }

  get srcPort() {
    const datagram = this.getUnit(TcpSegment, UdpDatagram);
    return datagram.srcPort.decimal;
  }

  get remoteAddress() {
    return new SocketAddress(this.dstIpAddress, this.dstPort);
  }

  get localAddress() {
    return new SocketAddress(this.srcIpAddress, this.srcPort);
  }

  /**
   * @param {} event A special event identifier
   */
  addEvent(event, endEvent = false) {
    if (endEvent) {
      this.endEvents.push(event);
    } else {
      this.transmitted
        ? this.eventsAfter.push(event)
        : this.eventsBefore.push(event);
    }
  }

  /**
   * Adds an informative message reporting an event.
   * This message is added as a Report instance to
   * eventsBefore or eventsAfter according to transmitted value.
   * @param {String} msg A reported message
   * @param {Number} duration A duration in seconds for which a message is displayed
   */
  report(msg, duration, endEvent = false) {
    this.addEvent(new Report(msg, duration), endEvent);
  }

  /**
   * Finds a returns a first of the passed in DataUnit types
   * @param  {...DataUnit} types
   * @returns
   */
  getUnit(...types) {
    let unit = this.data;

    while (unit) {
      for (const type of types) {
        if (unit instanceof type) {
          return unit;
        }
      }
      unit = unit.data;
    }

    return null;
  }

  /**
   * Returns an iterator over the DataUnit headers
   */
  *getUnits() {
    let unit = this.data;
    while (unit instanceof DataUnit) {
      yield unit;
      unit = unit.data;
    }
  }

  /**
   * Creates a a shallow copy of Packet
   * with only few necessary properties for
   * broadcasting
   * @param {Boolean} commit Should a copy be committed
   * @returns
   */
  copy() {
    const copy = new Packet(this.data, this.title, this.subtitle);
    copy.socket = this.socket;
    copy.outIface = this.outIface;
    copy.root = this.root ? this.root : this;
    copy.parent = this;
    copy.order = this.order + 1;

    // this.commit();

    return copy;
  }

  /**
   * Creates a response packet to a current one.
   * Contains necessary information such as the parent, root, order
   * But is invalid until it is committed (pushed to packetstore, linked with parent), thus uncomitted
   * @param {*} data
   * @param {String} title
   * @param {String} subtitle
   * @returns
   */
  createChild(data, title = "", subtitle = "") {
    const child = new Packet(data, title, subtitle);
    child.root = this.root ? this.root : this;
    child.parent = this;
    child.order = this.order + 1;

    return child;
  }

  /**
   * Sets a preceding packet created with createPreceding.
   * Updates the order of this packet to follow immediately after the preceding
   * Also adds this packets to they this.preceding array
   * @param {Packet} packet A preceding root Packet
   */
  setPreceding(packet) {
    this.order = packet.depth + 1;
    this.preceding.push(packet);
  }

  /**
   * Creates a preceding packet that is to take place before this
   * @param {*} data
   * @param {String} title
   * @param {String} subtitle
   * @returns
   */
  createPreceding(data, title, subtitle) {
    const pred = new Packet(data, title, subtitle);
    pred.root = this.root ? this.root : this;
    pred.order = this.order;

    return pred;
  }

  /**
   * Creates a response packet to a current one.
   * Contains necessary information such as the parent, root, order
   * But is invalid until it is committed (pushed to packetstore, linked with parent), thus not committed
   * @param {*} data
   * @param {String} title
   * @param {String} subtitle
   * @returns
   */
  response(data, title, subtitle) {
    const response = this.createChild(data, title, subtitle);
    return response;
  }

  /**
   * Creates a link with a parent packet and gets added to the packetStore
   * Making a packet valid in the chain of packets.
   */
  commit() {
    if (this.committed) return this;

    this.parent ? this.parent.children.push(this) : 1;
    this.committed = true;

    if (this.root) {
      this.root.childCount++;

      if (this.root.childCount > 1200) {
        throw new PacketExceedError();
      }
    }

    return this;
  }

  /**
   * From a PhysicalPort determines and sets the startPoint and endPoint devices
   * @param {PhysicalPort} port
   */
  setEndPoints(port) {
    this.startPoint = port.adapter.mountOn;
    this.endPoint = port.otherPort.adapter.mountOn;
  }

  /**
   * @returns An array of all related packets (inclusive)
   */
  flatten(breadth = true) {
    return breadth ? flattenBreadth(this) : flattenDepth(this);
  }
}
