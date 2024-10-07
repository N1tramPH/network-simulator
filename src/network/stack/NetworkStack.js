import { random } from "lodash-es";
import { PORT_COUNT } from "../../utils/constants.js";
import { Layer as l, TcpState as s } from "../../utils/constants.js";

import ApplicationLayer from "./applicationLayer/ApplicationLayer.js";
import TransportLayer from "./transportLayer/TransportLayer.js";
import IpLayer from "./ipLayer/IpLayer.js";
import LinkLayer from "./linkLayer/LinkLayer.js";
import Socket from "./socket/Socket.js";
import SocketsTable from "./socket/SocketsTable.js";
import SocketAddress from "./socket/SocketAddress.js";
import NetworkAdapter from "./linkLayer/NetworkAdapter.js";
import CAMTable from "./linkLayer/CAMTable.js";

/**
 * A parental object managing all the layers of the network stack
 */
export default class NetworkStack {
  /**
   * Initializes the network stack of a node with required information for each layer
   * @param {Device} device A device whose network stack is to be initialized
   * @param {*} layerType A network layer a device operates on (constant LayerType)
   */
  constructor(device, layerType = 0) {
    this._device = device;
    this.networkAdapters = device.networkAdapters;

    this._linkLayer = null;
    this._ipLayer = null;
    this._transportLayer = null;
    this._applicationLayer = null;

    // Mapping between the layers, layers have no direct access
    // to upper/lower, access is through a network stack
    this.map = null;
    this._setNetworkStack(layerType);

    /**
     * @type {CAMTable}
     */
    this._camTable = null;

    /**
     * @type {SocketsTable}
     */
    this._socketsTable = new SocketsTable(this);
  }

  /**
   * Returns the link layer instance
   */
  get linkLayer() {
    return this._linkLayer;
  }

  /**
   * Returns the ip layer instance
   */
  get ipLayer() {
    return this._ipLayer;
  }

  /**
   * Returns the transport layer instance
   */
  get transportLayer() {
    return this._transportLayer;
  }

  /**
   * Returns the application layer instance
   */
  get applicationLayer() {
    return this._applicationLayer;
  }

  /**
   * Returns the sockets table instance
   */
  get socketsTable() {
    return this._socketsTable;
  }

  /**
   * Returns the routing table instance
   */
  get routingTable() {
    return this.ipLayer.route.routingTable;
  }

  /**
   * Returns the arp table instance
   */
  get arpTable() {
    return this.linkLayer.arp.table;
  }

  /**
   * Returns the cam table instance
   */
  get camTable() {
    return this._camTable;
  }

  /**
   * Returns the icmp instance
   */
  get icmp() {
    if (this.ipLayer) return this.ipLayer.icmp;
    return null;
  }

  /**
   * Sets and creates the links between individual layers and needed attributes of each layer
   */
  _setNetworkStack(layerType) {
    // Layers have access to a net stack instance
    if (layerType >= l.L2) {
      this._linkLayer = new LinkLayer(this);
    }
    if (layerType >= l.L3) {
      this._ipLayer = new IpLayer(this);
    }
    if (layerType >= l.L4) {
      this._transportLayer = new TransportLayer(this);
    }
    if (layerType >= l.L5) {
      this._applicationLayer = new ApplicationLayer(this);
    }

    this.map = new Map([
      [this.linkLayer, { lower: null, upper: this.ipLayer }],
      [this.ipLayer, { lower: this.linkLayer, upper: this.transportLayer }],
      [
        this.transportLayer,
        { lower: this.ipLayer, upper: this.applicationLayer },
      ],
      [this.applicationLayer, { lower: this.transportLayer, upper: null }],
    ]);
  }

  /**
   * Checks if a port is free
   * @param {*} port
   * @returns
   */
  _isPortFree(port) {
    // Check for an existing
    return !this.socketsTable.get(port);
  }

  /**
   * Returns the lower layer of the provided layer
   * @param {*} layer
   */
  lowerLayer(layer) {
    return this.map.get(layer).lower;
  }

  /**
   * Returns the upper layer of the provided layer
   * @param {*} layer
   */
  upperLayer(layer) {
    return this.map.get(layer).upper;
  }

  /**
   * Initializes the CAM table
   */
  initCAM() {
    this._camTable = new CAMTable(this.networkAdapters);
  }

  /**
   * @returns {Device} the device that implements this network stack
   */
  getHost() {
    return this._device;
  }

  /**
   * Returns a random unused port
   */
  getFreePort() {
    let port = random(1024, PORT_COUNT);

    while (!this._isPortFree(port)) {
      port = random(1024, PORT_COUNT);
    }
    return port;
  }

  /**
   * Sends an ICMP ping request to the destination IP address
   * @param {String} dstIpAddress
   */
  ping(dstIpAddress) {
    if (this._device.layerType >= l.L3) {
      return this.icmp.ping(dstIpAddress);
    }
  }

  /**
   * Finds a network adapter by name
   * @param {String} name
   */
  findAdapter(name) {
    return this.networkAdapters.find((a) => a.name === name);
  }

  /**
   * Finds a socket serving a particular client
   * @param {Number} srcPort
   * @param {SocketAddress} remoteAddress
   */
  findSocket(srcPort, remoteAddress) {
    let socket = this.socketsTable.get(srcPort);

    // Remote is defined, try find a child that serves that remote
    if (socket && remoteAddress) {
      if (socket.type === "server") {
        let childSocket = socket.findChild(remoteAddress);

        // No child socket serving this particular client
        if (!childSocket && socket.state === s.LISTEN) {
          childSocket = socket.initChild(remoteAddress);
        }

        return childSocket;
      }
    }

    return socket;
  }

  /**
   * Creates a new instance of a socket without being registered in a network stack.
   * Sockets are initiated with an available port but is still free until the socket is "opened".
   * --Used by the applications in the application layer--
   * @param {String} type Valid values: 'client'/'server'
   * @param {String} ipVersion Valid values: 'IPV4'
   * @param {String} protocol Valid values: 'TCP', 'UDP'
   * @returns {Socket} Creates a new instance of a socket defined
   */
  initSocket(type = "client", ipVersion = "IPV4", protocol = "TCP") {
    const socket = new Socket(ipVersion, protocol, type, this);
    socket.srcPort = this.getFreePort();

    return socket;
  }

  /**
   * Adds an initialized pending socket to open sockets (ready to be used)
   * If an open socket with same local address exists,
   * returns false, else true
   */
  openSocket(socket) {
    if (!socket) throw new Error("No pending socket to be opened.");
    if (this.findSocket(socket.srcPort)) return null;

    this.socketsTable.set(socket);
    return socket;
  }

  /**
   * Removes a socket from the sockets table
   */
  removeSocket(socket) {
    this.socketsTable.remove(socket);
  }
}
