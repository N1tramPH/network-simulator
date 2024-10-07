import { random, floor } from "lodash-es";
import { nanoid } from "nanoid";

import { useTransmitStore } from "../../../stores/TransmitStore";
import {
  TcpState as s,
  PacketEvent as e,
  TcpFlags as f,
  IpVersion as ip,
  TransportProtocol as tp,
} from "../../../utils/constants";

import Data from "../applicationLayer/Data";
import Packet from "../../Packet";
import SocketAddress from "./SocketAddress";
import NetworkStack from "../NetworkStack";
import IpAddress from "../ipLayer/IpAddress";
import TransportLayer from "../transportLayer/TransportLayer";

/**
 * Represents a network socket, facilitating communication endpoints.
 */
export default class Socket {
  /**
   * Instantiates a new network Socket.
   * @param {String} ipVersion IP version - "IPV4"
   * @param {String} protocol Transport protocol - "TCP/UDP"
   * @param {String} type Distinguishing "server"/"client" socket
   * @param {NetworkStack} networkStack Parent pointer - network stack
   */
  constructor(
    ipVersion = ip.IPV4,
    protocol = tp.TCP,
    type = "client",
    networkStack = null
  ) {
    // Set ipVersion and protocol
    this.ipVersion = ip[ipVersion] ? ipVersion : ip.IPV4;
    this.protocol = ip[protocol] ? protocol : tp.TCP;
    this.type = type;

    /**
     * Parent network stack.
     * @type {NetworkStack}
     */
    this.networkStack = networkStack;

    /**
     * Transport layer instance.
     * @type {TransportLayer}
     */
    this.transportLayer = networkStack.transportLayer;

    // Valid states are specified in states variable
    this._state = s.CLOSED;
    this.isBound = false;

    /**
     * Local address of the socket.
     * @type {SocketAddress}
     */
    this.localAddress = new SocketAddress("0.0.0.0/0", "*");

    /**
     * Remote address of the socket.
     * @type {SocketAddress}
     */
    this.remoteAddress = new SocketAddress("0.0.0.0/0", "*");

    // Abstract application data
    /**
     * Buffer for sending data.
     * @type {Data}
     */
    this.sendBuffer = new Data(floor(3000, -2));

    /**
     * Buffer for receiving data.
     * @type {Data}
     */
    this.receiveBuffer = new Data(floor(3000, -2));

    /**
     * Mapping of sent, received data in seqNum:bytes.
     * @type {Map}
     */
    this.receiveMap = new Map();

    /**
     * @type {Map}
     */
    this.sendMap = new Map();

    this.seqNum = floor(random(1000, 5000), -2); // Initial Sequence Number
    this.ackNum = null;

    /**
     * Parent socket.
     * @type {Socket}
     */
    this.parent = null;

    /**
     * Child sockets.
     * @type {Socket[]}
     */
    this.children = [];

    // To simplify functionalities outside of socket
    this.id = nanoid(5);
    this.otherId = null; // temporary bonding with other socket, actually indicates some kind of communication took place
  }

  /**
   * Imports a socket from exported data.
   * @param {*} data Exported data (produced by ExportData())
   * @param {NetworkStack} networkStack A network stack associated with a socket
   * @returns An imported instance of a socket
   */
  static fromExport(data, networkStack) {
    try {
      if (!data) return;
      const socket = new Socket(
        data.ipVersion,
        data.protocol,
        data.type,
        networkStack
      );

      socket.state = data.state;
      socket.localAddress = SocketAddress.fromString(data.localAddress);
      socket.remoteAddress = SocketAddress.fromString(data.remoteAddress);
      socket.seqNum = data.seqNum;
      socket.ackNum = data.ackNum;
      socket.id = data.id;
      socket.otherId = data.otherId;
      socket.children = data.children.map((c) => {
        const child = Socket.fromExport(c, networkStack);
        child.parent = socket;
        return child;
      });
      useTransmitStore().registerSocket(socket);
      return socket;
    } catch (e) {
      throw Error("Unexpected error on importing sockets.", e);
    }
  }

  /**
   * Getter for state.
   * @returns {String} State of the socket.
   */
  get state() {
    return this._state;
  }

  /**
   * Setter for state.
   * @param {String} value State of the socket.
   */
  set state(value) {
    this.setState(value);
  }

  /**
   * Getter for destination ip address.
   * @returns {string|IpAddress} Destination IP address.
   */
  get dstIpAddress() {
    return this.remoteAddress.ip;
  }

  /**
   * Setter for destination ip address.
   * @param {string|IpAddress} value Destination ip address.
   */
  set dstIpAddress(value) {
    this.remoteAddress.ip = value;
  }

  /**
   * Getter for source ip address.
   * @returns {string|IpAddress} Source ip address.
   */
  get srcIpAddress() {
    return this.localAddress.ip;
  }

  /**
   * Setter for source ip address.
   * @param {string|IpAddress} value Source ip address.
   */
  set srcIpAddress(value) {
    this.localAddress.ip = value;
  }

  /**
   * Getter for destination port.
   * @returns {Number|string} Destination port.
   */
  get dstPort() {
    return this.remoteAddress.port;
  }

  /**
   * Setter for destination port.
   * @param {Number|string} value Destination port.
   */
  set dstPort(value) {
    this.remoteAddress.port = value;
  }

  /**
   * Getter for source port.
   * @returns {Number|string} Source port.
   */
  get srcPort() {
    return this.localAddress.port;
  }

  /**
   * Setter for source port.
   * @param {Number|string} value Source port.
   */
  set srcPort(value) {
    this.localAddress.port = value;
  }

  /**
   * Getter for source host.
   * @returns {Device} Source host.
   */
  get device() {
    return this.networkStack ? this.networkStack.getHost() : null;
  }

  /**
   * Moves Packet to the transport layer.
   * @param {Packet} packet Packet to be sent.
   */
  _transport(packet) {
    this.transportLayer.acceptFromUpper(packet);
  }

  /**
   * Checks if ackNum matches expectedAck.
   * @param {Number} ackNum
   * @returns {Boolean}
   */
  _isAckExpected(ackNum) {
    return ackNum === this.socket.expectedAck;
  }

  /**
   * Getter for source host.
   * @returns {Device} Source host.
   */
  _getHost() {
    return this.networkStack.getHost();
  }

  /**
   * Creates a transmitted Packet with linked to this socket and device
   * @param {*} data
   * @returns
   */
  _initPacket(data) {
    const packet = new Packet(data);
    packet.socket = this;
    packet.startPoint = this._getHost();

    return packet;
  }

  _lastSeqNum() {}

  toString() {
    return `${this.protocol}/${this.localAddress}-${this.remoteAddress}`;
  }

  /**
   * Sets a socket's state.
   * If a Packet is provided, sets its tcpStateChange event
   * and the before/after states for report animations
   * @param {TcpState} state
   * @param {Packet} packet
   */
  setState(state, packet) {
    const stateBefore = this.state;

    if (!Object.values(s).includes(state)) throw new Error("Invalid state!");
    this._state = state;

    if (packet) {
      packet.stateBefore = stateBefore;
      packet.stateAfter = state;
      packet.addEvent(e.tcpStateChange);
    }
  }

  /**
   * An interface for a transport layer to retrieve application layer data.
   * In case of a TCP socket, seqNum in increased by the popped data size
   * and also seqNum:data_size is mapped in sendMap in case of resend.
   * @returns
   */
  getData(seqNum = null) {
    if (seqNum) return this.sendMap.get(seqNum); // When a certain seq is needed to be resent

    const chunk = this.sendBuffer.pop(floor(random(100, 2000), -2));

    if (chunk && this.protocol === "TCP") {
      const record = { seqNum: this.seqNum, data: chunk };
      this.sendMap.set(this.seqNum, record);
      // this.seqNum += chunk;

      return record;
    }

    return 0;
  }

  hasData() {
    return this.sendBuffer.size;
  }

  /**
   * This method only serves to set up the logical
   * link between the two communicating devices. It only serves
   * for visualization, UX purposes, not the real functionality of a socket.
   * @param {Socket} socket
   */
  setOther(other) {
    this.otherId = other.id;
    other.otherId = this.id;
  }

  /**
   * Moves self to an opened sockets
   */
  open() {
    useTransmitStore().registerSocket(this);
    this.networkStack.openSocket(this);
    this.bind();
  }

  /**
   * Binds a local IP address and port of a socket
   * @param {IpAddress} srcIpAddress IP address of a server
   * @param {Number|string} srcPort A port number a socket is listening on
   */
  bind(srcIpAddress = null, srcPort = null) {
    console.log(this.isBound);
    if (this.isBound) return;

    if (srcIpAddress) this.srcIpAddress = srcIpAddress;
    if (srcPort) this.srcPort = srcPort;
    this.isBound = true;

    if (this.type === "server") this.setState(s.LISTEN);
  }

  /**
   * Configures a socket into a LISTEN state
   * Used for a server socket with bound local address
   */
  listen() {
    this.state = s.LISTEN;
  }

  initChild(remoteAddress) {
    if (!remoteAddress) throw new Error("Invalid remote address!");

    const childSocket = this.networkStack.initSocket("server");
    childSocket.parent = this;
    childSocket.listen();

    childSocket.localAddress = this.localAddress; // Local IP is same as parent's,
    childSocket.remoteAddress = remoteAddress; // Bind the remote address as well

    // Move the child to pending
    this.children.push(childSocket);

    return childSocket;
  }

  /**
   * Searches for a child socket based on a remote address.
   * @param {*} remoteAddress
   * @returns A child socket with a given remoteAddress
   */
  findChild(remoteAddress) {
    return this.children.find((s) => s.remoteAddress.compare(remoteAddress));
  }

  // /**
  //  * Sets the state to ESTABLISHED
  //  * @param {*} dstIpAddress Client's IP address
  //  * @param {*} dstPort Client's port address
  //  */
  // accept() {
  //   // this.setState(s.ESTABLISHED, packet);
  //   return this;
  // }

  /**
   * Establishes a connection with a server
   * specicified by an IP address and port
   * @param {*} dstIpAddress Server's IP address
   * @param {*} dstPort Server's port
   */
  connect(remoteAddress) {
    if (this.state === s.ESTABLISHED) {
      throw new Error("A connection's already been established!");
    } else if (this.state === s.TIME_WAIT) {
      throw new Error(
        "Cannot initiate a TCP connection during TIME-WAIT period!"
      );
    }

    // Ensure that client socket is open and bound before
    this.open();

    const packet = this._initPacket();
    packet.flags = [f.SYN];
    packet.report("Initiating\n 3-phase handshake...");

    this.remoteAddress = remoteAddress;
    this.setState(s.SYN_SENT, packet);
    this._transport(packet);

    // Check if connection was successful
    packet.success = this.state === s.ESTABLISHED;

    // Root packet used for storing info about communication
    return packet;
  }

  close() {
    // The some variant of a connection can still be on these client states
    if (![s.ESTABLISHED, s.FIN_WAIT_1, s.FIN_WAIT_2].includes(this.state))
      throw new Error("No connection to be closed.");

    const packet = this._initPacket();
    packet.flags = [f.FIN];
    packet.report("Closing\nTCP connection...");

    // Prevent from incrementing seqNum if there already was an attempt for closing
    if (this.state !== s.FIN_WAIT_1 && this.state !== s.FIN_WAIT_2) {
      this.seqNum++;
      this.setState(s.FIN_WAIT_1);
    }

    this._transport(packet);
    return packet;
  }

  /******* TCP methods *******/

  /**
   * Accepts application data from a transport layer
   * @param {Number} data
   */
  receive(data, seqNum) {
    if (!data) return;

    this.receiveBuffer.push(data);
    this.receiveMap.set(seqNum, data);
  }

  /**
   * Facilitates sending data for TCP protocol.
   * Also used for responding to a other messages
   * @param {Number} payLoad
   */
  send(data = null) {
    if (this.protocol === "UDP")
      throw new Error("UDP protocol must use recvfrom/sendto methods!");
    if (this.state !== s.ESTABLISHED)
      throw new Error("A connection must be established first!");

    const payload = this.sendBuffer.set(data);
    if (!payload) throw new Error("There's no data to be sent!");

    const packet = this._initPacket(payload);
    packet.startPoint = this.packet.socket = this;

    this._transport(packet);
    return packet;
  }

  /******* UDP methods *******/
  receiveFrom(packet) {
    if (this.state === "CLOSED") throw new Error(`${this} is closed!`);

    this.receiveBuffer.push(packet.data);
  }

  /**
   * Sends data to a remote address using the transport layer.
   * @param {Data} - The data to be sent.
   * @param {SocketAddress|null} - The remote address to send the data to.
   * @return {Packet} The packet that was sent.
   */
  sendTo(data = new Data(), remoteAddress = null) {
    // Passing required data to transport layer
    this.remoteAddress = remoteAddress;
    this.sendBuffer = data;

    const payLoad = this.getData();
    const packet = this._initPacket(payLoad);
    packet.socket = this;

    this._transport(packet);
    return packet;
  }

  /**
   * Cannot directly remove from memory so at least pretend :)
   */
  destroy() {
    // --> Set to "initial" values
    this.setState(s.CLOSED);
    this.isBound = false;
    this.otherId = null;

    // Abstract application data,
    this.sendBuffer = new Data(floor(3000, -2));
    this.receiveBuffer = new Data(floor(3000, -2));

    // Mapping of sent, received data in seqNum:bytes
    this.receiveMap = new Map();
    this.sendMap = new Map();

    this.seqNum = floor(random(1000, 5000), -2); // ISN
    this.ackNum = null;

    // Unlink references
    useTransmitStore().unregisterSocket(this);

    // If a socket is a child, remove it from a parent, otherwise remove parent from a network stack
    if (this.parent) {
      this.parent.children = this.parent.children.filter(
        (c) => c.id !== this.id
      );
    } else {
      this.networkStack.removeSocket(this);
    }
  }

  exportData() {
    const exportData = {
      ipVersion: this.ipVersion,
      protocol: this.protocol,
      type: this.type,
      state: this.state,
      localAddress: this.localAddress.toString(),
      remoteAddress: this.remoteAddress.toString(),

      seqNum: this.seqNum,
      ackNum: this.ackNum,

      children: [],
      id: this.id,
      otherId: this.otherId,
    };

    this.children.forEach((c) => exportData.children.push(c.exportData()));
    return exportData;
  }
}
